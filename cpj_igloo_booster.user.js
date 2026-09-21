// ==UserScript==
// @name         IglooLiker 3000 (CPJ Igloo Likes AFK Booster)
// @namespace    https://github.com/caiovski/iglooliker-3000
// @version      3.1.0
// @description  Automação AFK universal para likes de igloo no CPJ com dança, wave (anti-inatividade), chat nativo Yukon simulando digitação/colagem, estúdio de frases customizadas, isolamento multi-abas e interface Club Penguin bilíngue (Compatível com Firefox e Chrome).
// @author       Caiovski: https://github.com/caiovski
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

    // 1. Ícones Vetoriais SVG (Zero Emojis - Iglu Branco da Neve e Ícones Puros)
    const ICONS = {
        igloo: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.42 3.12 7.24L5 20h14l-.12-.76C20.8 17.42 22 14.85 22 12c0-5.52-4.48-10-10-10z" fill="#ffffff"/><path d="M12 4c-4.41 0-8 3.59-8 8 0 2.25.93 4.28 2.43 5.75L7 18h10l.57-.25C19.07 16.28 20 14.25 20 12c0-4.41-3.59-8-8-8z" fill="#e6f7ff"/><path d="M10 14h4v6h-4z" fill="#002d55"/><path d="M10 14a2 2 0 0 1 4 0v6h-4v-6z" fill="#001830"/></svg>`,
        close: `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#ffffff"/></svg>`,
        min: `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 19h12v2H6z" fill="#ffffff"/></svg>`,
        max: `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 4h16v16H4zm2 4v10h12V8z" fill="#ffffff"/></svg>`,
        check: `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#00284d" stroke="#00284d" stroke-width="1.5"/></svg>`,
        play: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5v14l11-7z" fill="#ffffff"/></svg>`,
        stop: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6h12v12H6z" fill="#ffffff"/></svg>`,
        chevron: `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 10l5 5 5-5z" fill="#00e5ff"/></svg>`,
        edit: `<svg viewBox="0 0 24 24" width="13" height="13"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#ffffff"/></svg>`,
        trash: `<svg viewBox="0 0 24 24" width="13" height="13"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#ffffff"/></svg>`,
        eyeClosed: `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 17c-3.9 0-7.3-2.2-9-5.5.6-1.2 1.5-2.2 2.5-3.1L3.8 6.7 5.2 5.3l14.1 14.1-1.4 1.4-2.3-2.3c-1.1.7-2.3 1.1-3.6 1.1zm-4.7-6.1c.4 1.5 1.7 2.6 3.2 2.6.5 0 1-.1 1.4-.4l-4.2-4.2c-.2.6-.4 1.3-.4 2zm13.7.6c-.7 1.6-1.8 3-3.2 4.1l-1.5-1.5c1.1-.8 2-1.8 2.7-3.1-1.7-3.3-5.1-5.5-9-5.5-1.1 0-2.2.2-3.2.5L5.3 4.6C7.3 3.9 9.6 3.5 12 3.5c5 0 9.3 3.1 11 8.5z" fill="#cfd8dc"/></svg>`,
        eyeOpen: `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#cfd8dc"/></svg>`
    };

    // 2. Estilos CSS com Forçamento Estrito (!important) para Club Penguin HUD
    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');

        :root {
            --cpj-scale: 1;
        }

        #cpj-modal {
            position: fixed !important;
            top: 25px;
            right: 25px;
            width: 370px;
            height: 500px;
            min-width: 270px;
            min-height: 310px;
            max-width: 95vw;
            max-height: 95vh;
            background: linear-gradient(180deg, #00a2f5 0%, #0088d8 50%, #0077c4 100%) !important;
            border: 3.5px solid #00e5ff !important;
            outline: 2px solid #004077 !important;
            border-radius: 20px !important;
            box-shadow: 0 10px 30px rgba(0, 20, 60, 0.65), inset 0 2px 0 #66f3ff !important;
            font-family: 'Fredoka', 'Burbank Small', 'Comic Sans MS', sans-serif !important;
            color: #ffffff !important;
            user-select: none !important;
            z-index: 2147483647 !important;
            padding: calc(14px * var(--cpj-scale, 1)) calc(16px * var(--cpj-scale, 1)) !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            pointer-events: auto !important;
            isolation: isolate !important;
        }
        #cpj-modal.cpj-closed { display: none !important; }
        #cpj-modal.minimized {
            height: auto !important;
            min-height: 0 !important;
            padding: calc(10px * var(--cpj-scale, 1)) calc(16px * var(--cpj-scale, 1)) !important;
        }
        #cpj-modal.minimized .cpj-content { display: none !important; }
        #cpj-modal.minimized .cpj-header {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
            border-bottom: none !important;
        }
        #cpj-modal.minimized .cpj-resizer { display: none !important; }

        /* 8-Way Window Resizers */
        .cpj-resizer {
            position: absolute !important;
            z-index: 100 !important;
        }
        .cpj-resizer-n {
            top: -4px !important;
            left: 14px !important;
            right: 14px !important;
            height: 10px !important;
            cursor: n-resize !important;
        }
        .cpj-resizer-s {
            bottom: -4px !important;
            left: 14px !important;
            right: 14px !important;
            height: 10px !important;
            cursor: s-resize !important;
        }
        .cpj-resizer-w {
            top: 14px !important;
            bottom: 14px !important;
            left: -4px !important;
            width: 10px !important;
            cursor: w-resize !important;
        }
        .cpj-resizer-e {
            top: 14px !important;
            bottom: 14px !important;
            right: -4px !important;
            width: 10px !important;
            cursor: e-resize !important;
        }
        .cpj-resizer-nw {
            top: -4px !important;
            left: -4px !important;
            width: 16px !important;
            height: 16px !important;
            cursor: nw-resize !important;
        }
        .cpj-resizer-ne {
            top: -4px !important;
            right: -4px !important;
            width: 16px !important;
            height: 16px !important;
            cursor: ne-resize !important;
        }
        .cpj-resizer-sw {
            bottom: -4px !important;
            left: -4px !important;
            width: 16px !important;
            height: 16px !important;
            cursor: sw-resize !important;
        }
        .cpj-resizer-se {
            bottom: -4px !important;
            right: -4px !important;
            width: 18px !important;
            height: 18px !important;
            cursor: se-resize !important;
        }

        .cpj-content {
            flex: 1 !important;
            min-height: 0 !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding-right: 4px !important;
            scrollbar-width: thin !important;
            scrollbar-color: #00e5ff #002547 !important;
        }
        .cpj-content::-webkit-scrollbar {
            width: 6px !important;
        }
        .cpj-content::-webkit-scrollbar-track {
            background: #002547 !important;
            border-radius: 4px !important;
        }
        .cpj-content::-webkit-scrollbar-thumb {
            background: #00e5ff !important;
            border-radius: 4px !important;
        }
        .cpj-content::-webkit-scrollbar-thumb:hover {
            background: #66f3ff !important;
        }

        #cpj-launcher {
            position: fixed !important;
            top: 15px !important;
            right: 38px !important;
            width: 52px !important;
            height: 52px !important;
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
            pointer-events: auto !important;
            isolation: isolate !important;
        }
        #cpj-launcher:hover { transform: scale(1.1) !important; }
        #cpj-launcher svg {
            width: 28px !important;
            height: 28px !important;
        }

        .cpj-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            margin-bottom: calc(10px * var(--cpj-scale, 1)) !important;
            padding-bottom: calc(6px * var(--cpj-scale, 1)) !important;
            border-bottom: 2px solid rgba(0, 229, 255, 0.35) !important;
            cursor: move !important;
        }
        .cpj-title {
            font-family: 'Fredoka', 'Burbank Small', 'Comic Sans MS', sans-serif !important;
            font-size: calc(20px * var(--cpj-scale, 1)) !important;
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
            gap: calc(8px * var(--cpj-scale, 1)) !important;
        }

        .cpj-cbtn {
            width: calc(30px * var(--cpj-scale, 1)) !important;
            height: calc(30px * var(--cpj-scale, 1)) !important;
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
            border-radius: calc(25px * var(--cpj-scale, 1)) !important;
            padding: calc(6px * var(--cpj-scale, 1)) calc(14px * var(--cpj-scale, 1)) !important;
            display: flex !important;
            justify-content: space-between !important;
            font-size: calc(13px * var(--cpj-scale, 1)) !important;
            margin-bottom: calc(10px * var(--cpj-scale, 1)) !important;
        }
        .cpj-dot {
            width: calc(10px * var(--cpj-scale, 1)) !important;
            height: calc(10px * var(--cpj-scale, 1)) !important;
            border-radius: 50% !important;
            background: #ff4757 !important;
            border: 1.5px solid #ffffff !important;
            display: inline-block !important;
            margin-right: calc(6px * var(--cpj-scale, 1)) !important;
        }
        .cpj-dot.active { background: #2ed573 !important; box-shadow: 0 0 8px #2ed573 !important; }

        /* Dropdown de Idioma Acima do Progresso */
        .cpj-lang-wrap {
            position: relative !important;
            margin-bottom: calc(10px * var(--cpj-scale, 1)) !important;
            width: 100% !important;
        }
        .cpj-lang-btn {
            width: 100% !important;
            background: #002d55 !important;
            border: 2px solid #00e5ff !important;
            border-radius: calc(12px * var(--cpj-scale, 1)) !important;
            padding: calc(6px * var(--cpj-scale, 1)) calc(12px * var(--cpj-scale, 1)) !important;
            color: #ffffff !important;
            font-family: 'Fredoka', sans-serif !important;
            font-size: calc(12px * var(--cpj-scale, 1)) !important;
            font-weight: 600 !important;
            letter-spacing: 0.3px !important;
            cursor: pointer !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.4) !important;
        }
        .cpj-lang-btn:hover { background: #003b70 !important; }
        .cpj-lang-menu {
            display: none;
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            background: #002447 !important;
            border: 2px solid #00e5ff !important;
            border-radius: calc(12px * var(--cpj-scale, 1)) !important;
            overflow: hidden !important;
            z-index: 1000 !important;
            margin-top: 4px !important;
            box-shadow: 0 8px 20px rgba(0,0,0,0.65) !important;
        }
        .cpj-lang-menu.open { display: block !important; }
        .cpj-lang-item {
            padding: calc(8px * var(--cpj-scale, 1)) calc(12px * var(--cpj-scale, 1)) !important;
            font-size: calc(12px * var(--cpj-scale, 1)) !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            color: #ffffff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            transition: background 0.15s !important;
        }
        .cpj-lang-item:hover { background: #004d8c !important; color: #00e5ff !important; }
        .cpj-lang-item.selected { background: #005c9e !important; color: #ffe853 !important; }

        /* Card de Progresso do Iglu */
        .cpj-card {
            background: linear-gradient(180deg, #004d8c 0%, #003666 100%) !important;
            border: calc(2.5px * var(--cpj-scale, 1)) solid #00e5ff !important;
            border-radius: calc(16px * var(--cpj-scale, 1)) !important;
            padding: calc(12px * var(--cpj-scale, 1)) calc(14px * var(--cpj-scale, 1)) !important;
            margin-bottom: calc(12px * var(--cpj-scale, 1)) !important;
        }
        .cpj-row {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: calc(12px * var(--cpj-scale, 1)) !important;
            margin-bottom: calc(10px * var(--cpj-scale, 1)) !important;
        }
        .cpj-col {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            min-width: calc(110px * var(--cpj-scale, 1)) !important;
        }
        .cpj-tag {
            font-size: calc(11px * var(--cpj-scale, 1)) !important;
            color: #8edeff !important;
            text-transform: uppercase !important;
            font-weight: 700 !important;
            margin-bottom: calc(4px * var(--cpj-scale, 1)) !important;
        }

        .cpj-input-pill {
            -moz-appearance: none !important;
            appearance: none !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: calc(110px * var(--cpj-scale, 1)) !important;
            height: calc(36px * var(--cpj-scale, 1)) !important;
            background: #002d55 !important;
            border-radius: calc(18px * var(--cpj-scale, 1)) !important;
            font-family: 'Fredoka', sans-serif !important;
            font-size: calc(17px * var(--cpj-scale, 1)) !important;
            font-weight: 700 !important;
            text-align: center !important;
            padding: calc(4px * var(--cpj-scale, 1)) calc(8px * var(--cpj-scale, 1)) !important;
            outline: none !important;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.6) !important;
            box-sizing: border-box !important;
        }
        .cpj-input-likes { border: 2px solid #50d0ff !important; color: #ffea79 !important; }
        .cpj-input-goal { border: 2px solid #00e5ff !important; color: #ffffff !important; }

        .cpj-error {
            background: rgba(255, 71, 87, 0.25) !important;
            border: 1.5px solid #ff4757 !important;
            border-radius: calc(8px * var(--cpj-scale, 1)) !important;
            padding: calc(5px * var(--cpj-scale, 1)) calc(8px * var(--cpj-scale, 1)) !important;
            font-size: calc(11px * var(--cpj-scale, 1)) !important;
            color: #ffb8b8 !important;
            text-align: center !important;
            margin-bottom: calc(8px * var(--cpj-scale, 1)) !important;
            font-weight: 700 !important;
            display: none;
        }
        .cpj-track {
            width: 100% !important;
            height: calc(22px * var(--cpj-scale, 1)) !important;
            background: #001f3f !important;
            border: 2px solid #00e5ff !important;
            border-radius: calc(14px * var(--cpj-scale, 1)) !important;
            overflow: hidden !important;
            margin-bottom: calc(4px * var(--cpj-scale, 1)) !important;
        }
        .cpj-fill {
            height: 100% !important;
            background: linear-gradient(180deg, #00ffff 0%, #00b4d8 50%, #0077c6 100%) !important;
            border-radius: calc(12px * var(--cpj-scale, 1)) !important;
            transition: width 0.35s ease !important;
        }

        /* Tabs de Navegação */
        .cpj-tabs-bar {
            display: flex !important;
            gap: calc(6px * var(--cpj-scale, 1)) !important;
            margin-bottom: calc(12px * var(--cpj-scale, 1)) !important;
            width: 100% !important;
        }
        .cpj-tab-btn {
            flex: 1 !important;
            background: #003b70 !important;
            border: 2px solid #0077c4 !important;
            border-radius: calc(12px * var(--cpj-scale, 1)) !important;
            padding: calc(7px * var(--cpj-scale, 1)) calc(4px * var(--cpj-scale, 1)) !important;
            color: #b3e5fc !important;
            font-family: 'Fredoka', sans-serif !important;
            font-size: calc(12px * var(--cpj-scale, 1)) !important;
            font-weight: 600 !important;
            letter-spacing: 0.3px !important;
            text-transform: uppercase !important;
            cursor: pointer !important;
            text-align: center !important;
            transition: all 0.15s ease !important;
        }
        .cpj-tab-btn:hover { background: #004d8c !important; color: #ffffff !important; }
        .cpj-tab-btn.active {
            background: linear-gradient(180deg, #00b4ff 0%, #006eb8 100%) !important;
            border-color: #00e5ff !important;
            color: #ffffff !important;
            box-shadow: inset 0 1px 0 #7fe3ff, 0 2px 6px rgba(0,0,0,0.3) !important;
        }

        /* Paineis de Conteúdo das Abas */
        .cpj-tab-panel { display: none !important; }
        .cpj-tab-panel.active { display: block !important; }

        .cpj-check-row {
            display: flex !important;
            align-items: center !important;
            gap: calc(10px * var(--cpj-scale, 1)) !important;
            cursor: pointer !important;
            font-size: calc(13px * var(--cpj-scale, 1)) !important;
            font-weight: 700 !important;
            margin-bottom: calc(8px * var(--cpj-scale, 1)) !important;
        }
        .cpj-box {
            width: calc(20px * var(--cpj-scale, 1)) !important;
            height: calc(20px * var(--cpj-scale, 1)) !important;
            background: #ffffff !important;
            border: 2px solid #00284d !important;
            border-radius: calc(4px * var(--cpj-scale, 1)) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
        }
        .cpj-check-row.checked .cpj-box { background: #ffcc00 !important; }
        .cpj-check-row.checked .cpj-box svg { display: block !important; }
        .cpj-box svg { display: none; }

        /* Slider de Neve / Laranja com Animação de Entrada/Saída */
        .cpj-slider-container {
            background: #002d55 !important;
            border: 2px solid #0077c4 !important;
            border-radius: calc(12px * var(--cpj-scale, 1)) !important;
            padding: calc(10px * var(--cpj-scale, 1)) calc(12px * var(--cpj-scale, 1)) !important;
            margin-top: calc(8px * var(--cpj-scale, 1)) !important;
            margin-bottom: calc(8px * var(--cpj-scale, 1)) !important;
            max-height: 140px !important;
            opacity: 1 !important;
            transform: scaleY(1) !important;
            transform-origin: top !important;
            transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin 0.3s ease, padding 0.3s ease, transform 0.25s ease, border-width 0.3s ease !important;
            overflow: hidden !important;
        }
        .cpj-slider-container.hidden {
            max-height: 0 !important;
            opacity: 0 !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            border-width: 0 !important;
            transform: scaleY(0) !important;
            pointer-events: none !important;
        }
        .cpj-slider-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            font-size: calc(11px * var(--cpj-scale, 1)) !important;
            font-weight: 700 !important;
            color: #8edeff !important;
            margin-bottom: calc(8px * var(--cpj-scale, 1)) !important;
        }
        .cpj-slider-pill {
            background: #001f3f !important;
            border: 1.5px solid #ffaa00 !important;
            border-radius: calc(8px * var(--cpj-scale, 1)) !important;
            padding: calc(2px * var(--cpj-scale, 1)) calc(8px * var(--cpj-scale, 1)) !important;
            color: #ffcc00 !important;
            font-size: calc(12px * var(--cpj-scale, 1)) !important;
            font-weight: 900 !important;
        }
        .cpj-snow-slider {
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
            display: block !important;
            width: 100% !important;
            height: calc(12px * var(--cpj-scale, 1)) !important;
            background: #ffffff !important;
            border-radius: calc(6px * var(--cpj-scale, 1)) !important;
            outline: none !important;
            border: 2px solid #00284d !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.4) !important;
            cursor: pointer !important;
            margin: calc(8px * var(--cpj-scale, 1)) 0 !important;
            padding: 0 !important;
        }
        .cpj-snow-slider::-moz-range-track {
            background: transparent !important;
            border: none !important;
            height: calc(12px * var(--cpj-scale, 1)) !important;
        }
        .cpj-snow-slider::-moz-range-progress {
            background: transparent !important;
        }
        .cpj-snow-slider::-webkit-slider-thumb {
            -webkit-appearance: none !important;
            appearance: none !important;
            width: calc(22px * var(--cpj-scale, 1)) !important;
            height: calc(22px * var(--cpj-scale, 1)) !important;
            border-radius: 50% !important;
            background: #ffffff !important;
            border: 2.5px solid #00e5ff !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5) !important;
            cursor: pointer !important;
            transition: transform 0.1s ease !important;
        }
        .cpj-snow-slider::-webkit-slider-thumb:hover { transform: scale(1.15) !important; }
        .cpj-snow-slider::-moz-range-thumb {
            width: calc(22px * var(--cpj-scale, 1)) !important;
            height: calc(22px * var(--cpj-scale, 1)) !important;
            border-radius: 50% !important;
            background: #ffffff !important;
            border: 2.5px solid #00e5ff !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5) !important;
            cursor: pointer !important;
        }

        /* Phrases Studio CRUD */
        .cpj-studio-input-wrap {
            display: flex !important;
            gap: calc(6px * var(--cpj-scale, 1)) !important;
            margin-bottom: calc(10px * var(--cpj-scale, 1)) !important;
        }
        .cpj-studio-input {
            flex: 1 !important;
            height: calc(34px * var(--cpj-scale, 1)) !important;
            background: #002d55 !important;
            border: 2px solid #0077c4 !important;
            border-radius: calc(10px * var(--cpj-scale, 1)) !important;
            color: #ffffff !important;
            font-family: 'Fredoka', sans-serif !important;
            font-size: calc(12px * var(--cpj-scale, 1)) !important;
            padding: 0 calc(10px * var(--cpj-scale, 1)) !important;
            outline: none !important;
        }
        .cpj-studio-input:focus { border-color: #00e5ff !important; }
        .cpj-btn-add {
            background: linear-gradient(180deg, #00c6ff 0%, #0072ff 100%) !important;
            border: 1.5px solid #00e5ff !important;
            border-radius: calc(10px * var(--cpj-scale, 1)) !important;
            color: #ffffff !important;
            font-family: 'Fredoka', sans-serif !important;
            font-size: calc(11px * var(--cpj-scale, 1)) !important;
            font-weight: 700 !important;
            padding: 0 calc(10px * var(--cpj-scale, 1)) !important;
            cursor: pointer !important;
            white-space: nowrap !important;
        }
        .cpj-btn-add:disabled { opacity: 0.5 !important; cursor: not-allowed !important; }
        .cpj-phrase-list {
            max-height: calc(170px * var(--cpj-scale, 1)) !important;
            overflow-y: auto !important;
            padding-right: 4px !important;
            margin-bottom: calc(8px * var(--cpj-scale, 1)) !important;
            scrollbar-width: thin !important;
            scrollbar-color: #00e5ff #002547 !important;
        }
        .cpj-phrase-list::-webkit-scrollbar {
            width: 5px !important;
        }
        .cpj-phrase-list::-webkit-scrollbar-track {
            background: #002547 !important;
            border-radius: 3px !important;
        }
        .cpj-phrase-list::-webkit-scrollbar-thumb {
            background: #00e5ff !important;
            border-radius: 3px !important;
        }
        .cpj-phrase-item {
            background: #002d55 !important;
            border: 1.5px solid #0077c4 !important;
            border-radius: calc(10px * var(--cpj-scale, 1)) !important;
            padding: calc(6px * var(--cpj-scale, 1)) calc(10px * var(--cpj-scale, 1)) !important;
            margin-bottom: calc(6px * var(--cpj-scale, 1)) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: calc(8px * var(--cpj-scale, 1)) !important;
            font-size: calc(11.5px * var(--cpj-scale, 1)) !important;
            transition: all 0.15s ease !important;
        }
        .cpj-phrase-item.inactive {
            opacity: 0.65 !important;
            border-color: #004d8c !important;
            background: #002447 !important;
        }
        .cpj-phrase-item-text {
            flex: 1 !important;
            color: #ffffff !important;
            word-break: break-word !important;
        }
        .cpj-phrase-item.inactive .cpj-phrase-item-text {
            color: #94a3b8 !important;
            text-decoration: line-through !important;
        }
        .cpj-btn-mini {
            width: calc(26px * var(--cpj-scale, 1)) !important;
            height: calc(26px * var(--cpj-scale, 1)) !important;
            border-radius: calc(6px * var(--cpj-scale, 1)) !important;
            border: 1.5px solid #00e5ff !important;
            background: #004d8c !important;
            color: #ffffff !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 0 !important;
            transition: transform 0.15s ease, background 0.15s ease !important;
        }
        .cpj-btn-mini.eye {
            border-color: #8edeff !important;
            background: #003666 !important;
        }
        .cpj-btn-mini.eye.inactive {
            opacity: 0.65 !important;
            border-color: #607d8b !important;
            background: #001f38 !important;
        }
        .cpj-btn-mini.del {
            border-color: #ff4757 !important;
            background: #c0392b !important;
        }
        .cpj-btn-mini:hover { transform: scale(1.1) !important; }

        .cpj-actions-row { display: flex !important; width: 100% !important; margin-top: calc(12px * var(--cpj-scale, 1)) !important; }
        .cpj-btn-toggle {
            width: 100% !important;
            font-family: 'Fredoka', sans-serif !important;
            font-size: calc(16px * var(--cpj-scale, 1)) !important;
            font-weight: 700 !important;
            color: #ffffff !important;
            border: 2px solid #ffffff !important;
            border-radius: calc(22px * var(--cpj-scale, 1)) !important;
            padding: calc(10px * var(--cpj-scale, 1)) calc(16px * var(--cpj-scale, 1)) !important;
            cursor: pointer !important;
            text-transform: uppercase !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: calc(8px * var(--cpj-scale, 1)) !important;
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

        /* Icon scaling */
        .cpj-cbtn svg, .cpj-btn-toggle svg {
            width: calc(16px * var(--cpj-scale, 1)) !important;
            height: calc(16px * var(--cpj-scale, 1)) !important;
        }
        .cpj-box svg {
            width: calc(14px * var(--cpj-scale, 1)) !important;
            height: calc(14px * var(--cpj-scale, 1)) !important;
        }
        .cpj-btn-mini svg {
            width: calc(13px * var(--cpj-scale, 1)) !important;
            height: calc(13px * var(--cpj-scale, 1)) !important;
        }
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    (document.head || document.documentElement).appendChild(styleEl);

    // 3. Dicionário Bilíngue i18n
    const I18N = {
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

    // 4. Estado Reativo com Segregação (sessionStorage para abas, localStorage para frases e meta)
    const SESSION_KEY = 'cpj_tab_state_v3';
    const SHARED_KEY = 'cpj_shared_data_v3';

    const defaultPhrases = [
        { text: "Igloo liking party! Help me reach one k! Thanks for your support", enabled: true },
        { text: "Drop a like at my igloo to help me reach one k! Much appreciated!", enabled: true },
        { text: "Working on my one k igloo likes goal! Any like helps a lot!", enabled: true },
        { text: "Please visit my igloo and leave a like for one k! Thank you so much!", enabled: true }
    ];

    const state = {
        // Tab-specific (sessionStorage)
        running: false,
        autoDance: true,
        autoWave: false,
        repeatAction: false,
        actionInterval: 7,
        rotatePhrases: true,
        randomInterval: true,
        deactivatePhrases: false,
        activeTab: 'phrases',
        danced: false,
        actionDispatched: false,

        // Shared (localStorage)
        likes: 0,
        goal: 1000,
        lang: 'en',
        phrases: [...defaultPhrases],

        // Ephemeral
        error: null,
        pIdx: 0,

        load() {
            // 1. Carrega dados compartilhados do localStorage
            try {
                const rawShared = localStorage.getItem(SHARED_KEY);
                if (rawShared) {
                    const parsed = JSON.parse(rawShared);
                    if (parsed.goal) this.goal = Number(parsed.goal) || 1000;
                    if (parsed.likes) this.likes = Number(parsed.likes) || 0;
                    if (parsed.lang && (parsed.lang === 'en' || parsed.lang === 'pt')) this.lang = parsed.lang;
                    if (Array.isArray(parsed.phrases) && parsed.phrases.length > 0) {
                        this.phrases = parsed.phrases.slice(0, 6).map(p => {
                            if (typeof p === 'string') return { text: p, enabled: true };
                            if (p && typeof p.text === 'string') return { text: p.text, enabled: p.enabled !== false };
                            return { text: String(p || ''), enabled: true };
                        });
                    }
                }
            } catch (e) { }

            // 2. Carrega estado isolado da aba do sessionStorage
            try {
                const rawSession = sessionStorage.getItem(SESSION_KEY);
                if (rawSession) {
                    const parsed = JSON.parse(rawSession);
                    if (parsed.autoDance !== undefined) this.autoDance = !!parsed.autoDance;
                    if (parsed.autoWave !== undefined) this.autoWave = !!parsed.autoWave;
                    if (parsed.repeatAction !== undefined) this.repeatAction = !!parsed.repeatAction;
                    if (parsed.actionInterval !== undefined) this.actionInterval = Number(parsed.actionInterval) || 7;
                    if (parsed.rotatePhrases !== undefined) this.rotatePhrases = !!parsed.rotatePhrases;
                    if (parsed.randomInterval !== undefined) this.randomInterval = !!parsed.randomInterval;
                    if (parsed.deactivatePhrases !== undefined) this.deactivatePhrases = !!parsed.deactivatePhrases;
                    if (parsed.activeTab) this.activeTab = parsed.activeTab;
                }
            } catch (e) { }

            this.validate();
        },

        saveShared() {
            try {
                localStorage.setItem(SHARED_KEY, JSON.stringify({
                    goal: this.goal,
                    likes: this.likes,
                    lang: this.lang,
                    phrases: this.phrases
                }));
            } catch (e) { }
        },

        saveSession() {
            try {
                sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                    autoDance: this.autoDance,
                    autoWave: this.autoWave,
                    repeatAction: this.repeatAction,
                    actionInterval: this.actionInterval,
                    rotatePhrases: this.rotatePhrases,
                    randomInterval: this.randomInterval,
                    deactivatePhrases: this.deactivatePhrases,
                    activeTab: this.activeTab
                }));
            } catch (e) { }
        },

        validate() {
            const t = I18N[this.lang] || I18N.en;
            if (this.goal <= 0) {
                this.error = this.lang === 'pt' ? 'Digite uma meta válida!' : 'Enter a valid goal!';
            } else if (this.goal <= this.likes) {
                this.error = this.lang === 'pt'
                    ? `Meta já batida! Você possui ${this.likes} likes.`
                    : `Goal already reached! You have ${this.likes} likes.`;
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
            const active = this.phrases.filter(p => p.enabled);
            if (active.length === 0) return '';
            if (!this.rotatePhrases || active.length === 1) return active[0].text;
            const p = active[this.pIdx % active.length];
            this.pIdx++;
            return p.text;
        }
    };
    state.load();

    // 5. Motor de Ações (Dança, Wave, Alternância e Repetição)
    let botTimer = null;
    let actionTimer = null;
    let actionCycleIndex = 0;

    function dance() {
        try {
            const target = document.querySelector('canvas') || document.body;
            const PageKE = pageWin.KeyboardEvent || window.KeyboardEvent;
            ['keydown', 'keyup'].forEach(type => {
                const ev = new PageKE(type, { key: 'd', code: 'KeyD', keyCode: 68, which: 68, bubbles: true });
                target.dispatchEvent(ev);
                window.dispatchEvent(ev);
            });
        } catch (e) { }
    }

    function wave() {
        try {
            const target = document.querySelector('canvas') || document.body;
            const PageKE = pageWin.KeyboardEvent || window.KeyboardEvent;
            ['keydown', 'keyup'].forEach(type => {
                const ev = new PageKE(type, { key: 'w', code: 'KeyW', keyCode: 87, which: 87, bubbles: true });
                target.dispatchEvent(ev);
                window.dispatchEvent(ev);
            });
        } catch (e) { }
    }

    function executeActiveAction() {
        if (state.autoDance && state.autoWave) {
            // Opção A: Alternância sequencial
            if (actionCycleIndex % 2 === 0) {
                dance();
            } else {
                wave();
            }
            actionCycleIndex++;
        } else if (state.autoDance) {
            dance();
        } else if (state.autoWave) {
            wave();
        }
    }

    function startActionLoop() {
        stopActionLoop();
        executeActiveAction();
        if (state.repeatAction && state.running) {
            const ms = Math.max(5, Math.min(10, state.actionInterval)) * 1000;
            actionTimer = setInterval(() => {
                if (state.running) {
                    executeActiveAction();
                }
            }, ms);
        }
    }

    function stopActionLoop() {
        if (actionTimer) {
            clearInterval(actionTimer);
            actionTimer = null;
        }
    }

    // 6. Motor de Envio de Chat (100% Preservado & Confiável)
    function sendChat(msg) {
        if (!msg || state.deactivatePhrases) return;

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

        // Seleciona EXATAMENTE UM input para NUNCA duplicar
        const inp = chatInps.find(el => el.offsetParent !== null) || chatInps[0];
        if (!inp) return;

        // 3. Foco, seleção e limpeza prévia
        inp.focus();
        inp.click();
        inp.value = '';
        if (typeof inp.select === 'function') inp.select();

        // 4. Cola o texto no chat via execCommand
        let pasted = false;
        try {
            pasted = document.execCommand('insertText', false, msg);
        } catch (e) { }

        if (!pasted || inp.value !== msg) {
            inp.value = msg;
        }

        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));

        // 5. Envio garantido: Enter + Clique no Botão de Envio (HUD em x=1026, y=923)
        setTimeout(() => {
            inp.focus();

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

            // Clique no HUD send button do Yukon em x=1026, y=923
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

            const sendBtn = inp.parentElement?.querySelector('button, [role="button"], [type="submit"]') ||
                document.querySelector('.chat-send, [data-action="send"], #chat-send');
            if (sendBtn && typeof sendBtn.click === 'function') sendBtn.click();

            if (inp.form) {
                try { inp.form.requestSubmit(); } catch (e) {
                    inp.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
            }

            if (canvas) {
                ['keydown', 'keyup'].forEach(type => {
                    const ev = new PageKE(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true });
                    canvas.dispatchEvent(ev);
                    window.dispatchEvent(ev);
                });
            }

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

    function updateNextMsgPreview() {
        const active = state.phrases.filter(p => p.enabled);
        let nextPhrase = '';
        if (active.length > 0) {
            nextPhrase = (state.rotatePhrases && active.length > 1)
                ? active[state.pIdx % active.length].text
                : active[0].text;
        } else {
            nextPhrase = state.lang === 'pt' ? '(Nenhuma frase ativada)' : '(No active phrase)';
        }
        const pEl = document.getElementById('cpj-msg');
        if (pEl) pEl.textContent = `"${nextPhrase}"`;
    }

    function botTick() {
        if (!state.running) return;

        // Se repeatAction não estiver ligado, dispara ação no início da sessão
        if (!state.repeatAction && !state.actionDispatched) {
            executeActiveAction();
            state.actionDispatched = true;
        }

        // Executa envio de chat se não estiver no modo silencioso
        if (!state.deactivatePhrases) {
            const msg = state.getNextPhrase();
            if (msg) {
                sendChat(msg);
                updateNextMsgPreview();
            }
        }

        const delay = state.randomInterval
            ? Math.floor(Math.random() * 2000) + 9000
            : 10000;
        botTimer = setTimeout(botTick, delay);
    }

    // Sincronização de likes em tempo real
    window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'CPJ_LIKES_SYNC' && typeof e.data.likes === 'number' && e.data.likes !== state.likes) {
            state.likes = e.data.likes;
            state.saveShared();
            state.validate();
            updateUI();
        }
    });

    // Sincronização de frases/idioma entre abas de diferentes pinguins em tempo real
    window.addEventListener('storage', (e) => {
        if (e.key === SHARED_KEY) {
            state.load();
            renderStudioList();
            updateNextMsgPreview();
            updateLanguageUI();
        }
    });

    function queryLikesFromBridge() {
        if (pageWin.__CPJ_YUKON_BRIDGE__) {
            const l = pageWin.__CPJ_YUKON_BRIDGE__.detectLikes();
            if (typeof l === 'number' && l !== state.likes) {
                state.likes = l;
                state.saveShared();
                state.validate();
                updateUI();
                return;
            }
        }
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
                            state.saveShared();
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

    // 7. Construção do Modal e Interface Club Penguin
    const launcher = document.createElement('div');
    launcher.id = 'cpj-launcher';
    launcher.className = 'cpj-launcher';
    launcher.title = 'IglooLiker 3000 (F9)';
    launcher.innerHTML = ICONS.igloo;
    document.body.appendChild(launcher);

    const modal = document.createElement('div');
    modal.id = 'cpj-modal';
    modal.className = 'cpj-modal cpj-closed';
    modal.innerHTML = `
        <!-- 8-Way Window Resizers -->
        <div class="cpj-resizer cpj-resizer-n" data-dir="n"></div>
        <div class="cpj-resizer cpj-resizer-s" data-dir="s"></div>
        <div class="cpj-resizer cpj-resizer-w" data-dir="w"></div>
        <div class="cpj-resizer cpj-resizer-e" data-dir="e"></div>
        <div class="cpj-resizer cpj-resizer-nw" data-dir="nw"></div>
        <div class="cpj-resizer cpj-resizer-ne" data-dir="ne"></div>
        <div class="cpj-resizer cpj-resizer-sw" data-dir="sw"></div>
        <div class="cpj-resizer cpj-resizer-se" data-dir="se"></div>

        <div class="cpj-header" id="cpj-drag">
            <h2 class="cpj-title" id="cpj-header-title">${ICONS.igloo} IglooLiker 3000</h2>
            <div style="display:flex;gap:6px;">
                <button class="cpj-cbtn" id="cpj-min" title="Minimizar">${ICONS.min}</button>
                <button class="cpj-cbtn" id="cpj-close" title="Fechar (Mantém ativo)">${ICONS.close}</button>
            </div>
        </div>
        <div class="cpj-content">
            <div class="cpj-status">
                <div><span class="cpj-dot active"></span><span>IglooLiker 3000</span></div>
                <div><span class="cpj-dot" id="cpj-sdot"></span><span id="cpj-stxt">Ready</span></div>
            </div>

            <!-- Dropdown de Idioma Acima do Progresso -->
            <div class="cpj-lang-wrap">
                <button class="cpj-lang-btn" id="cpj-lang-btn">
                    <span id="cpj-lang-cur-txt">Language: English (USA)</span>
                    ${ICONS.chevron}
                </button>
                <div class="cpj-lang-menu" id="cpj-lang-menu">
                    <div class="cpj-lang-item ${state.lang === 'en' ? 'selected' : ''}" data-lang="en">
                        <span>English (USA)</span>
                        <span>EN</span>
                    </div>
                    <div class="cpj-lang-item ${state.lang === 'pt' ? 'selected' : ''}" data-lang="pt">
                        <span>Português (Brasil)</span>
                        <span>PT-BR</span>
                    </div>
                </div>
            </div>

            <!-- Card de Progresso do Iglu -->
            <div class="cpj-card">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;font-weight:700;">
                    <span id="cpj-prog-title">${ICONS.igloo} Igloo Likes Progression</span>
                    <span id="cpj-badge" style="background:#002b4d;border:1.5px solid #00e5ff;border-radius:12px;padding:2px 8px;color:#00ffff;">00.00%</span>
                </div>
                <div class="cpj-row">
                    <div class="cpj-col">
                        <span class="cpj-tag" id="cpj-likes-tag">Current Likes</span>
                        <input type="text" inputmode="numeric" id="cpj-likes-inp" class="cpj-input-pill cpj-input-likes" value="${state.likes}">
                    </div>
                    <span style="font-size:20px;color:#00e5ff;font-weight:700;margin-top:16px;">/</span>
                    <div class="cpj-col">
                        <span class="cpj-tag" id="cpj-goal-tag">Target Goal</span>
                        <input type="text" inputmode="numeric" id="cpj-goal" class="cpj-input-pill cpj-input-goal" value="${state.goal}">
                    </div>
                </div>
                <div class="cpj-error" id="cpj-err"></div>
                <div class="cpj-track"><div class="cpj-fill" id="cpj-fill" style="width:0%;"></div></div>
                <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#e0f7ff;">
                    <span id="cpj-ltxt">0 likes</span><span id="cpj-gtxt">Goal: 1000</span>
                </div>
            </div>

            <!-- Abas de Navegação -->
            <div class="cpj-tabs-bar">
                <button class="cpj-tab-btn ${state.activeTab === 'phrases' ? 'active' : ''}" data-tab="phrases" id="cpj-tab-phrases">Phrases</button>
                <button class="cpj-tab-btn ${state.activeTab === 'actions' ? 'active' : ''}" data-tab="actions" id="cpj-tab-actions">Actions</button>
                <button class="cpj-tab-btn ${state.activeTab === 'studio' ? 'active' : ''}" data-tab="studio" id="cpj-tab-studio">Studio</button>
            </div>

            <!-- Painel 1: Phrases -->
            <div class="cpj-tab-panel ${state.activeTab === 'phrases' ? 'active' : ''}" id="cpj-panel-phrases">
                <div class="cpj-check-row ${state.rotatePhrases ? 'checked' : ''}" id="cpj-opt-rotate">
                    <div class="cpj-box">${ICONS.check}</div>
                    <span id="cpj-lbl-rotate">Rotate like phrases</span>
                </div>
                <div class="cpj-check-row ${state.randomInterval ? 'checked' : ''}" id="cpj-opt-jitter">
                    <div class="cpj-box">${ICONS.check}</div>
                    <span id="cpj-lbl-jitter">Random anti-spam (9s to 11s)</span>
                </div>
                <div class="cpj-check-row ${state.deactivatePhrases ? 'checked' : ''}" id="cpj-opt-deact">
                    <div class="cpj-box">${ICONS.check}</div>
                    <span id="cpj-lbl-deact">Deactivate phrases (Silent mode)</span>
                </div>

                <div style="background:#003b70;border:1.5px solid #00e5ff;border-radius:10px;padding:8px;margin-top:6px;margin-bottom:8px;font-size:12px;">
                    <div style="font-size:10px;color:#8edeff;font-weight:700;text-transform:uppercase;" id="cpj-lbl-nextmsg">Next Message (Likes):</div>
                    <div id="cpj-msg" style="word-break:break-word;">"${(state.phrases[0]?.text || state.phrases[0] || '')}"</div>
                </div>
            </div>

            <!-- Painel 2: Actions -->
            <div class="cpj-tab-panel ${state.activeTab === 'actions' ? 'active' : ''}" id="cpj-panel-actions">
                <div class="cpj-check-row ${state.autoDance ? 'checked' : ''}" id="cpj-opt-dance">
                    <div class="cpj-box">${ICONS.check}</div>
                    <span id="cpj-lbl-dance">Auto-Dance ('D' keypress)</span>
                </div>
                <div class="cpj-check-row ${state.autoWave ? 'checked' : ''}" id="cpj-opt-wave">
                    <div class="cpj-box">${ICONS.check}</div>
                    <span id="cpj-lbl-wave">Auto-Wave ('W' keypress)</span>
                </div>
                <div class="cpj-check-row ${state.repeatAction ? 'checked' : ''}" id="cpj-opt-repeat">
                    <div class="cpj-box">${ICONS.check}</div>
                    <span id="cpj-lbl-repeat">Repeat action continuously</span>
                </div>

                <div class="cpj-slider-container ${state.repeatAction ? '' : 'hidden'}" id="cpj-slider-box">
                    <div class="cpj-slider-header">
                        <span id="cpj-lbl-slider">Action Interval:</span>
                        <span class="cpj-slider-pill" id="cpj-slider-val">${state.actionInterval}s</span>
                    </div>
                    <input type="range" min="5" max="10" step="1" value="${state.actionInterval}" class="cpj-snow-slider" id="cpj-slider">
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:#8edeff;font-weight:700;margin-top:4px;">
                        <span>5s</span>
                        <span>10s</span>
                    </div>
                </div>
            </div>

            <!-- Painel 3: Phrases Studio (CRUD) -->
            <div class="cpj-tab-panel ${state.activeTab === 'studio' ? 'active' : ''}" id="cpj-panel-studio">
                <div class="cpj-studio-input-wrap">
                    <input type="text" class="cpj-studio-input" id="cpj-studio-inp" placeholder="${state.lang === 'pt' ? 'Digite a nova frase...' : 'Type new phrase...'}" maxlength="100">
                    <button class="cpj-btn-add" id="cpj-studio-add">+ ADD</button>
                </div>
                <div class="cpj-phrase-list" id="cpj-phrase-list"></div>
                <div style="font-size:11px;color:#8edeff;font-weight:700;text-align:right;" id="cpj-studio-cap">
                    Slots: ${state.phrases.length}/6
                </div>
            </div>

            <!-- Botão Principal de Ativação -->
            <div class="cpj-actions-row">
                <button class="cpj-btn-toggle start" id="cpj-toggle-btn">${ICONS.play} <span id="cpj-btn-txt">START BOT</span></button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 8. Funções de Renderização e Atualização da UI
    function updateSliderFill() {
        const slider = document.getElementById('cpj-slider');
        if (!slider) return;
        const min = Number(slider.min) || 5;
        const max = Number(slider.max) || 10;
        const val = Number(slider.value) || 7;
        const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
        slider.style.setProperty('background', `linear-gradient(to right, #ff8800 0%, #ff8800 ${pct}%, #ffffff ${pct}%, #ffffff 100%)`, 'important');
        const valEl = document.getElementById('cpj-slider-val');
        if (valEl) valEl.textContent = `${val}s`;
    }

    function renderStudioList() {
        const listEl = document.getElementById('cpj-phrase-list');
        const capEl = document.getElementById('cpj-studio-cap');
        const addBtn = document.getElementById('cpj-studio-add');
        if (!listEl) return;

        listEl.innerHTML = '';
        state.phrases.forEach((item, idx) => {
            const pObj = (typeof item === 'string') ? { text: item, enabled: true } : item;
            const isAct = pObj.enabled !== false;
            const row = document.createElement('div');
            row.className = `cpj-phrase-item ${isAct ? '' : 'inactive'}`;
            const eyeTitle = isAct
                ? (state.lang === 'pt' ? 'Ativada (Clique para desativar)' : 'Active (Click to deactivate)')
                : (state.lang === 'pt' ? 'Inativa (Clique para ativar)' : 'Inactive (Click to activate)');
            row.innerHTML = `
                <span class="cpj-phrase-item-text"><b>${idx + 1}.</b> "${pObj.text}"</span>
                <div style="display:flex;gap:4px;align-items:center;">
                    <button class="cpj-btn-mini eye ${isAct ? '' : 'inactive'}" data-idx="${idx}" title="${eyeTitle}">
                        ${isAct ? ICONS.eyeClosed : ICONS.eyeOpen}
                    </button>
                    <button class="cpj-btn-mini edit" data-idx="${idx}" title="Editar">${ICONS.edit}</button>
                    <button class="cpj-btn-mini del" data-idx="${idx}" title="Excluir">${ICONS.trash}</button>
                </div>
            `;
            listEl.appendChild(row);
        });

        const t = I18N[state.lang] || I18N.en;
        if (capEl) capEl.textContent = `${t.studioCap} ${state.phrases.length}/6`;
        if (addBtn) addBtn.disabled = state.phrases.length >= 6;
        updateNextMsgPreview();
    }

    function updateLanguageUI() {
        const t = I18N[state.lang] || I18N.en;

        document.getElementById('cpj-lang-cur-txt').textContent = t.langLabel;
        document.getElementById('cpj-prog-title').innerHTML = `${ICONS.igloo} ${t.iglooProgress}`;
        document.getElementById('cpj-likes-tag').textContent = t.detectedLikes;
        document.getElementById('cpj-goal-tag').textContent = t.targetGoal;

        document.getElementById('cpj-tab-phrases').textContent = t.tabPhrases;
        document.getElementById('cpj-tab-actions').textContent = t.tabActions;
        document.getElementById('cpj-tab-studio').textContent = t.tabStudio;

        document.getElementById('cpj-lbl-rotate').textContent = t.rotatePhrases;
        document.getElementById('cpj-lbl-jitter').textContent = t.randomDelay;
        document.getElementById('cpj-lbl-deact').textContent = t.deactivatePhrases;
        document.getElementById('cpj-lbl-nextmsg').textContent = t.nextMsgTitle;

        document.getElementById('cpj-lbl-dance').textContent = t.autoDance;
        document.getElementById('cpj-lbl-wave').textContent = t.autoWave;
        document.getElementById('cpj-lbl-repeat').textContent = t.repeatAction;
        document.getElementById('cpj-lbl-slider').textContent = t.actionInterval;

        document.getElementById('cpj-studio-inp').placeholder = t.studioPlaceholder;
        document.getElementById('cpj-studio-add').textContent = t.studioAdd;

        document.querySelectorAll('.cpj-lang-item').forEach(el => {
            el.classList.toggle('selected', el.getAttribute('data-lang') === state.lang);
        });

        updateUI();
    }

    function updateUI() {
        const t = I18N[state.lang] || I18N.en;

        const likesInp = document.getElementById('cpj-likes-inp');
        if (likesInp && document.activeElement !== likesInp) {
            likesInp.value = state.likes;
        }

        document.getElementById('cpj-ltxt').textContent = `${state.likes} ${t.likesUnit}`;
        document.getElementById('cpj-gtxt').textContent = `${t.goalUnit} ${state.goal}`;
        document.getElementById('cpj-badge').textContent = state.percent();
        document.getElementById('cpj-fill').style.width = `${state.ratio()}%`;

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

        // Sincronização dos checkboxes e slider animado
        document.getElementById('cpj-opt-dance').classList.toggle('checked', !!state.autoDance);
        document.getElementById('cpj-opt-wave').classList.toggle('checked', !!state.autoWave);
        document.getElementById('cpj-opt-repeat').classList.toggle('checked', !!state.repeatAction);
        document.getElementById('cpj-opt-rotate').classList.toggle('checked', !!state.rotatePhrases);
        document.getElementById('cpj-opt-jitter').classList.toggle('checked', !!state.randomInterval);
        document.getElementById('cpj-opt-deact').classList.toggle('checked', !!state.deactivatePhrases);

        const sliderBox = document.getElementById('cpj-slider-box');
        if (sliderBox) sliderBox.classList.toggle('hidden', !state.repeatAction);

        // Status text
        const sdot = document.getElementById('cpj-sdot');
        const stxt = document.getElementById('cpj-stxt');
        if (state.running) {
            sdot.className = 'cpj-dot active';
            stxt.textContent = state.deactivatePhrases ? t.statusSilent : t.statusActive;
        } else {
            sdot.className = 'cpj-dot';
            stxt.textContent = t.statusPaused;
        }

        // Toggle Button
        const toggleBtn = document.getElementById('cpj-toggle-btn');
        const btnTxt = document.getElementById('cpj-btn-txt');
        if (toggleBtn && btnTxt) {
            if (state.running) {
                toggleBtn.className = 'cpj-btn-toggle stop';
                toggleBtn.innerHTML = `${ICONS.stop} <span id="cpj-btn-txt">${t.stopBot}</span>`;
            } else {
                toggleBtn.className = 'cpj-btn-toggle start';
                toggleBtn.innerHTML = `${ICONS.play} <span id="cpj-btn-txt">${t.startBot}</span>`;
            }
        }

        updateSliderFill();
        renderStudioList();
    }

    // 9. Event Listeners e Interatividade
    launcher.addEventListener('click', () => modal.classList.toggle('cpj-closed'));

    document.getElementById('cpj-close').addEventListener('click', (e) => {
        e.stopPropagation();
        modal.classList.add('cpj-closed');
    });

    // Dropdown de Idioma
    const langBtn = document.getElementById('cpj-lang-btn');
    const langMenu = document.getElementById('cpj-lang-menu');
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langMenu.classList.toggle('open');
    });

    document.querySelectorAll('.cpj-lang-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const chosen = item.getAttribute('data-lang');
            if (chosen && (chosen === 'en' || chosen === 'pt')) {
                state.lang = chosen;
                state.saveShared();
                langMenu.classList.remove('open');
                updateLanguageUI();
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.cpj-lang-wrap')) {
            langMenu.classList.remove('open');
        }
    });

    // Abas de Navegação
    document.querySelectorAll('.cpj-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            state.activeTab = tab;
            state.saveSession();

            document.querySelectorAll('.cpj-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
            document.querySelectorAll('.cpj-tab-panel').forEach(p => {
                p.classList.toggle('active', p.id === `cpj-panel-${tab}`);
            });
            if (tab === 'actions') {
                updateSliderFill();
            }
        });
    });

    // Inputs de Likes e Goal
    document.getElementById('cpj-likes-inp').addEventListener('input', (e) => {
        const clean = e.target.value.replace(/\D/g, '');
        e.target.value = clean;
        state.likes = parseInt(clean, 10) || 0;
        state.saveShared();
        state.validate();
        updateUI();
    });

    document.getElementById('cpj-goal').addEventListener('input', (e) => {
        const clean = e.target.value.replace(/\D/g, '');
        e.target.value = clean;
        state.goal = parseInt(clean, 10) || 0;
        state.saveShared();
        state.validate();
        updateUI();
    });

    // Checkboxes da Aba Phrases
    document.getElementById('cpj-opt-rotate').addEventListener('click', () => {
        state.rotatePhrases = !state.rotatePhrases;
        state.saveSession();
        updateUI();
    });

    document.getElementById('cpj-opt-jitter').addEventListener('click', () => {
        state.randomInterval = !state.randomInterval;
        state.saveSession();
        updateUI();
    });

    document.getElementById('cpj-opt-deact').addEventListener('click', () => {
        state.deactivatePhrases = !state.deactivatePhrases;
        state.saveSession();
        updateUI();
    });

    // Checkboxes da Aba Actions
    document.getElementById('cpj-opt-dance').addEventListener('click', () => {
        state.autoDance = !state.autoDance;
        state.saveSession();
        updateUI();
    });

    document.getElementById('cpj-opt-wave').addEventListener('click', () => {
        state.autoWave = !state.autoWave;
        state.saveSession();
        updateUI();
    });

    document.getElementById('cpj-opt-repeat').addEventListener('click', () => {
        state.repeatAction = !state.repeatAction;
        state.saveSession();
        if (state.running) {
            startActionLoop();
        }
        updateUI();
    });

    // Slider de Intervalo de Ação
    const sliderEl = document.getElementById('cpj-slider');
    sliderEl.addEventListener('input', (e) => {
        state.actionInterval = Number(e.target.value) || 7;
        state.saveSession();
        updateSliderFill();
        if (state.running && state.repeatAction) {
            startActionLoop();
        }
    });

    // Phrases Studio CRUD
    const studioInp = document.getElementById('cpj-studio-inp');
    const studioAddBtn = document.getElementById('cpj-studio-add');

    function handleAddPhrase() {
        let val = studioInp ? studioInp.value.trim() : '';
        const t = I18N[state.lang] || I18N.en;
        if (state.phrases.length >= 6) {
            alert(t.studioMaxAlert);
            return;
        }
        if (!val) {
            const promptVal = prompt(t.studioPlaceholder || (state.lang === 'pt' ? 'Digite a nova frase de likes:' : 'Type new like phrase:'));
            if (promptVal && promptVal.trim().length >= 2) {
                val = promptVal.trim();
            } else {
                if (studioInp) studioInp.focus();
                return;
            }
        }
        if (val.length >= 2) {
            state.phrases.push({ text: val, enabled: true });
            state.saveShared();
            if (studioInp) studioInp.value = '';
            renderStudioList();
            updateNextMsgPreview();
        }
    }

    studioAddBtn.addEventListener('click', handleAddPhrase);
    if (studioInp) {
        studioInp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAddPhrase();
            }
        });
    }

    document.getElementById('cpj-phrase-list').addEventListener('click', (e) => {
        const eyeBtn = e.target.closest('.cpj-btn-mini.eye');
        const delBtn = e.target.closest('.cpj-btn-mini.del');
        const editBtn = e.target.closest('.cpj-btn-mini.edit');
        const t = I18N[state.lang] || I18N.en;

        if (eyeBtn) {
            const idx = Number(eyeBtn.getAttribute('data-idx'));
            if (!isNaN(idx) && idx >= 0 && idx < state.phrases.length) {
                state.phrases[idx].enabled = !state.phrases[idx].enabled;
                state.saveShared();
                renderStudioList();
                updateNextMsgPreview();
            }
        } else if (delBtn) {
            const idx = Number(delBtn.getAttribute('data-idx'));
            if (!isNaN(idx) && idx >= 0 && idx < state.phrases.length) {
                state.phrases.splice(idx, 1);
                state.saveShared();
                renderStudioList();
                updateNextMsgPreview();
            }
        } else if (editBtn) {
            const idx = Number(editBtn.getAttribute('data-idx'));
            if (!isNaN(idx) && idx >= 0 && idx < state.phrases.length) {
                const current = state.phrases[idx].text;
                const updated = prompt(t.editPrompt, current);
                if (updated && updated.trim().length > 1) {
                    state.phrases[idx].text = updated.trim();
                    state.saveShared();
                    renderStudioList();
                    updateNextMsgPreview();
                }
            }
        }
    });

    // Botão Principal Start / Pause
    document.getElementById('cpj-toggle-btn').addEventListener('click', () => {
        state.running = !state.running;
        if (state.running) {
            state.danced = false;
            state.actionDispatched = false;
            updateUI();
            startActionLoop();
            botTick();
        } else {
            if (botTimer) clearTimeout(botTimer);
            stopActionLoop();
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

    // Arraste livre em 2D (X e Y) e Redimensionamento em 8 direções
    let isDragging = false;
    let resizeDir = null;
    let startMouseX = 0, startMouseY = 0;
    let startRect = null;

    // Helper para atualizar escala adaptativa
    function updateAdaptiveScale(w, h) {
        const scale = Math.max(0.75, Math.min(1.4, (w / 380) * 0.6 + (h / 500) * 0.4));
        modal.style.setProperty('--cpj-scale', scale.toFixed(3));
    }

    // Início de arraste (Header)
    document.getElementById('cpj-drag').addEventListener('mousedown', (e) => {
        if (e.target.closest('.cpj-cbtn')) return;
        isDragging = true;
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        startRect = modal.getBoundingClientRect();
        modal.style.right = 'auto';
        modal.style.bottom = 'auto';
        e.preventDefault();
        e.stopPropagation();
    });

    // Início de redimensionamento (8 bordas/cantos)
    modal.querySelectorAll('.cpj-resizer').forEach(el => {
        el.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            resizeDir = el.getAttribute('data-dir');
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            startRect = modal.getBoundingClientRect();
            modal.style.right = 'auto';
            modal.style.bottom = 'auto';
        });
    });

    // Movimentação global (MouseMove em fase de captura para suavidade total)
    window.addEventListener('mousemove', (e) => {
        if (isDragging && startRect) {
            e.preventDefault();
            e.stopPropagation();
            const dx = e.clientX - startMouseX;
            const dy = e.clientY - startMouseY;
            const maxX = Math.max(0, window.innerWidth - startRect.width);
            const maxY = Math.max(0, window.innerHeight - startRect.height);
            const newX = Math.max(0, Math.min(maxX, startRect.left + dx));
            const newY = Math.max(0, Math.min(maxY, startRect.top + dy));
            modal.style.left = `${newX}px`;
            modal.style.top = `${newY}px`;
        } else if (resizeDir && startRect) {
            e.preventDefault();
            e.stopPropagation();
            const dx = e.clientX - startMouseX;
            const dy = e.clientY - startMouseY;
            const minW = 260, minH = 300;
            const maxW = window.innerWidth - 20, maxH = window.innerHeight - 20;

            let newLeft = startRect.left;
            let newTop = startRect.top;
            let newWidth = startRect.width;
            let newHeight = startRect.height;

            if (resizeDir.includes('e')) {
                newWidth = Math.max(minW, Math.min(maxW - startRect.left, startRect.width + dx));
            }
            if (resizeDir.includes('w')) {
                const candW = startRect.width - dx;
                if (candW >= minW) {
                    newWidth = candW;
                    newLeft = startRect.left + dx;
                } else {
                    newWidth = minW;
                    newLeft = startRect.left + (startRect.width - minW);
                }
            }
            if (resizeDir.includes('s')) {
                newHeight = Math.max(minH, Math.min(maxH - startRect.top, startRect.height + dy));
            }
            if (resizeDir.includes('n')) {
                const candH = startRect.height - dy;
                if (candH >= minH) {
                    newHeight = candH;
                    newTop = startRect.top + dy;
                } else {
                    newHeight = minH;
                    newTop = startRect.top + (startRect.height - minH);
                }
            }

            modal.style.left = `${newLeft}px`;
            modal.style.top = `${newTop}px`;
            modal.style.width = `${newWidth}px`;
            modal.style.height = `${newHeight}px`;

            updateAdaptiveScale(newWidth, newHeight);
        }
    }, true);

    // Liberação global do mouse (MouseUp em fase de captura para soltar SEMPRE sem vazar para o jogo)
    window.addEventListener('mouseup', (e) => {
        if (isDragging || resizeDir) {
            e.preventDefault();
            e.stopPropagation();
            isDragging = false;
            resizeDir = null;
        }
    }, true);

    // Bloqueia eventos de clique/mouse para não vazarem para o canvas do jogo (impedindo o pinguim de andar)
    function isolateFromGame(element) {
        if (!element) return;
        const events = [
            'mousedown', 'mouseup', 'click', 'dblclick',
            'pointerdown', 'pointerup', 'pointercancel',
            'touchstart', 'touchend', 'contextmenu'
        ];
        events.forEach(evt => {
            element.addEventListener(evt, (e) => {
                e.stopPropagation();
            }, false);
        });
    }
    isolateFromGame(modal);
    isolateFromGame(launcher);

    // Atalho F9
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F9') modal.classList.toggle('cpj-closed');
    });

    updateLanguageUI();
})();
