/* =========================================================
   📖 TUTORIAL.JS — Sistema Central de Guías
   ========================================================= */

const CONTENIDOS_GUIA = {
    "menu": {
        titulo: "🏰 BIENVENIDO A EXPLORA MÉXICO",
        pasos: [
            { icon: "📜", texto: "MODO HISTORIA: Sigue la ruta de Morelos y Edo. Mex para liberar sus secretos." },
            { icon: "🎲", texto: "MODO LIBRE: Practica con temas específicos y configura tus propias reglas." },
            { icon: "🏛️", texto: "MUSEO: Consulta la enciclopedia del juego para asegurar tus respuestas." }
        ]
    },
    "mapa": {
        titulo: "🗺️ ESTRATEGIA DE EXPLORACIÓN",
        pasos: [
            { icon: "🔵", texto: "PUNTOS AZULES: Ruta principal. Debes completarlos para avanzar." },
            { icon: "🟡", texto: "PUNTOS AMARILLOS: Niveles extra (se abren tras el nivel 5)." },
            { icon: "🛤️", texto: "RIELES: Las líneas doradas indican caminos que ya dominaste." },
            { icon: "🖱️", texto: "INVESTIGACIÓN: Pasa el cursor sobre un punto para ver datos curiosos." }
        ]
    },
    "ruleta": {
        titulo: "🎡 LA RULETA DEL DESTINO",
        pasos: [
            { icon: "🌀", texto: "El azar elegirá entre Historia, Cultura, Gastronomía o Geografía." },
            { icon: "🧠", texto: "Prepárate: cada tema tiene su propio set de preguntas." }
        ]
    },
    "pregunta": {
        titulo: "⚡ EL MOMENTO DE LA VERDAD",
        pasos: [
            { icon: "⏳", texto: "TIEMPO: Tienes 30 segundos antes de que la pregunta expire." },
            { icon: "🎯", texto: "OBJETIVO: Responde correctamente 5 preguntas para ganar el nivel." },
            { icon: "✅", texto: "ACIERTOS: Tus récords se guardan y desbloquean el siguiente pueblo." }
        ]
    },
    "configuracion-libre": {
        titulo: "🛠️ PERSONALIZA TU RETO",
        pasos: [
            { icon: "⚙️", texto: "DIFICULTAD: Define cuántas vidas tienes o cuánto tiempo te damos." },
            { icon: "🔢", texto: "CANTIDAD: Elige partidas cortas (5) o maratones (30 preguntas)." }
        ]
    }
};

export function mostrarGuia(pantalla) {
    // Evitar duplicados
    const existente = document.querySelector(".overlay-tutorial");
    if (existente) existente.remove();

    const data = CONTENIDOS_GUIA[pantalla];
    if (!data) return;

    const overlay = document.createElement("div");
    overlay.className = "overlay-tutorial fade-in";
    overlay.innerHTML = `
        <div class="guia-ventana-emergente">
            <div class="guia-header">
                <h3>${data.titulo}</h3>
            </div>
            <div class="guia-cuerpo">
                ${data.pasos.map(p => `
                    <div class="guia-item">
                        <span class="guia-icon">${p.icon}</span>
                        <p>${p.texto}</p>
                    </div>
                `).join('')}
            </div>
            <div class="guia-footer">
                <button id="btnCerrarGuia" class="btn-principal">¡ENTENDIDO!</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Bloquear scroll de fondo si es necesario
    document.body.style.overflow = "hidden";

    const cerrar = () => {
        overlay.classList.add("fade-out");
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = "auto";
        }, 300);
    };

    overlay.querySelector("#btnCerrarGuia").onclick = cerrar;
    overlay.onclick = (e) => { if (e.target === overlay) cerrar(); };
}