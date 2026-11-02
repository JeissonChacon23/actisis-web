import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { logAction } from "./auditService";

export async function getSpeakers() {
  const q = query(collection(db, "speakers"), orderBy("nombre", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createSpeaker(data, user) {
  const docRef = await addDoc(collection(db, "speakers"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await logAction("crear", "conferencista", docRef.id, `Conferencista ${data.nombre}`, user);
  return { id: docRef.id, ...data };
}
