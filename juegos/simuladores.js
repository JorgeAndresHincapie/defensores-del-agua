/* =========================================================================
   SIMULADORES para las actividades "Mini experimento".
   Cada simulador tiene controles (deslizadores e interruptores), un dibujo
   que cambia en vivo, resultados y una misión. Al cumplir la misión se
   sigue con las preguntas de la actividad (Ruta del Defensor).
   Los valores de ejemplo (litros por minuto, vatios, tarifas, tasas) se
   muestran en pantalla y el estudiante puede cambiarlos.
   ========================================================================= */

const fmt = (n, d = 0) => Number(n).toLocaleString("es-CO", { maximumFractionDigits: d, minimumFractionDigits: 0 });
const pesos = n => (n < 0 ? "-$" : "$") + fmt(Math.abs(Math.round(n)));

/* ---------- Motor común ---------- */
function simBase(zona, cfg, ctx) {
  const v = {};
  (cfg.controles || []).forEach(c => v[c.id] = c.val);
  (cfg.interruptores || []).forEach(t => v[t.id] = t.val);
  const caja = el("div", { class: "sim" });
  const dibujo = el("div", { class: "sim-dibujo", "aria-hidden": "true" });
  const panel = el("div", { class: "sim-panel" });
  const mision = el("div", { class: "sim-mision" }, `<b>🎯 Misión:</b> ${esc(cfg.mision)}`);
  const res = el("div", { class: "sim-res", "aria-live": "polite" });
  panel.append(mision);
  (cfg.controles || []).forEach(c => {
    const id = "sim-" + c.id;
    const fila = el("label", { class: "sim-ctrl", for: id });
    const val = el("span", { class: "sim-val" });
    const inp = el("input", { type: "range", id, min: c.min, max: c.max, step: c.step || 1, value: c.val });
    fila.append(el("span", { class: "sim-lab" }, esc(c.label)), val, inp);
    if (c.ayuda) fila.append(el("small", {}, esc(c.ayuda)));
    const pinta = () => { val.textContent = c.fmt ? c.fmt(v[c.id]) : fmt(v[c.id]); };
    inp.addEventListener("input", () => { v[c.id] = Number(inp.value); pinta(); actualizar(); });
    pinta(); panel.append(fila);
  });
  (cfg.interruptores || []).forEach(t => {
    const b = el("button", { class: "sim-sw" + (t.val ? " on" : ""), type: "button", "aria-pressed": String(!!t.val) }, `<span class="sw"></span>${esc(t.label)}`);
    b.addEventListener("click", () => { v[t.id] = !v[t.id]; b.classList.toggle("on", v[t.id]); b.setAttribute("aria-pressed", String(v[t.id])); actualizar(); });
    panel.append(b);
  });
  panel.append(res);
  if (cfg.nota) panel.append(el("p", { class: "sim-nota" }, "ℹ️ " + esc(cfg.nota)));
  const seguir = el("button", { class: "btn btn-verde", type: "button", hidden: "" }, "¡Misión cumplida! Continuar →");
  seguir.addEventListener("click", () => { seguir.disabled = true; ctx.completar(); });
  panel.append(seguir);
  caja.append(dibujo, panel);
  zona.append(caja);
  let lograda = false;
  function actualizar() {
    dibujo.innerHTML = cfg.dibujar(v);
    res.innerHTML = cfg.resultados(v).map(([k, x, destacado]) => `<div class="${destacado ? "dest" : ""}"><span>${esc(k)}</span><b>${esc(x)}</b></div>`).join("");
    const ok = cfg.cumple(v);
    mision.classList.toggle("ok", ok);
    if (ok && !lograda) { lograda = true; ctx.fb("🎉 " + (cfg.exito || "¡Lo lograste!"), true); seguir.hidden = false; }
  }
  actualizar();
}

/* ---------- Dibujos reutilizables ---------- */
function svgTanque(pct, etiqueta, color = "#29b6f6") {
  const p = Math.max(0, Math.min(1, pct));
  const h = 180 * p;
  return `<svg viewBox="0 0 260 260"><rect width="260" height="260" fill="#f6fbfe"/>
    <rect x="60" y="40" width="140" height="190" rx="14" fill="#fff" stroke="#90a4ae" stroke-width="5"/>
    <rect x="65" y="${225 - h}" width="130" height="${h}" rx="8" fill="${color}" style="transition:all .4s"/>
    ${p > 0.02 ? `<path d="M65 ${225 - h} q16 -8 32 0 t32 0 t32 0 t32 0" fill="${color}" opacity=".6"/>` : ""}
    ${[0.25, 0.5, 0.75].map(k => `<path d="M60 ${225 - 180 * k}h14" stroke="#90a4ae" stroke-width="3"/>`).join("")}
    <text x="130" y="30" text-anchor="middle" font-size="16" font-weight="700" fill="#01579b" font-family="Segoe UI, Arial">${etiqueta}</text>
    <text x="130" y="${Math.max(70, Math.min(215, 235 - h))}" text-anchor="middle" font-size="20" font-weight="800" fill="${p > 0.15 ? "#fff" : "#01579b"}" font-family="Segoe UI, Arial">${Math.round(p * 100)}%</text></svg>`;
}
function svgBarras(datos, max, color, titulo) {
  const n = datos.length, w = 220 / n;
  return `<svg viewBox="0 0 260 260"><rect width="260" height="260" fill="#f6fbfe"/>
    <text x="130" y="26" text-anchor="middle" font-size="15" font-weight="700" fill="#01579b" font-family="Segoe UI, Arial">${titulo}</text>
    <path d="M20 225h225" stroke="#90a4ae" stroke-width="2"/>
    ${datos.map((d, i) => { const h = Math.max(2, 180 * Math.min(1, d.v / max)); return `<rect x="${24 + i * w}" y="${225 - h}" width="${w - 6}" height="${h}" rx="4" fill="${d.c || color}" style="transition:all .4s"/>
      <text x="${24 + i * w + (w - 6) / 2}" y="242" text-anchor="middle" font-size="10" fill="#37474f" font-family="Segoe UI, Arial">${d.l}</text>`; }).join("")}</svg>`;
}

/* ---------- Plantillas ---------- */
const SIMULADORES = {
  agua(zona, p, ctx) {
    const base = p.minutos * p.caudal * p.personas;
    simBase(zona, {
      mision: `Reduce a la mitad el agua que gasta la familia en "${p.accion}".`,
      controles: [
        { id: "min", label: `Minutos con la llave abierta (${p.accion})`, min: 0, max: p.maxMin || 30, val: p.minutos, fmt: x => x + " min" },
        { id: "caudal", label: "Litros por minuto que sale por la llave", min: 2, max: 20, val: p.caudal, fmt: x => x + " L/min", ayuda: "Valor de ejemplo: puedes medirlo en casa llenando un balde durante un minuto." },
        { id: "per", label: "Personas en la casa", min: 1, max: 8, val: p.personas, fmt: x => x + (x === 1 ? " persona" : " personas") },
      ],
      interruptores: [{ id: "cierra", label: "Cerrar la llave mientras me enjabono o me cepillo", val: false }],
      dibujar: v => svgTanque(litros(v) / (base * 1.4), "Agua usada al día"),
      resultados: v => [["Litros al día", fmt(litros(v)) + " L", true], ["Litros al mes", fmt(litros(v) * 30) + " L"], ["Metros cúbicos al mes", fmt(litros(v) * 30 / 1000, 2) + " m³"]],
      cumple: v => litros(v) <= base / 2,
      exito: "La familia ahora gasta la mitad o menos. ¡Eso se nota en la factura!",
      nota: "1 m³ son 1.000 litros. La factura del agua cobra por m³.",
    }, ctx);
    function litros(v) { return v.min * v.caudal * v.per * (v.cierra ? 0.6 : 1); }
  },

  goteo(zona, p, ctx) {
    simBase(zona, {
      mision: "Descubre cuánta agua se pierde con una llave que gotea y luego repárala.",
      controles: [{ id: "gotas", label: "Gotas por minuto", min: 0, max: 120, val: 60, fmt: x => x + " gotas/min", ayuda: "Ejemplo: cuenta las gotas de una llave durante un minuto." }],
      interruptores: [{ id: "rep", label: "Reparar la llave (cambiar el empaque)", val: false }],
      dibujar: v => svgTanque(perdidos(v) * 30 / 200, "Agua perdida en un mes", "#4fc3f7"),
      resultados: v => [["Litros perdidos al día", fmt(perdidos(v), 1) + " L", true], ["Litros perdidos al mes", fmt(perdidos(v) * 30) + " L"], ["Al año", fmt(perdidos(v) * 365) + " L"]],
      cumple: v => v.rep,
      exito: "¡Llave reparada! Ya no se pierde ni una gota.",
      nota: "Cálculo con el valor aproximado de 0,05 ml por gota.",
    }, ctx);
    function perdidos(v) { return v.rep ? 0 : v.gotas * 1440 * 0.05 / 1000; }
  },

  riego(zona, p, ctx) {
    simBase(zona, {
      mision: "Riega la huerta usando menos de 40 litros.",
      controles: [
        { id: "min", label: "Minutos de riego", min: 0, max: 30, val: 15, fmt: x => x + " min" },
        { id: "baldes", label: "Baldes de 10 litros (si usas balde o regadera)", min: 1, max: 8, val: 3, fmt: x => x + (x === 1 ? " balde" : " baldes") },
      ],
      interruptores: [{ id: "balde", label: "Usar balde o regadera en vez de manguera", val: false }, { id: "hora", label: "Regar temprano o al atardecer", val: false }],
      dibujar: v => svgTanque(litros(v) / 200, "Agua usada para regar", "#66bb6a"),
      resultados: v => [["Litros usados", fmt(litros(v)) + " L", true], ["Método", v.balde ? "Balde o regadera" : "Manguera (12 L/min de ejemplo)"], ["Pérdida por sol", v.hora ? "Baja" : "Alta al mediodía"]],
      cumple: v => litros(v) <= 40 && v.hora,
      exito: "Huerta regada con poca agua y sin que el sol la evapore.",
      nota: "Al mediodía el sol evapora parte del agua antes de que llegue a las raíces.",
    }, ctx);
    function litros(v) { return (v.balde ? v.baldes * 10 : v.min * 12) * (v.hora ? 1 : 1.15); }
  },

  energia(zona, p, ctx) {
    const base = p.w * p.horas * 30 / 1000;
    simBase(zona, {
      mision: `Baja al menos un 30 % la energía que gasta: ${p.aparato}.`,
      controles: [
        { id: "w", label: `Potencia de ${p.aparato}`, min: Math.max(1, Math.round(p.w * 0.3)), max: Math.round(p.w * 1.5), val: p.w, fmt: x => x + " W", ayuda: "Valor de ejemplo: la potencia real aparece en la etiqueta del aparato." },
        { id: "h", label: "Horas de uso al día", min: 0, max: 24, step: 0.5, val: p.horas, fmt: x => fmt(x, 1) + " h" },
        { id: "tar", label: "Tarifa de ejemplo por kWh", min: 300, max: 1500, step: 50, val: 900, fmt: x => pesos(x) },
      ],
      interruptores: [{ id: "desc", label: "Desconectarlo cuando no se usa", val: false }],
      dibujar: v => svgBarras([{ l: "Antes", v: base, c: "#b0bec5" }, { l: "Ahora", v: kwh(v), c: kwh(v) <= base * 0.7 ? "#2e7d32" : "#ef6c00" }], base * 1.6, "#ef6c00", "kWh al mes"),
      resultados: v => [["Energía al mes", fmt(kwh(v), 1) + " kWh", true], ["Costo aproximado al mes", pesos(kwh(v) * v.tar)], ["Ahorro frente al inicio", fmt(Math.max(0, (1 - kwh(v) / base) * 100)) + " %"]],
      cumple: v => kwh(v) <= base * 0.7,
      exito: "¡Ahorraste energía! Menos horas de uso o un aparato más eficiente hacen la diferencia.",
      nota: "Energía (kWh) = potencia (W) × horas ÷ 1.000.",
    }, ctx);
    function kwh(v) { return v.w * v.h * 30 / 1000 * (v.desc ? 0.92 : 1); }
  },

  ahorro(zona, p, ctx) {
    simBase(zona, {
      mision: "Planea un ahorro para reunir $300.000.",
      controles: [
        { id: "m", label: "Ahorro cada mes", min: 5000, max: 100000, step: 5000, val: 20000, fmt: pesos },
        { id: "n", label: "Meses ahorrando", min: 1, max: 24, val: 6, fmt: x => x + " meses" },
        { id: "t", label: "Interés anual de ejemplo de una cuenta de ahorros", min: 0, max: 12, step: 0.5, val: 3, fmt: x => fmt(x, 1) + " %" },
      ],
      dibujar: v => { const s = serie(v); const k = Math.max(1, Math.ceil(s.length / 8)); return svgBarras(s.filter((_, i) => (i + 1) % k === 0 || i === s.length - 1).map(x => ({ l: "M" + x.mes, v: x.total, c: x.total >= 300000 ? "#2e7d32" : "#f9a825" })), Math.max(300000, s[s.length - 1].total) * 1.1, "#f9a825", "Ahorro acumulado"); },
      resultados: v => { const s = serie(v), f = s[s.length - 1]; return [["Total reunido", pesos(f.total), true], ["Lo que tú pusiste", pesos(v.m * v.n)], ["Intereses ganados", pesos(f.total - v.m * v.n)]]; },
      cumple: v => serie(v).slice(-1)[0].total >= 300000,
      exito: "¡Meta alcanzada! Ahorrar un poco cada mes suma mucho.",
      nota: "Las tasas son de ejemplo. Consulta las tasas reales en el banco o la cooperativa.",
    }, ctx);
    function serie(v) { const r = v.t / 100 / 12; let total = 0; const s = []; for (let i = 1; i <= v.n; i++) { total = total * (1 + r) + v.m; s.push({ mes: i, total }); } return s; }
  },

  credito(zona, p, ctx) {
    simBase(zona, {
      mision: "Encuentra un plan de crédito en el que pagues menos de $60.000 de intereses.",
      controles: [
        { id: "monto", label: "Valor del préstamo", min: 100000, max: 2000000, step: 50000, val: 1000000, fmt: pesos },
        { id: "tasa", label: "Interés mensual de ejemplo", min: 0.5, max: 4, step: 0.1, val: 2, fmt: x => fmt(x, 1) + " %" },
        { id: "n", label: "Número de cuotas (meses)", min: 1, max: 36, val: 24, fmt: x => x + " cuotas" },
      ],
      dibujar: v => { const c = calc(v); return svgBarras([{ l: "Préstamo", v: v.monto, c: "#0288d1" }, { l: "Intereses", v: c.intereses, c: c.intereses < 60000 ? "#2e7d32" : "#c62828" }, { l: "Total", v: c.total, c: "#01579b" }], Math.max(c.total, 100000) * 1.1, "#0288d1", "Lo que pagas en total"); },
      resultados: v => { const c = calc(v); return [["Cuota mensual", pesos(c.cuota), true], ["Total pagado", pesos(c.total)], ["Intereses", pesos(c.intereses)]]; },
      cumple: v => calc(v).intereses < 60000,
      exito: "¡Bien! Menos cuotas, una tasa más baja o un préstamo más pequeño reducen los intereses.",
      nota: "Cuota fija calculada con el sistema francés. Tasas de ejemplo.",
    }, ctx);
    function calc(v) { const i = v.tasa / 100; const cuota = i === 0 ? v.monto / v.n : v.monto * i / (1 - Math.pow(1 + i, -v.n)); return { cuota, total: cuota * v.n, intereses: cuota * v.n - v.monto }; }
  },

  presupuesto(zona, p, ctx) {
    simBase(zona, {
      mision: "Organiza el mes de la familia: que alcance el dinero y los servicios se paguen a tiempo.",
      controles: [
        { id: "ing", label: "Ingresos del mes", min: 600000, max: 3000000, step: 50000, val: 1300000, fmt: pesos },
        { id: "serv", label: "Servicios públicos (agua, energía, gas)", min: 50000, max: 400000, step: 10000, val: 180000, fmt: pesos },
        { id: "merc", label: "Mercado", min: 200000, max: 1500000, step: 50000, val: 700000, fmt: pesos },
        { id: "trans", label: "Transporte", min: 0, max: 400000, step: 10000, val: 150000, fmt: pesos },
        { id: "ocio", label: "Gustos y diversión", min: 0, max: 600000, step: 10000, val: 350000, fmt: pesos },
      ],
      interruptores: [{ id: "tiempo", label: "Pagar los servicios antes de la fecha límite", val: false }],
      dibujar: v => { const g = gastos(v); return svgBarras([{ l: "Ingresos", v: v.ing, c: "#0288d1" }, { l: "Gastos", v: g, c: g > v.ing ? "#c62828" : "#f9a825" }, { l: "Sobra", v: Math.max(0, v.ing - g), c: "#2e7d32" }], Math.max(v.ing, g) * 1.1, "#0288d1", "Presupuesto del mes"); },
      resultados: v => { const g = gastos(v); return [["Saldo del mes", pesos(v.ing - g), true], ["Recargo por mora (ejemplo 5 %)", v.tiempo ? "$0" : pesos(v.serv * 0.05)], ["Estado", v.ing - g >= 0 ? "Alcanza" : "No alcanza"]]; },
      cumple: v => v.tiempo && v.ing - gastos(v) >= 0,
      exito: "¡Presupuesto equilibrado y servicios al día!",
      nota: "El recargo por mora es un ejemplo; cada empresa de servicios fija el suyo.",
    }, ctx);
    function gastos(v) { return v.serv * (v.tiempo ? 1 : 1.05) + v.merc + v.trans + v.ocio; }
  },

  planta(zona, p, ctx) {
    simBase(zona, {
      mision: "Haz que la planta crezca sana: busca el riego y la luz adecuados.",
      controles: [
        { id: "agua", label: "Riego", min: 0, max: 10, val: 2, fmt: x => ["Nada", "Muy poco", "Poco", "Poco", "Moderado", "Moderado", "Moderado", "Bastante", "Mucho", "Demasiado", "Inundado"][x] },
        { id: "luz", label: "Horas de luz al día", min: 0, max: 14, val: 3, fmt: x => x + " h" },
        { id: "dias", label: "Días de crecimiento", min: 1, max: 30, val: 10, fmt: x => x + " días" },
      ],
      interruptores: [{ id: "abono", label: "Agregar compost al suelo", val: false }],
      dibujar: v => { const s = salud(v), h = 20 + 140 * s * Math.min(1, v.dias / 20); const hoja = s > 0.6 ? "#43a047" : s > 0.3 ? "#9ccc65" : "#c0ca33";
        return `<svg viewBox="0 0 260 260"><rect width="260" height="260" fill="#e3f2fd"/><circle cx="215" cy="45" r="${10 + v.luz * 1.6}" fill="#ffca28" opacity="${0.3 + v.luz / 20}"/>
          <path d="M70 210h120l-12 40H82z" fill="#a1887f"/><rect x="64" y="200" width="132" height="14" rx="4" fill="#8d6e63"/>
          <rect x="128" y="${205 - h}" width="5" height="${h}" fill="#558b2f"/>
          ${Array.from({ length: Math.max(1, Math.round(h / 28)) }, (_, i) => `<ellipse cx="${i % 2 ? 148 : 113}" cy="${200 - i * 28 - 10}" rx="16" ry="8" fill="${hoja}" transform="rotate(${i % 2 ? -25 : 25} ${i % 2 ? 148 : 113} ${200 - i * 28 - 10})"/>`).join("")}
          ${v.agua >= 9 ? '<rect x="70" y="196" width="120" height="8" fill="#4fc3f7" opacity=".8"/>' : ""}</svg>`; },
      resultados: v => [["Salud de la planta", fmt(salud(v) * 100) + " %", true], ["Diagnóstico", diag(v)]],
      cumple: v => salud(v) >= 0.8 && v.dias >= 15,
      exito: "¡Planta sana y fuerte! Necesita agua, luz y un buen suelo, sin excesos.",
      nota: "Modelo simplificado para aprender: cada especie tiene sus propias necesidades.",
    }, ctx);
    function salud(v) { const a = 1 - Math.abs(v.agua - 5) / 5; const l = Math.min(1, v.luz / 8) * (v.luz > 13 ? 0.9 : 1); return Math.max(0, Math.min(1, (a * 0.5 + l * 0.5) * (v.abono ? 1.1 : 0.95))); }
    function diag(v) { if (v.agua >= 9) return "Demasiada agua: las raíces se ahogan"; if (v.agua <= 1) return "Le falta agua"; if (v.luz < 4) return "Le falta luz"; return salud(v) >= 0.8 ? "Creciendo muy bien" : "Puede mejorar"; }
  },

  erosion(zona, p, ctx) {
    simBase(zona, {
      mision: "Protege la ladera: que se pierda poco suelo aunque llueva fuerte.",
      controles: [
        { id: "lluvia", label: "Intensidad de la lluvia", min: 1, max: 10, val: 8, fmt: x => x <= 3 ? "Suave" : x <= 7 ? "Moderada" : "Aguacero" },
        { id: "arb", label: "Árboles y plantas con raíces en la ladera", min: 0, max: 10, val: 1, fmt: x => x * 10 + " % de cobertura" },
      ],
      interruptores: [{ id: "hoja", label: "Dejar hojarasca sobre el suelo", val: false }],
      dibujar: v => { const e = perdida(v);
        return `<svg viewBox="0 0 260 260"><rect width="260" height="260" fill="#e3f2fd"/>
          ${Array.from({ length: v.lluvia * 4 }, (_, i) => `<path d="M${(i * 37) % 250 + 5} ${(i * 23) % 70 + 10}l-4 10" stroke="#4fc3f7" stroke-width="2"/>`).join("")}
          <path d="M0 110 L260 200 V260 H0z" fill="#8d6e63"/>
          ${Array.from({ length: v.arb }, (_, i) => { const x = 15 + i * 24, y = 110 + x * 90 / 260; return `<g><path d="M${x} ${y}v-26" stroke="#5d4037" stroke-width="4"/><circle cx="${x}" cy="${y - 32}" r="12" fill="#2e7d32"/><path d="M${x} ${y}l-8 14M${x} ${y}l8 14M${x} ${y}v16" stroke="#5d4037" stroke-width="2"/></g>`; }).join("")}
          ${v.hoja ? '<path d="M0 112 L260 202" stroke="#a1887f" stroke-width="6" stroke-dasharray="6 4"/>' : ""}
          <path d="M120 240 Q190 ${250 - e * 30} 260 ${235 - e * 20} V260 H120z" fill="#795548" opacity="${0.3 + e * 0.6}"/>
          <rect x="0" y="235" width="260" height="25" fill="${e > 0.5 ? "#a1887f" : "#4fc3f7"}" opacity=".85"/></svg>`; },
      resultados: v => [["Suelo perdido", fmt(perdida(v) * 100) + " %", true], ["Agua del río", perdida(v) > 0.5 ? "Turbia, llena de tierra" : "Más limpia"]],
      cumple: v => v.lluvia >= 7 && perdida(v) <= 0.3,
      exito: "¡Las raíces sostienen el suelo! Por eso se siembran árboles en las laderas y orillas.",
      nota: "Modelo simplificado: muestra la relación entre cobertura vegetal y erosión.",
    }, ctx);
    function perdida(v) { return Math.max(0, Math.min(1, (v.lluvia / 10) * (1 - v.arb / 11) * (v.hoja ? 0.7 : 1))); }
  },

  filtro(zona, p, ctx) {
    const capas = [["piedras", "Piedras", "#90a4ae", 0.15], ["grava", "Grava", "#bcaaa4", 0.15], ["arena", "Arena", "#ffe082", 0.3], ["carbon", "Carbón", "#424242", 0.2], ["algodon", "Algodón o tela", "#fafafa", 0.15]];
    simBase(zona, {
      mision: "Arma un filtro que deje el agua lo más clara posible (al menos 90 %).",
      interruptores: capas.map(([id, n]) => ({ id, label: "Agregar capa de " + n.toLowerCase(), val: id === "piedras" })),
      dibujar: v => { const c = claridad(v); let y = 60;
        const usadas = capas.filter(([id]) => v[id]);
        return `<svg viewBox="0 0 260 260"><rect width="260" height="260" fill="#f6fbfe"/>
          <path d="M70 20h120l-10 25H80z" fill="#8d6e63" opacity=".8"/><text x="130" y="38" text-anchor="middle" font-size="12" fill="#fff" font-family="Segoe UI, Arial">agua turbia</text>
          <path d="M80 50h100v150H80z" fill="#fff" stroke="#90a4ae" stroke-width="3"/>
          ${usadas.map(([id, n, col]) => { const h = 140 / Math.max(usadas.length, 1); const r = `<rect x="83" y="${y}" width="94" height="${h}" fill="${col}" stroke="#cfd8dc"/><text x="130" y="${y + h / 2 + 4}" text-anchor="middle" font-size="11" fill="${id === "carbon" ? "#fff" : "#37474f"}" font-family="Segoe UI, Arial">${n}</text>`; y += h; return r; }).join("")}
          <path d="M120 200v15" stroke="#90a4ae" stroke-width="4"/>
          <path d="M90 220h80l-8 30h-64z" fill="#fff" stroke="#90a4ae" stroke-width="3"/>
          <path d="M94 232h72l-5 16h-62z" fill="rgb(${Math.round(141 + (79 - 141) * c)},${Math.round(110 + (195 - 110) * c)},${Math.round(99 + (247 - 99) * c)})"/></svg>`; },
      resultados: v => [["Claridad del agua filtrada", fmt(claridad(v) * 100) + " %", true], ["¿Se puede tomar?", "No: falta desinfectarla (hervirla o clorarla)"]],
      cumple: v => claridad(v) >= 0.9,
      exito: "¡Agua clara! Recuerda: el filtro quita la tierra, pero no los microbios.",
      nota: "Un filtro casero no hace potable el agua. Para tomarla hay que hervirla o desinfectarla.",
    }, ctx);
    function claridad(v) { return capas.reduce((s, [id, , , aporte]) => s + (v[id] ? aporte : 0), 0) / 0.95; }
  },

  ciclo(zona, p, ctx) {
    simBase(zona, {
      mision: "Haz que llueva: calienta el agua, forma una nube y enfríala.",
      controles: [
        { id: "sol", label: "Calor del sol", min: 0, max: 10, val: 2, fmt: x => x <= 3 ? "Bajo" : x <= 7 ? "Medio" : "Alto" },
        { id: "frio", label: "Temperatura en lo alto (montaña)", min: 0, max: 10, val: 2, fmt: x => x <= 3 ? "Templada" : x <= 7 ? "Fría" : "Muy fría" },
      ],
      interruptores: [{ id: "viento", label: "Viento que lleva la nube hacia la montaña", val: false }],
      dibujar: v => { const nube = Math.min(1, v.sol / 8); const llueve = lluvia(v);
        return `<svg viewBox="0 0 260 260"><rect width="260" height="260" fill="#e3f2fd"/>
          <circle cx="40" cy="40" r="${14 + v.sol * 1.5}" fill="#ffca28"/>
          <path d="M150 200 L215 90 L260 200z" fill="#8d6e63"/><path d="M200 115 L215 90 L230 115z" fill="#fff"/>
          <rect y="200" width="260" height="60" fill="#4fc3f7"/>
          ${Array.from({ length: v.sol }, (_, i) => `<path d="M${30 + i * 12} 195 q4 -10 0 -20 q-4 -10 0 -20" stroke="#81d4fa" stroke-width="2" fill="none" opacity=".8"/>`).join("")}
          <g transform="translate(${v.viento ? 120 : 40} 0)" style="transition:transform .6s">
            <g opacity="${0.2 + nube * 0.8}"><ellipse cx="60" cy="70" rx="${20 + nube * 25}" ry="${10 + nube * 12}" fill="${llueve ? "#78909c" : "#fff"}"/><ellipse cx="85" cy="62" rx="${14 + nube * 18}" ry="${10 + nube * 10}" fill="${llueve ? "#78909c" : "#fff"}"/></g>
            ${llueve ? Array.from({ length: 10 }, (_, i) => `<path d="M${42 + i * 6} 95l-3 14" stroke="#0288d1" stroke-width="2"/>`).join("") : ""}
          </g></svg>`; },
      resultados: v => [["Evaporación", v.sol >= 6 ? "Alta" : v.sol >= 3 ? "Media" : "Baja", true], ["Condensación", v.frio >= 6 && v.viento ? "La nube se enfría y se condensa" : "Poca"], ["Precipitación", lluvia(v) ? "¡Está lloviendo!" : "Todavía no llueve"]],
      cumple: v => lluvia(v),
      exito: "¡Llueve! Evaporación, condensación y precipitación: así se mueve el agua.",
      nota: "Las montañas obligan a las nubes a subir y enfriarse; por eso llueve tanto en las laderas andinas.",
    }, ctx);
    function lluvia(v) { return v.sol >= 6 && v.frio >= 6 && v.viento; }
  },

  residuos(zona, p, ctx) {
    simBase(zona, {
      mision: "Logra que menos del 30 % de los residuos de tu grupo vaya al relleno sanitario.",
      controles: [
        { id: "per", label: p.grupo || "Personas", min: 1, max: 40, val: p.personas || 5, fmt: x => x + " personas" },
        { id: "kg", label: "Residuos por persona al día", min: 0.1, max: 1.5, step: 0.05, val: 0.6, fmt: x => fmt(x, 2) + " kg", ayuda: "Valor de ejemplo: puedes pesar la basura de un día en casa o en el colegio." },
        { id: "sep", label: "Aprovechables separados (plástico, papel, vidrio, metal)", min: 0, max: 100, step: 5, val: 10, fmt: x => x + " %" },
        { id: "comp", label: "Orgánicos convertidos en compost", min: 0, max: 100, step: 5, val: 0, fmt: x => x + " %" },
      ],
      dibujar: v => { const r = calc(v); return svgBarras([{ l: "Relleno", v: r.relleno, c: r.relleno / r.total < 0.3 ? "#2e7d32" : "#455a64" }, { l: "Reciclaje", v: r.recicla, c: "#64b5f6" }, { l: "Compost", v: r.compost, c: "#66bb6a" }], r.total * 1.05, "#455a64", "kg por semana"); },
      resultados: v => { const r = calc(v); return [["Al relleno sanitario", fmt(r.relleno, 1) + " kg/semana (" + fmt(r.relleno / r.total * 100) + " %)", true], ["A reciclaje", fmt(r.recicla, 1) + " kg/semana"], ["A compost", fmt(r.compost, 1) + " kg/semana"]]; },
      cumple: v => { const r = calc(v); return r.relleno / r.total < 0.3; },
      exito: "¡Muy bien! Separar y compostar evita que la basura llegue al relleno y a los ríos.",
      nota: "Ejemplo de composición: la mitad orgánico, un tercio aprovechable y el resto no aprovechable.",
    }, ctx);
    function calc(v) { const total = v.per * v.kg * 7; const org = total * 0.5, apr = total * 0.33; const compost = org * v.comp / 100, recicla = apr * v.sep / 100; return { total, compost, recicla, relleno: total - compost - recicla }; }
  },

  impacto(zona, p, ctx) {
    simBase(zona, {
      mision: `Reduce a menos de la mitad ${p.objeto} que usa tu familia en un año.`,
      controles: [
        { id: "sem", label: `${p.Objeto} por semana`, min: 0, max: p.max || 30, val: p.val || 10, fmt: x => x + " " + p.unidad },
        { id: "reu", label: "Las reemplazo por una alternativa reutilizable", min: 0, max: 100, step: 10, val: 0, fmt: x => x + " %" },
      ],
      dibujar: v => { const anio = v.sem * 52, ahora = anio * (1 - v.reu / 100); return svgBarras([{ l: "Sin cambios", v: anio, c: "#b0bec5" }, { l: "Con cambios", v: ahora, c: ahora < anio / 2 ? "#2e7d32" : "#ef6c00" }], Math.max(anio, 1) * 1.1, "#ef6c00", p.Objeto + " al año"); },
      resultados: v => [["Al año", fmt(v.sem * 52 * (1 - v.reu / 100)) + " " + p.unidad, true], ["Evitadas", fmt(v.sem * 52 * v.reu / 100) + " " + p.unidad], ["Alternativa", p.alternativa]],
      cumple: v => v.sem > 0 && v.reu >= 50,
      exito: "¡Gran cambio! Cada objeto que no se desecha es un residuo menos.",
      nota: p.nota || "Reducir y reutilizar es mejor que reciclar.",
    }, ctx);
  },

  biodiversidad(zona, p, ctx) {
    const especies = ["🦋", "🐝", "🐞", "🐦", "🐛", "🐸", "🐜", "🕷️", "🐌", "🦎", "🪲", "🐿️"];
    simBase(zona, {
      mision: "Crea un lugar donde vivan al menos 9 especies diferentes.",
      controles: [
        { id: "plantas", label: "Plantas nativas y flores", min: 0, max: 10, val: 2, fmt: x => x + " de 10" },
        { id: "agua", label: "Humedad y agua disponible", min: 0, max: 10, val: 3, fmt: x => x + " de 10" },
        { id: "sombra", label: "Sombra (árboles, arbustos)", min: 0, max: 10, val: 2, fmt: x => x + " de 10" },
      ],
      interruptores: [{ id: "quim", label: "Usar venenos e insecticidas", val: true }, { id: "hoja", label: "Dejar hojarasca y troncos viejos", val: false }],
      dibujar: v => { const n = cuantas(v);
        return `<svg viewBox="0 0 260 260"><rect width="260" height="260" fill="#e8f5e9"/><rect y="190" width="260" height="70" fill="#a1887f"/>
          ${v.agua >= 5 ? '<ellipse cx="190" cy="205" rx="45" ry="12" fill="#4fc3f7"/>' : ""}
          ${Array.from({ length: v.sombra }, (_, i) => `<circle cx="${20 + i * 25}" cy="${60 + (i % 3) * 12}" r="22" fill="#66bb6a" opacity=".7"/>`).join("")}
          ${Array.from({ length: v.plantas }, (_, i) => `<g><path d="M${15 + i * 24} 190v-25" stroke="#558b2f" stroke-width="3"/><circle cx="${15 + i * 24}" cy="162" r="6" fill="${["#e91e63", "#ffeb3b", "#ab47bc", "#ff7043"][i % 4]}"/></g>`).join("")}
          ${v.hoja ? '<rect x="20" y="194" width="60" height="8" rx="4" fill="#6d4c41"/><path d="M100 196h50" stroke="#8d6e63" stroke-width="5" stroke-dasharray="4 3"/>' : ""}
          ${especies.slice(0, n).map((e, i) => `<text x="${25 + (i % 6) * 40}" y="${110 + Math.floor(i / 6) * 50}" font-size="24">${e}</text>`).join("")}</svg>`; },
      resultados: v => [["Especies observadas", String(cuantas(v)), true], ["Pista", v.quim ? "Los venenos alejan a muchos animales" : cuantas(v) < 9 ? "Prueba con más plantas, agua o sombra" : "¡Un ecosistema diverso!"]],
      cumple: v => cuantas(v) >= 9,
      exito: "¡Biodiversidad! Plantas, agua, sombra y nada de venenos atraen la vida.",
      nota: "Modelo simplificado para observar la relación entre hábitat y especies.",
    }, ctx);
    function cuantas(v) { return Math.max(0, Math.min(12, Math.round((v.plantas + v.agua + v.sombra) / 2.5 + (v.hoja ? 2 : 0) - (v.quim ? 4 : 0)))); }
  },
};

/* ---------- Asignación de simulador por título ---------- */
const APARATOS = [
  ["ducha", "la ducha eléctrica", 3500, 0.5], ["calentador", "el calentador", 1500, 1], ["secador", "el secador de pelo", 1200, 0.3], ["horno", "el horno eléctrico", 2000, 0.5],
  ["aspiradora", "la aspiradora", 1000, 0.5], ["halógena", "la lámpara halógena", 50, 5], ["fluorescente", "la lámpara fluorescente", 20, 6], ["lavadora", "la lavadora", 500, 1],
  ["cafetera", "la cafetera", 800, 0.5], ["plancha", "la plancha", 1000, 1], ["microondas", "el microondas", 1000, 0.3], ["nevera", "la nevera (consumo promedio)", 150, 24],
  ["computador", "el computador", 120, 6], ["televisor", "el televisor", 100, 5], ["ventilador", "el ventilador", 50, 8], ["bombillo", "el bombillo", 60, 6], ["cargador", "el cargador", 5, 12],
];
const OBJETOS = [
  ["bolsa", "las bolsas plásticas", "Bolsas plásticas", "bolsas", "Bolsa de tela o canasto", 15],
  ["vidrio", "los envases de vidrio que se botan", "Envases de vidrio", "envases", "Reutilizar frascos o llevarlos a reciclaje", 5],
  ["lata", "las latas", "Latas", "latas", "Envases retornables o termo", 8],
  ["pila", "las pilas desechables", "Pilas", "pilas", "Pilas recargables (y llevar las usadas a puntos de recolección)", 4, "Las pilas nunca van a la basura común: se llevan a puntos de recolección."],
  ["botella", "las botellas desechables", "Botellas desechables", "botellas", "Termo o botella reutilizable", 10],
  ["papel", "las hojas de papel", "Hojas de papel", "hojas", "Usar las dos caras y reutilizar hojas", 30],
  ["cartón", "las cajas de cartón", "Cajas de cartón", "cajas", "Reutilizar cajas para guardar cosas", 5],
  ["envase", "los envases desechables", "Envases desechables", "envases", "Recipientes reutilizables", 12],
  ["aerosol", "los aerosoles", "Aerosoles", "aerosoles", "Atomizadores recargables", 2],
  ["detergente", "los empaques de detergente", "Empaques de detergente", "empaques", "Presentaciones grandes o recargas", 3],
  ["ropa", "las prendas que se botan", "Prendas que se botan", "prendas", "Donar, reparar o intercambiar ropa", 2],
  ["juguete", "los juguetes que se botan", "Juguetes que se botan", "juguetes", "Donar, reparar o intercambiar juguetes", 2],
  ["mueble", "los muebles que se botan", "Muebles que se botan", "muebles", "Reparar o restaurar muebles", 1],
  ["plástico", "los plásticos de un solo uso", "Plásticos de un solo uso", "objetos", "Alternativas reutilizables", 20],
];

function simuladorPara(act) {
  const t = act.titulo.toLowerCase();
  if (!/mini experimento/.test(t)) return null;
  const e = act.eje;
  const accion = (act.titulo.split(":")[1] || "").replace(/^\s*agua y\s*/i, "").replace(/^ahorro (en|con)\s*/i, "").trim().toLowerCase() || "lavarse";
  if (e === "energia" && /consumo de/.test(t)) {
    const a = APARATOS.find(([k]) => t.includes(k)) || ["", "el aparato", 100, 4];
    return { tipo: "energia", p: { aparato: a[1], w: a[2], horas: a[3] } };
  }
  if (e === "pago-servicios") {
    if (/inter[eé]s|cr[eé]dito|pr[eé]stamo|cuota/.test(t)) return { tipo: "credito", p: {} };
    if (/ahorro/.test(t)) return { tipo: "ahorro", p: {} };
    return { tipo: "presupuesto", p: {} };
  }
  if (e === "reforestacion") return { tipo: /ra[ií]ces/.test(t) ? "erosion" : "planta", p: {} };
  if (e === "biodiversidad") return { tipo: "biodiversidad", p: {} };
  if (e === "residuos-solidos" || (e === "huella-ecologica" && !/impacto|reutilizaci/.test(t))) {
    const escolar = /escolar|recreo|cafeter|almuerzo|deportiva|fiesta/.test(t);
    return { tipo: "residuos", p: escolar ? { grupo: "Estudiantes del grupo", personas: 30 } : { grupo: "Personas en la casa", personas: 5 } };
  }
  if (e === "huella-ecologica") {
    const o = OBJETOS.find(([k]) => t.includes(k));
    if (o) return { tipo: "impacto", p: { objeto: o[1], Objeto: o[2], unidad: o[3], alternativa: o[4], val: o[5], max: Math.max(10, o[5] * 3), nota: o[6] } };
    return { tipo: "residuos", p: { grupo: "Personas en la casa", personas: 5 } };
  }
  if (e === "fuentes-hidricas" || e === "acueducto" || e === "ahorro-agua") {
    if (/evapora|condensa|ciclo|desalin|temperatura|congela/.test(t)) return { tipo: "ciclo", p: {} };
    if (/filtra|sediment|purifica|carb[oó]n|arena|piedra|algod[oó]n/.test(t)) return { tipo: "filtro", p: {} };
    if (/goteo|gotea/.test(t)) return { tipo: "goteo", p: {} };
    if (/riego|regadera|plantas/.test(t)) return { tipo: "riego", p: {} };
    if (/ducha|lav|ahorro|balde|litros|cocina|cepillo|manos/.test(t)) {
      const ducha = /ducha|litros en/.test(t);
      return { tipo: "agua", p: { accion: ducha ? "la ducha" : accion, minutos: ducha ? 15 : 8, caudal: 8, personas: 4, maxMin: 30 } };
    }
  }
  return null;
}
