import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Configuración de Firebase para el proyecto 'actisis-ufps'
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA_vf4v6EM1fTcmYcn3gWrjOV0RAGpvfmY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "actisis-ufps.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "actisis-ufps",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "actisis-ufps.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "468853224425",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:468853224425:web:41f67dc6572507fce49178",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CJ4R0GN11Q"
};

// Inicializar la aplicación de Firebase evitando instancias duplicadas
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Servicios de Firebase (experimentalForceLongPolling evita errores HTTP 400 de WebChannel en Safari/macOS)
export const auth = getAuth(app);

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  firestoreInstance = getFirestore(app);
}
export const db = firestoreInstance;

// Inicialización condicional de Analytics en navegador
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export default app;
