const modos = [
  {
    nombre: "Estado de México",
    subtitulo: "Estado de México",
    etiqueta: "Tradición y modernidad",
    descripcion: "Desde Teotihuacán hasta Valle de Bravo. Prepárate para retos que combinan historia y naturaleza.",
    badges: ["Capital Toluca", "Volcanes Guardianes", "Cocina mestiza"],
    gradient: "linear-gradient(135deg, rgba(27, 94, 32, 0.95), rgba(211, 47, 47, 0.75))"
  },
  {
    nombre: "Estado de Morelos",
    subtitulo: "Estado de Morelos",
    etiqueta: "Jardín de la nación",
    descripcion: "Explora Cuernavaca, Tepoztlán y las rutas de Zapata en desafíos llenos de color y folklore.",
    badges: ["Clima eterno", "Ruta de Zapata", "Magia en Tepoztlán"],
    gradient: "linear-gradient(135deg, rgba(108, 75, 165, 0.92), rgba(244, 162, 89, 0.85))"
  },
  {
    nombre: "Reto Centro",
    subtitulo: "Reto Centro",
    etiqueta: "Duelo interestatal",
    descripcion: "Combina preguntas de ambos estados y demuestra quién domina el corazón cultural de México.",
    badges: ["Trivia mixta", "Contrastes culturales", "Comparativas históricas"],
    gradient: "linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(244, 162, 89, 0.65))"
  }
];

let indice = 0;

const carousel = document.getElementById("mode-carousel");
const subtitle = document.getElementById("mode-subtitle");
const statsBox = document.getElementById("stats-box");
const leftArrow = document.getElementById("left-arrow");
const rightArrow = document.getElementById("right-arrow");

// Construir botones del carrusel
modos.forEach((modo, index) => {
  const button = document.createElement("button");
  button.className = "mode-card";
  button.innerHTML = `
    <span>${modo.etiqueta}</span>
    <strong>${modo.nombre}</strong>
    <p>${modo.descripcion}</p>
  `;
  button.style.setProperty("--card-gradient", modo.gradient);
  button.addEventListener("click", () => {
    indice = index;
    actualizarUI();
  });
  carousel.appendChild(button);
});

const cards = Array.from(document.querySelectorAll(".mode-card"));

function actualizarUI() {
  const modoActual = modos[indice];
  subtitle.textContent = modoActual.subtitulo;

  cards.forEach((card, idx) => {
    card.classList.toggle("active", idx === indice);
  });

  const cardWidth = cards[0]?.offsetWidth ?? 0;
  const gap = 24; // Debe coincidir con gap del contenedor
  const offset = -(cardWidth + gap) * indice;
  carousel.style.transform = `translateX(${offset}px)`;

  statsBox.innerHTML = `
    <h3>${modoActual.nombre}</h3>
    <p>${modoActual.descripcion}</p>
    <div class="badge-row"></div>
  `;

  const badgesContainer = statsBox.querySelector(".badge-row");
  modoActual.badges.forEach((badge) => {
    const badgeEl = document.createElement("div");
    badgeEl.className = "badge";
    badgeEl.textContent = badge;
    badgesContainer.appendChild(badgeEl);
  });

  leftArrow.disabled = indice === 0;
  rightArrow.disabled = indice === modos.length - 1;
}

leftArrow.addEventListener("click", () => {
  if (indice > 0) {
    indice -= 1;
    actualizarUI();
  }
});

rightArrow.addEventListener("click", () => {
  if (indice < modos.length - 1) {
    indice += 1;
    actualizarUI();
  }
});

window.addEventListener("resize", () => {
  actualizarUI();
});

// Primera renderización
actualizarUI();

// --- Modales ---
const modalAjustes = document.getElementById("modal-ajustes");
const modalLogros = document.getElementById("modal-logros");
const btnAjustes = document.getElementById("btn-ajustes");
const btnLogros = document.getElementById("btn-logros");
const closeAjustes = document.getElementById("close-ajustes");
const closeLogros = document.getElementById("close-logros");

btnAjustes.addEventListener("click", () => {
  modalAjustes.style.display = "flex";
});

btnLogros.addEventListener("click", () => {
  modalLogros.style.display = "flex";
});

closeAjustes.addEventListener("click", () => {
  modalAjustes.style.display = "none";
});

closeLogros.addEventListener("click", () => {
  modalLogros.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modalAjustes) {
    modalAjustes.style.display = "none";
  }
  if (event.target === modalLogros) {
    modalLogros.style.display = "none";
  }
});

// --- Control de Volumen (placeholder) ---
const volumenFondo = document.getElementById("volumen-fondo");
const volumenSecundario = document.getElementById("volumen-secundario");

volumenFondo?.addEventListener("input", (event) => {
  console.log("Volumen de fondo:", event.target.value);
});

volumenSecundario?.addEventListener("input", (event) => {
  console.log("Volumen secundario:", event.target.value);
});
