/**
 * SHADOW GYM - Interface d'authentification
 * =========================================
 * Modale Connexion / Inscription réutilisable + puce de compte.
 * S'appuie sur Cloud (cloud.js). Fonctionne en superposition sur n'importe quelle page.
 *
 * À inclure APRÈS cloud.js :
 *   <script src="js/auth-ui.js"></script>
 *
 * API : AuthUI.open()  ·  AuthUI.mountChip('#selector')
 */
(function (global) {
    'use strict';

    const Cloud = global.Cloud;
    const AuthUI = { _booted: false };

    function injectStyles() {
        if (document.getElementById('sg-auth-styles')) return;
        const s = document.createElement('style');
        s.id = 'sg-auth-styles';
        s.textContent = `
            .sg-auth-backdrop { position: fixed; inset: 0; background: rgba(2,6,12,0.85); backdrop-filter: blur(6px);
                z-index: 11000; display: flex; align-items: center; justify-content: center; animation: sgFadeIn .25s ease-out; }
            .sg-auth-modal { width: 380px; max-width: 92vw; background: rgba(8,14,24,0.97); border: 2px solid #85acb9;
                box-shadow: 0 0 40px rgba(133,172,185,0.4); padding: 32px 30px; position: relative; animation: sgScaleIn .3s ease-out; }
            .sg-auth-modal h2 { color: #fff; text-align: center; letter-spacing: 3px; margin: 0 0 6px; font-size: 1.4em; text-shadow: 0 0 14px #85acb9; }
            .sg-auth-sub { color: rgba(255,255,255,.6); text-align: center; font-size: .82em; margin-bottom: 22px; letter-spacing: 1px; }
            .sg-auth-tabs { display: flex; margin-bottom: 20px; border: 1px solid rgba(133,172,185,.3); }
            .sg-auth-tab { flex: 1; padding: 10px; text-align: center; color: rgba(255,255,255,.6); cursor: pointer; letter-spacing: 1px;
                font-size: .85em; transition: all .2s; background: transparent; border: none; font-family: inherit; }
            .sg-auth-tab.active { background: rgba(133,172,185,.18); color: #fff; }
            .sg-auth-field { width: 100%; box-sizing: border-box; background: transparent; border: 1px solid #85acb9; color: #fff;
                padding: 12px 14px; margin-bottom: 14px; font-size: .95em; letter-spacing: 1px; font-family: inherit; }
            .sg-auth-field:focus { outline: none; border-color: #fff; box-shadow: 0 0 14px rgba(133,172,185,.4); }
            .sg-auth-field::placeholder { color: rgba(133,172,185,.5); }
            .sg-auth-btn { width: 100%; padding: 13px; background: rgba(133,172,185,.15); border: 1px solid #85acb9; color: #fff;
                letter-spacing: 2px; cursor: pointer; font-family: inherit; font-size: .95em; transition: all .2s; }
            .sg-auth-btn:hover { background: rgba(133,172,185,.3); box-shadow: 0 0 20px rgba(133,172,185,.5); }
            .sg-auth-btn:disabled { opacity: .5; cursor: not-allowed; }
            .sg-auth-err { color: #ff4757; font-size: .8em; text-align: center; margin-top: 12px; min-height: 1em; text-shadow: 0 0 8px rgba(255,71,87,.4); }
            .sg-auth-close { position: absolute; top: 10px; right: 14px; color: rgba(255,255,255,.5); cursor: pointer; font-size: 1.4em; background: none; border: none; }
            .sg-auth-skip { display: block; width: 100%; text-align: center; margin-top: 16px; color: rgba(255,255,255,.45);
                font-size: .8em; cursor: pointer; background: none; border: none; letter-spacing: 1px; }
            .sg-auth-skip:hover { color: rgba(255,255,255,.8); }
            .sg-chip { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; padding: 5px 12px;
                border: 1px solid rgba(133,172,185,.4); color: #85acb9; font-size: .8em; letter-spacing: 1px; background: rgba(133,172,185,.08); }
            .sg-chip:hover { border-color: #85acb9; color: #fff; }
        `;
        document.head.appendChild(s);
    }

    AuthUI.open = function (mode) {
        injectStyles();
        if (!global.isCloudConfigured || !global.isCloudConfigured()) {
            global.GymUI && global.GymUI.toast
                ? global.GymUI.toast('Mode hors-ligne — configure Supabase (js/config.js) pour le multijoueur.', 'stat')
                : alert('Mode hors-ligne : configure Supabase dans js/config.js pour activer les comptes en ligne.');
            return;
        }
        let tab = mode || 'login';
        const back = document.createElement('div');
        back.className = 'sg-auth-backdrop';
        back.innerHTML = `
            <div class="sg-auth-modal">
                <button class="sg-auth-close" aria-label="Fermer">&times;</button>
                <h2>SHADOW GYM</h2>
                <div class="sg-auth-sub">Synchronise ta progression · Rejoins le classement</div>
                <div class="sg-auth-tabs">
                    <button class="sg-auth-tab" data-tab="login">CONNEXION</button>
                    <button class="sg-auth-tab" data-tab="signup">INSCRIPTION</button>
                </div>
                <div class="sg-auth-body"></div>
                <div class="sg-auth-err"></div>
                <button class="sg-auth-skip">Continuer hors-ligne →</button>
            </div>`;
        document.body.appendChild(back);

        const body = back.querySelector('.sg-auth-body');
        const err = back.querySelector('.sg-auth-err');
        const close = () => back.remove();
        back.querySelector('.sg-auth-close').onclick = close;
        back.querySelector('.sg-auth-skip').onclick = close;
        back.onclick = (e) => { if (e.target === back) close(); };

        function render() {
            back.querySelectorAll('.sg-auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
            err.textContent = '';
            body.innerHTML = (tab === 'signup' ? '<input class="sg-auth-field" id="sgName" placeholder="NOM DE HUNTER" maxlength="24">' : '')
                + '<input class="sg-auth-field" id="sgEmail" type="email" placeholder="EMAIL" autocomplete="email">'
                + '<input class="sg-auth-field" id="sgPass" type="password" placeholder="MOT DE PASSE" autocomplete="current-password">'
                + `<button class="sg-auth-btn" id="sgSubmit">${tab === 'signup' ? 'DEVENIR HUNTER' : 'ENTRER DANS LE DONJON'}</button>`;
            body.querySelector('#sgSubmit').onclick = submit;
            body.querySelectorAll('.sg-auth-field').forEach(f => f.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
        }

        async function submit() {
            const email = (body.querySelector('#sgEmail') || {}).value;
            const pass = (body.querySelector('#sgPass') || {}).value;
            const name = (body.querySelector('#sgName') || {}).value;
            const btn = body.querySelector('#sgSubmit');
            err.textContent = '';
            if (!email || !pass) { err.textContent = 'Email et mot de passe requis.'; return; }
            if (pass.length < 6) { err.textContent = 'Mot de passe : 6 caractères minimum.'; return; }
            btn.disabled = true; btn.textContent = 'CONNEXION...';
            try {
                if (tab === 'signup') {
                    const r = await Cloud.signUp(email, pass, name || undefined);
                    if (r && r.user && !r.session) {
                        err.style.color = '#4caf50';
                        err.textContent = 'Compte créé ! Vérifie ton email pour confirmer.';
                        btn.textContent = 'EN ATTENTE...';
                        return;
                    }
                } else {
                    await Cloud.signIn(email, pass);
                }
                global.GymUI && global.GymUI.toast && global.GymUI.toast('Bienvenue, Hunter. Progression synchronisée.', 'xp');
                close();
                AuthUI._refreshChips();
            } catch (e) {
                err.style.color = '';
                err.textContent = translateErr(e.message || 'Erreur');
                btn.disabled = false; btn.textContent = tab === 'signup' ? 'DEVENIR HUNTER' : 'ENTRER DANS LE DONJON';
            }
        }

        back.querySelectorAll('.sg-auth-tab').forEach(t => t.onclick = () => { tab = t.dataset.tab; render(); });
        render();
    };

    function translateErr(m) {
        if (/Invalid login/i.test(m)) return 'Email ou mot de passe incorrect.';
        if (/already registered/i.test(m)) return 'Cet email a déjà un compte.';
        if (/rate limit/i.test(m)) return 'Trop de tentatives, réessaie plus tard.';
        return m;
    }

    // ==================== PUCE DE COMPTE ====================
    AuthUI._chips = [];
    AuthUI.mountChip = function (selector) {
        const host = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!host) return;
        const chip = document.createElement('span');
        chip.className = 'sg-chip';
        host.appendChild(chip);
        this._chips.push(chip);
        this._renderChip(chip);
        chip.onclick = () => {
            if (Cloud && Cloud.isLoggedIn()) {
                if (confirm('Se déconnecter ?')) Cloud.signOut().then(() => this._refreshChips());
            } else {
                this.open('login');
            }
        };
    };
    AuthUI._renderChip = function (chip) {
        const online = Cloud && Cloud.isLoggedIn();
        chip.innerHTML = online
            ? '<i class="fas fa-circle" style="color:#4caf50;font-size:.6em;"></i> EN LIGNE'
            : '<i class="fas fa-circle" style="color:#888;font-size:.6em;"></i> HORS-LIGNE';
    };
    AuthUI._refreshChips = function () { this._chips.forEach(c => this._renderChip(c)); };

    // ==================== BOOT ====================
    function boot() {
        if (AuthUI._booted) return; AuthUI._booted = true;
        if (Cloud) {
            Cloud.init();
            Cloud.on('auth', () => AuthUI._refreshChips());
            Cloud.on('ready', () => AuthUI._refreshChips());
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

    global.AuthUI = AuthUI;
})(typeof window !== 'undefined' ? window : this);
