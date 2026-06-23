# 🗡️ SHADOW GYM

> Transforme ton entraînement en aventure **Solo Leveling**. Monte de niveau, gagne des rangs **E → S**, grimpe le **classement mondial** et défie d'autres Hunters dans l'**Arène**.

Application web (HTML/CSS/JS, sans framework) qui fonctionne **100 % en local hors-ligne** et se connecte à **Supabase** pour les fonctionnalités en ligne (comptes, classements temps réel, duels PvP).

---

## 🚀 Démarrage rapide (local)

Aucune installation. Sers le dossier avec n'importe quel serveur statique :

```bash
# Python
python -m http.server 8000
# ou Node
npx serve .
```

Puis ouvre **http://localhost:8000/start.html**

> Tel quel, l'app est entièrement jouable hors-ligne (progression sauvegardée dans le navigateur). Les classements affichent des **données de démo** tant que Supabase n'est pas configuré.

---

## 🌐 Passer en ligne (comptes + classements + challenges)

### 1. Créer un projet Supabase (gratuit)
1. Va sur **https://supabase.com** → *New project*.
2. Une fois créé : **Project Settings → API**, note :
   - **Project URL**
   - **anon public** key

### 2. Initialiser la base de données
Dans Supabase : **SQL Editor → New query**, colle le contenu de [`supabase/schema.sql`](supabase/schema.sql) et clique **Run**.
(Crée les tables `profiles` / `challenges`, la sécurité RLS et les automatismes.)

### 3. Activer le temps réel
**Database → Replication** → active *Realtime* sur les tables `profiles` et `challenges`.

### 4. Renseigner la config
Édite **`js/config.js`** :
```js
window.SHADOW_GYM_CONFIG = {
    SUPABASE_URL: 'https://xxxxx.supabase.co',   // ← ton Project URL
    SUPABASE_ANON_KEY: 'eyJhbGci...',            // ← ta clé anon public
    ...
};
```
> ✅ La clé **anon public** est faite pour être publique (protégée par les règles RLS). **Ne mets jamais** la clé `service_role` ici.

C'est tout. Recharge l'app : les comptes, la synchro multi-appareils, le classement temps réel et l'Arène PvP sont actifs.

---

## ☁️ Déployer sur Netlify

**Option A — Glisser-déposer (le plus simple)**
1. Va sur **https://app.netlify.com** → *Add new site → Deploy manually*.
2. Glisse le dossier du projet. C'est en ligne.

**Option B — Depuis GitHub (déploiement continu)**
1. Netlify → *Add new site → Import from Git* → choisis `pixl27/solo-leveling`.
2. Build command : *(vide)* · Publish directory : `.`
3. Deploy.

Le fichier [`netlify.toml`](netlify.toml) configure déjà la page d'accueil, les en-têtes de sécurité et le cache.

> Sur Supabase, ajoute l'URL Netlify dans **Authentication → URL Configuration** (Site URL + Redirect URLs) pour que la connexion par email fonctionne.

---

## 🧱 Architecture

| Fichier | Rôle |
|---------|------|
| `start.html` | Page d'accueil / routeur (nouveau vs joueur de retour) |
| `gym-index → setup → accept → dashboard` | Parcours d'éveil et hub principal |
| `gym-leaderboard.html` | Classement mondial (temps réel / démo) |
| `gym-challenges.html` | Arène PvP (duels XP / séances / séries) |
| `js/store.js` | **Moteur unifié** : XP, niveaux, rangs, stats, streak, succès + hooks cloud |
| `js/quests.js` | Bibliothèque de quêtes locale (remplace l'ancienne IA) |
| `js/cloud.js` | Adaptateur Supabase (auth, sync, classement, challenges, guildes) |
| `js/ui.js` | Notifications, overlays, sons synthétisés, particules, PWA |
| `js/auth-ui.js` | Modale de connexion / inscription |
| `js/i18n.js` | Mode **Français / Anglais** (bascule persistante) |
| `js/avatars.js` | Sélecteur d'avatar (icône + couleur) |
| `js/weekly.js` | Défi hebdomadaire mondial automatique (rotation par semaine) |
| `gym-guilds.html` | **Guildes** : fonder/rejoindre, classement de guilde |
| `js/config.js` | **Seul fichier à éditer** pour activer le cloud |
| `supabase/schema.sql` | Schéma base de données + sécurité RLS |
| `sw.js` / `manifest.json` | PWA installable + hors-ligne |

### Progression
- **XP** : 100 × niveau pour passer au niveau suivant.
- **Rangs** : E → D → C → B → A → S (exigent niveau **+** séances **+** force).
- **Puissance de combat** : métrique unique de classement (niveau, stats, série, séances, rang).

---

## 🔒 Sécurité
- ❌ L'ancienne clé API OpenRouter exposée en clair a été **supprimée** (remplacée par la bibliothèque locale `js/quests.js`).
- ✅ Pense à **révoquer** cette ancienne clé sur OpenRouter par précaution.
- ✅ Données en ligne protégées par **Row Level Security** (chacun ne modifie que son profil).

---

## 📱 PWA
L'app est **installable** (mobile/desktop) et fonctionne hors-ligne grâce au service worker. Sur mobile : *Ajouter à l'écran d'accueil*.
