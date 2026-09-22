# Technical Design: Per-Penguin Profiles, Auto-Pause Safety & Cross-Browser Stability

## 1. Architecture & Storage Separation

To satisfy both shared phrase management and strict per-account isolation, storage is segregated into two tiers:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           STORAGE ARCHITECTURE                            │
├─────────────────────────────────────┬─────────────────────────────────────┤
│   TIER 1: GLOBAL (Shared)           │   TIER 2: PER-PENGUIN (Isolated)    │
│   Key: cpj_shared_data_v3           │   Key: cpj_penguin_{username}       │
├─────────────────────────────────────┼─────────────────────────────────────┤
│ • phrases: Array of custom phrases  │ • likes: Number (igloo likes)       │
│ • lang: 'en' | 'pt'                 │ • goal: Number (target goal)        │
│                                     │ • autoDance: Boolean                │
│                                     │ • autoWave: Boolean                 │
│                                     │ • repeatAction: Boolean             │
│                                     │ • actionInterval: Number (5s - 10s) │
│                                     │ • deactivatePhrases: Boolean        │
│                                     │ • rotatePhrases: Boolean            │
│                                     │ • randomInterval: Boolean           │
└─────────────────────────────────────┴─────────────────────────────────────┘
```

### 1.1 Penguin Identification Lifecycle
1. When navigating `play.cpjourney.net` prior to login, the script uses default or last-known parameters without throwing errors.
2. The page bridge continuously monitors Yukon client presence:
   ```javascript
   for (const sc of (g.scene?.scenes || [])) {
       const client = sc.world?.client || sc.client;
       if (client?.penguin?.username) {
           const u = client.penguin.username.toLowerCase();
           window.postMessage({
               type: 'CPJ_PENGUIN_IDENTIFIED',
               username: u,
               id: client.penguin.id,
               likes: client.penguin.iglooLikes ?? client.penguin.likes
           }, '*');
           break;
       }
   }
   ```
3. Upon receiving `CPJ_PENGUIN_IDENTIFIED`, the userscript:
   - Binds `state.currentPenguin = username`.
   - Reads `localStorage.getItem('cpj_penguin_' + username)`.
   - Populates `likes`, `goal`, and action configuration specifically for that penguin.
   - Updates the HUD display reactively.

---

## 2. Auto-Pause Detection Engine (Room Change & Map Open)

### 2.1 Room Change Detection
Yukon instantiates room identifiers inside `world.room` or `client.room`:
- In the bridge loop (running at 500ms intervals), the bridge compares `currentRoomId`:
  ```javascript
  const curRoom = sc.world?.room?.id ?? sc.client?.room?.id ?? sc.world?.roomKey;
  if (curRoom && lastRoomId !== null && curRoom !== lastRoomId) {
      window.postMessage({ type: 'CPJ_ROOM_CHANGED', oldRoom: lastRoomId, newRoom: curRoom }, '*');
  }
  lastRoomId = curRoom;
  ```
- Additionally, incoming packets in `net.onMessage` are hooked to intercept room transition opcodes (`join_room`, `jr`).

### 2.2 Map Open Detection
- In Yukon/Phaser, opening the map activates the `'Map'` scene or sets map interface visibility:
  ```javascript
  const mapScene = g.scene?.getScene('Map');
  const isMapActive = g.scene?.isActive('Map') || (mapScene && mapScene.sys?.isVisible());
  if (isMapActive && !lastMapState) {
      window.postMessage({ type: 'CPJ_MAP_OPENED' }, '*');
  }
  lastMapState = isMapActive;
  ```
- Additional safety listeners on window for the `'m'` / `'M'` hotkey trigger notification if pressed while game canvas has focus.

### 2.3 Auto-Pause Dispatcher
Upon receiving `CPJ_ROOM_CHANGED` or `CPJ_MAP_OPENED`:
```javascript
if (state.running) {
    state.running = false;
    if (botTimer) clearTimeout(botTimer);
    stopActionLoop();
    updateUI();
}
```
This halts timers and returns the button to "START BOT" immediately, functioning with zero UI dependencies (operates even if HUD is minimized or `.cpj-closed`).

---

## 3. In-DOM Non-Blocking Dark Modal ("Telinha Preta")

### 3.1 Architectural Problem of `window.prompt()`
- `prompt()` halts JavaScript on the main thread.
- Yukon's WebSocket connection drops because ping heartbeats cannot be sent.
- CPJ immediately kicks the client with a connection lost alert.

### 3.2 Replacement Custom Modal Specification
An in-DOM modal rendered directly into the page matching the user's print:
- **Overlay:** Fixed, full viewport, semi-transparent backdrop (`background: rgba(0, 0, 0, 0.65)`), `z-index: 2147483647`.
- **Card Container:**
  - Background: `#1c1b22` / `#23222b` (dark slate).
  - Border: 2px solid `#00e5ff`.
  - Border-radius: 16px.
  - Padding: 18px 22px.
  - Box-shadow: `0 12px 35px rgba(0,0,0,0.85)`.
- **Header:** Globe SVG icon + `play.cpjourney.net` text header (`color: #e2e8f0; font-size: 13px`).
- **Prompt Message:** `Type new like phrase...` or `Edit phrase:` (`color: #ffffff; font-size: 14px; font-weight: 600`).
- **Input Pill:**
  - Background: `#121217`.
  - Border: 2px solid `#00e5ff`.
  - Color: `#ffffff`.
  - Font-size: 13px Fredoka.
  - Border-radius: 10px.
  - Auto-focused with full text selection for instant editing.
- **Buttons:**
  - `OK`: Cyan background (`#00c6ff`), bold dark navy text (`#00284d`), border-radius 10px.
  - `Cancelar`: Dark grey background (`#2b2a33`), white text, border-radius 10px.
- **Keyboard Navigation:**
  - `Enter` -> confirms and resolves.
  - `Escape` -> cancels and resolves `null`.

### 3.3 Asynchronous Promise API
```javascript
function showDarkPrompt(message, defaultValue = '') {
    return new Promise((resolve) => {
        // Creates DOM modal, binds input, resolves on OK/Enter or Cancel/Escape, removes modal
    });
}
```

---

## 4. Cross-Browser Range Slider Engine (Gecko & WebKit)

### 4.1 Root Cause of Firefox Track Disappearance
`cpj_igloo_booster.user.js` declared `.cpj-snow-slider::-moz-range-track { background: transparent !important; }`. In Firefox, when `appearance: none` is active, the track is strictly rendered by `::-moz-range-track`. Transparent background caused complete invisibility.

### 4.2 Unified Robust Slider CSS
```css
/* Base Range Input */
.cpj-snow-slider {
    -webkit-appearance: none !important;
    appearance: none !important;
    width: 100% !important;
    height: calc(12px * var(--cpj-scale, 1)) !important;
    background: transparent !important;
    border: none !important;
    outline: none !important;
    margin: calc(8px * var(--cpj-scale, 1)) 0 !important;
    padding: 0 !important;
    cursor: pointer !important;
}

/* WebKit (Chrome, Edge, Safari) Track & Thumb */
.cpj-snow-slider::-webkit-slider-runnable-track {
    width: 100% !important;
    height: calc(12px * var(--cpj-scale, 1)) !important;
    border-radius: calc(6px * var(--cpj-scale, 1)) !important;
    border: 2px solid #00284d !important;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.4) !important;
    background: #ffffff !important;
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
    margin-top: calc(-6.5px * var(--cpj-scale, 1)) !important;
    cursor: pointer !important;
}

/* Firefox (Gecko) Track & Thumb */
.cpj-snow-slider::-moz-range-track {
    width: 100% !important;
    height: calc(12px * var(--cpj-scale, 1)) !important;
    border-radius: calc(6px * var(--cpj-scale, 1)) !important;
    border: 2px solid #00284d !important;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.4) !important;
    background: #ffffff !important;
}

.cpj-snow-slider::-moz-range-progress {
    height: calc(12px * var(--cpj-scale, 1)) !important;
    border-radius: calc(6px * var(--cpj-scale, 1)) !important;
    background: #ff8800 !important;
}

.cpj-snow-slider::-moz-range-thumb {
    width: calc(22px * var(--cpj-scale, 1)) !important;
    height: calc(22px * var(--cpj-scale, 1)) !important;
    border-radius: 50% !important;
    background: #ffffff !important;
    border: 2.5px solid #00e5ff !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.5) !important;
    cursor: pointer !important;
}
```

---

## 5. Drag Teleport Elimination

1. In `mousedown` on `#cpj-drag`:
   ```javascript
   const rect = modal.getBoundingClientRect();
   startRect = rect;
   modal.style.left = `${rect.left}px`;
   modal.style.top = `${rect.top}px`;
   modal.style.right = 'auto';
   modal.style.bottom = 'auto';
   ```
2. In header and drag containers, prevent default on `dragstart`:
   ```javascript
   document.getElementById('cpj-drag').addEventListener('dragstart', (e) => e.preventDefault());
   ```
3. Use Pointer Events with `setPointerCapture` where supported to prevent lost mouseup events and coordinate corruption.
