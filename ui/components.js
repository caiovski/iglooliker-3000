/**
 * CPJ Igloo Likes AFK Booster - UI Components
 * Regra opsx-build: < 250 linhas, tabs, dropdown de idioma, slider neve/laranja e Studio CRUD.
 */
class BoosterUI {
    constructor(state, engine) {
        this.state = state; this.engine = engine; this.modalEl = null;
        this.isDragging = false; this.dragOffset = { x: 0, y: 0 };
    }

    render() {
        const ic = window.CP_ICONS || {};
        this.renderLauncher(ic);
        if (document.getElementById('cpj-igloo-booster-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'cpj-igloo-booster-modal';
        modal.className = 'cpj-booster-modal cpj-closed';
        modal.innerHTML = `
            <div class="cpj-resizer cpj-resizer-n" data-dir="n"></div><div class="cpj-resizer cpj-resizer-s" data-dir="s"></div><div class="cpj-resizer cpj-resizer-w" data-dir="w"></div><div class="cpj-resizer cpj-resizer-e" data-dir="e"></div><div class="cpj-resizer cpj-resizer-nw" data-dir="nw"></div><div class="cpj-resizer cpj-resizer-ne" data-dir="ne"></div><div class="cpj-resizer cpj-resizer-sw" data-dir="sw"></div><div class="cpj-resizer cpj-resizer-se" data-dir="se"></div>
            <div class="cpj-modal-header" id="cpj-header-drag">
                <h2 class="cpj-modal-title">${ic.igloo || ''} IglooLiker 3000</h2>
                <div style="display:flex;gap:6px;"><button class="cpj-circle-btn" id="cpj-btn-min" title="Minimizar">${ic.minimize || ''}</button><button class="cpj-circle-btn" id="cpj-btn-close" title="Fechar">${ic.close || ''}</button></div>
            </div>
            <div class="cpj-modal-content">
                <div class="cpj-status-bar">
                    <div><span class="cpj-status-dot active"></span><span>IglooLiker 3000</span></div>
                    <div><span class="cpj-status-dot" id="cpj-dot-status"></span><span id="cpj-text-status">Ready</span></div>
                </div>
                <div class="cpj-lang-wrap">
                    <button class="cpj-lang-btn" id="cpj-btn-lang"><span id="cpj-txt-lang">Language: English (USA)</span><svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 10l5 5 5-5z" fill="#00e5ff"/></svg></button>
                    <div class="cpj-lang-menu" id="cpj-menu-lang"><div class="cpj-lang-item" data-lang="en"><span>English (USA)</span><span>EN</span></div><div class="cpj-lang-item" data-lang="pt"><span>Português (Brasil)</span><span>PT-BR</span></div></div>
                </div>
                <div class="cpj-likes-card">
                    <div class="cpj-likes-header"><span id="cpj-lbl-prog">${ic.igloo || ''} Igloo Likes Progression</span><span class="cpj-percent-badge" id="cpj-badge-percent">00.00%</span></div>
                    <div class="cpj-numbers-row">
                        <div class="cpj-number-box"><span class="cpj-number-tag" id="cpj-tag-likes">Current Likes</span><input type="text" inputmode="numeric" id="cpj-input-likes" class="cpj-input-likes-pill" value="${this.state.get('currentLikes')}"></div>
                        <span style="font-size:20px;color:#00e5ff;font-weight:700;margin-top:14px;">/</span>
                        <div class="cpj-number-box"><span class="cpj-number-tag" id="cpj-tag-goal">Target Goal</span><input type="text" inputmode="numeric" id="cpj-input-goal" class="cpj-input-goal-pill" value="${this.state.get('targetGoal')}"></div>
                    </div>
                    <div class="cpj-goal-error-banner" id="cpj-err-box"></div>
                    <div class="cpj-progress-track"><div class="cpj-progress-fill" id="cpj-prog-fill" style="width:0%;"></div></div>
                    <div class="cpj-ratio-footer"><span id="cpj-lbl-lcount">0 likes</span><span id="cpj-lbl-gcount">Goal: 1000</span></div>
                </div>
                <div class="cpj-tabs-bar"><button class="cpj-tab-btn active" data-tab="phrases" id="cpj-tb-phrases">Phrases</button><button class="cpj-tab-btn" data-tab="actions" id="cpj-tb-actions">Actions</button><button class="cpj-tab-btn" data-tab="studio" id="cpj-tb-studio">Studio</button></div>
                <div class="cpj-tab-panel active" id="cpj-pnl-phrases">
                    <div class="cpj-checkbox-row ${this.state.get('rotatePhrases') ? 'checked' : ''}" id="cpj-row-rotate"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-rotate">Rotate like phrases</span></div>
                    <div class="cpj-checkbox-row ${this.state.get('randomDelay') ? 'checked' : ''}" id="cpj-row-jitter"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-jitter">Random anti-spam (9s to 11s)</span></div>
                    <div class="cpj-checkbox-row ${this.state.get('deactivatePhrases') ? 'checked' : ''}" id="cpj-row-deact"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-deact">Deactivate phrases (Silent mode)</span></div>
                    <div style="background:#003b70;border:1.5px solid #00e5ff;border-radius:10px;padding:8px;margin-top:6px;font-size:12px;">
                        <div style="font-size:10px;color:#8edeff;font-weight:700;text-transform:uppercase;" id="cpj-lbl-next">Next Message:</div>
                        <div id="cpj-txt-next" style="word-break:break-word;">""</div>
                    </div>
                </div>
                <div class="cpj-tab-panel" id="cpj-pnl-actions">
                    <div class="cpj-checkbox-row ${this.state.get('autoDance') ? 'checked' : ''}" id="cpj-row-dance"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-dance">Auto-Dance ('D')</span></div>
                    <div class="cpj-checkbox-row ${this.state.get('autoWave') ? 'checked' : ''}" id="cpj-row-wave"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-wave">Auto-Wave ('W')</span></div>
                    <div class="cpj-checkbox-row ${this.state.get('repeatAction') ? 'checked' : ''}" id="cpj-row-repeat"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-repeat">Repeat action continuously</span></div>
                    <div class="cpj-slider-container ${this.state.get('repeatAction') ? '' : 'hidden'}" id="cpj-slider-box">
                        <div class="cpj-slider-header"><span id="cpj-lbl-slider">Action Interval:</span><span class="cpj-slider-pill" id="cpj-val-slider">${this.state.get('actionInterval')}s</span></div>
                        <input type="range" min="5" max="10" step="1" value="${this.state.get('actionInterval')}" class="cpj-snow-slider" id="cpj-slider-act">
                        <div style="display:flex;justify-content:space-between;font-size:10px;color:#8edeff;font-weight:700;margin-top:4px;"><span>5s</span><span>10s</span></div>
                    </div>
                </div>
                <div class="cpj-tab-panel" id="cpj-pnl-studio">
                    <div class="cpj-studio-input-wrap"><input type="text" class="cpj-studio-input" id="cpj-inp-studio" placeholder="Type new phrase..." maxlength="100"><button class="cpj-btn-add" id="cpj-btn-add">+ ADD</button></div>
                    <div class="cpj-phrase-list" id="cpj-list-phrases"></div>
                    <div style="font-size:11px;color:#8edeff;font-weight:700;text-align:right;" id="cpj-cap-studio">Slots: 4/6</div>
                </div>
                <div class="cpj-actions-wrapper"><button class="cpj-btn-main cpj-btn-start" id="cpj-btn-power">${ic.play || ''} <span id="cpj-txt-power">START BOT</span></button></div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modalEl = modal;
        this.bindEvents(ic);
        this.updateAll();
    }

    renderLauncher(ic) {
        if (document.getElementById('cpj-floating-launcher-btn')) return;
        const btn = document.createElement('div');
        btn.id = 'cpj-floating-launcher-btn';
        btn.className = 'cpj-floating-launcher';
        btn.title = 'IglooLiker 3000 (F9)';
        btn.innerHTML = ic.igloo || '';
        btn.onclick = () => this.modalEl?.classList.toggle('cpj-closed');
        document.body.appendChild(btn);
    }

    bindEvents(ic) {
        const m = this.modalEl, l = document.getElementById('cpj-floating-launcher-btn');
        ['mousedown', 'mouseup', 'click', 'dblclick', 'pointerdown', 'pointerup', 'pointercancel', 'touchstart', 'touchend', 'contextmenu'].forEach(evt => {
            m.addEventListener(evt, e => e.stopPropagation(), false);
            l?.addEventListener(evt, e => e.stopPropagation(), false);
        });

        m.querySelector('#cpj-btn-close').onclick = () => m.classList.add('cpj-closed');
        let min = false;
        m.querySelector('#cpj-btn-min').onclick = () => {
            min = !min; m.classList.toggle('minimized', min);
            m.querySelector('#cpj-btn-min').innerHTML = min ? (ic.maximize || '') : (ic.minimize || '');
        };

        const h = m.querySelector('#cpj-header-drag');
        let rDir = null, smX = 0, smY = 0, sRect = null;
        const setScale = (w, h) => m.style.setProperty('--cpj-scale', Math.max(0.75, Math.min(1.4, (w / 380) * 0.6 + (h / 500) * 0.4)).toFixed(3));

        h.onmousedown = (e) => {
            if (e.target.closest('.cpj-circle-btn')) return;
            this.isDragging = true; smX = e.clientX; smY = e.clientY; sRect = m.getBoundingClientRect();
            m.style.right = 'auto'; m.style.bottom = 'auto'; e.preventDefault();
        };

        m.querySelectorAll('.cpj-resizer').forEach(el => {
            el.onmousedown = (e) => {
                e.preventDefault(); e.stopPropagation(); rDir = el.getAttribute('data-dir');
                smX = e.clientX; smY = e.clientY; sRect = m.getBoundingClientRect();
                m.style.right = 'auto'; m.style.bottom = 'auto';
            };
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging || rDir) { e.preventDefault(); e.stopPropagation(); }
            if (this.isDragging && sRect) {
                const dx = e.clientX - smX, dy = e.clientY - smY;
                const mx = Math.max(0, window.innerWidth - sRect.width), my = Math.max(0, window.innerHeight - sRect.height);
                m.style.left = `${Math.max(0, Math.min(mx, sRect.left + dx))}px`;
                m.style.top = `${Math.max(0, Math.min(my, sRect.top + dy))}px`;
            } else if (rDir && sRect) {
                const dx = e.clientX - smX, dy = e.clientY - smY;
                let nL = sRect.left, nT = sRect.top, nW = sRect.width, nH = sRect.height;
                if (rDir.includes('e')) nW = Math.max(260, Math.min(window.innerWidth - 20 - sRect.left, sRect.width + dx));
                if (rDir.includes('w')) {
                    const cW = sRect.width - dx;
                    if (cW >= 260) { nW = cW; nL = sRect.left + dx; } else { nW = 260; nL = sRect.left + (sRect.width - 260); }
                }
                if (rDir.includes('s')) nH = Math.max(300, Math.min(window.innerHeight - 20 - sRect.top, sRect.height + dy));
                if (rDir.includes('n')) {
                    const cH = sRect.height - dy;
                    if (cH >= 300) { nH = cH; nT = sRect.top + dy; } else { nH = 300; nT = sRect.top + (sRect.height - 300); }
                }
                m.style.left = `${nL}px`; m.style.top = `${nT}px`; m.style.width = `${nW}px`; m.style.height = `${nH}px`;
                setScale(nW, nH);
            }
        }, true);

        window.addEventListener('mouseup', (e) => {
            if (this.isDragging || rDir) { e.preventDefault(); e.stopPropagation(); this.isDragging = false; rDir = null; }
        }, true);

        const lBtn = m.querySelector('#cpj-btn-lang'), lMenu = m.querySelector('#cpj-menu-lang');
        lBtn.onclick = (e) => { e.stopPropagation(); lMenu.classList.toggle('open'); };
        lMenu.querySelectorAll('.cpj-lang-item').forEach(it => {
            it.onclick = () => { this.state.set('lang', it.getAttribute('data-lang')); lMenu.classList.remove('open'); this.updateAll(); };
        });
        document.addEventListener('click', (e) => { if (!e.target.closest('.cpj-lang-wrap')) lMenu.classList.remove('open'); });
        m.querySelectorAll('.cpj-tab-btn').forEach(btn => {
            btn.onclick = () => {
                const t = btn.getAttribute('data-tab'); this.state.set('activeTab', t);
                m.querySelectorAll('.cpj-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
                m.querySelectorAll('.cpj-tab-panel').forEach(p => p.classList.toggle('active', p.id === `cpj-pnl-${t}`));
                if (t === 'actions') this.updateSlider();
            };
        });

        m.querySelector('#cpj-input-likes').oninput = (e) => this.state.updateLikes(parseInt(e.target.value.replace(/\D/g, ''), 10) || 0);
        m.querySelector('#cpj-input-goal').oninput = (e) => this.state.updateGoal(parseInt(e.target.value.replace(/\D/g, ''), 10) || 0);

        const bindCheck = (id, key) => { m.querySelector(id).onclick = () => { this.state.set(key, !this.state.get(key)); this.updateAll(); }; };
        [['#cpj-row-rotate', 'rotatePhrases'], ['#cpj-row-jitter', 'randomDelay'], ['#cpj-row-deact', 'deactivatePhrases'], ['#cpj-row-dance', 'autoDance'], ['#cpj-row-wave', 'autoWave'], ['#cpj-row-repeat', 'repeatAction']].forEach(([id, k]) => bindCheck(id, k));

        m.querySelector('#cpj-slider-act').oninput = (e) => { this.state.set('actionInterval', Number(e.target.value) || 7); this.updateSlider(); };
        const doAdd = () => {
            const inp = m.querySelector('#cpj-inp-studio');
            let val = (inp.value || '').trim();
            if (!val) val = (prompt(this.state.get('lang') === 'pt' ? 'Digite a frase:' : 'Type phrase:') || '').trim();
            if (val && this.state.addPhrase(val)) { inp.value = ''; this.updateStudio(); }
            inp.focus();
        };
        m.querySelector('#cpj-btn-add').onclick = doAdd;
        m.querySelector('#cpj-inp-studio').onkeydown = (e) => { if (e.key === 'Enter') doAdd(); };

        m.querySelector('#cpj-list-phrases').onclick = (e) => {
            const eye = e.target.closest('.eye'), del = e.target.closest('.del'), ed = e.target.closest('.edit');
            if (eye) { this.state.togglePhrase(Number(eye.getAttribute('data-idx'))); this.updateStudio(); }
            else if (del) { this.state.deletePhrase(Number(del.getAttribute('data-idx'))); this.updateStudio(); }
            else if (ed) {
                const idx = Number(ed.getAttribute('data-idx')), cur = this.state.get('phrases')[idx]?.text || '';
                const up = prompt(this.state.get('lang') === 'pt' ? 'Editar frase:' : 'Edit phrase:', cur);
                if (up) { this.state.editPhrase(idx, up); this.updateStudio(); }
            }
        };
        m.querySelector('#cpj-btn-power').onclick = () => {
            if (this.state.get('isRunning')) this.engine.stop(); else this.engine.start();
            this.updateAll();
        };
        window.addEventListener('keydown', (e) => { if (e.key === 'F9') m.classList.toggle('cpj-closed'); });
        ['currentLikes', 'targetGoal', 'goalError'].forEach(k => this.state.subscribe(k, () => this.updateAll()));
    }

    updateSlider() {
        const s = this.modalEl.querySelector('#cpj-slider-act'), v = Number(s.value) || 7, pct = Math.max(0, Math.min(100, ((v - 5) / 5) * 100));
        s.style.setProperty('background', `linear-gradient(to right, #ff8800 0%, #ff8800 ${pct}%, #ffffff ${pct}%, #ffffff 100%)`, 'important');
        this.modalEl.querySelector('#cpj-val-slider').textContent = `${v}s`;
    }

    updateStudio() {
        const list = this.modalEl.querySelector('#cpj-list-phrases'), phrases = this.state.get('phrases') || [], ic = window.CP_ICONS || {};
        list.innerHTML = phrases.map((p, i) => {
            const pObj = (typeof p === 'string') ? { text: p, enabled: true } : p, act = pObj.enabled !== false;
            return `<div class="cpj-phrase-item ${act ? '' : 'inactive'}"><span class="cpj-phrase-item-text"><b>${i + 1}.</b> "${pObj.text}"</span><div style="display:flex;gap:4px;align-items:center;"><button class="cpj-btn-mini eye ${act ? '' : 'inactive'}" data-idx="${i}" title="${act ? 'Active' : 'Inactive'}">${act ? (ic.eyeClosed || '') : (ic.eyeOpen || '')}</button><button class="cpj-btn-mini edit" data-idx="${i}" title="Edit">${ic.edit || ''}</button><button class="cpj-btn-mini del" data-idx="${i}" title="Delete">${ic.trash || ''}</button></div></div>`;
        }).join('');
        this.modalEl.querySelector('#cpj-cap-studio').textContent = `Slots: ${phrases.length}/6`;
        this.modalEl.querySelector('#cpj-btn-add').disabled = phrases.length >= 6;
        const active = phrases.filter(p => p.enabled !== false), next = this.modalEl.querySelector('#cpj-txt-next');
        if (next) next.textContent = active.length > 0 ? `"${active[0].text}"` : (this.state.get('lang') === 'pt' ? '"(Nenhuma frase ativada)"' : '"(No active phrase)"');
    }

    updateAll() {
        const m = this.modalEl; if (!m) return;
        const pt = this.state.get('lang') === 'pt', dict = (typeof window !== 'undefined' && window.CPJ_I18N) || (typeof CPJ_I18N !== 'undefined' ? CPJ_I18N : {});
        const t = dict[pt ? 'pt' : 'en'] || {}, ic = window.CP_ICONS || {};
        m.querySelector('#cpj-txt-lang').textContent = t.langLabel || 'Language: English';
        m.querySelector('#cpj-lbl-prog').innerHTML = `${ic.igloo || ''} ${t.iglooProgress || 'Progression'}`;
        m.querySelector('#cpj-tag-likes').textContent = t.detectedLikes || 'Current Likes';
        m.querySelector('#cpj-tag-goal').textContent = t.targetGoal || 'Target Goal';
        m.querySelector('#cpj-lbl-lcount').textContent = `${this.state.get('currentLikes')} ${t.likesUnit || 'likes'}`;
        m.querySelector('#cpj-lbl-gcount').textContent = `${t.goalUnit || 'Goal:'} ${this.state.get('targetGoal')}`;
        m.querySelector('#cpj-badge-percent').textContent = this.state.getPercentage();
        m.querySelector('#cpj-prog-fill').style.width = `${this.state.getProgressRatio()}%`;
        const err = this.state.get('goalError'), box = m.querySelector('#cpj-err-box');
        box.style.display = err ? 'block' : 'none'; box.textContent = err || '';
        const rows = { rotatePhrases: '#cpj-row-rotate', randomDelay: '#cpj-row-jitter', deactivatePhrases: '#cpj-row-deact', autoDance: '#cpj-row-dance', autoWave: '#cpj-row-wave', repeatAction: '#cpj-row-repeat' };
        Object.entries(rows).forEach(([k, sel]) => m.querySelector(sel)?.classList.toggle('checked', !!this.state.get(k)));
        m.querySelector('#cpj-slider-box')?.classList.toggle('hidden', !this.state.get('repeatAction'));
        const run = this.state.get('isRunning'), deact = this.state.get('deactivatePhrases');
        m.querySelector('#cpj-dot-status').className = `cpj-status-dot ${run ? 'active' : ''}`;
        m.querySelector('#cpj-text-status').textContent = run ? (deact ? (t.statusSilent || 'Silent') : (t.statusActive || 'Active')) : (t.statusPaused || 'Paused');
        const btn = m.querySelector('#cpj-btn-power');
        btn.className = `cpj-btn-main ${run ? 'cpj-btn-stop' : 'cpj-btn-start'}`;
        btn.innerHTML = `${run ? (ic.stop || '') : (ic.play || '')} <span id="cpj-txt-power">${run ? (t.stopBot || 'PAUSE BOT') : (t.startBot || 'START BOT')}</span>`;
        this.updateSlider(); this.updateStudio();
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { BoosterUI }; else window.BoosterUI = BoosterUI;
