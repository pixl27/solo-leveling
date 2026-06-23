/**
 * SHADOW GYM - Couche UI partagée
 * ================================
 * Écoute les événements du moteur `Hunter` (store.js) et affiche :
 *  - toasts (XP, succès)
 *  - overlay de montée de niveau
 *  - overlay de montée de rang
 *  - sons synthétisés (Web Audio, aucun fichier requis)
 *  - particules d'arrière-plan
 *  - synchro de la barre d'XP de navigation
 *
 * À inclure sur chaque page APRÈS store.js :
 *   <script src="js/store.js"></script>
 *   <script src="js/ui.js"></script>
 */

(function (global) {
    'use strict';

    const Hunter = global.Hunter;
    if (!Hunter) { console.warn('[UI] store.js doit être chargé avant ui.js'); return; }

    // ==================== STYLES INJECTÉS (une seule fois) ====================
    function injectStyles() {
        if (document.getElementById('sg-ui-styles')) return;
        const style = document.createElement('style');
        style.id = 'sg-ui-styles';
        style.textContent = `
            @keyframes sgSlideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes sgSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
            @keyframes sgScaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes sgFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes sgFadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes sgPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
            .sg-toast-wrap { position: fixed; top: 80px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
            .sg-toast { background: rgba(8, 14, 24, 0.92); border: 1px solid #85acb9; padding: 12px 22px; color: #fff;
                font-family: 'Lato', sans-serif; letter-spacing: 2px; font-size: 0.95em; box-shadow: 0 0 20px rgba(133,172,185,0.4);
                animation: sgSlideIn 0.35s ease-out; border-radius: 2px; backdrop-filter: blur(4px); }
            .sg-toast.xp { border-color: #ffd700; color: #ffd700; box-shadow: 0 0 20px rgba(255,215,0,0.4); }
            .sg-toast.achievement { border-color: #9c27b0; color: #fff; box-shadow: 0 0 22px rgba(156,39,176,0.5); }
            .sg-toast.stat { border-color: #03a9f4; color: #03a9f4; }
            .sg-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 10001; display: flex;
                align-items: center; justify-content: center; animation: sgFadeIn 0.3s ease-out; }
            @media (max-width: 600px) { .sg-toast-wrap { top: 70px; right: 10px; left: 10px; } .sg-toast { font-size: 0.85em; padding: 10px 16px; } }
        `;
        document.head.appendChild(style);
    }

    // ==================== TOASTS ====================
    function toastWrap() {
        let w = document.querySelector('.sg-toast-wrap');
        if (!w) { w = document.createElement('div'); w.className = 'sg-toast-wrap'; document.body.appendChild(w); }
        return w;
    }

    function toast(message, type) {
        injectStyles();
        const el = document.createElement('div');
        el.className = 'sg-toast ' + (type || '');
        el.innerHTML = message;
        toastWrap().appendChild(el);
        setTimeout(() => {
            el.style.animation = 'sgSlideOut 0.35s ease-out forwards';
            setTimeout(() => el.remove(), 350);
        }, type === 'achievement' ? 3500 : 2200);
    }

    // ==================== OVERLAY MONTÉE DE NIVEAU ====================
    function levelUpOverlay(level, points) {
        injectStyles();
        const o = document.createElement('div');
        o.className = 'sg-overlay';
        o.innerHTML = `
            <div style="text-align:center; animation: sgScaleIn 0.5s ease-out;">
                <div style="font-size:3em; color:#ffd700; text-shadow:0 0 50px rgba(255,215,0,0.8); letter-spacing:5px; margin-bottom:20px;">NIVEAU SUPÉRIEUR !</div>
                <div style="font-size:5em; color:#fff; text-shadow:0 0 30px #85acb9; margin-bottom:30px;">NV. ${level}</div>
                <div style="color:#85acb9; font-size:1.2em; letter-spacing:2px;">+${points} POINTS DE STAT DISPONIBLES</div>
            </div>`;
        document.body.appendChild(o);
        sound('levelup');
        setTimeout(() => { o.style.animation = 'sgFadeOut 0.5s ease-out forwards'; setTimeout(() => o.remove(), 500); }, 2600);
    }

    // ==================== OVERLAY MONTÉE DE RANG ====================
    function rankUpOverlay(rank) {
        injectStyles();
        const color = Hunter.getRankColor(rank);
        const o = document.createElement('div');
        o.className = 'sg-overlay';
        o.style.background = 'rgba(0,0,0,0.95)';
        o.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:1.8em; color:#fff; margin-bottom:20px; letter-spacing:5px;">PROMOTION DE RANG</div>
                <div style="font-size:8em; color:${color}; text-shadow:0 0 60px ${color}; animation: sgPulse 1s ease-in-out infinite;">${rank}</div>
                <div style="font-size:1.5em; color:${color}; letter-spacing:3px; margin-top:20px;">HUNTER RANG ${rank}</div>
            </div>`;
        document.body.appendChild(o);
        sound('rankup');
        setTimeout(() => { o.style.animation = 'sgFadeOut 0.6s ease-out forwards'; setTimeout(() => o.remove(), 600); }, 3500);
    }

    // ==================== SONS SYNTHÉTISÉS (Web Audio) ====================
    let audioCtx = null;
    function sound(type) {
        if (!Hunter.get('settings') || !Hunter.get('settings').sounds) return;
        try {
            audioCtx = audioCtx || new (global.AudioContext || global.webkitAudioContext)();
            const notes = {
                xp: [[660, 0, 0.08]],
                levelup: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.18], [1047, 0.32, 0.25]],
                rankup: [[392, 0, 0.15], [523, 0.12, 0.15], [659, 0.24, 0.15], [880, 0.36, 0.35]],
                achievement: [[784, 0, 0.1], [1047, 0.1, 0.2]],
                click: [[440, 0, 0.05]]
            };
            (notes[type] || notes.xp).forEach(([freq, delay, dur]) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + delay);
                gain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + delay + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + dur);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(audioCtx.currentTime + delay);
                osc.stop(audioCtx.currentTime + delay + dur);
            });
        } catch (e) { /* audio non dispo, on ignore */ }
    }

    // ==================== PARTICULES ====================
    function initParticles(count) {
        if (Hunter.get('settings') && Hunter.get('settings').particles === false) return;
        const container = document.querySelector('.bg-particles');
        if (!container || container.dataset.sgInit) return;
        container.dataset.sgInit = '1';
        const n = count || (global.innerWidth < 600 ? 35 : 70);
        for (let i = 0; i < n; i++) {
            const p = document.createElement('div');
            p.className = 'bg-particle';
            const size = Math.random() * 4 + 1;
            p.style.cssText = `position:absolute; background:rgba(133,172,185,0.8); border-radius:50%; pointer-events:none;
                left:${Math.random() * 100}%; width:${size}px; height:${size}px; opacity:${Math.random() * 0.5 + 0.2};
                animation: floatUpDiagonal ${Math.random() * 3 + 2}s ${Math.random() * 2}s linear infinite;`;
            container.appendChild(p);
        }
    }

    // ==================== BARRE XP DE NAVIGATION ====================
    function syncNav() {
        const navLevel = document.getElementById('navLevel');
        const navXpFill = document.getElementById('navXpFill');
        if (navLevel) navLevel.textContent = Hunter.get('level');
        if (navXpFill) navXpFill.style.width = Hunter.getProgressPercent() + '%';
    }

    // ==================== ABONNEMENTS AUX ÉVÉNEMENTS ====================
    Hunter.on('xp', (d) => { toast('+' + d.amount + ' XP', 'xp'); sound('xp'); syncNav(); });
    Hunter.on('levelup', (d) => { levelUpOverlay(d.level, d.points); syncNav(); });
    Hunter.on('rankup', (d) => rankUpOverlay(d.rank));
    Hunter.on('achievement', (d) => { toast('🏆 ' + d.info.name + ' — ' + d.info.desc, 'achievement'); sound('achievement'); });
    Hunter.on('stat', (d) => { if (d.natural) toast(d.stat + ' +1', 'stat'); });
    Hunter.on('change', syncNav);

    // ==================== API PUBLIQUE ====================
    global.GymUI = {
        toast: toast,
        sound: sound,
        initParticles: initParticles,
        syncNav: syncNav,
        levelUpOverlay: levelUpOverlay,
        rankUpOverlay: rankUpOverlay
    };

    // Init auto au chargement du DOM
    function boot() {
        injectStyles();
        initParticles();
        syncNav();
        Hunter.checkDailyReset();
        // Débloque l'audio au premier clic (politique navigateur)
        const unlock = () => { sound('click'); document.removeEventListener('click', unlock); };
        document.addEventListener('click', unlock, { once: true });
        // Enregistre le service worker (PWA hors-ligne) — uniquement en http(s)
        if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

})(typeof window !== 'undefined' ? window : this);
