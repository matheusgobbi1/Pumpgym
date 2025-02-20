import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// (Opcional) import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALbBJFxHTReHYuvmSuy-holCeygB8hhTs",
  authDomain: "pumpgym-89ac9.firebaseapp.com",
  projectId: "pumpgym-89ac9",
  storageBucket: "pumpgym-89ac9.firebasestorage.app",
  messagingSenderId: "426764169112",
  appId: "1:426764169112:web:d3ab05bda4253b307b45ed",
  measurementId: "G-51WTNK6B5C",
};

// Inicializa o app apenas se não existir
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Exporta os serviços que for usar
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);
// export const storage = getStorage(app); // se precisar
