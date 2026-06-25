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

    // Raccourci de traduction : retombe sur le texte FR fourni si I18n n'est pas chargé.
    function t(key, fallback, vars) {
        if (global.I18n && typeof global.I18n.t === 'function') return global.I18n.t(key, vars);
        let s = fallback;
        if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
        return s;
    }

    // Nom de Hunter saisi à l'éveil (gym-index) → sert à pré-remplir l'inscription / le message de bienvenue.
    function storedName() {
        try { const ls = global.localStorage && localStorage.getItem('hunterName'); if (ls) return ls; } catch (e) { /* localStorage indispo */ }
        if (global.Hunter && global.Hunter.get) { const n = global.Hunter.get('name'); if (n && n !== 'SHADOW HUNTER') return n; }
        return '';
    }

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
            .sg-auth-support { display: flex; align-items: center; justify-content: center; gap: 8px; width: max-content;
                max-width: 90%; margin: 2px auto 16px; padding: 6px 14px; border: 1px solid rgba(255,215,0,.4);
                background: rgba(255,215,0,.07); color: #ffd700; font-size: .7em; letter-spacing: 1.5px; text-decoration: none;
                transition: all .25s; text-shadow: 0 0 10px rgba(255,215,0,.35); }
            .sg-auth-support:hover { background: rgba(255,215,0,.16); box-shadow: 0 0 16px rgba(255,215,0,.32); color: #fff; }
            .sg-auth-support i { animation: sgSteam 2.6s ease-in-out infinite; }
            @keyframes sgSteam { 0%, 100% { transform: translateY(0); opacity: .85; } 50% { transform: translateY(-2px); opacity: 1; } }
            .sg-auth-guest { margin-top: 18px; padding-top: 16px; border-top: 1px solid rgba(133,172,185,.2); }
            .sg-auth-guest-or { text-align: center; color: rgba(255,255,255,.3); letter-spacing: 3px; font-size: .68em; margin-bottom: 12px; }
            .sg-auth-guest-title { color: rgba(255,255,255,.62); font-size: .78em; letter-spacing: .5px; margin-bottom: 10px; text-align: center; }
            .sg-auth-guest-list { list-style: none; margin: 0; padding: 0; }
            .sg-auth-guest-list li { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,.5); font-size: .76em; padding: 4px 2px; letter-spacing: .3px; }
            .sg-auth-guest-list li i { width: 18px; text-align: center; color: rgba(255,71,87,.65); font-size: .85em; }
            .sg-auth-guest-note { color: rgba(255,255,255,.35); font-size: .72em; text-align: center; margin-top: 10px; letter-spacing: .5px; }
            .sg-chip { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; padding: 5px 12px;
                border: 1px solid rgba(133,172,185,.4); color: #85acb9; font-size: .8em; letter-spacing: 1px; background: rgba(133,172,185,.08); }
            .sg-chip:hover { border-color: #85acb9; color: #fff; }
            .sg-auth-success { text-align: center; padding: 16px 0 8px; animation: sgScaleIn .3s ease-out; }
            .sg-auth-check { width: 74px; height: 74px; margin: 0 auto 18px; border: 2px solid #85acb9; border-radius: 50%;
                display: flex; align-items: center; justify-content: center; color: #85acb9; font-size: 2em;
                text-shadow: 0 0 16px #85acb9; box-shadow: 0 0 26px rgba(133,172,185,.6), inset 0 0 18px rgba(133,172,185,.35);
                animation: sgAuthPulse 1.1s ease-in-out infinite; }
            .sg-auth-granted { color: #fff; letter-spacing: 4px; font-size: 1.05em; text-shadow: 0 0 14px #85acb9; margin-bottom: 8px; }
            .sg-auth-welcome { color: rgba(255,255,255,.7); letter-spacing: 2px; font-size: .85em; }
            @keyframes sgAuthPulse {
                0%, 100% { transform: scale(1); box-shadow: 0 0 26px rgba(133,172,185,.55), inset 0 0 18px rgba(133,172,185,.3); }
                50% { transform: scale(1.08); box-shadow: 0 0 40px rgba(133,172,185,.95), inset 0 0 22px rgba(133,172,185,.55); }
            }
        `;
        document.head.appendChild(s);
    }

    AuthUI._openBack = null;   // référence vers la modale ouverte (pour re-traduction sur bascule de langue)

    AuthUI.open = function (mode, opts) {
        opts = opts || {};
        injectStyles();
        if (!global.isCloudConfigured || !global.isCloudConfigured()) {
            global.GymUI && global.GymUI.toast
                ? global.GymUI.toast(t('auth.offline_toast', 'Mode hors-ligne — configure Supabase (js/config.js) pour le multijoueur.'), 'stat')
                : alert(t('auth.offline_alert', 'Mode hors-ligne : configure Supabase dans js/config.js pour activer les comptes en ligne.'));
            return;
        }
        let tab = mode || 'login';
        const back = document.createElement('div');
        back.className = 'sg-auth-backdrop';
        back.innerHTML = `
            <div class="sg-auth-modal">
                <button class="sg-auth-close" aria-label="${t('auth.close', 'Fermer')}">&times;</button>
                <a class="sg-auth-support" href="https://ko-fi.com/maheryrakotondrazaka" target="_blank" rel="noopener noreferrer"><i class="fas fa-mug-hot"></i> <span data-i18n="auth.support">Built by one Hunter — support the dev</span></a>
                <h2>SHADOW GYM</h2>
                <div class="sg-auth-sub" data-i18n="auth.subtitle">Synchronise ta progression · Rejoins le classement</div>
                <div class="sg-auth-tabs">
                    <button class="sg-auth-tab" data-tab="login" data-i18n="auth.login">CONNEXION</button>
                    <button class="sg-auth-tab" data-tab="signup" data-i18n="auth.signup">INSCRIPTION</button>
                </div>
                <div class="sg-auth-body"></div>
                <div class="sg-auth-err"></div>
                <button class="sg-auth-skip" data-i18n="auth.skip">Continuer hors-ligne →</button>
            </div>`;
        document.body.appendChild(back);
        if (global.I18n) I18n.apply(back);
        AuthUI._openBack = back;

        const body = back.querySelector('.sg-auth-body');
        const err = back.querySelector('.sg-auth-err');
        const close = () => { back.remove(); if (AuthUI._openBack === back) AuthUI._openBack = null; };
        const closeBtn = back.querySelector('.sg-auth-close');
        const skipBtn = back.querySelector('.sg-auth-skip');
        if (opts.mandatory) {
            // Connexion fortement encouragée : pas de croix ni de fermeture par clic extérieur,
            // MAIS une porte de sortie « continuer sans compte » qui détaille ce qui reste verrouillé.
            if (closeBtn) closeBtn.style.display = 'none';
            const guestProceed = function () {
                try { if (global.localStorage) localStorage.setItem('sg_guest', '1'); } catch (e) { /* ignore */ }
                close();
                if (typeof opts.onSkip === 'function') opts.onSkip();
            };
            const guestBox = document.createElement('div');
            guestBox.className = 'sg-auth-guest';
            guestBox.innerHTML = `
                <div class="sg-auth-guest-or" data-i18n="auth.guest_or">— or —</div>
                <div class="sg-auth-guest-title" data-i18n="auth.guest_locked">Without an account you'll miss:</div>
                <ul class="sg-auth-guest-list">
                    <li><i class="fas fa-cloud"></i> <span data-i18n="auth.guest_sync">Cross-device sync (progress stays on this device)</span></li>
                    <li><i class="fas fa-trophy"></i> <span data-i18n="auth.guest_lb">The world leaderboard</span></li>
                    <li><i class="fas fa-khanda"></i> <span data-i18n="auth.guest_pvp">PvP duels in the Arena</span></li>
                    <li><i class="fas fa-shield-halved"></i> <span data-i18n="auth.guest_guild">Guilds</span></li>
                </ul>
                <div class="sg-auth-guest-note" data-i18n="auth.guest_note">You can create an account anytime.</div>`;
            if (skipBtn && skipBtn.parentNode) skipBtn.parentNode.insertBefore(guestBox, skipBtn);
            if (global.I18n) I18n.apply(guestBox);
            if (skipBtn) {
                skipBtn.setAttribute('data-i18n', 'auth.guest_continue');
                skipBtn.textContent = t('auth.guest_continue', 'Continue without an account →');
                skipBtn.onclick = guestProceed;
            }
        } else {
            closeBtn.onclick = close;
            skipBtn.onclick = close;
            back.onclick = (e) => { if (e.target === back) close(); };
        }

        function render() {
            back.querySelectorAll('.sg-auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
            err.textContent = '';
            body.innerHTML = (tab === 'signup' ? `<input class="sg-auth-field" id="sgName" placeholder="${t('auth.name_ph', 'NOM DE HUNTER')}" maxlength="24">` : '')
                + `<input class="sg-auth-field" id="sgEmail" type="email" placeholder="${t('auth.email_ph', 'EMAIL')}" autocomplete="email">`
                + `<input class="sg-auth-field" id="sgPass" type="password" placeholder="${t('auth.pass_ph', 'MOT DE PASSE')}" autocomplete="current-password">`
                + `<button class="sg-auth-btn" id="sgSubmit">${tab === 'signup' ? t('auth.signup_btn', 'DEVENIR HUNTER') : t('auth.login_btn', 'ENTRER DANS LE DONJON')}</button>`;
            // Pré-remplit le nom de Hunter avec celui saisi à l'éveil (gym-index).
            if (tab === 'signup') { const ne = body.querySelector('#sgName'); if (ne && !ne.value) ne.value = storedName(); }
            body.querySelector('#sgSubmit').onclick = submit;
            body.querySelectorAll('.sg-auth-field').forEach(f => f.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
        }
        AuthUI._openRender = render;   // exposé pour re-rendu sur bascule de langue

        async function submit() {
            const email = (body.querySelector('#sgEmail') || {}).value;
            const pass = (body.querySelector('#sgPass') || {}).value;
            const name = (body.querySelector('#sgName') || {}).value;
            const btn = body.querySelector('#sgSubmit');
            err.textContent = '';
            if (!email || !pass) { err.textContent = t('auth.err_required', 'Email et mot de passe requis.'); return; }
            if (pass.length < 6) { err.textContent = t('auth.err_pass_short', 'Mot de passe : 6 caractères minimum.'); return; }
            btn.disabled = true; btn.textContent = t('auth.loading_btn', 'CONNEXION...');
            try {
                if (tab === 'signup') {
                    const r = await Cloud.signUp(email, pass, name || undefined);
                    if (r && r.user && !r.session) {
                        err.style.color = '#4caf50';
                        err.textContent = t('auth.signup_check_email', 'Compte créé ! Vérifie ton email pour confirmer.');
                        btn.textContent = t('auth.waiting_btn', 'EN ATTENTE...');
                        return;
                    }
                } else {
                    await Cloud.signIn(email, pass);
                }
                AuthUI._refreshChips();
                try { if (global.localStorage) localStorage.removeItem('sg_guest'); } catch (e) { /* ignore */ }
                const proceed = function () {
                    if (typeof opts.onSuccess === 'function') opts.onSuccess();
                    else close();
                };
                // Effet « accès accordé » (flash + son + particules + bienvenue) puis on enchaîne.
                AuthUI._successEffect(name || storedName(), proceed);
            } catch (e) {
                err.style.color = '';
                err.textContent = translateErr(e.message || 'Erreur');
                btn.disabled = false; btn.textContent = tab === 'signup' ? t('auth.signup_btn', 'DEVENIR HUNTER') : t('auth.login_btn', 'ENTRER DANS LE DONJON');
            }
        }

        back.querySelectorAll('.sg-auth-tab').forEach(t => t.onclick = () => { tab = t.dataset.tab; render(); });
        render();
    };

    function translateErr(m) {
        if (/Invalid login/i.test(m)) return t('auth.err_invalid', 'Email ou mot de passe incorrect.');
        if (/already registered/i.test(m)) return t('auth.err_registered', 'Cet email a déjà un compte.');
        if (/rate limit/i.test(m)) return t('auth.err_rate', 'Trop de tentatives, réessaie plus tard.');
        return m;
    }

    // Effet de réussite (connexion/inscription) : flash, son, particules et message de bienvenue,
    // puis exécution de `done` (rechargement / navigation / fermeture selon le contexte d'appel).
    AuthUI._successEffect = function (name, done) {
        const modal = AuthUI._openBack && AuthUI._openBack.querySelector('.sg-auth-modal');
        if (global.GymUI) {
            if (GymUI.screenFlash) GymUI.screenFlash();
            if (GymUI.sound) GymUI.sound('levelup');
        }
        if (modal) {
            const who = (name || '').toString().trim();
            modal.innerHTML = `
                <div class="sg-auth-success">
                    <div class="sg-auth-check"><i class="fas fa-bolt"></i></div>
                    <div class="sg-auth-granted">${t('auth.granted', 'ACCÈS ACCORDÉ')}</div>
                    <div class="sg-auth-welcome">${t('auth.welcome_name', 'Bienvenue, {name}', { name: who ? who.toUpperCase() : 'HUNTER' })}</div>
                </div>`;
            if (global.GymUI && GymUI.burst) GymUI.burst(modal, '#85acb9', 28);
        }
        setTimeout(function () { if (typeof done === 'function') done(); }, 1300);
    };

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
                const ask = (global.GymUI && global.GymUI.confirm)
                    ? global.GymUI.confirm({
                        icon: 'fa-right-from-bracket',
                        title: t('auth.logout_confirm', 'Se déconnecter ?'),
                        message: t('auth.logout_msg', 'Ta progression est sauvegardée.'),
                        confirmText: t('prof.signout', 'SE DÉCONNECTER'),
                        cancelText: t('common.cancel', 'ANNULER')
                    })
                    : Promise.resolve(confirm(t('auth.logout_confirm', 'Se déconnecter ?')));
                ask.then((ok) => { if (ok) Cloud.signOut().then(() => AuthUI._refreshChips()); });
            } else {
                this.open('login');
            }
        };
    };
    AuthUI._renderChip = function (chip) {
        const online = Cloud && Cloud.isLoggedIn();
        chip.innerHTML = online
            ? '<i class="fas fa-circle" style="color:#4caf50;font-size:.6em;"></i> ' + t('common.online', 'EN LIGNE')
            : '<i class="fas fa-circle" style="color:#888;font-size:.6em;"></i> ' + t('common.offline', 'HORS-LIGNE');
    };
    AuthUI._refreshChips = function () { this._chips.forEach(c => this._renderChip(c)); };

    // Re-traduit les puces et la modale ouverte au changement de langue FR/EN.
    AuthUI._onLangChange = function () {
        AuthUI._refreshChips();
        if (AuthUI._openBack) {
            if (global.I18n) I18n.apply(AuthUI._openBack);
            if (typeof AuthUI._openRender === 'function') AuthUI._openRender();
            const closeBtn = AuthUI._openBack.querySelector('.sg-auth-close');
            if (closeBtn) closeBtn.setAttribute('aria-label', t('auth.close', 'Fermer'));
        }
    };

    // ==================== BOOT ====================
    function boot() {
        if (AuthUI._booted) return; AuthUI._booted = true;
        if (Cloud) {
            Cloud.init();
            Cloud.on('auth', () => AuthUI._refreshChips());
            Cloud.on('ready', () => AuthUI._refreshChips());
        }
        if (global.I18n && typeof global.I18n.onChange === 'function') global.I18n.onChange(AuthUI._onLangChange);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

    global.AuthUI = AuthUI;
})(typeof window !== 'undefined' ? window : this);
