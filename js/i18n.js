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
            'nav.guilds': 'GUILDES', 'nav.profile': 'PROFIL', 'nav.support': 'SOUTIEN',
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
            'lb.power_label': 'PUISSANCE', 'lb.lvl': 'Niv.', 'lb.empty': 'Aucun Hunter à ce rang.', 'lb.error': 'Erreur de chargement.', 'lb.online': '{n} en ligne',
            'ar.type_xp': 'XP', 'ar.type_workouts': 'séances', 'ar.type_streak': 'jours de série',
            'ar.st_pending': 'EN ATTENTE', 'ar.st_active': 'EN COURS', 'ar.st_completed': 'TERMINÉ', 'ar.st_declined': 'REFUSÉ',
            'ar.you': 'TOI', 'ar.first_to': 'Premier à', 'ar.accept': 'ACCEPTER', 'ar.decline': 'REFUSER',
            'ar.waiting': 'En attente de réponse...', 'ar.victory': 'VICTOIRE', 'ar.defeat': 'DÉFAITE', 'ar.opponent': 'Adversaire',
            'ar.pick_opponent': 'Choisis un adversaire.', 'ar.sent_to': 'Défi envoyé à', 'ar.none_found': 'Aucun Hunter trouvé.',
            'ar.duel_sent': 'Défi lancé !', 'ar.accepted': 'Défi accepté ! Que le meilleur gagne.', 'ar.recruit': 'Défier',
            'gu.leave_confirm': 'Quitter la guilde ?', 'gu.welcome': 'Bienvenue dans la guilde !', 'gu.founded': 'Guilde fondée !',
            'gu.left': 'Tu as quitté la guilde.', 'gu.name_taken': 'Ce nom est déjà pris.', 'gu.name_short': 'Nom trop court (3 min).',
            'gu.recruiting': 'RECRUTE', 'gu.recruiting_only': 'Recrutement ouvert uniquement',
            // Montée de niveau & butin
            'lvl.up': 'NIVEAU SUPÉRIEUR !', 'lvl.lv': 'NV.', 'lvl.points': 'POINTS DE STAT', 'lvl.continue': 'CONTINUER',
            'loot.obtained': 'BUTIN OBTENU',
            // Forge / Inventaire
            'nav.forge': 'FORGE',
            'inv.title': 'LA FORGE', 'inv.subtitle': 'ÉQUIPE-TOI · DEVIENS PLUS PUISSANT',
            'inv.equipped': 'ÉQUIPEMENT', 'inv.inventory': 'SAC', 'inv.empty_slot': 'Emplacement vide',
            'inv.empty_bag': 'Ton sac est vide. Termine des quêtes et monte de niveau pour trouver du butin.',
            'inv.equip': 'ÉQUIPER', 'inv.unequip': 'RETIRER', 'inv.sell': 'VENDRE', 'inv.sell_commons': 'VENDRE LES COMMUNS',
            'inv.equipped_label': 'ÉQUIPÉ', 'inv.gold': 'OR', 'inv.power': 'PUISSANCE', 'inv.bonus': 'BONUS D\'ÉQUIPEMENT',
            'inv.xp_bonus': 'BONUS XP', 'inv.sold': 'Vendu', 'inv.equipped_toast': 'Équipé !', 'inv.nothing_to_sell': 'Rien à vendre.',
            'inv.forge_title': 'INVOQUER UN OBJET', 'inv.forge_desc': 'Dépense de l\'or pour invoquer un objet aléatoire.',
            'inv.forge_btn': 'INVOQUER', 'inv.need_gold': 'Pas assez d\'or.', 'inv.offline_bag': 'Joue et monte de niveau pour remplir ton sac !',
            'inv.compare': 'Équipé', 'inv.no_bonus': 'Aucun bonus actif — équipe des objets.',
            // Chronomètre (quêtes)
            'wk.get_ready': 'PRÉPARE-TOI', 'wk.go': 'GO !', 'wk.rest': 'REPOS', 'wk.hold': 'TIENS LA POSITION',
            'wk.skip': 'PASSER', 'wk.pause': 'PAUSE', 'wk.resume': 'REPRENDRE', 'wk.time': 'TEMPS TOTAL',
            'wk.next': 'SUIVANT', 'wk.speed_bonus': 'BONUS DE VITESSE', 'wk.quest_complete': 'QUÊTE TERMINÉE',
            'wk.set': 'SÉRIE', 'wk.of': 'sur', 'wk.start_set': 'DÉMARRER LA SÉRIE', 'wk.done_set': 'SÉRIE FAITE',
            'wk.exit': 'QUITTER', 'wk.add_rep': '+1 RÉP', 'wk.finish': 'TERMINER',
            // Recrutement & chat de guilde
            'gu.invite': 'INVITER', 'gu.apply': 'POSTULER', 'gu.applications': 'CANDIDATURES', 'gu.recruit_member': 'RECRUTER',
            'gu.chat': 'CHAT DE GUILDE', 'gu.send': 'ENVOYER', 'gu.message_ph': 'Écris un message...',
            'gu.accept': 'ACCEPTER', 'gu.reject': 'REFUSER', 'gu.kick': 'EXCLURE', 'gu.invited': 'Invitation envoyée !',
            'gu.applied': 'Candidature envoyée !', 'gu.no_apps': 'Aucune candidature en attente.', 'gu.apply_sent': 'CANDIDATURE ENVOYÉE',
            'gu.role_owner': 'MAÎTRE', 'gu.role_officer': 'OFFICIER', 'gu.role_member': 'MEMBRE',
            'gu.no_messages': 'Aucun message. Lance la conversation !', 'gu.apply_to': 'Postuler à cette guilde',
            'gu.already_applied': 'Déjà postulé', 'gu.my_applications': 'MES CANDIDATURES',
            // Arène (PvP)
            'ar.wager': 'MISE (OR)', 'ar.quick': 'COMBAT RAPIDE', 'ar.quick_desc': 'Trouve instantanément un adversaire de puissance proche.',
            'ar.find_match': 'TROUVER UN ADVERSAIRE', 'ar.reward': 'Récompense', 'ar.deadline': 'Échéance',
            'ar.duration': 'DURÉE', 'ar.days': 'jours', 'ar.prize': 'GAIN', 'ar.no_opponent': 'Aucun adversaire trouvé pour le moment.',
            'ar.time_left': 'restant', 'ar.expired': 'EXPIRÉ', 'ar.wager_hint': 'Le gagnant rafle la mise.',
            'ar.battle_practice': 'DUEL D\'ENTRAÎNEMENT', 'ar.searching': 'Recherche d\'un adversaire...',
            'ar.duel_started': 'Duel lancé ! La course commence.', 'ar.battle': 'COMBAT', 'ar.shadow_bot': 'Ombre Rivale',
            // Dashboard (accueil)
            'dash.hunter_level': 'NIVEAU HUNTER', 'dash.exp': 'EXP', 'dash.next': 'SUIV.',
            'dash.str': 'FORCE', 'dash.agi': 'AGILITÉ', 'dash.end': 'ENDURANCE', 'dash.vit': 'VITALITÉ',
            'dash.day_streak': 'JOURS DE SÉRIE', 'dash.start_daily': 'COMMENCER UNE QUÊTE',
            'dash.daily_quests': 'QUÊTES DU JOUR', 'dash.weekly_quest': 'QUÊTE HEBDO', 'dash.today_focus': 'FOCUS DU JOUR',
            'dash.recent_activity': 'ACTIVITÉ RÉCENTE', 'dash.warning': '⚠️ ATTENTION : ne pas terminer la quête du jour entraîne une pénalité',
            'dash.awakened': 'Système activé — Hunter éveillé', 'dash.just_now': 'à l\'instant',
            'dash.quest_done': 'Quête terminée :', 'dash.start_quest': 'COMMENCER LA QUÊTE',
            // Tableau des quêtes
            'wb.title': 'TABLEAU DES QUÊTES', 'wb.subtitle': 'CHOISIS TA MISSION D\'ENTRAÎNEMENT',
            'wb.all': 'TOUTES', 'wb.daily': 'JOUR', 'wb.weekly': 'SEMAINE', 'wb.special': 'SPÉCIAL',
            'wk.quest_active': 'QUÊTE EN COURS', 'wk.time_left': 'TEMPS RESTANT', 'wk.time_up': 'TEMPS ÉCOULÉ !',
            // Talents
            'tal.title': 'BIBLIOTHÈQUE DE TALENTS', 'tal.subtitle': 'MAÎTRISE TES CAPACITÉS',
            'tal.all': 'TOUS', 'tal.chest': 'PECTORAUX', 'tal.back': 'DOS', 'tal.shoulders': 'ÉPAULES',
            'tal.arms': 'BRAS', 'tal.legs': 'JAMBES', 'tal.core': 'GAINAGE', 'tal.cardio': 'CARDIO',
            'tal.train': 'ENTRAÎNER', 'tal.info': 'INFOS', 'tal.mastery': 'MAÎTRISE', 'tal.locked': 'VERROUILLÉ',
            'tal.requires': 'REQUIERT', 'tal.mastered': 'TALENT MAÎTRISÉ', 'tal.bonus': 'BONUS PERMANENT',
            'tal.max': 'MAÎTRISE MAX', 'tal.training': 'ENTRAÎNEMENT', 'tal.how_to': 'COMMENT FAIRE',
            'tal.variations': 'VARIATIONS', 'tal.tips': 'CONSEILS', 'tal.close': 'FERMER', 'tal.xp_set': 'XP/SÉRIE',
            'tal.reps': 'RÉPS', 'tal.hold': 'TENIR', 'tal.train_done': 'Entraînement terminé !', 'tal.go': 'GO !',
            // Profil
            'prof.change': 'CHANGER', 'prof.workouts': 'SÉANCES', 'prof.total_xp': 'XP TOTAL', 'prof.days_active': 'JOURS ACTIFS',
            'prof.stat_allocation': 'RÉPARTITION DES STATS', 'prof.available_points': 'POINTS DE STAT DISPONIBLES',
            'prof.hunter_title': 'TITRE DE HUNTER', 'prof.equipped_gear': 'ÉQUIPEMENT PORTÉ', 'prof.settings': 'PARAMÈTRES',
            'prof.save': 'ENREGISTRER', 'prof.export': 'EXPORTER LES DONNÉES', 'prof.reset': 'RÉINITIALISER',
            'prof.open_forge': 'OUVRIR LA FORGE',
            'prof.rank_hunter': 'HUNTER RANG',
            'perk.title': 'PERKS DE RANG', 'perk.xp': 'XP', 'perk.luck': 'chance de butin', 'perk.gold': 'or',
            'perk.power': 'puissance', 'perk.minloot': 'butin minimum :', 'perk.none': 'Aucun perk — monte en rang !',
            // Progression
            'prog.title': 'PROGRESSION DU HUNTER', 'prog.subtitle': 'SUIS TON ÉVOLUTION',
            'prog.level': 'NIVEAU', 'prog.day_streak': 'JOURS DE SÉRIE', 'prog.achievements': 'SUCCÈS',
            'prog.level_progress': 'PROGRESSION DE NIVEAU', 'prog.hunter_stats': 'STATS DU HUNTER',
            'prog.training_streak': "SÉRIE D'ENTRAÎNEMENT", 'prog.rank_progress': 'PROGRESSION DE RANG',
            'prog.rank_reqs': 'CONDITIONS DE PROMOTION', 'prog.completed': 'Complété', 'prog.today': "Aujourd'hui", 'prog.missed': 'Manqué',
            // Profil — réinitialisation
            'prof.reset_warn': 'ATTENTION : ceci réinitialise TOUTE ta progression. Continuer ?',
            'prof.reset_perm': 'Action PERMANENTE. Confirmer la réinitialisation ?',
            // Onboarding (éveil / évaluation / acceptation)
            'onb.awakening': 'ÉVEIL DU SYSTÈME', 'onb.chosen': 'Tu as été choisi pour devenir un', 'onb.hunter': 'HUNTER',
            'onb.name_ph': 'ENTRE TON NOM DE HUNTER', 'onb.your_rank': 'Ton rang assigné :', 'onb.begin': "COMMENCER L'ENTRAÎNEMENT",
            'onb.activated': 'SYSTÈME ACTIVÉ', 'onb.welcome': 'BIENVENUE, {name}',
            'onb.assessment': 'ÉVALUATION DU HUNTER', 'onb.hunter_label': 'Hunter', 'onb.rank_label': 'Rang',
            'onb.analyzing': "[SYSTÈME] Analyse des paramètres physiques pour un protocole d'entraînement optimal...",
            'onb.height': 'TAILLE (cm)', 'onb.weight': 'POIDS (kg)', 'onb.age': 'ÂGE', 'onb.objective': 'TON OBJECTIF',
            'onb.lose': 'PERDRE DU POIDS', 'onb.gain': 'PRENDRE DU MUSCLE', 'onb.maintain': 'MAINTENIR',
            'onb.fitness': 'NIVEAU DE FORME', 'onb.beginner': 'DÉBUTANT', 'onb.intermediate': 'INTERMÉDIAIRE', 'onb.advanced': 'AVANCÉ',
            'onb.generate': 'GÉNÉRER LE PROTOCOLE', 'onb.analyzing_data': 'ANALYSE DES DONNÉES...', 'onb.connecting': 'Connexion au Système...',
            'onb.protocol_generated': 'PROTOCOLE GÉNÉRÉ', 'onb.protocol_msg': '[SYSTÈME] Tes quêtes personnalisées ont été créées !',
            'onb.daily_quests_label': 'QUÊTES DU JOUR :', 'onb.weekly_quest_label': 'QUÊTE HEBDOMADAIRE :',
            'onb.err_params': '[ERREUR] Tous les paramètres physiques sont requis !', 'onb.err_objective': '[ERREUR] Choisis ton objectif !',
            'onb.err_fitness': '[ERREUR] Choisis ton niveau de forme !', 'onb.analyzing_params': 'Analyse des paramètres physiques...',
            'onb.generating': 'Génération du protocole personnalisé...', 'onb.protocol_ok': 'Protocole généré avec succès !',
            'onb.notification': 'NOTIFICATION', 'onb.heart_warning': "Si tu n'acceptes pas, ton cœur s'arrêtera dans",
            'onb.seconds': 'secondes', 'onb.accept_q': 'Veux-tu accepter ?', 'onb.yes': 'Oui', 'onb.no': 'Non',
            'onb.quest_accepted': 'QUÊTE ACCEPTÉE', 'onb.you_died': 'TU ES MORT', 'onb.refused': "[SYSTÈME] Le joueur a refusé de s'éveiller...", 'onb.try_again': 'RÉESSAYER',
            // ===== Auth (modale connexion/inscription + puces de compte) =====
            "auth.offline_toast": "Mode hors-ligne — configure Supabase (js/config.js) pour le multijoueur.",
            "auth.offline_alert": "Mode hors-ligne : configure Supabase dans js/config.js pour activer les comptes en ligne.",
            "auth.close": "Fermer",
            "auth.subtitle": "Synchronise ta progression · Rejoins le classement",
            "auth.login": "CONNEXION",
            "auth.signup": "INSCRIPTION",
            "auth.skip": "Continuer hors-ligne →",
            "auth.name_ph": "NOM DE HUNTER",
            "auth.email_ph": "EMAIL",
            "auth.pass_ph": "MOT DE PASSE",
            "auth.signup_btn": "DEVENIR HUNTER",
            "auth.login_btn": "ENTRER DANS LE DONJON",
            "auth.err_required": "Email et mot de passe requis.",
            "auth.err_pass_short": "Mot de passe : 6 caractères minimum.",
            "auth.loading_btn": "CONNEXION...",
            "auth.signup_check_email": "Compte créé ! Vérifie ton email pour confirmer.",
            "auth.waiting_btn": "EN ATTENTE...",
            "auth.err_invalid": "Email ou mot de passe incorrect.",
            "auth.err_registered": "Cet email a déjà un compte.",
            "auth.err_rate": "Trop de tentatives, réessaie plus tard.",
            "auth.logout_confirm": "Se déconnecter ?",
            "auth.granted": "ACCÈS ACCORDÉ", "auth.welcome_name": "Bienvenue, {name}",
            "auth.support": "Bâti par un seul Hunter — soutiens le dév",
            "auth.guest_or": "— ou —",
            "auth.guest_locked": "Sans compte, tu n'auras pas :",
            "auth.guest_sync": "La synchro multi-appareils (progression sur cet appareil)",
            "auth.guest_lb": "Le classement mondial",
            "auth.guest_pvp": "Les duels PvP dans l'Arène",
            "auth.guest_guild": "Les guildes",
            "auth.guest_note": "Tu pourras créer un compte à tout moment.",
            "auth.guest_continue": "Continuer sans compte →",
            // ===== Soutien (Ko-fi) =====
            "support.eyebrow": "SYSTÈME · MESSAGE DU DÉVELOPPEUR",
            "support.title": "UN SEUL HUNTER DERRIÈRE LE SYSTÈME",
            "support.lead": "Shadow Gym est conçu, codé et maintenu par une seule personne.",
            "support.p_solo": "Développeur solo — chaque quête, chaque rang, chaque pixel d'une seule paire de mains.",
            "support.p_anime": "Fan d'anime — Solo Leveling transformé en véritable système d'entraînement.",
            "support.p_living": "J'en fais mon métier — ton soutien garde le Système en ligne.",
            "support.fuel": "ALIMENTE LE SYSTÈME",
            "support.kofi": "Soutenir sur Ko-fi",
            "support.thanks": "Chaque café est un soldat d'ombre ajouté à l'armée. Merci, Hunter.",
            "support.back": "← Retour",
            "support.cta_landing": "Dév solo — soutiens le projet",
            "support.about_h": "À PROPOS DE MOI",
            "support.about_1": "Je suis développeur solo et fan d'anime depuis toujours. Shadow Gym est né d'une idée : et si monter de niveau dans la vraie vie ressemblait à Solo Leveling ? J'ai donc tout construit moi-même — les quêtes, les rangs, l'Arène, la Forge, le design et le code.",
            "support.about_2": "Ce n'est pas un hobby du week-end — j'en fais mon métier. Pas d'équipe, pas de studio, pas de pub, pas de paywall. Juste un Hunter qui livre des mises à jour, un commit à la fois.",
            "support.why_h": "POURQUOI SOUTENIR",
            "support.why_1": "Ton soutien finance le temps de continuer à créer — nouvelles quêtes, fonctionnalités et langues — et garde Shadow Gym gratuit, en ligne et sans pub pour chaque Hunter.",
            "support.sign": "— Mahery, dév solo",
            // ===== Commun : libellés de cartes de quête =====
            "common.daily": "QUOTIDIEN", "common.weekly": "HEBDO", "common.special": "SPÉCIAL",
            "common.easy": "FACILE", "common.medium": "MOYEN", "common.hard": "DIFFICILE", "common.extreme": "EXTRÊME",
            "common.completed": "TERMINÉ", "common.duration": "DURÉE", "common.difficulty": "DIFFICULTÉ", "common.sets_reps": "SÉRIES/RÉPS",
            // ===== Cartes de quête (séances) =====
            "quest.reward_xp": "XP GAGNÉ", "quest.stat_boost": "BONUS STAT", "quest.start_quest": "DÉMARRER LA QUÊTE",
            "quest.accept_challenge": "RELEVER LE DÉFI", "quest.view_progress": "VOIR LA PROGRESSION", "quest.progress": "PROGRESSION",
            "quest.push_day_title": "PROTOCOLE JOUR DE POUSSÉE",
            "quest.push_day_desc": "Complète l'entraînement pectoraux, épaules et triceps pour augmenter ta puissance de poussée.",
            "quest.pull_day_title": "PROTOCOLE JOUR DE TRACTION",
            "quest.pull_day_desc": "Entraîne ton dos et tes biceps pour développer une force de traction digne d'un vrai chasseur.",
            "quest.leg_day_title": "DESTRUCTEUR JOUR DES JAMBES",
            "quest.leg_day_desc": "Forge des jambes puissantes capables de te porter à travers n'importe quel donjon.",
            "quest.monarch_trial_title": "ÉPREUVE DU MONARQUE DES OMBRES",
            "quest.monarch_trial_desc": "Termine toutes les quêtes quotidiennes pendant 7 jours consécutifs. Seuls les plus forts survivent.",
            "quest.reps_challenge_title": "DÉFI DES 100 RÉPÉTITIONS",
            "quest.reps_challenge_desc": "Effectue 100 répétitions de chaque : pompes, squats, abdos. Une épreuve digne des chasseurs de rang S.",
            "quest.core_fort_title": "FORTIFICATION DU TRONC",
            "quest.core_fort_desc": "Renforce ton tronc pour résister à n'importe quelle attaque. Essentiel à la survie du chasseur.",
            // ===== Accueil =====
            "dash.fallback_q1": "Faire 50 pompes", "dash.fallback_q2": "Faire 50 squats", "dash.fallback_q3": "Courir 5 kilomètres",
            "dash.level_up": "Vous avez atteint le Niveau {level} !",
            // ===== Progression =====
            "progress.req_level": "Atteindre le niveau {n}", "progress.req_workouts": "Compléter {n} séances",
            "progress.req_streak": "Série de {n} jours", "progress.req_str": "FOR ≥ {n}", "progress.ach_unlocked": " débloqués",
            // ===== Avatar =====
            "avatar.updated": "Avatar mis à jour !",
            // ===== Profil =====
            "prof.set_notif": "Notifications", "prof.set_notif_desc": "Reçois des rappels de quêtes et des alertes de niveau supérieur",
            "prof.set_sound": "Effets sonores", "prof.set_sound_desc": "Joue des sons pour les succès et les montées de niveau",
            "prof.set_particles": "Effets de particules", "prof.set_particles_desc": "Affiche les particules animées en arrière-plan",
            "prof.set_dark": "Mode sombre", "prof.set_dark_desc": "Utilise le thème sombre (activé par défaut)",
            "prof.set_rest": "Rappels de jour de repos", "prof.set_rest_desc": "Sois notifié quand tu devrais prendre un jour de repos",
            "prof.title_rising": "★ HUNTER MONTANT ★", "prof.title_awakened": "L'ÉVEILLÉ",
            "prof.title_iron": "🔒 GUERRIER DE FER", "prof.title_soldier": "🔒 SOLDAT DE L'OMBRE",
            "prof.title_gate": "🔒 BRISEUR DE PORTE", "prof.title_demon": "🔒 POURFENDEUR DE DÉMONS",
            "prof.title_srank": "🔒 HUNTER RANG S", "prof.title_monarch": "🔒 MONARQUE DE L'OMBRE",
            "prof.rank_badge": "HUNTER RANG {rank}", "prof.saved": "PROFIL ENREGISTRÉ !",
            "prof.support": "SOUTENIR LE DÉV", "prof.signout": "SE DÉCONNECTER", "prof.signin": "SE CONNECTER"
        },
        en: {
            'nav.dashboard': 'HOME', 'nav.quests': 'QUESTS', 'nav.skills': 'SKILLS',
            'nav.progress': 'PROGRESS', 'nav.ranking': 'RANKING', 'nav.arena': 'ARENA',
            'nav.guilds': 'GUILDS', 'nav.profile': 'PROFILE', 'nav.support': 'SUPPORT',
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
            'lb.power_label': 'POWER', 'lb.lvl': 'Lv.', 'lb.empty': 'No Hunters at this rank yet.', 'lb.error': 'Loading error.', 'lb.online': '{n} online',
            'ar.type_xp': 'XP', 'ar.type_workouts': 'workouts', 'ar.type_streak': 'streak days',
            'ar.st_pending': 'PENDING', 'ar.st_active': 'ACTIVE', 'ar.st_completed': 'COMPLETED', 'ar.st_declined': 'DECLINED',
            'ar.you': 'YOU', 'ar.first_to': 'First to', 'ar.accept': 'ACCEPT', 'ar.decline': 'DECLINE',
            'ar.waiting': 'Waiting for response...', 'ar.victory': 'VICTORY', 'ar.defeat': 'DEFEAT', 'ar.opponent': 'Opponent',
            'ar.pick_opponent': 'Pick an opponent.', 'ar.sent_to': 'Challenge sent to', 'ar.none_found': 'No Hunter found.',
            'ar.duel_sent': 'Challenge sent!', 'ar.accepted': 'Challenge accepted! May the best win.', 'ar.recruit': 'Challenge',
            'gu.leave_confirm': 'Leave the guild?', 'gu.welcome': 'Welcome to the guild!', 'gu.founded': 'Guild founded!',
            'gu.left': 'You left the guild.', 'gu.name_taken': 'That name is already taken.', 'gu.name_short': 'Name too short (min 3).',
            'gu.recruiting': 'RECRUITING', 'gu.recruiting_only': 'Recruiting only',
            // Level up & loot
            'lvl.up': 'LEVEL UP!', 'lvl.lv': 'LV.', 'lvl.points': 'STAT POINTS', 'lvl.continue': 'CONTINUE',
            'loot.obtained': 'LOOT OBTAINED',
            // Forge / Inventory
            'nav.forge': 'FORGE',
            'inv.title': 'THE FORGE', 'inv.subtitle': 'GEAR UP · GROW STRONGER',
            'inv.equipped': 'EQUIPPED', 'inv.inventory': 'BAG', 'inv.empty_slot': 'Empty slot',
            'inv.empty_bag': 'Your bag is empty. Complete quests and level up to find loot.',
            'inv.equip': 'EQUIP', 'inv.unequip': 'UNEQUIP', 'inv.sell': 'SELL', 'inv.sell_commons': 'SELL COMMONS',
            'inv.equipped_label': 'EQUIPPED', 'inv.gold': 'GOLD', 'inv.power': 'POWER', 'inv.bonus': 'EQUIPMENT BONUS',
            'inv.xp_bonus': 'XP BONUS', 'inv.sold': 'Sold', 'inv.equipped_toast': 'Equipped!', 'inv.nothing_to_sell': 'Nothing to sell.',
            'inv.forge_title': 'SUMMON AN ITEM', 'inv.forge_desc': 'Spend gold to summon a random item.',
            'inv.forge_btn': 'SUMMON', 'inv.need_gold': 'Not enough gold.', 'inv.offline_bag': 'Play and level up to fill your bag!',
            'inv.compare': 'Equipped', 'inv.no_bonus': 'No active bonus — equip some items.',
            // Workout timer
            'wk.get_ready': 'GET READY', 'wk.go': 'GO!', 'wk.rest': 'REST', 'wk.hold': 'HOLD THE POSITION',
            'wk.skip': 'SKIP', 'wk.pause': 'PAUSE', 'wk.resume': 'RESUME', 'wk.time': 'TOTAL TIME',
            'wk.next': 'NEXT', 'wk.speed_bonus': 'SPEED BONUS', 'wk.quest_complete': 'QUEST COMPLETE',
            'wk.set': 'SET', 'wk.of': 'of', 'wk.start_set': 'START SET', 'wk.done_set': 'SET DONE',
            'wk.exit': 'EXIT', 'wk.add_rep': '+1 REP', 'wk.finish': 'FINISH',
            // Guild recruitment & chat
            'gu.invite': 'INVITE', 'gu.apply': 'APPLY', 'gu.applications': 'APPLICATIONS', 'gu.recruit_member': 'RECRUIT',
            'gu.chat': 'GUILD CHAT', 'gu.send': 'SEND', 'gu.message_ph': 'Write a message...',
            'gu.accept': 'ACCEPT', 'gu.reject': 'REJECT', 'gu.kick': 'KICK', 'gu.invited': 'Invite sent!',
            'gu.applied': 'Application sent!', 'gu.no_apps': 'No pending applications.', 'gu.apply_sent': 'APPLICATION SENT',
            'gu.role_owner': 'MASTER', 'gu.role_officer': 'OFFICER', 'gu.role_member': 'MEMBER',
            'gu.no_messages': 'No messages yet. Start the conversation!', 'gu.apply_to': 'Apply to this guild',
            'gu.already_applied': 'Already applied', 'gu.my_applications': 'MY APPLICATIONS',
            // Arena (PvP)
            'ar.wager': 'WAGER (GOLD)', 'ar.quick': 'QUICK MATCH', 'ar.quick_desc': 'Instantly find an opponent of similar power.',
            'ar.find_match': 'FIND AN OPPONENT', 'ar.reward': 'Reward', 'ar.deadline': 'Deadline',
            'ar.duration': 'DURATION', 'ar.days': 'days', 'ar.prize': 'PRIZE', 'ar.no_opponent': 'No opponent found right now.',
            'ar.time_left': 'left', 'ar.expired': 'EXPIRED', 'ar.wager_hint': 'Winner takes the pot.',
            'ar.battle_practice': 'PRACTICE DUEL', 'ar.searching': 'Finding an opponent...',
            'ar.duel_started': 'Duel started! The race begins.', 'ar.battle': 'BATTLE', 'ar.shadow_bot': 'Rival Shadow',
            // Dashboard
            'dash.hunter_level': 'HUNTER LEVEL', 'dash.exp': 'EXP', 'dash.next': 'NEXT',
            'dash.str': 'STRENGTH', 'dash.agi': 'AGILITY', 'dash.end': 'ENDURANCE', 'dash.vit': 'VITALITY',
            'dash.day_streak': 'DAY STREAK', 'dash.start_daily': 'START DAILY QUEST',
            'dash.daily_quests': 'DAILY QUESTS', 'dash.weekly_quest': 'WEEKLY QUEST', 'dash.today_focus': 'TODAY\'S FOCUS',
            'dash.recent_activity': 'RECENT ACTIVITY', 'dash.warning': '⚠️ WARNING: Failure to complete daily quest will result in penalty',
            'dash.awakened': 'System Activated — Hunter Awakened', 'dash.just_now': 'Just now',
            'dash.quest_done': 'Quest completed:', 'dash.start_quest': 'START QUEST',
            // Quest board
            'wb.title': 'QUEST BOARD', 'wb.subtitle': 'SELECT YOUR TRAINING MISSION',
            'wb.all': 'ALL QUESTS', 'wb.daily': 'DAILY', 'wb.weekly': 'WEEKLY', 'wb.special': 'SPECIAL',
            'wk.quest_active': 'QUEST ACTIVE', 'wk.time_left': 'TIME LEFT', 'wk.time_up': 'TIME\'S UP!',
            // Talents
            'tal.title': 'SKILL LIBRARY', 'tal.subtitle': 'MASTER YOUR ABILITIES',
            'tal.all': 'ALL', 'tal.chest': 'CHEST', 'tal.back': 'BACK', 'tal.shoulders': 'SHOULDERS',
            'tal.arms': 'ARMS', 'tal.legs': 'LEGS', 'tal.core': 'CORE', 'tal.cardio': 'CARDIO',
            'tal.train': 'TRAIN', 'tal.info': 'INFO', 'tal.mastery': 'MASTERY', 'tal.locked': 'LOCKED',
            'tal.requires': 'REQUIRES', 'tal.mastered': 'TALENT MASTERED', 'tal.bonus': 'PERMANENT BONUS',
            'tal.max': 'MAX MASTERY', 'tal.training': 'TRAINING', 'tal.how_to': 'HOW TO PERFORM',
            'tal.variations': 'VARIATIONS', 'tal.tips': 'TRAINING TIPS', 'tal.close': 'CLOSE', 'tal.xp_set': 'XP/SET',
            'tal.reps': 'REPS', 'tal.hold': 'HOLD', 'tal.train_done': 'Training complete!', 'tal.go': 'GO!',
            // Profile
            'prof.change': 'CHANGE', 'prof.workouts': 'WORKOUTS', 'prof.total_xp': 'TOTAL XP', 'prof.days_active': 'DAYS ACTIVE',
            'prof.stat_allocation': 'STAT ALLOCATION', 'prof.available_points': 'AVAILABLE STAT POINTS',
            'prof.hunter_title': 'HUNTER TITLE', 'prof.equipped_gear': 'EQUIPPED GEAR', 'prof.settings': 'SETTINGS',
            'prof.save': 'SAVE CHANGES', 'prof.export': 'EXPORT DATA', 'prof.reset': 'RESET PROGRESS',
            'prof.open_forge': 'OPEN THE FORGE',
            'prof.rank_hunter': 'RANK HUNTER',
            'perk.title': 'RANK PERKS', 'perk.xp': 'XP', 'perk.luck': 'loot luck', 'perk.gold': 'gold',
            'perk.power': 'power', 'perk.minloot': 'min loot:', 'perk.none': 'No perks — rank up!',
            // Progress
            'prog.title': 'HUNTER PROGRESS', 'prog.subtitle': 'TRACK YOUR EVOLUTION',
            'prog.level': 'LEVEL', 'prog.day_streak': 'DAY STREAK', 'prog.achievements': 'ACHIEVEMENTS',
            'prog.level_progress': 'LEVEL PROGRESS', 'prog.hunter_stats': 'HUNTER STATS',
            'prog.training_streak': 'TRAINING STREAK', 'prog.rank_progress': 'RANK PROGRESS',
            'prog.rank_reqs': 'RANK UP REQUIREMENTS', 'prog.completed': 'Completed', 'prog.today': 'Today', 'prog.missed': 'Missed',
            'prof.reset_warn': 'WARNING: This will reset ALL progress. Are you sure?',
            'prof.reset_perm': 'This action is PERMANENT. Confirm reset?',
            'onb.awakening': 'SYSTEM AWAKENING', 'onb.chosen': 'You have been chosen to become a', 'onb.hunter': 'HUNTER',
            'onb.name_ph': 'ENTER YOUR HUNTER NAME', 'onb.your_rank': 'Your assigned rank:', 'onb.begin': 'BEGIN TRAINING',
            'onb.activated': 'SYSTEM ACTIVATED', 'onb.welcome': 'WELCOME, {name}',
            'onb.assessment': 'HUNTER ASSESSMENT', 'onb.hunter_label': 'Hunter', 'onb.rank_label': 'Rank',
            'onb.analyzing': '[SYSTEM] Analyzing physical parameters for optimal training protocol...',
            'onb.height': 'HEIGHT (cm)', 'onb.weight': 'WEIGHT (kg)', 'onb.age': 'AGE', 'onb.objective': 'YOUR OBJECTIVE',
            'onb.lose': 'LOSE WEIGHT', 'onb.gain': 'GAIN MUSCLE', 'onb.maintain': 'MAINTAIN',
            'onb.fitness': 'FITNESS LEVEL', 'onb.beginner': 'BEGINNER', 'onb.intermediate': 'INTERMEDIATE', 'onb.advanced': 'ADVANCED',
            'onb.generate': 'GENERATE TRAINING PROTOCOL', 'onb.analyzing_data': 'ANALYZING DATA...', 'onb.connecting': 'Connecting to System...',
            'onb.protocol_generated': 'PROTOCOL GENERATED', 'onb.protocol_msg': '[SYSTEM] Your personalized training quests have been created!',
            'onb.daily_quests_label': 'DAILY QUESTS:', 'onb.weekly_quest_label': 'WEEKLY QUEST:',
            'onb.err_params': '[ERROR] All physical parameters are required!', 'onb.err_objective': '[ERROR] Select your training objective!',
            'onb.err_fitness': '[ERROR] Select your fitness level!', 'onb.analyzing_params': 'Analyzing physical parameters...',
            'onb.generating': 'Generating personalized protocol...', 'onb.protocol_ok': 'Protocol generated successfully!',
            'onb.notification': 'NOTIFICATION', 'onb.heart_warning': "If you don't accept, your heart will stop in",
            'onb.seconds': 'seconds', 'onb.accept_q': 'Do you want to accept ?', 'onb.yes': 'Yes', 'onb.no': 'No',
            'onb.quest_accepted': 'QUEST ACCEPTED', 'onb.you_died': 'YOU DIED', 'onb.refused': '[SYSTEM] The player refused to awaken...', 'onb.try_again': 'TRY AGAIN',
            // ===== Auth (login/signup modal + account chips) =====
            "auth.offline_toast": "Offline mode — configure Supabase (js/config.js) for multiplayer.",
            "auth.offline_alert": "Offline mode: configure Supabase in js/config.js to enable online accounts.",
            "auth.close": "Close",
            "auth.subtitle": "Sync your progress · Join the leaderboard",
            "auth.login": "SIGN IN",
            "auth.signup": "SIGN UP",
            "auth.skip": "Continue offline →",
            "auth.name_ph": "HUNTER NAME",
            "auth.email_ph": "EMAIL",
            "auth.pass_ph": "PASSWORD",
            "auth.signup_btn": "BECOME A HUNTER",
            "auth.login_btn": "ENTER THE DUNGEON",
            "auth.err_required": "Email and password required.",
            "auth.err_pass_short": "Password: 6 characters minimum.",
            "auth.loading_btn": "SIGNING IN...",
            "auth.signup_check_email": "Account created! Check your email to confirm.",
            "auth.waiting_btn": "PENDING...",
            "auth.err_invalid": "Incorrect email or password.",
            "auth.err_registered": "This email already has an account.",
            "auth.err_rate": "Too many attempts, try again later.",
            "auth.logout_confirm": "Sign out?",
            "auth.granted": "ACCESS GRANTED", "auth.welcome_name": "Welcome, {name}",
            "auth.support": "Built by one Hunter — support the dev",
            "auth.guest_or": "— or —",
            "auth.guest_locked": "Without an account you'll miss:",
            "auth.guest_sync": "Cross-device sync (progress stays on this device)",
            "auth.guest_lb": "The world leaderboard",
            "auth.guest_pvp": "PvP duels in the Arena",
            "auth.guest_guild": "Guilds",
            "auth.guest_note": "You can create an account anytime.",
            "auth.guest_continue": "Continue without an account →",
            // ===== Support (Ko-fi) =====
            "support.eyebrow": "SYSTEM · MESSAGE FROM THE DEV",
            "support.title": "ONE HUNTER BEHIND THE SYSTEM",
            "support.lead": "Shadow Gym is designed, coded and maintained by a single person.",
            "support.p_solo": "Solo developer — every quest, rank and pixel from one pair of hands.",
            "support.p_anime": "Anime fan — Solo Leveling turned into a real training system.",
            "support.p_living": "Doing this for a living — your support keeps the System online.",
            "support.fuel": "FUEL THE SYSTEM",
            "support.kofi": "Support on Ko-fi",
            "support.thanks": "Every coffee is a shadow soldier added to the army. Thank you, Hunter.",
            "support.back": "← Back",
            "support.cta_landing": "Solo dev — support the project",
            "support.about_h": "ABOUT ME",
            "support.about_1": "I'm a solo developer and a lifelong anime fan. Shadow Gym began with one idea: what if leveling up in real life felt like leveling up in Solo Leveling? So I built all of it myself — the quests, the ranks, the Arena, the Forge, the art and the code.",
            "support.about_2": "This isn't a weekend hobby — I'm doing it for a living. No team, no studio, no ads, no paywalls. Just one Hunter shipping updates one commit at a time.",
            "support.why_h": "WHY SUPPORT",
            "support.why_1": "Your support buys the time to keep building — new quests, features and languages — and keeps Shadow Gym free, online and ad-free for every Hunter.",
            "support.sign": "— Mahery, solo dev",
            // ===== Common quest-card labels =====
            "common.daily": "DAILY", "common.weekly": "WEEKLY", "common.special": "SPECIAL",
            "common.easy": "EASY", "common.medium": "MEDIUM", "common.hard": "HARD", "common.extreme": "EXTREME",
            "common.completed": "COMPLETED", "common.duration": "DURATION", "common.difficulty": "DIFFICULTY", "common.sets_reps": "SETS/REPS",
            // ===== Quest cards (workouts) =====
            "quest.reward_xp": "REWARD XP", "quest.stat_boost": "STAT BOOST", "quest.start_quest": "START QUEST",
            "quest.accept_challenge": "ACCEPT CHALLENGE", "quest.view_progress": "VIEW PROGRESS", "quest.progress": "PROGRESS",
            "quest.push_day_title": "PUSH DAY PROTOCOL",
            "quest.push_day_desc": "Complete chest, shoulders, and triceps training to increase your pushing power.",
            "quest.pull_day_title": "PULL DAY PROTOCOL",
            "quest.pull_day_desc": "Train your back and biceps to develop pulling strength like a true hunter.",
            "quest.leg_day_title": "LEG DAY DESTROYER",
            "quest.leg_day_desc": "Build powerful legs that can carry you through any dungeon.",
            "quest.monarch_trial_title": "SHADOW MONARCH'S TRIAL",
            "quest.monarch_trial_desc": "Complete all daily quests for 7 consecutive days. Only the strongest survive.",
            "quest.reps_challenge_title": "100 REPS CHALLENGE",
            "quest.reps_challenge_desc": "Complete 100 reps of each: Push-ups, Squats, Sit-ups. A trial worthy of S-Rank hunters.",
            "quest.core_fort_title": "CORE FORTIFICATION",
            "quest.core_fort_desc": "Strengthen your core to withstand any attack. Essential for hunter survival.",
            // ===== Dashboard =====
            "dash.fallback_q1": "Complete 50 Push-ups", "dash.fallback_q2": "Complete 50 Squats", "dash.fallback_q3": "Run 5 kilometers",
            "dash.level_up": "You have reached Level {level}!",
            // ===== Progress =====
            "progress.req_level": "Reach Level {n}", "progress.req_workouts": "Complete {n} Workouts",
            "progress.req_streak": "{n}-Day Streak", "progress.req_str": "STR ≥ {n}", "progress.ach_unlocked": " Unlocked",
            // ===== Avatar =====
            "avatar.updated": "Avatar updated!",
            // ===== Profile =====
            "prof.set_notif": "Notifications", "prof.set_notif_desc": "Receive quest reminders and level up alerts",
            "prof.set_sound": "Sound Effects", "prof.set_sound_desc": "Play sounds for achievements and level ups",
            "prof.set_particles": "Particle Effects", "prof.set_particles_desc": "Show animated background particles",
            "prof.set_dark": "Dark Mode", "prof.set_dark_desc": "Use dark theme (default enabled)",
            "prof.set_rest": "Rest Day Reminders", "prof.set_rest_desc": "Get notified when you should take a rest day",
            "prof.title_rising": "★ RISING HUNTER ★", "prof.title_awakened": "THE AWAKENED",
            "prof.title_iron": "🔒 IRON WARRIOR", "prof.title_soldier": "🔒 SHADOW SOLDIER",
            "prof.title_gate": "🔒 GATE CRUSHER", "prof.title_demon": "🔒 DEMON SLAYER",
            "prof.title_srank": "🔒 S-RANK HUNTER", "prof.title_monarch": "🔒 SHADOW MONARCH",
            "prof.rank_badge": "{rank}-RANK HUNTER", "prof.saved": "PROFILE SAVED!",
            "prof.support": "SUPPORT THE DEV", "prof.signout": "SIGN OUT", "prof.signin": "SIGN IN"
        }
    };

    const I18n = {
        lang: 'fr',
        _listeners: [],

        init: function () {
            this.lang = (global.Hunter && global.Hunter.get('settings') && global.Hunter.get('settings').language) || 'en';
            if (this.lang !== 'fr') this.lang = 'en';   // EN par défaut
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
                'gym-guilds.html': 'nav.guilds', 'gym-inventory.html': 'nav.forge',
                'gym-profile.html': 'nav.profile', 'support.html': 'nav.support'
            };
            scope.querySelectorAll('a.nav-link').forEach(a => {
                // Normalise le href : Netlify "Pretty URLs" enlève le .html (gym-dashboard.html → gym-dashboard),
                // ce qui faisait échouer la correspondance et laissait la nav non traduite.
                let href = (a.getAttribute('href') || '').split('?')[0].split('#')[0].split('/').pop();
                if (href && href.slice(-5) !== '.html') href += '.html';
                const key = navMap[href];
                if (key) a.textContent = this.t(key);
            });
            document.documentElement.lang = this.lang;
        },

        setLang: function (lang, opts) {
            this.lang = lang === 'en' ? 'en' : 'fr';
            if (global.Hunter) global.Hunter.setSetting('language', this.lang);
            this.syncQuests();
            this.apply();
            this._listeners.forEach(cb => { try { cb(this.lang); } catch (e) {} });
            if (!opts || opts.reload !== false) {
                // Recharge pour que tout le contenu (y compris non balisé) se traduise
                setTimeout(() => global.location.reload(), 60);
            }
        },

        toggle: function () { this.setLang(this.lang === 'fr' ? 'en' : 'fr'); },

        onChange: function (cb) { this._listeners.push(cb); },

        // Synchronise les quêtes stockées avec la langue courante (mêmes exercices, traduits).
        // Idempotent et sûr à appeler à chaque chargement de page : corrige aussi le cas
        // "langue stockée ≠ langue de l'UI" (chargement à froid) en plus du clic FR/EN.
        syncQuests: function () {
            if (!global.QuestLibrary || !global.localStorage) return;
            const lang = this.lang;

            // 1) Quêtes du jour : retraduire EN PLACE via l'id d'exercice.
            //    L'ordre et les index sont conservés → 'completedDailyQuests' (suivi par index)
            //    reste valide, et l'XP/series/reps/durée/slName (neutres) ne changent pas.
            try {
                const dqRaw = localStorage.getItem('dailyQuests');
                if (dqRaw) {
                    const dq = JSON.parse(dqRaw);
                    if (Array.isArray(dq)) {
                        let changed = false;
                        dq.forEach(q => {
                            const ex = q && q.id && global.QuestLibrary.getExercise(q.id);
                            if (!ex) return;                       // ancien schéma sans id → laissé tel quel
                            const name = ex[lang];
                            const slName = (lang === 'en' && ex.slEn) ? ex.slEn : ex.sl;
                            if (q.name !== name || q.slName !== slName) changed = true;
                            q.name = name;
                            q.realName = name;
                            q.slName = slName;                     // nom d'ombre localisé
                            q.howto = ex[lang === 'en' ? 'hEn' : 'hFr'];
                            q.muscle = ex[lang === 'en' ? 'mEn' : 'mFr'];
                            q.description = (q.muscle || '') + (q.target ? ' · ' + q.target : '');
                        });
                        if (changed) localStorage.setItem('dailyQuests', JSON.stringify(dq));
                    }
                }
            } catch (e) { /* ignore */ }

            // 2) Hebdo / programme / nutrition : pas d'id → redérivés depuis l'objectif.
            //    Uniquement si la langue stockée diffère (évite toute dérive au fil des jours).
            //    On ne réécrit PAS dailyQuests ici (déjà traduit en place, sans reshuffle).
            try {
                let meta = null;
                const metaRaw = localStorage.getItem('protocolMeta');
                if (metaRaw) {
                    meta = JSON.parse(metaRaw);
                } else if (global.Hunter) {
                    // Pas de meta (ancien repli de setup / génération à la volée) → reconstruite depuis le profil.
                    const pr = global.Hunter.get('profile') || {};
                    meta = { objective: pr.objective, fitness: pr.fitness, rank: global.Hunter.get('rank') };
                }
                if (meta && meta.lang !== lang) {
                    meta.lang = lang;
                    const p = global.QuestLibrary.generateProtocol(meta);
                    localStorage.setItem('weeklyQuest', JSON.stringify(p.weeklyQuest));
                    localStorage.setItem('weeklySchedule', JSON.stringify(p.weeklySchedule));
                    localStorage.setItem('nutritionTips', JSON.stringify(p.nutritionTips));
                    localStorage.setItem('protocolMeta', JSON.stringify(p.meta));
                }
            } catch (e) { /* ignore */ }
        },

        // Bouton bascule FR | EN
        mountToggle: function (selector) {
            const host = typeof selector === 'string' ? document.querySelector(selector) : selector;
            if (!host) return;
            const btn = document.createElement('button');
            btn.className = 'sg-lang-toggle';
            btn.type = 'button';
            btn.innerHTML = `<span class="lang-opt ${this.lang === 'fr' ? 'on' : ''}" data-lang="fr">FR</span><span class="sep">|</span><span class="lang-opt ${this.lang === 'en' ? 'on' : ''}" data-lang="en">EN</span>`;
            // Sélecteur robuste : chaque option (FR / EN) est cliquable directement — cliquer EN met l'anglais, FR le français.
            btn.querySelectorAll('[data-lang]').forEach(function (span) {
                span.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const target = span.getAttribute('data-lang');
                    if (target !== I18n.lang) I18n.setLang(target);
                });
            });
            if (!document.getElementById('sg-lang-styles')) {
                const st = document.createElement('style');
                st.id = 'sg-lang-styles';
                st.textContent = `.sg-lang-toggle{background:transparent;border:1px solid rgba(133,172,185,.4);color:rgba(255,255,255,.5);
                    padding:4px 8px;cursor:pointer;font-family:inherit;font-size:.72em;letter-spacing:1px;white-space:nowrap;line-height:1;flex-shrink:0;}
                    .sg-lang-toggle:hover{border-color:#85acb9;} .sg-lang-toggle .on{color:#85acb9;font-weight:700;text-shadow:0 0 8px rgba(133,172,185,.5);}
                    .sg-lang-toggle .lang-opt{display:inline-block;padding:2px 5px;cursor:pointer;transition:color .15s;} .sg-lang-toggle .lang-opt:not(.on):hover{color:#fff;}
                    .sg-lang-toggle .sep{opacity:.35;}`;
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
