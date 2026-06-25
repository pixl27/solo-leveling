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
                align-items: center; justify-content: center; animation: sgFadeIn 0.3s ease-out; overflow: hidden; }
            /* ---- Montée de niveau cinématique ---- */
            @keyframes sgRays { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes sgShake { 0%,100%{transform:translate(0,0);} 20%{transform:translate(-6px,3px);} 40%{transform:translate(6px,-3px);} 60%{transform:translate(-4px,-2px);} 80%{transform:translate(4px,2px);} }
            @keyframes sgRise { from { transform: translateY(26px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes sgBurst { to { transform: translate(var(--bx), var(--by)) scale(0); opacity: 0; } }
            @keyframes sgFlash { from { opacity: .85; } to { opacity: 0; } }
            @keyframes sgRingPop { from { transform: scale(.2); opacity: .9; } to { transform: scale(1.8); opacity: 0; } }
            .sg-shake { animation: sgShake .5s ease-in-out; }
            .sg-rays { position:absolute; width:160vmax; height:160vmax; left:50%; top:50%; margin-left:-80vmax; margin-top:-80vmax;
                background: repeating-conic-gradient(from 0deg, rgba(133,172,185,.16) 0deg 6deg, transparent 6deg 16deg);
                animation: sgRays 14s linear infinite; pointer-events:none; }
            .sg-flash { position:fixed; inset:0; background:#fff; z-index:10002; pointer-events:none; animation: sgFlash .55s ease-out forwards; }
            .sg-lvl-card { position:relative; text-align:center; z-index:2; padding: 10px 24px; }
            .sg-lvl-kicker { font-size: clamp(1.4em, 5vw, 3em); color:#ffd700; text-shadow:0 0 50px rgba(255,215,0,.8); letter-spacing:5px; }
            .sg-lvl-num { font-size: clamp(3em, 13vw, 7em); color:#fff; text-shadow:0 0 40px #85acb9; line-height:1; margin:6px 0 14px; }
            .sg-lvl-pts { color:#85acb9; font-size:1.05em; letter-spacing:2px; }
            .sg-ring { position:absolute; left:50%; top:42%; width:160px; height:160px; margin:-80px 0 0 -80px; border:3px solid #ffd700;
                border-radius:50%; animation: sgRingPop .9s ease-out forwards; pointer-events:none; }
            .sg-loot-reveal { margin-top:18px; animation: sgRise .5s .35s both; display:inline-flex; align-items:center; gap:14px;
                padding:12px 18px; border:1px solid; border-radius:6px; background:rgba(8,14,24,.7); }
            .sg-loot-ic { width:48px; height:48px; display:flex; align-items:center; justify-content:center; font-size:1.6em; border:1px solid; border-radius:6px; }
            .sg-loot-meta { text-align:left; }
            .sg-loot-name { color:#fff; letter-spacing:1px; font-size:1.02em; }
            .sg-loot-sub { font-size:.76em; letter-spacing:1px; margin-top:3px; }
            .sg-cont { margin-top:22px; }
            .sg-cont button { background:transparent; border:1px solid #85acb9; color:#fff; padding:10px 26px; letter-spacing:2px;
                cursor:pointer; font-family:inherit; font-size:.9em; transition:all .2s; }
            .sg-cont button:hover { background:rgba(133,172,185,.2); box-shadow:0 0 18px rgba(133,172,185,.5); }
            .sg-toast.loot { color:#fff; }
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

    // ==================== OVERLAY MONTÉE DE NIVEAU (cinématique) ====================
    function tr(k) { return (global.I18n ? global.I18n.t(k) : k); }

    function lootRevealHTML(loot) {
        if (!loot || !global.Equipment) return '';
        const E = global.Equipment;
        const color = E.rarityColor(loot.rarity);
        return `
            <div class="sg-loot-reveal" style="border-color:${color}; box-shadow:0 0 24px ${color}55;">
                <div class="sg-loot-ic" style="border-color:${color}; color:${color}; box-shadow:0 0 16px ${color}55;"><i class="fas ${loot.icon}"></i></div>
                <div class="sg-loot-meta">
                    <div style="font-size:.7em; letter-spacing:2px; color:${color};">${tr('loot.obtained')}</div>
                    <div class="sg-loot-name">${E.itemName(loot)}</div>
                    <div class="sg-loot-sub" style="color:${color};">${E.rarityName(loot.rarity)} · ${E.slotName(loot.slot)}</div>
                </div>
            </div>`;
    }

    function screenFlash() {
        const f = document.createElement('div');
        f.className = 'sg-flash';
        document.body.appendChild(f);
        setTimeout(() => f.remove(), 600);
    }

    function burst(host, color, n) {
        for (let i = 0; i < (n || 26); i++) {
            const p = document.createElement('div');
            const ang = Math.random() * Math.PI * 2;
            const dist = 120 + Math.random() * 220;
            p.style.cssText = `position:absolute; left:50%; top:42%; width:${3 + Math.random() * 5}px; height:${3 + Math.random() * 5}px;
                background:${color}; border-radius:50%; pointer-events:none; box-shadow:0 0 8px ${color};
                --bx:${Math.cos(ang) * dist}px; --by:${Math.sin(ang) * dist}px; animation: sgBurst ${0.7 + Math.random() * 0.6}s ease-out forwards;`;
            host.appendChild(p);
        }
    }

    function levelUpOverlay(level, points, loot) {
        injectStyles();
        screenFlash();
        const o = document.createElement('div');
        o.className = 'sg-overlay';
        o.innerHTML = `
            <div class="sg-rays"></div>
            <div class="sg-ring"></div>
            <div class="sg-lvl-card sg-shake">
                <div class="sg-lvl-kicker">${tr('lvl.up')}</div>
                <div class="sg-lvl-num">${tr('lvl.lv')} ${level}</div>
                <div class="sg-lvl-pts">+${points} ${tr('lvl.points')}</div>
                ${lootRevealHTML(loot)}
                <div class="sg-cont"><button type="button">${tr('lvl.continue')}</button></div>
            </div>`;
        document.body.appendChild(o);
        burst(o, '#ffd700', 30);
        sound('levelup');
        const close = () => { o.style.animation = 'sgFadeOut 0.45s ease-out forwards'; setTimeout(() => o.remove(), 450); };
        o.querySelector('.sg-cont button').addEventListener('click', close);
        o.addEventListener('click', (e) => { if (e.target === o) close(); });
        // Fermeture auto plus longue s'il y a un butin à admirer.
        setTimeout(close, loot ? 5200 : 3200);
    }

    // ==================== BUTIN (hors level-up) ====================
    function lootToast(item) {
        if (!item || !global.Equipment) return;
        const E = global.Equipment;
        const color = E.rarityColor(item.rarity);
        injectStyles();
        const el = document.createElement('div');
        el.className = 'sg-toast loot';
        el.style.borderColor = color;
        el.style.boxShadow = '0 0 22px ' + color + '66';
        el.innerHTML = `<i class="fas ${item.icon}" style="color:${color}; margin-right:8px;"></i>
            <span style="color:${color};">${E.rarityName(item.rarity)}</span> · ${E.itemName(item)}`;
        toastWrap().appendChild(el);
        sound('achievement');
        setTimeout(() => { el.style.animation = 'sgSlideOut 0.35s ease-out forwards'; setTimeout(() => el.remove(), 350); }, 3200);
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
    Hunter.on('levelup', (d) => { levelUpOverlay(d.level, d.points, d.loot); syncNav(); });
    Hunter.on('rankup', (d) => rankUpOverlay(d.rank));
    Hunter.on('achievement', (d) => { toast('🏆 ' + d.info.name + ' — ' + d.info.desc, 'achievement'); sound('achievement'); });
    Hunter.on('stat', (d) => { if (d.natural) toast(d.stat + ' +1', 'stat'); });
    // Butin : le drop de level-up est déjà montré dans l'overlay → on ne re-toast pas.
    Hunter.on('loot', (d) => { if (d && d.source !== 'levelup') lootToast(d.item); });
    // Maîtrise de talent : palier atteint → bonus de stat permanent.
    Hunter.on('talentup', (d) => {
        let bonus = '';
        if (d.statBoost) bonus = Object.keys(d.statBoost).map(s => '+' + d.statBoost[s] + ' ' + s).join(' · ');
        toast('<i class="fas fa-star" style="color:#9c27b0;"></i> ' + tr('tal.mastered') + ' ' + tr('lvl.lv') + ' ' + d.level + (bonus ? ' — ' + bonus : ''), 'achievement');
        sound('rankup');
    });
    Hunter.on('change', syncNav);

    // ==================== BOÎTE DE CONFIRMATION (thématisée) ====================
    function confirmStyles() {
        if (document.getElementById('sg-confirm-styles')) return;
        const s = document.createElement('style');
        s.id = 'sg-confirm-styles';
        s.textContent = `
            .sg-confirm-back { position: fixed; inset: 0; background: rgba(2,6,12,.85); backdrop-filter: blur(6px);
                z-index: 12000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: sgcFade .2s ease-out; }
            .sg-confirm { width: 360px; max-width: 92vw; background: rgba(8,14,24,.97); border: 2px solid #85acb9; position: relative;
                box-shadow: 0 0 40px rgba(133,172,185,.4); padding: 30px 28px 24px; text-align: center; animation: sgcScale .25s ease-out; }
            .sg-confirm::before { content:''; position:absolute; inset:-4px; border:1px solid rgba(133,172,185,.25); pointer-events:none; }
            .sg-confirm-ic { width: 64px; height: 64px; margin: 0 auto 16px; border: 2px solid #85acb9; border-radius: 50%;
                display: flex; align-items: center; justify-content: center; color: #85acb9; font-size: 1.6em;
                text-shadow: 0 0 14px #85acb9; box-shadow: 0 0 22px rgba(133,172,185,.45), inset 0 0 14px rgba(133,172,185,.3); }
            .sg-confirm-ic.danger { border-color:#ff4757; color:#ff4757; text-shadow:0 0 14px #ff4757; box-shadow:0 0 22px rgba(255,71,87,.45), inset 0 0 14px rgba(255,71,87,.3); }
            .sg-confirm-title { color:#fff; letter-spacing:2px; font-size:1.15em; text-shadow:0 0 12px rgba(133,172,185,.6); margin-bottom:8px; }
            .sg-confirm-msg { color: rgba(255,255,255,.6); font-size:.85em; letter-spacing:.5px; line-height:1.5; margin-bottom:22px; }
            .sg-confirm-actions { display:flex; gap:12px; }
            .sg-confirm-btn { flex:1; padding:12px; border:1px solid; background:transparent; color:#fff; letter-spacing:1.5px;
                font-size:.8em; font-family:inherit; cursor:pointer; transition:all .2s; }
            .sg-confirm-btn.cancel { border-color: rgba(133,172,185,.4); color: rgba(255,255,255,.7); }
            .sg-confirm-btn.cancel:hover { border-color:#85acb9; color:#fff; background:rgba(133,172,185,.1); }
            .sg-confirm-btn.ok { border-color:#85acb9; color:#fff; background:rgba(133,172,185,.18); }
            .sg-confirm-btn.ok:hover { background:rgba(133,172,185,.34); box-shadow:0 0 18px rgba(133,172,185,.5); }
            .sg-confirm-btn.ok.danger { border-color:#ff4757; background:rgba(255,71,87,.16); }
            .sg-confirm-btn.ok.danger:hover { background:rgba(255,71,87,.3); box-shadow:0 0 18px rgba(255,71,87,.5); }
            @keyframes sgcFade { from { opacity:0; } to { opacity:1; } }
            @keyframes sgcScale { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
            @keyframes sgcOut { to { opacity:0; } }`;
        document.head.appendChild(s);
    }

    // Remplace window.confirm par une boîte thématisée. Retourne une Promise<boolean>.
    function confirmDialog(opts) {
        opts = opts || {};
        confirmStyles();
        return new Promise(function (resolve) {
            const danger = !!opts.danger;
            const icon = opts.icon || (danger ? 'fa-triangle-exclamation' : 'fa-circle-question');
            const back = document.createElement('div');
            back.className = 'sg-confirm-back';
            back.innerHTML = `
                <div class="sg-confirm" role="alertdialog" aria-modal="true">
                    <div class="sg-confirm-ic ${danger ? 'danger' : ''}"><i class="fas ${icon}"></i></div>
                    <div class="sg-confirm-title">${opts.title || ''}</div>
                    ${opts.message ? `<div class="sg-confirm-msg">${opts.message}</div>` : ''}
                    <div class="sg-confirm-actions">
                        <button class="sg-confirm-btn cancel">${opts.cancelText || 'Cancel'}</button>
                        <button class="sg-confirm-btn ok ${danger ? 'danger' : ''}">${opts.confirmText || 'OK'}</button>
                    </div>
                </div>`;
            document.body.appendChild(back);
            const okBtn = back.querySelector('.ok');
            const cancelBtn = back.querySelector('.cancel');
            let closed = false;
            function close(val) {
                if (closed) return; closed = true;
                document.removeEventListener('keydown', onKey);
                back.style.animation = 'sgcOut .18s ease-out forwards';
                setTimeout(function () { back.remove(); }, 180);
                resolve(val);
            }
            function onKey(e) { if (e.key === 'Escape') close(false); else if (e.key === 'Enter') close(true); }
            okBtn.onclick = function () { close(true); };
            cancelBtn.onclick = function () { close(false); };
            back.onclick = function (e) { if (e.target === back) close(false); };
            document.addEventListener('keydown', onKey);
            try { okBtn.focus(); } catch (e) { /* ignore */ }
        });
    }

    // ==================== API PUBLIQUE ====================
    global.GymUI = {
        toast: toast,
        sound: sound,
        confirm: confirmDialog,
        initParticles: initParticles,
        syncNav: syncNav,
        levelUpOverlay: levelUpOverlay,
        rankUpOverlay: rankUpOverlay,
        lootToast: lootToast,
        burst: burst,
        screenFlash: screenFlash
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
