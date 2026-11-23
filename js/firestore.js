// firestore.js
// Funciones para leer niveles, progreso e instituciones desde Firestore

import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  increment,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function obtenerNiveles() {
  const q = query(collection(db, "niveles"), orderBy("ejeTematico"), orderBy("orden"));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }))
    .filter((nivel) => nivel.activo);
}

export async function obtenerNivelesTodos() {
  const q = query(collection(db, "niveles"), orderBy("ejeTematico"), orderBy("orden"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function existeNivel(id) {
  const ref = doc(db, "niveles", id);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function existeOrdenEnEje(ejeTematico, orden, idExcluir) {
  const q = query(
    collection(db, "niveles"),
    where("ejeTematico", "==", ejeTematico),
    where("orden", "==", orden)
  );
  const snap = await getDocs(q);
  return snap.docs.some((d) => d.id !== idExcluir);
}

export async function guardarNivel(id, datos) {
  const ref = doc(db, "niveles", id);
  await setDoc(ref, datos, { merge: true });
}

export async function cambiarActivoNivel(id, nuevoEstado) {
  const ref = doc(db, "niveles", id);
  await updateDoc(ref, { activo: nuevoEstado });
}

export async function eliminarNivel(id) {
  const ref = doc(db, "niveles", id);
  await deleteDoc(ref);
}

export function agruparPorEje(niveles) {
  return niveles.reduce((grupos, nivel) => {
    const eje = nivel.ejeTematico;
    if (!grupos[eje]) grupos[eje] = [];
    grupos[eje].push(nivel);
    return grupos;
  }, {});
}

export async function registrarProgreso(uid, retoId, insigniaId, puntosGanados, nuevoNivel, nota) {
  const ref = doc(db, "usuarios", uid);
  const datosActualizados = {
    puntos: increment(puntosGanados),
    nivelActual: nuevoNivel,
    retosCompletados: arrayUnion(retoId),
  };
  if (insigniaId) {
    datosActualizados.insignias = arrayUnion(insigniaId);
  }
  if (typeof nota === "number") {
    datosActualizados[`calificaciones.${retoId}`] = {
      automatica: nota,
      ajustada: null,
      fecha: new Date().toISOString(),
    };
  }
  await updateDoc(ref, datosActualizados);
}

export async function obtenerEstudiantesPorInstitucion(institucionId) {
  const q = query(
    collection(db, "usuarios"),
    where("institucionId", "==", institucionId),
    where("rol", "==", "estudiante")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function actualizarCalificacionAjustada(uid, retoId, valorAjustado) {
  const ref = doc(db, "usuarios", uid);
  await updateDoc(ref, {
    [`calificaciones.${retoId}.ajustada`]: valorAjustado,
  });
}

export const ORDEN_EJES = [
  "acueducto",
  "pago-servicios",
  "ahorro-agua",
  "residuos-solidos",
  "energia",
  "fuentes-hidricas",
  "huella-ecologica",
  "alimentacion",
  "reforestacion",
  "biodiversidad",
];

function elegirAleatorios(lista, cantidad) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, cantidad);
}

async function asignarRetosDelEje(eje) {
  const niveles = await obtenerNiveles();
  const delEje = niveles.filter((n) => n.ejeTematico === eje);
  return elegirAleatorios(delEje, 10).map((n) => n.id);
}

// Si el estudiante no tiene retos asignados todavía, le asigna 10 al azar
// del primer eje. Si ya tiene, devuelve los que ya le tocaron (para que no
// cambien cada vez que entra).
export async function obtenerOAsignarProgreso(uid, perfil) {
  if (perfil.progresoActual && perfil.progresoActual.retosAsignados && perfil.progresoActual.retosAsignados.length > 0) {
    return perfil.progresoActual;
  }
  const eje = ORDEN_EJES[0];
  const retosAsignados = await asignarRetosDelEje(eje);
  const progreso = { ejeActual: eje, retosAsignados };
  await updateDoc(doc(db, "usuarios", uid), { progresoActual: progreso });
  return progreso;
}

// Se llama después de completar un reto. Si ya se completaron los 10 del
// eje actual, calcula el promedio del eje y asigna los 10 del siguiente
// eje (o marca el juego como terminado si ya no hay más ejes).
export async function avanzarProgresoSiCorresponde(uid, perfil) {
  const progreso = perfil.progresoActual;
  if (!progreso || !progreso.ejeActual) return null;

  const retosCompletados = perfil.retosCompletados || [];
  const todosCompletados = progreso.retosAsignados.every((id) => retosCompletados.includes(id));
  if (!todosCompletados) return null;

  const calificaciones = perfil.calificaciones || {};
  const notas = progreso.retosAsignados
    .map((id) => calificaciones[id])
    .filter(Boolean)
    .map((c) => (typeof c.ajustada === "number" ? c.ajustada : c.automatica))
    .filter((v) => typeof v === "number");
  const promedio = notas.length ? +(notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2) : null;

  const indiceActual = ORDEN_EJES.indexOf(progreso.ejeActual);
  const siguienteEje = ORDEN_EJES[indiceActual + 1];

  const actualizacion = {};
  actualizacion[`promediosEjes.${progreso.ejeActual}`] = promedio;
  actualizacion.insignias = arrayUnion(`eje-completado-${progreso.ejeActual}`);

  if (!siguienteEje) {
    // Calculamos el promedio final combinando el de todos los ejes,
    // incluyendo el que se acaba de terminar.
    const promediosPrevios = perfil.promediosEjes || {};
    const todosLosPromedios = [...Object.values(promediosPrevios), promedio].filter(
      (v) => typeof v === "number"
    );
    const promedioFinal = todosLosPromedios.length
      ? +(todosLosPromedios.reduce((a, b) => a + b, 0) / todosLosPromedios.length).toFixed(2)
      : null;

    actualizacion.progresoActual = { ejeActual: null, retosAsignados: [] };
    actualizacion.juegoCompletado = true;
    actualizacion.promedioFinal = promedioFinal;
    await updateDoc(doc(db, "usuarios", uid), actualizacion);
    return { ejeTerminado: progreso.ejeActual, promedio, juegoCompletado: true, promedioFinal };
  }

  const retosAsignados = await asignarRetosDelEje(siguienteEje);
  actualizacion.progresoActual = { ejeActual: siguienteEje, retosAsignados };
  await updateDoc(doc(db, "usuarios", uid), actualizacion);
  return { ejeTerminado: progreso.ejeActual, promedio, siguienteEje, juegoCompletado: false };
}

export async function crearOActualizarInstitucion(institucionId, datos) {
  const ref = doc(db, "instituciones", institucionId);
  await setDoc(ref, datos, { merge: true });
}

export async function obtenerInstituciones() {
  const snap = await getDocs(collection(db, "instituciones"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function obtenerInstitucion(institucionId) {
  const snap = await getDoc(doc(db, "instituciones", institucionId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export const NOMBRES_EJES = {
  "acueducto": "El viaje del agua",
  "pago-servicios": "Cultura de pago",
  "ahorro-agua": "Ahorro del agua",
  "residuos-solidos": "Residuos sólidos",
  "energia": "Energía",
  "fuentes-hidricas": "Protección hídrica",
  "huella-ecologica": "Huella ecológica",
  "alimentacion": "Alimentación sostenible",
  "reforestacion": "Reforestación",
  "biodiversidad": "Biodiversidad",
};
