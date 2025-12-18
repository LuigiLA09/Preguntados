// === IMPORTACIÓN DE MÓDULOS ===
import { cargarModoHistoria } from "./Historia.js";
import { cargarModoLibre } from "./Modo Libre.js";
import { mostrarGuia } from "./Tutorial.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth(); 

function getScaledMousePoint(canvas, event) {
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;
    return { x: event.offsetX * scaleX, y: event.offsetY * scaleY };
}

export function signInWithGoogle(main) {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then(() => console.log("✅ Login exitoso"))
        .catch((error) => console.error("❌ Error de auth:", error));
}

export function cargarMenuPrincipal(main, user) {
    if (window.controlSonidoGlobal) window.controlSonidoGlobal.play('menu');

    const header = document.querySelector("header");
    if (header) header.classList.remove("oculto-historia");

    const avatarURL = user?.photoURL || './Imagenes/default-avatar.png'; 
    const authHTML = user ? `
        <div class="user-info">
            <img src="${avatarURL}" alt="Avatar" class="user-avatar">
            <span>${user.displayName.split(' ')[0]}</span>
            <button id="btnLogout" class="btn-logout">Salir</button>
        </div>` : `
        <button id="btnLogin" class="btn-login">Iniciar con Google</button>`;

    const authStatus = document.getElementById("auth-status");
    if (authStatus) authStatus.innerHTML = authHTML;

    main.innerHTML = `
        <div class="layout">
          <button id="btnAyudaMenu" class="btn-ayuda-flotante">?</button>
          <aside class="side side-left">
            <div id="sidePicture" class="tarjeta-lateral">
              <span class="image-label">Nevado de Toluca</span>
              <img src="./Imagenes/nevadodetoluca.jpg" alt="Nevado de Toluca">
            </div>
          </aside>
          <div class="main-canvas">
                <canvas id="miCanvas" width="880" height="480"></canvas>
          </div>
          <aside class="side side-right">
            <div id="sidePictureRight" class="tarjeta-lateral">
              <span class="image-label">Xochicalco, Morelos</span>
              <img src="./Imagenes/Xochicalco.jpg" alt="Xochicalco">
            </div>
          </aside>
        </div>
    `;

    document.getElementById("btnAyudaMenu").onclick = () => mostrarGuia("menu");

    if (user) {
        document.getElementById("btnLogout")?.addEventListener('click', () => signOut(auth));
    } else {
        document.getElementById("btnLogin")?.addEventListener('click', () => signInWithGoogle(main));
    }

    inicializarCanvas(main, user);
}

function inicializarCanvas(main, currentUser) {
    const canvas = document.getElementById("miCanvas");
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const ANCHO_BOTON = 240, ALTO_BOTON = 140, SEPARACION = 40, Y_MODOS = 100, Y_MUSEO = 290;
    const modos = [
        { nombre: "Modo Historia", color: "#E8EAF6", img: "https://cdn-icons-png.flaticon.com/512/2593/2593554.png" },
        { nombre: "Modo Libre", color: "#FFF0E6", img: "https://cdn-icons-png.flaticon.com/512/3159/3159310.png" },
    ];
    const museo = { nombre: "Museo/Curiosidades", color: "#F0E6FF", img: "https://cdn-icons-png.flaticon.com/512/3233/3233816.png" };
    const elementos = [...modos, museo];
    const imagenes = [];
    let cargadas = 0;

    elementos.forEach((item) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = item.img;
        img.onload = () => {
            cargadas++;
            if (cargadas === elementos.length) dibujarPantalla();
        };
        imagenes.push(img);
    });

    function dibujarRect(x, y, w, h, color, radio = 22) {
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, w, h, radio) : ctx.rect(x, y, w, h);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function dibujarPantalla() {
        ctx.fillStyle = "#f4f4f9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Mensaje de progreso
        if (currentUser) {
            ctx.fillStyle = "#1B5E20";
            ctx.font = "600 16px 'Poppins', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`¡Hola ${currentUser.displayName.split(' ')[0]}! Progreso activo.`, canvas.width / 2, 40);
        }

        const inicioXModos = (canvas.width - (modos.length * (ANCHO_BOTON + SEPARACION) - SEPARACION)) / 2;
        modos.forEach((modo, i) => {
            const x = inicioXModos + i * (ANCHO_BOTON + SEPARACION);
            dibujarRect(x, Y_MODOS, ANCHO_BOTON, ALTO_BOTON, modo.color);
            ctx.drawImage(imagenes[i], x + ANCHO_BOTON/2 - 40, Y_MODOS + 10, 80, 80);
            ctx.textAlign = "center";
            ctx.fillStyle = "#333";
            ctx.font = "bold 20px 'Poppins', sans-serif";
            ctx.fillText(modo.nombre, x + ANCHO_BOTON/2, Y_MODOS + 120);
        });

        const xMuseo = (canvas.width - ANCHO_BOTON) / 2;
        dibujarRect(xMuseo, Y_MUSEO, ANCHO_BOTON, ALTO_BOTON, museo.color);
        ctx.drawImage(imagenes[2], xMuseo + ANCHO_BOTON/2 - 40, Y_MUSEO + 10, 80, 80);
        ctx.fillText(museo.nombre, xMuseo + ANCHO_BOTON/2, Y_MUSEO + 120);
    }

    canvas.onclick = (e) => {
        const p = getScaledMousePoint(canvas, e);
        const inicioX = (canvas.width - (modos.length * (ANCHO_BOTON + SEPARACION) - SEPARACION)) / 2;
        
        // Clic en fila superior (Modos)
        if (p.y > Y_MODOS && p.y < Y_MODOS + ALTO_BOTON) {
            if (p.x > inicioX && p.x < inicioX + ANCHO_BOTON) cargarModoHistoria(main);
            if (p.x > inicioX + ANCHO_BOTON + SEPARACION && p.x < inicioX + 2*ANCHO_BOTON + SEPARACION) cargarModoLibre(main);
        }
        // Clic en fila inferior (Museo)
        const xM = (canvas.width - ANCHO_BOTON) / 2;
        if (p.y > Y_MUSEO && p.y < Y_MUSEO + ALTO_BOTON && p.x > xM && p.x < xM + ANCHO_BOTON) {
            alert("Abriendo Museo..."); // Aquí llamarás a tu componente de Museo
        }
    };
}

onAuthStateChanged(auth, (user) => {
    const main = document.getElementById("main");
    if (main) cargarMenuPrincipal(main, user);
});