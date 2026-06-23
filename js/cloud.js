/**
 * SHADOW GYM - Adaptateur Cloud (Supabase)
 * =========================================
 * Pont entre le moteur local `Hunter` (store.js) et Supabase.
 * Gère : authentification, synchronisation du profil, classements, challenges.
 *
 * Dégradation gracieuse : si config.js n'est pas renseigné, `Cloud.enabled`
 * vaut false et l'app reste 100% jouable en local.
 *
 * À inclure APRÈS config.js et store.js :
 *   <script src="js/config.js"></script>
 *   <script src="js/store.js"></script>
 *   <script src="js/cloud.js"></script>
 */

(function (global) {
    'use strict';

    const Cloud = {
        enabled: false,
        ready: false,
        client: null,
        user: null,
        _listeners: {},
        _initPromise: null
    };

    // ==================== ÉVÉNEMENTS ====================
    Cloud.on = function (evt, cb) { (this._listeners[evt] = this._listeners[evt] || []).push(cb); };
    Cloud._emit = function (evt, data) { (this._listeners[evt] || []).forEach(cb => { try { cb(data); } catch (e) { console.error(e); } }); };

    // ==================== INITIALISATION ====================
    Cloud.init = function () {
        if (this._initPromise) return this._initPromise;
        this._initPromise = (async () => {
            if (!global.isCloudConfigured || !global.isCloudConfigured()) {
                console.info('[Cloud] Supabase non configuré → mode local. Renseigne js/config.js pour activer le multijoueur.');
                this.enabled = false;
                this.ready = true;
                this._emit('ready', { enabled: false });
                return;
            }
            try {
                const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
                const cfg = global.SHADOW_GYM_CONFIG;
                this.client = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
                    auth: { persistSession: true, autoRefreshToken: true }
                });
                this.enabled = true;

                // Branche l'adaptateur de synchro sur le moteur local
                if (global.Hunter) global.Hunter.setCloudAdapter(this._hunterAdapter());

                // Restaure la session existante
                const { data } = await this.client.auth.getSession();
                if (data && data.session) {
                    this.user = data.session.user;
                    await this._onAuthenticated();
                }

                // Écoute les changements d'auth
                this.client.auth.onAuthStateChange((event, session) => {
                    this.user = session ? session.user : null;
                    this._emit('auth', { event, user: this.user });
                });

                this.ready = true;
                this._emit('ready', { enabled: true });
            } catch (e) {
                console.error('[Cloud] Échec d\'initialisation Supabase:', e);
                this.enabled = false;
                this.ready = true;
                this._emit('ready', { enabled: false, error: e });
            }
        })();
        return this._initPromise;
    };

    // ==================== AUTHENTIFICATION ====================
    Cloud.signUp = async function (email, password, name) {
        await this.init();
        if (!this.enabled) throw new Error('Cloud non configuré');
        const { data, error } = await this.client.auth.signUp({
            email, password, options: { data: { name: name || (global.Hunter && global.Hunter.get('name')) || 'Shadow Hunter' } }
        });
        if (error) throw error;
        if (data.user) { this.user = data.user; await this._onAuthenticated(name); }
        return data;
    };

    Cloud.signIn = async function (email, password) {
        await this.init();
        if (!this.enabled) throw new Error('Cloud non configuré');
        const { data, error } = await this.client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.user = data.user;
        await this._onAuthenticated();
        return data;
    };

    Cloud.signOut = async function () {
        if (!this.enabled || !this.client) return;
        await this.client.auth.signOut();
        this.user = null;
        this._emit('auth', { event: 'SIGNED_OUT', user: null });
    };

    Cloud.isLoggedIn = function () { return !!this.user; };

    // Lie le compte au moteur local, pousse/tire le profil
    Cloud._onAuthenticated = async function (overrideName) {
        if (!this.user || !global.Hunter) return;
        global.Hunter.linkAccount(this.user.id);
        if (overrideName) global.Hunter.setIdentity({ name: overrideName });
        // Le cloud fait autorité s'il est plus avancé, sinon on pousse l'état local
        await global.Hunter.pullFromCloud();
        await global.Hunter.syncToCloud();
        this._emit('synced', { user: this.user });
    };

    // ==================== ADAPTATEUR POUR LE MOTEUR ====================
    Cloud._hunterAdapter = function () {
        const self = this;
        return {
            // Hunter appelle push(payload) pour sauvegarder dans le cloud
            push: async function (p) {
                if (!self.enabled || !self.user) return;
                const row = {
                    id: p.id, name: p.name, title: p.title, avatar: p.avatar, avatar_color: p.avatar_color,
                    level: p.level, xp: p.xp, total_xp: p.total_xp, rank: p.rank,
                    str: p.str, agi: p.agi, endurance: p.end, vit: p.vit,
                    total_workouts: p.total_workouts, current_streak: p.current_streak,
                    longest_streak: p.longest_streak, combat_power: p.combat_power,
                    achievements: p.achievements, guild: p.guild, updated_at: p.updated_at
                };
                const { error } = await self.client.from('profiles').upsert(row, { onConflict: 'id' });
                if (error) throw error;
                // Met à jour la progression des challenges actifs en même temps
                try { await self.updateChallengeProgress(); } catch (e) { /* non bloquant */ }
            },
            // Hunter appelle pull(userId) pour récupérer l'état distant
            pull: async function (userId) {
                if (!self.enabled) return null;
                const { data, error } = await self.client.from('profiles').select('*').eq('id', userId).single();
                if (error) { if (error.code === 'PGRST116') return null; throw error; }
                if (!data) return null;
                // Remappe endurance → end pour le moteur
                return Object.assign({}, data, { end: data.endurance });
            }
        };
    };

    // ==================== CLASSEMENT ====================
    Cloud.getLeaderboard = async function (opts) {
        opts = opts || {};
        await this.init();
        if (!this.enabled) return { demo: true, rows: demoLeaderboard(opts) };
        let q = this.client.from('profiles')
            .select('id, name, title, avatar, avatar_color, level, rank, total_xp, combat_power, longest_streak, total_workouts, guild')
            .order('combat_power', { ascending: false })
            .limit(opts.limit || 100);
        if (opts.rank) q = q.eq('rank', opts.rank);
        const { data, error } = await q;
        if (error) throw error;
        return { demo: false, rows: data || [] };
    };

    Cloud.getMyRank = async function () {
        if (!this.enabled || !this.user) return null;
        const me = await this.client.from('profiles').select('combat_power').eq('id', this.user.id).single();
        if (!me.data) return null;
        const { count } = await this.client.from('profiles')
            .select('id', { count: 'exact', head: true })
            .gt('combat_power', me.data.combat_power);
        return (count || 0) + 1;
    };

    Cloud.subscribeLeaderboard = function (cb) {
        if (!this.enabled || !this.client) return function () {};
        const ch = this.client.channel('lb-profiles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, cb)
            .subscribe();
        return () => this.client.removeChannel(ch);
    };

    // ==================== CHALLENGES ====================
    Cloud.searchHunters = async function (query) {
        if (!this.enabled) return demoHunters(query);
        const { data } = await this.client.from('profiles')
            .select('id, name, avatar, level, rank, combat_power')
            .ilike('name', '%' + query + '%')
            .limit(10);
        return (data || []).filter(h => !this.user || h.id !== this.user.id);
    };

    Cloud.createChallenge = async function (opponentId, type, goal, message) {
        if (!this.enabled || !this.user) throw new Error('Connecte-toi pour défier un Hunter');
        const start = challengeMetric(type);
        const { data, error } = await this.client.from('challenges').insert({
            challenger: this.user.id, opponent: opponentId,
            type: type || 'xp', goal: goal || 500, message: message || null,
            challenger_start: start, status: 'pending'
        }).select().single();
        if (error) throw error;
        return data;
    };

    Cloud.getChallenges = async function () {
        if (!this.enabled || !this.user) return { demo: !this.enabled, rows: this.enabled ? [] : demoChallenges() };
        const { data, error } = await this.client.from('challenges')
            .select('*')
            .or(`challenger.eq.${this.user.id},opponent.eq.${this.user.id}`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return { demo: false, rows: data || [] };
    };

    Cloud.respondChallenge = async function (id, accept) {
        if (!this.enabled || !this.user) throw new Error('Non connecté');
        const start = await this.client.from('challenges').select('type').eq('id', id).single();
        const metric = start.data ? challengeMetric(start.data.type) : 0;
        const { error } = await this.client.from('challenges').update({
            status: accept ? 'active' : 'declined',
            opponent_start: metric
        }).eq('id', id);
        if (error) throw error;
    };

    // Met à jour ma progression dans tous mes challenges actifs
    Cloud.updateChallengeProgress = async function () {
        if (!this.enabled || !this.user) return;
        const { data } = await this.client.from('challenges').select('*').eq('status', 'active')
            .or(`challenger.eq.${this.user.id},opponent.eq.${this.user.id}`);
        if (!data) return;
        for (const c of data) {
            const isChallenger = c.challenger === this.user.id;
            const start = isChallenger ? c.challenger_start : c.opponent_start;
            const progress = Math.max(0, challengeMetric(c.type) - start);
            const patch = isChallenger ? { challenger_progress: progress } : { opponent_progress: progress };
            // Détection du gagnant
            const otherProgress = isChallenger ? c.opponent_progress : c.challenger_progress;
            if (progress >= c.goal && otherProgress < c.goal) {
                patch.status = 'completed';
                patch.winner = this.user.id;
            }
            await this.client.from('challenges').update(patch).eq('id', c.id);
        }
    };

    // ==================== GUILDES ====================
    Cloud.browseGuilds = async function () {
        await this.init();
        if (!this.enabled) return { demo: true, rows: demoGuilds() };
        const { data, error } = await this.client.from('guild_rankings').select('*').order('total_power', { ascending: false }).limit(50);
        if (error) throw error;
        return { demo: false, rows: data || [] };
    };

    Cloud.getMyGuild = async function () {
        if (!this.enabled || !this.user) return null;
        const mem = await this.client.from('guild_members').select('guild_id, role').eq('user_id', this.user.id).maybeSingle();
        if (!mem.data) return null;
        const g = await this.client.from('guild_rankings').select('*').eq('id', mem.data.guild_id).single();
        const members = await this.client.from('guild_members')
            .select('user_id, role, profiles(name, avatar, avatar_color, level, rank, combat_power)')
            .eq('guild_id', mem.data.guild_id);
        const list = (members.data || []).map(m => Object.assign({ role: m.role }, m.profiles || {}));
        list.sort((a, b) => (b.combat_power || 0) - (a.combat_power || 0));
        return { guild: g.data, role: mem.data.role, members: list };
    };

    Cloud.createGuild = async function (name, tag, emblem, color, desc) {
        if (!this.enabled || !this.user) throw new Error('Connecte-toi pour fonder une guilde');
        const ins = await this.client.from('guilds').insert({
            name: name, tag: tag || null, emblem: emblem || 'fa-shield-halved',
            color: color || '#85acb9', description: desc || null, owner: this.user.id
        }).select().single();
        if (ins.error) throw ins.error;
        await this.joinGuild(ins.data.id, name, 'owner');
        return ins.data;
    };

    Cloud.joinGuild = async function (guildId, guildName, role) {
        if (!this.enabled || !this.user) throw new Error('Connecte-toi pour rejoindre une guilde');
        const { error } = await this.client.from('guild_members')
            .insert({ guild_id: guildId, user_id: this.user.id, role: role || 'member' });
        if (error) throw error;
        if (global.Hunter) { global.Hunter.getData().guild = guildName || null; global.Hunter.save(); }
        await this.client.from('profiles').update({ guild: guildName || null }).eq('id', this.user.id);
    };

    Cloud.leaveGuild = async function () {
        if (!this.enabled || !this.user) return;
        await this.client.from('guild_members').delete().eq('user_id', this.user.id);
        if (global.Hunter) { global.Hunter.getData().guild = null; global.Hunter.save(); }
        await this.client.from('profiles').update({ guild: null }).eq('id', this.user.id);
    };

    // ==================== DONNÉES DÉMO (mode hors-ligne) ====================
    function challengeMetric(type) {
        const H = global.Hunter; if (!H) return 0;
        if (type === 'workouts') return H.get('totalWorkouts');
        if (type === 'streak') return H.get('longestStreak');
        return H.get('totalXP');
    }

    function demoLeaderboard(opts) {
        const names = [
            ['Sung Jinwoo', 'S', 99, 48500], ['Cha Hae-In', 'S', 92, 44100], ['Go Gunhee', 'A', 85, 38200],
            ['Baek Yoonho', 'A', 80, 35000], ['Choi Jong-In', 'A', 78, 33800], ['Min Byung-Gu', 'B', 66, 24500],
            ['Woo Jinchul', 'B', 61, 22100], ['Yoo Jongho', 'B', 58, 20400], ['Han Song-Yi', 'C', 44, 12800],
            ['Lee Joohee', 'C', 39, 10500], ['Kim Sangshik', 'D', 28, 6400], ['Park Heejin', 'D', 22, 4200],
            ['Hunter Anonyme', 'E', 12, 1500], ['Novice des Ombres', 'E', 7, 700]
        ];
        const demoIcons = ['fa-user-ninja', 'fa-ghost', 'fa-dragon', 'fa-skull', 'fa-mask', 'fa-hat-wizard', 'fa-crow', 'fa-cat'];
        let rows = names.map((n, i) => ({
            id: 'demo-' + i, name: n[0], rank: n[1], level: n[2], total_xp: n[3],
            combat_power: n[3] + n[2] * 100 + (['E', 'D', 'C', 'B', 'A', 'S'].indexOf(n[1]) * 500),
            longest_streak: Math.floor(n[2] / 2), total_workouts: n[2] * 3,
            avatar: demoIcons[i % demoIcons.length], avatar_color: ['#85acb9','#9c27b0','#ffd700','#4caf50'][i % 4], title: ''
        }));
        // Insère le joueur local s'il existe
        if (global.Hunter) {
            const H = global.Hunter;
            rows.push({
                id: 'me', name: H.get('name') + ' (toi)', rank: H.get('rank'), level: H.get('level'),
                total_xp: H.get('totalXP'), combat_power: H.getCombatPower(),
                longest_streak: H.get('longestStreak'), total_workouts: H.get('totalWorkouts'),
                avatar: H.get('avatar'), avatar_color: H.get('avatarColor'), title: '', isMe: true
            });
        }
        if (opts.rank) rows = rows.filter(r => r.rank === opts.rank);
        rows.sort((a, b) => b.combat_power - a.combat_power);
        return rows;
    }

    function demoHunters(query) {
        return demoLeaderboard({}).filter(h => !h.isMe && h.name.toLowerCase().includes((query || '').toLowerCase())).slice(0, 6);
    }

    function demoChallenges() { return []; }

    function demoGuilds() {
        return [
            { id: 'dg1', name: 'Chasseurs d\'Ombres', tag: 'SHDW', emblem: 'fa-ghost', color: '#9c27b0', member_count: 42, total_power: 512000, description: 'L\'élite des ténèbres.' },
            { id: 'dg2', name: 'Garde de Fer', tag: 'IRON', emblem: 'fa-shield-halved', color: '#85acb9', member_count: 38, total_power: 468000, description: 'Inébranlables face à l\'adversité.' },
            { id: 'dg3', name: 'Croc de Dragon', tag: 'DRGN', emblem: 'fa-dragon', color: '#ff9800', member_count: 31, total_power: 401000, description: 'Puissance brute et discipline.' },
            { id: 'dg4', name: 'Lames Silencieuses', tag: 'BLAD', emblem: 'fa-khanda', color: '#4caf50', member_count: 25, total_power: 318000, description: 'Vitesse et précision.' },
            { id: 'dg5', name: 'Aube Écarlate', tag: 'DAWN', emblem: 'fa-fire', color: '#ff4757', member_count: 19, total_power: 240000, description: 'Brûle tes limites chaque jour.' }
        ];
    }

    global.Cloud = Cloud;
})(typeof window !== 'undefined' ? window : this);
