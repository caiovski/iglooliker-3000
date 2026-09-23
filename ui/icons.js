/**
 * CPJ Igloo Likes AFK Booster - Ícones Vetoriais SVG (Zero Emojis)
 * Extraídos e estilizados com fidelidade ao Club Penguin.
 * Regra opsx-build: arquivo dedicado < 100 linhas.
 */

const CP_ICONS = {
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
        <g class="cpj-igloo-offline">
            <text class="cpj-anim-z1" x="14" y="3.5" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="3.8" fill="#68c7ff">Z</text>
            <text class="cpj-anim-z2" x="17.5" y="1" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="3.1" fill="#8ee0ff">z</text>
            <text class="cpj-anim-z3" x="20.5" y="-1" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="2.4" fill="#b8f0ff">z</text>
        </g>
        <g id="cpjRoosterGroup">
            <path class="cpj-anim-wind-1" d="M 0 1.8 Q 2.5 0.9, 5 1.8 T 9 1.8" fill="none" stroke="#ffffff" stroke-width="0.75" stroke-linecap="round"/>
            <path class="cpj-anim-wind-2" d="M -4 3.0 Q -1.5 2.1, 1 3.0 T 5 3.0" fill="none" stroke="#e0f7ff" stroke-width="0.7" stroke-linecap="round"/>
            <path class="cpj-anim-wind-3" d="M -8 2.2 Q -5.5 1.3, -3 2.2 T 1 2.2" fill="none" stroke="#b8e8ff" stroke-width="0.65" stroke-linecap="round"/>
            <g transform="rotate(-23, 11.5, 6.8)">
                <ellipse cx="11.5" cy="6.8" rx="1.2" ry="0.5" fill="#002447" opacity="0.5"/>
                <line x1="11.5" y1="6.8" x2="11.5" y2="4.4" stroke="#253542" stroke-width="0.9" stroke-linecap="round"/>
                <line x1="11.5" y1="6.8" x2="11.5" y2="4.4" stroke="#ffffff" stroke-width="0.35" stroke-linecap="round"/>
                <circle cx="11.5" cy="4.5" r="0.6" fill="url(#cpjSilverGrad)" stroke="#1a252e" stroke-width="0.3"/>
            </g>
            <g class="cpj-anim-rooster">
                <line x1="6.2" y1="4.6" x2="14.4" y2="4.6" stroke="#16222b" stroke-width="0.7"/>
                <line x1="6.4" y1="4.6" x2="14.2" y2="4.6" stroke="#ffffff" stroke-width="0.25"/>
                <polygon points="5.6,4.6 7.8,3.7 7.3,4.6 7.8,5.5" fill="url(#cpjSilverGrad)" stroke="#16222b" stroke-width="0.3"/>
                <path d="M 12.8 3.8 L 14.4 3.1 L 13.9 4.6 L 14.4 6.1 L 12.8 5.4 Z" fill="url(#cpjSilverGrad)" stroke="#16222b" stroke-width="0.3"/>
                <line x1="9.5" y1="4.6" x2="9.8" y2="3.9" stroke="#16222b" stroke-width="0.6"/>
                <line x1="10.5" y1="4.6" x2="10.7" y2="3.9" stroke="#16222b" stroke-width="0.6"/>
                <path d="M 9.5 4.0 C 8.8 4.0, 8.2 3.65, 7.8 3.2 C 7.6 2.8, 7.7 2.4, 7.8 2.05 C 7.7 1.9, 7.5 1.95, 7.3 1.85 C 7.15 1.75, 7.2 1.6, 7.3 1.5 L 6.3 1.45 L 7.2 1.20 L 7.3 0.80 L 7.55 1.00 L 7.8 0.55 L 8.05 0.85 L 8.35 0.40 L 8.60 0.75 L 8.95 0.55 L 9.15 0.85 C 9.0 1.05, 8.8 1.15, 8.6 1.25 C 8.9 1.7, 9.4 2.2, 9.9 2.6 C 10.4 2.9, 10.9 3.0, 11.4 2.8 C 12.3 1.3, 13.5 0.8, 14.5 1.7 C 13.9 2.1, 13.2 2.5, 12.3 2.7 C 13.1 1.9, 14.2 1.8, 14.6 2.7 C 13.9 3.0, 13.3 3.2, 12.5 3.3 C 12.9 3.1, 13.7 3.0, 14.1 3.7 C 13.4 3.8, 12.9 3.8, 12.2 3.7 C 11.4 3.9, 10.5 4.0, 9.5 4.0 Z" fill="url(#cpjSilverGrad)" stroke="#16222b" stroke-width="0.32" stroke-linejoin="round"/>
                <path d="M 7.3 1.5 C 7.15 1.75, 7.25 2.05, 7.45 2.05 C 7.65 2.05, 7.75 1.85, 7.75 1.7" fill="url(#cpjSilverGrad)" stroke="#16222b" stroke-width="0.22"/>
                <line x1="6.4" y1="1.45" x2="7.2" y2="1.45" stroke="#16222b" stroke-width="0.22"/>
                <circle cx="7.45" cy="1.30" r="0.18" fill="#16222b"/>
                <path d="M 11.5 2.7 C 12.3 1.3, 13.5 0.8, 14.4 1.7 C 13.8 2.1, 13.2 2.5, 12.3 2.7" fill="url(#cpjSilverTailGrad)" stroke="#16222b" stroke-width="0.25"/>
                <path d="M 11.9 3.0 C 12.8 2.0, 13.9 1.9, 14.5 2.7 C 13.9 3.0, 13.3 3.2, 12.5 3.3" fill="url(#cpjSilverTailGrad)" stroke="#16222b" stroke-width="0.25"/>
                <path d="M 11.8 3.5 C 12.6 2.9, 13.5 3.0, 14.0 3.7 C 13.4 3.8, 12.8 3.8, 12.2 3.7" fill="url(#cpjSilverTailGrad)" stroke="#16222b" stroke-width="0.2"/>
                <path d="M 7.8 2.3 C 7.6 2.7, 7.7 3.2, 8.3 3.6" fill="none" stroke="#ffffff" stroke-width="0.35" stroke-linecap="round"/>
            </g>
        </g>
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
        <ellipse cx="14" cy="23" rx="12" ry="2.5" fill="#a8e0ff" opacity="0.6"/>
        <g class="cpj-igloo-online cpj-anim-floor">
            <ellipse cx="10" cy="22.5" rx="5.5" ry="2.0" fill="url(#cpjFloorGrad)" filter="url(#cpjSoftBlur)"/>
        </g>
        <path d="M 6 21 C 5 13 9 5 17 5 C 23 5 26 12 25 21 Z" fill="#ffffff" stroke="#003566" stroke-width="1.2"/>
        <path d="M 8.5 16 C 13 14 20 14 24.5 16.5" fill="none" stroke="#55aee8" stroke-width="1"/>
        <path d="M 10 11.5 C 13.5 10 18 10 23 12" fill="none" stroke="#55aee8" stroke-width="1"/>
        <path d="M 12.5 8 C 15 7.2 18 7.2 20.5 8.5" fill="none" stroke="#55aee8" stroke-width="0.9"/>
        <line x1="16.5" y1="5.2" x2="16.5" y2="7.8" stroke="#55aee8" stroke-width="0.9"/>
        <line x1="13.5" y1="8.2" x2="13.5" y2="10.8" stroke="#55aee8" stroke-width="0.9"/>
        <line x1="16" y1="11.5" x2="16" y2="14.8" stroke="#55aee8" stroke-width="0.9"/>
        <g transform="matrix(0.85 0 0 1 3.2 0)">
            <path d="M 17.6 11.8 L 22.8 12.1 L 22.8 16.8 L 17.6 16.8 Z" fill="#7a3e14" stroke="#452004" stroke-width="0.8" stroke-linejoin="round"/>
            <line x1="18.2" y1="12.3" x2="22.2" y2="12.4" stroke="#9e521e" stroke-width="0.4"/>
            <rect x="17.0" y="16.7" width="6.4" height="0.95" rx="0.4" fill="#4d2307" stroke="#261002" stroke-width="0.5"/>
            <g class="cpj-igloo-online">
                <rect class="cpj-anim-fire" x="18.3" y="12.7" width="3.8" height="3.5" rx="0.4" fill="url(#cpjWinGlow)"/>
                <path d="M 18.8 13.2 L 21.2 15.6" stroke="#ffffff" stroke-width="0.65" opacity="0.8" stroke-linecap="round"/>
                <path d="M 19.8 13.0 L 21.6 14.8" stroke="#ffffff" stroke-width="0.45" opacity="0.6" stroke-linecap="round"/>
            </g>
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
        <path d="M 3.5 21 C 3.5 14 6 12.5 11 12.5 C 15 12.5 15.5 14.5 15.5 21 Z" fill="#eaf7ff" stroke="#003566" stroke-width="1.2"/>
        <path d="M 4 16 L 7 16" stroke="#55aee8" stroke-width="0.9"/>
        <path d="M 12 16 L 15 16" stroke="#55aee8" stroke-width="0.9"/>
        <path d="M 6.5 13.5 L 8.5 15" stroke="#55aee8" stroke-width="0.9"/>
        <path d="M 12.5 13.5 L 11 15" stroke="#55aee8" stroke-width="0.9"/>
        <g class="cpj-igloo-online">
            <path class="cpj-anim-fire" d="M 7 21 C 7 16 8.5 15 10.5 15 C 12.5 15 13 16 13 21 Z" fill="url(#cpjDoorGlow)" stroke="#d48800" stroke-width="0.6"/>
            <path d="M 7.5 20.5 C 7.5 16.5 8.8 15.5 10.5 15.5 C 12.2 15.5 12.5 16.5 12.5 20.5" fill="none" stroke="#fff5cc" stroke-width="0.7" opacity="0.8"/>
        </g>
        <g class="cpj-igloo-offline">
            <path d="M 7 21 L 7 16 C 7 14.8 8.5 14.4 10.5 14.4 C 12.5 14.4 13 14.8 13 16 L 13 21 Z" fill="#b0522a" stroke="#002b4d" stroke-width="0.8"/>
            <line x1="8.5" y1="21" x2="8.5" y2="15.2" stroke="#66280e" stroke-width="0.5"/>
            <line x1="10" y1="21" x2="10" y2="14.5" stroke="#66280e" stroke-width="0.5"/>
            <line x1="11.5" y1="21" x2="11.5" y2="15.2" stroke="#66280e" stroke-width="0.5"/>
            <polygon points="7.6,16.2 8.5,15.6 12.4,20.4 11.5,21" fill="#8c3b18" stroke="#4a1c09" stroke-width="0.4"/>
            <rect x="11.2" y="17.2" width="0.8" height="1.6" rx="0.3" fill="#1e252a" stroke="#0d1114" stroke-width="0.3"/>
            <circle cx="11.4" cy="18.0" r="0.9" fill="url(#cpjCastIron)" stroke="#12161a" stroke-width="0.4"/>
            <circle cx="11.15" cy="17.75" r="0.28" fill="#a4b3bf"/>
        </g>
    </svg>`,
    close: `
        <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#ffffff"/>
        </svg>
    `,
    minimize: `
        <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M6 19h12v2H6z" fill="#ffffff"/>
        </svg>
    `,
    maximize: `
        <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M4 4h16v16H4zm2 4v10h12V8z" fill="#ffffff"/>
        </svg>
    `,
    check: `
        <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#000000"/>
        </svg>
    `,
    play: `
        <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M8 5v14l11-7z" fill="#ffffff"/>
        </svg>
    `,
    stop: `
        <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M6 6h12v12H6z" fill="#ffffff"/>
        </svg>
    `,
    eyeClosed: `
        <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M12 17c-3.9 0-7.3-2.2-9-5.5.6-1.2 1.5-2.2 2.5-3.1L3.8 6.7 5.2 5.3l14.1 14.1-1.4 1.4-2.3-2.3c-1.1.7-2.3 1.1-3.6 1.1zm-4.7-6.1c.4 1.5 1.7 2.6 3.2 2.6.5 0 1-.1 1.4-.4l-4.2-4.2c-.2.6-.4 1.3-.4 2zm13.7.6c-.7 1.6-1.8 3-3.2 4.1l-1.5-1.5c1.1-.8 2-1.8 2.7-3.1-1.7-3.3-5.1-5.5-9-5.5-1.1 0-2.2.2-3.2.5L5.3 4.6C7.3 3.9 9.6 3.5 12 3.5c5 0 9.3 3.1 11 8.5z" fill="#cfd8dc"/>
        </svg>
    `,
    eyeOpen: `
        <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#cfd8dc"/>
        </svg>
    `,
    edit: `
        <svg viewBox="0 0 24 24" width="13" height="13"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#ffffff"/></svg>
    `,
    trash: `
        <svg viewBox="0 0 24 24" width="13" height="13"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#ffffff"/></svg>
    `,
    heartBadge: `<svg class="cpj-header-heart" viewBox="-16 -16 32 32" width="22" height="22" style="flex-shrink:0;vertical-align:middle;display:inline-block;overflow:visible;"><circle cx="0" cy="0" r="13.5" fill="#ff2a6d" stroke="#ffffff" stroke-width="2.5"/><path d="M -6 -2 A 3.5 3.5 0 0 1 0 1 A 3.5 3.5 0 0 1 6 -2 Q 6 4 0 8 Q -6 4 -6 -2 Z" fill="#ffffff"/></svg>`,
    iglooClassic: `<svg viewBox="0 0 24 24" width="20" height="20" style="vertical-align:middle;display:inline-block;flex-shrink:0;"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.42 3.12 7.24L5 20h14l-.12-.76C20.8 17.42 22 14.85 22 12c0-5.52-4.48-10-10-10z" fill="#ffffff"/><path d="M12 4c-4.41 0-8 3.59-8 8 0 2.25.93 4.28 2.43 5.75L7 18h10l.57-.25C19.07 16.28 20 14.25 20 12c0-4.41-3.59-8-8-8z" fill="#e6f7ff"/><path d="M10 14h4v6h-4z" fill="#002d55"/><path d="M10 14a2 2 0 0 1 4 0v6h-4v-6z" fill="#001830"/></svg>`
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CP_ICONS };
} else {
    window.CP_ICONS = CP_ICONS;
}
