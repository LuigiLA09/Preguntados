/* =========================================================
   📖 MODO LIBRE.JS — Modo de juego rápido y configurable (FINAL CORRECCIÓN)
   ========================================================= */

import { cargarMenuPrincipal } from "./Preguntados.js";
// NOTA: Asegúrate de que Preguntados.js exista y exporte cargarMenuPrincipal

let preguntasDisponibles = [];
let indicePreguntaActual = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let pausaActiva = false; 
let timer; 
let segundosRestantes = 30; 

// Variables globales para la dificultad, ajustadas en iniciarJuegoLibre
let maxVidas = 3; 
let segundosBase = 30; 

const temas = ["Historia", "Cultura", "Gastronomía", "Geografía", "Lugares"]; // 5 Temas

/* =========================================================
   🎮 ENTRADA PRINCIPAL: SELECCIÓN DE FILTROS
   ========================================================= */
export function cargarModoLibre(main) {
    // Resetear variables al iniciar un nuevo modo libre
    respuestasCorrectas = 0;
    respuestasIncorrectas = 0;
    indicePreguntaActual = 0;
    pausaActiva = false;
    if (timer) clearInterval(timer);

    main.innerHTML = `
        <div class="modo-libre-wrapper fade-in">
            <div class="tarjeta-filtro">
                <h2>Configura tu partida libre</h2>
                <p>Selecciona tus preferencias de juego.</p>

                <div class="filtros-grid">
                    <label for="dificultad-select">Dificultad:</label>
                    <select id="dificultad-select">
                        <option value="Fácil">Fácil</option>
                        <option value="Medio">Medio</option>
                        <option value="Difícil">Difícil</option>
                    </select>

                    <label for="modo-juego-select">Modo de Juego:</label>
                    <select id="modo-juego-select">
                        <option value="Vidas">Vidas (Varía según dificultad)</option>
                        <option value="Tiempo">Tiempo (Varía según dificultad)</option>
                    </select>

                    <label for="max-preguntas-input">Preguntas Máximas:</label>
                    <input type="number" id="max-preguntas-input" value="10" min="5" max="30">
                </div>
                
                <p class="nota-filtro">El estado y el tema serán elegidos al azar con la ruleta.</p>

                <div class="menu-botones">
                    <button id="btnIniciar" class="btn-principal">🎡 Iniciar Ruleta de Estados</button>
                    <button id="btnMenu" class="btn-secundario">← Menú principal</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("btnMenu").addEventListener("click", () => cargarMenuPrincipal(main));

    document.getElementById("btnIniciar").addEventListener("click", () => {
        const dificultad = document.getElementById("dificultad-select").value;
        const modoJuego = document.getElementById("modo-juego-select").value;
        const maxPreguntas = Math.min(30, Math.max(5, parseInt(document.getElementById("max-preguntas-input").value)));
        
        const filtrosIniciales = {
            dificultad: dificultad,
            modoJuego: modoJuego,
            maxPreguntas: maxPreguntas
        };
        
        mostrarRuletaEstado(main, filtrosIniciales);
    });
}   

/* =========================================================
   📚 FUNCIÓN DE CARGA DE PREGUNTAS (PLACEHOLDER)
   ========================================================= */
function cargarBancoPreguntas(filtros) {
    // Banco de preguntas de ejemplo
    const baseEjemplo = [
        { pregunta: "¿Cuál es la capital del Edo. de México?", opciones: ["Toluca", "Ecatepec", "Atlacomulco", "Texcoco"], respuesta: "Toluca", tema: "Geografía", dificultad: "Fácil", estado: "Estado de México", retro_acierto: "Toluca es conocida como la 'Bella Ciudad del Sol'.", retro_error: "La capital de un estado es su centro político y administrativo." },
        { pregunta: "¿Platillo típico del Edo. de México?", opciones: ["Chorizo verde", "Tamales oaxaqueños", "Pozole rojo", "Mole poblano"], respuesta: "Chorizo verde", tema: "Gastronomía", dificultad: "Medio", estado: "Estado de México", retro_acierto: "El color viene de la mezcla de especias y chiles verdes.", retro_error: "El Chorizo verde es exclusivo de Toluca, no de otras regiones." },
        { pregunta: "¿Qué sitio arqueológico está en Morelos?", opciones: ["Teotihuacán", "Xochicalco", "Chichén Itzá", "Monte Albán"], respuesta: "Xochicalco", tema: "Historia", dificultad: "Medio", estado: "Morelos", retro_acierto: "Xochicalco significa 'lugar en la casa de las flores'.", retro_error: "Xochicalco es patrimonio de la humanidad en Morelos." },
        { pregunta: "¿Qué volcán está en el Estado de México?", opciones: ["Popocatépetl", "Nevado de Toluca", "Cofre de Perote", "Pico de Orizaba"], respuesta: "Nevado de Toluca", tema: "Geografía", dificultad: "Fácil", estado: "Estado de México", retro_acierto: "Su nombre original es Xinantécatl.", retro_error: "El Nevado es uno de los picos más altos de México y el cuarto del país." },
        { pregunta: "¿Qué material se usa en el arte de Metepec?", opciones: ["Madera", "Barro", "Vidrio", "Piedra"], respuesta: "Barro", tema: "Cultura", dificultad: "Medio", estado: "Estado de México", retro_acierto: "El barro se usa para crear los famosos 'Árboles de la Vida'.", retro_error: "Metepec es famoso por sus alfareros y el uso del barro." },
    ];

    let preguntasFiltradas = baseEjemplo.filter(p => 
        p.estado === filtros.estado &&
        p.dificultad === filtros.dificultad && 
        p.tema === filtros.tema
    );
    
    // Si no hay preguntas específicas, devuelve un subconjunto
    return preguntasFiltradas.length > 0 ? preguntasFiltradas : baseEjemplo.slice(0, 5);
}

/* =========================================================
   🎡 1. RULETA DE ESTADO (Grande)
   ========================================================= */
function mostrarRuletaEstado(main, filtros) { 
    const ruletaEstadoExistente = document.getElementById("ruletaEstado");
    if (ruletaEstadoExistente) {
        ruletaEstadoExistente.style.transition = 'none';
        ruletaEstadoExistente.style.transform = 'rotate(0deg)';
    }

    main.innerHTML = `
        <div class="modo-libre-ruleta fade-in">
            <div class="tarjeta-filtro"> 
                <h2>Gira para seleccionar el Estado</h2>
                <div class="ruleta-contenedor">
                    <div id="ruletaEstado" class="ruleta-base ruleta-base-grande">
                        </div>
                    <div class="indicador-estado">▼</div>
                </div>
                <button id="btnGirarEstado" class="btn-principal">Girar Ruleta</button>
                <button id="btnMenu" class="btn-secundario mt-3">← Volver a filtros</button>
                
                <p id="mensajeRuleta" class="mt-3"></p>
            </div>
        </div>
    `;

    document.getElementById("btnMenu").addEventListener("click", () => cargarModoLibre(main));
    
    document.getElementById("btnGirarEstado").addEventListener("click", function handler() {
        const btnGirar = document.getElementById("btnGirarEstado");
        btnGirar.disabled = true;
        document.getElementById("mensajeRuleta").textContent = "Girando Estado...";

        const ruleta = document.getElementById("ruletaEstado");
        
        const estados = ["Estado de México", "Morelos"]; // Usar los estados relevantes
        const sectorIndex = Math.floor(Math.random() * estados.length); 
        
        // Lógica de giro de ruleta (ajustar si la ruleta tiene más sectores)
        const anguloDeseado = (180 * sectorIndex) + 90; 
        const gradosFinales = anguloDeseado + 9 * 360 + 10;
        
        ruleta.style.transition = 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)'; 
        ruleta.style.transform = `rotate(-${gradosFinales}deg)`;

        setTimeout(() => {
            const estadoSeleccionado = estados[sectorIndex];
            
            document.getElementById("mensajeRuleta").textContent = `¡Estado seleccionado: ${estadoSeleccionado}!`;
            btnGirar.textContent = `Continuar: Elegir Tema`;
            btnGirar.disabled = false;
            
            btnGirar.removeEventListener("click", handler);
            
            btnGirar.addEventListener("click", () => mostrarRuletaTema(main, filtros, estadoSeleccionado));

        }, 3200);
    });
}

/* =========================================================
   🎡 2. RULETA DE TEMA (Chica)
   ========================================================= */
function mostrarRuletaTema(main, filtros, estado) { 
    const ruletaTemaExistente = document.getElementById("ruletaDinamica");
    if (ruletaTemaExistente) {
        ruletaTemaExistente.style.transition = 'none';
        ruletaTemaExistente.style.transform = 'rotate(0deg)';
    }

    main.classList.remove("fade-in");
    main.classList.add("fade-out");

    setTimeout(() => {
        const dificultad = filtros.dificultad;
        const modoJuego = filtros.modoJuego;
        
        main.innerHTML = `
            <div class="modo-libre-ruleta fade-in">
                <div id="tarjetaRuleta" class="tarjeta-filtro"> 
                    <h3>Estado: ${estado}</h3>
                    <p class="dificultad-display">Dificultad: ${dificultad} | Modo: ${modoJuego}</p> 

                    <div class="ruleta-contenedor">
                        <div id="ruletaDinamica" class="ruleta-base ruleta-base-chica">
                            </div>
                        <div class="indicador-temas">→</div> 
                    </div>

                    <div class="menu-botones">
                        <button id="btnGirarTema" class="btn-principal">🎡 Girar ruleta de temas</button>
                        <button id="btnVolverFiltros" class="btn-secundario">← Volver a filtros</button>
                    </div>
                </div>
            </div>
        `;
        
        main.classList.remove("fade-out");
        main.classList.add("fade-in");

        document.getElementById("btnVolverFiltros").addEventListener("click", () => cargarModoLibre(main));

        document.getElementById("btnGirarTema").addEventListener("click", () => {
            const btnGirar = document.getElementById("btnGirarTema");
            btnGirar.disabled = true;
            girarRuleta(main, filtros, estado); 
        });

    }, 500);
}


/* =========================================================
   🎡 RULETA DE TEMA — GIRO ALEATORIO
   ========================================================= */
function girarRuleta(main, filtros, estado) { 
    const ruleta = document.getElementById("ruletaDinamica");
    
    if (!ruleta) {
        console.error("Error: Elemento de ruleta no encontrado.");
        return;
    }

    const sectores = temas; 
    const totalSectores = sectores.length; 
    const anguloSector = 360 / totalSectores; 

    const indice = Math.floor(Math.random() * totalSectores); 
    const temaSeleccionado = sectores[indice]; 
    
    const anguloCentroSector = (anguloSector * indice) + (anguloSector / 2);
    let rotacionBase = 360 - anguloCentroSector; 
    rotacionBase = (rotacionBase + 360) % 360; 

    const giros = 5; 
    const girosCompletos = 360 * giros; 
    const jitter = (Math.random() * (anguloSector * 0.8)) - (anguloSector * 0.4); 
    const offset = girosCompletos + rotacionBase + jitter;

    // --- Aplicación del Giro ---
    ruleta.style.transition = 'none'; 
    ruleta.style.transform = 'rotate(0deg)'; 

    void ruleta.offsetWidth; 

    ruleta.style.transition = "transform 4.5s cubic-bezier(0.2, 0.85, 0.4, 1)";
    ruleta.style.transform = `rotate(-${offset}deg)`;

    // --- Lógica de la Pregunta ---
    setTimeout(() => {
        const filtrosCompletos = {...filtros, estado: estado, tema: temaSeleccionado};
        
        main.classList.add("fade-out");
        setTimeout(() => {
            iniciarJuegoLibre(main, filtrosCompletos); 
        }, 800);
    }, 4600); 
}


/* =========================================================
   🕹️ INICIO DEL JUEGO FINAL (Modificado para aplicar dificultad)
   ========================================================= */
function iniciarJuegoLibre(main, filtros) {
    preguntasDisponibles = cargarBancoPreguntas(filtros);
    indicePreguntaActual = 0;
    respuestasIncorrectas = 0; 
    
    // ----------------------------------------------------
    // CLAVE: LÓGICA DE DIFICULTAD BASADA EN FILTROS
    // ----------------------------------------------------
    const dificultad = filtros.dificultad;

    if (filtros.modoJuego === 'Vidas') {
        if (dificultad === 'Fácil') {
            maxVidas = 7;
        } else if (dificultad === 'Medio') {
            maxVidas = 5;
        } else if (dificultad === 'Difícil') {
            maxVidas = 3;
        }
    } else if (filtros.modoJuego === 'Tiempo') {
        if (dificultad === 'Fácil') {
            segundosBase = 30;
        } else if (dificultad === 'Medio') {
            segundosBase = 20;
        } else if (dificultad === 'Difícil') {
            segundosBase = 10;
        }
    }
    // ----------------------------------------------------
    
    preguntasDisponibles.sort(() => Math.random() - 0.5);
    preguntasDisponibles = preguntasDisponibles.slice(0, filtros.maxPreguntas);

    if (preguntasDisponibles.length === 0) {
        alert("No se encontraron preguntas con los filtros seleccionados. Intenta de nuevo.");
        cargarModoLibre(main);
        return;
    }

    mostrarPreguntaLibre(main, filtros);
}

/* =========================================================
   ❓ MOSTRAR PREGUNTA (Flujo continuo y Pausa)
   ========================================================= */
function mostrarPreguntaLibre(main, filtros) {
    // CLAVE: Usar maxVidas para el límite de juego
    if (filtros.modoJuego === 'Vidas' && respuestasIncorrectas >= maxVidas) { 
        alert("¡Has perdido todas tus vidas!");
        mostrarResumenLibre(main, filtros);
        return;
    }
    
    if (indicePreguntaActual >= preguntasDisponibles.length) {
        mostrarResumenLibre(main, filtros);
        return;
    }

    const preguntaActual = preguntasDisponibles[indicePreguntaActual];
    
    // Si el temporizador estaba activo, detenerlo para la nueva pregunta
    if (timer) clearInterval(timer);
    
    // CLAVE: Usar maxVidas para el contador de vidas
    const vidasRestantes = maxVidas - respuestasIncorrectas;
    const modoDisplay = (filtros.modoJuego === 'Vidas') ? 
                        `❤️ Vidas: ${vidasRestantes}` : 
                        `⏱️ Tiempo: <span id="timer">${segundosBase}s</span>`; 
    
    main.innerHTML = `
        <div class="modo-libre-quiz fade-in">
            <div class="tarjeta-nivel pregunta-activa">
                
                <div class="header-nivel">
                    <h3>Pregunta ${indicePreguntaActual + 1} de ${filtros.maxPreguntas}</h3>
                    <p class="modo-display">${modoDisplay}</p>
                </div>

                <div class="header-filtros">
                    <p class="nota-filtro">Filtros: ${filtros.estado} / ${filtros.dificultad} / ${filtros.tema}</p>
                    <button id="btnPausa" class="btn-pausa">⏸️ Pausa</button>
                </div>
                
                <h2>${preguntaActual.tema}</h2>
                <p class="pregunta-texto">${preguntaActual.pregunta}</p>
                
                <div class="opciones">
                    ${preguntaActual.opciones.map((op) => `<button class="opcion">${op}</button>`).join("")}
                </div>
                
                <div id="retroalimentacion" class="retro-box" style="display: none;"></div>
                
                <button id="btnSiguiente" class="btn-secundario" style="display: none;">Siguiente Pregunta →</button>
            </div>
            <button id="btnVolverMenu" class="btn-volver">← Terminar y volver</button>
        </div>
    `;

    // Lógica del Temporizador (Modo Tiempo)
    if (filtros.modoJuego === 'Tiempo') {
        segundosRestantes = segundosBase; // Inicializar con el valor de dificultad
        iniciarTemporizador(main, filtros, preguntaActual);
    }
    
    main.querySelectorAll(".opcion").forEach((btn) => {
        btn.addEventListener("click", () => evaluarRespuestaLibre(btn, preguntaActual, main, filtros));
    });

    document.getElementById("btnSiguiente").addEventListener("click", () => {
        if (timer) clearInterval(timer); 
        indicePreguntaActual++;
        mostrarPreguntaLibre(main, filtros);
    });

    document.getElementById("btnPausa").addEventListener("click", () => {
        if (timer) clearInterval(timer);
        mostrarMenuPausa(main, filtros);
    });

    document.getElementById("btnVolverMenu").addEventListener("click", () => {
        if (confirm("¿Deseas terminar esta partida libre y volver al menú de selección de filtros?")) {
            if (timer) clearInterval(timer);
            cargarModoLibre(main);
        }
    });
}

// NUEVA FUNCIÓN: Maneja el temporizador
function iniciarTemporizador(main, filtros, preguntaActual) {
    const timerElement = document.getElementById("timer");
    
    timer = setInterval(() => {
        segundosRestantes--;
        if (timerElement) timerElement.textContent = `${segundosRestantes}s`;

        if (segundosRestantes <= 0) {
            clearInterval(timer);
            evaluarRespuestaLibre(null, preguntaActual, main, filtros, true); 
        }
    }, 1000);
}


/* =========================================================
   🧮 EVALUAR RESPUESTA LIBRE
   ========================================================= */
function evaluarRespuestaLibre(btn, pregunta, main, filtros, tiempoAgotado = false) {
    if (timer) clearInterval(timer); 
    
    main.querySelectorAll(".opcion").forEach(op => op.disabled = true);
    
    const retroBox = document.getElementById("retroalimentacion");
    const btnSiguiente = document.getElementById("btnSiguiente");
    let esCorrecta = false;
    
    if (!tiempoAgotado && btn) {
        esCorrecta = btn.textContent === pregunta.respuesta;
    }

    let retroHTML = "";

    if (esCorrecta) {
        respuestasCorrectas++;
        btn.style.background = "#43a047"; 
        retroHTML += `<h3>¡Correcto!</h3><p>${pregunta.retro_acierto || '¡Bien hecho!'}</p>`;
    } else {
        respuestasIncorrectas++;
        
        if (tiempoAgotado) {
             retroHTML += `<h3>⏱️ ¡Tiempo Agotado!</h3><p>Se acabó el tiempo. La respuesta correcta era ${pregunta.respuesta}.</p>`;
        } else if(btn) {
            btn.style.background = "#e53935"; 
            retroHTML += `<h3>❌ Incorrecto</h3><p>${pregunta.retro_error || 'La respuesta correcta era ' + pregunta.respuesta + '.'}</p>`;
        }
        
        const correctaBtn = Array.from(main.querySelectorAll(".opcion")).find(o => o.textContent === pregunta.respuesta);
        if (correctaBtn) {
            correctaBtn.style.background = "#43a047"; 
        }
    }

    retroBox.innerHTML = retroHTML;
    retroBox.style.display = "block";
    btnSiguiente.style.display = "block";
    
    // CLAVE: Usar maxVidas para la verificación final
    if (filtros.modoJuego === 'Vidas' && respuestasIncorrectas >= maxVidas) { 
        btnSiguiente.textContent = "Ver Resumen Final →";
    }
}


/* =========================================================
   ⏸️ MENÚ DE PAUSA
   ========================================================= */
function mostrarMenuPausa(main, filtros) {
    pausaActiva = true;
    
    main.innerHTML = `
        <div class="modo-libre-wrapper fade-in">
            <div class="tarjeta-filtro pausa-menu">
                <h2>⏸️ Partida en Pausa</h2>
                <p>¿Qué deseas hacer?</p>
                
                <div class="menu-botones">
                    <button id="btnReanudar" class="btn-principal">▶️ Reanudar Partida</button>
                    <button id="btnVolverFiltros" class="btn-secundario">← Terminar Partida</button>
                </div>

                <p class="nota-filtro">Al terminar, se perderá el progreso de esta sesión.</p>
            </div>
        </div>
    `;

    document.getElementById("btnReanudar").addEventListener("click", () => {
        pausaActiva = false;
        // Restaurar la pregunta actual
        mostrarPreguntaLibre(main, filtros);
    });

    document.getElementById("btnVolverFiltros").addEventListener("click", () => {
        if (confirm("¿Estás seguro de que quieres terminar la partida y perder el progreso?")) {
            if (timer) clearInterval(timer);
            cargarModoLibre(main);
        }
    });
}


/* =========================================================
   🏁 RESUMEN FINAL MODO LIBRE
   ========================================================= */
function mostrarResumenLibre(main, filtros) {
    if (timer) clearInterval(timer);
    
    main.innerHTML = `
        <div class="resumen-wrapper fade-in">
            <div class="tarjeta-filtro">
                <h2>🎉 Fin de la partida libre</h2>
                <h3>Resultados:</h3>
                <p>Modo de Juego: ${filtros.modoJuego}</p>
                <p>Dificultad: ${filtros.dificultad}</p>
                <p>Preguntas jugadas: ${indicePreguntaActual}</p>
                <p class="resumen-correctas">✅ Correctas: ${respuestasCorrectas}</p>
                <p class="resumen-incorrectas">❌ Incorrectas: ${respuestasIncorrectas}</p>
                
                <div class="menu-botones mt-3">
                    <button id="btnVolverFiltros" class="btn-principal">🔄 Nueva partida libre</button>
                    <button id="btnMenuPrincipal" class="btn-secundario">← Menú principal</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("btnVolverFiltros").addEventListener("click", () => cargarModoLibre(main));
    document.getElementById("btnMenuPrincipal").addEventListener("click", () => cargarMenuPrincipal(main));
}