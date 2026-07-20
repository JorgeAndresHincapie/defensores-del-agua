// firestore.js
// Funciones para leer niveles, progreso e instituciones desde Firestore

import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function obtenerNiveles() {
  const q = query(collection(db, "niveles"), orderBy("ejeTematico"), orderBy("orden"));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((nivel) => nivel.activo);
}

export function agruparPorEje(niveles) {
  return niveles.reduce((grupos, nivel) => {
    const eje = nivel.ejeTematico;
    if (!grupos[eje]) grupos[eje] = [];
    grupos[eje].push(nivel);
    return grupos;
  }, {});
}

export async function registrarProgreso(uid, puntosGanados, nuevoNivel) {
  const ref = doc(db, "usuarios", uid);
  await updateDoc(ref, {
    puntos: increment(puntosGanados),
    nivelActual: nuevoNivel,
  });
}

export const NOMBRES_EJES = {
  "acueducto": "El viaje del agua",
  "pago-servicios": "Cultura de pago",
  "ahorro-agua": "Ahorro del agua",
  "residuos-solidos": "Residuos sólidos",
};