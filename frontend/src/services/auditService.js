import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
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
      fechaIso: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error al registrar log de auditoría:", error);
  }
}

/**
 * Obtiene el historial de auditoría para trazabilidad CNA (RNF006 / HU-13)
 */
export async function getAuditLogs(maxRecords = 200) {
  try {
    const q = query(
      collection(db, "auditlogs"),
      orderBy("timestamp", "desc"),
      limit(maxRecords)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, "auditlogs"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}
