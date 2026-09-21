/**
 * CPJ Igloo Likes AFK Booster - UI Components
 * Regra opsx-build: < 250 linhas, livre movimentação X/Y, meta sem spinners e erro.
 */

class BoosterUI {
    constructor(state, engine) {
        this.state = state;
        this.engine = engine;
        this.modalEl = null;
        this.launcherEl = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    render() {
        const icons = window.CP_ICONS || {};
        this.renderLauncher(icons);

        if (document.getElementById('cpj-igloo-booster-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'cpj-igloo-booster-modal';
        // Nasce fechada conforme solicitado pelo usuário
        modal.className = 'cpj-booster-modal cpj-closed';

        modal.innerHTML = `
            <div class="cpj-modal-header" id="cpj-header-drag">
                <h2 class="cpj-modal-title">${icons.igloo || ''} IglooLiker 3000</h2>
                <div style="display:flex;gap:6px;">
                    <button class="cpj-circle-btn" id="cpj-btn-minimize" title="Minimizar">${icons.minimize || ''}</button>
                    <button class="cpj-circle-btn" id="cpj-btn-close" title="Fechar">${icons.close || ''}</button>
                </div>
            </div>

            <div class="cpj-modal-content">
                <div class="cpj-status-bar">
                    <div><span class="cpj-status-dot active"></span><span>IglooLiker 3000</span></div>
                    <div><span class="cpj-status-dot" id="cpj-dot-status"></span><span id="cpj-text-status">Parado</span></div>
                </div>

                <div class="cpj-likes-card">
                    <div class="cpj-likes-header">
                        <span>${icons.igloo || ''} Progresso do Iglu</span>
                        <span class="cpj-percent-badge" id="cpj-badge-percent">00.00%</span>
                    </div>

                    <div class="cpj-numbers-row">
                        <div class="cpj-number-box">
                            <span class="cpj-number-tag">Likes Atuais</span>
                            <input type="text" inputmode="numeric" id="cpj-input-likes" class="cpj-input-likes-pill" value="${this.state.get('currentLikes')}" title="Detectado da conta ou digite manualmente">
                        </div>
                        <span style="font-size:20px;color:#00e5ff;font-weight:700;margin-top:14px;">/</span>
                        <div class="cpj-number-box">
                            <span class="cpj-number-tag">Meta (Editar)</span>
                            <input type="text" inputmode="numeric" id="cpj-input-goal" class="cpj-input-goal-pill" value="${this.state.get('targetGoal')}">
                        </div>
                    </div>

                    <div class="cpj-goal-error-banner" id="cpj-goal-error-box"></div>

                    <div class="cpj-progress-track">
                        <div class="cpj-progress-fill" id="cpj-progress-fill"></div>
                    </div>
                    <div class="cpj-progress-text">
                        <span id="cpj-text-likes-count">0 curtidas</span>
                        <span id="cpj-text-goal-count">Meta: ${this.state.get('targetGoal')}</span>
                    </div>
                </div>

                <div class="cpj-checkbox-row ${this.state.get('autoDance') ? 'checked' : ''}" id="cpj-opt-dance">
                    <div class="cpj-checkbox-box">${icons.check || ''}</div>
                    <span>Auto-Dançar ('D')</span>
                </div>
                <div class="cpj-checkbox-row ${this.state.get('rotatePhrases') ? 'checked' : ''}" id="cpj-opt-rotate">
                    <div class="cpj-checkbox-box">${icons.check || ''}</div>
                    <span>Alternar 4 frases de likes</span>
                </div>
                <div class="cpj-checkbox-row ${this.state.get('randomInterval') ? 'checked' : ''}" id="cpj-opt-jitter">
                    <div class="cpj-checkbox-box">${icons.check || ''}</div>
                    <span>Anti-Spam randômico (9s a 11s)</span>
                </div>

                <div style="background:#003b70;border:1.5px solid #00e5ff;border-radius:10px;padding:8px;margin-bottom:10px;font-size:12px;">
                    <div style="font-size:10px;color:#8edeff;font-weight:700;text-transform:uppercase;">Próxima Mensagem (Likes):</div>
                    <div id="cpj-preview-msg">"${this.state.get('phrases')[0]}"</div>
                </div>

                <div class="cpj-actions-row">
                    <button class="cpj-btn-toggle start" id="cpj-btn-toggle">${icons.play || ''} Ligar Bot</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalEl = modal;

        this.bindEvents();
        this.updateView();
        this.state.subscribe(() => this.updateView());
    }

    renderLauncher(icons) {
        if (document.getElementById('cpj-floating-launcher')) return;
        const launcher = document.createElement('div');
        launcher.id = 'cpj-floating-launcher';
        launcher.className = 'cpj-floating-launcher';
        launcher.title = 'Abrir IglooLiker 3000 (Atalho: F9)';
        launcher.innerHTML = icons.igloo || '🏠';

        launcher.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleModal();
        });

        document.body.appendChild(launcher);
        this.launcherEl = launcher;
    }

    toggleModal() {
        if (!this.modalEl) return;
        this.modalEl.classList.toggle('cpj-closed');
    }

    bindEvents() {
        const modal = this.modalEl;

        // Input de likes atuais (editável se necessário ou auto-detectado)
        const inputLikes = modal.querySelector('#cpj-input-likes');
        inputLikes.addEventListener('input', (e) => {
            const clean = e.target.value.replace(/\D/g, '');
            e.target.value = clean;
            this.state.updateLikes(clean);
        });

        // Input de meta com apenas números
        const inputGoal = modal.querySelector('#cpj-input-goal');
        inputGoal.addEventListener('input', (e) => {
            const clean = e.target.value.replace(/\D/g, '');
            e.target.value = clean;
            this.state.updateGoal(clean);
        });

        // Checkboxes
        [['dance', 'autoDance'], ['rotate', 'rotatePhrases'], ['jitter', 'randomInterval']].forEach(([id, prop]) => {
            modal.querySelector(`#cpj-opt-${id}`).addEventListener('click', (e) => {
                const cur = !this.state.get(prop);
                this.state.set(prop, cur);
                e.currentTarget.classList.toggle('checked', cur);
            });
        });

        modal.querySelector('#cpj-btn-toggle').addEventListener('click', () => {
            this.state.get('isRunning') ? this.engine.stop() : this.engine.start();
        });

        modal.querySelector('#cpj-btn-close').addEventListener('click', (e) => {
            e.stopPropagation();
            modal.classList.add('cpj-closed');
        });

        let isMinimized = false;
        const btnMin = modal.querySelector('#cpj-btn-minimize');
        btnMin.addEventListener('click', () => {
            isMinimized = !isMinimized;
            modal.classList.toggle('minimized', isMinimized);
            btnMin.innerHTML = isMinimized ? (window.CP_ICONS?.maximize || '+') : (window.CP_ICONS?.minimize || '-');
        });

        // Arraste livre em X e Y em qualquer canto da tela
        const header = modal.querySelector('#cpj-header-drag');
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.cpj-circle-btn')) return;
            this.isDragging = true;
            this.dragOffset.x = e.clientX - modal.getBoundingClientRect().left;
            this.dragOffset.y = e.clientY - modal.getBoundingClientRect().top;
            modal.style.right = 'auto';
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const newX = Math.max(10, Math.min(window.innerWidth - modal.offsetWidth - 10, e.clientX - this.dragOffset.x));
            const newY = Math.max(10, Math.min(window.innerHeight - modal.offsetHeight - 10, e.clientY - this.dragOffset.y));
            modal.style.left = `${newX}px`;
            modal.style.top = `${newY}px`;
        });

        document.addEventListener('mouseup', () => { this.isDragging = false; });
    }

    updateView() {
        if (!this.modalEl) return;
        const m = this.modalEl;
        const s = this.state;

        const currentLikes = s.get('currentLikes');
        const targetGoal = s.get('targetGoal');
        const goalError = s.get('goalError');

        const inputLikes = m.querySelector('#cpj-input-likes');
        if (inputLikes && document.activeElement !== inputLikes) {
            inputLikes.value = currentLikes;
        }

        m.querySelector('#cpj-text-likes-count').textContent = `${currentLikes} curtidas`;
        m.querySelector('#cpj-text-goal-count').textContent = `Meta: ${targetGoal}`;
        m.querySelector('#cpj-badge-percent').textContent = s.getFormattedPercentage();
        m.querySelector('#cpj-progress-fill').style.width = `${s.getProgressRatio()}%`;

        // Sincronização dos checkboxes
        m.querySelector('#cpj-opt-dance')?.classList.toggle('checked', !!s.get('autoDance'));
        m.querySelector('#cpj-opt-rotate')?.classList.toggle('checked', !!s.get('rotatePhrases'));
        m.querySelector('#cpj-opt-jitter')?.classList.toggle('checked', !!s.get('randomInterval'));

        // Banner de erro da meta
        const errorBox = m.querySelector('#cpj-goal-error-box');
        const goalInput = m.querySelector('#cpj-input-goal');
        if (goalError) {
            errorBox.textContent = goalError;
            errorBox.style.display = 'block';
            goalInput.classList.add('has-error');
        } else {
            errorBox.style.display = 'none';
            goalInput.classList.remove('has-error');
        }

        const isRunning = s.get('isRunning');

        m.querySelector('#cpj-dot-status').className = `cpj-status-dot ${isRunning ? 'active' : ''}`;
        m.querySelector('#cpj-text-status').textContent = isRunning ? 'Ativo & Dançando' : 'Parado';

        const btnToggle = m.querySelector('#cpj-btn-toggle');
        if (btnToggle) {
            btnToggle.className = isRunning ? 'cpj-btn-toggle stop' : 'cpj-btn-toggle start';
            btnToggle.innerHTML = isRunning ? `${window.CP_ICONS?.stop || ''} Pausar Bot` : `${window.CP_ICONS?.play || ''} Ligar Bot`;
        }

        const lastMsg = s.get('lastSentMessage') || s.get('phrases')[0];
        m.querySelector('#cpj-preview-msg').textContent = `"${lastMsg}"`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BoosterUI };
} else {
    window.CPJBoosterUI = BoosterUI;
}
