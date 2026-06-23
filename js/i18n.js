/**
 * SHADOW GYM - Internationalisation (FR / EN)
 * ===========================================
 * - Traduit les éléments [data-i18n] (texte) et [data-i18n-ph] (placeholder).
 * - t(key) pour les chaînes construites en JS.
 * - Bascule de langue persistée dans Hunter.settings.language.
 * - Au changement de langue : régénère les quêtes dans la bonne langue puis recharge.
 *
 * À inclure après store.js : <script src="js/i18n.js"></script>
 */
(function (global) {
    'use strict';

    const DICT = {
        fr: {
            // Navigation
            'nav.dashboard': 'ACCUEIL', 'nav.quests': 'QUÊTES', 'nav.skills': 'TALENTS',
            'nav.progress': 'PROGRÈS', 'nav.ranking': 'CLASSEMENT', 'nav.arena': 'ARÈNE',
            'nav.guilds': 'GUILDES', 'nav.profile': 'PROFIL',
            // Commun
            'common.online': 'EN LIGNE', 'common.offline': 'HORS-LIGNE', 'common.loading': 'CHARGEMENT...',
            'common.level': 'NIV.', 'common.power': 'PUISSANCE', 'common.rank': 'RANG',
            'weekly.global': 'DÉFI HEBDO MONDIAL', 'weekly.claim': 'RÉCLAMER', 'weekly.claimed': 'Récompense obtenue', 'weekly.done': 'Défi hebdo accompli !',
            // Accueil
            'start.tagline': 'ARISE — DEVIENS LE HUNTER ULTIME',
            'start.subtitle': 'Transforme chaque entraînement en quête. Monte de niveau, gagne des rangs E → S, grimpe le classement mondial et défie d\'autres Hunters dans l\'Arène.',
            'start.cta_start': 'COMMENCER L\'ASCENSION', 'start.cta_continue': 'CONTINUER L\'ENTRAÎNEMENT',
            'start.cta_leaderboard': 'VOIR LE CLASSEMENT', 'start.cta_login': 'SE CONNECTER',
            'start.feat_quests': 'QUÊTES PERSONNALISÉES', 'start.feat_ranking': 'CLASSEMENT MONDIAL',
            'start.feat_pvp': 'DUELS PVP', 'start.feat_streaks': 'SÉRIES & SUCCÈS',
            'start.welcome_back': 'Bon retour', 'start.dungeon_waits': 'Ton donjon t\'attend.',
            // Classement
            'lb.title': 'CLASSEMENT', 'lb.subtitle': 'LES HUNTERS LES PLUS PUISSANTS DU SYSTÈME',
            'lb.demo': 'DONNÉES DE DÉMO — connecte-toi pour le classement réel',
            'lb.all': 'TOUS', 'lb.my_position': 'TA POSITION',
            // Arène
            'ar.title': 'L\'ARÈNE', 'ar.subtitle': 'DÉFIE D\'AUTRES HUNTERS · PROUVE TA DOMINANCE',
            'ar.create': 'LANCER UN DÉFI', 'ar.search_ph': 'RECHERCHER UN HUNTER PAR NOM...',
            'ar.type': 'TYPE DE DÉFI', 'ar.send': 'ENVOYER LE DÉFI', 'ar.my_challenges': 'MES DÉFIS',
            'ar.offline_title': 'CONNEXION REQUISE',
            'ar.offline_text': 'L\'Arène te permet de défier d\'autres Hunters en duel (XP, séances, séries). Connecte-toi pour entrer dans l\'arène et lancer des défis en temps réel.',
            'ar.join': 'REJOINDRE L\'ARÈNE', 'ar.no_challenges': 'Aucun défi pour le moment.',
            // Guildes
            'gu.title': 'LES GUILDES', 'gu.subtitle': 'UNIS-TOI · DOMINEZ ENSEMBLE LE CLASSEMENT',
            'gu.create': 'FONDER UNE GUILDE', 'gu.name_ph': 'NOM DE LA GUILDE',
            'gu.found': 'FONDER', 'gu.browse': 'GUILDES OUVERTES', 'gu.my_guild': 'MA GUILDE',
            'gu.members': 'membres', 'gu.join': 'REJOINDRE', 'gu.leave': 'QUITTER',
            'gu.offline_title': 'CONNEXION REQUISE',
            'gu.offline_text': 'Rejoins une guilde pour cumuler la puissance de tes alliés et grimper le classement des guildes. Connecte-toi pour commencer.',
            'gu.total_power': 'PUISSANCE TOTALE', 'gu.weekly': 'DÉFI HEBDO DE GUILDE',
            'lb.power_label': 'PUISSANCE', 'lb.lvl': 'Niv.', 'lb.empty': 'Aucun Hunter à ce rang.', 'lb.error': 'Erreur de chargement.',
            'ar.type_xp': 'XP', 'ar.type_workouts': 'séances', 'ar.type_streak': 'jours de série',
            'ar.st_pending': 'EN ATTENTE', 'ar.st_active': 'EN COURS', 'ar.st_completed': 'TERMINÉ', 'ar.st_declined': 'REFUSÉ',
            'ar.you': 'TOI', 'ar.first_to': 'Premier à', 'ar.accept': 'ACCEPTER', 'ar.decline': 'REFUSER',
            'ar.waiting': 'En attente de réponse...', 'ar.victory': 'VICTOIRE', 'ar.defeat': 'DÉFAITE', 'ar.opponent': 'Adversaire',
            'ar.pick_opponent': 'Choisis un adversaire.', 'ar.sent_to': 'Défi envoyé à', 'ar.none_found': 'Aucun Hunter trouvé.',
            'ar.duel_sent': 'Défi lancé !', 'ar.accepted': 'Défi accepté ! Que le meilleur gagne.', 'ar.recruit': 'Défier',
            'gu.leave_confirm': 'Quitter la guilde ?', 'gu.welcome': 'Bienvenue dans la guilde !', 'gu.founded': 'Guilde fondée !',
            'gu.left': 'Tu as quitté la guilde.', 'gu.name_taken': 'Ce nom est déjà pris.', 'gu.name_short': 'Nom trop court (3 min).',
            'gu.recruiting': 'RECRUTE', 'gu.recruiting_only': 'Recrutement ouvert uniquement'
        },
        en: {
            'nav.dashboard': 'HOME', 'nav.quests': 'QUESTS', 'nav.skills': 'SKILLS',
            'nav.progress': 'PROGRESS', 'nav.ranking': 'RANKING', 'nav.arena': 'ARENA',
            'nav.guilds': 'GUILDS', 'nav.profile': 'PROFILE',
            'common.online': 'ONLINE', 'common.offline': 'OFFLINE', 'common.loading': 'LOADING...',
            'common.level': 'LV.', 'common.power': 'POWER', 'common.rank': 'RANK',
            'weekly.global': 'GLOBAL WEEKLY CHALLENGE', 'weekly.claim': 'CLAIM', 'weekly.claimed': 'Reward claimed', 'weekly.done': 'Weekly challenge complete!',
            'start.tagline': 'ARISE — BECOME THE ULTIMATE HUNTER',
            'start.subtitle': 'Turn every workout into a quest. Level up, earn ranks E → S, climb the global leaderboard and challenge other Hunters in the Arena.',
            'start.cta_start': 'BEGIN YOUR ASCENT', 'start.cta_continue': 'CONTINUE TRAINING',
            'start.cta_leaderboard': 'VIEW LEADERBOARD', 'start.cta_login': 'SIGN IN',
            'start.feat_quests': 'PERSONALIZED QUESTS', 'start.feat_ranking': 'GLOBAL LEADERBOARD',
            'start.feat_pvp': 'PVP DUELS', 'start.feat_streaks': 'STREAKS & ACHIEVEMENTS',
            'start.welcome_back': 'Welcome back', 'start.dungeon_waits': 'Your dungeon awaits.',
            'lb.title': 'LEADERBOARD', 'lb.subtitle': 'THE MOST POWERFUL HUNTERS IN THE SYSTEM',
            'lb.demo': 'DEMO DATA — sign in for the real leaderboard',
            'lb.all': 'ALL', 'lb.my_position': 'YOUR RANK',
            'ar.title': 'THE ARENA', 'ar.subtitle': 'CHALLENGE OTHER HUNTERS · PROVE YOUR DOMINANCE',
            'ar.create': 'START A DUEL', 'ar.search_ph': 'SEARCH A HUNTER BY NAME...',
            'ar.type': 'DUEL TYPE', 'ar.send': 'SEND CHALLENGE', 'ar.my_challenges': 'MY DUELS',
            'ar.offline_title': 'SIGN IN REQUIRED',
            'ar.offline_text': 'The Arena lets you challenge other Hunters in duels (XP, workouts, streaks). Sign in to enter the arena and start real-time challenges.',
            'ar.join': 'ENTER THE ARENA', 'ar.no_challenges': 'No duels yet.',
            'gu.title': 'GUILDS', 'gu.subtitle': 'UNITE · DOMINATE THE RANKINGS TOGETHER',
            'gu.create': 'FOUND A GUILD', 'gu.name_ph': 'GUILD NAME',
            'gu.found': 'FOUND', 'gu.browse': 'OPEN GUILDS', 'gu.my_guild': 'MY GUILD',
            'gu.members': 'members', 'gu.join': 'JOIN', 'gu.leave': 'LEAVE',
            'gu.offline_title': 'SIGN IN REQUIRED',
            'gu.offline_text': 'Join a guild to combine your allies\' power and climb the guild leaderboard. Sign in to get started.',
            'gu.total_power': 'TOTAL POWER', 'gu.weekly': 'GUILD WEEKLY CHALLENGE',
            'lb.power_label': 'POWER', 'lb.lvl': 'Lv.', 'lb.empty': 'No Hunters at this rank yet.', 'lb.error': 'Loading error.',
            'ar.type_xp': 'XP', 'ar.type_workouts': 'workouts', 'ar.type_streak': 'streak days',
            'ar.st_pending': 'PENDING', 'ar.st_active': 'ACTIVE', 'ar.st_completed': 'COMPLETED', 'ar.st_declined': 'DECLINED',
            'ar.you': 'YOU', 'ar.first_to': 'First to', 'ar.accept': 'ACCEPT', 'ar.decline': 'DECLINE',
            'ar.waiting': 'Waiting for response...', 'ar.victory': 'VICTORY', 'ar.defeat': 'DEFEAT', 'ar.opponent': 'Opponent',
            'ar.pick_opponent': 'Pick an opponent.', 'ar.sent_to': 'Challenge sent to', 'ar.none_found': 'No Hunter found.',
            'ar.duel_sent': 'Challenge sent!', 'ar.accepted': 'Challenge accepted! May the best win.', 'ar.recruit': 'Challenge',
            'gu.leave_confirm': 'Leave the guild?', 'gu.welcome': 'Welcome to the guild!', 'gu.founded': 'Guild founded!',
            'gu.left': 'You left the guild.', 'gu.name_taken': 'That name is already taken.', 'gu.name_short': 'Name too short (min 3).',
            'gu.recruiting': 'RECRUITING', 'gu.recruiting_only': 'Recruiting only'
        }
    };

    const I18n = {
        lang: 'fr',
        _listeners: [],

        init: function () {
            this.lang = (global.Hunter && global.Hunter.get('settings') && global.Hunter.get('settings').language) || 'fr';
            if (this.lang !== 'en') this.lang = 'fr';
        },

        t: function (key, vars) {
            let s = (DICT[this.lang] && DICT[this.lang][key]) || DICT.fr[key] || key;
            if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
            return s;
        },

        apply: function (root) {
            const scope = root || document;
            scope.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = this.t(el.getAttribute('data-i18n')); });
            scope.querySelectorAll('[data-i18n-ph]').forEach(el => { el.setAttribute('placeholder', this.t(el.getAttribute('data-i18n-ph'))); });
            // Traduit la navigation par href (aucune balise data-i18n requise)
            const navMap = {
                'gym-dashboard.html': 'nav.dashboard', 'gym-workouts.html': 'nav.quests',
                'gym-exercises.html': 'nav.skills', 'gym-progress.html': 'nav.progress',
                'gym-leaderboard.html': 'nav.ranking', 'gym-challenges.html': 'nav.arena',
                'gym-guilds.html': 'nav.guilds', 'gym-profile.html': 'nav.profile'
            };
            scope.querySelectorAll('a.nav-link').forEach(a => {
                const key = navMap[a.getAttribute('href')];
                if (key) a.textContent = this.t(key);
            });
            document.documentElement.lang = this.lang;
        },

        setLang: function (lang, opts) {
            this.lang = lang === 'en' ? 'en' : 'fr';
            if (global.Hunter) global.Hunter.setSetting('language', this.lang);
            this._regenerateQuests();
            this.apply();
            this._listeners.forEach(cb => { try { cb(this.lang); } catch (e) {} });
            if (!opts || opts.reload !== false) {
                // Recharge pour que tout le contenu (y compris non balisé) se traduise
                setTimeout(() => global.location.reload(), 60);
            }
        },

        toggle: function () { this.setLang(this.lang === 'fr' ? 'en' : 'fr'); },

        onChange: function (cb) { this._listeners.push(cb); },

        // Régénère les quêtes du jour dans la nouvelle langue (mêmes exercices, traduits)
        _regenerateQuests: function () {
            if (!global.QuestLibrary || !global.localStorage) return;
            const metaRaw = localStorage.getItem('protocolMeta');
            if (!metaRaw) return;
            try {
                const meta = JSON.parse(metaRaw);
                meta.lang = this.lang;
                const p = global.QuestLibrary.generateProtocol(meta);
                localStorage.setItem('dailyQuests', JSON.stringify(p.dailyQuests));
                localStorage.setItem('weeklyQuest', JSON.stringify(p.weeklyQuest));
                localStorage.setItem('weeklySchedule', JSON.stringify(p.weeklySchedule));
                localStorage.setItem('nutritionTips', JSON.stringify(p.nutritionTips));
                localStorage.setItem('protocolMeta', JSON.stringify(p.meta));
            } catch (e) { /* ignore */ }
        },

        // Bouton bascule FR | EN
        mountToggle: function (selector) {
            const host = typeof selector === 'string' ? document.querySelector(selector) : selector;
            if (!host) return;
            const btn = document.createElement('button');
            btn.className = 'sg-lang-toggle';
            btn.type = 'button';
            const render = () => {
                btn.innerHTML = `<span class="${this.lang === 'fr' ? 'on' : ''}">FR</span><span class="sep">|</span><span class="${this.lang === 'en' ? 'on' : ''}">EN</span>`;
            };
            render();
            btn.onclick = () => this.toggle();
            if (!document.getElementById('sg-lang-styles')) {
                const st = document.createElement('style');
                st.id = 'sg-lang-styles';
                st.textContent = `.sg-lang-toggle{background:transparent;border:1px solid rgba(133,172,185,.4);color:rgba(255,255,255,.5);
                    padding:5px 10px;cursor:pointer;font-family:inherit;font-size:.72em;letter-spacing:1px;}
                    .sg-lang-toggle:hover{border-color:#85acb9;} .sg-lang-toggle .on{color:#85acb9;font-weight:700;text-shadow:0 0 8px rgba(133,172,185,.5);}
                    .sg-lang-toggle .sep{margin:0 5px;opacity:.4;}`;
                document.head.appendChild(st);
            }
            host.appendChild(btn);
        }
    };

    I18n.init();
    global.I18n = I18n;

    function boot() {
        I18n.apply();
        // Auto-monte la bascule de langue dans la barre de navigation/compte
        const host = document.querySelector('.nav-profile') || document.querySelector('#navProfile');
        if (host && !host.querySelector('.sg-lang-toggle')) I18n.mountToggle(host);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

    if (typeof module !== 'undefined' && module.exports) module.exports = { I18n, DICT };
})(typeof window !== 'undefined' ? window : this);
