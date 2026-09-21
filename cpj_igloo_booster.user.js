// ==UserScript==
// @name         IglooLiker 3000 (CPJ Igloo Likes AFK Booster)
// @namespace    https://github.com/cpj-afk-booster
// @version      3.0.0
// @description  Automação AFK universal para likes de iglu no CPJ com dança, chat nativo Yukon simulando digitação/colagem e interface Club Penguin autêntica (Compatível com Firefox e Chrome).
// @author       Caiozera & Antigravity
// @match        https://play.cpjourney.net/*
// @match        https://*.cpjourney.net/*
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // Obter o objeto window desempacotado no Firefox (bypassa XrayWrappers do Gecko)
    const pageWin = (typeof unsafeWindow !== 'undefined' && unsafeWindow.wrappedJSObject)
        ? unsafeWindow.wrappedJSObject
        : (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);

    // 0. Injeção no Contexto Principal da Página (Garante acesso ao Phaser e motor Yukon)
    try {
        const pageBridgeScript = document.createElement('script');
        pageBridgeScript.textContent = `
            (function() {
                window.__CPJ_YUKON_BRIDGE__ = {
                    getGame() {
                        const games = [
                            window.game,
                            window.yukon?.game,
                            ...(window.Phaser?.GAMES ? Object.values(window.Phaser.GAMES) : [])
                        ].filter(Boolean);
                        return games[0] || null;
                    },
                    sendChat(msg) {
                        try {
                            const g = this.getGame();
                            if (g) {
                                // 1. Cena Main nativa do Yukon (Zero risco de desconexão)
                                const mainScene = g.scene?.getScene ? g.scene.getScene('Main') : null;
                                if (mainScene) {
                                    if (mainScene.chatInput) {
                                        if (typeof mainScene.chatInput.setText === 'function') {
                                            mainScene.chatInput.setText(msg);
                                        } else {
                                            mainScene.chatInput.text = msg;
                                            if (mainScene.chatInput.node) mainScene.chatInput.node.value = msg;
                                        }
                                    }
                                    if (typeof mainScene.onChatSend === 'function') {
                                        mainScene.onChatSend();
                                        return true;
                                    }
                                }
                            }
                        } catch (err) {
                            console.warn('[CPJ Bridge] Erro ao enviar chat:', err);
                        }
                        return false;
                    },
                    detectLikes() {
                        try {
                            const g = this.getGame();
                            if (g) {
                                for (const sc of (g.scene?.scenes || [])) {
                                    const client = sc.world?.client || sc.client;
                                    if (client?.penguin) {
                                        const l = client.penguin.iglooLikes ?? client.penguin.likes ?? client.penguin.igloo?.likes ?? client.iglooLikes;
                                        if (typeof l === 'number') return l;
                                    }
                                }
                            }
                        } catch (e) {}
                        return null;
                    }
                };

                // Escuta mensagens via window.postMessage (100% imune a restrições Xray do Firefox)
                window.addEventListener('message', function(e) {
                    if (e.data && e.data.type === 'CPJ_DISPATCH_CHAT' && e.data.message) {
                        window.__CPJ_YUKON_BRIDGE__.sendChat(e.data.message);
                    } else if (e.data && e.data.type === 'CPJ_TRIGGER_ENTER') {
                        try {
                            const g = window.__CPJ_YUKON_BRIDGE__.getGame();
                            const mainScene = g?.scene?.getScene ? g.scene.getScene('Main') : null;
                            if (mainScene && typeof mainScene.onChatSend === 'function') {
                                mainScene.onChatSend();
                            }
                        } catch (err) {}
                    }
                });

                // Hook contínuo de pacotes recebidos
                function setupPacketHook() {
                    try {
                        const g = window.__CPJ_YUKON_BRIDGE__.getGame();
                        const net = g?.network || g?.scene?.getScene?.('Main')?.network;
                        if (net && !net.__cpj_hooked) {
                            net.__cpj_hooked = true;
                            const origOnMessage = net.onMessage;
                            if (typeof origOnMessage === 'function') {
                                net.onMessage = function(message) {
                                    try {
                                        const args = message?.args || message;
                                        const likes = args?.likes ?? args?.iglooLikes ?? args?.igloo?.likes;
                                        if (typeof likes === 'number' && likes >= 0) {
                                            window.postMessage({ type: 'CPJ_LIKES_SYNC', likes: likes }, '*');
                                        }
                                    } catch (e) {}
                                    return origOnMessage.apply(this, arguments);
                                };
                            }
                        }
                    } catch (e) {}
                }
                setInterval(setupPacketHook, 2000);
            })();
        `;
        (document.head || document.documentElement).appendChild(pageBridgeScript);
        pageBridgeScript.remove();
    } catch (e) {
        console.warn('[CPJ Booster] Script injection bloqueada, usando unsafeWindow.wrappedJSObject direto.');
    }

    // 1. Ícones Vetoriais SVG (Zero Emojis - Iglu Branco da Neve)
    const ICONS = {
        igloo: `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.42 3.12 7.24L5 20h14l-.12-.76C20.8 17.42 22 14.85 22 12c0-5.52-4.48-10-10-10z" fill="#ffffff"/><path d="M12 4c-4.41 0-8 3.59-8 8 0 2.25.93 4.28 2.43 5.75L7 18h10l.57-.25C19.07 16.28 20 14.25 20 12c0-4.41-3.59-8-8-8z" fill="#e6f7ff"/><path d="M10 14h4v6h-4z" fill="#002d55"/><path d="M10 14a2 2 0 0 1 4 0v6h-4v-6z" fill="#001830"/></svg>`,
        close: `<svg viewBox="0 0 24 24" width="15" height="15"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#ffffff"/></svg>`,
        min: `<svg viewBox="0 0 24 24" width="15" height="15"><path d="M6 19h12v2H6z" fill="#ffffff"/></svg>`,
        max: `<svg viewBox="0 0 24 24" width="15" height="15"><path d="M4 4h16v16H4zm2 4v10h12V8z" fill="#ffffff"/></svg>`,
        check: `<svg viewBox="0 0 24 24" width="15" height="15"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#00284d" stroke="#00284d" stroke-width="1.5"/></svg>`,
        play: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5v14l11-7z" fill="#ffffff"/></svg>`,
        stop: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6h12v12H6z" fill="#ffffff"/></svg>`
    };

    // 2. Estilos CSS com Forçamento Estrito (!important) para Inputs e Tipografia (com suporte a Firefox -moz-appearance)
    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');

        #cpj-modal {
            position: fixed !important;
            top: 30px !important;
            right: 30px !important;
            width: 370px !important;
            background: linear-gradient(180deg, #00a2f5 0%, #0088d8 50%, #0077c4 100%) !important;
            border: 3.5px solid #00e5ff !important;
            outline: 2px solid #004077 !important;
            border-radius: 20px !important;
            box-shadow: 0 10px 30px rgba(0, 20, 60, 0.65), inset 0 2px 0 #66f3ff !important;
            font-family: 'Fredoka', 'Burbank Small', 'Comic Sans MS', sans-serif !important;
            color: #ffffff !important;
            user-select: none !important;
            z-index: 2147483647 !important;
            padding: 16px 18px !important;
            box-sizing: border-box !important;
            display: block !important;
        }
        #cpj-modal.cpj-closed { display: none !important; }
        #cpj-modal.minimized .cpj-content { display: none !important; }

        #cpj-launcher {
            position: fixed !important;
            top: 15px !important;
            right: 15px !important;
            width: 48px !important;
            height: 48px !important;
            border-radius: 50% !important;
            background: linear-gradient(180deg, #00b4ff 0%, #006eb8 100%) !important;
            border: 3px solid #00e5ff !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5), inset 0 2px 0 #7fe3ff !important;
            z-index: 2147483646 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: transform 0.15s ease !important;
        }
        #cpj-launcher:hover { transform: scale(1.1) !important; }

        .cpj-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            margin-bottom: 12px !important;
            padding-bottom: 8px !important;
            border-bottom: 2px solid rgba(0, 229, 255, 0.35) !important;
            cursor: move !important;
        }
        .cpj-title {
            font-family: 'Fredoka', 'Burbank Small', 'Comic Sans MS', sans-serif !important;
            font-size: 20px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            color: #ffffff !important;
            letter-spacing: 0.5px !important;
            text-shadow:
                -1.5px -1.5px 0 #00305a,
                 1.5px -1.5px 0 #00305a,
                -1.5px  1.5px 0 #00305a,
                 1.5px  1.5px 0 #00305a,
                 0 3px 5px rgba(0, 20, 50, 0.45) !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }

        .cpj-cbtn {
            width: 30px !important;
            height: 30px !important;
            border-radius: 50% !important;
            background: linear-gradient(180deg, #00a8ea 0%, #006cb5 100%) !important;
            border: 2px solid #00e5ff !important;
            box-shadow: inset 0 1px 0 #7fe3ff, 0 2px 4px rgba(0,0,0,0.35) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            padding: 0 !important;
        }
        .cpj-cbtn:active { transform: scale(0.95) !important; }

        .cpj-status {
            background: #003b70 !important;
            border: 2px solid #00e5ff !important;
            border-radius: 25px !important;
            padding: 6px 14px !important;
            display: flex !important;
            justify-content: space-between !important;
            font-size: 13px !important;
            margin-bottom: 12px !important;
        }
        .cpj-dot {
            width: 10px !important;
            height: 10px !important;
            border-radius: 50% !important;
            background: #ff4757 !important;
            border: 1.5px solid #ffffff !important;
            display: inline-block !important;
            margin-right: 6px !important;
        }
        .cpj-dot.active { background: #2ed573 !important; box-shadow: 0 0 8px #2ed573 !important; }

        .cpj-card {
            background: linear-gradient(180deg, #004d8c 0%, #003666 100%) !important;
            border: 2.5px solid #00e5ff !important;
            border-radius: 16px !important;
            padding: 12px 14px !important;
            margin-bottom: 12px !important;
        }
        .cpj-row {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
            margin-bottom: 10px !important;
        }
        .cpj-col {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            min-width: 110px !important;
        }
        .cpj-tag {
            font-size: 11px !important;
            color: #8edeff !important;
            text-transform: uppercase !important;
            font-weight: 700 !important;
            margin-bottom: 4px !important;
        }

        /* Inputs Visíveis com suporte estrito a Firefox e Chrome */
        #cpj-modal input.cpj-input-pill,
        .cpj-input-pill {
            -moz-appearance: none !important;
            appearance: none !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: 110px !important;
            height: 36px !important;
            min-height: 36px !important;
            background: #002d55 !important;
            border-radius: 18px !important;
            font-family: 'Fredoka', sans-serif !important;
            font-size: 17px !important;
            font-weight: 700 !important;
            text-align: center !important;
            padding: 4px 8px !important;
            outline: none !important;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.6) !important;
            box-sizing: border-box !important;
            position: static !important;
            pointer-events: auto !important;
            margin: 0 !important;
            line-height: normal !important;
        }
        #cpj-modal input.cpj-input-likes {
            border: 2px solid #50d0ff !important;
            color: #ffea79 !important;
        }
        #cpj-modal input.cpj-input-likes:focus {
            border-color: #ffea79 !important;
            box-shadow: 0 0 8px rgba(255, 234, 121, 0.6) !important;
        }

        #cpj-modal input.cpj-input-goal {
            border: 2px solid #00e5ff !important;
            color: #ffffff !important;
        }
        #cpj-modal input.cpj-input-goal:focus {
            border-color: #ffffff !important;
            box-shadow: 0 0 8px #00e5ff !important;
        }
        #cpj-modal input.cpj-input-goal.has-error {
            border-color: #ff4757 !important;
            box-shadow: 0 0 8px #ff4757 !important;
        }

        .cpj-error {
            background: rgba(255, 71, 87, 0.25) !important;
            border: 1.5px solid #ff4757 !important;
            border-radius: 8px !important;
            padding: 5px 8px !important;
            font-size: 11px !important;
            color: #ffb8b8 !important;
            text-align: center !important;
            margin-bottom: 8px !important;
            font-weight: 700 !important;
            display: none;
        }
        .cpj-track {
            width: 100% !important;
            height: 22px !important;
            background: #001f3f !important;
            border: 2px solid #00e5ff !important;
            border-radius: 14px !important;
            overflow: hidden !important;
            margin-bottom: 4px !important;
        }
        .cpj-fill {
            height: 100% !important;
            background: linear-gradient(180deg, #00ffff 0%, #00b4d8 50%, #0077b6 100%) !important;
            border-radius: 12px !important;
            transition: width 0.35s ease !important;
        }

        .cpj-check-row {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            cursor: pointer !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            margin-bottom: 8px !important;
        }
        .cpj-box {
            width: 20px !important;
            height: 20px !important;
            background: #ffffff !important;
            border: 2px solid #00284d !important;
            border-radius: 4px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
        }
        .cpj-check-row.checked .cpj-box { background: #ffcc00 !important; }
        .cpj-check-row.checked .cpj-box svg { display: block !important; }
        .cpj-box svg { display: none; }

        .cpj-actions-row { display: flex !important; width: 100% !important; margin-top: 12px !important; }
        .cpj-btn-toggle {
            width: 100% !important;
            font-family: 'Fredoka', sans-serif !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            color: #ffffff !important;
            border: 2px solid #ffffff !important;
            border-radius: 22px !important;
            padding: 10px 16px !important;
            cursor: pointer !important;
            text-transform: uppercase !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            transition: all 0.15s ease !important;
        }
        .cpj-btn-toggle.start {
            background: linear-gradient(180deg, #00c6ff 0%, #0072ff 100%) !important;
            box-shadow: inset 0 2px 0 #7fe3ff, 0 4px 0 #004080 !important;
        }
        .cpj-btn-toggle.stop {
            background: linear-gradient(180deg, #ff6b6b 0%, #c0392b 100%) !important;
            box-shadow: inset 0 2px 0 #ffaaaa, 0 4px 0 #801d12 !important;
        }
        .cpj-btn-toggle:active { transform: translateY(3px) !important; }
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    (document.head || document.documentElement).appendChild(styleEl);

    // 3. Estado Reativo com Persistência
    const STORAGE_KEY = 'cpj_igloo_booster_data';
    const state = {
        likes: 0,
        goal: 1000,
        autoDance: true,
        rotatePhrases: true,
        randomInterval: true,
        running: false,
        room: 'Welcome Room',
        isWelcome: true,
        danced: false,
        error: null,
        phrases: [
            "Igloo liking party! Help me reach one k! Thanks for your support",
            "Drop a like at my igloo to help me reach one k! Much appreciated!",
            "Working on my one k igloo likes goal! Any like helps a lot!",
            "Please visit my igloo and leave a like for one k! Thank you so much!"
        ],
        pIdx: 0,
        load() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed.goal) this.goal = Number(parsed.goal) || 1000;
                    if (parsed.likes) this.likes = Number(parsed.likes) || 0;
                    if (parsed.autoDance !== undefined) this.autoDance = parsed.autoDance;
                    if (parsed.rotatePhrases !== undefined) this.rotatePhrases = parsed.rotatePhrases;
                    if (parsed.randomInterval !== undefined) this.randomInterval = parsed.randomInterval;
                }
            } catch (e) { }
            this.validate();
        },
        save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    goal: this.goal,
                    likes: this.likes,
                    autoDance: this.autoDance,
                    rotatePhrases: this.rotatePhrases,
                    randomInterval: this.randomInterval
                }));
            } catch (e) { }
        },
        validate() {
            if (this.goal <= 0) {
                this.error = 'Digite uma meta válida!';
            } else if (this.goal <= this.likes) {
                this.error = `Meta já batida! Você possui ${this.likes} likes.`;
            } else {
                this.error = null;
            }
        },
        percent() {
            if (this.goal <= 0) return '00.00%';
            const fixed = Math.max(0, (this.likes / this.goal) * 100).toFixed(2);
            const [i, d] = fixed.split('.');
            return `${i.padStart(2, '0')}.${d}%`;
        },
        ratio() {
            return this.goal <= 0 ? 0 : Math.min(100, Math.max(0, (this.likes / this.goal) * 100));
        },
        getNextPhrase() {
            if (!this.rotatePhrases) return this.phrases[0];
            const p = this.phrases[this.pIdx % this.phrases.length];
            this.pIdx++;
            return p;
        }
    };
    state.load();

    // 4. Motor de Automação & Envio de Chat
    let botTimer = null;

    // Escuta sincronização de likes via postMessage (compatível com Firefox)
    window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'CPJ_LIKES_SYNC' && typeof e.data.likes === 'number' && e.data.likes !== state.likes) {
            state.likes = e.data.likes;
            state.save();
            state.validate();
            updateUI();
        }
    });

    function queryLikesFromBridge() {
        if (pageWin.__CPJ_YUKON_BRIDGE__) {
            const l = pageWin.__CPJ_YUKON_BRIDGE__.detectLikes();
            if (typeof l === 'number' && l !== state.likes) {
                state.likes = l;
                state.save();
                state.validate();
                updateUI();
                return;
            }
        }
        // Fallback direto via pageWin (Firefox wrappedJSObject)
        try {
            const games = [
                pageWin.game,
                pageWin.yukon?.game,
                ...(pageWin.Phaser?.GAMES ? Object.values(pageWin.Phaser.GAMES) : [])
            ].filter(Boolean);
            for (const g of games) {
                for (const sc of (g.scene?.scenes || [])) {
                    const client = sc.world?.client || sc.client;
                    if (client?.penguin) {
                        const l = client.penguin.iglooLikes ?? client.penguin.likes ?? client.penguin.igloo?.likes ?? client.iglooLikes;
                        if (typeof l === 'number' && l !== state.likes) {
                            state.likes = l;
                            state.save();
                            state.validate();
                            updateUI();
                            return;
                        }
                    }
                }
            }
        } catch (e) { }
    }
    setInterval(queryLikesFromBridge, 3000);

    function dance() {
        try {
            const target = document.querySelector('canvas') || document.body;
            target.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', code: 'KeyD', keyCode: 68, which: 68, bubbles: true }));
            setTimeout(() => target.dispatchEvent(new KeyboardEvent('keyup', { key: 'd', code: 'KeyD', keyCode: 68, which: 68, bubbles: true })), 80);
        } catch (e) { }
    }

    function sendChat(msg) {
        if (!msg) return;

        // 1. Copia a frase atual para a área de transferência (Ctrl + C)
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(msg).catch(() => { });
            }
        } catch (e) { }

        // 2. Localiza o input de chat específico do CPJ
        let chatInps = Array.from(document.querySelectorAll('input[autocomplete="new-password"], input[type="text"], input:not([type]), textarea'))
            .filter(el => !el.closest('#cpj-modal') && !el.closest('#cpj-igloo-booster-modal') && el.type !== 'hidden' && el.type !== 'checkbox' && el.type !== 'button' && el.type !== 'submit');

        // Se o chat estiver fechado, simula Enter para abrir o campo
        if (chatInps.length === 0) {
            const canvas = document.querySelector('canvas') || document.body;
            canvas.focus?.();
            const PageKE = pageWin.KeyboardEvent || window.KeyboardEvent;
            ['keydown', 'keyup'].forEach(type => {
                const ev = new PageKE(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
                canvas.dispatchEvent(ev);
                window.dispatchEvent(ev);
            });
            chatInps = Array.from(document.querySelectorAll('input[autocomplete="new-password"], input[type="text"], input:not([type]), textarea'))
                .filter(el => !el.closest('#cpj-modal') && !el.closest('#cpj-igloo-booster-modal') && el.type !== 'hidden' && el.type !== 'checkbox' && el.type !== 'button' && el.type !== 'submit');
        }

        // Seleciona EXATAMENTE UM input (o visível ou primeiro) para NUNCA duplicar
        const inp = chatInps.find(el => el.offsetParent !== null) || chatInps[0];
        if (!inp) return;

        // 3. Foco, seleção e limpeza prévia (impede duplicação do texto)
        inp.focus();
        inp.click();
        inp.value = '';
        if (typeof inp.select === 'function') inp.select();

        // 4. Cola o texto no chat (Ctrl + V)
        let pasted = false;
        try {
            pasted = document.execCommand('insertText', false, msg);
        } catch (e) { }

        // Se execCommand não preencheu exatamente o texto, força o valor exato (sem duplicar)
        if (!pasted || inp.value !== msg) {
            inp.value = msg;
        }

        // Dispara eventos padrão de input e change (sem InputEvent 'insertFromPaste' para evitar que o navegador cole uma segunda vez)
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));

        // 5. Envio garantido: Enter + Clique no Botão de Envio (seta '>') na tela + Chamada Direta
        setTimeout(() => {
            inp.focus();

            // A) Dispara Enter nativo com a classe do pageWin (bypassa restrições Xray do Firefox)
            const PageKE = pageWin.KeyboardEvent || window.KeyboardEvent;
            ['keydown', 'keypress', 'keyup'].forEach(type => {
                const ev = new PageKE(type, {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    charCode: type === 'keypress' ? 13 : 0,
                    bubbles: true,
                    cancelable: true
                });
                inp.dispatchEvent(ev);
            });

            // B) Clica no Botão de Envio do Chat (a seta branca dentro do círculo azul no jogo)
            // Em 1520x960, o botão 'chat_send_button' do Yukon fica exatamente em x=1026, y=923 (~67.5% da largura, ~96.1% da altura)
            const canvas = document.querySelector('canvas');
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const clickX = rect.left + (rect.width * (1026 / 1520));
                const clickY = rect.top + (rect.height * (923 / 960));
                const PE = pageWin.PointerEvent || pageWin.MouseEvent || PointerEvent;
                ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evtType => {
                    const ev = new PE(evtType, {
                        clientX: clickX,
                        clientY: clickY,
                        screenX: clickX,
                        screenY: clickY,
                        bubbles: true,
                        cancelable: true,
                        button: 0,
                        buttons: 1,
                        view: pageWin
                    });
                    canvas.dispatchEvent(ev);
                });
            }

            // C) Clica em qualquer botão de envio DOM se existir
            const sendBtn = inp.parentElement?.querySelector('button, [role="button"], [type="submit"]') ||
                document.querySelector('.chat-send, [data-action="send"], #chat-send');
            if (sendBtn && typeof sendBtn.click === 'function') sendBtn.click();

            // D) Enter no formulário se houver
            if (inp.form) {
                try { inp.form.requestSubmit(); } catch (e) {
                    inp.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
            }

            // E) Enter no canvas e na janela (onde o Phaser escuta o teclado)
            if (canvas) {
                ['keydown', 'keyup'].forEach(type => {
                    const ev = new PageKE(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true });
                    canvas.dispatchEvent(ev);
                    window.dispatchEvent(ev);
                });
            }

            // F) Chamada direta no motor Yukon se qualquer cena estiver acessível
            try {
                const games = [
                    pageWin.game,
                    pageWin.yukon?.game,
                    pageWin.world?.game,
                    pageWin.air?.game,
                    ...(pageWin.Phaser?.GAMES ? Object.values(pageWin.Phaser.GAMES) : [])
                ].filter(Boolean);
                for (const g of games) {
                    const main = g.scene?.getScene?.('Main');
                    if (main) {
                        if (main.chatInput) {
                            if (typeof main.chatInput.setText === 'function') main.chatInput.setText(msg);
                            if (typeof main.chatInput.callback === 'function') main.chatInput.callback();
                        }
                        if (typeof main.onChatSend === 'function') main.onChatSend();
                    }
                }
            } catch (e) { }

            window.postMessage({ type: 'CPJ_TRIGGER_ENTER' }, '*');
        }, 70);
    }

    function botTick() {
        if (!state.running) return;

        if (state.autoDance && !state.danced) {
            dance();
            state.danced = true;
        }

        const msg = state.getNextPhrase();
        sendChat(msg);

        const nextPhrase = state.rotatePhrases ? state.phrases[state.pIdx % state.phrases.length] : state.phrases[0];
        const pEl = document.getElementById('cpj-msg');
        if (pEl) pEl.textContent = `"${nextPhrase}"`;

        // Intervalo atualizado para 9s a 11s para maior segurança
        const delay = state.randomInterval
            ? Math.floor(Math.random() * 2000) + 9000
            : 10000;
        botTimer = setTimeout(botTick, delay);
    }

    // 5. Interface Gráfica (Modal Club Penguin)
    const launcher = document.createElement('div');
    launcher.id = 'cpj-launcher';
    launcher.className = 'cpj-launcher';
    launcher.title = 'Abrir IglooLiker 3000 (Atalho: F9)';
    launcher.innerHTML = ICONS.igloo;
    document.body.appendChild(launcher);

    const modal = document.createElement('div');
    modal.id = 'cpj-modal';
    modal.className = 'cpj-modal cpj-closed';
    modal.innerHTML = `
        <div class="cpj-header" id="cpj-drag">
            <h2 class="cpj-title">${ICONS.igloo} IglooLiker 3000</h2>
            <div style="display:flex;gap:6px;">
                <button class="cpj-cbtn" id="cpj-min" title="Minimizar">${ICONS.min}</button>
                <button class="cpj-cbtn" id="cpj-close" title="Fechar (Mantém ativo)">${ICONS.close}</button>
            </div>
        </div>
        <div class="cpj-content">
            <div class="cpj-status">
                <div><span class="cpj-dot active"></span><span>IglooLiker 3000</span></div>
                <div><span class="cpj-dot" id="cpj-sdot"></span><span id="cpj-stxt">Parado</span></div>
            </div>
            <div class="cpj-card">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;font-weight:700;">
                    <span>${ICONS.igloo} Progresso do Iglu</span>
                    <span id="cpj-badge" style="background:#002b4d;border:1.5px solid #00e5ff;border-radius:12px;padding:2px 8px;color:#00ffff;">00.00%</span>
                </div>
                <div class="cpj-row">
                    <div class="cpj-col">
                        <span class="cpj-tag">Likes Atuais</span>
                        <input type="text" inputmode="numeric" id="cpj-likes-inp" class="cpj-input-pill cpj-input-likes" style="display:block!important;visibility:visible!important;opacity:1!important;width:110px!important;height:36px!important;background:#002d55!important;border:2px solid #50d0ff!important;color:#ffea79!important;border-radius:18px!important;font-size:17px!important;font-weight:700!important;text-align:center!important;-moz-appearance:none!important;appearance:none!important;" value="${state.likes}" title="Likes da conta (detectado automaticamente ou digite)">
                    </div>
                    <span style="font-size:20px;color:#00e5ff;font-weight:700;margin-top:16px;">/</span>
                    <div class="cpj-col">
                        <span class="cpj-tag">Meta (Editar)</span>
                        <input type="text" inputmode="numeric" id="cpj-goal" class="cpj-input-pill cpj-input-goal" style="display:block!important;visibility:visible!important;opacity:1!important;width:110px!important;height:36px!important;background:#002d55!important;border:2px solid #00e5ff!important;color:#ffffff!important;border-radius:18px!important;font-size:17px!important;font-weight:700!important;text-align:center!important;-moz-appearance:none!important;appearance:none!important;" value="${state.goal}">
                    </div>
                </div>
                <div class="cpj-error" id="cpj-err"></div>
                <div class="cpj-track"><div class="cpj-fill" id="cpj-fill" style="width:0%;"></div></div>
                <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#e0f7ff;">
                    <span id="cpj-ltxt">0 curtidas</span><span id="cpj-gtxt">Meta: 1000</span>
                </div>
            </div>

            <!-- Controles e Checkboxes -->
            <div class="cpj-check-row ${state.autoDance ? 'checked' : ''}" id="cpj-opt-dance">
                <div class="cpj-box">${ICONS.check}</div>
                <span>Auto-Dançar ('D')</span>
            </div>
            <div class="cpj-check-row ${state.rotatePhrases ? 'checked' : ''}" id="cpj-opt-rotate">
                <div class="cpj-box">${ICONS.check}</div>
                <span>Alternar 4 frases de likes</span>
            </div>
            <div class="cpj-check-row ${state.randomInterval ? 'checked' : ''}" id="cpj-opt-jitter">
                <div class="cpj-box">${ICONS.check}</div>
                <span>Anti-Spam randômico (9s a 11s)</span>
            </div>

            <div style="background:#003b70;border:1.5px solid #00e5ff;border-radius:10px;padding:8px;margin-top:6px;margin-bottom:12px;font-size:12px;">
                <div style="font-size:10px;color:#8edeff;font-weight:700;text-transform:uppercase;">Próxima Mensagem (Likes):</div>
                <div id="cpj-msg">"${state.phrases[0]}"</div>
            </div>

            <div class="cpj-actions-row">
                <button class="cpj-btn-toggle start" id="cpj-toggle-btn">${ICONS.play} Ligar Bot</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    function updateUI() {
        const likesInp = document.getElementById('cpj-likes-inp');
        if (likesInp && document.activeElement !== likesInp) {
            likesInp.value = state.likes;
        }

        document.getElementById('cpj-ltxt').textContent = `${state.likes} curtidas`;
        document.getElementById('cpj-gtxt').textContent = `Meta: ${state.goal}`;
        document.getElementById('cpj-badge').textContent = state.percent();
        document.getElementById('cpj-fill').style.width = `${state.ratio()}%`;

        // Banner de erro
        const errEl = document.getElementById('cpj-err');
        const gInp = document.getElementById('cpj-goal');
        if (state.error) {
            errEl.textContent = state.error;
            errEl.style.display = 'block';
            gInp.classList.add('has-error');
        } else {
            errEl.style.display = 'none';
            gInp.classList.remove('has-error');
        }

        // Sincronização dos checkboxes
        document.getElementById('cpj-opt-dance').classList.toggle('checked', !!state.autoDance);
        document.getElementById('cpj-opt-rotate').classList.toggle('checked', !!state.rotatePhrases);
        document.getElementById('cpj-opt-jitter').classList.toggle('checked', !!state.randomInterval);

        document.getElementById('cpj-sdot').className = `cpj-dot ${state.running ? 'active' : ''}`;
        document.getElementById('cpj-stxt').textContent = state.running ? 'Ativo & Dançando' : 'Parado';

        const toggleBtn = document.getElementById('cpj-toggle-btn');
        if (toggleBtn) {
            if (state.running) {
                toggleBtn.className = 'cpj-btn-toggle stop';
                toggleBtn.innerHTML = `${ICONS.stop} Pausar Bot`;
            } else {
                toggleBtn.className = 'cpj-btn-toggle start';
                toggleBtn.innerHTML = `${ICONS.play} Ligar Bot`;
            }
        }
    }

    // 6. Listeners e Eventos
    launcher.addEventListener('click', () => modal.classList.toggle('cpj-closed'));

    // Fechar pelo 'X' apenas esconde o visual do modal, mantendo o bot ativo se estiver rodando
    document.getElementById('cpj-close').addEventListener('click', (e) => {
        e.stopPropagation();
        modal.classList.add('cpj-closed');
    });

    document.getElementById('cpj-likes-inp').addEventListener('input', (e) => {
        const clean = e.target.value.replace(/\D/g, '');
        e.target.value = clean;
        state.likes = parseInt(clean, 10) || 0;
        state.save();
        state.validate();
        updateUI();
    });

    document.getElementById('cpj-goal').addEventListener('input', (e) => {
        const clean = e.target.value.replace(/\D/g, '');
        e.target.value = clean;
        state.goal = parseInt(clean, 10) || 0;
        state.save();
        state.validate();
        updateUI();
    });

    // Toggle Checkboxes
    document.getElementById('cpj-opt-dance').addEventListener('click', (e) => {
        state.autoDance = !state.autoDance;
        state.save();
        e.currentTarget.classList.toggle('checked', state.autoDance);
    });

    document.getElementById('cpj-opt-rotate').addEventListener('click', (e) => {
        state.rotatePhrases = !state.rotatePhrases;
        state.save();
        e.currentTarget.classList.toggle('checked', state.rotatePhrases);
        const nextPhrase = state.rotatePhrases ? state.phrases[state.pIdx % state.phrases.length] : state.phrases[0];
        document.getElementById('cpj-msg').textContent = `"${nextPhrase}"`;
    });

    document.getElementById('cpj-opt-jitter').addEventListener('click', (e) => {
        state.randomInterval = !state.randomInterval;
        state.save();
        e.currentTarget.classList.toggle('checked', state.randomInterval);
    });

    // Start / Stop Toggle Único
    document.getElementById('cpj-toggle-btn').addEventListener('click', () => {
        state.running = !state.running;
        if (state.running) {
            state.danced = false;
            updateUI();
            botTick();
        } else {
            if (botTimer) clearTimeout(botTimer);
            updateUI();
        }
    });

    // Minimizar
    let isMin = false;
    document.getElementById('cpj-min').addEventListener('click', () => {
        isMin = !isMin;
        modal.classList.toggle('minimized', isMin);
        document.getElementById('cpj-min').innerHTML = isMin ? ICONS.max : ICONS.min;
    });

    // Arraste livre em 2D (X e Y) por qualquer canto da tela
    let drag = false, offX = 0, offY = 0;
    document.getElementById('cpj-drag').addEventListener('mousedown', (e) => {
        if (e.target.closest('.cpj-cbtn')) return;
        drag = true;
        offX = e.clientX - modal.getBoundingClientRect().left;
        offY = e.clientY - modal.getBoundingClientRect().top;
        modal.style.right = 'auto';
    });

    document.addEventListener('mousemove', (e) => {
        if (!drag) return;
        const x = Math.max(10, Math.min(window.innerWidth - modal.offsetWidth - 10, e.clientX - offX));
        const y = Math.max(10, Math.min(window.innerHeight - modal.offsetHeight - 10, e.clientY - offY));
        modal.style.left = `${x}px`;
        modal.style.top = `${y}px`;
    });

    document.addEventListener('mouseup', () => { drag = false; });

    // Atalho F9
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F9') modal.classList.toggle('cpj-closed');
    });

    updateUI();
})();
