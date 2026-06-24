/**
 * SHADOW GYM - Système d'Équipement & Butin (Loot)
 * ================================================
 * Catalogue d'objets, raretés et génération de butin.
 *
 * Ce module ne stocke RIEN : c'est `Hunter` (store.js) qui détient l'inventaire
 * et l'équipement porté. Ici on fournit :
 *  - le catalogue d'objets de base (BASES) et les raretés (RARITIES)
 *  - le tirage d'un butin pondéré par la "chance" (Equipment.generateDrop)
 *  - le calcul des bonus cumulés d'une liste d'objets (Equipment.bonusesFor)
 *  - des aides d'affichage bilingues (nom, couleur, label de rareté)
 *
 * À inclure APRÈS store.js et AVANT ui.js :
 *   <script src="js/store.js"></script>
 *   <script src="js/equipment.js"></script>
 *   <script src="js/ui.js"></script>
 */
(function (global) {
    'use strict';

    // ==================== RARETÉS ====================
    // weight : probabilité de base · mult : magnitude des stats · xp : bonus XP de base (%)
    const RARITIES = {
        common:    { key: 'common',    fr: 'Commun',     en: 'Common',     color: '#9aa6b2', weight: 60,  mult: 1.0, xp: 1,  glow: 0 },
        rare:      { key: 'rare',      fr: 'Rare',       en: 'Rare',       color: '#3a9bdc', weight: 26,  mult: 1.8, xp: 3,  glow: 10 },
        epic:      { key: 'epic',      fr: 'Épique',     en: 'Epic',       color: '#9c27b0', weight: 10,  mult: 3.0, xp: 6,  glow: 16 },
        legendary: { key: 'legendary', fr: 'Légendaire', en: 'Legendary',  color: '#ffd700', weight: 3.4, mult: 5.0, xp: 10, glow: 24 },
        mythic:    { key: 'mythic',    fr: 'Mythique',   en: 'Mythic',     color: '#ff4757', weight: 0.6, mult: 8.0, xp: 15, glow: 34 }
    };
    const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'];

    // ==================== EMPLACEMENTS ====================
    const SLOTS = {
        weapon: { key: 'weapon', fr: 'Arme',     en: 'Weapon',   icon: 'fa-khanda',        focus: 'STR' },
        armor:  { key: 'armor',  fr: 'Armure',   en: 'Armor',    icon: 'fa-shield-halved', focus: 'END' },
        boots:  { key: 'boots',  fr: 'Bottes',   en: 'Boots',    icon: 'fa-shoe-prints',   focus: 'AGI' },
        amulet: { key: 'amulet', fr: 'Amulette', en: 'Amulet',   icon: 'fa-gem',           focus: 'VIT' },
        ring:   { key: 'ring',   fr: 'Anneau',   en: 'Ring',     icon: 'fa-ring',          focus: 'XP'  }
    };
    const SLOT_ORDER = ['weapon', 'armor', 'boots', 'amulet', 'ring'];

    // ==================== CATALOGUE DE BASE ====================
    // focus : stat principale renforcée. xpItem : objet orienté gain d'XP.
    const BASES = [
        // --- Armes (STR) ---
        { id: 'w_blade',   slot: 'weapon', icon: 'fa-khanda',         fr: 'Lame du Hunter',         en: "Hunter's Blade",       focus: 'STR' },
        { id: 'w_dagger',  slot: 'weapon', icon: 'fa-icicles',        fr: "Dague de l'Assassin",    en: "Assassin's Dagger",    focus: 'AGI' },
        { id: 'w_fist',    slot: 'weapon', icon: 'fa-hand-fist',      fr: 'Gantelets de Bélier',    en: 'Battering Gauntlets',  focus: 'STR' },
        { id: 'w_axe',     slot: 'weapon', icon: 'fa-gavel',          fr: "Hache de l'Abîme",       en: 'Abyssal Axe',          focus: 'STR' },
        { id: 'w_scythe',  slot: 'weapon', icon: 'fa-skull',          fr: 'Faux du Monarque',       en: "Monarch's Scythe",     focus: 'STR' },
        { id: 'w_bow',     slot: 'weapon', icon: 'fa-bullseye',       fr: "Arc de l'Éclair",        en: 'Lightning Bow',        focus: 'AGI' },

        // --- Armures (END / VIT) ---
        { id: 'a_plate',   slot: 'armor',  icon: 'fa-shield-halved',  fr: 'Plastron de Fer',        en: 'Iron Plate',           focus: 'END' },
        { id: 'a_shadow',  slot: 'armor',  icon: 'fa-ghost',          fr: "Manteau d'Ombre",        en: 'Shadow Cloak',         focus: 'AGI' },
        { id: 'a_dragon',  slot: 'armor',  icon: 'fa-dragon',         fr: 'Écailles de Dragon',     en: 'Dragon Scales',        focus: 'VIT' },
        { id: 'a_guard',   slot: 'armor',  icon: 'fa-shield',         fr: 'Cuirasse du Gardien',    en: "Guardian's Cuirass",   focus: 'END' },
        { id: 'a_titan',   slot: 'armor',  icon: 'fa-mountain',       fr: 'Carapace du Titan',      en: 'Titan Carapace',       focus: 'VIT' },

        // --- Bottes (AGI) ---
        { id: 'b_swift',   slot: 'boots',  icon: 'fa-shoe-prints',    fr: "Bottes de l'Éclair",     en: 'Swift Boots',          focus: 'AGI' },
        { id: 'b_wind',    slot: 'boots',  icon: 'fa-wind',           fr: 'Sandales du Vent',       en: 'Wind Sandals',         focus: 'AGI' },
        { id: 'b_tread',   slot: 'boots',  icon: 'fa-boot-strap',     fr: 'Grèves du Marcheur',     en: "Walker's Greaves",     focus: 'END' },
        { id: 'b_phantom', slot: 'boots',  icon: 'fa-feather',        fr: 'Foulées Fantômes',       en: 'Phantom Striders',     focus: 'AGI' },

        // --- Amulettes (VIT / mixte) ---
        { id: 'm_heart',   slot: 'amulet', icon: 'fa-heart-pulse',    fr: 'Cœur de Vitalité',       en: 'Vitality Heart',       focus: 'VIT' },
        { id: 'm_rune',    slot: 'amulet', icon: 'fa-gem',            fr: 'Rune de Puissance',      en: 'Rune of Power',        focus: 'STR' },
        { id: 'm_eye',     slot: 'amulet', icon: 'fa-eye',            fr: "Œil du Système",         en: 'Eye of the System',    focus: 'XP'  },
        { id: 'm_soul',    slot: 'amulet', icon: 'fa-fire',           fr: "Âme de l'Ombre",         en: 'Shadow Soul',          focus: 'VIT' },

        // --- Anneaux (XP / mixte) ---
        { id: 'r_xp',      slot: 'ring',   icon: 'fa-ring',           fr: "Anneau de l'Éveil",      en: 'Ring of Awakening',    focus: 'XP'  },
        { id: 'r_focus',   slot: 'ring',   icon: 'fa-circle-notch',   fr: 'Sceau du Focus',         en: 'Seal of Focus',        focus: 'XP'  },
        { id: 'r_beast',   slot: 'ring',   icon: 'fa-paw',            fr: 'Bague de la Bête',       en: 'Beast Band',           focus: 'STR' },
        { id: 'r_monarch', slot: 'ring',   icon: 'fa-crown',          fr: 'Couronne du Monarque',   en: "Monarch's Signet",     focus: 'XP'  }
    ];

    const STAT_KEYS = ['STR', 'AGI', 'END', 'VIT'];

    // ==================== OUTILS ====================
    function lang() { return (global.I18n && global.I18n.lang) || 'fr'; }
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    // Tire une rareté pondérée. `luck` ∈ [0,1] décale les chances vers le haut.
    function rollRarity(luck) {
        luck = Math.max(0, Math.min(1, luck || 0));
        // Plus la chance est élevée, plus on dope les raretés supérieures.
        const weights = RARITY_ORDER.map((k, i) => {
            const r = RARITIES[k];
            const boost = 1 + luck * i * 1.6;        // common quasi inchangé, mythic fortement boosté
            return r.weight * boost;
        });
        const total = weights.reduce((a, b) => a + b, 0);
        let t = Math.random() * total;
        for (let i = 0; i < RARITY_ORDER.length; i++) {
            t -= weights[i];
            if (t <= 0) return RARITY_ORDER[i];
        }
        return 'common';
    }

    const Equipment = {
        RARITIES: RARITIES,
        RARITY_ORDER: RARITY_ORDER,
        SLOTS: SLOTS,
        SLOT_ORDER: SLOT_ORDER,
        BASES: BASES,

        rarityInfo: function (key) { return RARITIES[key] || RARITIES.common; },
        slotInfo: function (key) { return SLOTS[key] || { fr: key, en: key, icon: 'fa-question' }; },
        baseInfo: function (id) { return BASES.find(b => b.id === id) || null; },

        rarityName: function (key) { const r = this.rarityInfo(key); return r[lang()] || r.fr; },
        slotName: function (key) { const s = this.slotInfo(key); return s[lang()] || s.fr; },
        itemName: function (item) {
            if (!item) return '';
            const b = this.baseInfo(item.baseId);
            return b ? (b[lang()] || b.fr) : (item.name || '');
        },
        rarityColor: function (key) { return this.rarityInfo(key).color; },

        // Compteur d'index de rareté (pour comparer / trier)
        rarityRank: function (key) { return RARITY_ORDER.indexOf(key); },

        /**
         * Génère un objet de butin.
         * @param {Object} opts { level, slot, rarity, luck }
         */
        roll: function (opts) {
            opts = opts || {};
            const ilvl = Math.max(1, opts.level || (global.Hunter ? global.Hunter.get('level') : 1));
            const rarityKey = opts.rarity || rollRarity(opts.luck);
            const rarity = RARITIES[rarityKey];
            const candidates = opts.slot ? BASES.filter(b => b.slot === opts.slot) : BASES;
            const base = pick(candidates);

            // Budget de stats : croît avec le niveau de l'objet et la rareté.
            const budget = Math.max(1, Math.round((2 + ilvl * 0.45) * rarity.mult));
            const stats = { STR: 0, AGI: 0, END: 0, VIT: 0 };
            let xpBonus = 0;

            if (base.focus === 'XP') {
                // Objet orienté XP : gros bonus d'XP + un peu de stat secondaire.
                xpBonus = rarity.xp + Math.round(ilvl * 0.25 * rarity.mult);
                const sec = pick(STAT_KEYS);
                stats[sec] += Math.max(1, Math.round(budget * 0.4));
            } else {
                // 70% du budget sur la stat principale, le reste sur une secondaire.
                const main = base.focus;
                const primary = Math.max(1, Math.round(budget * 0.7));
                stats[main] += (main === 'VIT') ? primary * 4 : primary; // VIT a une échelle ~×4
                let secKey = pick(STAT_KEYS.filter(s => s !== main));
                const secVal = Math.max(0, budget - primary);
                if (secVal > 0) stats[secKey] += (secKey === 'VIT') ? secVal * 4 : secVal;
                // Petit bonus d'XP résiduel selon la rareté.
                xpBonus = Math.max(0, rarity.xp - 1);
            }

            // Bonus de puissance "prestige" (effet de set), indépendant des stats.
            const power = Math.round(rarity.glow * 6 + ilvl * rarity.mult * 2);

            return {
                id: 'it_' + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36),
                baseId: base.id,
                slot: base.slot,
                icon: base.icon,
                name: base.fr,            // nom de secours ; l'affichage utilise itemName() (bilingue)
                rarity: rarityKey,
                ilvl: ilvl,
                stats: stats,
                xpBonus: xpBonus,
                power: power
            };
        },

        /**
         * Tirage de butin contextuel (montée de niveau, quête...).
         * Renvoie un objet, ou null si pas de drop (selon la chance).
         * @param {Object} opts { source, level, luck, guaranteed, minRarity }
         */
        generateDrop: function (opts) {
            opts = opts || {};
            const item = this.roll({ level: opts.level, luck: opts.luck, slot: opts.slot, rarity: opts.rarity });
            // Plancher de rareté (ex. paliers de niveau garantissent ≥ épique)
            if (opts.minRarity && this.rarityRank(item.rarity) < this.rarityRank(opts.minRarity)) {
                item.rarity = opts.minRarity;
                return this.roll({ level: opts.level, slot: item.slot, rarity: opts.minRarity });
            }
            return item;
        },

        /**
         * Cumule les bonus d'une liste d'objets équipés.
         * @returns {Object} { STR, AGI, END, VIT, xpPct, power, count }
         */
        bonusesFor: function (items) {
            const out = { STR: 0, AGI: 0, END: 0, VIT: 0, xpPct: 0, power: 0, count: 0 };
            (items || []).forEach(it => {
                if (!it) return;
                out.count++;
                if (it.stats) STAT_KEYS.forEach(s => { out[s] += it.stats[s] || 0; });
                out.xpPct += it.xpBonus || 0;
                out.power += it.power || 0;
            });
            // Bonus de panoplie : 5 pièces équipées → +10% XP supplémentaire.
            if (out.count >= 5) out.xpPct += 10;
            // Plafond raisonnable pour éviter une progression incontrôlable (max ×2 XP).
            out.xpPct = Math.min(100, out.xpPct);
            return out;
        },

        // Valeur de revente (or) selon rareté et niveau d'objet.
        sellValue: function (item) {
            if (!item) return 0;
            const r = this.rarityInfo(item.rarity);
            return Math.round((10 + (item.ilvl || 1) * 2) * r.mult);
        },

        // Prix de forge d'un coffre par palier de rareté.
        forgeCost: function (rarityKey) {
            const r = this.rarityInfo(rarityKey);
            return Math.round(60 * r.mult);
        }
    };

    global.Equipment = Equipment;
    if (typeof module !== 'undefined' && module.exports) module.exports = { Equipment, RARITIES, SLOTS, BASES };
})(typeof window !== 'undefined' ? window : this);
