import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import { logAction } from "./auditService";

export async function getDocentes() {
  const q = query(collection(db, "users"), orderBy("nombre", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function toggleUserStatus(userId, nuevoEstado, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo el administrador puede cambiar el estado de un usuario.");
  }
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { estado: nuevoEstado });
  await logAction("estado_usuario", "usuario", userId, `Estado cambiado a ${nuevoEstado}`, adminUser);
}
