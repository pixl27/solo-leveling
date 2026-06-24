/**
 * SHADOW GYM - Garde d'authentification (pages personnelles)
 * ==========================================================
 * À inclure APRÈS auth-ui.js sur les pages qui exigent un compte
 * (tableau de bord, quêtes, talents, progression, arène, guildes, forge, profil).
 *
 * Si le cloud est configuré et que le Hunter n'est PAS connecté, ouvre une modale
 * de connexion/inscription OBLIGATOIRE (non fermable). À la réussite, recharge la
 * page (la progression locale est migrée vers le compte par Cloud._onAuthenticated).
 *
 * Les pages publiques (start.html, classement) et l'onboarding (gym-index, gym-setup)
 * n'incluent PAS ce script. Si le cloud n'est pas configuré, la garde laisse passer
 * (l'app reste jouable hors-ligne).
 */
(function (global) {
    'use strict';

    function gate() {
        const Cloud = global.Cloud, AuthUI = global.AuthUI;
        // Pas de backend configuré → on ne peut pas exiger de compte : on laisse passer.
        if (!global.isCloudConfigured || !global.isCloudConfigured()) return;
        if (!Cloud || !AuthUI) return;

        const check = function () {
            if (Cloud.isLoggedIn()) return;
            // A déjà choisi « continuer sans compte » → on ne le redemande pas (le menu/puce reste dispo).
            try { if (global.localStorage && localStorage.getItem('sg_guest') === '1') return; } catch (e) { /* ignore */ }
            AuthUI.open('login', {
                mandatory: true,
                onSuccess: function () { global.location.reload(); }
                // onSkip non requis : « continuer sans compte » ferme la modale et la page (déjà rendue) reste visible.
            });
        };

        // auth-ui.js a déjà lancé Cloud.init() ; init() est idempotent et sa promesse
        // se résout APRÈS la restauration de session → on enchaîne dessus sans course.
        const p = (typeof Cloud.init === 'function') ? Cloud.init() : null;
        if (p && typeof p.then === 'function') p.then(check, check);
        else check();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', gate);
    else gate();

    global.SGAuthGate = { run: gate };
})(typeof window !== 'undefined' ? window : this);
