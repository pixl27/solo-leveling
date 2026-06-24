/**
 * SHADOW GYM - Configuration
 * ==========================================================
 *  >>> C'EST LE SEUL FICHIER QUE TU DOIS MODIFIER POUR PASSER EN LIGNE <<<
 *
 *  1. Crée un projet gratuit sur https://supabase.com
 *  2. Project Settings → API → copie :
 *       - "Project URL"        → colle dans SUPABASE_URL
 *       - "anon public key"    → colle dans SUPABASE_ANON_KEY
 *  3. Dans Supabase, ouvre "SQL Editor" et exécute le fichier supabase/schema.sql
 *  4. Database → Replication : active Realtime sur `profiles` et `challenges`
 *
 *  ⚠️ La clé "anon public" est FAITE pour être publique (protégée par les
 *     règles RLS du schéma). Ne mets JAMAIS la clé "service_role" ici.
 *
 *  Tant que ces valeurs restent des placeholders, l'app fonctionne à 100%
 *  en local (mode hors-ligne) et les classements affichent une démo.
 * ==========================================================
 */
window.SHADOW_GYM_CONFIG = {
    SUPABASE_URL: 'https://gghadbiyytwxgchafhez.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_E7X-rGDsi1s3VFqvjJUkHQ_cuWsDzFY',

    // Réglages divers
    APP_NAME: 'SHADOW GYM',
    DEFAULT_LANGUAGE: 'en'
};

// Détecte si le cloud est réellement configuré (pas les placeholders)
window.isCloudConfigured = function () {
    const c = window.SHADOW_GYM_CONFIG;
    return !!c &&
        typeof c.SUPABASE_URL === 'string' &&
        c.SUPABASE_URL.indexOf('VOTRE-PROJET') === -1 &&
        c.SUPABASE_URL.startsWith('http') &&
        typeof c.SUPABASE_ANON_KEY === 'string' &&
        c.SUPABASE_ANON_KEY.indexOf('VOTRE_CLE') === -1 &&
        c.SUPABASE_ANON_KEY.length > 20;
};
