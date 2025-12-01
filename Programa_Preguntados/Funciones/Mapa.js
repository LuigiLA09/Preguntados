/* =========================================================
   📍 MODO MAPA — Estado de México y Morelos (Versión final sincronizada)
   =========================================================
   Controla el mapa del modo historia:
   ✅ Carga progreso guardado (localStorage)
   ✅ Renderiza mapa según estado y dificultad
   ✅ Dibuja rieles y puntos de niveles
   ✅ Sincroniza progreso con Niveles.js / Historia.js
   ✅ Permite regresar al menú principal
   ========================================================= */

import { cargarMenuPrincipal } from "./Preguntados.js";
import { cargarNivel } from "./Niveles.js";

/* =========================================================
   🌍 CONFIGURACIÓN GLOBAL
   ========================================================= */
const MAP_EDOMEX_IMG = "./Imagenes/Estado de Mexico.jpg";
const MAP_MORELOS_IMG = "./Imagenes/Morelos.jpg";

/* =========================================================
   📦 FUNCIÓN DE CARGA DE PROGRESO
   ========================================================= */
function getProgreso(dificultad) {
  try {
    const data = JSON.parse(localStorage.getItem("preguntados_historia_progreso") || "{}");
    return data[dificultad] || {};
  } catch {
    return {};
  }
}

/* =========================================================
   🧭 FUNCIÓN PRINCIPAL — MOSTRAR MAPA
   ========================================================= */
export function mostrarMapa(main, dificultad, estado = "Estado de México") {
  const header = document.querySelector("header");
  if (header) header.classList.add("oculto-historia");

  // 🔹 Cargar progreso guardado
  const progreso = getProgreso(dificultad);
  const progresoEstado = progreso[estado] || {
    preguntasCorrectasTotales: 0,
    porcentajeEstado: 0,
    niveles: {},
  };

  // 🔹 Determinar imagen del mapa
  const mapaFondo = estado === "Estado de México" ? MAP_EDOMEX_IMG : MAP_MORELOS_IMG;

  // 🔹 Interfaz HTML principal
  main.innerHTML = `
    <div class="mapa-wrapper fade-in">
      <div class="mapa-container">
        <img class="mapa-fondo" src="${mapaFondo}" alt="Mapa ${estado}">
        <div id="rieles-container"></div>
        <div id="niveles-container"></div>

        <div class="hud-mapa">
          <h2>${estado} — ${capitalizar(dificultad)}</h2>
          <p>Progreso: ${Object.keys(progresoEstado.niveles).length}/8 niveles</p>
          <p>Correctas: ${progresoEstado.preguntasCorrectasTotales}/40</p>
          <p>Avance total: ${progresoEstado.porcentajeEstado.toFixed(1)}%</p>
        </div>
      </div>

      <button id="btnVolverMenu" class="btn-volver">← Menú Principal</button>
    </div>
  `;

  // 🔹 Inicialización
  const fondo = main.querySelector(".mapa-fondo");
  const start = () => setTimeout(() => inicializarNiveles(main, estado, dificultad), 600);

  if (fondo.complete) start();
  else fondo.addEventListener("load", start, { once: true });

  // 🔹 Regresar al menú principal
  const btnVolver = main.querySelector("#btnVolverMenu");
  btnVolver.addEventListener("click", () => {
    main.classList.add("fade-out");
    setTimeout(() => {
      main.classList.remove("fade-out");
      main.innerHTML = "";
      if (header) header.classList.remove("oculto-historia");
      cargarMenuPrincipal(main);
    }, 400);
  });
}

/* =========================================================
   🧩 FUNCIÓN — INICIALIZAR NIVELES Y RIELES
   ========================================================= */
function inicializarNiveles(main, estado, dificultad) {
  const niveles = estado === "Estado de México" ? nivelesEdoMex() : nivelesMorelos();
  const contNiveles = main.querySelector("#niveles-container");
  const contRieles = main.querySelector("#rieles-container");
  const progreso = getProgreso(dificultad)[estado]?.niveles || {};

  // 🧭 Crear tooltip
  const tooltip = document.createElement("div");
  tooltip.classList.add("tooltip-nivel");
  contNiveles.appendChild(tooltip);

  niveles.forEach((nivel, i) => {
    const el = document.createElement("div");
    el.classList.add(nivel.opcional ? "nivel-opcional" : "nivel");
    el.style.top = `${nivel.top}%`;
    el.style.left = `${nivel.left}%`;
    el.dataset.titulo = nivel.titulo;

    // 🔒 Bloqueos y desbloqueos
    const nivelPrevio = niveles[i - 1];
    const completadoPrevio =
      i === 0 || (nivelPrevio && progreso[nivelPrevio.titulo]?.completado);

    const nivel5Completado =
      progreso["Nivel 5 - Ecatepec de Morelos"]?.completado ||
      progreso["Nivel 5 - Amacuzac"]?.completado;

    if (nivel.opcional && !nivel5Completado) {
      bloquearNivel(el);
    } else if (!completadoPrevio && !nivel.opcional) {
      bloquearNivel(el);
    } else if (progreso[nivel.titulo]?.completado) {
      marcarCompletado(el);
    } else {
      desbloquearNivel(el);
    }

    // 🖱️ Evento click
    el.addEventListener("click", () => {
      if (!el.classList.contains("bloqueado")) {
        main.classList.add("fade-out");
        setTimeout(() => {
          import("./Niveles.js").then(({ cargarNivel }) =>
            cargarNivel(main, nivel, dificultad, estado)
          );
        }, 600);
      }
    });

    contNiveles.appendChild(el);
  });

  // 🚂 Conectar rieles (niveles 1–5)
  const pares = [
    [niveles[0], niveles[1]],
    [niveles[1], niveles[2]],
    [niveles[2], niveles[3]],
    [niveles[3], niveles[4]],
  ];

  pares.forEach(([inicio, fin]) => {
    const riel = document.createElement("div");
    riel.classList.add("tramo-riel");

    const dx = fin.left - inicio.left;
    const dy = fin.top - inicio.top;
    const distancia = Math.sqrt(dx * dx + dy * dy);
    const angulo = Math.atan2(dy, dx) * (180 / Math.PI);

    riel.style.left = `${inicio.left}%`;
    riel.style.top = `${inicio.top}%`;
    riel.style.width = `${distancia}%`;
    riel.style.height = "1.2%";
    riel.style.transform = `rotate(${angulo}deg)`;
    riel.style.transformOrigin = "left center";

    contRieles.appendChild(riel);
  });

  console.log(`🧭 ${niveles.length} niveles y ${pares.length} rieles cargados para ${estado}`);
}

/* =========================================================
   🎨 FUNCIONES VISUALES — ESTADO DE LOS NIVELES
   ========================================================= */
function bloquearNivel(el) {
  el.classList.add("bloqueado");
  el.style.filter = "grayscale(1)";
  el.style.opacity = "0.5";
  el.style.pointerEvents = "none";
}

function desbloquearNivel(el) {
  el.style.filter = "none";
  el.style.opacity = "1";
  el.style.background = "#2196f3";
  el.style.boxShadow = "0 0 12px rgba(33,150,243,0.6)";
}

function marcarCompletado(el) {
  el.classList.add("completado");
  el.style.background = "#4caf50";
  el.style.boxShadow = "0 0 12px 2px limegreen";
}

/* =========================================================
   📍 COORDENADAS — ESTADO DE MÉXICO
   ========================================================= */
function nivelesEdoMex() {
  return [
    { top: 83, left: 32, titulo: "Nivel 1 - Valle de Bravo" },
    { top: 59, left: 36, titulo: "Nivel 2 - Toluca" },
    { top: 53, left: 57, titulo: "Nivel 3 - Metepec / Atlacomulco" },
    { top: 25, left: 68, titulo: "Nivel 4 - Cuautitlán Izcalli" },
    { top: 56, left: 79, titulo: "Nivel 5 - Ecatepec de Morelos" },
    { top: 68, left: 48, titulo: "Nivel 6 (Opcional) - Centro", opcional: true },
    { top: 25, left: 46, titulo: "Nivel 7 (Opcional) - Norte", opcional: true },
    { top: 29, left: 79, titulo: "Nivel 8 (Opcional) - Chipote Este", opcional: true },
  ];
}

/* =========================================================
   📍 COORDENADAS — ESTADO DE MORELOS
   ========================================================= */
function nivelesMorelos() {
  return [
    { top: 36, left: 73, titulo: "Nivel 1 - Tepoztlán" },
    { top: 68, left: 69, titulo: "Nivel 2 - Cuernavaca" },
    { top: 70, left: 35, titulo: "Nivel 3 - Jojutla" },
    { top: 47, left: 40, titulo: "Nivel 4 - Puente de Ixtla" },
    { top: 27, left: 33, titulo: "Nivel 5 - Amacuzac" },
    { top: 85, left: 56, titulo: "Nivel 6 (Opcional) - Yautepec", opcional: true },
    { top: 20, left: 57, titulo: "Nivel 7 (Opcional) - Tlayacapan", opcional: true },
    { top: 45, left: 25, titulo: "Nivel 8 (Opcional) - Zacatepec", opcional: true },
  ];
}

/* =========================================================
   🧠 UTILIDAD GENERAL
   ========================================================= */
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
