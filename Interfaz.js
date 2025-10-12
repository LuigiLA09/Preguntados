// --- Botones de cambio de modo ---
const modos = ["Modo 1", "Modo 2", "Modo 3"];
let indice = 0;

const mainButton = document.getElementById("main-button");
const leftArrow = document.getElementById("left-arrow");
const rightArrow = document.getElementById("right-arrow");

function actualizarBoton() {
  mainButton.textContent = modos[indice];
  leftArrow.enabled = indice === 0;
  rightArrow.enabled = indice === modos.length - 1;
}

leftArrow.onclick = () => {
  if (indice > 0) {
    indice--;
    actualizarBoton();
  }
};

rightArrow.onclick = () => {
  if (indice < modos.length - 1) {
    indice++;
    actualizarBoton();
  }
};

actualizarBoton();

// --- Modales ---
const modalAjustes = document.getElementById("modal-ajustes");
const modalLogros = document.getElementById("modal-logros");

document.getElementById("btn-ajustes").onclick = () => modalAjustes.style.display = "flex";
document.getElementById("close-ajustes").onclick = () => modalAjustes.style.display = "none";

document.getElementById("btn-logros").onclick = () => modalLogros.style.display = "flex";
document.getElementById("close-logros").onclick = () => modalLogros.style.display = "none";

// Cerrar modal al hacer clic fuera
window.onclick = (e) => {
  if (e.target === modalAjustes) modalAjustes.style.display = "none";
  if (e.target === modalLogros) modalLogros.style.display = "none";
};

// --- Control de Volumen (por ahora solo muestra valores en consola) ---
document.getElementById("volumen-fondo").addEventListener("input", (e) => {
  console.log("Volumen de fondo:", e.target.value);
});

document.getElementById("volumen-secundario").addEventListener("input", (e) => {
  console.log("Volumen secundario:", e.target.value);
});
