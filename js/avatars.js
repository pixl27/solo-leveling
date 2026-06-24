/**
 * SHADOW GYM - Sélecteur d'avatar
 * ================================
 * Modale de choix d'icône + couleur, avec aperçu live.
 * Sauvegarde dans le moteur (Hunter.setAvatar) → synchro cloud automatique.
 *
 * Usage : Avatars.open(); ou Avatars.open({ onSave: fn });
 */
(function (global) {
    'use strict';

    const ICONS = [
        'fa-user-ninja', 'fa-ghost', 'fa-dragon', 'fa-skull', 'fa-skull-crossbones', 'fa-mask',
        'fa-user-secret', 'fa-hat-wizard', 'fa-cat', 'fa-dog', 'fa-crow', 'fa-spider',
        'fa-paw', 'fa-bolt', 'fa-fire', 'fa-khanda', 'fa-chess-knight', 'fa-jedi',
        'fa-user-astronaut', 'fa-robot', 'fa-meteor', 'fa-hand-fist', 'fa-shield-halved', 'fa-crown'
    ];
    const COLORS = ['#85acb9', '#9c27b0', '#ffd700', '#4caf50', '#ff4757', '#03a9f4', '#ff9800', '#ffffff'];

    function injectStyles() {
        if (document.getElementById('sg-avatar-styles')) return;
        const s = document.createElement('style');
        s.id = 'sg-avatar-styles';
        s.textContent = `
            .sg-av-back { position: fixed; inset: 0; background: rgba(2,6,12,.85); backdrop-filter: blur(6px); z-index: 11000;
                display: flex; align-items: center; justify-content: center; animation: sgFadeIn .25s ease-out; padding: 16px; }
            .sg-av-modal { width: 420px; max-width: 94vw; background: rgba(8,14,24,.97); border: 2px solid #85acb9;
                box-shadow: 0 0 40px rgba(133,172,185,.4); padding: 26px; position: relative; animation: sgScaleIn .3s ease-out; }
            .sg-av-modal h2 { color: #fff; text-align: center; letter-spacing: 3px; margin: 0 0 18px; font-size: 1.2em; }
            .sg-av-preview { width: 84px; height: 84px; border-radius: 50%; border: 3px solid; margin: 0 auto 18px;
                display: flex; align-items: center; justify-content: center; font-size: 2.4em; }
            .sg-av-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 16px; }
            .sg-av-ic { aspect-ratio: 1; border: 1px solid rgba(133,172,185,.3); display: flex; align-items: center; justify-content: center;
                color: rgba(255,255,255,.7); cursor: pointer; font-size: 1.1em; transition: all .15s; background: transparent; }
            .sg-av-ic:hover { border-color: #85acb9; color: #fff; }
            .sg-av-ic.sel { border-color: #fff; background: rgba(133,172,185,.25); color: #fff; box-shadow: 0 0 12px rgba(133,172,185,.5); }
            .sg-av-colors { display: flex; gap: 10px; justify-content: center; margin-bottom: 22px; flex-wrap: wrap; }
            .sg-av-col { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all .15s; }
            .sg-av-col.sel { border-color: #fff; transform: scale(1.18); }
            .sg-av-actions { display: flex; gap: 10px; }
            .sg-av-btn { flex: 1; padding: 12px; border: 1px solid #85acb9; background: rgba(133,172,185,.15); color: #fff;
                letter-spacing: 2px; cursor: pointer; font-family: inherit; font-size: .85em; transition: all .2s; }
            .sg-av-btn:hover { background: rgba(133,172,185,.3); }
            .sg-av-btn.cancel { border-color: rgba(255,255,255,.2); background: transparent; color: rgba(255,255,255,.6); }
        `;
        document.head.appendChild(s);
    }

    const Avatars = {
        ICONS: ICONS, COLORS: COLORS,
        open: function (opts) {
            opts = opts || {};
            injectStyles();
            const H = global.Hunter;
            let icon = (opts.icon) || (H && H.get('avatar')) || ICONS[0];
            let color = (opts.color) || (H && H.get('avatarColor')) || COLORS[0];
            const isFr = !global.I18n || I18n.lang === 'fr';

            const back = document.createElement('div');
            back.className = 'sg-av-back';
            back.innerHTML = `
                <div class="sg-av-modal">
                    <h2>${isFr ? 'CHOISIS TON AVATAR' : 'CHOOSE YOUR AVATAR'}</h2>
                    <div class="sg-av-preview" id="sgAvPrev"></div>
                    <div class="sg-av-grid" id="sgAvGrid"></div>
                    <div class="sg-av-colors" id="sgAvCols"></div>
                    <div class="sg-av-actions">
                        <button class="sg-av-btn cancel" id="sgAvCancel">${isFr ? 'ANNULER' : 'CANCEL'}</button>
                        <button class="sg-av-btn" id="sgAvSave">${isFr ? 'VALIDER' : 'SAVE'}</button>
                    </div>
                </div>`;
            document.body.appendChild(back);

            const prev = back.querySelector('#sgAvPrev');
            const grid = back.querySelector('#sgAvGrid');
            const cols = back.querySelector('#sgAvCols');

            function renderPreview() {
                prev.style.borderColor = color; prev.style.color = color;
                prev.innerHTML = `<i class="fas ${icon}"></i>`;
            }
            grid.innerHTML = ICONS.map(ic => `<button class="sg-av-ic${ic === icon ? ' sel' : ''}" data-ic="${ic}"><i class="fas ${ic}"></i></button>`).join('');
            cols.innerHTML = COLORS.map(c => `<div class="sg-av-col${c === color ? ' sel' : ''}" data-col="${c}" style="background:${c};"></div>`).join('');
            renderPreview();

            grid.addEventListener('click', e => {
                const b = e.target.closest('.sg-av-ic'); if (!b) return;
                icon = b.dataset.ic;
                grid.querySelectorAll('.sg-av-ic').forEach(x => x.classList.toggle('sel', x === b));
                renderPreview();
            });
            cols.addEventListener('click', e => {
                const b = e.target.closest('.sg-av-col'); if (!b) return;
                color = b.dataset.col;
                cols.querySelectorAll('.sg-av-col').forEach(x => x.classList.toggle('sel', x === b));
                renderPreview();
            });

            const close = () => back.remove();
            back.querySelector('#sgAvCancel').onclick = close;
            back.onclick = e => { if (e.target === back) close(); };
            back.querySelector('#sgAvSave').onclick = () => {
                if (H && H.setAvatar) H.setAvatar(icon, color);
                if (global.GymUI && GymUI.toast) GymUI.toast(global.I18n ? I18n.t('avatar.updated') : 'Avatar updated!', 'xp');
                if (opts.onSave) opts.onSave(icon, color);
                close();
            };
        }
    };

    global.Avatars = Avatars;
})(typeof window !== 'undefined' ? window : this);
