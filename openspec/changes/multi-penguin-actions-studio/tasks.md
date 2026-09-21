# Implementation Tasks: Multi-Penguin Actions & Phrases Studio Suite

## 1. State Segregation & i18n Foundation
- [x] 1.1 Implement `sessionStorage` per-tab isolation for tab-specific execution states (`isRunning`, `autoDance`, `autoWave`, `repeatAction`, `actionInterval`, `deactivatePhrases`, `activeTab`).
- [x] 1.2 Implement `localStorage` persistence for shared custom phrases (`cpj_booster_phrases`), target goal, and language preference.
- [x] 1.3 Create the bilingual dictionary `I18N` (`en` and `pt`) and reactive localization updater for dynamic language switching.

## 2. Language Selector Dropdown
- [x] 2.1 Build the interactive language selector dropdown component styled after Club Penguin menus, placed directly above the igloo progression card.
- [x] 2.2 Wire dropdown click toggle, selection handlers, and instant interface re-render between English (USA) and Português (Brasil).

## 3. Tab Navigation System (Phrases, Actions, Studio)
- [x] 3.1 Construct the 3-tab navigation bar (`Phrases`, `Actions`, `Studio`) with Club Penguin pill buttons and cyan active indicators.
- [x] 3.2 Implement tab switching logic with animated transitions and active tab persistence in `sessionStorage`.

## 4. Action Engine (Wave, Dance, Alternation & Snow Slider)
- [x] 4.1 Implement `wave()` dispatcher using `pageWin.KeyboardEvent` (`W` / `KeyW` / keyCode 87) to reset server AFK timers.
- [x] 4.2 Implement alternating action cycle logic: when both `Auto-Dance` and `Auto-Wave` are enabled, alternate sequentially between them (Option A).
- [x] 4.3 Build the snow-to-orange horizontal slider (5s to 10s) with live interval display pill (`Action Interval: [ 7s ]`).
- [x] 4.4 Connect `Repeat Action` timer loop to trigger active actions at the configured slider interval.

## 5. Phrases Studio (CRUD System)
- [x] 5.1 Build the phrase creation input bar with `+ ADD PHRASE` button and 6-phrase maximum capacity guard.
- [x] 5.2 Build the phrase list with slot indicators (`[N/6]`), inline editing pills, and delete buttons.
- [x] 5.3 Wire custom Studio phrases into the rotating chat engine with fallback to defaults.

## 6. Chat Deactivation & Non-Intrusive Verification
- [x] 6.1 Implement `deactivatePhrases` checkbox that completely bypasses chat focusing, clipboard copying, and HUD sending.
- [x] 6.2 Verify that existing chat automation routines (focus, clear, `execCommand('insertText')`, canvas click at `x=1026, y=923`) remain strictly intact and bug-free.
- [x] 6.3 Test multi-tab isolation: verify Tab 1 (broadcaster) and Tab 2 (spectator) operate independently without state bleed.
- [x] 6.4 Update `preview.html` to allow full local simulation and testing of the new multi-tab suite and language switcher.

## 7. Bugfixes & Studio Refinements
- [x] 7.1 Constrain modal card max-height (520px / viewport) with custom cyan scrollbar on `.cpj-content`.
- [x] 7.2 Fix 2D dragging: unrestricted X and Y movement without height-clamping lock.
- [x] 7.3 Fix action interval slider rendering with explicit appearance, fallback background, and dynamic `!important` gradient fill.
- [x] 7.4 Implement light gray eye icon toggle (closed = active/included in rotation, open = inactive/excluded) in Phrases Studio.
- [x] 7.5 Verify and guarantee persistence of phrases (with enabled state) in `localStorage` and tab actions in `sessionStorage`.
- [x] 7.6 Isolate modal and launcher clicks using capture-phase event stoppage to prevent penguin walking on game canvas.
- [x] 7.7 Ensure modular architecture compliance with < 250 lines per file in `core/` and `ui/`.

## 8. Window-Style 8-Way Resizing & Adaptive Scaling
- [x] 8.1 Fix drag release and Y-axis movement by removing CSS `!important` on positioning and using window-capture mouseup listener.
- [x] 8.2 Add 8-way edge and corner resizer handles (`n`, `s`, `w`, `e`, `nw`, `ne`, `sw`, `se`) for free resizing like a browser window.
- [x] 8.3 Implement reactive scaling `--cpj-scale` dynamically adjusting typography, inputs, icons, buttons, and layout proportionally.
- [x] 8.4 Maintain strict preservation of Yukon/bridge chat automation routines.
- [x] 8.5 Keep modular architecture (< 250 lines per file in `core/` and `ui/`) and update `preview.html`.

## 9. Visual Refinements & Click-Through Prevention
- [x] 9.1 Soften font-weight on language dropdown and tab buttons (semi-bold 600 instead of heavy bold).
- [x] 9.2 Block click-through to game canvas on mouseup/pointerup during card dragging or clicking.
- [x] 9.3 Conditionally show action interval slider with smooth CSS open/collapse animation only when Repeat Action is checked.
- [x] 9.4 Move igloo launcher further left (right: 38px) and increase igloo icon size (28px).
- [x] 9.5 Enhance Phrases Studio "+ ADD" button with instant prompt fallback when clicked empty, Enter keypress support, and auto-focus.
- [x] 9.6 Keep modular files (< 250 lines) and test changes in preview.
