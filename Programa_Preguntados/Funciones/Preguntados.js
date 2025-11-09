// === IMPORTACIÓN DEL MODO HISTORIA ===
import { cargarModoHistoria } from "./Historia.js";

// === INICIALIZACIÓN SEGURA ===
document.addEventListener("DOMContentLoaded", () => {
  const main = document.getElementById("main-container");

  if (!main) {
    console.error("❌ No se encontró el contenedor principal (#main-container)");
    return;
  }

  console.log("✅ Contenedor principal encontrado. Cargando menú principal...");
  cargarMenuPrincipal(main);
});

// === FUNCIÓN PRINCIPAL DEL MENÚ ===
function cargarMenuPrincipal(main) {
  main.innerHTML = `
    <div class="layout">
      <!-- Lateral Izquierdo -->
      <aside class="side side-left">
        <div id="sidePicture">
          <span class="image-label">Nevado de Toluca</span>
          <img src="./Imagenes/nevadodetoluca.jpg" alt="Nevado de Toluca">
        </div>
      </aside>

      <!-- Canvas Central -->
      <div class="main">
        <canvas id="miCanvas" width="1000" height="500"></canvas>
      </div>

      <!-- Lateral Derecho -->
      <aside class="side side-right">
        <div id="sidePictureRight">
          <span class="image-label">Xochicalco, Morelos</span>
          <img src="./Imagenes/Xochicalco.jpg" alt="Xochicalco">
        </div>
      </aside>
    </div>
  `;

  inicializarCanvas();
}

// === DIBUJO DEL CANVAS ===
function inicializarCanvas() {
  const canvas = document.getElementById("miCanvas");
  if (!canvas) {
    console.error("❌ No se encontró el canvas principal");
    return;
  }

  const ctx = canvas.getContext("2d");
  console.log("🎨 Inicializando Canvas...");

  // === FUNCIONES AUXILIARES ===
  function dibujarRect(x, y, w, h, color, radio = 22, borde = "#000") {
    ctx.beginPath();
    ctx.moveTo(x + radio, y);
    ctx.lineTo(x + w - radio, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radio);
    ctx.lineTo(x + w, y + h - radio);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radio, y + h);
    ctx.lineTo(x + radio, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radio);
    ctx.lineTo(x, y + radio);
    ctx.quadraticCurveTo(x, y, x + radio, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = borde;
    ctx.stroke();
  }

  function dibujarTexto(texto, x, y, color = "#000", tamaño = 18, centrado = true) {
    ctx.fillStyle = color;
    ctx.font = `${tamaño}px 'Poppins'`;
    ctx.textAlign = centrado ? "center" : "left";
    ctx.fillText(texto, x, y);
  }

  // === CATEGORÍAS ===
  const categorias = [
    { nombre: "Historia", color: "#FFF7CD", borde: "#FFCC00", img: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png" },
    { nombre: "Cultura y Tradiciones", color: "#FFE3E3", borde: "#FF6B6B", img: "https://cdn-icons-png.flaticon.com/512/2201/2201570.png" },
    { nombre: "Gastronomía", color: "#E6F9E6", borde: "#56C596", img: "https://cdn-icons-png.flaticon.com/512/706/706164.png" },
    { nombre: "Geografía", color: "#E1F0FF", borde: "#3D8DF8", img: "https://cdn-icons-png.flaticon.com/512/854/854929.png" },
    { nombre: "Lugares Turísticos", color: "#FFE9F1", borde: "#FF9A9E", img: "https://cdn-icons-png.flaticon.com/512/744/744502.png" },
  ];

  // === MODOS ===
  const modos = [
    { nombre: "Modo Historia", color: "#E8EAF6", borde: "#5C6BC0", img: "https://cdn-icons-png.flaticon.com/512/2593/2593554.png" },
    { nombre: "Modo Libre", color: "#FFF0E6", borde: "#FF7043", img: "https://cdn-icons-png.flaticon.com/512/3159/3159310.png" },
  ];

  // === CARGA DE IMÁGENES ===
  const imagenes = [];
  let cargadas = 0;
  const totalImagenes = categorias.length + modos.length;

  const todas = [...modos, ...categorias];
  todas.forEach((item, index) => {
    const img = new Image();
    img.src = item.img;
    img.onload = () => {
      cargadas++;
      if (cargadas === totalImagenes) dibujarPantalla();
    };
    img.onerror = () => {
      console.warn(`⚠️ Imagen no cargada: ${item.nombre}`);
      cargadas++;
      if (cargadas === totalImagenes) dibujarPantalla();
    };
    imagenes.push(img);
  });

  // === FUNCIONES DE DIBUJO ===
  function dibujarPantalla() {
    console.log("🖼️ Dibujando interfaz principal...");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo general
    ctx.fillStyle = "#f4f4f9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fondo inferior decorativo
    const gradiente = ctx.createLinearGradient(0, 250, 0, 500);
    gradiente.addColorStop(0, "#A8C7FF");
    gradiente.addColorStop(1, "#EAF3FF");
    ctx.fillStyle = gradiente;
    ctx.fillRect(20, 250, canvas.width - 40, 230);

    dibujarModos();
    dibujarBotones();
  }

  function dibujarModos() {
    const ancho = 220, alto = 120, separacion = 80;
    const totalAncho = modos.length * (ancho + separacion) - separacion;
    const inicioX = (canvas.width - totalAncho) / 2;
    const y = 90;

    modos.forEach((modo, i) => {
      const x = inicioX + i * (ancho + separacion);
      dibujarRect(x, y, ancho, alto, modo.color, 25, modo.borde);
      const img = imagenes[i];
      if (img.complete) ctx.drawImage(img, x + ancho / 2 - 30, y + 15, 60, 60);
      dibujarTexto(modo.nombre, x + ancho / 2, y + 105, "#333", 18, true);
    });

    // Click en "Modo Historia"
    canvas.addEventListener("click", (e) => {
      const x = e.offsetX;
      const yClick = e.offsetY;
      if (x > inicioX && x < inicioX + ancho && yClick > y && yClick < y + alto) {
        console.log("🕹️ Entrando al modo Historia...");
        cargarModoHistoria();
      }
    });
  }

  function dibujarBotones() {
    const anchoBoton = 140;
    const altoBoton = 150;
    const separacion = 32;
    const totalAncho = categorias.length * (anchoBoton + separacion) - separacion;
    const inicioX = (canvas.width - totalAncho) / 2;
    const y = 315;

    categorias.forEach((cat, i) => {
      const x = inicioX + i * (anchoBoton + separacion);
      dibujarRect(x, y, anchoBoton, altoBoton, cat.color, 20, cat.borde);

      const img = imagenes[i + modos.length];
      if (img.complete) ctx.drawImage(img, x + anchoBoton / 2 - 30, y + 16, 60, 60);
      dibujarTexto(cat.nombre, x + anchoBoton / 2, y + 128, "#333", 15, true);
    });
  }
}
