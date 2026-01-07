/* =========================================================
   🔊 ControladorSonido.js - VERSIÓN INTEGRADA
   ========================================================= */
export default class ControladorSonido {
    constructor() {
        this.audios = {
            menu: new Audio("./Audios/tex-mex-delight-mexican-mariachi-113044.mp3"),
            mapa: new Audio("./Audios/mar-y-sombreros-388880.mp3"),
            juego: new Audio("./Audios/the-garden-of-silence-411283.mp3")
        };
        this.volumen = parseFloat(localStorage.getItem('volumen_global')) || 0.5;
        this.canalActivo = null;
        this._prepararAudios();
    }

    _prepararAudios() {
        Object.values(this.audios).forEach(audio => {
            audio.loop = true;
            audio.volume = this.volumen;
        });
    }

    play(tema) {
        if (this.canalActivo === tema) return;
        
        // Detener música anterior
        Object.values(this.audios).forEach(a => {
            a.pause();
            a.currentTime = 0;
        });

        if (this.audios[tema]) {
            this.audios[tema].play().catch(() => console.log("Interacción requerida para audio"));
            this.canalActivo = tema;
        }
    }

    actualizarVolumen(valor) {
        this.volumen = valor;
        localStorage.setItem('volumen_global', valor);
        Object.values(this.audios).forEach(a => a.volume = valor);
    }
}