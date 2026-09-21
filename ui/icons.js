/**
 * CPJ Igloo Likes AFK Booster - Ícones Vetoriais SVG (Zero Emojis)
 * Extraídos e estilizados com fidelidade ao Club Penguin.
 * Regra opsx-build: arquivo dedicado < 100 linhas.
 */

const CP_ICONS = {
    igloo: `
        <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.42 3.12 7.24L5 20h14l-.12-.76C20.8 17.42 22 14.85 22 12c0-5.52-4.48-10-10-10z" fill="#ffffff"/>
            <path d="M12 4c-4.41 0-8 3.59-8 8 0 2.25.93 4.28 2.43 5.75L7 18h10l.57-.25C19.07 16.28 20 14.25 20 12c0-4.41-3.59-8-8-8z" fill="#e6f7ff"/>
            <path d="M10 14h4v6h-4z" fill="#002d55"/>
            <path d="M10 14a2 2 0 0 1 4 0v6h-4v-6z" fill="#001830"/>
        </svg>
    `,
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
    `
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CP_ICONS };
} else {
    window.CP_ICONS = CP_ICONS;
}
