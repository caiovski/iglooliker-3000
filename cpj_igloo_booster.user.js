// ==UserScript==
// @name         IglooLiker 3000 (CPJ Igloo Likes AFK Booster)
// @namespace    https://github.com/caiovski/iglooliker-3000
// @version      3.2.0
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
                let lastRoomId = null;
                let lastMapOpen = false;
                let lastPenguinName = null;

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
                    detectPenguin() {
                        try {
                            const g = this.getGame();
                            if (g) {
                                for (const sc of (g.scene?.scenes || [])) {
                                    const client = sc.world?.client || sc.client;
                                    if (client?.penguin) {
                                        const u = client.penguin.username || client.penguin.name;
                                        if (u) {
                                            const l = client.penguin.iglooLikes ?? client.penguin.likes ?? client.penguin.igloo?.likes ?? client.iglooLikes;
                                            return {
                                                username: String(u).toLowerCase().trim(),
                                                displayName: String(client.penguin.name || u),
                                                id: client.penguin.id,
                                                likes: typeof l === 'number' ? l : null
                                            };
                                        }
                                    }
                                }
                            }
                        } catch (e) {}
                        return null;
                    },
                    detectLikes() {
                        try {
                            const p = this.detectPenguin();
                            if (p && typeof p.likes === 'number') return p.likes;
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

                // Monitor contínuo de pinguim, sala e mapa
                function bridgeTick() {
                    try {
                        const g = window.__CPJ_YUKON_BRIDGE__.getGame();
                        if (!g) return;

                        // 1. Detecção de Pinguim
                        const pInfo = window.__CPJ_YUKON_BRIDGE__.detectPenguin();
                        if (pInfo && pInfo.username) {
                            if (lastPenguinName !== pInfo.username) {
                                lastPenguinName = pInfo.username;
                                window.postMessage({ type: 'CPJ_PENGUIN_SYNC', penguin: pInfo }, '*');
                            }
                        }

                        // 2. Detecção de Mudança de Sala
                        for (const sc of (g.scene?.scenes || [])) {
                            const world = sc.world || sc;
                            const client = world.client || sc.client;
                            const curRoom = world.room?.id ?? client?.room?.id ?? client?.penguin?.room ?? world.roomKey;
                            if (curRoom !== undefined && curRoom !== null) {
                                if (lastRoomId !== null && lastRoomId !== curRoom) {
                                    window.postMessage({ type: 'CPJ_ROOM_CHANGED', oldRoom: lastRoomId, newRoom: curRoom }, '*');
                                }
                                lastRoomId = curRoom;
                                break;
                            }
                        }

                        // 3. Detecção de Abertura do Mapa
                        let isMapOpen = false;
                        for (const sc of (g.scene?.scenes || [])) {
                            const key = (sc.scene?.key || sc.sys?.settings?.key || '').toLowerCase();
                            if (key.includes('map')) {
                                if (sc.scene?.isActive?.() || sc.sys?.settings?.visible || sc.sys?.isVisible?.()) {
                                    isMapOpen = true;
                                    break;
                                }
                            }
                            if (sc.interface?.map?.visible || sc.world?.client?.interface?.map?.visible || sc.world?.client?.interface?.main?.map?.visible) {
                                isMapOpen = true;
                                break;
                            }
                        }
                        if (isMapOpen && !lastMapOpen) {
                            window.postMessage({ type: 'CPJ_MAP_OPENED' }, '*');
                        }
                        lastMapOpen = isMapOpen;
                    } catch (e) {}
                }
                setInterval(bridgeTick, 500);

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
                                        const action = message?.action || message?.type;
                                        const likes = args?.likes ?? args?.iglooLikes ?? args?.igloo?.likes;
                                        if (typeof likes === 'number' && likes >= 0) {
                                            window.postMessage({ type: 'CPJ_LIKES_SYNC', likes: likes }, '*');
                                        }
                                        if (action === 'join_room' || action === 'jr' || action === 'join_igloo') {
                                            window.postMessage({ type: 'CPJ_ROOM_CHANGED', action: action }, '*');
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
        igloo: `<svg viewBox="0 0 28 28" class="cpj-igloo-icon">
            <defs>
                <linearGradient id="cpjSilverGrad" x1="0" y1="0" x2="0.8" y2="1">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="30%" stop-color="#eaf1f7"/>
                    <stop offset="65%" stop-color="#b2c6d6"/>
                    <stop offset="100%" stop-color="#697d8c"/>
                </linearGradient>
                <linearGradient id="cpjSilverTailGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="40%" stop-color="#d4e2ed"/>
                    <stop offset="100%" stop-color="#556977"/>
                </linearGradient>
                <radialGradient id="cpjDoorGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#fff8db"/>
                    <stop offset="55%" stop-color="#ffb700"/>
                    <stop offset="100%" stop-color="#ff7700"/>
                </radialGradient>
                <radialGradient id="cpjWinGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#fffde6"/>
                    <stop offset="55%" stop-color="#ffbe1a"/>
                    <stop offset="100%" stop-color="#ff9900"/>
                </radialGradient>
                <radialGradient id="cpjCastIron" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#697a88"/>
                    <stop offset="50%" stop-color="#3a454d"/>
                    <stop offset="100%" stop-color="#181e23"/>
                </radialGradient>
                <radialGradient id="cpjFloorGrad" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stop-color="#ffe680" stop-opacity="0.85"/>
                    <stop offset="50%" stop-color="#ffb700" stop-opacity="0.45"/>
                    <stop offset="100%" stop-color="#ff9900" stop-opacity="0"/>
                </radialGradient>
                <filter id="cpjSoftBlur" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="0.9"/>
                </filter>
            </defs>

            <!-- Fumaça da Chaminé (Online) -->
            <g class="cpj-igloo-online">
                <g class="cpj-anim-smoke-1">
                    <circle cx="22" cy="1.6" r="1.3" fill="#ffffff" opacity="0.85"/>
                    <circle cx="23.2" cy="0.6" r="1.6" fill="#eaf7ff" opacity="0.75"/>
                </g>
                <g class="cpj-anim-smoke-2">
                    <circle cx="21.2" cy="1" r="1.1" fill="#ffffff" opacity="0.9"/>
                    <circle cx="23.8" cy="-0.6" r="1.7" fill="#d9f2ff" opacity="0.65"/>
                </g>
            </g>

            <!-- Z Z Z (Offline) -->
            <g class="cpj-igloo-offline">
                <text class="cpj-anim-z1" x="14" y="3.5" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="3.8" fill="#68c7ff">Z</text>
                <text class="cpj-anim-z2" x="17.5" y="1" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="3.1" fill="#8ee0ff">z</text>
                <text class="cpj-anim-z3" x="20.5" y="-1" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="2.4" fill="#b8f0ff">z</text>
            </g>

            <!-- Cata-vento de Galo Prata ao Vento -->
            <g id="cpjRoosterGroup">
                <!-- 3 Traços de vento em fila ondulante -->
                <path class="cpj-anim-wind-1" d="M 0 1.8 Q 2.5 0.9, 5 1.8 T 9 1.8" fill="none" stroke="#ffffff" stroke-width="0.75" stroke-linecap="round"/>
                <path class="cpj-anim-wind-2" d="M -4 3.0 Q -1.5 2.1, 1 3.0 T 5 3.0" fill="none" stroke="#e0f7ff" stroke-width="0.7" stroke-linecap="round"/>
                <path class="cpj-anim-wind-3" d="M -8 2.2 Q -5.5 1.3, -3 2.2 T 1 2.2" fill="none" stroke="#b8e8ff" stroke-width="0.65" stroke-linecap="round"/>

                <!-- Haste Fixa na Neve inclinada a -23 graus -->
                <g transform="rotate(-23, 11.5, 6.8)">
                    <ellipse cx="11.5" cy="6.8" rx="1.2" ry="0.5" fill="#002447" opacity="0.5"/>
                    <line x1="11.5" y1="6.8" x2="11.5" y2="4.4" stroke="#253542" stroke-width="0.9" stroke-linecap="round"/>
                    <line x1="11.5" y1="6.8" x2="11.5" y2="4.4" stroke="#ffffff" stroke-width="0.35" stroke-linecap="round"/>
                    <circle cx="11.5" cy="4.5" r="0.6" fill="url(#cpjSilverGrad)" stroke="#1a252e" stroke-width="0.3"/>
                </g>

                <!-- Galo e Seta Girando (Velocidade Constante) -->
                <g class="cpj-anim-rooster">
                    <!-- Seta metálica prateada -->
                    <line x1="6.2" y1="4.6" x2="14.4" y2="4.6" stroke="#16222b" stroke-width="0.7"/>
                    <line x1="6.4" y1="4.6" x2="14.2" y2="4.6" stroke="#ffffff" stroke-width="0.25"/>
                    <polygon points="5.6,4.6 7.8,3.7 7.3,4.6 7.8,5.5" fill="url(#cpjSilverGrad)" stroke="#16222b" stroke-width="0.3"/>
                    <path d="M 12.8 3.8 L 14.4 3.1 L 13.9 4.6 L 14.4 6.1 L 12.8 5.4 Z" fill="url(#cpjSilverGrad)" stroke="#16222b" stroke-width="0.3"/>

                    <!-- Patas do Galo -->
                    <line x1="9.5" y1="4.6" x2="9.8" y2="3.9" stroke="#16222b" stroke-width="0.6"/>
                    <line x1="10.5" y1="4.6" x2="10.7" y2="3.9" stroke="#16222b" stroke-width="0.6"/>

                    <!-- Galo Opção 1 (Fiel à Foto: Cabeça Fina, Crista Inclinada, Bico Triangular, Barbela e Garganta) -->
                    <path d="M 9.5 4.0 C 8.8 4.0, 8.2 3.65, 7.8 3.2 C 7.6 2.8, 7.7 2.4, 7.8 2.05 C 7.7 1.9, 7.5 1.95, 7.3 1.85 C 7.15 1.75, 7.2 1.6, 7.3 1.5 L 6.3 1.45 L 7.2 1.20 L 7.3 0.80 L 7.55 1.00 L 7.8 0.55 L 8.05 0.85 L 8.35 0.40 L 8.60 0.75 L 8.95 0.55 L 9.15 0.85 C 9.0 1.05, 8.8 1.15, 8.6 1.25 C 8.9 1.7, 9.4 2.2, 9.9 2.6 C 10.4 2.9, 10.9 3.0, 11.4 2.8 C 12.3 1.3, 13.5 0.8, 14.5 1.7 C 13.9 2.1, 13.2 2.5, 12.3 2.7 C 13.1 1.9, 14.2 1.8, 14.6 2.7 C 13.9 3.0, 13.3 3.2, 12.5 3.3 C 12.9 3.1, 13.7 3.0, 14.1 3.7 C 13.4 3.8, 12.9 3.8, 12.2 3.7 C 11.4 3.9, 10.5 4.0, 9.5 4.0 Z" fill="url(#cpjSilverGrad)" stroke="#16222b" stroke-width="0.32" stroke-linejoin="round"/>
                    <path d="M 7.3 1.5 C 7.15 1.75, 7.25 2.05, 7.45 2.05 C 7.65 2.05, 7.75 1.85, 7.75 1.7" fill="url(#cpjSilverGrad)" stroke="#16222b" stroke-width="0.22"/>
                    <line x1="6.4" y1="1.45" x2="7.2" y2="1.45" stroke="#16222b" stroke-width="0.22"/>
                    <circle cx="7.45" cy="1.30" r="0.18" fill="#16222b"/>

                    <!-- Penas da cauda com gradiente -->
                    <path d="M 11.5 2.7 C 12.3 1.3, 13.5 0.8, 14.4 1.7 C 13.8 2.1, 13.2 2.5, 12.3 2.7" fill="url(#cpjSilverTailGrad)" stroke="#16222b" stroke-width="0.25"/>
                    <path d="M 11.9 3.0 C 12.8 2.0, 13.9 1.9, 14.5 2.7 C 13.9 3.0, 13.3 3.2, 12.5 3.3" fill="url(#cpjSilverTailGrad)" stroke="#16222b" stroke-width="0.25"/>
                    <path d="M 11.8 3.5 C 12.6 2.9, 13.5 3.0, 14.0 3.7 C 13.4 3.8, 12.8 3.8, 12.2 3.7" fill="url(#cpjSilverTailGrad)" stroke="#16222b" stroke-width="0.2"/>

                    <!-- Brilho no peito musculoso -->
                    <path d="M 7.8 2.3 C 7.6 2.7, 7.7 3.2, 8.3 3.6" fill="none" stroke="#ffffff" stroke-width="0.35" stroke-linecap="round"/>
                </g>
            </g>

            <!-- Chaminé Metálica com Alavanca Vermelha Retangular Inclinada -->
            <g transform="rotate(10, 20.5, 7)">
                <ellipse cx="20.5" cy="7.2" rx="1.5" ry="0.6" fill="#002447" opacity="0.6"/>
                <path d="M 19.3 7 L 19.8 2.8 L 21.8 2.8 L 21.5 7 Z" fill="#60727f" stroke="#101c24" stroke-width="0.7"/>
                <line x1="20.2" y1="3" x2="20" y2="6.8" stroke="#d5e4ec" stroke-width="0.6" stroke-linecap="round"/>
                <rect x="19.4" y="4.6" width="2.3" height="0.85" rx="0.3" fill="#e74c3c" stroke="#962d22" stroke-width="0.35"/>
                <rect x="21.7" y="5.0" width="1.4" height="0.65" rx="0.2" transform="rotate(25, 21.7, 5.0)" fill="#e74c3c" stroke="#962d22" stroke-width="0.25"/>
                <ellipse cx="20.8" cy="2.8" rx="2.5" ry="0.8" fill="#202b33" stroke="#101c24" stroke-width="0.6"/>
                <path d="M 18.3 2.8 L 20.8 0.6 L 23.3 2.8 Z" fill="#899ba8" stroke="#101c24" stroke-width="0.6" stroke-linejoin="round"/>
                <path d="M 20 2.6 L 20.8 0.9 L 21.6 2.6 Z" fill="#dce9f0" class="cpj-igloo-online"/>
            </g>

            <!-- Base de Neve -->
            <ellipse cx="14" cy="23" rx="12" ry="2.5" fill="#a8e0ff" opacity="0.6"/>

            <!-- Luz Difusa com Blur no Chão (Online) -->
            <g class="cpj-igloo-online cpj-anim-floor">
                <ellipse cx="10" cy="22.5" rx="5.5" ry="2.0" fill="url(#cpjFloorGrad)" filter="url(#cpjSoftBlur)"/>
            </g>

            <!-- Domo Principal do Iglu -->
            <path d="M 6 21 C 5 13 9 5 17 5 C 23 5 26 12 25 21 Z" fill="#ffffff" stroke="#003566" stroke-width="1.2"/>
            <path d="M 8.5 16 C 13 14 20 14 24.5 16.5" fill="none" stroke="#55aee8" stroke-width="1"/>
            <path d="M 10 11.5 C 13.5 10 18 10 23 12" fill="none" stroke="#55aee8" stroke-width="1"/>
            <path d="M 12.5 8 C 15 7.2 18 7.2 20.5 8.5" fill="none" stroke="#55aee8" stroke-width="0.9"/>
            <line x1="16.5" y1="5.2" x2="16.5" y2="7.8" stroke="#55aee8" stroke-width="0.9"/>
            <line x1="13.5" y1="8.2" x2="13.5" y2="10.8" stroke="#55aee8" stroke-width="0.9"/>
            <line x1="16" y1="11.5" x2="16" y2="14.8" stroke="#55aee8" stroke-width="0.9"/>

            <!-- Janela Nivelada em Perspectiva X -->
            <g transform="matrix(0.85 0 0 1 3.2 0)">
                <path d="M 17.6 11.8 L 22.8 12.1 L 22.8 16.8 L 17.6 16.8 Z" fill="#7a3e14" stroke="#452004" stroke-width="0.8" stroke-linejoin="round"/>
                <line x1="18.2" y1="12.3" x2="22.2" y2="12.4" stroke="#9e521e" stroke-width="0.4"/>
                <rect x="17.0" y="16.7" width="6.4" height="0.95" rx="0.4" fill="#4d2307" stroke="#261002" stroke-width="0.5"/>
                
                <!-- Janela Online (Acesa com Fogo) -->
                <g class="cpj-igloo-online">
                    <rect class="cpj-anim-fire" x="18.3" y="12.7" width="3.8" height="3.5" rx="0.4" fill="url(#cpjWinGlow)"/>
                    <path d="M 18.8 13.2 L 21.2 15.6" stroke="#ffffff" stroke-width="0.65" opacity="0.8" stroke-linecap="round"/>
                    <path d="M 19.8 13.0 L 21.6 14.8" stroke="#ffffff" stroke-width="0.45" opacity="0.6" stroke-linecap="round"/>
                </g>

                <!-- Janela Offline (Apagada com Brilho Estrela) -->
                <g class="cpj-igloo-offline">
                    <rect x="18.3" y="12.7" width="3.8" height="3.5" rx="0.4" fill="#001830"/>
                    <path d="M 18.8 13.2 L 21.2 15.6" stroke="#4878a8" stroke-width="0.6" stroke-linecap="round" opacity="0.6"/>
                    <g class="cpj-anim-sparkle">
                        <path d="M 21.6 12.4 L 21.9 13.2 L 22.7 13.5 L 21.9 13.8 L 21.6 14.6 L 21.3 13.8 L 20.5 13.5 L 21.3 13.2 Z" fill="#ffffff"/>
                    </g>
                </g>

                <line x1="20.2" y1="12.7" x2="20.2" y2="16.2" stroke="#452004" stroke-width="0.65"/>
                <line x1="18.3" y1="14.45" x2="22.1" y2="14.45" stroke="#452004" stroke-width="0.65"/>
            </g>

            <!-- Túnel de Entrada Frontal -->
            <path d="M 3.5 21 C 3.5 14 6 12.5 11 12.5 C 15 12.5 15.5 14.5 15.5 21 Z" fill="#eaf7ff" stroke="#003566" stroke-width="1.2"/>
            <path d="M 4 16 L 7 16" stroke="#55aee8" stroke-width="0.9"/>
            <path d="M 12 16 L 15 16" stroke="#55aee8" stroke-width="0.9"/>
            <path d="M 6.5 13.5 L 8.5 15" stroke="#55aee8" stroke-width="0.9"/>
            <path d="M 12.5 13.5 L 11 15" stroke="#55aee8" stroke-width="0.9"/>

            <!-- Porta Online (Aberta com Lareira Viva) -->
            <g class="cpj-igloo-online">
                <path class="cpj-anim-fire" d="M 7 21 C 7 16 8.5 15 10.5 15 C 12.5 15 13 16 13 21 Z" fill="url(#cpjDoorGlow)" stroke="#d48800" stroke-width="0.6"/>
                <path d="M 7.5 20.5 C 7.5 16.5 8.8 15.5 10.5 15.5 C 12.2 15.5 12.5 16.5 12.5 20.5" fill="none" stroke="#fff5cc" stroke-width="0.7" opacity="0.8"/>
            </g>

            <!-- Porta Offline (Fechada de Madeira com Maçaneta Redonda de Ferro Fundido) -->
            <g class="cpj-igloo-offline">
                <path d="M 7 21 L 7 16 C 7 14.8 8.5 14.4 10.5 14.4 C 12.5 14.4 13 14.8 13 16 L 13 21 Z" fill="#b0522a" stroke="#002b4d" stroke-width="0.8"/>
                <line x1="8.5" y1="21" x2="8.5" y2="15.2" stroke="#66280e" stroke-width="0.5"/>
                <line x1="10" y1="21" x2="10" y2="14.5" stroke="#66280e" stroke-width="0.5"/>
                <line x1="11.5" y1="21" x2="11.5" y2="15.2" stroke="#66280e" stroke-width="0.5"/>
                <polygon points="7.6,16.2 8.5,15.6 12.4,20.4 11.5,21" fill="#8c3b18" stroke="#4a1c09" stroke-width="0.4"/>
                
                <!-- Maçaneta Redonda de Ferro Fundido -->
                <rect x="11.2" y="17.2" width="0.8" height="1.6" rx="0.3" fill="#1e252a" stroke="#0d1114" stroke-width="0.3"/>
                <circle cx="11.4" cy="18.0" r="0.9" fill="url(#cpjCastIron)" stroke="#12161a" stroke-width="0.4"/>
                <circle cx="11.15" cy="17.75" r="0.28" fill="#a4b3bf"/>
            </g>
        </svg>`,
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
        eyeOpen: `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#cfd8dc"/></svg>`,
        heartBadge: `<svg class="cpj-header-heart" viewBox="-16 -16 32 32" width="22" height="22" style="flex-shrink:0;vertical-align:middle;display:inline-block;overflow:visible;"><circle cx="0" cy="0" r="13.5" fill="#ff2a6d" stroke="#ffffff" stroke-width="2.5"/><path d="M -6 -2 A 3.5 3.5 0 0 1 0 1 A 3.5 3.5 0 0 1 6 -2 Q 6 4 0 8 Q -6 4 -6 -2 Z" fill="#ffffff"/></svg>`,
        iglooClassic: `<svg viewBox="0 0 24 24" width="20" height="20" style="vertical-align:middle;display:inline-block;flex-shrink:0;"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.42 3.12 7.24L5 20h14l-.12-.76C20.8 17.42 22 14.85 22 12c0-5.52-4.48-10-10-10z" fill="#ffffff"/><path d="M12 4c-4.41 0-8 3.59-8 8 0 2.25.93 4.28 2.43 5.75L7 18h10l.57-.25C19.07 16.28 20 14.25 20 12c0-4.41-3.59-8-8-8z" fill="#e6f7ff"/><path d="M10 14h4v6h-4z" fill="#002d55"/><path d="M10 14a2 2 0 0 1 4 0v6h-4v-6z" fill="#001830"/></svg>`
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
            top: 15px;
            right: 38px;
            width: 72px !important;
            height: 72px !important;
            border-radius: 50% !important;
            background: linear-gradient(180deg, #00b4ff 0%, #006eb8 100%) !important;
            border: 3px solid #00e5ff !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5), inset 0 2px 0 #7fe3ff !important;
            z-index: 2147483646 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            touch-action: none !important;
            transition: transform 0.15s ease !important;
            pointer-events: auto !important;
            isolation: isolate !important;
            overflow: hidden !important;
        }
        #cpj-launcher:hover:not(.is-dragging) {
            cursor: pointer !important;
            transform: scale(1.08) !important;
        }
        #cpj-launcher:active,
        #cpj-launcher.is-dragging {
            cursor: grab !important;
            transform: scale(1.04) !important;
        }
        #cpj-launcher svg {
            width: 52px !important;
            height: 52px !important;
            overflow: visible !important;
            pointer-events: none !important;
        }
        .cpj-title > svg:first-child,
        .cpj-modal-title > svg:first-child {
            width: 28px !important;
            height: 28px !important;
            transform: translateY(3.5px) !important;
            overflow: visible !important;
            flex-shrink: 0 !important;
        }
        .cpj-header-heart {
            width: 22px !important;
            height: 22px !important;
            margin-left: 3px !important;
            filter: drop-shadow(0 2px 4px rgba(0, 20, 50, 0.45)) !important;
            vertical-align: middle !important;
            display: inline-block !important;
            flex-shrink: 0 !important;
        }
        #cpj-prog-title {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
        }
        #cpj-prog-title svg {
            width: 20px !important;
            height: 20px !important;
            overflow: visible !important;
            flex-shrink: 0 !important;
        }

        /* Alternância Online/Offline para o Iglu Dinâmico */
        .cpj-igloo-online { display: none !important; }
        .cpj-igloo-offline { display: inline !important; }

        #cpj-launcher.is-running .cpj-igloo-online,
        #cpj-modal.is-running .cpj-igloo-online {
            display: inline !important;
        }
        #cpj-launcher.is-running .cpj-igloo-offline,
        #cpj-modal.is-running .cpj-igloo-offline {
            display: none !important;
        }

        /* Animações Nativas do Iglu e Cata-Vento */
        @keyframes cpjWindDash1 {
            0%, 14% { transform: translate(-10px, 0); opacity: 0; }
            16% { opacity: 0.95; }
            24% { transform: translate(3px, -0.6px); opacity: 1; }
            33% { transform: translate(13px, 0.6px); opacity: 0.85; }
            41% { transform: translate(23px, -0.3px); opacity: 0; }
            100% { transform: translate(26px, 0); opacity: 0; }
        }
        @keyframes cpjWindDash2 {
            0%, 17% { transform: translate(-10px, 0); opacity: 0; }
            19% { opacity: 0.9; }
            27% { transform: translate(4px, 0.7px); opacity: 1; }
            36% { transform: translate(14px, -0.6px); opacity: 0.85; }
            44% { transform: translate(24px, 0.2px); opacity: 0; }
            100% { transform: translate(26px, 0); opacity: 0; }
        }
        @keyframes cpjWindDash3 {
            0%, 20% { transform: translate(-10px, 0); opacity: 0; }
            22% { opacity: 0.85; }
            30% { transform: translate(5px, -0.5px); opacity: 0.95; }
            39% { transform: translate(15px, 0.6px); opacity: 0.8; }
            47% { transform: translate(25px, -0.2px); opacity: 0; }
            100% { transform: translate(26px, 0); opacity: 0; }
        }
        @keyframes cpjRoosterSpin {
            0%, 15% { transform: rotate(-23deg) rotateY(0deg); }
            16% { transform: rotate(-23deg) rotateY(0deg); }
            25% { transform: rotate(-23deg) rotateY(360deg); }
            34% { transform: rotate(-23deg) rotateY(720deg); }
            43% { transform: rotate(-23deg) rotateY(1080deg); }
            46% { transform: rotate(-23deg) rotateY(1080deg); }
            100% { transform: rotate(-23deg) rotateY(1080deg); }
        }
        @keyframes cpjSmokeRise1 {
            0% { transform: translate(0, 0) scale(0.6); opacity: 0.9; }
            50% { transform: translate(2px, -3.5px) scale(1.1); opacity: 0.7; }
            100% { transform: translate(4.5px, -7.5px) scale(1.55); opacity: 0; }
        }
        @keyframes cpjSmokeRise2 {
            0% { transform: translate(0, 0) scale(0.5); opacity: 0.95; }
            60% { transform: translate(3px, -4.5px) scale(1.25); opacity: 0.6; }
            100% { transform: translate(5.5px, -9.5px) scale(1.75); opacity: 0; }
        }
        @keyframes cpjFireGlow {
            0%, 100% { filter: drop-shadow(0 0 2px rgba(255, 170, 0, 0.8)) drop-shadow(0 0 5px rgba(255, 140, 0, 0.5)); opacity: 0.9; }
            35% { filter: drop-shadow(0 0 4px rgba(255, 200, 0, 1)) drop-shadow(0 0 8px rgba(255, 160, 0, 0.75)); opacity: 1; }
            70% { filter: drop-shadow(0 0 2.5px rgba(255, 150, 0, 0.85)) drop-shadow(0 0 6px rgba(255, 120, 0, 0.55)); opacity: 0.94; }
        }
        @keyframes cpjFloorBlur {
            0%, 100% { transform: scale(0.92); opacity: 0.65; }
            50% { transform: scale(1.18); opacity: 0.95; }
        }
        @keyframes cpjCleanGlass {
            0%, 65% { transform: scale(0) rotate(0deg); opacity: 0; }
            75% { transform: scale(1.2) rotate(45deg); opacity: 1; }
            85% { transform: scale(0.8) rotate(90deg); opacity: 0.8; }
            95%, 100% { transform: scale(0); opacity: 0; }
        }
        @keyframes cpjZSleep {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
            20% { opacity: 0.95; }
            80% { opacity: 0.7; }
            100% { transform: translate(4.5px, -8px) rotate(8deg); opacity: 0; }
        }

        .cpj-anim-wind-1 { animation: cpjWindDash1 4.8s infinite ease-in-out !important; }
        .cpj-anim-wind-2 { animation: cpjWindDash2 4.8s infinite ease-in-out !important; }
        .cpj-anim-wind-3 { animation: cpjWindDash3 4.8s infinite ease-in-out !important; }
        .cpj-anim-rooster { transform-origin: 9.8px 4.4px; animation: cpjRoosterSpin 4.8s infinite linear !important; }
        .cpj-anim-smoke-1 { transform-origin: 21.5px 3px; animation: cpjSmokeRise1 2.2s infinite ease-out !important; }
        .cpj-anim-smoke-2 { transform-origin: 22.5px 2px; animation: cpjSmokeRise2 2.2s infinite ease-out 0.9s !important; }
        .cpj-anim-fire { animation: cpjFireGlow 2.4s infinite ease-in-out !important; }
        .cpj-anim-floor { transform-origin: 10px 22.5px; animation: cpjFloorBlur 2.4s infinite ease-in-out !important; }
        .cpj-anim-sparkle { transform-origin: 21.6px 13.2px; animation: cpjCleanGlass 3.5s infinite ease-in-out !important; }
        .cpj-anim-z1 { animation: cpjZSleep 3s infinite ease-in-out !important; }
        .cpj-anim-z2 { animation: cpjZSleep 3s infinite ease-in-out 1s !important; }
        .cpj-anim-z3 { animation: cpjZSleep 3s infinite ease-in-out 2s !important; }

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
        .cpj-slider-track-wrap {
            position: relative !important;
            width: 100% !important;
            height: 30px !important;
            display: flex !important;
            align-items: center !important;
            margin: 4px 0 !important;
            user-select: none !important;
            box-sizing: border-box !important;
        }
        .cpj-slider-visual-track {
            position: absolute !important;
            left: 0 !important;
            right: 0 !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            height: 16px !important;
            background: #ffffff !important;
            border: 2px solid #00284d !important;
            border-radius: 8px !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.4) !important;
            overflow: hidden !important;
            pointer-events: none !important;
            box-sizing: border-box !important;
            z-index: 1 !important;
        }
        .cpj-slider-visual-fill {
            height: 100% !important;
            background: #ff8800 !important;
            border-radius: 6px 0 0 6px !important;
            pointer-events: none !important;
        }
        .cpj-slider-visual-thumb {
            position: absolute !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 28px !important;
            height: 28px !important;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Cpath d='M 3.5 14.5 C 3.2 18.2 5.2 23 9.5 24.5 C 14.2 25.8 20.5 24.8 23.5 21 C 25.5 18.5 25.8 13.8 24.2 10.5 C 22.8 7.5 19.5 4.2 15.5 3.5 C 11.2 2.8 6.2 6.2 4.2 10.5 C 3.5 11.8 3.6 13.2 3.5 14.5 Z' fill='%23526377' stroke='%2300284d' stroke-width='2.6' stroke-linejoin='round'/%3E%3Cpath d='M 5.2 13 C 5 9.5 7.5 5.5 12.2 4.5 C 16.5 3.5 21.2 6 23 10 C 24.2 13 23.8 17 21 19.2 C 18 21.5 13.2 22 9.5 19.8 C 7 18 5.4 15.5 5.2 13 Z' fill='%23ffffff'/%3E%3C/svg%3E") center / contain no-repeat !important;
            filter: drop-shadow(0 2.5px 7px rgba(0, 0, 0, 0.7)) !important;
            border: none !important;
            box-shadow: none !important;
            pointer-events: none !important;
            box-sizing: border-box !important;
            z-index: 2 !important;
            transition: transform 0.15s ease !important;
        }
        .cpj-slider-track-wrap:hover .cpj-slider-visual-thumb {
            transform: translate(-50%, -50%) scale(1.15) !important;
        }
        .cpj-snow-slider {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            opacity: 0 !important;
            cursor: pointer !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 3 !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
        }

        /* Phrases Studio CRUD & Feedback Banners */
        .cpj-studio-msg {
            display: flex !important;
            align-items: center !important;
            gap: calc(8px * var(--cpj-scale, 1)) !important;
            border-radius: calc(8px * var(--cpj-scale, 1)) !important;
            padding: calc(7px * var(--cpj-scale, 1)) calc(10px * var(--cpj-scale, 1)) !important;
            margin-bottom: calc(8px * var(--cpj-scale, 1)) !important;
            font-size: calc(11px * var(--cpj-scale, 1)) !important;
            font-weight: 700 !important;
            line-height: 1.35 !important;
            box-sizing: border-box !important;
            animation: cpjMsgIn 0.2s ease-out !important;
        }
        @keyframes cpjMsgIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .cpj-studio-msg.hidden {
            display: none !important;
        }
        .cpj-studio-msg.error {
            background: #52161b !important;
            border: 1.5px solid #ff4d6d !important;
            color: #ffccd5 !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
        }
        .cpj-studio-msg.success {
            background: #16532d !important;
            border: 1.5px solid #22c55e !important;
            color: #bbf7d0 !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
        }
        .cpj-studio-msg-icon {
            width: calc(20px * var(--cpj-scale, 1)) !important;
            height: calc(20px * var(--cpj-scale, 1)) !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
        }
        .cpj-studio-msg.error .cpj-studio-msg-icon {
            background: #ff4d6d !important;
        }
        .cpj-studio-msg.success .cpj-studio-msg-icon {
            background: #22c55e !important;
            box-shadow: 0 0 6px rgba(34, 197, 94, 0.6) !important;
        }
        .cpj-studio-msg-icon svg {
            display: block !important;
        }
        .cpj-studio-msg-text {
            flex: 1 !important;
        }
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

        .cpj-actions-row { display: flex !important; flex-direction: column !important; align-items: center !important; width: 100% !important; margin-top: calc(12px * var(--cpj-scale, 1)) !important; }
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

        /* Rodapé de Versão e Créditos */
        .cpj-footer-credits {
            text-align: center !important;
            font-size: calc(11px * var(--cpj-scale, 1)) !important;
            color: #ffffff !important;
            font-weight: 400 !important;
            margin-top: calc(8px * var(--cpj-scale, 1)) !important;
            letter-spacing: 0.3px !important;
            user-select: none !important;
            line-height: 1.4 !important;
            font-family: 'Fredoka', sans-serif !important;
        }
        .cpj-author-link {
            color: #ffd700 !important;
            text-decoration: underline !important;
            font-weight: 400 !important;
            cursor: pointer !important;
            transition: color 0.15s ease, text-shadow 0.15s ease !important;
        }
        .cpj-author-link:hover {
            color: #fff176 !important;
            text-shadow: 0 0 6px rgba(255, 215, 0, 0.7) !important;
        }

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

        /* 2.1 Modal Escuro de Prompt In-DOM ("Telinha Preta" não-bloqueante) */
        .cpj-dark-prompt-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.65) !important;
            backdrop-filter: blur(2px) !important;
            z-index: 2147483647 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            user-select: none !important;
            isolation: isolate !important;
        }
        .cpj-dark-prompt-card {
            background: #1c1b22 !important;
            border: 1px solid #2f303d !important;
            border-radius: 16px !important;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85) !important;
            padding: 20px 22px !important;
            width: 360px !important;
            max-width: 90vw !important;
            box-sizing: border-box !important;
            font-family: 'Fredoka', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            animation: cpjPromptIn 0.15s ease-out !important;
        }
        @keyframes cpjPromptIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
        }
        .cpj-dark-prompt-header {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            margin-bottom: 14px !important;
        }
        .cpj-dark-prompt-header svg {
            flex-shrink: 0 !important;
            width: 20px !important;
            height: 20px !important;
        }
        .cpj-dark-prompt-domain {
            font-size: 15px !important;
            font-weight: 700 !important;
            color: #ffffff !important;
            letter-spacing: -0.2px !important;
        }
        .cpj-dark-prompt-label {
            font-size: 13.5px !important;
            font-weight: 600 !important;
            color: #f1f5f9 !important;
            margin-bottom: 12px !important;
            word-break: break-word !important;
        }
        .cpj-dark-prompt-input {
            width: 100% !important;
            background: #101014 !important;
            border: 2px solid #00cbf7 !important;
            border-radius: 12px !important;
            padding: 9px 14px !important;
            font-size: 13.5px !important;
            color: #ffffff !important;
            outline: none !important;
            box-sizing: border-box !important;
            box-shadow: 0 0 0 1px rgba(0, 203, 247, 0.3) !important;
            margin-bottom: 18px !important;
            font-family: inherit !important;
        }
        .cpj-dark-prompt-input:focus {
            border-color: #00e5ff !important;
            box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.35) !important;
        }
        .cpj-dark-prompt-actions {
            display: flex !important;
            justify-content: flex-end !important;
            gap: 10px !important;
        }
        .cpj-dark-btn-ok {
            background: #00cbf7 !important;
            color: #00223a !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            border: none !important;
            border-radius: 9px !important;
            padding: 8px 20px !important;
            cursor: pointer !important;
            font-family: inherit !important;
            transition: background 0.15s ease, transform 0.1s ease !important;
        }
        .cpj-dark-btn-ok:hover {
            background: #38d8fc !important;
        }
        .cpj-dark-btn-ok:active {
            transform: scale(0.97) !important;
        }
        .cpj-dark-btn-cancel {
            background: #2b2b36 !important;
            color: #ffffff !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            border: none !important;
            border-radius: 9px !important;
            padding: 8px 18px !important;
            cursor: pointer !important;
            font-family: inherit !important;
            transition: background 0.15s ease, transform 0.1s ease !important;
        }
        .cpj-dark-btn-cancel:hover {
            background: #3a3a49 !important;
        }
        .cpj-dark-btn-cancel:active {
            transform: scale(0.97) !important;
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
            studioMaxAlert: "Cannot add new phrases because maximum capacity (6 phrases) is reached.",
            studioEmptyAlert: "Write something in the field to add a new phrase!",
            studioSuccessAlert: "Phrase added successfully!",
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
            studioMaxAlert: "Não é possível adicionar novas frases pois atingiu a capacidade máxima.",
            studioEmptyAlert: "Escreva algo no campo para inserir a nova frase!",
            studioSuccessAlert: "Frase adicionada com sucesso!",
            editPrompt: "Editar frase:"
        }
    };

    // 4. Estado Reativo com Segregação (sessionStorage para abas, localStorage para frases e perfis por pinguim)
    const SESSION_KEY = 'cpj_tab_state_v3';
    const SHARED_KEY = 'cpj_shared_data_v3';
    const PENGUIN_KEY_PREFIX = 'cpj_penguin_v3_';

    const defaultPhrases = [
        { text: "Igloo liking party! Help me reach one k! Thanks for your support", enabled: true },
        { text: "Drop a like at my igloo to help me reach one k! Much appreciated!", enabled: true },
        { text: "Working on my one k igloo likes goal! Any like helps a lot!", enabled: true },
        { text: "Please visit my igloo and leave a like for one k! Thank you so much!", enabled: true }
    ];

    const state = {
        // Tab-specific & Penguin identity
        currentPenguin: null,
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

        loadPenguin(username) {
            if (!username) return;
            this.currentPenguin = String(username).toLowerCase().trim();
            try {
                const raw = localStorage.getItem(PENGUIN_KEY_PREFIX + this.currentPenguin);
                if (raw) {
                    const p = JSON.parse(raw);
                    this.likes = (p.likes !== undefined) ? Number(p.likes) || 0 : 0;
                    this.goal = (p.goal !== undefined) ? Number(p.goal) || 1000 : 1000;
                    this.autoDance = (p.autoDance !== undefined) ? !!p.autoDance : true;
                    this.autoWave = (p.autoWave !== undefined) ? !!p.autoWave : false;
                    this.repeatAction = (p.repeatAction !== undefined) ? !!p.repeatAction : false;
                    this.actionInterval = (p.actionInterval !== undefined) ? Math.max(5, Math.min(10, Number(p.actionInterval) || 7)) : 7;
                    this.deactivatePhrases = (p.deactivatePhrases !== undefined) ? !!p.deactivatePhrases : false;
                    this.rotatePhrases = (p.rotatePhrases !== undefined) ? !!p.rotatePhrases : true;
                    this.randomInterval = (p.randomInterval !== undefined) ? !!p.randomInterval : true;
                } else {
                    this.likes = 0;
                    this.goal = 1000;
                    this.autoDance = true;
                    this.autoWave = false;
                    this.repeatAction = false;
                    this.actionInterval = 7;
                    this.deactivatePhrases = false;
                    this.rotatePhrases = true;
                    this.randomInterval = true;
                    this.savePenguin();
                }
            } catch (e) { }
            this.validate();
            updateUI();
            if (typeof restoreLauncherPosition === 'function') restoreLauncherPosition(this.currentPenguin);
        },

        savePenguin() {
            const dataToSave = {
                likes: this.likes,
                goal: this.goal,
                autoDance: this.autoDance,
                autoWave: this.autoWave,
                repeatAction: this.repeatAction,
                actionInterval: this.actionInterval,
                deactivatePhrases: this.deactivatePhrases,
                rotatePhrases: this.rotatePhrases,
                randomInterval: this.randomInterval
            };
            const key = this.currentPenguin ? (PENGUIN_KEY_PREFIX + this.currentPenguin) : (PENGUIN_KEY_PREFIX + '_default');
            try {
                localStorage.setItem(key, JSON.stringify(dataToSave));
            } catch (e) { }
            this.saveSession();
        },

        load() {
            // 1. Carrega dados compartilhados do localStorage
            try {
                const rawShared = localStorage.getItem(SHARED_KEY);
                if (rawShared) {
                    const parsed = JSON.parse(rawShared);
                    if (parsed.goal && !this.currentPenguin) this.goal = Number(parsed.goal) || 1000;
                    if (parsed.likes && !this.currentPenguin) this.likes = Number(parsed.likes) || 0;
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
                    if (parsed.autoDance !== undefined && !this.currentPenguin) this.autoDance = !!parsed.autoDance;
                    if (parsed.autoWave !== undefined && !this.currentPenguin) this.autoWave = !!parsed.autoWave;
                    if (parsed.repeatAction !== undefined && !this.currentPenguin) this.repeatAction = !!parsed.repeatAction;
                    if (parsed.actionInterval !== undefined && !this.currentPenguin) this.actionInterval = Number(parsed.actionInterval) || 7;
                    if (parsed.rotatePhrases !== undefined && !this.currentPenguin) this.rotatePhrases = !!parsed.rotatePhrases;
                    if (parsed.randomInterval !== undefined && !this.currentPenguin) this.randomInterval = !!parsed.randomInterval;
                    if (parsed.deactivatePhrases !== undefined && !this.currentPenguin) this.deactivatePhrases = !!parsed.deactivatePhrases;
                    if (parsed.activeTab) this.activeTab = parsed.activeTab;
                }
            } catch (e) { }

            this.validate();
        },

        saveShared() {
            try {
                localStorage.setItem(SHARED_KEY, JSON.stringify({
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

    let lastDetectedRoom = null;

    function pauseBotAuto() {
        if (state.running) {
            state.running = false;
            if (botTimer) {
                clearTimeout(botTimer);
                botTimer = null;
            }
            stopActionLoop();
            state.danced = false;
            state.actionDispatched = false;
            updateUI();
        }
    }

    // Sincronização e detecção em tempo real via bridge
    window.addEventListener('message', (e) => {
        if (!e.data) return;
        if (e.data.type === 'CPJ_PENGUIN_SYNC' && e.data.penguin && e.data.penguin.username) {
            const p = e.data.penguin;
            const switched = (state.currentPenguin !== p.username);
            state.loadPenguin(p.username);
            if (switched && state.running && state.repeatAction) {
                startActionLoop();
            }
        } else if (e.data.type === 'CPJ_ROOM_CHANGED' || e.data.type === 'CPJ_MAP_OPENED') {
            pauseBotAuto();
        }
    });

    // Atalho de tecla 'M' no jogo para abrir mapa -> pausa bot automaticamente
    window.addEventListener('keydown', (e) => {
        if ((e.key === 'm' || e.key === 'M') && !e.target.closest('input, textarea, #cpj-modal, #cpj-dark-prompt-overlay, .cpj-dark-prompt-overlay')) {
            pauseBotAuto();
        }
    }, true);

    // Detecção de clique no botão do mapa na barra inferior do jogo CPJ
    window.addEventListener('pointerdown', (e) => {
        const canvas = document.querySelector('canvas');
        if (canvas && e.target === canvas) {
            const rect = canvas.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;
            if (relX >= 0 && relX <= (rect.width * 0.16) && relY >= (rect.height * 0.86)) {
                pauseBotAuto();
            }
        }
    }, true);

    // Sincronização de frases/idioma entre abas em tempo real
    window.addEventListener('storage', (e) => {
        if (e.key === SHARED_KEY) {
            state.load();
            renderStudioList();
            updateNextMsgPreview();
            updateLanguageUI();
        }
    });

    function queryGameSafetyAndPenguin() {
        try {
            const games = [
                pageWin.game,
                pageWin.yukon?.game,
                pageWin.world?.game,
                pageWin.air?.game,
                ...(pageWin.Phaser?.GAMES ? Object.values(pageWin.Phaser.GAMES) : [])
            ].filter(Boolean);

            for (const g of games) {
                const scenes = g.scene?.scenes || [];
                for (const sc of scenes) {
                    const world = sc.world || sc;
                    const client = world.client || sc.client;

                    // 1. Detecção do Pinguim Logado
                    if (client?.penguin) {
                        const u = client.penguin.username || client.penguin.name;
                        if (u) {
                            const norm = String(u).toLowerCase().trim();
                            if (state.currentPenguin !== norm) {
                                state.loadPenguin(norm);
                            }
                        }
                    }

                    // 2. Detecção de Mudança de Sala
                    const curRoom = world.room?.id ?? client?.room?.id ?? client?.penguin?.room ?? world.roomKey;
                    if (curRoom !== undefined && curRoom !== null) {
                        if (lastDetectedRoom !== null && lastDetectedRoom !== curRoom && state.running) {
                            pauseBotAuto();
                        }
                        lastDetectedRoom = curRoom;
                    }

                    // 3. Detecção de Abertura do Mapa
                    const key = (sc.scene?.key || sc.sys?.settings?.key || '').toLowerCase();
                    let isMapOpen = false;
                    if (key.includes('map') && (sc.scene?.isActive?.() || sc.sys?.settings?.visible || sc.sys?.isVisible?.())) {
                        isMapOpen = true;
                    }
                    if (sc.interface?.map?.visible || client?.interface?.map?.visible || client?.interface?.main?.map?.visible) {
                        isMapOpen = true;
                    }
                    if (isMapOpen && state.running) {
                        pauseBotAuto();
                    }
                }
            }
        } catch (e) { }
    }
    setInterval(queryGameSafetyAndPenguin, 300);

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
            <h2 class="cpj-title" id="cpj-header-title">${ICONS.igloo} <span>IglooLiker 3000</span> ${ICONS.heartBadge}</h2>
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
                    <span id="cpj-prog-title">${ICONS.iglooClassic} Igloo Likes Progression</span>
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
                    <div class="cpj-slider-track-wrap" id="cpj-track-wrap" style="position:relative!important;width:100%!important;height:30px!important;display:flex!important;align-items:center!important;margin:4px 0!important;user-select:none!important;box-sizing:border-box!important;cursor:pointer!important;">
                        <div class="cpj-slider-visual-track" style="position:absolute!important;left:0!important;right:0!important;top:50%!important;transform:translateY(-50%)!important;height:16px!important;background:#ffffff!important;border:2px solid #00284d!important;border-radius:8px!important;box-shadow:inset 0 2px 4px rgba(0,0,0,0.4)!important;overflow:hidden!important;pointer-events:none!important;box-sizing:border-box!important;z-index:1!important;">
                            <div class="cpj-slider-visual-fill" id="cpj-slider-fill" style="height:100%!important;width:calc(14px + (100% - 28px) * ${(state.actionInterval - 5) / 5});background:#ff8800!important;border-radius:6px 0 0 6px!important;pointer-events:none!important;"></div>
                        </div>
                        <div class="cpj-slider-visual-thumb" id="cpj-slider-thumb" style="position:absolute!important;top:50%!important;left:calc(14px + (100% - 28px) * ${(state.actionInterval - 5) / 5});transform:translate(-50%,-50%)!important;pointer-events:none!important;z-index:2!important;cursor:pointer!important;"></div>
                        <input type="range" min="5" max="10" step="1" value="${state.actionInterval}" class="cpj-snow-slider" id="cpj-slider" style="position:absolute!important;left:0!important;top:0!important;width:100%!important;height:100%!important;opacity:0!important;pointer-events:none!important;margin:0!important;padding:0!important;z-index:3!important;-webkit-appearance:none!important;-moz-appearance:none!important;appearance:none!important;">
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:#8edeff;font-weight:700;margin-top:4px;">
                        <span>5s</span>
                        <span>10s</span>
                    </div>
                </div>
            </div>

            <!-- Painel 3: Phrases Studio (CRUD) -->
            <div class="cpj-tab-panel ${state.activeTab === 'studio' ? 'active' : ''}" id="cpj-panel-studio">
                <div class="cpj-studio-msg hidden" id="cpj-studio-msg"></div>
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
                <div class="cpj-footer-credits">Version 3.2.0 Made by <a href="https://github.com/caiovski" target="_blank" rel="noopener noreferrer" class="cpj-author-link">Caiovski</a></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 8. Funções de Renderização e Atualização da UI
    function renderSliderVisuals(ratio, secVal) {
        const clampedRatio = Math.max(0, Math.min(1, ratio));
        const posCalc = `calc(14px + (100% - 28px) * ${clampedRatio})`;
        const fillEl = document.getElementById('cpj-slider-fill');
        if (fillEl) fillEl.style.setProperty('width', posCalc, 'important');
        const thumbEl = document.getElementById('cpj-slider-thumb');
        if (thumbEl) thumbEl.style.setProperty('left', posCalc, 'important');
        const valEl = document.getElementById('cpj-slider-val');
        if (valEl) valEl.textContent = `${secVal}s`;
    }

    function updateSliderFill() {
        const val = Math.max(5, Math.min(10, Number(state.actionInterval) || 7));
        const finalRatio = (val - 5) / 5;
        renderSliderVisuals(finalRatio, val);
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
        document.getElementById('cpj-prog-title').innerHTML = `${ICONS.iglooClassic} ${t.iglooProgress}`;
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

        const slider = document.getElementById('cpj-slider');
        if (slider && document.activeElement !== slider) {
            slider.value = state.actionInterval;
        }

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

        // Alternância do estado dinâmico do Iglu (Online com Lareira/Fumaça vs Offline Dormindo)
        const launcher = document.getElementById('cpj-launcher');
        if (launcher) launcher.classList.toggle('is-running', !!state.running);
        const modalEl = document.getElementById('cpj-modal');
        if (modalEl) modalEl.classList.toggle('is-running', !!state.running);

        updateSliderFill();
        renderStudioList();
    }

    // 9. Event Listeners e Interatividade - Launcher Arrastável com Memória de Sessão por Pinguim
    let launcherIsDown = false, launcherMoved = false, lStartX = 0, lStartY = 0, lOffX = 0, lOffY = 0, launcherJustMoved = false;

    function getSessionPenguin() {
        return state.currentPenguin || '_default';
    }

    function restoreLauncherPosition(penguinName) {
        const p = penguinName || getSessionPenguin();
        try {
            const raw = sessionStorage.getItem('cpj_launcher_pos_' + p);
            if (raw) {
                const pos = JSON.parse(raw);
                if (typeof pos.left === 'number' && typeof pos.top === 'number') {
                    const mx = Math.max(0, window.innerWidth - (launcher.offsetWidth || 72));
                    const my = Math.max(0, window.innerHeight - (launcher.offsetHeight || 72));
                    launcher.style.setProperty('left', `${Math.max(0, Math.min(mx, pos.left))}px`, 'important');
                    launcher.style.setProperty('top', `${Math.max(0, Math.min(my, pos.top))}px`, 'important');
                    launcher.style.setProperty('right', 'auto', 'important');
                    launcher.style.setProperty('bottom', 'auto', 'important');
                    return;
                }
            }
        } catch (e) { }
        launcher.style.removeProperty('left');
        launcher.style.removeProperty('bottom');
        launcher.style.setProperty('top', '15px', 'important');
        launcher.style.setProperty('right', '38px', 'important');
    }

    launcher.addEventListener('pointerdown', (e) => {
        launcherIsDown = true;
        launcherMoved = false;
        lStartX = e.clientX;
        lStartY = e.clientY;
        const r = launcher.getBoundingClientRect();
        lOffX = e.clientX - r.left;
        lOffY = e.clientY - r.top;
        try { launcher.setPointerCapture(e.pointerId); } catch (ex) { }
        launcher.classList.add('is-dragging');
        e.stopPropagation();
    });

    launcher.addEventListener('pointermove', (e) => {
        if (!launcherIsDown) return;
        if (Math.hypot(e.clientX - lStartX, e.clientY - lStartY) > 5) launcherMoved = true;
        if (launcherMoved) {
            const mx = Math.max(0, window.innerWidth - (launcher.offsetWidth || 72));
            const my = Math.max(0, window.innerHeight - (launcher.offsetHeight || 72));
            const nL = Math.max(0, Math.min(mx, e.clientX - lOffX));
            const nT = Math.max(0, Math.min(my, e.clientY - lOffY));
            launcher.style.setProperty('left', `${nL}px`, 'important');
            launcher.style.setProperty('top', `${nT}px`, 'important');
            launcher.style.setProperty('right', 'auto', 'important');
            launcher.style.setProperty('bottom', 'auto', 'important');
        }
        e.stopPropagation();
    });

    function positionModalBelowLauncher() {
        if (!launcher || !modal) return;
        const lr = launcher.getBoundingClientRect();
        const mw = modal.offsetWidth || 370;
        const mh = modal.offsetHeight || 500;
        let top = lr.bottom + 10;
        const maxTop = window.innerHeight - mh - 12;
        if (top > maxTop) {
            top = (lr.top - mh - 10 >= 10) ? (lr.top - mh - 10) : Math.max(10, maxTop);
        }
        let left = (lr.left + lr.width / 2 > window.innerWidth / 2) ? (lr.right - mw) : lr.left;
        left = Math.max(10, Math.min(window.innerWidth - mw - 10, left));
        modal.style.left = `${Math.round(left)}px`;
        modal.style.top = `${Math.round(top)}px`;
        modal.style.right = 'auto';
        modal.style.bottom = 'auto';
    }

    const endLauncherDrag = (e) => {
        if (!launcherIsDown) return;
        launcherIsDown = false;
        launcher.classList.remove('is-dragging');
        try { launcher.releasePointerCapture(e.pointerId); } catch (ex) { }
        if (launcherMoved) {
            launcherJustMoved = true;
            setTimeout(() => { launcherJustMoved = false; }, 120);
            const r = launcher.getBoundingClientRect();
            try {
                sessionStorage.setItem('cpj_launcher_pos_' + getSessionPenguin(), JSON.stringify({ left: Math.round(r.left), top: Math.round(r.top) }));
            } catch (ex) { }
            if (!modal.classList.contains('cpj-closed')) {
                positionModalBelowLauncher();
            }
        }
        e.stopPropagation();
    };
    launcher.addEventListener('pointerup', endLauncherDrag);
    launcher.addEventListener('pointercancel', endLauncherDrag);

    launcher.addEventListener('click', (e) => {
        e.stopPropagation();
        if (launcherJustMoved) {
            launcherJustMoved = false;
            return;
        }
        if (modal.classList.contains('cpj-closed')) {
            positionModalBelowLauncher();
        }
        modal.classList.toggle('cpj-closed');
    });

    restoreLauncherPosition();
    window.addEventListener('resize', () => restoreLauncherPosition());

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
        state.savePenguin();
        state.validate();
        updateUI();
    });

    document.getElementById('cpj-goal').addEventListener('input', (e) => {
        const clean = e.target.value.replace(/\D/g, '');
        e.target.value = clean;
        state.goal = parseInt(clean, 10) || 0;
        state.savePenguin();
        state.validate();
        updateUI();
    });

    // Checkboxes da Aba Phrases
    document.getElementById('cpj-opt-rotate').addEventListener('click', () => {
        state.rotatePhrases = !state.rotatePhrases;
        state.savePenguin();
        updateUI();
    });

    document.getElementById('cpj-opt-jitter').addEventListener('click', () => {
        state.randomInterval = !state.randomInterval;
        state.savePenguin();
        updateUI();
    });

    document.getElementById('cpj-opt-deact').addEventListener('click', () => {
        state.deactivatePhrases = !state.deactivatePhrases;
        state.savePenguin();
        updateUI();
    });

    // Checkboxes da Aba Actions
    document.getElementById('cpj-opt-dance').addEventListener('click', () => {
        state.autoDance = !state.autoDance;
        state.savePenguin();
        updateUI();
    });

    document.getElementById('cpj-opt-wave').addEventListener('click', () => {
        state.autoWave = !state.autoWave;
        state.savePenguin();
        updateUI();
    });

    document.getElementById('cpj-opt-repeat').addEventListener('click', () => {
        state.repeatAction = !state.repeatAction;
        state.savePenguin();
        if (state.running) {
            startActionLoop();
        }
        updateUI();
    });

    // Slider de Intervalo de Ação (Arrasto Suave Contínuo + Snap Preciso)
    const trackWrap = document.getElementById('cpj-track-wrap');
    const sliderEl = document.getElementById('cpj-slider');

    function applyInterval(val, save = true) {
        val = Math.max(5, Math.min(10, Math.round(val)));
        state.actionInterval = val;
        if (sliderEl && sliderEl.value != val) sliderEl.value = val;
        const finalRatio = (val - 5) / 5;
        renderSliderVisuals(finalRatio, val);
        if (save) {
            state.savePenguin();
            if (state.running && state.repeatAction) {
                startActionLoop();
            }
        }
    }

    let isSliding = false;

    function handlePointerCoord(clientX, isDragging) {
        if (!trackWrap) return;
        const rect = trackWrap.getBoundingClientRect();
        if (rect.width <= 0) return;
        const clickX = clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        const currentSec = Math.max(5, Math.min(10, Math.round(5 + ratio * 5)));

        if (isDragging) {
            // A bolinha segue suavemente o cursor do mouse na exata posição horizontal
            renderSliderVisuals(ratio, currentSec);
            state.actionInterval = currentSec;
            if (sliderEl) sliderEl.value = currentSec;
        } else {
            // Clique pontual ou soltura: dá snap na posição exata daquele segundo
            applyInterval(currentSec, true);
        }
    }

    function onSliderMove(e) {
        if (!isSliding) return;
        handlePointerCoord(e.clientX, true);
        e.preventDefault();
    }

    function onSliderUp(e) {
        if (!isSliding) return;
        isSliding = false;
        window.removeEventListener('pointermove', onSliderMove, true);
        window.removeEventListener('pointerup', onSliderUp, true);
        window.removeEventListener('pointercancel', onSliderUp, true);
        try { trackWrap.releasePointerCapture?.(e.pointerId); } catch (_) { }
        handlePointerCoord(e.clientX, false);
        e.preventDefault();
    }

    if (trackWrap) {
        trackWrap.addEventListener('pointerdown', (e) => {
            isSliding = true;
            try { trackWrap.setPointerCapture?.(e.pointerId); } catch (_) { }
            window.addEventListener('pointermove', onSliderMove, true);
            window.addEventListener('pointerup', onSliderUp, true);
            window.addEventListener('pointercancel', onSliderUp, true);
            handlePointerCoord(e.clientX, true);
            e.preventDefault();
            e.stopPropagation();
        });
    }

    if (sliderEl) {
        sliderEl.addEventListener('input', (e) => applyInterval(Number(e.target.value) || 7, true));
        sliderEl.addEventListener('change', (e) => applyInterval(Number(e.target.value) || 7, true));
    }

    // Modal Escuro Assíncrono In-DOM ("Telinha Preta" que previne disconnect de WebSocket)
    function showDarkPrompt(messageText, defaultVal = '') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'cpj-dark-prompt-overlay';

            const card = document.createElement('div');
            card.className = 'cpj-dark-prompt-card';

            const domain = window.location.hostname || 'play.cpjourney.net';
            const okText = 'OK';
            const cancelText = state.lang === 'pt' ? 'Cancelar' : 'Cancel';

            card.innerHTML = `
                <div class="cpj-dark-prompt-header">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span class="cpj-dark-prompt-domain">${domain}</span>
                </div>
                <div class="cpj-dark-prompt-label">${messageText || ''}</div>
                <input type="text" class="cpj-dark-prompt-input" id="cpj-prompt-input" autocomplete="off" />
                <div class="cpj-dark-prompt-actions">
                    <button type="button" class="cpj-dark-btn-ok" id="cpj-prompt-ok">${okText}</button>
                    <button type="button" class="cpj-dark-btn-cancel" id="cpj-prompt-cancel">${cancelText}</button>
                </div>
            `;

            overlay.appendChild(card);
            document.body.appendChild(overlay);

            const input = card.querySelector('#cpj-prompt-input');
            const okBtn = card.querySelector('#cpj-prompt-ok');
            const cancelBtn = card.querySelector('#cpj-prompt-cancel');

            input.value = defaultVal || '';

            function cleanup(result) {
                window.removeEventListener('keydown', onKey, true);
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                resolve(result);
            }

            function onKey(e) {
                e.stopPropagation();
                if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
                if (e.key === 'Enter') {
                    e.preventDefault();
                    cleanup(input.value);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cleanup(null);
                }
            }

            ['keydown', 'keyup', 'keypress'].forEach(type => {
                card.addEventListener(type, (e) => {
                    e.stopPropagation();
                    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
                }, true);
            });

            okBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cleanup(input.value);
            });

            cancelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cleanup(null);
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cleanup(null);
            });

            card.addEventListener('click', (e) => e.stopPropagation());

            window.addEventListener('keydown', onKey, true);

            setTimeout(() => {
                input.focus();
                input.select();
            }, 30);
        });
    }

    // Phrases Studio CRUD (Criação Direta pelo Input Inline + Telinha Preta Restrita à Edição)
    const studioInp = document.getElementById('cpj-studio-inp');
    const studioAddBtn = document.getElementById('cpj-studio-add');
    let studioMsgTimer = null;

    function showStudioMessage(text, type = 'error') {
        const msgEl = document.getElementById('cpj-studio-msg');
        if (!msgEl) return;
        if (studioMsgTimer) {
            clearTimeout(studioMsgTimer);
            studioMsgTimer = null;
        }
        const iconSvg = type === 'success'
            ? `<div class="cpj-studio-msg-icon"><svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff"><path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.88 0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 3 7.59 9.41C7.21 9.79 7 10.3 7 10.83V19c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-.12z"/></svg></div>`
            : `<div class="cpj-studio-msg-icon"><svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div>`;
        msgEl.className = `cpj-studio-msg ${type}`;
        msgEl.innerHTML = `${iconSvg}<span class="cpj-studio-msg-text">${text}</span>`;
        studioMsgTimer = setTimeout(() => {
            msgEl.className = 'cpj-studio-msg hidden';
            msgEl.innerHTML = '';
            studioMsgTimer = null;
        }, 10000);
    }

    function handleAddPhrase() {
        if (!studioInp) return;
        const val = studioInp.value.trim();
        const t = I18N[state.lang] || I18N.en;
        if (state.phrases.length >= 6) {
            showStudioMessage(t.studioMaxAlert, 'error');
            return;
        }
        if (!val) {
            showStudioMessage(t.studioEmptyAlert, 'error');
            studioInp.focus();
            return;
        }
        if (val.length >= 2) {
            state.phrases.push({ text: val, enabled: true });
            state.saveShared();
            studioInp.value = '';
            renderStudioList();
            updateNextMsgPreview();
            showStudioMessage(t.studioSuccessAlert, 'success');
        }
        studioInp.focus();
    }

    if (studioAddBtn) {
        studioAddBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleAddPhrase();
        });
    }

    if (studioInp) {
        ['keydown', 'keyup', 'keypress'].forEach(evt => {
            studioInp.addEventListener(evt, (e) => {
                e.stopPropagation();
                if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
                if (evt === 'keydown' && e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPhrase();
                }
            }, true);
        });
    }

    document.getElementById('cpj-phrase-list').addEventListener('click', async (e) => {
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
                const editTitle = state.lang === 'pt' ? 'Editar frase:' : 'Edit phrase:';
                const updated = await showDarkPrompt(editTitle, current);
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

    const dragHeader = document.getElementById('cpj-drag');
    dragHeader.addEventListener('dragstart', (e) => e.preventDefault());
    modal.addEventListener('dragstart', (e) => e.preventDefault());

    // Início de arraste (Header)
    dragHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('.cpj-cbtn')) return;
        isDragging = true;
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        startRect = modal.getBoundingClientRect();
        // Fix anti-teleport: sincroniza left e top inline antes de zerar right/bottom
        modal.style.left = `${startRect.left}px`;
        modal.style.top = `${startRect.top}px`;
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
            modal.style.left = `${startRect.left}px`;
            modal.style.top = `${startRect.top}px`;
            modal.style.right = 'auto';
            modal.style.bottom = 'auto';
        });
    });

    // Movimentação global (MouseMove em fase de captura para suavidade total)
    window.addEventListener('mousemove', (e) => {
        if (isDragging && startRect) {
            if (e.clientX <= 0 || e.clientY <= 0) return;
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

    // Bloqueia eventos de clique/mouse e digitação de teclado para não vazarem para o canvas do jogo
    function isolateFromGame(element) {
        if (!element) return;
        const pointerEvents = [
            'mousedown', 'mouseup', 'click', 'dblclick',
            'pointerdown', 'pointerup', 'pointercancel',
            'touchstart', 'touchend', 'contextmenu'
        ];
        pointerEvents.forEach(evt => {
            element.addEventListener(evt, (e) => {
                e.stopPropagation();
            }, false);
        });

        // Soberania do teclado: impede que digitar no card faça o pinguim dançar, acenar ou mandar emotes
        ['keydown', 'keyup', 'keypress'].forEach(evt => {
            element.addEventListener(evt, (e) => {
                if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
                    e.stopPropagation();
                    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
                }
            }, true);
        });
    }
    isolateFromGame(modal);
    isolateFromGame(launcher);

    // Interceptor global em fase de captura para blindagem total dos inputs
    ['keydown', 'keyup', 'keypress'].forEach(type => {
        window.addEventListener(type, (e) => {
            if (e.target && e.target.closest && e.target.closest('#cpj-modal, .cpj-dark-prompt-overlay')) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('.cpj-dark-prompt-card')) {
                    e.stopPropagation();
                    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
                }
            }
        }, true);
    });

    // Atalho F9
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F9' && !e.target.closest('input, textarea, .cpj-dark-prompt-overlay')) {
            if (modal.classList.contains('cpj-closed')) {
                positionModalBelowLauncher();
            }
            modal.classList.toggle('cpj-closed');
        }
    });

    updateLanguageUI();
})();
