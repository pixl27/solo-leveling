/**
 * SHADOW GYM - Défi hebdomadaire global automatique
 * ==================================================
 * Génère un défi mondial identique pour tous, déterministe selon le numéro
 * de semaine ISO. Rotation automatique chaque semaine. Suivi de progression
 * local (baseline au début de semaine) + récompense en XP à la complétion.
 *
 * À inclure après store.js : <script src="js/weekly.js"></script>
 */
(function (global) {
    'use strict';

    // Défis en rotation (un par semaine, cyclique)
    const CHALLENGES = [
        { type: 'xp',       goal: 1500, reward: 400, icon: 'fa-wand-magic-sparkles', fr: { name: 'Marée de Mana', desc: 'Gagne 1500 XP cette semaine' }, en: { name: 'Mana Surge', desc: 'Earn 1500 XP this week' } },
        { type: 'workouts', goal: 10,   reward: 400, icon: 'fa-bolt',                fr: { name: 'Assaut Hebdomadaire', desc: 'Complète 10 séances cette semaine' }, en: { name: 'Weekly Assault', desc: 'Complete 10 workouts this week' } },
        { type: 'streak',   goal: 7,    reward: 500, icon: 'fa-fire-flame-curved',  fr: { name: 'Flamme Éternelle', desc: 'Atteins une série de 7 jours' }, en: { name: 'Eternal Flame', desc: 'Reach a 7-day streak' } },
        { type: 'xp',       goal: 2500, reward: 600, icon: 'fa-meteor',             fr: { name: 'Frénésie du Donjon', desc: 'Gagne 2500 XP cette semaine' }, en: { name: 'Dungeon Frenzy', desc: 'Earn 2500 XP this week' } },
        { type: 'workouts', goal: 15,   reward: 600, icon: 'fa-dumbbell',           fr: { name: 'Marche Forcée', desc: 'Complète 15 séances cette semaine' }, en: { name: 'Forced March', desc: 'Complete 15 workouts this week' } }
    ];

    // Numéro de semaine ISO + année → clé unique "2026-W24"
    function isoWeekKey(d) {
        d = d ? new Date(d) : new Date();
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const day = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - day);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
        return { key: date.getUTCFullYear() + '-W' + String(week).padStart(2, '0'), week: week, year: date.getUTCFullYear() };
    }

    const Weekly = {
        current: function (lang) {
            const wk = isoWeekKey();
            const idx = (wk.week + wk.year) % CHALLENGES.length;
            const c = CHALLENGES[idx];
            const L = (lang || (global.I18n && I18n.lang) || 'fr') === 'en' ? 'en' : 'fr';
            return {
                weekKey: wk.key, week: wk.week, type: c.type, goal: c.goal, reward: c.reward, icon: c.icon,
                name: c[L].name, desc: c[L].desc
            };
        },

        _metric: function (type) {
            const H = global.Hunter; if (!H) return 0;
            if (type === 'workouts') return H.get('totalWorkouts');
            if (type === 'streak') return H.get('currentStreak');
            return H.get('totalXP');
        },

        // Récupère / initialise la baseline de la semaine en cours
        _baseline: function (ch) {
            let store = {};
            try { store = JSON.parse(localStorage.getItem('weeklyChallenge') || '{}'); } catch (e) {}
            if (store.weekKey !== ch.weekKey) {
                // Nouvelle semaine → réinitialise la baseline
                store = { weekKey: ch.weekKey, baseXP: this._metric('xp'), baseWorkouts: this._metric('workouts'), claimed: false };
                localStorage.setItem('weeklyChallenge', JSON.stringify(store));
            }
            return store;
        },

        getProgress: function () {
            const ch = this.current();
            const base = this._baseline(ch);
            let progress;
            if (ch.type === 'xp') progress = this._metric('xp') - (base.baseXP || 0);
            else if (ch.type === 'workouts') progress = this._metric('workouts') - (base.baseWorkouts || 0);
            else progress = this._metric('streak'); // streak : valeur absolue
            progress = Math.max(0, progress);
            return {
                challenge: ch,
                progress: Math.min(progress, ch.goal),
                rawProgress: progress,
                goal: ch.goal,
                percent: Math.min(100, (progress / ch.goal) * 100),
                completed: progress >= ch.goal,
                claimed: !!base.claimed
            };
        },

        claim: function () {
            const st = this.getProgress();
            if (!st.completed || st.claimed) return false;
            let store = {};
            try { store = JSON.parse(localStorage.getItem('weeklyChallenge') || '{}'); } catch (e) {}
            store.claimed = true;
            localStorage.setItem('weeklyChallenge', JSON.stringify(store));
            if (global.Hunter) global.Hunter.addXP(st.challenge.reward, 'Défi hebdo');
            return st.challenge.reward;
        }
    };

    global.Weekly = Weekly;
    if (typeof module !== 'undefined' && module.exports) module.exports = Weekly;
})(typeof window !== 'undefined' ? window : this);
