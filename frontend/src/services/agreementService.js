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
import { sanitizeInput } from "../helpers/validators";

export async function getAgreements() {
  try {
    const q = query(collection(db, "agreements"), orderBy("fecha", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, "agreements"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

export async function createAgreement(data, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo el administrador puede registrar convenios.");
  }
  const payload = {
    numero: sanitizeInput(data.numero),
    empresa: sanitizeInput(data.empresa),
    razon: sanitizeInput(data.razon || ""),
    fecha: data.fecha || "",
    descripcion: sanitizeInput(data.descripcion || ""),
    driveLink: (data.driveLink || data.evidencia || "").trim(),
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, "agreements"), payload);
  await logAction("crear", "convenio", docRef.id, `Convenio ${payload.numero} - ${payload.empresa}`, adminUser);
  return { id: docRef.id, ...payload };
}

export async function updateAgreement(id, data, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo el administrador puede editar convenios.");
  }
  const payload = {
    numero: sanitizeInput(data.numero),
    empresa: sanitizeInput(data.empresa),
    razon: sanitizeInput(data.razon || ""),
    fecha: data.fecha || "",
    descripcion: sanitizeInput(data.descripcion || ""),
    driveLink: (data.driveLink || data.evidencia || "").trim(),
    updatedAt: serverTimestamp(),
  };
  await updateDoc(doc(db, "agreements", id), payload);
  await logAction("editar", "convenio", id, `Convenio editado: ${payload.numero} - ${payload.empresa}`, adminUser);
  return { id, ...payload };
}

export async function deleteAgreement(id, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo el administrador puede eliminar convenios.");
  }
  await deleteDoc(doc(db, "agreements", id));
  await logAction("eliminar", "convenio", id, "Convenio eliminado", adminUser);
}
