/**
 * CPJ Igloo Likes AFK Booster - Core Engine (IglooLiker 3000)
 * Regra opsx-build: < 250 linhas, ações alternadas (Dança/Wave), timer de repetição e chat seguro.
 */

class BoosterEngine {
    constructor(state) {
        this.state = state;
        this.worker = null;
        this.timerId = null;
        this.actionTimer = null;
        this.actionCycleIndex = 0;
        this.initWorker();
        this.startLikesPolling();
    }

    initWorker() {
        try {
            const code = `
                let timer = null;
                self.onmessage = function(e) {
                    if (e.data.action === 'start') {
                        if (timer) clearTimeout(timer);
                        timer = setTimeout(() => { self.postMessage('tick'); }, e.data.delay || 7500);
                    } else if (e.data.action === 'stop') {
                        if (timer) clearTimeout(timer);
                    }
                };
            `;
            const blob = new Blob([code], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));
            this.worker.onmessage = (e) => {
                if (e.data === 'tick') this.handleTick();
            };
        } catch (err) {
            this.worker = null;
        }
    }

    startLikesPolling() {
        this.hookNetworkMessages();
        setInterval(() => this.detectPenguinLikes(), 3000);
    }

    hookNetworkMessages() {
        try {
            const games = [window.game, window.yukon?.game, ...(window.Phaser?.GAMES ? Object.values(window.Phaser.GAMES) : [])].filter(Boolean);
            for (const g of games) {
                const net = g.network || g.scene?.getScene?.('Main')?.network;
                if (net && !net.__cpj_hooked) {
                    net.__cpj_hooked = true;
                    const orig = net.onMessage;
                    if (typeof orig === 'function') {
                        net.onMessage = (msg) => {
                            try {
                                const args = msg?.args || msg;
                                const l = args?.likes ?? args?.iglooLikes ?? args?.igloo?.likes;
                                if (typeof l === 'number' && l >= 0) this.state.updateLikes(l);
                            } catch (e) {}
                            return orig.call(net, msg);
                        };
                    }
                }
            }
        } catch (e) {}
    }

    detectPenguinLikes() {
        try {
            const games = [window.game, window.yukon?.game, ...(window.Phaser?.GAMES ? Object.values(window.Phaser.GAMES) : [])].filter(Boolean);
            for (const g of games) {
                for (const sc of (g.scene?.scenes || [])) {
                    const client = sc.world?.client || sc.client;
                    if (client?.penguin) {
                        const l = client.penguin.iglooLikes ?? client.penguin.likes ?? client.penguin.igloo?.likes ?? client.iglooLikes;
                        if (typeof l === 'number') this.state.updateLikes(l);
                    }
                }
            }
        } catch (e) {}
    }

    start() {
        this.state.set('isRunning', true);
        this.state.set('hasDanced', false);
        this.startActionLoop();
        this.handleTick();
    }

    stop() {
        this.state.set('isRunning', false);
        this.stopActionLoop();
        if (this.worker) this.worker.postMessage({ action: 'stop' });
        if (this.timerId) { clearTimeout(this.timerId); this.timerId = null; }
    }

    handleTick() {
        if (!this.state.get('isRunning')) return;

        if (!this.state.get('repeatAction') && !this.state.get('hasDanced')) {
            this.executeActiveAction();
            this.state.set('hasDanced', true);
        }

        if (!this.state.get('deactivatePhrases')) {
            const msg = this.state.getNextPhrase();
            if (msg) {
                this.sendChatMessage(msg);
                this.state.set('lastSentMessage', msg);
            }
        }

        const delay = this.state.get('randomDelay')
            ? Math.floor(Math.random() * 2000) + 9000
            : 10000;

        if (this.worker) {
            this.worker.postMessage({ action: 'start', delay });
        } else {
            this.timerId = setTimeout(() => this.handleTick(), delay);
        }
    }

    executeActiveAction() {
        const dance = this.state.get('autoDance');
        const wave = this.state.get('autoWave');
        if (dance && wave) {
            if (this.actionCycleIndex % 2 === 0) this.dispatchKey('d', 'KeyD', 68);
            else this.dispatchKey('w', 'KeyW', 87);
            this.actionCycleIndex++;
        } else if (dance) {
            this.dispatchKey('d', 'KeyD', 68);
        } else if (wave) {
            this.dispatchKey('w', 'KeyW', 87);
        }
    }

    startActionLoop() {
        this.stopActionLoop();
        this.executeActiveAction();
        if (this.state.get('repeatAction') && this.state.get('isRunning')) {
            const ms = Math.max(5, Math.min(10, this.state.get('actionInterval'))) * 1000;
            this.actionTimer = setInterval(() => {
                if (this.state.get('isRunning')) this.executeActiveAction();
            }, ms);
        }
    }

    stopActionLoop() {
        if (this.actionTimer) {
            clearInterval(this.actionTimer);
            this.actionTimer = null;
        }
    }

    dispatchKey(key, code, keyCode) {
        try {
            const target = document.querySelector('canvas') || document.body;
            const PKE = window.KeyboardEvent;
            ['keydown', 'keyup'].forEach(type => {
                const ev = new PKE(type, { key, code, keyCode, which: keyCode, bubbles: true });
                target.dispatchEvent(ev);
                window.dispatchEvent(ev);
            });
        } catch (e) {}
    }

    sendChatMessage(msg) {
        if (!msg) return;
        try {
            if (navigator.clipboard?.writeText) navigator.clipboard.writeText(msg).catch(() => {});
        } catch (e) {}

        let inps = Array.from(document.querySelectorAll('input[autocomplete="new-password"], input[type="text"], input:not([type]), textarea'))
            .filter(el => !el.closest('#cpj-modal') && !el.closest('#cpj-igloo-booster-modal') && el.type !== 'hidden' && el.type !== 'checkbox' && el.type !== 'button' && el.type !== 'submit');

        if (inps.length === 0) {
            const canvas = document.querySelector('canvas') || document.body;
            canvas.focus?.();
            const PKE = window.KeyboardEvent;
            ['keydown', 'keyup'].forEach(type => {
                const ev = new PKE(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
                canvas.dispatchEvent(ev);
                window.dispatchEvent(ev);
            });
            inps = Array.from(document.querySelectorAll('input[autocomplete="new-password"], input[type="text"], input:not([type]), textarea'))
                .filter(el => !el.closest('#cpj-modal') && !el.closest('#cpj-igloo-booster-modal') && el.type !== 'hidden' && el.type !== 'checkbox' && el.type !== 'button' && el.type !== 'submit');
        }

        const inp = inps.find(el => el.offsetParent !== null) || inps[0];
        if (!inp) return;

        inp.focus(); inp.click(); inp.value = '';
        if (typeof inp.select === 'function') inp.select();

        let pasted = false;
        try { pasted = document.execCommand('insertText', false, msg); } catch (e) {}
        if (!pasted || inp.value !== msg) inp.value = msg;

        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));

        setTimeout(() => {
            inp.focus();
            const PKE = window.KeyboardEvent;
            ['keydown', 'keypress', 'keyup'].forEach(type => {
                const ev = new PKE(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: type === 'keypress' ? 13 : 0, bubbles: true, cancelable: true });
                inp.dispatchEvent(ev);
            });

            const canvas = document.querySelector('canvas');
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const PE = window.PointerEvent || window.MouseEvent;
                ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evtType => {
                    const ev = new PE(evtType, { clientX: rect.left + (rect.width * 0.675), clientY: rect.top + (rect.height * 0.961), bubbles: true, cancelable: true, button: 0, buttons: 1 });
                    canvas.dispatchEvent(ev);
                });
                ['keydown', 'keyup'].forEach(type => {
                    canvas.dispatchEvent(new PKE(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                    window.dispatchEvent(new PKE(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                });
            }

            const sendBtn = inp.parentElement?.querySelector('button, [role="button"], [type="submit"]') || document.querySelector('.chat-send, [data-action="send"], #chat-send');
            if (sendBtn?.click) sendBtn.click();
            if (inp.form?.requestSubmit) inp.form.requestSubmit();

            try {
                const games = [window.game, window.yukon?.game, ...(window.Phaser?.GAMES ? Object.values(window.Phaser.GAMES) : [])].filter(Boolean);
                for (const g of games) {
                    const main = g.scene?.getScene?.('Main');
                    if (main?.chatInput?.callback) main.chatInput.callback();
                    if (main?.onChatSend) main.onChatSend();
                }
            } catch (e) {}

            window.postMessage({ type: 'CPJ_TRIGGER_ENTER' }, '*');
        }, 70);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { BoosterEngine };
else window.BoosterEngine = BoosterEngine;
