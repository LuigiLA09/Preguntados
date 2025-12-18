/* =========================================================
   📦 NIVELES.JS — Conexión a preguntas_EdoMex / preguntas_Morelos
   ========================================================= */
import { mostrarMapa } from "./Mapa.js";
import { mostrarGuia } from "./Tutorial.js";
import { collection, query, where, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let preguntasNivel = [];
let indicePregunta = 0;
let aciertosTemporales = 0;
let temporizador;

export function cargarNivel(main, nivel, dificultad, estado) {
    preguntasNivel = [];
    indicePregunta = 0;
    aciertosTemporales = 0;
    if (temporizador) clearInterval(temporizador);

    // Renderizado para ocupar el espacio azul (modulo-juego)
    main.innerHTML = `
        <div class="mapa-pantalla-completa fade-in">
            <aside class="sidebar-mapa">
                <div class="cabecera-info">
                    <h2 class="estado-titulo-amarillo">${nivel.titulo}</h2>
                    <p class="txt-instruccion-blanca">${estado} - ${dificultad}</p>
                </div>
                <div id="contenedor-guia-fijo" class="zona-guia-superior"></div>
                <div id="tutorial-dinamico" class="espacio-interactivo">
                    <p class="txt-instruccion-blanca">¡Gira la ruleta!</p>
                </div>
                <div class="botones-sidebar-bottom">
                    <button id="btnAyudaNivel" class="btn-interrogacion-azul">?</button>
                    <button id="btnPausa" class="btn-pausa">⏸ Pausa</button>
                </div>
            </aside>
            <section id="modulo-juego" style="flex: 1; display: flex; flex-direction: column; height: 100%;">
                 <div class="nivel-wrapper" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px;">
                    <div class="tarjeta-nivel" style="width: 100%; max-width: 650px; height: 90%; max-height: 600px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: white; border-radius: 40px; box-shadow: 0 15px 35px rgba(0,0,0,0.3);">
                        <div class="ruleta-container">
                            <div class="indicador-ruleta"></div>
                            <div id="ruleta-fisica" class="ruleta-img">
                                <div class="etiq">Historia</div>
                                <div class="etiq">Cultura</div>
                                <div class="etiq">Gastronomía</div>
                                <div class="etiq">Geografía</div>
                                <div class="etiq">Lugares</div>
                            </div>
                        </div>
                        <div class="cont-btn-girar" style="margin-top: 25px;">
                            <button id="btnGirar" class="btn-jugar-amarillo">🎡 GIRAR RULETA</button>
                        </div>
                    </div>
                 </div>
            </section>
        </div>
    `;

    document.getElementById("btnGirar").onclick = () => iniciarRuleta(main, nivel, dificultad, estado);
}

async function iniciarRuleta(main, nivel, dificultad, estado) {
    const btn = document.getElementById("btnGirar");
    const ruleta = document.getElementById("ruleta-fisica");
    btn.disabled = true;

    const temas = ["Historia", "Cultura", "Gastronomía", "Geografía", "Lugares"];
    const indexAleatorio = Math.floor(Math.random() * temas.length);
    const temaElegido = temas[indexAleatorio];

    ruleta.style.transform = `rotate(-${1800 + (indexAleatorio * 72)}deg)`;

    try {
        // 1. SELECCIÓN DE COLECCIÓN EXACTA
        let colName = "";
        if (estado === "Estado de México") colName = "preguntas_EdoMex";
        else if (estado === "Morelos") colName = "preguntas_Morelos";

        // 2. NORMALIZACIÓN DE DIFICULTAD (JSON usa "Fácil", "Medio", "Difícil")
        let difQuery = dificultad.toLowerCase().includes("facil") ? "Fácil" : 
                       dificultad.toLowerCase().includes("medio") ? "Medio" : "Difícil";

        console.log(`📡 Consultando: ${colName} | Tema: ${temaElegido} | Dif: ${difQuery}`);

        const q = query(
            collection(window.db, colName), 
            where("tema", "==", temaElegido), 
            where("dificultad", "==", difQuery)
        );

        const querySnapshot = await getDocs(q);
        preguntasNivel = [];
        querySnapshot.forEach(doc => preguntasNivel.push(doc.data()));
        
        preguntasNivel.sort(() => Math.random() - 0.5);

    } catch (error) {
        console.error("❌ Error en Firebase:", error);
    }

    setTimeout(() => {
        if (preguntasNivel.length === 0) {
            alert(`No se encontraron preguntas. Verifica que la colección sea "${estado === "Estado de México" ? "preguntas_EdoMex" : "preguntas_Morelos"}"`);
            btn.disabled = false;
        } else {
            presentarPregunta(main, nivel, dificultad, estado, temaElegido);
        }
    }, 4500);
}

function presentarPregunta(main, nivel, dificultad, estado, tema) {
    if (indicePregunta >= 5 || indicePregunta >= preguntasNivel.length) {
        finalizarNivel(main, nivel, dificultad, estado);
        return;
    }

    const p = preguntasNivel[indicePregunta];
    document.getElementById("modulo-juego").innerHTML = `
        <div class="nivel-wrapper" style="flex: 1; display: flex; align-items: center; justify-content: center;">
            <div class="pregunta-layout fade-in" style="width: 90%; max-width: 750px; background: white; padding: 40px; border-radius: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span class="tema-badge" style="background: #3498db; color: white; padding: 8px 15px; border-radius: 10px; font-weight: bold;">${tema}</span>
                    <div class="timer-barra" style="font-weight: bold; font-size: 1.2rem;">⏱ <span id="contador">30</span>s</div>
                </div>
                <h3 style="margin-bottom: 30px; font-size: 1.4rem; color: #2c3e50; line-height: 1.4;">${p.pregunta}</h3>
                <div class="opciones-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    ${p.opciones.map(o => `<button class="btn-opcion" style="padding: 15px; border-radius: 10px; border: 2px solid #ecf0f1; background: #f8f9fa; cursor: pointer; font-size: 1rem; transition: 0.3s;">${o}</button>`).join('')}
                </div>
            </div>
        </div>
    `;

    iniciarContador(main, nivel, dificultad, estado, tema);

    document.querySelectorAll(".btn-opcion").forEach(btn => {
        btn.onclick = () => {
            if(document.querySelector(".btn-correcta") || document.querySelector(".btn-incorrecta")) return;
            clearInterval(temporizador);
            
            // Comparación con campo 'respuesta' del JSON
            if(btn.innerText.trim() === p.respuesta.toString().trim()) {
                btn.style.background = "#2ecc71";
                btn.style.color = "white";
                btn.classList.add("btn-correcta");
                aciertosTemporales++;
            } else {
                btn.style.background = "#e74c3c";
                btn.style.color = "white";
                btn.classList.add("btn-incorrecta");
            }

            setTimeout(() => {
                indicePregunta++;
                presentarPregunta(main, nivel, dificultad, estado, tema);
            }, 1500);
        };
    });
}

function iniciarContador(main, nivel, dificultad, estado, tema) {
    let tiempo = 30;
    temporizador = setInterval(() => {
        tiempo--;
        const c = document.getElementById("contador");
        if(c) c.innerText = tiempo;
        if(tiempo <= 0) {
            clearInterval(temporizador);
            indicePregunta++;
            presentarPregunta(main, nivel, dificultad, estado, tema);
        }
    }, 1000);
}

async function finalizarNivel(main, nivel, dificultad, estado) {
    // 1. LocalStorage
    const data = JSON.parse(localStorage.getItem('progresoHistoriaInvitado') || "{}");
    if(!data[dificultad]) data[dificultad] = {};
    if(!data[dificultad][estado]) data[dificultad][estado] = { niveles: {} };
    data[dificultad][estado].niveles[nivel.titulo] = { aciertos: aciertosTemporales, completado: true };
    localStorage.setItem('progresoHistoriaInvitado', JSON.stringify(data));

    // 2. ACTUALIZAR COLECCIÓN "usuarios" (Plural)
    const userId = localStorage.getItem("userId"); 
    if (userId) {
        try {
            const userRef = doc(window.db, "usuarios", userId);
            await updateDoc(userRef, {
                puntos: increment(aciertosTemporales * 10),
                niveles_completados: increment(1)
            });
            console.log("✅ Datos guardados en la colección 'usuarios'");
        } catch (e) {
            console.error("Error al guardar en Firebase 'usuarios':", e);
        }
    }

    document.getElementById("modulo-juego").innerHTML = `
        <div class="nivel-wrapper" style="flex: 1; display: flex; align-items: center; justify-content: center;">
            <div class="resumen-card tarjeta-nivel" style="padding: 50px; background: white; border-radius: 30px; text-align: center;">
                <h2 style="font-size: 2rem; color: #2c3e50;">¡Nivel Terminado!</h2>
                <div style="font-size: 4rem; margin: 20px 0; color: #f1c40f; font-weight: bold;">${aciertosTemporales}/5</div>
                <p style="margin-bottom: 25px; color: #7f8c8d;">Has ganado ${aciertosTemporales * 10} puntos.</p>
                <button id="btnVolverMapa" class="btn-jugar-amarillo">Continuar</button>
            </div>
        </div>
    `;
    document.getElementById("btnVolverMapa").onclick = () => mostrarMapa(main, dificultad, estado);
} 