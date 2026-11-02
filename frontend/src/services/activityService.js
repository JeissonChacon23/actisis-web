import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { validateDateInSemester, sanitizeInput, isValidDriveUrl } from "../helpers/validators";
import { logAction } from "./auditService";

const COLLECTION_NAME = "activities";

/**
 * Obtiene actividades públicas aprobadas para la vista pública (RF008)
 */
export async function getPublicActivities() {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("publica", "==", true),
    where("estado", "==", "aprobada"),
    orderBy("fechaInicio", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Obtiene actividades para usuario autenticado (Admin ve todas, Docente ve las suyas)
 */
export async function getActivities(user) {
  const activitiesRef = collection(db, COLLECTION_NAME);
  let q;

  if (user?.rol === "admin") {
    q = query(activitiesRef, orderBy("fechaInicio", "desc"));
  } else {
    q = query(
      activitiesRef,
      where("docenteId", "==", user.uid),
      orderBy("fechaInicio", "desc")
    );
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Registra una nueva actividad (RF003)
 */
export async function createActivity(data, user) {
  // 1. Validación de fechas vs semestre (Corrección N18)
  const validation = validateDateInSemester(data.fechaInicio, data.semestre);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. Validación de enlace de Google Drive (AD-CCA-07_03)
  if (data.driveFolderLink && !isValidDriveUrl(data.driveFolderLink)) {
    throw new Error("El enlace de evidencias debe ser una URL válida de Google Drive.");
  }

  const isAdmin = user?.rol === "admin";
  const sanitizedNombre = sanitizeInput(data.nombre);
  const sanitizedTematica = sanitizeInput(data.tematica);
  const sanitizedDescripcion = sanitizeInput(data.descripcion);
  const sanitizedLugar = sanitizeInput(data.lugar);

  const newActivity = {
    nombre: sanitizedNombre,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin || data.fechaInicio,
    horario: data.horario || "",
    tipo: data.tipo,
    semestre: data.semestre,
    tematica: sanitizedTematica || "",
    descripcion: sanitizedDescripcion || "",
    lugar: sanitizedLugar || "",
    conferencistaId: data.conferencistaId || null,
    conferencistaNombre: data.conferencistaNombre || "",
    convenioId: data.convenioId || null,
    convenioNumero: data.convenioNumero || "",
    docenteId: isAdmin ? (data.docenteId || user.uid) : user.uid,
    docenteNombre: isAdmin
      ? (data.docenteNombre || `${user.nombre || ""} ${user.apellido || ""}`.trim())
      : `${user.nombre || ""} ${user.apellido || ""}`.trim(),
    docenteCodigo: user.codigo || "",
    movilidad: data.movilidad || "N/A",
    driveFolderLink: (data.driveFolderLink || "").trim(),
    // Regla de aprobación: Admin crea 'aprobada', Docente crea 'pendiente'
    estado: isAdmin ? (data.estado || "aprobada") : "pendiente",
    publica: isAdmin ? (data.publica !== undefined ? data.publica : true) : false,
    motivoRechazo: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), newActivity);

  await logAction(
    "crear",
    "actividad",
    docRef.id,
    `Actividad creada: ${newActivity.nombre} [${newActivity.estado}]`,
    user
  );

  return { id: docRef.id, ...newActivity };
}

/**
 * Actualiza una actividad existente.
 * IMPLEMENTA LA REGLA AC08:
 * Si un docente edita una actividad aprobada, regresa automáticamente a 'pendiente'.
 */
export async function updateActivity(id, data, user) {
  const docRef = doc(db, COLLECTION_NAME, id);
  const currentSnap = await getDoc(docRef);

  if (!currentSnap.exists()) {
    throw new Error("Actividad no encontrada.");
  }

  const current = currentSnap.data();
  const isAdmin = user?.rol === "admin";

  // Verificar permisos
  if (!isAdmin && current.docenteId !== user.uid) {
    throw new Error("No tiene permisos para modificar esta actividad.");
  }

  // Validación N18
  const sem = data.semestre || current.semestre;
  const fIni = data.fechaInicio || current.fechaInicio;
  const validation = validateDateInSemester(fIni, sem);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const updatePayload = {
    ...data,
    nombre: sanitizeInput(data.nombre ?? current.nombre),
    tematica: sanitizeInput(data.tematica ?? current.tematica),
    descripcion: sanitizeInput(data.descripcion ?? current.descripcion),
    lugar: sanitizeInput(data.lugar ?? current.lugar),
    driveFolderLink: (data.driveFolderLink ?? current.driveFolderLink ?? "").trim(),
    updatedAt: serverTimestamp(),
  };

  // Regla de negocio AC08
  if (!isAdmin) {
    // El docente no puede forzar aprobación ni estado
    if (current.estado === "aprobada") {
      updatePayload.estado = "pendiente";
      updatePayload.publica = false;
    } else {
      updatePayload.estado = "pendiente";
    }
  }

  await updateDoc(docRef, updatePayload);

  await logAction(
    "editar",
    "actividad",
    id,
    `Actividad actualizada: ${updatePayload.nombre}. Estado resultante: ${updatePayload.estado || current.estado}`,
    user
  );

  return { id, ...current, ...updatePayload };
}

/**
 * Aprueba una actividad (Solo Admin)
 */
export async function approveActivity(id, adminUser, publica = true) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo los administradores pueden aprobar actividades.");
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    estado: "aprobada",
    publica,
    motivoRechazo: null,
    updatedAt: serverTimestamp(),
  });

  await logAction("aprobar", "actividad", id, "Actividad aprobada", adminUser);
}

/**
 * Rechaza una actividad (Solo Admin)
 */
export async function rejectActivity(id, motivo, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo los administradores pueden rechazar actividades.");
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    estado: "rechazada",
    publica: false,
    motivoRechazo: motivo || "No cumple con los criterios requeridos.",
    updatedAt: serverTimestamp(),
  });

  await logAction("rechazar", "actividad", id, `Actividad rechazada: ${motivo}`, adminUser);
}

/**
 * Elimina una actividad (Solo Admin)
 */
export async function deleteActivity(id, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo los administradores pueden eliminar actividades.");
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);

  await logAction("eliminar", "actividad", id, "Actividad eliminada", adminUser);
}
