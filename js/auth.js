// auth.js
// Funciones de autenticación para el Club Defensores del Agua

import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/**
 * Inicia sesión con correo y contraseña.
 */
export async function iniciarSesion(correo, password) {
  const credenciales = await signInWithEmailAndPassword(auth, correo, password);
  return credenciales.user;
}

/**
 * Registra un nuevo estudiante y crea su documento en Firestore.
 * clubId e institucionId deben venir predefinidos según el club al
 * que pertenece (por ahora, "club-defensores-agua" / "el-llano").
 */
export async function registrarEstudiante({
  correo,
  password,
  nombre,
  clubId,
  institucionId,
}) {
  const credenciales = await createUserWithEmailAndPassword(auth, correo, password);
  const uid = credenciales.user.uid;

  await setDoc(doc(db, "usuarios", uid), {
    nombre,
    correo,
    rol: "estudiante",
    clubId,
    institucionId,
    nivelActual: 1,
    puntos: 0,
    activo: true,
    fechaCreacion: serverTimestamp(),
  });

  return credenciales.user;
}

/**
 * Obtiene el documento de Firestore del usuario autenticado.
 */
export async function obtenerPerfilUsuario(uid) {
  const snap = await getDoc(doc(db, "usuarios", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Cierra sesión.
 */
export async function cerrarSesion() {
  await signOut(auth);
}
