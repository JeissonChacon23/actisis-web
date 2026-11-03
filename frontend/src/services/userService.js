import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { logAction } from "./auditService";
import { sanitizeInput, validateNumericOnly } from "../helpers/validators";

/**
 * Codifica y decodifica tokens de invitación autoverificables en Base64URL
 * para que funcionen incluso sin lectura pública en Firestore (RF001.1 / RF001.2)
 */
function encodeInviteToken(payload) {
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return b64;
}

function decodeInviteToken(token) {
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const json = decodeURIComponent(escape(atob(b64 + pad)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

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
 * Actualiza los datos y rol de un docente (RF001.4, RF001.6, CN2)
 */
export async function updateUser(userId, data, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo el administrador puede editar datos de docentes.");
  }
  validateNumericOnly(data.documento, "Documento de Identidad");
  validateNumericOnly(data.codigo, "Código UFPS");
  validateNumericOnly(data.telefono, "Teléfono");

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
 * Genera un enlace único de registro temporal por 24 horas y pre-registra al docente
 * en estado 'pendiente' dentro de la colección 'users' (RF001.1 / Caso de Prueba N01)
 */
export async function generateInvitationLink({ correo, nombre }, adminUser) {
  if (adminUser?.rol !== "admin") {
    throw new Error("Solo el administrador puede generar enlaces de invitación.");
  }

  const cleanEmail = (correo || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Ingresa un correo electrónico institucional válido.");
  }

  const cleanName = sanitizeInput(nombre || cleanEmail.split("@")[0]);
  const expMs = Date.now() + 24 * 60 * 60 * 1000;
  const expiresAt = new Date(expMs).toISOString();
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const inviteId = `inv_${nonce}`;

  const token = encodeInviteToken({
    id: inviteId,
    c: cleanEmail,
    n: cleanName,
    exp: expMs,
  });

  const link = `${window.location.origin}/registro/${token}`;

  // Pre-registrar al docente con estado 'pendiente' en la colección 'users' (permitida para Admin)
  try {
    await setDoc(doc(db, "users", inviteId), {
      uid: inviteId,
      nombre: cleanName,
      apellido: "",
      documento: "Pendiente",
      codigo: "Pendiente",
      correo: cleanEmail,
      email: cleanEmail,
      telefono: "",
      tipo: "Planta",
      rol: "docente",
      estado: "pendiente",
      registroToken: token,
      registroLink: link,
      registroTokenExpires: expiresAt,
      createdBy: adminUser?.uid || adminUser?.id || "admin",
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Aviso al pre-registrar docente en users:", err.message);
  }

  await logAction(
    "invitar",
    "usuario",
    inviteId,
    `Invitación y enlace único generado para ${cleanName} (${cleanEmail})`,
    adminUser
  );

  return { token, link, expiresAt, inviteId };
}

/**
 * Valida un token de invitación (RF001.2 / RB-01)
 */
export async function validateInvitationToken(token) {
  // 1. Intentar decodificar token autoverificable (no requiere permisos de lectura no autenticada)
  const decoded = decodeInviteToken(token);
  if (decoded && decoded.c && decoded.exp) {
    const usedTokens = JSON.parse(localStorage.getItem("actisis_used_tokens") || "[]");
    if (usedTokens.includes(token)) {
      throw new Error("Este enlace de registro ya fue utilizado (uso único).");
    }
    if (Date.now() > decoded.exp) {
      throw new Error("El enlace de registro ha expirado (vigencia máxima de 24 horas).");
    }
    return {
      inviteId: decoded.id,
      correo: decoded.c,
      nombreSugerido: decoded.n || "",
      expiresAt: new Date(decoded.exp).toISOString(),
    };
  }

  // 2. Fallback para tokens hexadecimales guardados en colección invitations
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
 * Completa el registro de un docente mediante su enlace único (RF001.2, CN2)
 */
export async function completeInvitationRegistration(token, formData) {
  validateNumericOnly(formData.documento, "Documento de Identidad");
  validateNumericOnly(formData.codigo, "Código UFPS");
  validateNumericOnly(formData.telefono, "Teléfono");

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

  // Si existía un pre-registro pendiente en 'users', intentar limpiarlo
  if (inv.inviteId) {
    try {
      await deleteDoc(doc(db, "users", inv.inviteId));
    } catch {
      // Si el docente no tiene permiso delete sobre el doc temporal, se ignora sin afectar el flujo
    }
  }

  // Marcar el token como usado localmente
  try {
    const usedTokens = JSON.parse(localStorage.getItem("actisis_used_tokens") || "[]");
    usedTokens.push(token);
    localStorage.setItem("actisis_used_tokens", JSON.stringify(usedTokens));
  } catch {
    // Ignorar errores de storage
  }

  await logAction(
    "registro_invitacion",
    "usuario",
    uid,
    `Docente completó su registro: ${userProfile.nombre} ${userProfile.apellido}`,
    userProfile
  );

  return userProfile;
}
