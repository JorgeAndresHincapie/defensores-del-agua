// storage-helper.js
// Función simple para subir un archivo (imagen de escudo o firma) a
// Firebase Storage y obtener su URL pública.

import { storage } from "./firebase-config.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

export async function subirArchivo(carpeta, archivo) {
  const nombreLimpio = archivo.name.replace(/\s+/g, "-").toLowerCase();
  const ruta = `${carpeta}/${Date.now()}-${nombreLimpio}`;
  const storageRef = ref(storage, ruta);
  await uploadBytes(storageRef, archivo);
  return getDownloadURL(storageRef);
}
