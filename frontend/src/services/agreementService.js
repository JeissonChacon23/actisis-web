import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { logAction } from "./auditService";

export async function getAgreements() {
  const q = query(collection(db, "agreements"), orderBy("fecha", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createAgreement(data, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo el administrador puede registrar convenios.");
  }
  const docRef = await addDoc(collection(db, "agreements"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await logAction("crear", "convenio", docRef.id, `Convenio ${data.numero} - ${data.empresa}`, adminUser);
  return { id: docRef.id, ...data };
}
