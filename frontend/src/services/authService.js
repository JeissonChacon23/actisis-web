import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { logAction } from "./auditService";

/**
 * Inicia sesión por Correo o buscando por Código / Documento
 */
export async function loginUser({ identificador, password }) {
  let emailToUse = identificador.trim();

  // Si no incluye '@', buscamos en Firestore si corresponde a código o documento
  if (!emailToUse.includes("@")) {
    const usersRef = collection(db, "users");
    // Buscar por código
    let q = query(usersRef, where("codigo", "==", emailToUse));
    let snap = await getDocs(q);

    // Si no encuentra por código, buscar por documento
    if (snap.empty) {
      q = query(usersRef, where("documento", "==", emailToUse));
      snap = await getDocs(q);
    }

    if (snap.empty) {
      throw new Error("Credenciales inválidas. No se encontró usuario con ese código o documento.");
    }

    const userData = snap.docs[0].data();
    emailToUse = userData.correo;
  }

  // Autenticar con Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
  const fbUser = userCredential.user;

  // Obtener perfil detallado de Firestore
  const userDocRef = doc(db, "users", fbUser.uid);
  const userDocSnap = await getDoc(userDocRef);

  let profile = {
    uid: fbUser.uid,
    email: fbUser.email,
    rol: "docente",
    estado: "activo"
  };

  if (userDocSnap.exists()) {
    profile = { ...profile, ...userDocSnap.data() };
  } else {
    // Si es el primer usuario o cuenta de admin inicial
    if (fbUser.email.includes("admin")) {
      profile.rol = "admin";
    }
    await setDoc(userDocRef, profile, { merge: true });
  }

  if (profile.estado === "inactivo") {
    await signOut(auth);
    throw new Error("Su cuenta se encuentra inactiva. Contacte al director del programa.");
  }

  await logAction("login", "auth", fbUser.uid, "Inicio de sesión exitoso", profile);
  return profile;
}

/**
 * Cierre de sesión seguro
 */
export async function logoutUser(user) {
  if (user) {
    await logAction("logout", "auth", user.uid, "Cierre de sesión", user);
  }
  return signOut(auth);
}

/**
 * Recuperación de contraseña mediante correo oficial (HU-03 / RF002)
 */
export async function sendResetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Observador de estado de autenticación
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, "users", fbUser.uid));
      if (userDoc.exists()) {
        callback({ uid: fbUser.uid, ...userDoc.data() });
      } else {
        callback({ uid: fbUser.uid, email: fbUser.email, rol: "docente", estado: "activo" });
      }
    } catch {
      callback({ uid: fbUser.uid, email: fbUser.email });
    }
  });
}
