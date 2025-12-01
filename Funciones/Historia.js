/* =========================================================
   📖 HISTORIA.JS — Modo Historia completo (con guardado y selección)
   =========================================================
   Controla:
   ✅ Menú de dificultad
   ✅ Detección de partida guardada (continuar / nueva)
   ✅ Selección de estado (con fondo de México)
   ========================================================= */

import { mostrarMapa } from "./Mapa.js";

/* =========================================================
   🎮 ENTRADA PRINCIPAL
   ========================================================= */
export function cargarModoHistoria(main) {
  main.classList.remove("fade-out");
  main.classList.add("fade-in");

  const progreso = obtenerProgresoGlobal();

  main.innerHTML = `
  <div class="historia-wrapper fade-in">
    <div class="tarjeta-nivel">
      <h2>Selecciona tu dificultad</h2>
      <p>Comienza tu aventura respondiendo preguntas en diferentes niveles.</p>

      <div class="dificultades-grid">
        ${crearTarjeta("fácil", "#81c784", progreso.facil.porcentaje, progreso.facil.completados)}
        ${crearTarjeta("media", "#fff176", progreso.media.porcentaje, progreso.media.completados)}
        ${crearTarjeta("difícil", "#ef9a9a", progreso.dificil.porcentaje, progreso.dificil.completados)}
      </div>

      <div class="menu-botones">
        <button id="btnMenu" class="btn-secundario">← Menú principal</button>
      </div>
    </div>
  </div>
  `;

  // 🧭 Selección de dificultad
  document.querySelectorAll(".tarjeta-dificultad").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dificultad = btn.dataset.dif;
      manejarGuardado(main, dificultad);
    });
  });

  // 🔙 Volver al menú principal
  document.getElementById("btnMenu").addEventListener("click", () => {
    import("./Preguntados.js").then(({ cargarMenuPrincipal }) =>
      cargarMenuPrincipal(main)
    );
  });
}

/* =========================================================
   💾 FUNCIÓN — DETECTAR PARTIDA Y MOSTRAR TARJETA CONTEXTUAL
   ========================================================= */
function manejarGuardado(main, dificultad) {
  const data = JSON.parse(localStorage.getItem("preguntados_historia_progreso") || "{}");
  const partida = data[dificultad];

  // Verificar progreso real
  let tieneProgreso = false;
  if (partida && typeof partida === "object") {
    for (const estado in partida) {
      const info = partida[estado];
      if (info?.porcentajeEstado > 0 || Object.keys(info.niveles || {}).length > 0) {
        tieneProgreso = true;
        break;
      }
    }
  }

  // 🔹 Eliminar cualquier tarjeta anterior
  const existente = document.getElementById("historia-slot");
  if (existente) existente.remove();

  // 🔹 Crear tarjeta flotante contextual
  const slot = document.createElement("div");
  slot.id = "historia-slot";

  if (tieneProgreso) {
    slot.innerHTML = `
      <div class="historia-tarjeta-progreso fade-in">
        <h3>Partida guardada (${dificultad})</h3>
        <p>Tienes una partida en curso. ¿Qué deseas hacer?</p>
        <div class="historia-tarjeta-botones">
          <button class="btn-continuar">▶ Continuar</button>
          <button class="btn-crear">🆕 Nueva partida</button>
          <button class="btn-borrar">❌ Cancelar</button>
        </div>
      </div>
    `;
  } else {
    slot.innerHTML = `
      <div class="historia-tarjeta-blanca fade-in">
        <h3>Nueva partida (${dificultad})</h3>
        <p>No hay progreso guardado. ¡Comienza tu aventura!</p>
        <div class="historia-tarjeta-botones">
          <button class="btn-crear">🚀 Iniciar partida</button>
          <button class="btn-borrar">❌ Cancelar</button>
        </div>
      </div>
    `;
  }

  // 🔹 Insertar justo debajo del botón de dificultad clicado
const tarjetaSeleccionada = main.querySelector(`.tarjeta-dificultad[data-dif="${dificultad}"]`);
if (tarjetaSeleccionada) {
  // Crear contenedor dinámico
  const contenedor = document.createElement("div");
  contenedor.classList.add("tarjeta-slot-contenedor");
  contenedor.appendChild(slot);

  // Eliminar tarjetas previas (solo una a la vez)
  document.querySelectorAll(".tarjeta-slot-contenedor").forEach((el) => el.remove());

  // Insertar justo después del botón clicado
  tarjetaSeleccionada.insertAdjacentElement("afterend", contenedor);

  // Animación suave de entrada
  setTimeout(() => {
    slot.classList.add("visible");
  }, 10);
}


  // 🔸 Eventos según caso
  const btnContinuar = slot.querySelector(".btn-continuar");
  const btnNueva = slot.querySelector(".btn-crear");
  const btnCancelar = slot.querySelector(".btn-borrar");

  if (btnContinuar) {
    btnContinuar.addEventListener("click", () => {
      const estados = Object.keys(partida);
      const estadoActual = estados.length > 0 ? estados[0] : "Estado de México";
      mostrarMapa(main, dificultad, estadoActual);
    });
  }

  if (btnNueva) {
    btnNueva.addEventListener("click", () => {
      if (tieneProgreso && confirm("⚠️ Esto borrará tu partida anterior. ¿Continuar?")) {
        delete data[dificultad];
        localStorage.setItem("preguntados_historia_progreso", JSON.stringify(data));
      }
      mostrarSeleccionEstado(main, dificultad);
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      slot.remove();
    });
  }
}



/* =========================================================
   🗺️ SELECCIÓN DE ESTADO (con fondo México)
   ========================================================= */
function mostrarSeleccionEstado(main, dificultad) {
  main.innerHTML = `
    <div class="estado-layout fade-in">
      <img src="./Imagenes/Mexico.jpg" alt="Mapa de México" class="mapa-fondo" />
      <div class="estado-overlay">
        <h2>Selecciona un estado para comenzar</h2>
        <div class="estado-botones">
          <button class="estado-btn" data-estado="Estado de México">🏔 Estado de México</button>
          <button class="estado-btn" data-estado="Morelos">🌄 Morelos</button>
        </div>
        <p class="nota">Tu aventura empezará en el estado seleccionado.</p>
      </div>
    </div>
  `;

  // ⚙️ Evento al seleccionar estado
  document.querySelectorAll(".estado-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const estado = btn.dataset.estado;
      const overlay = document.querySelector(".estado-overlay");
      overlay.style.opacity = "0";
      setTimeout(() => {
        mostrarMapa(main, dificultad, estado);
      }, 800);
    });
  });
}

/* =========================================================
   📊 PROGRESO GLOBAL
   ========================================================= */
function obtenerProgresoGlobal() {
  const data = JSON.parse(localStorage.getItem("preguntados_historia_progreso") || "{}");

  return {
    facil: calcularProgreso(data.facil),
    media: calcularProgreso(data.media),
    dificil: calcularProgreso(data.dificil),
  };
}

function calcularProgreso(difData) {
  if (!difData) return { porcentaje: 0, completados: 0 };

  const estados = Object.values(difData);
  let total = 0, completados = 0;

  estados.forEach((estado) => {
    if (estado.porcentajeEstado > 0) completados++;
    total += estado.porcentajeEstado || 0;
  });

  return { porcentaje: Math.min(total, 100), completados };
}

/* =========================================================
   🧩 TARJETAS DE DIFICULTAD
   ========================================================= */
function crearTarjeta(dif, color, porcentaje, completados) {
  const textoDif = dif.charAt(0).toUpperCase() + dif.slice(1);
  return `
    <div class="tarjeta-dificultad" data-dif="${dif}" style="background:${color}">
      <h3>${textoDif}</h3>
      <p>Progreso: ${porcentaje.toFixed(1)}%</p>
      <p>Niveles completados: ${completados}/8</p>
      <button class="btn-borrar" data-dif="${dif}">🗑 Borrar partida</button>
    </div>
  `;
}

/* =========================================================
   🗑 BORRAR PARTIDA DIRECTA
   ========================================================= */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-borrar")) {
    const dif = e.target.dataset.dif;
    const data = JSON.parse(localStorage.getItem("preguntados_historia_progreso") || "{}");
    if (data[dif]) delete data[dif];
    localStorage.setItem("preguntados_historia_progreso", JSON.stringify(data));
    alert(`⚠️ Se ha borrado la partida de dificultad ${dif.toUpperCase()}`);
    location.reload();
  }
});
