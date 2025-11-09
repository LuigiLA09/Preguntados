// === Importación del menú principal ===
import { cargarMenuPrincipal } from "./Preguntados.js";

// === FUNCIÓN PARA CARGAR EL MODO HISTORIA ===
export function cargarModoHistoria() {
  const main = document.getElementById("main-container");

  // Reemplaza todo el contenido del <main> por la vista del modo historia
  main.innerHTML = `
    <section class="modo-historia fadeIn">
      <div class="historia-header">
        <h2>📜 Modo Historia</h2>
        <p>Embárcate en un recorrido por México mientras aprendes historia y cultura.</p>
      </div>

      <div class="historia-contenido">
        <div class="panel-info">
          <h3>Progreso actual</h3>
          <p><strong>Dificultad:</strong> <span id="difActual">—</span></p>
          <p><strong>Niveles completados:</strong> <span id="nivelesCompletos">0 / 10</span></p>
          <p><strong>Progreso total:</strong> <span id="progreso">0%</span></p>
        </div>

        <div class="panel-botones">
          <button id="btnNuevaPartida" class="boton-animado">🗺️ Nueva partida</button>
          <button id="btnVolverMenu" class="boton-animado">↩️ Volver al menú principal</button>
        </div>
      </div>

      <div class="historia-footer">
        <small>Versión inicial del modo Historia — © 2025 Proyecto Preguntados México</small>
      </div>
    </section>
  `;

  // === EVENTO BOTÓN VOLVER ===
  const btnVolver = document.getElementById("btnVolverMenu");
  btnVolver.addEventListener("click", () => {
    cargarMenuPrincipal();
    window.scrollTo(0, 0); // vuelve al inicio suave
  });

  // === EVENTO BOTÓN NUEVA PARTIDA ===
  const btnNuevaPartida = document.getElementById("btnNuevaPartida");
  btnNuevaPartida.addEventListener("click", () => {
    alert("🧩 Aquí se abrirá la selección de dificultad y mapa (en desarrollo).");
  });
}
