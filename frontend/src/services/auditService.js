import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Registra una acción en la colección inmutable auditlogs (RNF006 / CNA)
 */
export async function logAction(accion, entidad, entidadId, detalles, user) {
  try {
    await addDoc(collection(db, "auditlogs"), {
      accion,
      entidad,
      entidadId: entidadId ? String(entidadId) : null,
      detalles: detalles || "",
      usuarioId: user?.uid || null,
      usuarioNombre: user ? `${user.nombre || ""} ${user.apellido || ""}`.trim() : "Sistema",
      usuarioRol: user?.rol || "desconocido",
      usuarioCorreo: user?.correo || user?.email || null,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al registrar log de auditoría:", error);
  }
}
