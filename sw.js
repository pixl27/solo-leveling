/**
 * SHADOW GYM - Service Worker (PWA hors-ligne)
 * Stratégies :
 *   - Navigation (pages)      → réseau d'abord, repli sur cache, puis start.html
 *   - Statique même origine   → cache d'abord + rafraîchissement en arrière-plan
 *   - Externe (CDN, Supabase) → réseau direct (non intercepté)
 */
const CACHE = 'shadow-gym-v4';

const APP_SHELL = [
    'start.html',
    'gym-index.html', 'gym-setup.html', 'gym-accept.html', 'gym-dashboard.html',
    'gym-workouts.html', 'gym-exercises.html', 'gym-progress.html', 'gym-profile.html',
    'gym-leaderboard.html', 'gym-challenges.html', 'gym-guilds.html', 'gym-inventory.html',
    'css/solo-leveling.css', 'css/gym.css',
    'js/config.js', 'js/store.js', 'js/equipment.js', 'js/i18n.js', 'js/cloud.js', 'js/ui.js',
    'js/auth-ui.js', 'js/avatars.js', 'js/quests.js', 'js/solo-leveling.js',
    'icon.svg', 'manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE)
            .then(c => c.addAll(APP_SHELL.map(u => new Request(u, { cache: 'reload' }))))
            .catch(() => {}) // tolérant : un fichier manquant ne bloque pas l'install
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // Externe (fonts Google, Font Awesome, esm.sh/Supabase) → on laisse passer
    if (url.origin !== self.location.origin) return;

    // Navigation → réseau d'abord
    if (req.mode === 'navigate') {
        e.respondWith(
            fetch(req)
                .then(res => { cachePut(req, res.clone()); return res; })
                .catch(() => caches.match(req).then(r => r || caches.match('start.html')))
        );
        return;
    }

    // Statique → cache d'abord, mise à jour en arrière-plan
    e.respondWith(
        caches.match(req).then(cached => {
            const network = fetch(req).then(res => { cachePut(req, res.clone()); return res; }).catch(() => cached);
            return cached || network;
        })
    );
});

function cachePut(req, res) {
    if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res)).catch(() => {});
}
