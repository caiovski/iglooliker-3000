/**
 * CPJ Igloo Likes AFK Booster - Core Engine (IglooLiker 3000)
 * Regra opsx-build: < 250 linhas, universal em todas as salas, chat nativo Yukon.
 */

class BoosterEngine {
    constructor(state) {
        this.state = state;
        this.worker = null;
        this.timerId = null;
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
            console.warn('[CPJ Booster] Worker bloqueado por CSP. Usando timer padrão.');
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
                    const origOnMessage = net.onMessage;
                    if (typeof origOnMessage === 'function') {
                        net.onMessage = (message) => {
                            try {
                                const args = message?.args || message;
                                const likes = args?.likes ?? args?.iglooLikes ?? args?.igloo?.likes;
                                if (typeof likes === 'number' && likes >= 0) this.state.updateLikes(likes);
                            } catch (e) {}
                            return origOnMessage.call(net, message);
                        };
                    }
                }
            }
        } catch (e) {}
    }

    detectPenguinLikes() {
        this.hookNetworkMessages();
        try {
            const games = [window.game, window.yukon?.game, ...(window.Phaser?.GAMES ? Object.values(window.Phaser.GAMES) : [])].filter(Boolean);
            for (const g of games) {
                for (const sc of (g.scene?.scenes || [])) {
                    const client = sc.world?.client || sc.client || window.air?.world?.client;
                    if (client?.penguin) {
                        const likes = client.penguin.iglooLikes ?? client.penguin.likes ?? client.penguin.igloo?.likes ?? client.iglooLikes;
                        if (typeof likes === 'number' && likes !== this.state.get('currentLikes')) {
                            this.state.updateLikes(likes);
                            return;
                        }
                    }
                }
            }
        } catch (e) {}
    }

    start() {
        if (this.state.get('isRunning')) return;
        this.state.set('isRunning', true);
        this.state.set('hasDanced', false);
        this.checkRoomAndPerform();
        this.scheduleNext();
    }

    stop() {
        this.state.set('isRunning', false);
        if (this.worker) this.worker.postMessage({ action: 'stop' });
        if (this.timerId) { clearTimeout(this.timerId); this.timerId = null; }
    }

    scheduleNext() {
        if (!this.state.get('isRunning')) return;
        const delay = this.state.get('randomInterval') 
            ? Math.floor(Math.random() * (11000 - 9000 + 1)) + 9000 
            : 10000;
        if (this.worker) {
            this.worker.postMessage({ action: 'start', delay });
        } else {
            if (this.timerId) clearTimeout(this.timerId);
            this.timerId = setTimeout(() => this.handleTick(), delay);
        }
    }

    handleTick() {
        if (!this.state.get('isRunning')) return;
        this.checkRoomAndPerform();
        this.scheduleNext();
    }

    // Universal: detecta a sala mas NÃO bloqueia a execução em nenhuma sala
    checkRoomAndPerform() {
        if (this.state.get('autoDance') && !this.state.get('hasDanced')) {
            this.performDance();
            this.state.set('hasDanced', true);
        }
        this.sendChatLikeMessage();
    }

    performDance() {
        try {
            const world = window.world || window.air?.world;
            if (world?.client?.sendDance) {
                world.client.sendDance();
                return;
            }
            const target = document.querySelector('canvas') || document.body;
            target.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', code: 'KeyD', keyCode: 68, which: 68, bubbles: true }));
            setTimeout(() => target.dispatchEvent(new KeyboardEvent('keyup', { key: 'd', code: 'KeyD', keyCode: 68, which: 68, bubbles: true })), 80);
        } catch (err) {}
    }

    sendChatLikeMessage() {
        const msg = this.state.getNextPhrase();
        if (!msg) return;

        this.state.set('lastSentMessage', msg);
        this.state.set('lastSentTimestamp', Date.now());

        try {
            if (navigator.clipboard?.writeText) navigator.clipboard.writeText(msg).catch(() => {});
        } catch (e) {}

        let chatInps = Array.from(document.querySelectorAll('input[autocomplete="new-password"], input[type="text"], input:not([type]), textarea'))
            .filter(el => !el.closest('#cpj-modal') && !el.closest('#cpj-igloo-booster-modal') && el.type !== 'hidden' && el.type !== 'checkbox' && el.type !== 'button' && el.type !== 'submit');

        if (chatInps.length === 0) {
            const canvas = document.querySelector('canvas') || document.body;
            canvas.focus?.();
            const PKE = window.KeyboardEvent;
            ['keydown', 'keyup'].forEach(type => {
                const ev = new PKE(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
                canvas.dispatchEvent(ev);
                window.dispatchEvent(ev);
            });
            chatInps = Array.from(document.querySelectorAll('input[autocomplete="new-password"], input[type="text"], input:not([type]), textarea'))
                .filter(el => !el.closest('#cpj-modal') && !el.closest('#cpj-igloo-booster-modal') && el.type !== 'hidden' && el.type !== 'checkbox' && el.type !== 'button' && el.type !== 'submit');
        }

        const inp = chatInps.find(el => el.offsetParent !== null) || chatInps[0];
        if (!inp) return;

        inp.focus();
        inp.click();
        inp.value = '';
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BoosterEngine };
} else {
    window.CPJBoosterEngine = BoosterEngine;
}
