// === IMPORTACIÓN DE MÓDULOS ===
import { cargarModoHistoria } from "./Historia.js";

/* =========================================================
   INICIALIZACIÓN DEL JUEGO PRINCIPAL
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const main = document.getElementById("main"); // 🔹 asegúrate que sea <main id="main">
  
  if (!main) {
    console.error("❌ No se encontró el contenedor principal (#main)");
    return;
  }

  console.log("✅ Contenedor principal encontrado. Cargando menú principal...");
  cargarMenuPrincipal(main); // 🔹 ahora sí definido abajo
});

/* =========================================================
   MENÚ PRINCIPAL
   ========================================================= */
export function cargarMenuPrincipal(main) {
  // 🔹 Mostrar el header (si estaba oculto)
  const header = document.querySelector("header");
  if (header) header.classList.remove("oculto-historia");

  // 🔹 Limpiar el contenido del main
  main.innerHTML = "";

  // 🔹 Render del layout base
  main.innerHTML = `
    <div class="layout">
      <aside class="side side-left">
        <div id="sidePicture">
          <span class="image-label">Nevado de Toluca</span>
          <img src="./Imagenes/nevadodetoluca.jpg" alt="Nevado de Toluca">
        </div>
      </aside>

      <div class="main">
        <canvas id="miCanvas" width="880" height="480"></canvas>
      </div>

      <aside class="side side-right">
        <div id="sidePictureRight">
          <span class="image-label">Xochicalco, Morelos</span>
          <img src="./Imagenes/Xochicalco.jpg" alt="Xochicalco">
        </div>
      </aside>
    </div>
  `;

  inicializarCanvas(main);
}

/* =========================================================
   DIBUJO Y LÓGICA DEL CANVAS PRINCIPAL
   ========================================================= */
function inicializarCanvas(main) {
  const canvas = document.getElementById("miCanvas");
  if (!canvas) {
    console.error("❌ No se encontró el canvas principal");
    return;
  }

  const ctx = canvas.getContext("2d");

  /* === FUNCIONES AUXILIARES === */
  function dibujarRect(x, y, w, h, color, radio = 22) {
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
  }

  function dibujarTextoAjustado(texto, x, y, anchoMax, color = "#000", tamañoInicial = 18, centrado = false) {
    ctx.fillStyle = color;
    let tamaño = tamañoInicial;
    ctx.font = `${tamaño}px 'Poppins'`;
    while (ctx.measureText(texto).width > anchoMax && tamaño > 10) {
      tamaño -= 1;
      ctx.font = `${tamaño}px 'Poppins'`;
    }
    ctx.textAlign = centrado ? "center" : "left";
    ctx.fillText(texto, x, y);
  }

  /* === DATOS DEL MENÚ === */
  const categorias = [
    { nombre: "Historia", color: "#FFF7CD", borde: "#FFCC00", img: "https://static.vecteezy.com/system/resources/previews/031/738/194/non_2x/history-icon-design-free-png.png" },
    { nombre: "Cultura y Tradiciones", color: "#FFE3E3", borde: "#FF6B6B", img: "https://e7.pngegg.com/pngimages/856/819/png-clipart-computer-icons-culture-avatar-tradition-avatar-white-culture.png" },
    { nombre: "Gastronomía", color: "#E6F9E6", borde: "#56C596", img: "https://cdn-icons-png.flaticon.com/512/706/706164.png" },
    { nombre: "Geografía", color: "#E1F0FF", borde: "#3D8DF8", img: "https://static.vecteezy.com/system/resources/thumbnails/036/303/394/small_2x/ai-generated-earth-globe-clipart-global-sphere-illustration-transparent-background-planet-earth-graphic-world-map-icon-international-symbol-geography-concept-png.png" },
    { nombre: "Lugares Turísticos", color: "#FFE9F1", borde: "#FF9A9E", img: "https://cdn-icons-png.flaticon.com/512/744/744502.png" },
  ];

  const modos = [
    { nombre: "Modo Historia", color: "#E8EAF6", borde: "#5C6BC0", img: "https://cdn-icons-png.flaticon.com/512/2593/2593554.png" },
    { nombre: "Modo Libre", color: "#FFF0E6", borde: "#FF7043", img: "https://cdn-icons-png.flaticon.com/512/3159/3159310.png" },
  ];

  /* === PRE-CARGA DE IMÁGENES === */
  const imagenes = [];
  let cargadas = 0;
  const totalImagenes = categorias.length + modos.length;

  [...modos, ...categorias].forEach((cat) => {
    const img = new Image();
    img.src = cat.img;
    img.onload = () => {
      cargadas++;
      if (cargadas === totalImagenes) dibujarPantalla();
    };
    imagenes.push(img);
  });

  /* === DIBUJO COMPLETO === */
  function dibujarPantalla() {
    ctx.fillStyle = "#f4f4f9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradiente = ctx.createLinearGradient(0, 260, 0, 480);
    gradiente.addColorStop(0, "#A8C7FF");
    gradiente.addColorStop(1, "#EAF3FF");
    ctx.fillStyle = gradiente;
    ctx.fillRect(20, 280, canvas.width - 40, 180);

    dibujarModos();
    dibujarBotones();
  }

  /* === MODOS DE JUEGO === */
  function dibujarModos() {
    const ancho = 220, alto = 120, separacion = 90;
    const totalAncho = modos.length * (ancho + separacion) - separacion;
    const inicioX = (canvas.width - totalAncho) / 2;
    const y = 90;

    modos.forEach((modo, i) => {
      dibujarRect(inicioX + i * (ancho + separacion), y, ancho, alto, modo.color, 25);
      ctx.lineWidth = 3;
      ctx.strokeStyle = modo.borde;
      ctx.stroke();
      ctx.drawImage(imagenes[i], inicioX + i * (ancho + separacion) + ancho / 2 - 30, y + 15, 60, 60);
      dibujarTextoAjustado(modo.nombre, inicioX + i * (ancho + separacion) + ancho / 2, y + 105, ancho - 20, "#333", 18, true);
    });

    /* === CLICK EN MODO HISTORIA === */
    canvas.addEventListener("click", (e) => {
      const x = e.offsetX;
      const yClick = e.offsetY;
      const xModoHistoria = inicioX;
      const anchoModo = ancho;
      const yModo = y;
      const altoModo = alto;

      if (x > xModoHistoria && x < xModoHistoria + anchoModo && yClick > yModo && yClick < yModo + altoModo) {
        console.log("🕹️ Entrando al modo Historia...");
        const header = document.querySelector("header");
        if (header) header.classList.add("oculto-historia");
        cargarModoHistoria(main);
      }
    });
  }

  /* === BOTONES DE CATEGORÍAS === */
  function dibujarBotones() {
    const anchoBoton = 140, altoBoton = 150, separacion = 32;
    const totalAncho = categorias.length * (anchoBoton + separacion) - separacion;
    const inicioX = (canvas.width - totalAncho) / 2;
    const y = 300;

    categorias.forEach((cat, i) => {
      const x = inicioX + i * (anchoBoton + separacion);
      dibujarRect(x, y, anchoBoton, altoBoton, cat.color, 20);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = cat.borde;
      ctx.stroke();
      ctx.drawImage(imagenes[i + modos.length], x + anchoBoton / 2 - 30, y + 20, 60, 60);
      dibujarTextoAjustado(cat.nombre, x + anchoBoton / 2, y + 130, anchoBoton - 20, "#333", 15, true);
    });
  }

  /* === EFECTO HOVER === */
  canvas.addEventListener("mousemove", (e) => {
    const x = e.offsetX;
    const y = e.offsetY;
    dibujarPantalla();

    const hoverColor = (baseColor) => baseColor.replace(")", ", 0.92)").replace("rgb", "rgba");

    const anchoModo = 220, altoModo = 120, sepModo = 90;
    const totalAnchoModos = modos.length * (anchoModo + sepModo) - sepModo;
    const inicioXModos = (canvas.width - totalAnchoModos) / 2;
    const yModos = 90;

    modos.forEach((modo, i) => {
      const xModo = inicioXModos + i * (anchoModo + sepModo);
      if (x > xModo && x < xModo + anchoModo && y > yModos && y < yModos + altoModo) {
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 12;
        dibujarRect(xModo, yModos, anchoModo, altoModo, hoverColor(modo.color), 25);
        ctx.lineWidth = 4;
        ctx.strokeStyle = modo.borde;
        ctx.stroke();
        ctx.restore();

        ctx.drawImage(imagenes[i], xModo + anchoModo / 2 - 30, yModos + 15, 60, 60);
        dibujarTextoAjustado(modo.nombre, xModo + anchoModo / 2, yModos + 105, anchoModo - 20, "#222", 18, true);
      }
    });
  });
}
