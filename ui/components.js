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
            <div class="cpj-modal-header" id="cpj-header-drag"><h2 class="cpj-modal-title">${ic.igloo || ''} IglooLiker 3000 ${ic.heartBadge || ''}</h2><div style="display:flex;gap:6px;"><button class="cpj-circle-btn" id="cpj-btn-min" title="Minimizar">${ic.minimize || ''}</button><button class="cpj-circle-btn" id="cpj-btn-close" title="Fechar">${ic.close || ''}</button></div></div>
            <div class="cpj-modal-content">
                <div class="cpj-status-bar"><div><span class="cpj-status-dot active"></span><span>IglooLiker 3000</span></div><div><span class="cpj-status-dot" id="cpj-dot-status"></span><span id="cpj-text-status">Ready</span></div></div>
                <div class="cpj-lang-wrap"><button class="cpj-lang-btn" id="cpj-btn-lang"><span id="cpj-txt-lang">Language: English (USA)</span><svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 10l5 5 5-5z" fill="#00e5ff"/></svg></button><div class="cpj-lang-menu" id="cpj-menu-lang"><div class="cpj-lang-item" data-lang="en"><span>English (USA)</span><span>EN</span></div><div class="cpj-lang-item" data-lang="pt"><span>Português (Brasil)</span><span>PT-BR</span></div></div></div>
                <div class="cpj-likes-card">
                    <div class="cpj-likes-header"><span id="cpj-lbl-prog">${ic.iglooClassic || ic.igloo || ''} Igloo Likes Progression</span><span class="cpj-percent-badge" id="cpj-badge-percent">00.00%</span></div>
                    <div class="cpj-numbers-row"><div class="cpj-number-box"><span class="cpj-number-tag" id="cpj-tag-likes">Current Likes</span><input type="text" inputmode="numeric" id="cpj-input-likes" class="cpj-input-likes-pill" value="${this.state.get('currentLikes')}"></div><span style="font-size:20px;color:#00e5ff;font-weight:700;margin-top:14px;">/</span><div class="cpj-number-box"><span class="cpj-number-tag" id="cpj-tag-goal">Target Goal</span><input type="text" inputmode="numeric" id="cpj-input-goal" class="cpj-input-goal-pill" value="${this.state.get('targetGoal')}"></div></div>
                    <div class="cpj-goal-error-banner" id="cpj-err-box"></div><div class="cpj-progress-track"><div class="cpj-progress-fill" id="cpj-prog-fill" style="width:0%;"></div></div>
                    <div class="cpj-ratio-footer"><span id="cpj-lbl-lcount">0 likes</span><span id="cpj-lbl-gcount">Goal: 1000</span></div>
                </div>
                <div class="cpj-tabs-bar"><button class="cpj-tab-btn active" data-tab="phrases" id="cpj-tb-phrases">Phrases</button><button class="cpj-tab-btn" data-tab="actions" id="cpj-tb-actions">Actions</button><button class="cpj-tab-btn" data-tab="studio" id="cpj-tb-studio">Studio</button></div>
                <div class="cpj-tab-panel active" id="cpj-pnl-phrases"><div class="cpj-checkbox-row ${this.state.get('rotatePhrases') ? 'checked' : ''}" id="cpj-row-rotate"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-rotate">Rotate like phrases</span></div><div class="cpj-checkbox-row ${this.state.get('randomDelay') ? 'checked' : ''}" id="cpj-row-jitter"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-jitter">Random anti-spam (9s to 11s)</span></div><div class="cpj-checkbox-row ${this.state.get('deactivatePhrases') ? 'checked' : ''}" id="cpj-row-deact"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-deact">Deactivate phrases (Silent mode)</span></div><div style="background:#003b70;border:1.5px solid #00e5ff;border-radius:10px;padding:8px;margin-top:6px;font-size:12px;"><div style="font-size:10px;color:#8edeff;font-weight:700;text-transform:uppercase;" id="cpj-lbl-next">Next Message:</div><div id="cpj-txt-next" style="word-break:break-word;">""</div></div></div>
                <div class="cpj-tab-panel" id="cpj-pnl-actions"><div class="cpj-checkbox-row ${this.state.get('autoDance') ? 'checked' : ''}" id="cpj-row-dance"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-dance">Auto-Dance ('D')</span></div><div class="cpj-checkbox-row ${this.state.get('autoWave') ? 'checked' : ''}" id="cpj-row-wave"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-wave">Auto-Wave ('W')</span></div><div class="cpj-checkbox-row ${this.state.get('repeatAction') ? 'checked' : ''}" id="cpj-row-repeat"><div class="cpj-checkbox-box">${ic.check || ''}</div><span id="cpj-lbl-repeat">Repeat action continuously</span></div><div class="cpj-slider-container ${this.state.get('repeatAction') ? '' : 'hidden'}" id="cpj-slider-box"><div class="cpj-slider-header"><span id="cpj-lbl-slider">Action Interval:</span><span class="cpj-slider-pill" id="cpj-val-slider">${this.state.get('actionInterval')}s</span></div><div class="cpj-slider-track-wrap" id="cpj-track-wrap-act" style="position:relative!important;width:100%!important;height:30px!important;display:flex!important;align-items:center!important;margin:4px 0!important;user-select:none!important;box-sizing:border-box!important;cursor:pointer!important;"><div class="cpj-slider-visual-track" style="position:absolute!important;left:0!important;right:0!important;top:50%!important;transform:translateY(-50%)!important;height:16px!important;background:#ffffff!important;border:2px solid #00284d!important;border-radius:8px!important;box-shadow:inset 0 2px 4px rgba(0,0,0,0.4)!important;overflow:hidden!important;pointer-events:none!important;box-sizing:border-box!important;z-index:1!important;"><div class="cpj-slider-visual-fill" id="cpj-visual-fill" style="height:100%!important;width:calc(14px + (100% - 28px) * ${(this.state.get('actionInterval') - 5) / 5});background:#ff8800!important;border-radius:6px 0 0 6px!important;pointer-events:none!important;"></div></div><div class="cpj-slider-visual-thumb" id="cpj-visual-thumb" style="position:absolute!important;top:50%!important;left:calc(14px + (100% - 28px) * ${(this.state.get('actionInterval') - 5) / 5});transform:translate(-50%,-50%)!important;pointer-events:none!important;z-index:2!important;cursor:pointer!important;"></div><input type="range" min="5" max="10" step="1" value="${this.state.get('actionInterval')}" class="cpj-snow-slider" id="cpj-slider-act" style="position:absolute!important;left:0!important;top:0!important;width:100%!important;height:100%!important;opacity:0!important;pointer-events:none!important;margin:0!important;padding:0!important;z-index:3!important;-webkit-appearance:none!important;-moz-appearance:none!important;appearance:none!important;"></div><div style="display:flex;justify-content:space-between;font-size:10px;color:#8edeff;font-weight:700;margin-top:4px;"><span>5s</span><span>10s</span></div></div></div>
                <div class="cpj-tab-panel" id="cpj-pnl-studio"><div class="cpj-studio-msg hidden" id="cpj-msg-studio"></div><div class="cpj-studio-input-wrap"><input type="text" class="cpj-studio-input" id="cpj-inp-studio" placeholder="Type new phrase..." maxlength="100"><button class="cpj-btn-add" id="cpj-btn-add">+ ADD</button></div><div class="cpj-phrase-list" id="cpj-list-phrases"></div><div style="font-size:11px;color:#8edeff;font-weight:700;text-align:right;" id="cpj-cap-studio">Slots: 4/6</div></div>
                <div class="cpj-actions-wrapper"><button class="cpj-btn-main cpj-btn-start" id="cpj-btn-power">${ic.play || ''} <span id="cpj-txt-power">START BOT</span></button><div class="cpj-footer-credits">Version 3.2.0 Made by <a href="https://github.com/caiovski" target="_blank" rel="noopener noreferrer" class="cpj-author-link">Caiovski</a></div></div>
            </div>`;
        document.body.appendChild(modal);
        this.modalEl = modal;
        this.bindEvents(ic);
        this.updateAll();
    }

    renderLauncher(ic) {
        if (document.getElementById('cpj-floating-launcher-btn')) return;
        const btn = document.createElement('div');
        btn.id = 'cpj-floating-launcher-btn'; btn.className = 'cpj-floating-launcher'; btn.title = 'IglooLiker 3000 (F9)';
        btn.innerHTML = ic.igloo || '';
        document.body.appendChild(btn);

        let isDown = false, moved = false, sX = 0, sY = 0, offX = 0, offY = 0, justMoved = false;
        const getP = () => (this.state?.currentPenguin || this.state?.get?.('currentPenguin')) || '_default';
        this.restoreLauncherPos = () => {
            try {
                const raw = sessionStorage.getItem('cpj_launcher_pos_' + getP());
                if (raw) {
                    const pos = JSON.parse(raw);
                    if (typeof pos.left === 'number' && typeof pos.top === 'number') {
                        const mx = Math.max(0, window.innerWidth - (btn.offsetWidth || 72)), my = Math.max(0, window.innerHeight - (btn.offsetHeight || 72));
                        btn.style.setProperty('left', `${Math.max(0, Math.min(mx, pos.left))}px`, 'important'); btn.style.setProperty('top', `${Math.max(0, Math.min(my, pos.top))}px`, 'important');
                        btn.style.setProperty('right', 'auto', 'important'); btn.style.setProperty('bottom', 'auto', 'important'); return;
                    }
                }
            } catch (e) {}
            btn.style.removeProperty('left'); btn.style.removeProperty('bottom');
            btn.style.setProperty('top', '15px', 'important'); btn.style.setProperty('right', '38px', 'important');
        };
        btn.onpointerdown = (e) => {
            isDown = true; moved = false; sX = e.clientX; sY = e.clientY;
            const r = btn.getBoundingClientRect(); offX = e.clientX - r.left; offY = e.clientY - r.top;
            try { btn.setPointerCapture(e.pointerId); } catch(ex){}
            btn.classList.add('is-dragging'); e.stopPropagation();
        };
        btn.onpointermove = (e) => {
            if (!isDown) return;
            if (Math.hypot(e.clientX - sX, e.clientY - sY) > 5) moved = true;
            if (moved) {
                const mx = Math.max(0, window.innerWidth - (btn.offsetWidth || 72)), my = Math.max(0, window.innerHeight - (btn.offsetHeight || 72));
                btn.style.setProperty('left', `${Math.max(0, Math.min(mx, e.clientX - offX))}px`, 'important'); btn.style.setProperty('top', `${Math.max(0, Math.min(my, e.clientY - offY))}px`, 'important');
                btn.style.setProperty('right', 'auto', 'important'); btn.style.setProperty('bottom', 'auto', 'important');
            }
            e.stopPropagation();
        };
        const posModal = () => {
            if (!this.modalEl || !btn) return;
            const lr = btn.getBoundingClientRect(), mw = this.modalEl.offsetWidth || 370, mh = this.modalEl.offsetHeight || 500, maxTop = window.innerHeight - mh - 12;
            let top = lr.bottom + 10; if (top > maxTop) top = (lr.top - mh - 10 >= 10) ? (lr.top - mh - 10) : Math.max(10, maxTop);
            let left = Math.max(10, Math.min(window.innerWidth - mw - 10, (lr.left + lr.width / 2 > window.innerWidth / 2) ? (lr.right - mw) : lr.left));
            this.modalEl.style.left = `${Math.round(left)}px`; this.modalEl.style.top = `${Math.round(top)}px`; this.modalEl.style.right = this.modalEl.style.bottom = 'auto';
        };
        this.posModal = posModal;
        const onEnd = (e) => {
            if (!isDown) return;
            isDown = false; btn.classList.remove('is-dragging');
            try { btn.releasePointerCapture(e.pointerId); } catch(ex){}
            if (moved) {
                justMoved = true; setTimeout(() => { justMoved = false; }, 120);
                const r = btn.getBoundingClientRect();
                try { sessionStorage.setItem('cpj_launcher_pos_' + getP(), JSON.stringify({ left: Math.round(r.left), top: Math.round(r.top) })); } catch(ex){}
                if (this.modalEl && !this.modalEl.classList.contains('cpj-closed')) posModal();
            }
            e.stopPropagation();
        };
        btn.onpointerup = btn.onpointercancel = onEnd;
        btn.onclick = (e) => { e.stopPropagation(); if (justMoved) { justMoved = false; return; } if (this.modalEl?.classList.contains('cpj-closed')) posModal(); this.modalEl?.classList.toggle('cpj-closed'); };
        this.restoreLauncherPos(); window.addEventListener('resize', () => this.restoreLauncherPos());
    }

    bindEvents(ic) {
        const m = this.modalEl;
        ['mousedown', 'mouseup', 'click', 'dblclick', 'pointerdown', 'pointerup', 'pointercancel', 'touchstart', 'touchend', 'contextmenu'].forEach(evt => m.addEventListener(evt, e => e.stopPropagation(), false));
        m.querySelector('#cpj-btn-close').onclick = () => m.classList.add('cpj-closed');
        let min = false; m.querySelector('#cpj-btn-min').onclick = () => { min = !min; m.classList.toggle('minimized', min); m.querySelector('#cpj-btn-min').innerHTML = min ? (ic.maximize || '') : (ic.minimize || ''); };
        const h = m.querySelector('#cpj-header-drag'); let rDir = null, smX = 0, smY = 0, sRect = null;
        const setScale = (w, h) => m.style.setProperty('--cpj-scale', Math.max(0.75, Math.min(1.4, (w / 380) * 0.6 + (h / 500) * 0.4)).toFixed(3));
        h.onmousedown = (e) => {
            if (e.target.closest('.cpj-circle-btn')) return;
            this.isDragging = true; smX = e.clientX; smY = e.clientY; sRect = m.getBoundingClientRect(); m.style.right = m.style.bottom = 'auto'; e.preventDefault();
        };
        m.querySelectorAll('.cpj-resizer').forEach(el => {
            el.onmousedown = (e) => { e.preventDefault(); e.stopPropagation(); rDir = el.getAttribute('data-dir'); smX = e.clientX; smY = e.clientY; sRect = m.getBoundingClientRect(); m.style.right = m.style.bottom = 'auto'; };
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
                if (rDir.includes('w')) { const cW = sRect.width - dx; if (cW >= 260) { nW = cW; nL = sRect.left + dx; } else { nW = 260; nL = sRect.left + (sRect.width - 260); } }
                if (rDir.includes('s')) nH = Math.max(300, Math.min(window.innerHeight - 20 - sRect.top, sRect.height + dy));
                if (rDir.includes('n')) { const cH = sRect.height - dy; if (cH >= 300) { nH = cH; nT = sRect.top + dy; } else { nH = 300; nT = sRect.top + (sRect.height - 300); } }
                m.style.left = `${nL}px`; m.style.top = `${nT}px`; m.style.width = `${nW}px`; m.style.height = `${nH}px`; setScale(nW, nH);
            }
        }, true);

        window.addEventListener('mouseup', (e) => { if (this.isDragging || rDir) { e.preventDefault(); e.stopPropagation(); this.isDragging = false; rDir = null; } }, true);

        const lBtn = m.querySelector('#cpj-btn-lang'), lMenu = m.querySelector('#cpj-menu-lang');
        lBtn.onclick = (e) => { e.stopPropagation(); lMenu.classList.toggle('open'); };
        lMenu.querySelectorAll('.cpj-lang-item').forEach(it => { it.onclick = () => { this.state.set('lang', it.getAttribute('data-lang')); lMenu.classList.remove('open'); this.updateAll(); }; });
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
        [['#cpj-row-rotate', 'rotatePhrases'], ['#cpj-row-jitter', 'randomDelay'], ['#cpj-row-deact', 'deactivatePhrases'], ['#cpj-row-dance', 'autoDance'], ['#cpj-row-wave', 'autoWave'], ['#cpj-row-repeat', 'repeatAction']].forEach(([id, k]) => { m.querySelector(id).onclick = () => { this.state.set(k, !this.state.get(k)); this.updateAll(); }; });

        const tw = m.querySelector('#cpj-track-wrap-act'), sl = m.querySelector('#cpj-slider-act');
        const setPos = (cx, isDrag) => {
            const r = tw?.getBoundingClientRect(); if (!r || r.width <= 0) return;
            const ratio = Math.max(0, Math.min(1, (cx - r.left) / r.width)), nv = Math.max(5, Math.min(10, Math.round(5 + ratio * 5)));
            const f = m.querySelector('#cpj-visual-fill'), th = m.querySelector('#cpj-visual-thumb'), ur = isDrag ? ratio : (nv - 5) / 5, pc = `calc(14px + (100% - 28px) * ${ur})`;
            if (f) f.style.setProperty('width', pc, 'important'); if (th) th.style.setProperty('left', pc, 'important');
            m.querySelector('#cpj-val-slider').textContent = `${nv}s`;
            this.state.set('actionInterval', nv); if (sl) sl.value = nv;
            if (!isDrag && this.state.get('isRunning') && this.state.get('repeatAction')) this.engine.startActionLoop();
        };
        let dragSl = false;
        const onMove = (e) => { if (dragSl) { setPos(e.clientX, true); e.preventDefault(); } };
        const onUp = (e) => { if (dragSl) { dragSl = false; window.removeEventListener('pointermove', onMove, true); window.removeEventListener('pointerup', onUp, true); setPos(e.clientX, false); } };
        if (tw) tw.onpointerdown = (e) => { dragSl = true; window.addEventListener('pointermove', onMove, true); window.addEventListener('pointerup', onUp, true); setPos(e.clientX, true); e.preventDefault(); e.stopPropagation(); };
        if (sl) sl.oninput = sl.onchange = (e) => { this.state.set('actionInterval', Number(e.target.value) || 7); this.updateSlider(); if (this.state.get('isRunning') && this.state.get('repeatAction')) this.engine.startActionLoop(); };

        let msgT = null;
        const showMsg = (txt, type) => {
            const el = m.querySelector('#cpj-msg-studio'); if (!el) return;
            if (msgT) clearTimeout(msgT);
            const path = type === 'success' ? 'M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.88 0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 3 7.59 9.41C7.21 9.79 7 10.3 7 10.83V19c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-.12z' : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z';
            el.className = `cpj-studio-msg ${type}`; el.innerHTML = `<div class="cpj-studio-msg-icon"><svg viewBox="0 0 24 24" width="11" height="11" fill="#fff"><path d="${path}"/></svg></div><span class="cpj-studio-msg-text">${txt}</span>`;
            msgT = setTimeout(() => { el.className = 'cpj-studio-msg hidden'; el.innerHTML = ''; msgT = null; }, 10000);
        };
        const doAdd = () => {
            const inp = m.querySelector('#cpj-inp-studio'); let val = (inp.value || '').trim();
            const ph = this.state.get('phrases') || [], isPt = this.state.get('lang') === 'pt';
            if (ph.length >= 6) return showMsg(isPt ? 'Não é possível adicionar novas frases pois atingiu a capacidade máxima.' : 'Cannot add new phrases because maximum capacity is reached.', 'error');
            if (!val) { showMsg(isPt ? 'Escreva algo no campo para inserir uma nova frase!' : 'Write something in the field to add a new phrase!', 'error'); return inp.focus(); }
            if (val && this.state.addPhrase(val)) { inp.value = ''; this.updateStudio(); showMsg(isPt ? 'Frase adicionada com sucesso!' : 'Phrase added successfully!', 'success'); }
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
        m.querySelector('#cpj-btn-power').onclick = () => { if (this.state.get('isRunning')) this.engine.stop(); else this.engine.start(); this.updateAll(); };
        window.addEventListener('keydown', (e) => { if (e.key === 'F9') { if (m.classList.contains('cpj-closed')) this.posModal?.(); m.classList.toggle('cpj-closed'); } });
        ['currentLikes', 'targetGoal', 'goalError', 'currentPenguin'].forEach(k => this.state.subscribe(k, () => { if (k === 'currentPenguin') this.restoreLauncherPos?.(); this.updateAll(); }));
    }

    updateSlider() {
        const s = this.modalEl.querySelector('#cpj-slider-act'), v = Number(s.value) || 7, pct = Math.max(0, Math.min(100, ((v - 5) / 5) * 100)), fac = pct / 100;
        const f = this.modalEl.querySelector('#cpj-visual-fill'), th = this.modalEl.querySelector('#cpj-visual-thumb'), pc = `calc(14px + (100% - 28px) * ${fac})`;
        if (f) f.style.setProperty('width', pc, 'important'); if (th) th.style.setProperty('left', pc, 'important');
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
        const t = dict[pt ? 'pt' : 'en'] || {}, ic = window.CP_ICONS || {}, run = this.state.get('isRunning'), deact = this.state.get('deactivatePhrases');
        m.querySelector('#cpj-txt-lang').textContent = t.langLabel || 'Language: English';
        m.querySelector('#cpj-lbl-prog').innerHTML = `${ic.iglooClassic || ic.igloo || ''} ${t.iglooProgress || 'Progression'}`;
        m.querySelector('#cpj-tag-likes').textContent = t.detectedLikes || 'Current Likes'; m.querySelector('#cpj-tag-goal').textContent = t.targetGoal || 'Target Goal';
        m.querySelector('#cpj-lbl-lcount').textContent = `${this.state.get('currentLikes')} ${t.likesUnit || 'likes'}`; m.querySelector('#cpj-lbl-gcount').textContent = `${t.goalUnit || 'Goal:'} ${this.state.get('targetGoal')}`;
        m.querySelector('#cpj-badge-percent').textContent = this.state.getPercentage(); m.querySelector('#cpj-prog-fill').style.width = `${this.state.getProgressRatio()}%`;
        const err = this.state.get('goalError'), box = m.querySelector('#cpj-err-box'); box.style.display = err ? 'block' : 'none'; box.textContent = err || '';
        Object.entries({ rotatePhrases: '#cpj-row-rotate', randomDelay: '#cpj-row-jitter', deactivatePhrases: '#cpj-row-deact', autoDance: '#cpj-row-dance', autoWave: '#cpj-row-wave', repeatAction: '#cpj-row-repeat' }).forEach(([k, sel]) => m.querySelector(sel)?.classList.toggle('checked', !!this.state.get(k)));
        m.querySelector('#cpj-slider-box')?.classList.toggle('hidden', !this.state.get('repeatAction'));
        m.querySelector('#cpj-dot-status').className = `cpj-status-dot ${run ? 'active' : ''}`;
        m.querySelector('#cpj-text-status').textContent = run ? (deact ? (t.statusSilent || 'Silent') : (t.statusActive || 'Active')) : (t.statusPaused || 'Paused');
        const btn = m.querySelector('#cpj-btn-power'); btn.className = `cpj-btn-main ${run ? 'cpj-btn-stop' : 'cpj-btn-start'}`; btn.innerHTML = `${run ? (ic.stop || '') : (ic.play || '')} <span id="cpj-txt-power">${run ? (t.stopBot || 'PAUSE BOT') : (t.startBot || 'START BOT')}</span>`;
        document.getElementById('cpj-floating-launcher-btn')?.classList.toggle('is-running', !!run); m.classList.toggle('is-running', !!run); this.updateSlider(); this.updateStudio();
    }
}
if (typeof module !== 'undefined' && module.exports) module.exports = { BoosterUI }; else window.BoosterUI = BoosterUI;
