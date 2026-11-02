import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { logAction } from "./auditService";
import { sanitizeInput, validateNumericOnly } from "../helpers/validators";

export async function getSpeakers() {
  try {
    const q = query(collection(db, "speakers"), orderBy("nombre", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, "speakers"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

export async function createSpeaker(data, user) {
  validateNumericOnly(data.identificacion, "Identificación");
  validateNumericOnly(data.telefono, "Teléfono");

  const payload = {
    nombre: sanitizeInput(data.nombre),
    identificacion: sanitizeInput(data.identificacion || ""),
    telefono: sanitizeInput(data.telefono || ""),
    correo: (data.correo || "").trim(),
    institucion: sanitizeInput(data.institucion || ""),
    especialidad: sanitizeInput(data.especialidad || ""),
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, "speakers"), payload);
  await logAction("crear", "conferencista", docRef.id, `Conferencista registrado: ${payload.nombre}`, user);
  return { id: docRef.id, ...payload };
}

export async function updateSpeaker(id, data, user) {
  validateNumericOnly(data.identificacion, "Identificación");
  validateNumericOnly(data.telefono, "Teléfono");

  const payload = {
    nombre: sanitizeInput(data.nombre),
    identificacion: sanitizeInput(data.identificacion || ""),
    telefono: sanitizeInput(data.telefono || ""),
    correo: (data.correo || "").trim(),
    institucion: sanitizeInput(data.institucion || ""),
    especialidad: sanitizeInput(data.especialidad || ""),
    updatedAt: serverTimestamp(),
  };
  await updateDoc(doc(db, "speakers", id), payload);
  await logAction("editar", "conferencista", id, `Conferencista editado: ${payload.nombre}`, user);
  return { id, ...payload };
}

export async function deleteSpeaker(id, nombre, user) {
  if (user?.rol !== "admin") {
    throw new Error("Solo el administrador puede eliminar participantes externos.");
  }
  await deleteDoc(doc(db, "speakers", id));
  await logAction("eliminar", "conferencista", id, `Conferencista eliminado: ${nombre}`, user);
}
