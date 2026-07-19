// firebase-config.js
// Inicialización de Firebase para el proyecto "defensores-del-agua"

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5zIew2eJI4cp92H8QHYvsrDD7E3bkoZ4",
  authDomain: "defensores-del-agua.firebaseapp.com",
  projectId: "defensores-del-agua",
  storageBucket: "defensores-del-agua.firebasestorage.app",
  messagingSenderId: "607320334845",
  appId: "1:607320334845:web:091b0fb3de26cee6073994",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, onAuthStateChanged };
