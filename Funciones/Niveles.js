/* =========================================================
   🧩 MODO HISTORIA — SISTEMA DE NIVELES (Versión estable con pausa)
   =========================================================
   Controla:
   ✅ Ruleta animada (selección real de tema)
   ✅ Temporizador de 30 segundos
   ✅ Botón de pausa (pierde progreso y regresa al mapa)
   ✅ Aciertos / errores con resumen final
   ✅ Guardado de progreso en localStorage
   ========================================================= */

import { mostrarMapa } from "./Mapa.js";

/* =========================================================
   ⚙️ VARIABLES GLOBALES
   ========================================================= */
let preguntasHechas = 0;
let preguntasTotales = 5;
let respuestasCorrectas = [];
let respuestasIncorrectas = [];
let tiempoRestante = 30;
let temporizador;

/* =========================================================
   🎮 CARGAR NIVEL
   ========================================================= */
export function cargarNivel(main, nivel, dificultad, estado) {
  console.log("🎯 Entrando a nivel:", nivel.titulo, "| Estado:", estado);

  // Reiniciar estado del nivel
  preguntasHechas = 0;
  respuestasCorrectas = [];
  respuestasIncorrectas = [];
  clearInterval(temporizador);

  main.classList.remove("fade-out");
  main.classList.add("fade-in");

  // 🎡 Interfaz visual con la ruleta
  main.innerHTML = `
    <div class="nivel-wrapper fade-in">
      <div class="tarjeta-nivel" id="tarjetaRuleta">
        <h2>${nivel.titulo}</h2>
        <p class="sub">Dificultad: ${dificultad}</p>

        <div class="ruleta-container">
          <div class="indicador"></div>
          <div class="ruleta-img" id="ruletaDinamica">
            <div class="etiquetas">
              <span class="etiqueta" style="--i:0;">Historia</span>
              <span class="etiqueta" style="--i:1;">Cultura</span>
              <span class="etiqueta" style="--i:2;">Gastronomía</span>
              <span class="etiqueta" style="--i:3;">Geografía</span>
              <span class="etiqueta" style="--i:4;">Lugares</span>
            </div>
          </div>
          <button id="btnGirar" class="btn-principal">🎡 Girar ruleta</button>
        </div>
      </div>
      <button id="btnVolverMapa" class="btn-secundario">← Volver al mapa</button>
    </div>
  `;

  // 🔙 Volver al mapa sin guardar progreso
  document.getElementById("btnVolverMapa").addEventListener("click", () => {
    clearInterval(temporizador);
    mostrarMapa(main, dificultad, estado);
  });

  // 🎯 Evento para girar ruleta
  document.getElementById("btnGirar").addEventListener("click", () =>
    girarRuleta(main, nivel, dificultad, estado)
  );
}

/* =========================================================
   🎡 RULETA — GIRO ALEATORIO
   ========================================================= */
function girarRuleta(main, nivel, dificultad, estado) {
  const ruleta = document.getElementById("ruletaDinamica");
  const tarjeta = document.getElementById("tarjetaRuleta");
  const sectores = ["Historia", "Cultura", "Gastronomía", "Geografía", "Lugares"];

  const indice = Math.floor(Math.random() * sectores.length);
  const anguloSector = 360 / sectores.length;
  const giros = 5;
  const offset = 360 * giros + (anguloSector * indice) + (Math.random() * 5 - 2.5);

  ruleta.classList.remove("spin");
  void ruleta.offsetWidth;
  ruleta.classList.add("spin");
  ruleta.style.transition = "transform 4.5s cubic-bezier(0.2, 0.85, 0.4, 1)";
  ruleta.style.transform = `rotate(${offset}deg)`;

  const temaSeleccionado = sectores[indice];
  console.log("🎡 Tema seleccionado:", temaSeleccionado);

  setTimeout(() => {
    tarjeta.classList.add("fade-out");
    setTimeout(() => {
      mostrarPregunta(main, nivel, dificultad, estado, temaSeleccionado);
    }, 800);
  }, 4600);
}

/* =========================================================
   ❓ MOSTRAR PREGUNTA + BOTÓN DE PAUSA
   ========================================================= */
function mostrarPregunta(main, nivel, dificultad, estado, tema) {
  const preguntas = obtenerPreguntas(tema, estado);
  const preguntaActual = preguntas[preguntasHechas % preguntas.length];

  if (!preguntaActual) {
    console.warn("No hay preguntas para:", tema, "en", estado);
    return;
  }

  main.innerHTML = `
    <div class="nivel-wrapper fade-in">
      <div class="tarjeta-nivel pregunta-activa">
        <div class="header-nivel">
          <div class="temporizador">⏱️ Tiempo: <span id="contador">${tiempoRestante}</span>s</div>
          <button id="btnPausa" class="btn-pausa">⏸️ Pausa</button>
        </div>
        <h2>${tema}</h2>
        <p class="pregunta-texto">${preguntaActual.pregunta}</p>
        <div class="opciones">
          ${preguntaActual.opciones.map((op) => `<button class="opcion">${op}</button>`).join("")}
        </div>
      </div>
    </div>
  `;

  iniciarTemporizador(main, nivel, dificultad, estado, tema);

  // 🎯 Eventos de respuesta
  main.querySelectorAll(".opcion").forEach((btn) => {
    btn.addEventListener("click", () =>
      evaluarRespuesta(
        btn,
        preguntaActual.respuesta,
        preguntaActual,
        main,
        nivel,
        dificultad,
        estado,
        tema
      )
    );
  });

  // ⏸️ Evento del botón de pausa
  document.getElementById("btnPausa").addEventListener("click", () =>
    pausarNivel(main, dificultad, estado)
  );
}

/* =========================================================
   ⏸️ FUNCIÓN — PAUSAR NIVEL (pierde progreso)
   ========================================================= */
function pausarNivel(main, dificultad, estado) {
  clearInterval(temporizador);

  const confirmar = confirm("⚠️ ¿Deseas salir del nivel?\nPerderás tu progreso actual.");
  if (confirmar) {
    preguntasHechas = 0;
    respuestasCorrectas = [];
    respuestasIncorrectas = [];
    tiempoRestante = 30;
    mostrarMapa(main, dificultad, estado);
  } else {
    iniciarTemporizador(main, null, dificultad, estado, ""); // continuar si cancela
  }
}

/* =========================================================
   🕒 TEMPORIZADOR
   ========================================================= */
function iniciarTemporizador(main, nivel, dificultad, estado, tema) {
  clearInterval(temporizador);
  tiempoRestante = 30;
  const contador = main.querySelector("#contador");

  temporizador = setInterval(() => {
    tiempoRestante--;
    if (contador) contador.textContent = tiempoRestante;

    if (tiempoRestante <= 0) {
      clearInterval(temporizador);
      preguntasHechas++;
      if (preguntasHechas >= preguntasTotales) {
        mostrarResumen(main, nivel, dificultad, estado);
      } else {
        mostrarPregunta(main, nivel, dificultad, estado, tema);
      }
    }
  }, 1000);
}

/* =========================================================
   🧮 EVALUAR RESPUESTA
   ========================================================= */
function evaluarRespuesta(btn, correcta, pregunta, main, nivel, dificultad, estado, tema) {
  clearInterval(temporizador);
  const esCorrecta = btn.textContent === correcta;

  if (esCorrecta) {
    respuestasCorrectas.push({ pregunta: pregunta.pregunta, respuesta: correcta });
    btn.style.background = "#43a047";
  } else {
    respuestasIncorrectas.push({
      pregunta: pregunta.pregunta,
      respuesta: btn.textContent,
      correcta,
    });
    btn.style.background = "#e53935";
  }

  setTimeout(() => {
    preguntasHechas++;
    if (preguntasHechas >= preguntasTotales) {
      actualizarProgreso(dificultad, estado, nivel, respuestasCorrectas.length);
      mostrarResumen(main, nivel, dificultad, estado);
    } else {
      mostrarPregunta(main, nivel, dificultad, estado, tema);
    }
  }, 800);
}

/* =========================================================
   💾 GUARDAR PROGRESO — LOCALSTORAGE
   ========================================================= */
function actualizarProgreso(dificultad, estado, nivel, correctas) {
  const data = JSON.parse(localStorage.getItem("preguntados_historia_progreso") || "{}");

  if (!data[dificultad]) data[dificultad] = {};
  if (!data[dificultad][estado]) {
    data[dificultad][estado] = {
      niveles: {},
      preguntasCorrectasTotales: 0,
      porcentajeEstado: 0,
      porcentajeGlobal: 0,
    };
  }

  data[dificultad][estado].niveles[nivel.titulo] = {
    correctas,
    total: preguntasTotales,
    completado: true,
  };

  let totalCorrectas = 0;
  for (const n in data[dificultad][estado].niveles) {
    totalCorrectas += data[dificultad][estado].niveles[n].correctas;
  }

  data[dificultad][estado].preguntasCorrectasTotales = totalCorrectas;
  data[dificultad][estado].porcentajeEstado = Math.min((totalCorrectas / 40) * 50, 50);

  const estados = Object.values(data[dificultad]);
  const porcentajeGlobal = estados.reduce(
    (acc, e) => acc + (e.porcentajeEstado || 0),
    0
  );
  data[dificultad].porcentajeGlobal = Math.min(porcentajeGlobal, 100);

  localStorage.setItem("preguntados_historia_progreso", JSON.stringify(data));
}

/* =========================================================
   🧠 BASE LOCAL DE PREGUNTAS
   ========================================================= */
function obtenerPreguntas(tema, estado) {
  const base = {
    "Estado de México": {
      Historia: [
        { pregunta: "¿Qué ciudad fue una de las primeras capitales del Edo. de México?", opciones: ["Texcoco", "Toluca", "Tenango", "Atlacomulco"], respuesta: "Texcoco" },
        { pregunta: "¿Qué volcán está en el Estado de México?", opciones: ["Popocatépetl", "Nevado de Toluca", "Cofre de Perote", "Pico de Orizaba"], respuesta: "Nevado de Toluca" },
        { pregunta: "¿En qué año se fundó la ciudad de Toluca?", opciones: ["1522", "1529", "1531", "1545"], respuesta: "1522" },
        { pregunta: "¿Quién fue el primer gobernador del Edo. de México?", opciones: ["José María Luis Mora", "Isidro Fabela", "Juan Nepomuceno Mirafuentes", "Melchor Múzquiz"], respuesta: "Melchor Múzquiz" },
        { pregunta: "¿Qué civilización habitó el Valle de Toluca?", opciones: ["Matlatzincas", "Zapotecas", "Olmecas", "Mayas"], respuesta: "Matlatzincas" }
      ],
      Cultura: [
        { pregunta: "¿Qué fiesta es tradicional en Toluca en septiembre?", opciones: ["Feria del Alfeñique", "Día de Muertos", "Feria del Maíz", "Feria del Toro"], respuesta: "Feria del Alfeñique" },
        { pregunta: "¿Qué tipo de música regional es popular en el Estado de México?", opciones: ["Mariachi", "Banda", "Huapango", "Jarabe"], respuesta: "Huapango" },
        { pregunta: "¿Cuál es una danza tradicional mexiquense?", opciones: ["Los Arrieros", "La Conquista", "Los Viejitos", "La Danza del Venado"], respuesta: "Los Arrieros" },
        { pregunta: "¿Qué material se usa en el arte de Metepec?", opciones: ["Madera", "Barro", "Vidrio", "Piedra"], respuesta: "Barro" },
        { pregunta: "¿Qué representa el Árbol de la Vida de Metepec?", opciones: ["El origen del hombre", "La historia de México", "La fe católica", "El comercio local"], respuesta: "El origen del hombre" }
      ],
      Gastronomía: [
        { pregunta: "¿Platillo típico del Edo. de México?", opciones: ["Chorizo verde", "Tamales oaxaqueños", "Pozole rojo", "Mole poblano"], respuesta: "Chorizo verde" },
        { pregunta: "¿Qué dulce artesanal es famoso en Toluca?", opciones: ["Jamoncillo", "Alfeñique", "Cajeta", "Alegría"], respuesta: "Alfeñique" },
        { pregunta: "¿Qué bebida se produce en Tenancingo?", opciones: ["Pulque", "Mezcal", "Tequila", "Cerveza artesanal"], respuesta: "Mezcal" },
        { pregunta: "¿Qué ingrediente da color al chorizo verde?", opciones: ["Perejil y chile poblano", "Epazote", "Cilantro", "Nopal"], respuesta: "Perejil y chile poblano" },
        { pregunta: "¿Cuál es un postre típico mexiquense?", opciones: ["Pan de fiesta", "Pastel de tres leches", "Buñuelos", "Arroz con leche"], respuesta: "Pan de fiesta" }
      ],
      Geografía: [
        { pregunta: "¿Cuál es la capital del Edo. de México?", opciones: ["Toluca", "Ecatepec", "Atlacomulco", "Texcoco"], respuesta: "Toluca" },
        { pregunta: "¿Qué lago importante está en el Edo. de México?", opciones: ["Zumpango", "Chapala", "Pátzcuaro", "Catemaco"], respuesta: "Zumpango" },
        { pregunta: "¿Qué estado limita al sur con el Edo. de México?", opciones: ["Morelos", "Hidalgo", "Puebla", "Querétaro"], respuesta: "Morelos" },
        { pregunta: "¿Qué montaña es símbolo del estado?", opciones: ["Nevado de Toluca", "Popocatépetl", "Malinche", "Iztaccíhuatl"], respuesta: "Nevado de Toluca" },
        { pregunta: "¿Cuál es el río más importante del Edo. de México?", opciones: ["Lerma", "Pánuco", "Balsas", "Papaloapan"], respuesta: "Lerma" }
      ],
      Lugares: [
        { pregunta: "¿Qué pueblo mágico es famoso por sus lagos?", opciones: ["Valle de Bravo", "Malinalco", "Tonatico", "Metepec"], respuesta: "Valle de Bravo" },
        { pregunta: "¿Qué sitio arqueológico se encuentra en Tenango?", opciones: ["Teotenango", "Xochicalco", "Monte Albán", "Tula"], respuesta: "Teotenango" },
        { pregunta: "¿Qué municipio es conocido por su producción de barro?", opciones: ["Metepec", "Ixtapan", "Amecameca", "Otzolotepec"], respuesta: "Metepec" },
        { pregunta: "¿Qué destino turístico es ideal para deportes acuáticos?", opciones: ["Valle de Bravo", "Tequesquitengo", "Zihuatanejo", "Taxco"], respuesta: "Valle de Bravo" },
        { pregunta: "¿Qué sitio natural es un volcán nevado?", opciones: ["Nevado de Toluca", "La Malinche", "Popocatépetl", "Pico de Orizaba"], respuesta: "Nevado de Toluca" }
      ]
    }
  };

  return base[estado]?.[tema] || [
    { pregunta: "¿Pregunta de ejemplo?", opciones: ["A", "B", "C", "D"], respuesta: "A" },
  ];
}

/* =========================================================
   🏁 RESUMEN FINAL (MODIFICADO — CENTRADO Y MÁS GRANDE)
   ========================================================= */
function mostrarResumen(main, nivel, dificultad, estado) {
  clearInterval(temporizador);

  const totalCorrectas = respuestasCorrectas.length;
  const totalIncorrectas = respuestasIncorrectas.length;

  const listaCorrectas = respuestasCorrectas
    .map((r) => `<li>✔️ ${r.pregunta} → <strong>${r.respuesta}</strong></li>`)
    .join("");

  const listaIncorrectas = respuestasIncorrectas
    .map(
      (r) =>
        `<li>❌ ${r.pregunta} → Respondió: <strong>${r.respuesta}</strong> (Correcta: ${r.correcta})</li>`
    )
    .join("");

  main.innerHTML = `
    <div class="resumen-wrapper fade-in" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
      font-size: 1.3rem;
    ">
      <h2 style="font-size: 2.5rem; margin-bottom: 10px;">🏁 Nivel Completado</h2>
      <p style="font-size: 1.7rem; font-weight: bold; margin: 5px 0;">${nivel.titulo} — ${estado}</p>
      <p style="margin: 5px 0; font-size: 1.2rem;">⏱️ Tiempo por pregunta: 30 segundos</p>

      <p style="font-size: 1.5rem; margin: 20px 0;">
        <span style="color: #2ecc71;">✔️ Correctas: ${totalCorrectas}</span> |
        <span style="color: #e74c3c;">❌ Incorrectas: ${totalIncorrectas}</span>
      </p>

      <h3 style="font-size: 2rem; margin-top: 20px;">📘 Detalles</h3>

      <ul class="resultados" style="
        list-style: none;
        padding: 0;
        margin-top: 20px;
        text-align: left;
        width: 100%;
        max-width: 750px;
        font-size: 1.25rem;
        line-height: 1.6;
      ">
        ${listaCorrectas}${listaIncorrectas}
      </ul>

      <button id="btnVolverMapa" class="btn-secundario" style="
        margin-top: 40px;
        font-size: 1.4rem;
        padding: 14px 30px;
      ">← Volver al mapa</button>
    </div>
  `;

  document.getElementById("btnVolverMapa").addEventListener("click", () => {
    respuestasCorrectas = [];
    respuestasIncorrectas = [];
    preguntasHechas = 0;
    mostrarMapa(main, dificultad, estado);
  });
}

