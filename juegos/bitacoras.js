/* =========================================================================
   BITÁCORAS: registros de varios días con gráfica de avance.
   Modo "diario": un dato por día durante 7 días (uno o dos campos).
   Modo "lista": anotaciones sueltas (pagos, compras, especies...).
   Los datos se guardan en el navegador del estudiante; al integrarlo a la
   app se guardarán en Firestore.
   ========================================================================= */

const DIAS = ["Día 1", "Día 2", "Día 3", "Día 4", "Día 5", "Día 6", "Día 7"];

function bitacoraPara(act) {
  const t = act.titulo.toLowerCase();
  if (!/bit[aá]cora/.test(t)) return null;
  const lugar = (t.match(/en ([a-záéíóúñ ]+)$/) || [])[1];
  const donde = lugar ? " en " + lugar.trim() : "";
  const e = act.eje;

  if (e === "biodiversidad") {
    if (/sonidos/.test(t)) return { modo: "diario", titulo: "Sonidos escuchados en 15 minutos", campos: [{ id: "nat", label: "Sonidos naturales (aves, insectos, viento)", color: "#2e7d32" }, { id: "art", label: "Sonidos artificiales (motos, música, máquinas)", color: "#78909c" }], meta: { texto: "Observa si predominan los sonidos naturales.", tipo: "info" }, unidad: "sonidos" };
    const grupo = (t.match(/registro de ([a-záéíóúñ ]+?)( locales)?$/) || [])[1] || "especies";
    return { modo: "lista", titulo: `Registro de ${grupo}`, campos: [{ id: "nombre", label: "Nombre común (o descripción)", tipo: "text" }, { id: "lugar", label: "Dónde lo viste", tipo: "text" }, { id: "cant", label: "Cuántos", tipo: "number" }], minimo: 4, resumen: lst => `${lst.length} registros · ${new Set(lst.map(x => (x.nombre || "").toLowerCase().trim())).size} especies distintas · ${lst.reduce((s, x) => s + (+x.cant || 0), 0)} individuos` };
  }
  if (e === "reforestacion") {
    if (/sembrados/.test(t)) return { modo: "diario", titulo: "Árboles sembrados", campos: [{ id: "n", label: "Árboles sembrados este día", color: "#2e7d32" }], acumulado: true, meta: { texto: "Meta: sembrar 10 árboles en la semana.", tipo: "suma", valor: 10 }, unidad: "árboles" };
    return { modo: "diario", titulo: "Altura de mi plántula", campos: [{ id: "cm", label: "Altura de la planta (cm)", color: "#43a047", decimales: true }], meta: { texto: "Observa cómo crece: la altura debe ir subiendo.", tipo: "sube" }, unidad: "cm" };
  }
  if (e === "pago-servicios") return { modo: "lista", titulo: "Registro de pagos", campos: [{ id: "servicio", label: "Servicio o pago (agua, energía, gas…)", tipo: "text" }, { id: "valor", label: "Valor ($)", tipo: "number" }, { id: "tiempo", label: "¿Se pagó a tiempo?", tipo: "check" }], minimo: 4, resumen: lst => `${lst.length} pagos · total ${pesos(lst.reduce((s, x) => s + (+x.valor || 0), 0))} · ${lst.length ? Math.round(lst.filter(x => x.tiempo).length / lst.length * 100) : 0} % a tiempo` };
  if (e === "alimentacion") return { modo: "lista", titulo: "Registro de compras", campos: [{ id: "producto", label: "Producto", tipo: "text" }, { id: "local", label: "¿Es de cultivo local?", tipo: "check" }, { id: "empaque", label: "¿Venía en plástico?", tipo: "check" }], minimo: 4, resumen: lst => `${lst.length} productos · ${lst.filter(x => x.local).length} locales · ${lst.filter(x => x.empaque).length} con plástico` };
  if (e === "residuos-solidos" || (e === "huella-ecologica" && /residuos/.test(t))) {
    const tipo = (t.match(/residuos ([a-záéíóúñ ]+)$/) || [])[1];
    return { modo: "diario", titulo: "Residuos " + (tipo || "generados"), campos: [{ id: "sep", label: "Bolsas o kg separados correctamente", color: "#2e7d32", decimales: true }, { id: "mix", label: "Bolsas o kg mezclados (sin separar)", color: "#455a64", decimales: true }], meta: { texto: "Meta: que lo separado supere a lo mezclado.", tipo: "proporcion" }, unidad: "kg" };
  }
  if (e === "huella-ecologica") return { modo: "diario", titulo: "Productos desechables usados" + donde, campos: [{ id: "n", label: "Desechables usados (vasos, bolsas, empaques…)", color: "#6d4c41" }], meta: { texto: "Meta: bajar el uso de desechables durante la semana.", tipo: "baja" }, unidad: "desechables" };
  if (e === "energia") return { modo: "diario", titulo: "Luces y aparatos encendidos sin uso" + donde, campos: [{ id: "n", label: "Luces o aparatos encontrados encendidos sin que nadie los use", color: "#ef6c00" }], meta: { texto: "Meta: que cada día haya menos aparatos encendidos sin uso.", tipo: "baja" }, unidad: "casos" };
  if (/lluvia/.test(t)) return { modo: "diario", titulo: "Registro de lluvias", campos: [{ id: "mm", label: "Agua recogida en un vaso o pluviómetro (cm)", color: "#0288d1", decimales: true }], meta: { texto: "Observa qué días llovió más.", tipo: "info" }, unidad: "cm" };
  if (/llaves cerradas/.test(t)) return { modo: "diario", titulo: "Llaves revisadas y cerradas", campos: [{ id: "n", label: "Veces que revisé y cerré bien las llaves", color: "#2e7d32" }], meta: { texto: "Meta: revisar las llaves al menos 3 veces al día.", tipo: "minimo", valor: 3 }, unidad: "veces" };
  if (/limpieza/.test(t)) return { modo: "lista", titulo: "Jornadas de limpieza", campos: [{ id: "lugar", label: "Lugar (quebrada, río, zona verde…)", tipo: "text" }, { id: "kg", label: "Bolsas o kg de basura recogidos", tipo: "number" }, { id: "personas", label: "Personas que participaron", tipo: "number" }], minimo: 2, resumen: lst => `${lst.length} jornadas · ${lst.reduce((s, x) => s + (+x.kg || 0), 0)} bolsas o kg recogidos` };
  if (["acueducto", "ahorro-agua", "fuentes-hidricas"].includes(e)) {
    const ducha = /ducha/.test(t);
    return { modo: "diario", titulo: (ducha ? "Minutos en la ducha" : "Minutos con la llave abierta") + donde, campos: [{ id: "min", label: ducha ? "Minutos en la ducha" : "Minutos con la llave abierta", color: "#0288d1", decimales: true }], meta: { texto: "Meta: ir bajando los minutos durante la semana.", tipo: "baja" }, unidad: "min", litros: 8 };
  }
  return { modo: "diario", titulo: "Mi registro", campos: [{ id: "n", label: "Dato del día", color: "#0288d1" }], meta: { texto: "Registra un dato cada día.", tipo: "info" }, unidad: "" };
}

function motorBitacora(zona, act, cfg, ctx) {
  estado.bitacoras = estado.bitacoras || {};
  const datos = estado.bitacoras[act.id] = estado.bitacoras[act.id] || (cfg.modo === "lista" ? [] : {});
  const caja = el("div", { class: "bit" });
  zona.append(caja);
  let completada = false;
  const seguir = el("button", { class: "btn btn-verde", type: "button", hidden: "" }, "¡Bitácora completa! Continuar →");
  seguir.addEventListener("click", () => { seguir.disabled = true; ctx.completar(); });

  if (cfg.modo === "lista") return modoLista();
  return modoDiario();

  function modoDiario() {
    const graf = el("div", { class: "bit-graf", "aria-hidden": "true" });
    const tabla = el("div", { class: "bit-tabla" });
    const estadoTxt = el("div", { class: "bit-estado", "aria-live": "polite" });
    caja.append(el("div", { class: "sim-mision" }, `<b>📒 ${esc(cfg.titulo)}</b><br>${esc(cfg.meta.texto)} Registra al menos 5 días.`), graf, tabla, estadoTxt, seguir);
    DIAS.forEach((d, i) => {
      const fila = el("div", { class: "bit-fila" }, `<span class="bit-dia">${d}</span>`);
      cfg.campos.forEach(c => {
        const inp = el("input", { type: "number", min: "0", step: c.decimales ? "0.1" : "1", inputmode: "decimal", "aria-label": `${c.label}, ${d}`, placeholder: "—" });
        const v = (datos[i] || {})[c.id];
        if (v !== undefined && v !== null && v !== "") inp.value = v;
        inp.addEventListener("input", () => {
          datos[i] = datos[i] || {};
          datos[i][c.id] = inp.value === "" ? "" : Number(inp.value);
          guardar(); pintar();
        });
        const lab = el("label", { class: "bit-campo" }, `<span>${esc(c.label)}</span>`); lab.append(inp); fila.append(lab);
      });
      tabla.append(fila);
    });
    pintar();
    function valor(i, c) { const x = (datos[i] || {})[c.id]; return x === "" || x === undefined ? null : x; }
    function pintar() {
      const llenos = DIAS.map((_, i) => cfg.campos.some(c => valor(i, c) !== null)).filter(Boolean).length;
      const series = cfg.campos.map(c => DIAS.map((_, i) => valor(i, c)));
      let acum = 0;
      const vals = cfg.acumulado ? series[0].map(x => (acum += x || 0)) : null;
      const maxV = Math.max(1, ...(vals || series.flat().filter(x => x !== null)), cfg.meta.valor || 0) * 1.15;
      const W = 560, H = 220, x0 = 40, bw = (W - x0 - 10) / 7;
      let svg = `<svg viewBox="0 0 ${W} ${H + 30}"><rect width="${W}" height="${H + 30}" fill="#f6fbfe"/><path d="M${x0} ${H}h${W - x0}" stroke="#90a4ae" stroke-width="2"/>`;
      [0.5, 1].forEach(k => { const y = H - (H - 20) * k; svg += `<path d="M${x0} ${y}h${W - x0}" stroke="#e0ecf1"/><text x="${x0 - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="#78909c" font-family="Segoe UI, Arial">${fmt(maxV * k, 1)}</text>`; });
      if (cfg.meta.valor && (cfg.meta.tipo === "minimo" || cfg.meta.tipo === "suma")) { const y = H - (H - 20) * cfg.meta.valor / maxV; svg += `<path d="M${x0} ${y}h${W - x0}" stroke="#f9a825" stroke-width="2" stroke-dasharray="6 4"/><text x="${W - 8}" y="${y - 5}" text-anchor="end" font-size="11" fill="#f57f17" font-family="Segoe UI, Arial">meta</text>`; }
      DIAS.forEach((d, i) => {
        const nc = cfg.campos.length, w = (bw - 10) / nc;
        cfg.campos.forEach((c, k) => {
          const v = cfg.acumulado ? (series[0][i] !== null ? vals[i] : null) : series[k][i];
          if (v === null) return;
          const h = (H - 20) * v / maxV;
          svg += `<rect x="${x0 + i * bw + 5 + k * w}" y="${H - h}" width="${w - 2}" height="${Math.max(1, h)}" rx="3" fill="${c.color}"/>`;
        });
        svg += `<text x="${x0 + i * bw + bw / 2}" y="${H + 18}" text-anchor="middle" font-size="12" fill="#37474f" font-family="Segoe UI, Arial">${d}</text>`;
      });
      svg += "</svg>";
      graf.innerHTML = svg + (cfg.campos.length > 1 ? `<div class="bit-leyenda">${cfg.campos.map(c => `<span><i style="background:${c.color}"></i>${esc(c.label)}</span>`).join("")}</div>` : "");
      estadoTxt.innerHTML = analisis(series, llenos);
      if (llenos >= 5 && !completada) { completada = true; ctx.fb("🎉 ¡Registraste 5 días! Puedes seguir anotando o continuar.", true); seguir.hidden = false; }
    }
    function analisis(series, llenos) {
      const s = series[0].filter(x => x !== null);
      const total = s.reduce((a, b) => a + b, 0);
      let msg = `<b>${llenos} de 7 días registrados.</b> `;
      if (cfg.litros && s.length) msg += `Equivale a unos ${fmt(total * cfg.litros)} litros en total (con ${cfg.litros} L por minuto de ejemplo). `;
      if (s.length >= 2) {
        const pri = s[0], ult = s[s.length - 1];
        if (cfg.meta.tipo === "baja") msg += ult < pri ? "📉 ¡Vas bajando! Sigue así." : ult > pri ? "📈 Subió respecto al primer día. ¿Qué podrías cambiar?" : "Se mantiene igual. Intenta mejorar un poco cada día.";
        if (cfg.meta.tipo === "sube") msg += ult > pri ? `🌱 Creció ${fmt(ult - pri, 1)} cm desde el primer registro.` : "Aún no se nota el crecimiento: revisa el riego y la luz.";
      }
      if (cfg.meta.tipo === "suma") msg += `Total: ${fmt(total)} de ${cfg.meta.valor} ${cfg.unidad}.`;
      if (cfg.meta.tipo === "minimo" && s.length) msg += `Días que cumpliste la meta: ${s.filter(x => x >= cfg.meta.valor).length}.`;
      if (cfg.meta.tipo === "proporcion") { const sep = series[0].reduce((a, b) => a + (b || 0), 0), mix = series[1].reduce((a, b) => a + (b || 0), 0); if (sep + mix > 0) msg += `Separado: ${fmt(sep / (sep + mix) * 100)} % del total.` + (sep > mix ? " ♻️ ¡Meta cumplida!" : ""); }
      if (cfg.campos.length === 2 && cfg.meta.tipo === "info") { const a = series[0].reduce((x, y) => x + (y || 0), 0), b = series[1].reduce((x, y) => x + (y || 0), 0); if (a + b > 0) msg += a >= b ? "Predominan los sonidos naturales 🐦." : "Predominan los sonidos artificiales 🏍️."; }
      return msg;
    }
  }

  function modoLista() {
    const resumen = el("div", { class: "bit-estado", "aria-live": "polite" });
    const lista = el("div", { class: "bit-lista" });
    const form = el("form", { class: "bit-form" });
    caja.append(el("div", { class: "sim-mision" }, `<b>📒 ${esc(cfg.titulo)}</b><br>Agrega al menos ${cfg.minimo} anotaciones.`), form, resumen, lista, seguir);
    const inputs = {};
    cfg.campos.forEach(c => {
      if (c.tipo === "check") {
        const inp = el("input", { type: "checkbox" }); inputs[c.id] = inp;
        const l = el("label", { class: "bit-check" }); l.append(inp, document.createTextNode(" " + c.label)); form.append(l);
      } else {
        const inp = el("input", { type: c.tipo === "number" ? "number" : "text", min: "0", placeholder: c.label, "aria-label": c.label }); inputs[c.id] = inp;
        form.append(inp);
      }
    });
    form.append(el("button", { class: "btn btn-azul", type: "submit" }, "+ Agregar"));
    form.addEventListener("submit", e => {
      e.preventDefault();
      const primero = cfg.campos[0];
      if (!inputs[primero.id].value.trim()) { ctx.fb("Escribe al menos: " + primero.label.toLowerCase() + "."); inputs[primero.id].focus(); return; }
      const reg = {};
      cfg.campos.forEach(c => { reg[c.id] = c.tipo === "check" ? inputs[c.id].checked : inputs[c.id].value.trim(); inputs[c.id].type === "checkbox" ? (inputs[c.id].checked = false) : (inputs[c.id].value = ""); });
      datos.push(reg); guardar(); pintar(); inputs[primero.id].focus();
    });
    pintar();
    function pintar() {
      lista.innerHTML = "";
      datos.forEach((r, i) => {
        const fila = el("div", { class: "bit-item" }, `<span class="n">${i + 1}</span><span>${cfg.campos.map(c => c.tipo === "check" ? (r[c.id] ? "✓ " + esc(c.label.replace(/^¿|\?$/g, "")) : "") : esc(r[c.id] || "")).filter(Boolean).join(" · ")}</span>`);
        const borrar = el("button", { class: "bit-borrar", type: "button", "aria-label": "Borrar anotación " + (i + 1) }, "✕");
        borrar.addEventListener("click", () => { datos.splice(i, 1); guardar(); pintar(); });
        fila.append(borrar); lista.append(fila);
      });
      resumen.innerHTML = `<b>${cfg.resumen(datos)}</b>`;
      if (datos.length >= cfg.minimo && !completada) { completada = true; ctx.fb("🎉 ¡Bitácora completa! Puedes seguir anotando o continuar.", true); seguir.hidden = false; }
    }
  }
}
