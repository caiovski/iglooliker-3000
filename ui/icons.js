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
    `
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CP_ICONS };
} else {
    window.CP_ICONS = CP_ICONS;
}
