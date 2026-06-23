/**
 * SHADOW GYM - Hunter Store (moteur de données unifié)
 * =====================================================
 * Source unique de vérité pour toutes les données du Hunter.
 *
 * Résout l'ancien problème des "deux modèles de données" :
 *  - écrit l'objet canonique `shadowGymData`
 *  - ET maintient en parallèle les clés individuelles (hunterLevel, hunterXP, ...)
 *    pour rester compatible avec les pages existantes.
 *
 * Fournit aussi :
 *  - un système d'événements (on/emit) pour que l'UI réagisse aux changements
 *  - des hooks de synchronisation cloud (Supabase) branchables à chaud
 *
 * Usage :
 *   Hunter.addXP(50, 'Quête');
 *   Hunter.get('level');
 *   Hunter.on('levelup', (d) => { ... });
 */

(function (global) {
    'use strict';

    const STORAGE_KEY = 'shadowGymData';
    const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S'];

    const RANK_REQUIREMENTS = {
        D: { level: 10, workouts: 50, str: 25 },
        C: { level: 25, workouts: 150, str: 40 },
        B: { level: 50, workouts: 300, str: 60 },
        A: { level: 75, workouts: 500, str: 80 },
        S: { level: 100, workouts: 1000, str: 100 }
    };

    const ACHIEVEMENTS = {
        AWAKENED: { name: 'Éveillé', desc: 'Le Système t\'a choisi', icon: 'fa-bolt' },
        FIRST_BLOOD: { name: 'Première Quête', desc: 'Complète ta première quête', icon: 'fa-scroll' },
        BURNING_SPIRIT: { name: 'Esprit Ardent', desc: '7 jours d\'affilée', icon: 'fa-fire' },
        RELENTLESS: { name: 'Implacable', desc: '30 jours d\'affilée', icon: 'fa-meteor' },
        IRON_WILL: { name: 'Volonté de Fer', desc: '100 séances complétées', icon: 'fa-dumbbell' },
        STRENGTH_MASTER: { name: 'Maître de Force', desc: '50 STR', icon: 'fa-hand-fist' },
        LIGHTNING_SPEED: { name: 'Vitesse Éclair', desc: '50 AGI', icon: 'fa-bolt-lightning' },
        UNBREAKABLE: { name: 'Incassable', desc: '50 END', icon: 'fa-shield-halved' },
        IMMORTAL_BODY: { name: 'Corps Immortel', desc: '500 VIT', icon: 'fa-heart-pulse' },
        S_RANK_HUNTER: { name: 'Hunter Rang S', desc: 'Atteins le rang S', icon: 'fa-crown' }
    };

    function defaultData() {
        const now = new Date();
        return {
            // Identité
            userId: null,                 // id Supabase (null = local uniquement)
            name: 'SHADOW HUNTER',
            title: '★ RISING HUNTER ★',
            avatar: 'fa-user-ninja',
            avatarColor: '#85acb9',
            // Progression
            level: 1,
            xp: 0,
            totalXP: 0,
            rank: 'E',
            availablePoints: 0,
            // Stats
            stats: { STR: 10, AGI: 10, END: 10, VIT: 100 },
            // Activité
            totalWorkouts: 0,
            currentStreak: 0,
            longestStreak: 0,
            daysActive: 1,
            lastWorkoutDate: null,
            // Profil physique (rempli au setup)
            profile: { height: null, weight: null, age: null, objective: null, fitness: null, bmi: null },
            // Collections
            completedQuests: [],
            achievements: ['AWAKENED'],
            // Social (en ligne)
            guild: null,
            // Réglages
            settings: { notifications: true, sounds: true, particles: true, language: 'fr' },
            // Méta
            lastLogin: now.toDateString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            cloudSynced: false
        };
    }

    class HunterStore {
        constructor() {
            this.listeners = {};
            this.cloud = null;          // adaptateur cloud (Supabase), branché plus tard
            this._cloudTimer = null;
            this.data = this.load();
        }

        // ==================== CHARGEMENT / MIGRATION ====================

        load() {
            let data;
            const saved = global.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
            if (saved) {
                try {
                    data = Object.assign(defaultData(), JSON.parse(saved));
                    data.stats = Object.assign(defaultData().stats, data.stats || {});
                    data.profile = Object.assign(defaultData().profile, data.profile || {});
                    data.settings = Object.assign(defaultData().settings, data.settings || {});
                } catch (e) {
                    data = defaultData();
                }
            } else {
                data = defaultData();
            }

            // Migration : récupère les données écrites par les anciennes pages
            // (qui utilisent des clés individuelles) et prend la valeur la plus avancée.
            data = this.mergeLegacyKeys(data);
            return data;
        }

        mergeLegacyKeys(data) {
            if (!global.localStorage) return data;
            const num = (k, d) => { const v = parseInt(localStorage.getItem(k)); return isNaN(v) ? d : v; };
            const str = (k, d) => localStorage.getItem(k) || d;

            // On prend le max pour la progression (évite toute régression de niveau/XP)
            data.level = Math.max(data.level, num('hunterLevel', 1));
            data.xp = Math.max(data.xp, num('hunterXP', 0));
            data.totalXP = Math.max(data.totalXP, num('totalXPEarned', 0));
            data.stats.STR = Math.max(data.stats.STR, num('hunterSTR', 10));
            data.stats.AGI = Math.max(data.stats.AGI, num('hunterAGI', 10));
            data.stats.END = Math.max(data.stats.END, num('hunterEND', 10));
            data.stats.VIT = Math.max(data.stats.VIT, num('hunterVIT', 100));
            data.totalWorkouts = Math.max(data.totalWorkouts, num('totalWorkouts', 0));
            data.currentStreak = Math.max(data.currentStreak, num('currentStreak', 0));
            data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
            data.daysActive = Math.max(data.daysActive, num('daysActive', 1));
            data.availablePoints = Math.max(data.availablePoints, num('availablePoints', 0));

            // Identité : la clé individuelle prime si présente (l'utilisateur l'a saisie)
            const legacyName = localStorage.getItem('hunterName');
            if (legacyName) data.name = legacyName;
            const legacyTitle = localStorage.getItem('hunterTitle');
            if (legacyTitle) data.title = legacyTitle;
            const legacyRank = localStorage.getItem('hunterRank');
            if (legacyRank && RANK_ORDER.includes(legacyRank)) {
                // On garde le rang le plus élevé entre les deux
                data.rank = RANK_ORDER[Math.max(RANK_ORDER.indexOf(data.rank), RANK_ORDER.indexOf(legacyRank))];
            }

            // Profil physique
            data.profile.height = data.profile.height || str('hunterHeight', null);
            data.profile.weight = data.profile.weight || str('hunterWeight', null);
            data.profile.age = data.profile.age || str('hunterAge', null);
            data.profile.objective = data.profile.objective || str('hunterObjective', null);
            data.profile.fitness = data.profile.fitness || str('hunterFitness', null);
            data.profile.bmi = data.profile.bmi || str('hunterBMI', null);

            return data;
        }

        // ==================== SAUVEGARDE ====================

        save(options) {
            options = options || {};
            this.data.updatedAt = new Date().toISOString();
            if (global.localStorage) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
                this.syncIndividualKeys();
            }
            this.emit('change', this.data);
            if (!options.skipCloud) this.scheduleCloudSync();
        }

        syncIndividualKeys() {
            // Maintient les clés individuelles à jour pour les pages non encore refactorées
            const d = this.data;
            const set = (k, v) => localStorage.setItem(k, v);
            set('hunterLevel', d.level);
            set('hunterXP', d.xp);
            set('hunterRank', d.rank);
            set('hunterSTR', d.stats.STR);
            set('hunterAGI', d.stats.AGI);
            set('hunterEND', d.stats.END);
            set('hunterVIT', d.stats.VIT);
            set('totalWorkouts', d.totalWorkouts);
            set('currentStreak', d.currentStreak);
            set('hunterName', d.name);
            set('hunterTitle', d.title);
            set('totalXPEarned', d.totalXP);
            set('daysActive', d.daysActive);
            set('availablePoints', d.availablePoints);
        }

        // ==================== GETTERS ====================

        get(key) { return this.data[key]; }
        getData() { return this.data; }
        getStat(s) { return this.data.stats[s]; }

        getXPForLevel(level) {
            // Cohérent avec la logique du dashboard : 100 XP × niveau
            return (level || this.data.level) * 100;
        }

        getProgressPercent() {
            return Math.min(100, (this.data.xp / this.getXPForLevel()) * 100);
        }

        getRankColor(rank) {
            const colors = { E: '#888', D: '#4caf50', C: '#2196f3', B: '#9c27b0', A: '#ff9800', S: '#ffd700' };
            return colors[rank || this.data.rank] || '#85acb9';
        }

        getCombatPower() {
            // Métrique unique de puissance, utilisée pour les classements
            const d = this.data;
            const statSum = d.stats.STR + d.stats.AGI + d.stats.END;
            return Math.round(
                d.level * 100 +
                statSum * 10 +
                d.stats.VIT * 2 +
                d.longestStreak * 25 +
                d.totalWorkouts * 5 +
                (RANK_ORDER.indexOf(d.rank) * 500)
            );
        }

        // ==================== XP & NIVEAU ====================

        addXP(amount, source) {
            amount = Math.max(0, Math.round(amount));
            this.data.xp += amount;
            this.data.totalXP += amount;

            let leveledUp = false;
            while (this.data.xp >= this.getXPForLevel()) {
                this.data.xp -= this.getXPForLevel();
                this.data.level++;
                this.data.availablePoints += 3;
                leveledUp = true;
                this.emit('levelup', { level: this.data.level, points: 3 });
            }

            if (leveledUp) this.checkRankUp();
            this.checkAchievements();
            this.save();
            this.emit('xp', { amount: amount, source: source || 'Inconnu', total: this.data.xp });
            return { leveledUp: leveledUp, level: this.data.level };
        }

        checkRankUp() {
            const idx = RANK_ORDER.indexOf(this.data.rank);
            if (idx >= RANK_ORDER.length - 1) return;
            const next = RANK_ORDER[idx + 1];
            const req = RANK_REQUIREMENTS[next];
            if (this.data.level >= req.level &&
                this.data.totalWorkouts >= req.workouts &&
                this.data.stats.STR >= req.str) {
                this.data.rank = next;
                this.emit('rankup', { rank: next });
                this.checkAchievements();
            }
        }

        // ==================== STATS ====================

        allocateStat(stat, amount) {
            amount = amount || 1;
            if (!(stat in this.data.stats)) return false;
            if (amount > 0 && this.data.availablePoints < amount) return false;
            if (amount < 0 && this.data.stats[stat] + amount < (stat === 'VIT' ? 100 : 10)) return false;
            this.data.stats[stat] += amount;
            this.data.availablePoints -= amount;
            this.checkAchievements();
            this.save();
            this.emit('stat', { stat: stat, value: this.data.stats[stat] });
            return true;
        }

        // Petite chance de gagner un point de stat via l'effort (montée "naturelle")
        trainStat(stat, intensity) {
            if (!(stat in this.data.stats)) return;
            if (Math.random() < (intensity || 20) / 100) {
                this.data.stats[stat]++;
                this.save();
                this.emit('stat', { stat: stat, value: this.data.stats[stat], natural: true });
            }
        }

        // ==================== QUÊTES / SÉANCES ====================

        completeQuest(quest) {
            quest = quest || {};
            this.data.totalWorkouts++;
            this.data.completedQuests.push({
                id: quest.id || quest.name || 'quest',
                name: quest.name || null,
                completedAt: new Date().toISOString()
            });
            this.updateStreak();
            const xp = Math.round((quest.xp || 50) * 1.08); // +8% bonus d'équipement de départ
            if (quest.stat) this.trainStat(quest.stat, quest.type === 'strength' ? 30 : 20);
            this.addXP(xp, quest.name || 'Quête'); // addXP appelle save()
            return xp;
        }

        updateStreak() {
            const today = new Date().toDateString();
            const last = this.data.lastWorkoutDate;
            if (last === today) return; // déjà compté aujourd'hui
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (last === yesterday.toDateString()) {
                this.data.currentStreak++;
            } else {
                this.data.currentStreak = 1;
            }
            if (this.data.currentStreak > this.data.longestStreak) {
                this.data.longestStreak = this.data.currentStreak;
            }
            this.data.lastWorkoutDate = today;
            localStorage.setItem('lastWorkoutDate', today);
        }

        checkDailyReset() {
            const today = new Date().toDateString();
            if (this.data.lastLogin !== today) {
                this.data.lastLogin = today;
                this.data.daysActive++;
                // Rupture de streak si plus d'un jour d'absence
                const last = this.data.lastWorkoutDate;
                if (last) {
                    const diff = Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
                    if (diff > 1) this.data.currentStreak = 0;
                }
                this.save();
                this.emit('newday', { daysActive: this.data.daysActive });
            }
        }

        // ==================== SUCCÈS ====================

        checkAchievements() {
            const d = this.data;
            const conditions = {
                FIRST_BLOOD: () => d.totalWorkouts >= 1,
                BURNING_SPIRIT: () => d.currentStreak >= 7,
                RELENTLESS: () => d.currentStreak >= 30,
                IRON_WILL: () => d.totalWorkouts >= 100,
                STRENGTH_MASTER: () => d.stats.STR >= 50,
                LIGHTNING_SPEED: () => d.stats.AGI >= 50,
                UNBREAKABLE: () => d.stats.END >= 50,
                IMMORTAL_BODY: () => d.stats.VIT >= 500,
                S_RANK_HUNTER: () => d.rank === 'S'
            };
            for (const id in conditions) {
                if (!d.achievements.includes(id) && conditions[id]()) {
                    d.achievements.push(id);
                    this.emit('achievement', { id: id, info: ACHIEVEMENTS[id] });
                }
            }
        }

        getAchievementInfo(id) { return ACHIEVEMENTS[id] || { name: id, desc: '', icon: 'fa-trophy' }; }
        static get ACHIEVEMENTS() { return ACHIEVEMENTS; }

        // ==================== IDENTITÉ / PROFIL ====================

        setIdentity(obj) {
            if (obj.name) this.data.name = obj.name;
            if (obj.title) this.data.title = obj.title;
            if (obj.avatar) this.data.avatar = obj.avatar;
            if (obj.avatarColor) this.data.avatarColor = obj.avatarColor;
            if (obj.rank && RANK_ORDER.includes(obj.rank)) this.data.rank = obj.rank;
            this.save();
        }

        setAvatar(icon, color) {
            if (icon) this.data.avatar = icon;
            if (color) this.data.avatarColor = color;
            this.save();
            this.emit('avatar', { icon: this.data.avatar, color: this.data.avatarColor });
        }

        setProfile(profile) {
            this.data.profile = Object.assign(this.data.profile, profile);
            this.save();
        }

        setSetting(key, value) {
            this.data.settings[key] = value;
            this.save();
        }

        // ==================== ÉVÉNEMENTS ====================

        on(event, cb) {
            (this.listeners[event] = this.listeners[event] || []).push(cb);
            return () => this.off(event, cb);
        }
        off(event, cb) {
            if (this.listeners[event]) this.listeners[event] = this.listeners[event].filter(f => f !== cb);
        }
        emit(event, payload) {
            (this.listeners[event] || []).forEach(cb => { try { cb(payload); } catch (e) { console.error(e); } });
        }

        // ==================== CLOUD (Supabase) ====================

        setCloudAdapter(adapter) {
            this.cloud = adapter;
        }

        scheduleCloudSync() {
            // Débounce : évite de spammer le réseau à chaque micro-changement
            if (!this.cloud || !this.data.userId) return;
            clearTimeout(this._cloudTimer);
            this._cloudTimer = setTimeout(() => this.syncToCloud(), 1500);
        }

        async syncToCloud() {
            if (!this.cloud || !this.data.userId) return false;
            try {
                await this.cloud.push(this.toCloudPayload());
                this.data.cloudSynced = true;
                return true;
            } catch (e) {
                console.warn('[Hunter] Sync cloud échouée:', e.message);
                return false;
            }
        }

        async pullFromCloud() {
            if (!this.cloud || !this.data.userId) return false;
            try {
                const remote = await this.cloud.pull(this.data.userId);
                if (remote) {
                    // Le cloud fait autorité s'il est plus avancé
                    if ((remote.total_xp || 0) >= this.data.totalXP) {
                        this.applyCloudPayload(remote);
                        this.save({ skipCloud: true });
                    }
                }
                return true;
            } catch (e) {
                console.warn('[Hunter] Pull cloud échoué:', e.message);
                return false;
            }
        }

        toCloudPayload() {
            const d = this.data;
            return {
                id: d.userId,
                name: d.name,
                title: d.title,
                avatar: d.avatar,
                avatar_color: d.avatarColor,
                level: d.level,
                xp: d.xp,
                total_xp: d.totalXP,
                rank: d.rank,
                str: d.stats.STR,
                agi: d.stats.AGI,
                end: d.stats.END,
                vit: d.stats.VIT,
                total_workouts: d.totalWorkouts,
                current_streak: d.currentStreak,
                longest_streak: d.longestStreak,
                combat_power: this.getCombatPower(),
                achievements: d.achievements,
                guild: d.guild,
                updated_at: new Date().toISOString()
            };
        }

        applyCloudPayload(r) {
            const d = this.data;
            d.name = r.name || d.name;
            d.title = r.title || d.title;
            d.avatar = r.avatar || d.avatar;
            d.avatarColor = r.avatar_color || d.avatarColor;
            d.level = r.level ?? d.level;
            d.xp = r.xp ?? d.xp;
            d.totalXP = r.total_xp ?? d.totalXP;
            d.rank = r.rank || d.rank;
            d.stats.STR = r.str ?? d.stats.STR;
            d.stats.AGI = r.agi ?? d.stats.AGI;
            d.stats.END = r.end ?? d.stats.END;
            d.stats.VIT = r.vit ?? d.stats.VIT;
            d.totalWorkouts = r.total_workouts ?? d.totalWorkouts;
            d.currentStreak = r.current_streak ?? d.currentStreak;
            d.longestStreak = r.longest_streak ?? d.longestStreak;
            d.achievements = r.achievements || d.achievements;
            d.guild = r.guild ?? d.guild;
            d.cloudSynced = true;
        }

        linkAccount(userId) {
            this.data.userId = userId;
            this.save({ skipCloud: true });
        }

        // ==================== RESET ====================

        reset() {
            this.data = defaultData();
            this.save({ skipCloud: true });
            this.emit('reset', null);
        }
    }

    // Singleton global
    const instance = new HunterStore();
    global.Hunter = instance;
    global.HunterStore = HunterStore;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { HunterStore, ACHIEVEMENTS, RANK_ORDER };
    }
})(typeof window !== 'undefined' ? window : this);
