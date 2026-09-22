# Proposal: Per-Penguin Profiles, Auto-Pause Safety & Cross-Browser Stability

## 1. Motivation & Context
The **IglooLiker 3000** suite has established robust AFK automation for Club Penguin Journey (CPJ). However, real-world multi-account gameplay and extended usage have surfaced specific limitations and stability bugs:

1. **Lack of Per-Penguin Isolation:** 
   Currently, Igloo Likes Progression (`likes` and `goal`) and action preferences are stored under a single global key. When a player alternates between different penguins (e.g., Penguin A targeting 1,000 likes with active chat vs Penguin B with chat disabled and continuous dancing/waving), one penguin's settings overwrite the other's. When returning after closing the browser, settings reflect only the last active account.

2. **Uncontrolled Bot Execution During Navigation (Need for Auto-Pause):**
   When players navigate to another room or open the in-game map while the bot is running, the bot continues attempting to dispatch chat messages or action loops. Players need the bot to automatically pause whenever they change rooms or open the map, mirroring an invisible click on "PAUSE BOT".

3. **Card Teleporting Bug (Drag Snap):**
   When dragging the HUD card across the screen, the card intermittently snaps/teleports to the far left of the viewport (`x = 0`), disrupting user layout.

4. **Action Interval Slider Disappearance (Firefox & Login Transition):**
   On the initial menu screen, the Action Interval slider bar renders properly. However, as soon as a penguin is selected and enters the game, the slider bar track and thumb disappear entirely on Firefox (leaving an empty gap between the 5s and 10s indicators).

5. **Game Disconnection on Phrase Creation/Editing:**
   Editing or adding a phrase via the Phrases Studio invokes synchronous `window.prompt()`, which freezes the browser's JavaScript event loop. This blocks Yukon WebSocket heartbeat ping packets, causing the CPJ server to disconnect the player immediately. Crucially, the user requested to keep the exact dark modal aesthetic ("telinha preta") seen in the native prompt screenshot.

---

## 2. Scope of the Solution

### 2.1 Storage Scope Clarification: Global vs Per-Penguin
To eliminate state collisions while keeping phrase libraries synchronized:

* **Global Shared Scope (`localStorage: cpj_shared_data_v3`):**
  - **Phrases Studio CRUD:** All custom phrases created, edited, or deleted in the Studio remain shared across all penguins.
  - **Interface Language:** The active language preference (`English (USA)` or `Português (Brasil)`) remains uniform across all sessions.

* **Individual Per-Penguin Scope (`localStorage: cpj_penguin_{username}`):**
  - **Likes & Target Goal:** `likes` and `goal` are uniquely stored per penguin and restored upon login.
  - **Action Toggles:** `autoDance`, `autoWave`, and `repeatAction` states.
  - **Action Interval Slider:** The configured interval in seconds (`actionInterval`, 5s–10s).
  - **Phrase Operation Toggles:** `deactivatePhrases` (silent mode), `rotatePhrases`, and `randomInterval` (anti-spam jitter).
  - **Persistence:** Saved permanently across browser reboots, tab closures, and account switches.

### 2.2 Auto-Pause on Room Change or Map Open
- **Room Transition Detection:** The injected page bridge (`__CPJ_YUKON_BRIDGE__`) monitors `world.room.id` / `roomKey` and network room packets (`join_room`). When a room change is confirmed, the bridge emits `CPJ_ROOM_CHANGED`.
- **Map Open Detection:** The bridge monitors active Phaser scenes (`g.scene.isActive('Map')`), interface map status, HUD map button clicks, and the native 'M' keypress. When detected, the bridge emits `CPJ_MAP_OPENED`.
- **Action:** Upon receiving either signal, if `state.running` is active, the bot pauses immediately (calling the standard Pause routine, clearing timers, and updating the HUD toggle button to "START BOT"). Works seamlessly whether the modal is visible, minimized, or closed (`.cpj-closed`).

### 2.3 Drag Stabilization & Teleport Prevention (Bug 1)
- Explicitly initialize `modal.style.left` and `modal.style.top` to `getBoundingClientRect()` coordinates before clearing `right` and `bottom` styles, preventing CSS static position snap (x=0).
- Implement Pointer Capture (`setPointerCapture`) and block native HTML5 text/SVG `dragstart` events, preventing cursor loss and coordinate resets.

### 2.4 Cross-Browser Action Interval Slider Fix (Bug 2)
- Re-architect slider CSS specifically for Gecko (`::-moz-range-track`, `::-moz-range-progress`, `::-moz-range-thumb`) and WebKit (`::-webkit-slider-runnable-track`, `::-webkit-slider-thumb`), eliminating `background: transparent !important` that caused the Firefox rendering collapse.
- Ensure slider fill and thumb dimensions render visibly and consistently before and after login across Firefox, Chrome, Edge, and Safari.

### 2.5 In-DOM Non-Blocking Dark Modal Prompt (Bug 3)
- Replace blocking `window.prompt()` with an asynchronous DOM modal matching the pixel-perfect aesthetic of the user's screenshot:
  - Dark rounded container (`background: #1c1b22`, border `#0077c4` / `#00e5ff`).
  - Title header (`play.cpjourney.net` with globe icon) and descriptive action label.
  - Cyan-bordered rounded input pill (`#00e5ff` focus outline).
  - "OK" (cyan button) and "Cancelar" (dark button) controls with `Enter` and `Escape` hotkey bindings.
- Non-blocking architecture preserves active WebSocket connections, eliminating game disconnects while honoring user visual preferences.

---

## 3. Strict Non-Regression Doctrine
- **Action Dispatchers:** `dance()` ('D' keypress) and `wave()` ('W' keypress) logic remain 100% intact for single and repeat triggers.
- **Chat Engine:** Canvas pointer clicks (`x=1026, y=923`), clipboard copy fallback, and text input dispatchers are strictly untouched.
- **Zero Emojis:** Pure SVG vector iconography and Club Penguin palette throughout all components.
