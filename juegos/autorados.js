/* =========================================================================
   JUEGOS AUTORADOS: contenido gráfico escrito para actividades cuyo título
   promete un juego ("Drag drop…") pero que en Firestore solo tenían
   preguntas o instrucciones para el profesor. Se buscan por el id de la
   actividad. Si la actividad tiene preguntas, se juegan después como
   Ruta del Defensor.
   ========================================================================= */
const AUTORADOS = {
  "ruta-agua-21": {
    tipo: "arrastrar",
    instruccion: "Arrastra cada situación a la llave correcta: ¿debe estar abierta o cerrada?",
    zonas: [
      { id: "abierta", nombre: "Llave abierta", emoji: "🚰💧", color: "#0288d1" },
      { id: "cerrada", nombre: "Llave cerrada", emoji: "🚰✋", color: "#2e7d32" },
    ],
    items: [
      { texto: "Mientras te enjabonas las manos", emoji: "🧼", zona: "cerrada" },
      { texto: "Para enjuagar el jabón", emoji: "👐", zona: "abierta" },
      { texto: "Mientras te cepillas los dientes", emoji: "🪥", zona: "cerrada" },
      { texto: "Para llenar el vaso de enjuague", emoji: "🥛", zona: "abierta" },
      { texto: "Mientras te enjabonas en la ducha", emoji: "🚿", zona: "cerrada" },
      { texto: "Mientras enjabonas la loza", emoji: "🍽️", zona: "cerrada" },
      { texto: "Cuando nadie usa el lavamanos", emoji: "🚪", zona: "cerrada" },
    ],
    dato: "Abrir la llave solo cuando la necesitas es uno de los hábitos que más agua ahorra en la casa.",
  },
  "ordena-duchas-01": {
    tipo: "ordenar",
    instruccion: "Ordena las duchas de la que gasta menos agua a la que gasta más.",
    pasos: [
      { texto: "Ducha de 3 minutos", icono: "grifo" },
      { texto: "Ducha de 5 minutos", icono: "grifo" },
      { texto: "Ducha de 10 minutos", icono: "grifo" },
      { texto: "Ducha de 15 minutos", icono: "grifo" },
    ],
    dato: "Cada minuto de ducha gasta varios litros de agua. Cerrar la llave mientras te enjabonas ayuda mucho.",
  },
  "dragdrop-plato-saludable-01": {
    tipo: "arrastrar", diagrama: "plato",
    instruccion: "Arrastra cada alimento a su lugar en el plato saludable. El agua va en el vaso.",
    zonas: [
      { id: "frutas", nombre: "Frutas", x: 90, y: 70, w: 150, h: 120 },
      { id: "verduras", nombre: "Verduras", x: 250, y: 70, w: 150, h: 120 },
      { id: "cereales", nombre: "Cereales", x: 90, y: 200, w: 150, h: 120 },
      { id: "proteinas", nombre: "Proteínas", x: 250, y: 200, w: 150, h: 120 },
      { id: "agua", nombre: "Agua", x: 455, y: 120, w: 110, h: 170 },
    ],
    items: [
      { texto: "Manzana", emoji: "🍎", zona: "frutas" },
      { texto: "Banano", emoji: "🍌", zona: "frutas" },
      { texto: "Zanahoria", emoji: "🥕", zona: "verduras" },
      { texto: "Brócoli", emoji: "🥦", zona: "verduras" },
      { texto: "Arroz", emoji: "🍚", zona: "cereales" },
      { texto: "Arepa de maíz", emoji: "🫓", zona: "cereales" },
      { texto: "Pollo", emoji: "🍗", zona: "proteinas" },
      { texto: "Huevo", emoji: "🥚", zona: "proteinas" },
      { texto: "Agua", emoji: "💧", zona: "agua" },
    ],
    dato: "Un plato saludable tiene variedad: frutas, verduras, cereales y proteínas, acompañados de agua.",
  },
  "dragdrop-temporada-01": {
    tipo: "arrastrar",
    instruccion: "Arrastra cada alimento al grupo al que pertenece.",
    zonas: [
      { id: "fruta", nombre: "Frutas", emoji: "🍊", color: "#ef6c00" },
      { id: "verdura", nombre: "Verduras y hortalizas", emoji: "🥬", color: "#2e7d32" },
      { id: "tuberculo", nombre: "Tubérculos y raíces", emoji: "🥔", color: "#6d4c41" },
    ],
    items: [
      { texto: "Mango", emoji: "🥭", zona: "fruta" },
      { texto: "Mora", emoji: "🫐", zona: "fruta" },
      { texto: "Piña", emoji: "🍍", zona: "fruta" },
      { texto: "Tomate de árbol", emoji: "🍅", zona: "fruta" },
      { texto: "Lechuga", emoji: "🥬", zona: "verdura" },
      { texto: "Habichuela", emoji: "🫛", zona: "verdura" },
      { texto: "Cebolla", emoji: "🧅", zona: "verdura" },
      { texto: "Papa", emoji: "🥔", zona: "tuberculo" },
      { texto: "Yuca", emoji: "🍠", zona: "tuberculo" },
      { texto: "Arracacha", emoji: "🥕", zona: "tuberculo" },
    ],
    dato: "Comprar frutas y verduras cultivadas cerca de tu vereda reduce el transporte y apoya a los campesinos.",
  },
  "dragdrop-habitats-01": {
    tipo: "arrastrar",
    instruccion: "Arrastra cada especie a su hábitat en Colombia.",
    zonas: [
      { id: "bosque", nombre: "Bosque húmedo", emoji: "🌳", color: "#2e7d32" },
      { id: "rio", nombre: "Ríos y ciénagas", emoji: "🏞️", color: "#0288d1" },
      { id: "paramo", nombre: "Páramo", emoji: "⛰️", color: "#6d4c41" },
      { id: "mar", nombre: "Mar", emoji: "🌊", color: "#01579b" },
    ],
    items: [
      { texto: "Jaguar", emoji: "🐆", zona: "bosque" },
      { texto: "Tucán", emoji: "🐦", zona: "bosque" },
      { texto: "Mono aullador", emoji: "🐒", zona: "bosque" },
      { texto: "Bagre", emoji: "🐟", zona: "rio" },
      { texto: "Babilla", emoji: "🐊", zona: "rio" },
      { texto: "Frailejón", emoji: "🌿", zona: "paramo" },
      { texto: "Cóndor de los Andes", emoji: "🦅", zona: "paramo" },
      { texto: "Ballena jorobada", emoji: "🐋", zona: "mar" },
      { texto: "Tortuga marina", emoji: "🐢", zona: "mar" },
    ],
    dato: "Los páramos son como esponjas: guardan el agua que después alimenta ríos y acueductos.",
  },
  "dragdrop-cadenas-alimenticias-01": {
    tipo: "ordenar",
    instruccion: "Ordena la cadena alimenticia: ¿quién se come a quién? Empieza por el productor.",
    pasos: [
      { texto: "🌿 Planta (productor: hace su alimento con la luz del sol)" },
      { texto: "🦗 Saltamontes (consumidor primario: come plantas)" },
      { texto: "🐸 Rana (consumidor secundario: come insectos)" },
      { texto: "🐍 Serpiente (consumidor terciario: come ranas)" },
      { texto: "🦅 Águila (depredador tope)" },
    ],
    dato: "La energía pasa del sol a las plantas y de ahí a cada animal de la cadena. Si falta un eslabón, toda la cadena se afecta.",
  },
  "dragdrop-habitos-responsables-01": {
    tipo: "arrastrar",
    instruccion: "Arrastra cada acción: ¿ahorra energía o la desperdicia?",
    zonas: [
      { id: "ahorra", nombre: "Ahorra energía", emoji: "✅", color: "#2e7d32" },
      { id: "desperdicia", nombre: "Desperdicia energía", emoji: "❌", color: "#c62828" },
    ],
    items: [
      { texto: "Apagar la luz al salir del cuarto", emoji: "💡", zona: "ahorra" },
      { texto: "Desconectar el cargador cuando no se usa", emoji: "🔌", zona: "ahorra" },
      { texto: "Abrir las cortinas y aprovechar la luz del sol", emoji: "☀️", zona: "ahorra" },
      { texto: "Usar bombillos LED", emoji: "💡", zona: "ahorra" },
      { texto: "Dejar el televisor prendido sin verlo", emoji: "📺", zona: "desperdicia" },
      { texto: "Abrir la nevera muchas veces", emoji: "🧊", zona: "desperdicia" },
      { texto: "Dejar el computador prendido toda la noche", emoji: "💻", zona: "desperdicia" },
      { texto: "Planchar una sola prenda cada vez", emoji: "👕", zona: "desperdicia" },
    ],
    dato: "Planchar toda la ropa de una vez gasta menos energía que calentar la plancha muchas veces.",
  },
  "dragdrop-contaminantes-01": {
    tipo: "arrastrar",
    instruccion: "Arrastra cada fuente de contaminación a lo que más contamina: el agua, el aire o el suelo.",
    zonas: [
      { id: "agua", nombre: "Agua", emoji: "💧", color: "#0288d1" },
      { id: "aire", nombre: "Aire", emoji: "💨", color: "#78909c" },
      { id: "suelo", nombre: "Suelo", emoji: "🟫", color: "#6d4c41" },
    ],
    items: [
      { texto: "Aguas negras sin tratar que llegan a la quebrada", emoji: "🚽", zona: "agua" },
      { texto: "Aceite de cocina vertido por el desagüe", emoji: "🛢️", zona: "agua" },
      { texto: "Lavar fumigadoras en el río", emoji: "🧴", zona: "agua" },
      { texto: "Humo de quemas agrícolas", emoji: "🔥", zona: "aire" },
      { texto: "Gases de vehículos y motos", emoji: "🏍️", zona: "aire" },
      { texto: "Quema de llantas o plásticos", emoji: "🛞", zona: "aire" },
      { texto: "Botaderos de basura a cielo abierto", emoji: "🗑️", zona: "suelo" },
      { texto: "Pilas y baterías tiradas en la tierra", emoji: "🔋", zona: "suelo" },
    ],
    dato: "Lo que contamina el suelo también termina en el agua: la lluvia arrastra los residuos hacia ríos y acuíferos.",
  },
  "dragdrop-buenas-practicas-01": {
    tipo: "arrastrar",
    instruccion: "Arrastra cada acción: ¿protege la fuente de agua o la daña?",
    zonas: [
      { id: "protege", nombre: "Protege la fuente", emoji: "🛡️", color: "#2e7d32" },
      { id: "dana", nombre: "Daña la fuente", emoji: "⚠️", color: "#c62828" },
    ],
    items: [
      { texto: "Sembrar árboles nativos en la orilla", emoji: "🌳", zona: "protege" },
      { texto: "Organizar jornadas de limpieza", emoji: "🧹", zona: "protege" },
      { texto: "Recoger el aceite usado en una botella", emoji: "🍶", zona: "protege" },
      { texto: "Tener pozo séptico en la vivienda", emoji: "🏠", zona: "protege" },
      { texto: "Talar los árboles de la ronda del río", emoji: "🪓", zona: "dana" },
      { texto: "Verter las aguas mieles del café sin tratar", emoji: "☕", zona: "dana" },
      { texto: "Dejar que el ganado pisotee el nacimiento", emoji: "🐄", zona: "dana" },
      { texto: "Botar basura en la quebrada", emoji: "🗑️", zona: "dana" },
    ],
    dato: "La ronda del río es la franja de vegetación que lo protege: evita la erosión y filtra la contaminación.",
  },
  "dragdrop-alternativas-sostenibles-01": {
    tipo: "arrastrar",
    instruccion: "Arrastra cada alternativa sostenible encima del producto de un solo uso que reemplaza.",
    zonas: [
      { id: "bolsa", nombre: "Bolsa plástica", emoji: "🛍️", color: "#78909c" },
      { id: "botella", nombre: "Botella desechable", emoji: "🧴", color: "#78909c" },
      { id: "pitillo", nombre: "Pitillo plástico", emoji: "🥤", color: "#78909c" },
      { id: "vaso", nombre: "Vaso de icopor", emoji: "🥛", color: "#78909c" },
      { id: "cubiertos", nombre: "Cubiertos desechables", emoji: "🍴", color: "#78909c" },
    ],
    items: [
      { texto: "Bolsa de tela", emoji: "👜", zona: "bolsa" },
      { texto: "Termo o botella reutilizable", emoji: "🍶", zona: "botella" },
      { texto: "No usar pitillo", emoji: "🚫", zona: "pitillo" },
      { texto: "Pocillo o vaso propio", emoji: "☕", zona: "vaso" },
      { texto: "Cubiertos de la casa", emoji: "🥄", zona: "cubiertos" },
    ],
    dato: "El mejor residuo es el que no se genera: reutilizar evita que los plásticos de un solo uso lleguen a ríos y mares.",
  },
  "dragdrop-tiempo-degradacion-01": {
    tipo: "ordenar",
    instruccion: "Ordena los residuos del que tarda menos en degradarse al que tarda más (tiempos aproximados).",
    pasos: [
      { texto: "Cáscara de fruta: semanas", icono: "banano" },
      { texto: "Hoja de papel: meses", icono: "papel" },
      { texto: "Lata de aluminio: cerca de 200 años", icono: "lata" },
      { texto: "Botella plástica: cientos de años", icono: "botella" },
      { texto: "Botella de vidrio: miles de años", icono: "botella" },
    ],
    dato: "Los tiempos son aproximados y dependen del sol, la humedad y el suelo. El vidrio casi no se degrada, pero se puede reciclar muchas veces.",
  },
  "dragdrop-prioridades-01": {
    tipo: "arrastrar",
    instruccion: "Arrastra cada gasto de la familia: ¿es una necesidad básica que se paga primero o puede esperar?",
    zonas: [
      { id: "basica", nombre: "Necesidad básica: pagar primero", emoji: "🏠", color: "#0288d1" },
      { id: "espera", nombre: "Puede esperar", emoji: "⏳", color: "#f9a825" },
    ],
    items: [
      { texto: "Factura del agua", emoji: "🚰", zona: "basica" },
      { texto: "Factura de la energía", emoji: "💡", zona: "basica" },
      { texto: "Mercado de la semana", emoji: "🛒", zona: "basica" },
      { texto: "Gas para cocinar", emoji: "🔥", zona: "basica" },
      { texto: "Videojuego nuevo", emoji: "🎮", zona: "espera" },
      { texto: "Golosinas", emoji: "🍬", zona: "espera" },
      { texto: "Ropa de moda", emoji: "👟", zona: "espera" },
      { texto: "Salida a cine", emoji: "🎬", zona: "espera" },
    ],
    dato: "Pagar primero los servicios públicos evita recargos, cortes y costos de reconexión.",
  },
  "dragdrop-partes-arbol-01": {
    tipo: "arrastrar", diagrama: "arbol",
    instruccion: "Arrastra cada etiqueta a la parte del árbol que describe.",
    zonas: [
      { id: "hojas", nombre: "", x: 180, y: 25, w: 160, h: 85 },
      { id: "fruto", nombre: "", x: 360, y: 90, w: 95, h: 80 },
      { id: "ramas", nombre: "", x: 105, y: 140, w: 120, h: 55 },
      { id: "tronco", nombre: "", x: 225, y: 200, w: 70, h: 110 },
      { id: "raices", nombre: "", x: 150, y: 320, w: 220, h: 60 },
    ],
    items: [
      { texto: "Hojas: hacen la fotosíntesis", emoji: "🍃", zona: "hojas" },
      { texto: "Fruto: protege las semillas", emoji: "🍊", zona: "fruto" },
      { texto: "Ramas: sostienen hojas y frutos", emoji: "🌿", zona: "ramas" },
      { texto: "Tronco: transporta agua y nutrientes", emoji: "🪵", zona: "tronco" },
      { texto: "Raíces: absorben agua y sostienen el árbol", emoji: "🌱", zona: "raices" },
    ],
    dato: "Las raíces de los árboles sujetan el suelo de las orillas y evitan que los ríos se llenen de tierra.",
  },
};

const DIAGRAMAS = {
  plato: { vb: "0 0 600 390", dibujo: `
    <rect width="600" height="390" fill="#fffde7"/>
    <ellipse cx="245" cy="200" rx="185" ry="175" fill="#fff" stroke="#b0bec5" stroke-width="5"/>
    <ellipse cx="245" cy="200" rx="160" ry="150" fill="#fafafa" stroke="#eceff1" stroke-width="3"/>
    <path d="M245 52v296M88 200h314" stroke="#cfd8dc" stroke-width="4"/>
    <path d="M150 85a160 150 0 0 1 95-35v150H88a160 150 0 0 1 62-115z" fill="#ffebee"/>
    <path d="M245 50a160 150 0 0 1 157 150H245z" fill="#e8f5e9"/>
    <path d="M88 200h157v148a160 150 0 0 1-157-148z" fill="#fff8e1"/>
    <path d="M245 200h157a160 150 0 0 1-157 148z" fill="#efebe9"/>
    <path d="M465 110h90l-12 190h-66z" fill="#e1f5fe" stroke="#81d4fa" stroke-width="4"/>
    <path d="M470 170h80l-8 125h-64z" fill="#4fc3f7" opacity=".7"/>` },
  arbol: { vb: "0 0 520 390", dibujo: `
    <rect width="520" height="390" fill="#e3f2fd"/>
    <rect y="300" width="520" height="90" fill="#a1887f"/>
    <path d="M250 300c-30 20-60 30-95 40M262 300c10 25 40 40 90 45M256 305c0 20-5 40-15 60M240 300c-40 5-70 0-100 10M270 302c35 0 70 5 100 20" stroke="#6d4c41" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M238 300V180h44v120z" fill="#795548"/>
    <path d="M245 190c-30-20-60-35-110-45M275 185c30-25 60-40 110-50M260 180V120" stroke="#795548" stroke-width="12" stroke-linecap="round" fill="none"/>
    <ellipse cx="260" cy="85" rx="150" ry="70" fill="#43a047"/>
    <ellipse cx="160" cy="130" rx="60" ry="40" fill="#66bb6a"/>
    <ellipse cx="380" cy="125" rx="65" ry="42" fill="#66bb6a"/>
    <circle cx="405" cy="135" r="14" fill="#ff9800"/><circle cx="380" cy="150" r="12" fill="#ff9800"/><circle cx="425" cy="155" r="11" fill="#ff9800"/>` },
};
