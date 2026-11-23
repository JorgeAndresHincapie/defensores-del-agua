// progreso.js — Conecta los juegos con la cuenta del estudiante en Firestore.
//
// Qué guarda (documento usuarios/{uid}):
//   puntos                      → suma los puntos de cada reto la PRIMERA vez que se completa
//   juegos.completados.{id}     → { estrellas, fecha }
//   juegos.grupo                → "primaria" | "basica" | "media"
//   retosCompletados            → el id real del reto en "niveles" (el mismo que usa nivel.html)
//   calificaciones.{id}         → { automatica, ajustada: null, fecha }  (misma fórmula de nivel.html)
//   insignias                   → se agrega la insignia del reto, si tiene
// Después llama a avanzarProgresoSiCorresponde() para que avance de eje igual que en nivel.html.
// Si el reto ya se había hecho en nivel.html, no vuelve a sumar puntos.
// Bitácoras: subcolección usuarios/{uid}/bitacoras/{idActividad} → { datos, actualizado }

import { auth, db } from "../js/firebase-config.js";
import { avanzarProgresoSiCorresponde } from "../js/firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, getDocs, setDoc, updateDoc, collection, runTransaction,
  increment, arrayUnion, serverTimestamp, FieldPath, query, where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let uid = null;
let ultimoGrupo;
const bitacorasEnviadas = {};   // id → JSON enviado la última vez
let temporizador = null;

// Lee los 10 retos que el mapa le asignó (progresoActual.retosAsignados)
// con su eje, orden y título, para mostrarlos en los juegos.
async function leerAsignados(perfil) {
  const ids = perfil?.progresoActual?.retosAsignados || [];
  const lista = await Promise.all(ids.map(async (id) => {
    try {
      const d = await getDoc(doc(db, "niveles", id));
      if (!d.exists()) return null;
      const n = d.data();
      return { id, eje: n.ejeTematico || n.eje_tematico, orden: n.orden, titulo: n.titulo };
    } catch (e) { return null; }
  }));
  return lista.filter(Boolean);
}

function listo(estadoRemoto) {
  if (typeof window.__remotoListo === "function") window.__remotoListo(estadoRemoto);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "../index.html"; return; }
  uid = user.uid;
  try {
    const ref = doc(db, "usuarios", uid);
    const [perfilSnap, bitSnap] = await Promise.all([
      getDoc(ref),
      getDocs(collection(db, "usuarios", uid, "bitacoras")),
    ]);
    if (!perfilSnap.exists()) { window.location.href = "../index.html"; return; }
    const perfil = perfilSnap.data();
    const juegos = perfil.juegos || {};
    const bitacoras = {};
    bitSnap.forEach((d) => {
      bitacoras[d.id] = d.data().datos;
      bitacorasEnviadas[d.id] = JSON.stringify(d.data().datos);
    });
    ultimoGrupo = juegos.grupo || null;
    const nombre = document.getElementById("nombre-usuario");
    if (nombre && perfil.nombre) nombre.textContent = perfil.nombre;
    const asignados = await leerAsignados(perfil).catch(() => []);
    listo({
      asignados,
      retosCompletados: perfil.retosCompletados || [],
      puntos: Number.isFinite(perfil.puntos) ? perfil.puntos : 0,
      grupo: juegos.grupo || null,
      completados: juegos.completados || {},
      bitacoras,
    });
  } catch (e) {
    console.error("No se pudo leer el progreso:", e);
    listo(null); // se juega igual, con el progreso local
  }
});

// Busca el id del documento en "niveles" que corresponde a esta actividad.
async function idReal(act) {
  try {
    const q = query(collection(db, "niveles"), where("ejeTematico", "==", act.eje), where("orden", "==", act.orden));
    const docs = (await getDocs(q)).docs;
    const limpio = (t) => String(t || "").trim().toLowerCase();
    const mismo = docs.find((d) => limpio(d.data().titulo) === limpio(act.titulo));
    return mismo ? mismo.id : docs.length === 1 ? docs[0].id : null;
  } catch (e) {
    return null;
  }
}

// Se llama cada vez que el estudiante termina un reto.
window.onRetoCompletado = async (act, estrellas, errores = 0) => {
  if (!uid) return;
  const ref = doc(db, "usuarios", uid);
  const pts = Number(act.pts ?? 10) || 0;
  const nota = Math.max(2, +(5 - errores * 0.3).toFixed(1));
  const retoId = await idReal(act);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const datos = snap.data() || {};
      const previo = datos.juegos?.completados?.[act.id];
      const yaEnNivel = retoId && (datos.retosCompletados || []).includes(retoId);
      const campos = [
        new FieldPath("juegos", "completados", act.id),
        { estrellas: Math.max(estrellas, previo?.estrellas || 0), fecha: serverTimestamp(), ...(retoId ? { retoId } : {}) },
      ];
      if (!previo && !yaEnNivel) {
        campos.push("puntos", increment(pts));
        if (act.ins) campos.push("insignias", arrayUnion(act.ins));
      }
      if (retoId && !yaEnNivel) campos.push("retosCompletados", arrayUnion(retoId));
      if (retoId && !(datos.calificaciones || {})[retoId]) {
        campos.push(new FieldPath("calificaciones", retoId), { automatica: nota, ajustada: null, fecha: new Date().toISOString() });
      }
      tx.update(ref, ...campos);
    });
    if (retoId) {
      const perfil = (await getDoc(ref)).data();
      const avance = await avanzarProgresoSiCorresponde(uid, perfil);
      const perfil2 = (await getDoc(ref)).data();
      if (typeof window.onAsignadosActualizados === "function") {
        window.onAsignadosActualizados(await leerAsignados(perfil2), perfil2.retosCompletados || []);
      }
      if (avance && avance.ejeTerminado) {
        avisar(avance.juegoCompletado
          ? "¡Completaste todos los ejes del club! 🏆"
          : "¡Terminaste los retos asignados de este eje! Ya tienes nuevos retos en el mapa.", "#2e7d32");
      }
    }
  } catch (e) {
    console.error("No se pudo guardar el reto en la cuenta:", e);
    avisar("No se pudo guardar en tu cuenta. Tu progreso quedó en este dispositivo.");
  }
};

// Se llama cada vez que el juego guarda su estado (grupo, bitácoras…).
window.onEstadoGuardado = (estado) => {
  if (!uid) return;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => enviarCambios(estado), 1200);
};

async function enviarCambios(estado) {
  const ref = doc(db, "usuarios", uid);
  try {
    if (estado.grupo && estado.grupo !== ultimoGrupo) {
      await updateDoc(ref, new FieldPath("juegos", "grupo"), estado.grupo);
      ultimoGrupo = estado.grupo;
    }
    for (const [id, datos] of Object.entries(estado.bitacoras || {})) {
      const json = JSON.stringify(datos);
      if (bitacorasEnviadas[id] === json) continue;
      await setDoc(doc(db, "usuarios", uid, "bitacoras", id), { datos, actualizado: serverTimestamp() });
      bitacorasEnviadas[id] = json;
    }
  } catch (e) {
    console.error("No se pudo sincronizar:", e);
  }
}

function avisar(texto, color = "#c62828") {
  const p = document.createElement("div");
  p.textContent = texto;
  p.style.cssText = `position:fixed;left:50%;bottom:16px;transform:translateX(-50%);background:${color};color:#fff;padding:10px 16px;border-radius:10px;z-index:99;font:14px Arial`;
  document.body.append(p);
  setTimeout(() => p.remove(), 5000);
}
