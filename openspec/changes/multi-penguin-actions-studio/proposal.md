# Proposal: Multi-Penguin Actions & Phrases Studio Suite

## 1. Motivation & Context
With **IglooLiker 3000** successfully deployed for single-penguin operations, users operating secondary "spectator/monitoring" penguins inside their igloos face two primary hurdles:
1. **Inactivity Disconnects (AFK Kick):** The spectator penguin gets disconnected by the server after several minutes without player input.
2. **State Collision in Multi-Tab Environments:** Running multiple accounts across browser tabs shares a single `localStorage` instance, causing active state toggles (e.g., dancing vs watching) to overwrite each other.
3. **Static Chat Phrases:** Phrases are hardcoded in the script, preventing users from customizing or adding fresh phrases without manual code edits.
4. **Interface Overcrowding & Language Barrier:** Adding features without visual categorization would clutter the compact Club Penguin modal, and international/Brazilian users need seamless switching between **English (USA)** and **Português (Brasil)**.

This change upgrades IglooLiker 3000 into a modular, multi-tab aware automation suite with dedicated action loops, custom phrase management, tabbed category navigation, and bilingual localization.

---

## 2. Scope of the Solution

### 2.1 Multi-Penguin Tab Isolation
- **Per-Tab State (`sessionStorage`):** Execution status (Running/Paused), active actions (`Auto-Dance`, `Auto-Wave`, `Repeat Action`), interval settings, and `Deactivate Phrases` toggle are stored per tab. Tab 1 (broadcaster) can dance and chat while Tab 2 (spectator) waves silently without interference.
- **Shared Phrases Repository (`localStorage`):** Custom phrases created in the Studio remain globally accessible across all tabs.

### 2.2 Action Engine: Auto-Wave, Auto-Dance & Alternation
- **Auto-Wave ('W'):** Dispatches native Yukon/Phaser wave key events (`W` / `KeyW` / keyCode 87) to reset server AFK timers without high CPU usage.
- **Alternating Mode:** When both `Auto-Dance` and `Auto-Wave` are enabled, the action loop alternates between them sequentially (Cycle 1: Dance -> Cycle 2: Wave -> Cycle 3: Dance).
- **Repeat Action Engine:** Triggers the selected action(s) repeatedly at a user-defined interval. Accommodates single-shot special item dances (e.g., ghost roar transformation).

### 2.3 Snow-To-Orange Action Interval Slider
- **Range:** 5 seconds to 10 seconds (`5s - 10s`).
- **Club Penguin Aesthetic:** White snow track with deep border. Dragging the slider thumb fills the traversed path with vibrant Club Penguin orange (`#ff8800` / `#ffaa00`).
- **Live Counter:** Reactive pill displaying the selected interval in real-time (e.g., `Action Interval: [ 7s ]`).

### 2.4 Chat Deactivation ("Deactivate Phrases")
- A dedicated checkbox that completely bypasses the chat pipeline (`sendChat`). The bot performs likes monitoring and action loops (wave/dance) without focusing inputs, copying to clipboard, or clicking HUD buttons.

### 2.5 Phrases Studio (CRUD System)
- **Capacity:** Up to 6 custom phrases (`max 6`).
- **Operations:**
  - **Create:** Input field with `+ ADD PHRASE` button (auto-disabled when 6 phrases are reached).
  - **Read:** Numbered list with phrase previews and slot indicators (`[1/6]` to `[6/6]`).
  - **Update:** Inline editing pill allowing modification of existing phrases.
  - **Delete:** Remove unwanted phrases with instant UI feedback and re-indexing.
- **Pre-populated Defaults:** Initialized with the 4 proven "one k" milestone phrases.

### 2.6 Category-Based Tab Navigation
To preserve the pixel-perfect Club Penguin modal dimensions, controls are organized into three tabs:
1. **Phrases Tab:** `Rotate Like Phrases`, `Random Anti-Spam (9s to 11s)`, and `Deactivate Phrases`.
2. **Actions Tab:** `Auto-Dance ('D')`, `Auto-Wave ('W')`, `Repeat Action`, and the Snow/Orange Interval Slider.
3. **Studio Tab:** Full CRUD interface for custom phrases.

### 2.7 Language Selector Dropdown (i18n)
- **Placement:** Located directly above the igloo progression card.
- **Options:** `English (USA)` and `Português (Brasil)`.
- **Behavior:** Interactive dropdown list displaying language options on click, instantly updating all interface labels, tabs, and buttons.

---

## 3. Non-Goals (Out of Scope)
- **Zero Chat Engine Modifications:** The established chat pipeline (`pageWin.KeyboardEvent`, `execCommand('insertText')`, canvas pointer click at `1026, 923`) must remain untouched to prevent regressions.
- **No Automatic Remote Git Push:** All changes remain local until explicit user authorization.
- **Zero Emojis:** Pure SVG vector iconography and Club Penguin palette throughout all screens.
