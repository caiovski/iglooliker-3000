# Technical Design: Multi-Penguin Actions & Phrases Studio Suite

## 1. Architecture & State Segregation

To solve the multi-penguin tab collision problem while sharing custom phrases, the state is split across browser storage layers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER SESSION                               │
├────────────────────────────────────┬────────────────────────────────────┤
│   TAB 1: Broadcaster Penguin       │   TAB 2: Spectator Penguin         │
│   (sessionStorage: Isolated)       │   (sessionStorage: Isolated)       │
├────────────────────────────────────┼────────────────────────────────────┤
│ • isRunning: true                  │ • isRunning: true                  │
│ • autoDance: true                  │ • autoDance: false                 │
│ • autoWave: false                  │ • autoWave: true                   │
│ • repeatAction: false              │ • repeatAction: true (7s interval) │
│ • deactivatePhrases: false         │ • deactivatePhrases: true          │
│ • activeTab: 'phrases'             │ • activeTab: 'actions'             │
├────────────────────────────────────┴────────────────────────────────────┤
│                      SHARED STORAGE (localStorage)                      │
├─────────────────────────────────────────────────────────────────────────┤
│ • cpj_booster_phrases: Array of up to 6 custom strings                  │
│ • cpj_booster_goal: Global likes target number                          │
│ • cpj_booster_lang: Default language preference ('en' | 'pt')           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Action Engine & Alternating Logic

### 2.1 Wave Action Dispatcher
```javascript
function wave() {
    try {
        const target = document.querySelector('canvas') || document.body;
        const PageKE = pageWin.KeyboardEvent || window.KeyboardEvent;
        const downEv = new PageKE('keydown', { key: 'w', code: 'KeyW', keyCode: 87, which: 87, bubbles: true });
        const upEv = new PageKE('keyup', { key: 'w', code: 'KeyW', keyCode: 87, which: 87, bubbles: true });
        target.dispatchEvent(downEv);
        setTimeout(() => target.dispatchEvent(upEv), 80);
    } catch (e) {
        console.warn('[CPJ Action] Wave dispatch error:', e);
    }
}
```

### 2.2 Alternating Execution Loop
When both `Auto-Dance` and `Auto-Wave` are active, a cycle index tracks the sequence:
```javascript
let actionCycleIndex = 0;

function executeActiveAction() {
    if (state.autoDance && state.autoWave) {
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
```

### 2.3 Action Repeater Timer
When `Repeat Action` is checked, a secondary timer runs at `actionInterval * 1000` ms (range: 5s to 10s):
- **Initial Trigger:** Executed immediately on `Start Bot`.
- **Interval Loop:** Triggers `executeActiveAction()` at the configured slider interval.
- **Cleanup:** Cleared immediately on `Pause Bot`.

---

## 3. Snow / Orange Interval Slider Component

### 3.1 CSS Implementation
The slider uses a native `<input type="range" min="5" max="10" step="1">` enhanced with Club Penguin snow and orange styling:
```css
.cpj-snow-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 12px;
    border-radius: 6px;
    outline: none;
    border: 2px solid #00284d;
    background: linear-gradient(to right, #ff8800 0%, #ff8800 var(--fill-pct, 40%), #ffffff var(--fill-pct, 40%), #ffffff 100%);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
    cursor: pointer;
}

.cpj-snow-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ffffff;
    border: 2.5px solid #00e5ff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
    cursor: pointer;
    transition: transform 0.1s ease;
}

.cpj-snow-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
}
```

---

## 4. Phrases Studio (CRUD System)

### 4.1 Data Structure & Storage
```typescript
interface PhraseItem {
    id: string;
    text: string;
}

// Stored in localStorage as:
// cpj_booster_custom_phrases: ["Phrase 1", "Phrase 2", ...] (length <= 6)
```

### 4.2 CRUD Handlers
1. **Create:** Adds phrase if `phrases.length < 6` and `text.trim().length > 0`.
2. **Read:** Renders numbered list with character counts and slots `[N/6]`.
3. **Update:** Prompts or switches row into an inline input pill to update phrase text.
4. **Delete:** Removes phrase by index with immediate re-indexing.

---

## 5. Bilingual Dictionary (i18n)

```javascript
const I18N = {
    en: {
        title: "IGLOOLIKER 3000",
        statusActive: "Active & Dancing",
        statusPaused: "Ready (Paused)",
        allRooms: "All Rooms",
        detectedLikes: "LIKES DETECTED",
        targetGoal: "TARGET GOAL",
        progress: "Progress Completion:",
        tabPhrases: "Phrases",
        tabActions: "Actions",
        tabStudio: "Studio",
        rotatePhrases: "Rotate Like Phrases",
        randomDelay: "Random Anti-Spam (9s to 11s)",
        deactivatePhrases: "Deactivate Phrases",
        autoDance: "Auto-Dance ('D') Keypress",
        autoWave: "Auto-Wave ('W') Keypress",
        repeatAction: "Repeat Action",
        actionInterval: "Action Interval:",
        startBot: "START BOT",
        stopBot: "STOP BOT",
        studioAdd: "+ ADD PHRASE",
        studioLimit: "Maximum 6 phrases reached",
        langSelect: "Language:"
    },
    pt: {
        title: "IGLOOLIKER 3000",
        statusActive: "Ativo & Dançando",
        statusPaused: "Pronto (Pausado)",
        allRooms: "Todas as Salas",
        detectedLikes: "LIKES DETECTADOS",
        targetGoal: "META DE LIKES",
        progress: "Progresso da Meta:",
        tabPhrases: "Frases",
        tabActions: "Ações",
        tabStudio: "Estúdio",
        rotatePhrases: "Rotacionar Frases de Like",
        randomDelay: "Anti-Spam Aleatório (9s a 11s)",
        deactivatePhrases: "Desativar Frases (Silencioso)",
        autoDance: "Auto-Dança (Tecla 'D')",
        autoWave: "Auto-Aceno (Tecla 'W')",
        repeatAction: "Repetir Ação",
        actionInterval: "Intervalo de Ação:",
        startBot: "LIGAR BOT",
        stopBot: "PAUSAR BOT",
        studioAdd: "+ ADICIONAR FRASE",
        studioLimit: "Limite máximo de 6 frases atingido",
        langSelect: "Idioma:"
    }
};
```

---

## 6. Language Selector Dropdown

- **Position:** Directly above the Progression Card.
- **Markup:** Club Penguin styled selector pill with chevron icon.
- **Click Behavior:** Toggles a dropdown floating menu (`en` vs `pt`).
- **Persistence:** Saved in `localStorage` under `cpj_booster_lang` so preferred language survives tab restarts.
