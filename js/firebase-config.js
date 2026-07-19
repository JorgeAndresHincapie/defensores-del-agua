// firebase-config.js
// Inicialización de Firebase para el proyecto "defensores-del-agua"
//
// Reemplaza los valores de firebaseConfig con los de tu proyecto real.
// Los encuentras en: Firebase Console > Configuración del proyecto > Tus apps > SDK setup and configuration

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "defensores-del-agua.firebaseapp.com",
  projectId: "defensores-del-agua",
  storageBucket: "defensores-del-agua.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, onAuthStateChanged };
