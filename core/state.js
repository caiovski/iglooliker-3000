/**
 * CPJ Igloo Likes AFK Booster - Reactive State Container
 * Regra opsx-build: < 250 linhas, segregação de abas (sessionStorage) e i18n bilíngue.
 */

const CPJ_I18N = {
    en: {
        title: "IglooLiker 3000",
        statusActive: "Active & Dancing",
        statusPaused: "Ready (Paused)",
        statusSilent: "Silent Monitoring",
        allRooms: "All Rooms",
        langLabel: "Language: English (USA)",
        iglooProgress: "Igloo Likes Progression",
        detectedLikes: "Current Likes",
        targetGoal: "Target Goal",
        likesUnit: "likes",
        goalUnit: "Goal:",
        tabPhrases: "Phrases",
        tabActions: "Actions",
        tabStudio: "Studio",
        rotatePhrases: "Rotate like phrases",
        randomDelay: "Random anti-spam (9s to 11s)",
        deactivatePhrases: "Deactivate phrases (Silent mode)",
        autoDance: "Auto-Dance ('D' keypress)",
        autoWave: "Auto-Wave ('W' keypress)",
        repeatAction: "Repeat action continuously",
        actionInterval: "Action Interval:",
        nextMsgTitle: "Next Message (Likes):",
        startBot: "START BOT",
        stopBot: "PAUSE BOT",
        studioPlaceholder: "Type new like phrase...",
        studioAdd: "+ ADD",
        studioCap: "Slot: ",
        studioMaxAlert: "Maximum 6 phrases reached!",
        editPrompt: "Edit phrase:"
    },
    pt: {
        title: "IglooLiker 3000",
        statusActive: "Ativo & Dançando",
        statusPaused: "Pronto (Pausado)",
        statusSilent: "Monitorando Silencioso",
        allRooms: "Todas as Salas",
        langLabel: "Idioma: Português (Brasil)",
        iglooProgress: "Progresso do Iglu",
        detectedLikes: "Likes Atuais",
        targetGoal: "Meta de Likes",
        likesUnit: "curtidas",
        goalUnit: "Meta:",
        tabPhrases: "Frases",
        tabActions: "Ações",
        tabStudio: "Estúdio",
        rotatePhrases: "Alternar frases de likes",
        randomDelay: "Anti-Spam randômico (9s a 11s)",
        deactivatePhrases: "Desativar frases (Modo silencioso)",
        autoDance: "Auto-Dançar ('D')",
        autoWave: "Auto-Acenar ('W' - Anti-AFK)",
        repeatAction: "Repetir ação continuamente",
        actionInterval: "Intervalo de Ação:",
        nextMsgTitle: "Próxima Mensagem (Likes):",
        startBot: "LIGAR BOT",
        stopBot: "PAUSAR BOT",
        studioPlaceholder: "Digite a nova frase...",
        studioAdd: "+ ADICIONAR",
        studioCap: "Slot: ",
        studioMaxAlert: "Limite máximo de 6 frases atingido!",
        editPrompt: "Editar frase:"
    }
};

class BoosterState {
    constructor() {
        this.SESSION_KEY = 'cpj_tab_state_v3';
        this.SHARED_KEY = 'cpj_shared_data_v3';
        this.listeners = new Map();
        this.data = {
            isRunning: false, autoDance: true, autoWave: false, repeatAction: false,
            actionInterval: 7, rotatePhrases: true, randomDelay: true, deactivatePhrases: false,
            activeTab: 'phrases', currentRoom: 'Welcome Room', isWelcomeRoom: true, hasDanced: false,
            currentLikes: 0, targetGoal: 1000, lang: 'en',
            phrases: [
                { text: "Igloo liking party! Help me reach one k! Thanks for your support", enabled: true },
                { text: "Drop a like at my igloo to help me reach one k! Much appreciated!", enabled: true },
                { text: "Working on my one k igloo likes goal! Any like helps a lot!", enabled: true },
                { text: "Please visit my igloo and leave a like for one k! Thank you so much!", enabled: true }
            ],
            phraseIndex: 0, goalError: null, lastSentMessage: null
        };
        this.load();
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (e) => {
                if (e.key === this.SHARED_KEY) { this.load(); this.notify('phrases', this.data.phrases); this.notify('lang', this.data.lang); }
            });
        }
    }

    load() {
        try {
            const rawShared = localStorage.getItem(this.SHARED_KEY);
            if (rawShared) {
                const p = JSON.parse(rawShared);
                if (p.goal) this.data.targetGoal = Number(p.goal) || 1000;
                if (p.likes) this.data.currentLikes = Number(p.likes) || 0;
                if (p.lang && (p.lang === 'en' || p.lang === 'pt')) this.data.lang = p.lang;
                if (Array.isArray(p.phrases) && p.phrases.length > 0) {
                    this.data.phrases = p.phrases.slice(0, 6).map(item => {
                        if (typeof item === 'string') return { text: item, enabled: true };
                        if (item && typeof item.text === 'string') return { text: item.text, enabled: item.enabled !== false };
                        return { text: String(item || ''), enabled: true };
                    });
                }
            }
        } catch (e) {}

        try {
            const rawSession = sessionStorage.getItem(this.SESSION_KEY);
            if (rawSession) {
                const s = JSON.parse(rawSession);
                ['autoDance', 'autoWave', 'repeatAction', 'rotatePhrases', 'randomDelay', 'deactivatePhrases'].forEach(k => {
                    if (s[k] !== undefined) this.data[k] = !!s[k];
                });
                if (s.actionInterval !== undefined) this.data.actionInterval = Number(s.actionInterval) || 7;
                if (s.activeTab) this.data.activeTab = s.activeTab;
            }
        } catch (e) {}
        this.validateGoal();
    }

    saveShared() {
        try {
            localStorage.setItem(this.SHARED_KEY, JSON.stringify({
                goal: this.data.targetGoal, likes: this.data.currentLikes,
                lang: this.data.lang, phrases: this.data.phrases
            }));
        } catch (e) {}
    }

    saveSession() {
        try {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
                autoDance: this.data.autoDance, autoWave: this.data.autoWave,
                repeatAction: this.data.repeatAction, actionInterval: this.data.actionInterval,
                rotatePhrases: this.data.rotatePhrases, randomDelay: this.data.randomDelay,
                deactivatePhrases: this.data.deactivatePhrases, activeTab: this.data.activeTab
            }));
        } catch (e) {}
    }

    get(key) { return this.data[key]; }

    set(key, val) {
        this.data[key] = val;
        this.notify(key, val);
        if (['autoDance', 'autoWave', 'repeatAction', 'actionInterval', 'rotatePhrases', 'randomDelay', 'deactivatePhrases', 'activeTab'].includes(key)) {
            this.saveSession();
        } else if (['targetGoal', 'currentLikes', 'lang', 'phrases'].includes(key)) {
            this.saveShared();
        }
    }

    updateLikes(likes) { this.set('currentLikes', Math.max(0, likes)); this.validateGoal(); }
    updateGoal(goal) { this.set('targetGoal', Math.max(0, goal)); this.validateGoal(); }

    validateGoal() {
        const likes = this.data.currentLikes, goal = this.data.targetGoal, pt = this.data.lang === 'pt';
        let err = null;
        if (goal <= 0) err = pt ? 'Digite uma meta válida!' : 'Enter a valid goal!';
        else if (goal <= likes) err = pt ? `Meta já batida! Você possui ${likes} likes.` : `Goal already reached! You have ${likes} likes.`;
        this.set('goalError', err);
    }

    getPercentage() {
        if (this.data.targetGoal <= 0) return '00.00%';
        const [i, d] = Math.max(0, (this.data.currentLikes / this.data.targetGoal) * 100).toFixed(2).split('.');
        return `${i.padStart(2, '0')}.${d}%`;
    }

    getProgressRatio() {
        return this.data.targetGoal <= 0 ? 0 : Math.min(100, Math.max(0, (this.data.currentLikes / this.data.targetGoal) * 100));
    }

    getNextPhrase() {
        const active = this.data.phrases.filter(p => p.enabled);
        if (active.length === 0) return '';
        if (!this.data.rotatePhrases || active.length === 1) return active[0].text;
        const p = active[this.data.phraseIndex % active.length];
        this.data.phraseIndex++;
        return p.text;
    }

    addPhrase(text) {
        if (this.data.phrases.length >= 6 || !text || text.trim().length < 2) return false;
        this.data.phrases.push({ text: text.trim(), enabled: true });
        this.set('phrases', [...this.data.phrases]);
        return true;
    }

    editPhrase(index, newText) {
        if (index < 0 || index >= this.data.phrases.length || !newText || newText.trim().length < 2) return false;
        this.data.phrases[index].text = newText.trim();
        this.set('phrases', [...this.data.phrases]);
        return true;
    }

    deletePhrase(index) {
        if (index < 0 || index >= this.data.phrases.length) return false;
        this.data.phrases.splice(index, 1);
        this.set('phrases', [...this.data.phrases]);
        return true;
    }

    togglePhrase(index) {
        if (index < 0 || index >= this.data.phrases.length) return false;
        this.data.phrases[index].enabled = !this.data.phrases[index].enabled;
        this.set('phrases', [...this.data.phrases]);
        return true;
    }

    subscribe(key, fn) {
        if (!this.listeners.has(key)) this.listeners.set(key, new Set());
        this.listeners.get(key).add(fn);
    }

    notify(key, val) {
        if (this.listeners.has(key)) this.listeners.get(key).forEach(fn => fn(val));
    }
}

if (typeof window !== 'undefined') {
    window.BoosterState = BoosterState;
    window.CPJ_I18N = CPJ_I18N;
}
