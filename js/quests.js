/**
 * SHADOW GYM - Bibliothèque d'exercices & générateur de protocole
 * ===============================================================
 * Base de VRAIS exercices, bilingue (FR/EN), avec consignes d'exécution,
 * muscles ciblés, équipement et difficulté. Aucune IA, aucune clé API.
 *
 * Le générateur assemble un protocole personnalisé (objectif/niveau/rang),
 * qui varie chaque jour. Le vrai nom d'exercice est mis en vedette ; le nom
 * "Solo Leveling" reste un accent thématique.
 */

(function (global) {
    'use strict';

    // ==================== BASE D'EXERCICES RÉELS ====================
    // type: strength | cardio | core | mobility   ·   diff: 1=débutant 2=interm. 3=avancé
    // unit: reps | time(s)   ·   equip: none | dumbbells | bar | mat
    const EX = [
        // ---- POITRINE / TRICEPS / ÉPAULES ----
        { id:'pushup', fr:'Pompes', en:'Push-ups', sl:'Frappe de l\'Ombre', slEn:'Shadow Strike', type:'strength', diff:1, stat:'STR', unit:'reps', base:10, equip:'none',
          mFr:'Pectoraux, triceps, épaules', mEn:'Chest, triceps, shoulders', goals:['gain','maintain','lose'],
          hFr:'Corps gainé en ligne droite, mains largeur d\'épaules, descends la poitrine près du sol, pousse.',
          hEn:'Body in a straight line, hands shoulder-width, lower chest near the floor, push back up.' },
        { id:'diamond', fr:'Pompes diamant', en:'Diamond push-ups', sl:'Lame Convergente', slEn:'Converging Blade', type:'strength', diff:2, stat:'STR', unit:'reps', base:8, equip:'none',
          mFr:'Triceps, pectoraux', mEn:'Triceps, chest', goals:['gain','maintain'],
          hFr:'Mains jointes en losange sous la poitrine, coudes près du corps.',
          hEn:'Hands together in a diamond under the chest, elbows tucked in.' },
        { id:'declpush', fr:'Pompes déclinées', en:'Decline push-ups', sl:'Assaut Aérien', slEn:'Aerial Assault', type:'strength', diff:3, stat:'STR', unit:'reps', base:12, equip:'none',
          mFr:'Haut des pectoraux, épaules', mEn:'Upper chest, shoulders', goals:['gain'],
          hFr:'Pieds surélevés sur une chaise, garde le dos plat.',
          hEn:'Feet elevated on a chair, keep your back flat.' },
        { id:'dips', fr:'Dips sur chaise', en:'Chair dips', sl:'Chute Contrôlée', slEn:'Controlled Descent', type:'strength', diff:1, stat:'STR', unit:'reps', base:10, equip:'none',
          mFr:'Triceps, épaules', mEn:'Triceps, shoulders', goals:['gain','maintain'],
          hFr:'Mains sur le bord d\'une chaise, descends les coudes à 90°, remonte.',
          hEn:'Hands on a chair edge, bend elbows to 90°, press back up.' },
        { id:'pike', fr:'Pompes piquées', en:'Pike push-ups', sl:'Pic de l\'Aiguille', slEn:'Needle Spire', type:'strength', diff:2, stat:'STR', unit:'reps', base:8, equip:'none',
          mFr:'Épaules, triceps', mEn:'Shoulders, triceps', goals:['gain'],
          hFr:'Bassin haut en V inversé, descends le sommet du crâne vers le sol.',
          hEn:'Hips high in an inverted V, lower the top of your head toward the floor.' },

        // ---- DOS / BICEPS ----
        { id:'pullup', fr:'Tractions', en:'Pull-ups', sl:'Ascension du Monarque', slEn:'Monarch\'s Ascension', type:'strength', diff:3, stat:'STR', unit:'reps', base:5, equip:'bar',
          mFr:'Dos, biceps, avant-bras', mEn:'Back, biceps, forearms', goals:['gain','maintain'],
          hFr:'Prise largeur d\'épaules, tire le menton au-dessus de la barre, contrôle la descente.',
          hEn:'Shoulder-width grip, pull chin above the bar, lower under control.' },
        { id:'row', fr:'Rowing haltère', en:'Dumbbell row', sl:'Tir de l\'Archer', slEn:'Archer\'s Draw', type:'strength', diff:2, stat:'STR', unit:'reps', base:12, equip:'dumbbells',
          mFr:'Dos, biceps', mEn:'Back, biceps', goals:['gain','maintain'],
          hFr:'Dos plat penché en avant, tire l\'haltère vers la hanche, serre l\'omoplate.',
          hEn:'Flat back bent forward, pull the dumbbell to your hip, squeeze the shoulder blade.' },
        { id:'suprow', fr:'Rowing inversé', en:'Inverted row', sl:'Rappel des Ombres', slEn:'Shadow Recall', type:'strength', diff:2, stat:'STR', unit:'reps', base:10, equip:'bar',
          mFr:'Dos, biceps', mEn:'Back, biceps', goals:['gain','maintain'],
          hFr:'Sous une barre basse, corps gainé, tire la poitrine vers la barre.',
          hEn:'Under a low bar, body rigid, pull your chest to the bar.' },

        // ---- JAMBES / FESSIERS ----
        { id:'squat', fr:'Squats', en:'Squats', sl:'Garde du Souverain', slEn:'Sovereign\'s Guard', type:'strength', diff:1, stat:'END', unit:'reps', base:15, equip:'none',
          mFr:'Quadriceps, fessiers', mEn:'Quads, glutes', goals:['gain','maintain','lose'],
          hFr:'Pieds largeur d\'épaules, descends les hanches en arrière, dos droit, cuisses parallèles au sol.',
          hEn:'Feet shoulder-width, push hips back, straight back, thighs parallel to the floor.' },
        { id:'jumpsquat', fr:'Squats sautés', en:'Jump squats', sl:'Bond du Chasseur', slEn:'Hunter\'s Leap', type:'strength', diff:2, stat:'AGI', unit:'reps', base:12, equip:'none',
          mFr:'Jambes, explosivité', mEn:'Legs, power', goals:['lose','gain'],
          hFr:'Squat puis saut explosif, réception souple genoux fléchis.',
          hEn:'Squat then jump explosively, land soft with bent knees.' },
        { id:'lunge', fr:'Fentes', en:'Lunges', sl:'Pas de l\'Assassin', slEn:'Assassin\'s Step', type:'strength', diff:1, stat:'END', unit:'reps', base:12, equip:'none',
          mFr:'Quadriceps, fessiers', mEn:'Quads, glutes', goals:['gain','maintain','lose'],
          hFr:'Grand pas en avant, genou arrière vers le sol, buste droit, alterne les jambes.',
          hEn:'Big step forward, back knee toward the floor, torso upright, alternate legs.' },
        { id:'bulgarian', fr:'Fentes bulgares', en:'Bulgarian split squats', sl:'Équilibre de la Faille', slEn:'Rift Balance', type:'strength', diff:3, stat:'END', unit:'reps', base:10, equip:'none',
          mFr:'Quadriceps, fessiers', mEn:'Quads, glutes', goals:['gain'],
          hFr:'Pied arrière surélevé sur une chaise, descends droit, genou avant aligné.',
          hEn:'Rear foot elevated on a chair, descend straight down, front knee aligned.' },
        { id:'hipthrust', fr:'Hip thrust au sol', en:'Glute bridge', sl:'Élévation Tellurique', slEn:'Telluric Rise', type:'strength', diff:1, stat:'STR', unit:'reps', base:15, equip:'none',
          mFr:'Fessiers, ischios', mEn:'Glutes, hamstrings', goals:['gain','maintain'],
          hFr:'Dos au sol, pieds à plat, monte le bassin en serrant les fessiers, pause en haut.',
          hEn:'Back on the floor, feet flat, lift hips squeezing glutes, pause at the top.' },
        { id:'calf', fr:'Mollets debout', en:'Standing calf raises', sl:'Pointe Silencieuse', slEn:'Silent Step', type:'strength', diff:1, stat:'AGI', unit:'reps', base:20, equip:'none',
          mFr:'Mollets', mEn:'Calves', goals:['gain','maintain'],
          hFr:'Monte sur la pointe des pieds, pause une seconde en haut, descends lentement.',
          hEn:'Rise onto your toes, pause one second at the top, lower slowly.' },
        { id:'wallsit', fr:'Chaise murale', en:'Wall sit', sl:'Mur Inébranlable', slEn:'Unbreakable Wall', type:'strength', diff:2, stat:'END', unit:'time', base:45, equip:'none',
          mFr:'Quadriceps', mEn:'Quads', goals:['maintain','lose'],
          hFr:'Dos contre le mur, cuisses à 90°, tiens la position immobile.',
          hEn:'Back against the wall, thighs at 90°, hold the position still.' },

        // ---- CARDIO ----
        { id:'run', fr:'Course / Jogging', en:'Running / Jogging', sl:'Sprint du Loup d\'Ombre', slEn:'Shadow Wolf Sprint', type:'cardio', diff:1, stat:'END', unit:'time', base:20, equip:'none',
          mFr:'Cardio, jambes', mEn:'Cardio, legs', goals:['lose','maintain'],
          hFr:'Rythme régulier où tu peux encore parler, foulée souple.',
          hEn:'Steady pace where you can still talk, relaxed stride.' },
        { id:'rope', fr:'Corde à sauter', en:'Jump rope', sl:'Fil de la Tempête', slEn:'Storm Thread', type:'cardio', diff:1, stat:'AGI', unit:'time', base:10, equip:'none',
          mFr:'Cardio, mollets', mEn:'Cardio, calves', goals:['lose','maintain'],
          hFr:'Petits sauts, poignets qui tournent, reste sur la pointe des pieds.',
          hEn:'Small hops, wrists turning the rope, stay on the balls of your feet.' },
        { id:'burpee', fr:'Burpees', en:'Burpees', sl:'Réveil du Dragon', slEn:'Dragon\'s Awakening', type:'cardio', diff:3, stat:'END', unit:'reps', base:10, equip:'none',
          mFr:'Corps entier', mEn:'Full body', goals:['lose','gain'],
          hFr:'Squat, planche, pompe, ramène les pieds, saut vertical. Enchaîne.',
          hEn:'Squat, plank, push-up, jump feet in, vertical jump. Flow through it.' },
        { id:'climber', fr:'Mountain climbers', en:'Mountain climbers', sl:'Escalade du Donjon', slEn:'Dungeon Climb', type:'cardio', diff:2, stat:'AGI', unit:'time', base:30, equip:'none',
          mFr:'Cardio, abdos', mEn:'Cardio, core', goals:['lose','maintain'],
          hFr:'Position planche, ramène les genoux vers la poitrine en alternance, rapide.',
          hEn:'Plank position, drive knees to chest alternately, fast.' },
        { id:'jack', fr:'Jumping jacks', en:'Jumping jacks', sl:'Éclat Stellaire', slEn:'Stellar Burst', type:'cardio', diff:1, stat:'AGI', unit:'time', base:40, equip:'none',
          mFr:'Cardio, corps entier', mEn:'Cardio, full body', goals:['lose','maintain'],
          hFr:'Saute en écartant bras et jambes, reviens, garde le rythme.',
          hEn:'Jump spreading arms and legs, return, keep the rhythm.' },
        { id:'highknees', fr:'Montées de genoux', en:'High knees', sl:'Galop Fantôme', slEn:'Phantom Gallop', type:'cardio', diff:1, stat:'AGI', unit:'time', base:30, equip:'none',
          mFr:'Cardio, fléchisseurs', mEn:'Cardio, hip flexors', goals:['lose'],
          hFr:'Cours sur place, monte les genoux au niveau des hanches, gainage actif.',
          hEn:'Run in place, drive knees up to hip height, brace your core.' },
        { id:'hiit', fr:'Sprint fractionné (HIIT)', en:'HIIT sprints', sl:'Décharge du Monarque', slEn:'Monarch\'s Surge', type:'cardio', diff:3, stat:'AGI', unit:'time', base:15, equip:'none',
          mFr:'Cardio intense', mEn:'High-intensity cardio', goals:['lose'],
          hFr:'20s à fond / 40s récupération. Donne tout sur l\'effort.',
          hEn:'20s all-out / 40s recovery. Give everything on the work interval.' },
        { id:'walk', fr:'Marche active', en:'Brisk walk', sl:'Patrouille du Hunter', slEn:'Hunter\'s Patrol', type:'cardio', diff:1, stat:'END', unit:'time', base:30, equip:'none',
          mFr:'Cardio doux', mEn:'Low-impact cardio', goals:['lose','maintain'],
          hFr:'Pas soutenu, posture droite, balance les bras.',
          hEn:'Brisk steps, upright posture, swing your arms.' },

        // ---- GAINAGE / ABDOS ----
        { id:'plank', fr:'Planche', en:'Plank', sl:'Bouclier de l\'Âme', slEn:'Soul Shield', type:'core', diff:1, stat:'VIT', unit:'time', base:30, equip:'none',
          mFr:'Abdos, gainage', mEn:'Abs, core', goals:['gain','maintain','lose'],
          hFr:'Sur les avant-bras, corps droit, abdos et fessiers serrés, ne creuse pas le dos.',
          hEn:'On your forearms, body straight, abs and glutes tight, don\'t sag the lower back.' },
        { id:'sideplank', fr:'Planche latérale', en:'Side plank', sl:'Garde Latérale', slEn:'Lateral Guard', type:'core', diff:2, stat:'VIT', unit:'time', base:25, equip:'none',
          mFr:'Obliques', mEn:'Obliques', goals:['maintain','gain'],
          hFr:'Sur un avant-bras, corps aligné, hanche haute. Change de côté.',
          hEn:'On one forearm, body aligned, hips high. Switch sides.' },
        { id:'crunch', fr:'Crunchs', en:'Crunches', sl:'Lame Abdominale', slEn:'Core Blade', type:'core', diff:1, stat:'VIT', unit:'reps', base:20, equip:'none',
          mFr:'Abdos', mEn:'Abs', goals:['lose','maintain'],
          hFr:'Décolle les omoplates en soufflant, sans tirer sur la nuque.',
          hEn:'Lift your shoulder blades while exhaling, don\'t pull on your neck.' },
        { id:'legraise', fr:'Relevés de jambes', en:'Leg raises', sl:'Faux du Néant', slEn:'Void Scythe', type:'core', diff:2, stat:'VIT', unit:'reps', base:12, equip:'none',
          mFr:'Bas des abdos', mEn:'Lower abs', goals:['gain','maintain'],
          hFr:'Allongé, jambes tendues, monte-les à la verticale, descends sans toucher le sol.',
          hEn:'Lying down, legs straight, raise to vertical, lower without touching the floor.' },
        { id:'twist', fr:'Russian twists', en:'Russian twists', sl:'Tourbillon de l\'Ombre', slEn:'Shadow Whirl', type:'core', diff:2, stat:'VIT', unit:'reps', base:20, equip:'none',
          mFr:'Obliques', mEn:'Obliques', goals:['lose','maintain'],
          hFr:'Assis buste incliné, pieds décollés, tourne le tronc d\'un côté à l\'autre.',
          hEn:'Seated, torso leaned back, feet up, rotate your trunk side to side.' },
        { id:'hollow', fr:'Hollow hold', en:'Hollow hold', sl:'Vide Absolu', slEn:'Absolute Void', type:'core', diff:3, stat:'VIT', unit:'time', base:30, equip:'none',
          mFr:'Gainage complet', mEn:'Full core', goals:['gain'],
          hFr:'Bas du dos collé au sol, bras et jambes tendus décollés, forme de banane.',
          hEn:'Lower back pressed to the floor, arms and legs raised and straight, banana shape.' },

        // ---- MOBILITÉ / RÉCUP ----
        { id:'stretch', fr:'Étirements complets', en:'Full-body stretch', sl:'Rituel de Régénération', slEn:'Regeneration Ritual', type:'mobility', diff:1, stat:'VIT', unit:'time', base:10, equip:'none',
          mFr:'Souplesse', mEn:'Flexibility', goals:['lose','gain','maintain'],
          hFr:'Étire chaque groupe musculaire 20-30s sans à-coups, respire profondément.',
          hEn:'Stretch each muscle group 20-30s smoothly, breathe deeply.' },
        { id:'yoga', fr:'Yoga / Mobilité', en:'Yoga / Mobility', sl:'Flux de Mana', slEn:'Mana Flow', type:'mobility', diff:1, stat:'VIT', unit:'time', base:15, equip:'mat',
          mFr:'Souplesse, équilibre', mEn:'Flexibility, balance', goals:['maintain','lose'],
          hFr:'Enchaîne des postures lentes, synchronise mouvement et respiration.',
          hEn:'Flow through slow poses, sync movement with breath.' }
    ];

    // ==================== PROGRAMMES & NUTRITION ====================
    const SCHEDULES = {
        gain: { fr:{monday:'Pectoraux & Triceps',tuesday:'Dos & Biceps',wednesday:'Repos actif / Mobilité',thursday:'Jambes & Fessiers',friday:'Épaules & Bras',saturday:'Full Body / Gainage',sunday:'Repos'},
                en:{monday:'Chest & Triceps',tuesday:'Back & Biceps',wednesday:'Active rest / Mobility',thursday:'Legs & Glutes',friday:'Shoulders & Arms',saturday:'Full Body / Core',sunday:'Rest'} },
        lose: { fr:{monday:'HIIT & Cardio',tuesday:'Full Body brûleur',wednesday:'Cardio léger / Marche',thursday:'Circuit métabolique',friday:'HIIT & Gainage',saturday:'Cardio long',sunday:'Repos / Étirements'},
                en:{monday:'HIIT & Cardio',tuesday:'Full Body burner',wednesday:'Light cardio / Walk',thursday:'Metabolic circuit',friday:'HIIT & Core',saturday:'Long cardio',sunday:'Rest / Stretching'} },
        maintain: { fr:{monday:'Haut du corps',tuesday:'Cardio modéré',wednesday:'Bas du corps',thursday:'Mobilité & Gainage',friday:'Full Body',saturday:'Activité libre',sunday:'Repos'},
                en:{monday:'Upper body',tuesday:'Moderate cardio',wednesday:'Lower body',thursday:'Mobility & Core',friday:'Full Body',saturday:'Free activity',sunday:'Rest'} }
    };

    const NUTRITION = {
        gain: { fr:['Vise un léger surplus calorique (+250 à +400 kcal/jour).','1,6 à 2 g de protéines par kg de poids de corps chaque jour.','Répartis tes protéines sur 3-4 repas.','Ne néglige pas les glucides : ils alimentent tes entraînements.','Dors 7-9h : le muscle se construit au repos.'],
                en:['Aim for a slight calorie surplus (+250 to +400 kcal/day).','1.6 to 2 g of protein per kg of bodyweight daily.','Spread protein across 3-4 meals.','Don\'t skip carbs: they fuel your training.','Sleep 7-9h: muscle is built during rest.'] },
        lose: { fr:['Crée un déficit modéré (-300 à -500 kcal/jour), jamais extrême.','Garde un apport élevé en protéines pour préserver le muscle.','Privilégie les aliments rassasiants : légumes, protéines maigres, fibres.','Bois 2-3 L d\'eau par jour.','Le cardio brûle, mais l\'alimentation gagne la guerre.'],
                en:['Create a moderate deficit (-300 to -500 kcal/day), never extreme.','Keep protein high to preserve muscle.','Favor filling foods: vegetables, lean protein, fiber.','Drink 2-3 L of water per day.','Cardio burns, but nutrition wins the war.'] },
        maintain: { fr:['Mange à ta maintenance calorique.','Équilibre protéines, glucides et lipides à chaque repas.','La constance bat l\'intensité sur le long terme.','Hydrate-toi et privilégie les aliments peu transformés.','Ajuste selon ton énergie et ta récupération.'],
                en:['Eat at your maintenance calories.','Balance protein, carbs and fats at each meal.','Consistency beats intensity over the long run.','Stay hydrated, favor minimally processed foods.','Adjust based on your energy and recovery.'] }
    };

    // ==================== GÉNÉRATEUR ====================
    const DIFF_BY_FITNESS = { beginner: 1, intermediate: 2, advanced: 3 };
    const RANK_MULT = { E: 1, D: 1.1, C: 1.25, B: 1.4, A: 1.6, S: 2 };

    function seededShuffle(arr, seed) {
        const a = arr.slice(); let s = seed;
        const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
        for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
        return a;
    }
    function scaleValue(ex, fDiff, rMult) {
        const fMult = 1 + (fDiff - 1) * 0.4;
        const raw = ex.base * fMult * Math.min(rMult, 1.5);
        return ex.unit === 'time' ? Math.round(raw / 5) * 5 : Math.max(5, Math.round(raw));
    }
    function computeXP(ex, value, sets) {
        const effort = ex.unit === 'time' ? value / 4 : value;
        return Math.round((effort * sets * (0.6 + ex.diff * 0.25)) / 5) * 5 + 10;
    }

    function generateProtocol(p) {
        p = p || {};
        const lang = p.lang === 'en' ? 'en' : 'fr';
        const objective = ['lose', 'gain', 'maintain'].includes(p.objective) ? p.objective : 'maintain';
        const fitness = DIFF_BY_FITNESS[p.fitness] ? p.fitness : 'beginner';
        const rank = RANK_MULT[p.rank] ? p.rank : 'E';
        const fDiff = DIFF_BY_FITNESS[fitness];
        const rMult = RANK_MULT[rank];
        const daySeed = (typeof p.daySeed === 'number' ? p.daySeed : new Date().getDay()) + 1;

        const pool = EX.filter(ex => ex.goals.includes(objective) && ex.diff <= fDiff + 1);
        const shuffled = seededShuffle(pool, daySeed * 31 + fDiff * 7);

        const wanted = objective === 'lose' ? ['cardio', 'strength', 'core', 'cardio']
            : objective === 'gain' ? ['strength', 'strength', 'core', 'cardio']
                : ['strength', 'cardio', 'core', 'mobility'];

        const dailyQuests = [];
        const used = new Set();
        for (const wt of wanted) {
            const pick = shuffled.find(ex => ex.type === wt && !used.has(ex.id)) || shuffled.find(ex => !used.has(ex.id));
            if (!pick) continue;
            used.add(pick.id);
            const sets = pick.type === 'mobility' ? 1 : (fDiff + 1);
            const value = scaleValue(pick, fDiff, rMult);
            const target = pick.unit === 'time' ? `${sets} × ${value}s` : `${sets} × ${value}`;
            dailyQuests.push({
                id: pick.id,
                name: pick[lang],                 // VRAI nom d'exercice (en vedette)
                realName: pick[lang],
                slName: (lang === 'en' && pick.slEn) ? pick.slEn : pick.sl,  // nom d'ombre (localisé)
                howto: pick[lang === 'en' ? 'hEn' : 'hFr'],
                muscle: pick[lang === 'en' ? 'mEn' : 'mFr'],
                equip: pick.equip,
                description: pick[lang === 'en' ? 'mEn' : 'mFr'] + ' · ' + target,
                xp: computeXP(pick, value, sets),
                type: pick.type, stat: pick.stat,
                sets: sets, reps: pick.unit === 'reps' ? value : undefined,
                duration: pick.unit === 'time' ? value + 's' : undefined,
                target: target
            });
        }

        const totalDailyXP = dailyQuests.reduce((s, q) => s + q.xp, 0);
        const weekly = {
            lose: { fr:{name:'Purge du Donjon',target:'Complète 5 séances cette semaine',desc:'Élimine les ombres qui ralentissent ta progression.'},
                    en:{name:'Dungeon Purge',target:'Complete 5 workouts this week',desc:'Burn away the shadows slowing your progress.'} },
            gain: { fr:{name:'Forge du Monarque',target:'Complète 4 séances de force cette semaine',desc:'Construis le corps d\'un Souverain des Ombres.'},
                    en:{name:'Monarch\'s Forge',target:'Complete 4 strength workouts this week',desc:'Build the body of a Shadow Sovereign.'} },
            maintain: { fr:{name:'Veille du Gardien',target:'Reste actif 5 jours cette semaine',desc:'Maintiens l\'équilibre et la maîtrise de ton corps.'},
                        en:{name:'Guardian\'s Watch',target:'Stay active 5 days this week',desc:'Keep your body balanced and in control.'} }
        }[objective][lang];

        return {
            dailyQuests,
            weeklyQuest: { name: weekly.name, description: weekly.desc, target: weekly.target, xp: Math.max(200, totalDailyXP * 3) },
            weeklySchedule: SCHEDULES[objective][lang],
            nutritionTips: NUTRITION[objective][lang],
            meta: { objective, fitness, rank, lang, generatedAt: new Date().toISOString() }
        };
    }

    const QuestLibrary = {
        generateProtocol,
        EXERCISES: EX,
        getExercise: function (id) { return EX.find(e => e.id === id) || null; },
        regenerateDaily: function (meta) {
            return generateProtocol(Object.assign({}, meta, { daySeed: new Date().getDay() }));
        }
    };

    global.QuestLibrary = QuestLibrary;
    if (typeof module !== 'undefined' && module.exports) module.exports = QuestLibrary;
})(typeof window !== 'undefined' ? window : this);
