/* =========================================================
📍 MAPA.JS — Versión Final con Guía, Firebase y Navegación
========================================================= */
import { mostrarGuia } from "./Tutorial.js";

export async function mostrarMapa(main, dificultad, estado, esInicio = true) {
    // 🎵 CAMBIO 1: Disparar música de Mapa
    if (window.controlSonidoGlobal) {
        window.controlSonidoGlobal.play('mapa');
    }

    const header = document.querySelector("header");
    if (header) header.style.display = "none";

    const LOCAL_KEY = 'progresoHistoriaInvitado';
    const dataProgreso = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
    const progresoEstado = dataProgreso[dificultad]?.[estado] || { niveles: {}, porcentajeEstado: 0 };
    const mapaFondo = estado === "Estado de México" ? "./Imagenes/Estado de Mexico.jpg" : "./Imagenes/Morelos.jpg";

    main.innerHTML = `
        <div class="mapa-pantalla-completa fade-in">
            <aside id="sidebar-mapa" class="sidebar-mapa">
                <div class="cabecera-info">
                    <h2 class="estado-titulo-amarillo">${estado}</h2>
                    <div class="meta-progreso-blanca">
                        <p>Progreso Total: ${progresoEstado.porcentajeEstado}%</p>
                        <div class="barra-meta"><div class="llenado" style="width:${progresoEstado.porcentajeEstado}%"></div></div>
                    </div>
                </div>
                
                <div id="contenedor-guia-fijo" class="zona-guia-superior"></div>

                <div id="espacio-interactivo-sidebar" class="espacio-interactivo">
                    <p class="txt-instruccion-blanca">Pasa el cursor sobre un círculo para investigar.</p>
                </div>

                <div class="botones-sidebar-bottom">
                    <button id="btnVolverMenu" class="btn-pausa">🔙 Volver</button>
                    <button id="btnAyudaMapa" class="btn-interrogacion-azul">?</button>
                </div>
            </aside>

            <section class="contenedor-mapa-principal">
                <div class="canvas-mapa">
                    <img class="mapa-img" src="${mapaFondo}">
                    <svg id="rieles-svg" class="rieles-capa"></svg>
                    <div id="puntos-niveles-container"></div>
                </div>
            </section>

            <div class="user-pill">
                <div class="user-avatar">L</div>
                <span class="user-name">Explorador</span>
                <button id="btnSalirSesion" class="btn-logout-mini">Salir</button>
            </div>
        </div>
    `;

    const niveles = estado === "Estado de México" ? nivelesEdoMex() : nivelesMorelos();
    dibujarRieles(niveles, progresoEstado.niveles);
    renderizarPuntos(main, niveles, dificultad, estado, progresoEstado, esInicio);

    main.querySelector("#btnSalirSesion").onclick = () => location.reload();
    
    // Al dar clic en ?, limpiamos el texto de info y mostramos la guía
    main.querySelector("#btnAyudaMapa").onclick = () => {
        document.getElementById("espacio-interactivo-sidebar").innerHTML = "";
        mostrarGuia("mapa", dificultad, "#contenedor-guia-fijo");
    };

    // CAMBIO 3: Lógica del botón Volver
    main.querySelector("#btnVolverMenu").onclick = () => {
        if (header) header.style.display = "flex"; // Recuperar el header
        import("./Historia.js").then(m => m.cargarModoHistoria(main));
    };
}

// --- El resto de tus funciones se mantienen exactamente igual ---

function renderizarPuntos(main, niveles, dificultad, estado, progresoEstado, esInicio) {
    const container = document.getElementById("puntos-niveles-container");
    const display = document.getElementById("espacio-interactivo-sidebar");
    const nivelesProgreso = progresoEstado.niveles;
    const nivel5Terminado = nivelesProgreso[niveles[4].titulo]?.completado;

    niveles.forEach((nivel, i) => {
        const el = document.createElement("div");
        el.className = nivel.opcional ? "punto-mapa circulo-amarillo" : "punto-mapa circulo-azul";
        el.style.top = `${nivel.top}%`;
        el.style.left = `${nivel.left}%`;

        let bloqueado = false;
        if (nivel.opcional) {
            if (!nivel5Terminado) bloqueado = true;
        } else if (i > 0) {
            const previo = niveles[i-1];
            if (!nivelesProgreso[previo.titulo]?.completado) bloqueado = true;
        }

        if (bloqueado) {
            el.classList.add("bloqueado-gris");
            el.innerHTML = `<span class="lock-icon">🔒</span>`;
        } else {
            const aciertos = nivelesProgreso[nivel.titulo]?.aciertos || 0;
            if (aciertos === 5) el.classList.add("brillo-perfecto");

            el.onmouseenter = () => {
                if (!document.querySelector(".guia-activa")) {
                    display.innerHTML = `
                        <div class="info-nivel-card fade-in">
                            <span class="badge-tipo">${nivel.opcional ? 'EXTRA' : 'NIVEL ' + (i+1)}</span>
                            <h2 class="nombre-nivel-grande">${nivel.titulo}</h2>
                            <p class="descripcion-nivel-blanca">${nivel.descripcion}</p>
                            <div class="caja-dato-curioso">
                                <strong>💡 ¿Sabías que?</strong>
                                <p>${nivel.datoCurioso}</p>
                            </div>
                            <div class="stats-txt">Récord: ${aciertos}/5</div>
                        </div>
                    `;
                }
            };
            el.onclick = () => import("./Niveles.js").then(m => m.cargarNivel(main, nivel, dificultad, estado, esInicio));
        }
        container.appendChild(el);
    });
}

function dibujarRieles(niveles, nivelesProgreso) {
    const svg = document.getElementById("rieles-svg");
    let html = "";
    const principales = niveles.filter(n => !n.opcional);
    principales.forEach((nivel, i) => {
        if (i === 0) return;
        const previo = principales[i-1];
        const completado = nivelesProgreso[previo.titulo]?.completado;
        const color = completado ? "#f1c40f" : "rgba(255,255,255,0.15)";
        html += `<line x1="${previo.left}%" y1="${previo.top}%" x2="${nivel.left}%" y2="${nivel.top}%" stroke="${color}" stroke-width="6" stroke-dasharray="10,8" />`;
    });
    svg.innerHTML = html;
}

function nivelesEdoMex() {
    return [
        { top: 83, left: 32, titulo: "Valle de Bravo", descripcion: "Lugar de lagos.", datoCurioso: "Famoso por la mariposa monarca." },
        { top: 59, left: 36, titulo: "Toluca", descripcion: "Ciudad volcánica.", datoCurioso: "El volcán tiene lagunas en su cráter." },
        { top: 53, left: 57, titulo: "Metepec", descripcion: "Barro artesanal.", datoCurioso: "Aquí nació el Árbol de la Vida." },
        { top: 25, left: 68, titulo: "Cuautitlán Izcalli", descripcion: "Ciudad histórica.", datoCurioso: "Paso del Camino Real de Tierra Adentro." },
        { top: 56, left: 79, titulo: "Ecatepec de Morelos", descripcion: "Centro cultural.", datoCurioso: "Aquí murió José María Morelos." },
        { top: 68, left: 48, titulo: "Popocatépetl", opcional: true, descripcion: "Ruta volcánica.", datoCurioso: "Es uno de los volcanes más activos." },
        { top: 25, left: 46, titulo: "Teotihuacán", opcional: true, descripcion: "Ciudad de dioses.", datoCurioso: "Sus pirámides son patrimonio mundial." },
        { top: 29, left: 79, titulo: "Otumba", opcional: true, descripcion: "Tradición antigua.", datoCurioso: "Famoso por su feria del burro." }
    ];
}

function nivelesMorelos() {
    return [
        { top: 36, left: 73, titulo: "Tepoztlán", descripcion: "Montañas místicas.", datoCurioso: "Hay una pirámide en la cima del cerro." },
        { top: 68, left: 69, titulo: "Cuernavaca", descripcion: "Eterna primavera.", datoCurioso: "Cortés vivió aquí en 1526." },
        { top: 70, left: 35, titulo: "Jojutla", descripcion: "Tierra del arroz.", datoCurioso: "Arroz con denominación de origen." },
        { top: 47, left: 40, titulo: "Puente de Ixtla", descripcion: "Cruce sureño.", datoCurioso: "Puente colonial histórico." },
        { top: 27, left: 33, titulo: "Amacuzac", descripcion: "Ribera del río.", datoCurioso: "Ideal para deportes de río." },
        { top: 85, left: 56, titulo: "Oaxtepec", opcional: true, descripcion: "Manantiales.", datoCurioso: "Era el retiro favorito de Moctezuma." },
        { top: 20, left: 57, titulo: "Tlayacapan", opcional: true, descripcion: "Pueblo mágico.", datoCurioso: "Cuna del baile del Chinelo." },
        { top: 45, left: 25, titulo: "Xochicalco", opcional: true, descripcion: "Observatorio.", datoCurioso: "Lugar de la casa de las flores." }
    ];
}