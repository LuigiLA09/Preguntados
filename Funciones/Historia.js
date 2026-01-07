/* =========================================================
📖 HISTORIA.JS — Modo Historia con Guardado, Posicionamiento y TUTORIAL
========================================================= */

import { mostrarMapa } from "./Mapa.js";
import { cargarMenuPrincipal, signInWithGoogle } from "./Preguntados.js";
import { mostrarGuia } from "./Tutorial.js"; // IMPORTANTE: Importar el tutorial

// Importar Firebase para la sincronización de datos
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

// Constante unificada para la clave de localStorage
const LOCAL_STORAGE_KEY = 'progresoHistoriaInvitado';

/* =========================================================
📦 FUNCIONES DE FIREBASE Y PROGRESO (CLOUD & LOCAL)
========================================================= */

function obtenerProgresoLocal() {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Error al obtener progreso local:", e);
        return {};
    }
}

function guardarProgresoLocal(progreso) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progreso));
    } catch (e) {
        console.error("Error al guardar progreso local:", e);
    }
}

async function obtenerProgresoGlobal(uid) {
    if (!uid) return obtenerProgresoLocal();
    try {
        const userDocRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().progresoHistoria) {
            return docSnap.data().progresoHistoria;
        } else {
            return obtenerProgresoLocal();
        }
    } catch (error) {
        console.error("Error al obtener el progreso de historia:", error);
        return {};
    }
}

async function migrarProgresoLocal(uid, progresoLocal) {
    if (!uid || Object.keys(progresoLocal).length === 0) return;
    try {
        const userDocRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(userDocRef);
        let progresoNube = docSnap.exists() ? docSnap.data().progresoHistoria || {} : {};
        const progresoFinal = { ...progresoNube, ...progresoLocal };
        await setDoc(userDocRef, { progresoHistoria: progresoFinal }, { merge: true });
        console.log("✅ Progreso local migrado exitosamente a Firebase.");
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
        console.error("Error al migrar el progreso a Firebase:", error);
    }
}

async function borrarPartidaFirebase(dif, uid) {
    if (!uid) return;
    try {
        const userDocRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(userDocRef);
        let data = docSnap.exists() ? docSnap.data().progresoHistoria || {} : {};
        if (data[dif]) {
            delete data[dif];
            await setDoc(userDocRef, { progresoHistoria: data }, { merge: true });
            alert(`✅ La partida de dificultad ${dif.toUpperCase()} ha sido borrada.`);
            const main = document.querySelector('main');
            if (main) cargarModoHistoria(main);
        }
    } catch (error) {
        console.error("Error al borrar la partida:", error);
    }
}

/* =========================================================
🎮 ENTRADA PRINCIPAL
========================================================= */
export function cargarModoHistoria(main) {
    main.classList.remove("fade-out");
    main.classList.add("fade-in");

    const uid = auth.currentUser ? auth.currentUser.uid : null;
    const displayName = auth.currentUser?.displayName || "Invitado";

    obtenerProgresoGlobal(uid).then(progreso => {
        const mensajeGuardado = uid
            ? `<p class="guardado-msg">✅ Progreso en la nube</p>`
            : `<p class="guardado-msg">💾 Guardado localmente</p>`;

        main.innerHTML = `
            <div class="historia-wrapper">
                
                <button id="btnAyudaHistoria" class="btn-ayuda-flotante">?</button>

                <div id="historia-login-status" class="${uid ? 'estado-logeado' : 'estado-invitado'}">
                ${uid ?
                `<p>¡Hola, **${displayName.split(' ')[0]}**!</p> ${mensajeGuardado}`
                :
                `<button id="btnHistoriaLoginStatus" class="btn-principal btn-login-floating">🔒 Inicia sesión</button>`
                }
                </div>
                
                <div class="tarjeta-nivel">
                    <h2>Selecciona una dificultad</h2>
                    
                    <div class="dificultades-grid">
                        ${['facil', 'normal', 'dificil'].map(dif => {
                            const nombreCapitalizado = dif.charAt(0).toUpperCase() + dif.slice(1);
                            return `
                                <div class="tarjeta-dificultad dificultad-${dif}" data-dificultad="${dif}">
                                    <h3>${nombreCapitalizado}</h3>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div id="historia-slot"></div>

                    <div class="menu-botones mt-3">
                        <button id="btnMenuPrincipal" class="btn-secundario">← Menú principal</button>
                    </div>
                </div>
            </div>
        `;

        // 💡 AGREGADO: Evento para abrir el tutorial
        document.getElementById("btnAyudaHistoria").onclick = () => {
            mostrarGuia("historia");
        };

        inicializarEventosHistoria(progreso);
    });
}

/* =========================================================
🔄 LÓGICA DE EVENTOS (HOVER y CLICK)
========================================================= */

function inicializarEventosHistoria(progreso) {
    const dificultadesGrid = document.querySelector('.dificultades-grid');
    const historiaSlot = document.getElementById('historia-slot');
    let lastHoveredDificultad = null;

    const actualizarSlot = (dificultad) => {
        const difKey = dificultad.toLowerCase();
        const progresoDificultad = progreso[difKey];
        const uid = auth.currentUser ? auth.currentUser.uid : null;
        const yaJugado = progresoDificultad && progresoDificultad.estado;
        const estadoActual = progresoDificultad ? progresoDificultad.estado : null;
        const nivelesCompletados = progresoDificultad ? progresoDificultad.nivelesCompletados || 0 : 0;
        const nombreCapitalizado = dificultad.charAt(0).toUpperCase() + dificultad.slice(1);

        if (!dificultad) {
            historiaSlot.classList.remove('visible');
            historiaSlot.innerHTML = '';
            return;
        }

        const tarjetaClase = yaJugado ? 'historia-tarjeta-progreso' : 'historia-tarjeta-blanca';
        const mostrarBotonBorrar = uid && yaJugado;

        historiaSlot.innerHTML = `
            <div class="historia-tarjeta ${tarjetaClase} dificultad-${difKey}">
                <h3>${nombreCapitalizado}</h3>
                ${yaJugado ? `
                    <p>Partida guardada en: **${estadoActual}**</p>
                    <p>Progreso: **${nivelesCompletados}** niveles</p>
                    <div class="historia-tarjeta-botones">
                        <button class="btn-continuar" data-dificultad="${difKey}" data-estado="${estadoActual}">▶ Continuar</button>
                        ${mostrarBotonBorrar ? `<button class="btn-borrar" data-dif="${difKey}">🗑 Borrar</button>` : ''}
                    </div>
                ` : `
                    <p>Comienza una nueva aventura en esta dificultad.</p>
                    <button class="btn-crear" data-dificultad="${difKey}">➕ Crear partida</button>
                `}
            </div>
        `;
        historiaSlot.classList.add('visible');
    };

    dificultadesGrid.addEventListener('mouseover', (e) => {
        const tarjeta = e.target.closest('.tarjeta-dificultad');
        if (tarjeta) {
            const dificultad = tarjeta.dataset.dificultad;
            const nombreDificultad = dificultad.charAt(0).toUpperCase() + dificultad.slice(1);

            if (lastHoveredDificultad !== nombreDificultad) {
                lastHoveredDificultad = nombreDificultad;
                document.querySelectorAll('.tarjeta-dificultad').forEach(t => t.classList.remove('hover-active'));
                tarjeta.classList.add('hover-active');
                actualizarSlot(nombreDificultad);

                // Lógica de posicionamiento original mantenida
                const slotElement = document.getElementById('historia-slot');
                const tarjetaNivelContainer = document.querySelector('.tarjeta-nivel');
                const rectTarjetaNivel = tarjetaNivelContainer.getBoundingClientRect();
                const rectTarjeta = tarjeta.getBoundingClientRect();
                const anchoTarjetaProgreso = 280; 

                const centroXTarjetaRelativo = rectTarjeta.left + rectTarjeta.width / 2 - rectTarjetaNivel.left;
                const posicionLeft = centroXTarjetaRelativo - (anchoTarjetaProgreso / 2);
                const posicionTop = dificultadesGrid.offsetTop + dificultadesGrid.offsetHeight + 20;

                slotElement.style.position = 'absolute';
                slotElement.style.left = `${posicionLeft}px`;
                slotElement.style.top = `${posicionTop}px`;
                slotElement.style.transform = `none`;
                historiaSlot.classList.add('visible');
            }
        }
    });

    dificultadesGrid.addEventListener('mouseleave', (e) => {
        setTimeout(() => {
            if (!e.relatedTarget || (!dificultadesGrid.contains(e.relatedTarget) && !historiaSlot.contains(e.relatedTarget))) {
                document.querySelectorAll('.tarjeta-dificultad').forEach(t => t.classList.remove('hover-active'));
                historiaSlot.classList.remove('visible');
                lastHoveredDificultad = null;
            }
        }, 100);
    });

    document.addEventListener('click', (e) => {
        const isDificultadClick = e.target.closest('.tarjeta-dificultad');
        const isSlotClick = e.target.closest('#historia-slot');
        if (!isDificultadClick && !isSlotClick && historiaSlot.classList.contains('visible')) {
            historiaSlot.classList.remove('visible');
            document.querySelectorAll('.tarjeta-dificultad').forEach(t => t.classList.remove('hover-active'));
            lastHoveredDificultad = null;
        }
    });
}

/* =========================================================
🗺️ VISTA DE SELECCIÓN DE ESTADO Y GUARDADO
========================================================= */

function mostrarSeleccionEstado(main, dificultad) {
    main.innerHTML = `
        <div class="historia-wrapper">
            <div class="tarjeta-nivel seleccion-estado dificultad-${dificultad}">
                <h2>Comenzar partida en ${dificultad.toUpperCase()}</h2>
                <p>Selecciona el estado inicial de tu aventura:</p>
                <div class="estado-selector">
                    <div class="tarjeta-estado" data-estado="Estado de México" data-dificultad="${dificultad}">
                        <h3>Estado de México</h3>
                        <p>Capital: Toluca</p>
                        <button class="btn-seleccionar" data-estado="Estado de México">Seleccionar</button>
                    </div>
                    <div class="tarjeta-estado" data-estado="Morelos" data-dificultad="${dificultad}">
                        <h3>Morelos</h3>
                        <p>Capital: Cuernavaca</p>
                        <button class="btn-seleccionar" data-estado="Morelos">Seleccionar</button>
                    </div>
                </div>
                <button id="btnVolverDificultad" class="btn-secundario mt-3">← Volver a dificultad</button>
            </div>
        </div>
    `;
};

async function guardarSeleccionEstado(dificultad, estado) {
    const uid = auth.currentUser ? auth.currentUser.uid : null;
    const progresoInicial = {
        estado: estado,
        nivelesCompletados: 0,
        ultimoNivel: null,
        [estado]: { preguntasCorrectasTotales: 0, porcentajeEstado: 0, niveles: {} }
    };

    if (uid) {
        try {
            const userDocRef = doc(db, "usuarios", uid);
            const docSnap = await getDoc(userDocRef);
            let progresoHistoria = docSnap.exists() ? docSnap.data().progresoHistoria || {} : {};
            progresoHistoria[dificultad] = progresoInicial;
            await setDoc(userDocRef, { progresoHistoria: progresoHistoria }, { merge: true });
        } catch (error) { console.warn("Error en Firebase", error); }
    } else {
        let progresoLocal = obtenerProgresoLocal();
        progresoLocal[dificultad] = progresoInicial;
        guardarProgresoLocal(progresoLocal);
    }

    const main = document.querySelector('main');
    if (main) mostrarMapa(main, dificultad, estado);
}

/* =========================================================
🎧 LISTENERS Y ESTADO
========================================================= */

onAuthStateChanged(auth, async (user) => {
    const progresoLocal = obtenerProgresoLocal();
    const main = document.querySelector('main');
    if (user && Object.keys(progresoLocal).length > 0) {
        await migrarProgresoLocal(user.uid, progresoLocal);
        if (main && main.contains(document.getElementById('historia-login-status'))) {
            cargarModoHistoria(main);
        }
    }
});

document.addEventListener("click", async (e) => {
    const main = document.querySelector('main');

    if (e.target.classList.contains("btn-borrar") && auth.currentUser) {
        await borrarPartidaFirebase(e.target.dataset.dif, auth.currentUser.uid);
    }
    else if (e.target.classList.contains("btn-crear")) {
        mostrarSeleccionEstado(main, e.target.dataset.dificultad);
    }
    else if (e.target.classList.contains("btn-continuar")) {
        mostrarMapa(main, e.target.dataset.dificultad, e.target.dataset.estado);
    }
    else if (e.target.classList.contains("btn-seleccionar")) {
        const estado = e.target.dataset.estado;
        const tarjetaEstado = e.target.closest('.tarjeta-estado');
        guardarSeleccionEstado(tarjetaEstado.dataset.dificultad, estado);
    }
    else if (e.target.id === "btnVolverDificultad") {
        cargarModoHistoria(main);
    }
    else if (e.target.id === "btnMenuPrincipal") {
        cargarMenuPrincipal(main, auth.currentUser);
    }
    else if (e.target.id === "btnHistoriaLoginStatus") {
        signInWithGoogle(main);
    }
});