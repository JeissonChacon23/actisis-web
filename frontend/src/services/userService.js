import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { logAction } from "./auditService";
import { sanitizeInput } from "../helpers/validators";

/**
 * Obtiene el listado completo de usuarios/docentes (RF001.3)
 */
export async function getDocentes() {
  try {
    const q = query(collection(db, "users"), orderBy("nombre", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

/**
 * Actualiza los datos y rol de un docente (RF001.4, RF001.6)
 */
export async function updateUser(userId, data, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo el administrador puede editar datos de docentes.");
  }
  const payload = {
    nombre: sanitizeInput(data.nombre),
    apellido: sanitizeInput(data.apellido),
    codigo: sanitizeInput(data.codigo),
    documento: sanitizeInput(data.documento),
    correo: (data.correo || "").trim(),
    telefono: sanitizeInput(data.telefono || ""),
    tipo: data.tipo || "Planta",
    rol: data.rol || "docente",
    updatedAt: serverTimestamp(),
  };
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, payload);
  await logAction(
    "editar",
    "usuario",
    userId,
    `Docente actualizado: ${payload.nombre} ${payload.apellido} (${payload.rol})`,
    adminUser
  );
}

/**
 * Activa o inactiva la cuenta de un docente (RF001.5)
 */
export async function toggleUserStatus(userId, nuevoEstado, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo el administrador puede cambiar el estado de un usuario.");
  }
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { estado: nuevoEstado, updatedAt: serverTimestamp() });
  await logAction(
    "estado_usuario",
    "usuario",
    userId,
    `Estado cambiado a ${nuevoEstado}`,
    adminUser
  );
}

/**
 * Genera un enlace único de registro temporal por 24 horas (RF001.1 / RB-01)
 */
export async function generateInvitationLink({ correo, nombre }, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo el administrador puede generar enlaces de invitación.");
  }
  const token = Array.from(crypto.getRandomValues(new Uint8Array(20)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await setDoc(doc(db, "invitations", token), {
    token,
    correo: correo.trim().toLowerCase(),
    nombreSugerido: sanitizeInput(nombre || ""),
    usado: false,
    expiresAt,
    createdBy: adminUser.uid,
    createdAt: serverTimestamp(),
  });

  await logAction(
    "invitar",
    "usuario",
    token,
    `Enlace único de registro generado para ${correo}`,
    adminUser
  );

  const link = `${window.location.origin}/registro/${token}`;
  return { token, link, expiresAt };
}

/**
 * Valida un token de invitación (RF001.2 / RB-01)
 */
export async function validateInvitationToken(token) {
  const invDoc = await getDoc(doc(db, "invitations", token));
  if (!invDoc.exists()) {
    throw new Error("El enlace de invitación no existe o no es válido.");
  }
  const data = invDoc.data();
  if (data.usado) {
    throw new Error("Este enlace de registro ya fue utilizado (uso único).");
  }
  if (new Date(data.expiresAt) < new Date()) {
    throw new Error("El enlace de registro ha expirado (vigencia máxima de 24 horas).");
  }
  return data;
}

/**
 * Completa el registro de un docente mediante su enlace único (RF001.2)
 */
export async function completeInvitationRegistration(token, formData) {
  const inv = await validateInvitationToken(token);
  const email = (formData.correo || inv.correo).trim().toLowerCase();

  // Crear usuario en Firebase Authentication
  const cred = await createUserWithEmailAndPassword(auth, email, formData.password);
  const uid = cred.user.uid;

  const userProfile = {
    uid,
    nombre: sanitizeInput(formData.nombre),
    apellido: sanitizeInput(formData.apellido),
    documento: sanitizeInput(formData.documento),
    codigo: sanitizeInput(formData.codigo),
    correo: email,
    email,
    telefono: sanitizeInput(formData.telefono || ""),
    tipo: formData.tipo || "Planta",
    rol: "docente",
    estado: "activo",
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", uid), userProfile);
  await updateDoc(doc(db, "invitations", token), {
    usado: true,
    usedByUid: uid,
    usedAt: serverTimestamp(),
  });

  await logAction(
    "registro_invitacion",
    "usuario",
    uid,
    `Docente completó su registro: ${userProfile.nombre} ${userProfile.apellido}`,
    userProfile
  );

  return userProfile;
}
