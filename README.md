<div align="center">

# IGLOOLIKER 3000
### Universal AFK Igloo Likes Booster for Club Penguin Journey

[![Version](https://img.shields.io/badge/Version-3.0.0-00e5ff?style=for-the-badge&logoColor=white)](https://play.cpjourney.net)
[![Platform](https://img.shields.io/badge/Platform-CPJ%20(Yukon%20HTML5)-0072ff?style=for-the-badge&logoColor=white)](https://play.cpjourney.net)
[![Author](https://img.shields.io/badge/Author-CAIOVSKI-00e5ff?style=for-the-badge&logo=github&logoColor=white)](https://github.com/caiovski)
[![License: MIT](https://img.shields.io/badge/License-MIT-0072ff?style=for-the-badge&logoColor=white)](./LICENSE)
[![Compatibility](https://img.shields.io/badge/Browser-Firefox%20%7C%20Chrome%20%7C%20Edge-00284d?style=for-the-badge&logoColor=white)](https://www.tampermonkey.net/)
[![Safety](https://img.shields.io/badge/Risk-Zero%20Disconnect-00a86b?style=for-the-badge&logoColor=white)](https://play.cpjourney.net)

<br />

<p align="center">
  <b>An authentic, non-intrusive automation tool crafted specifically for Club Penguin Journey.</b><br />
  Boost your igloo likes safely in background tabs while freely using your computer for study, gaming, or work.
</p>

</div>

---

## Overview

**IglooLiker 3000** is an automated assistant designed to help players reach their igloo like targets without risking server disconnection or locking the operating system's mouse and keyboard. Built with a pixel-perfect Club Penguin user interface, it combines native Yukon client simulation, intelligent clipboard pasting, and randomized anti-spam intervals.

---

## Core Capabilities

<table>
  <tr>
    <td width="50%">
      <h4>Safe Chat Automation</h4>
      <ul>
        <li><b>Zero Network Injection:</b> Avoids raw WebSocket packet tampering (<code>net.send</code>) to eliminate kick/disconnect risks.</li>
        <li><b>Native Input Simulation:</b> Focuses the game chat input, clears previous values, and pastes text via <code>document.execCommand('insertText')</code>.</li>
        <li><b>Dual Send Trigger:</b> Dispatches native Enter events (<code>keyCode 13</code>) alongside canvas pointer clicks on the HUD send button (<code>x=1026, y=923</code>).</li>
      </ul>
    </td>
    <td width="50%">
      <h4>Dynamic Goal & Likes Tracking</h4>
      <ul>
        <li><b>Automatic Likes Detection:</b> Automatically tracks penguin igloo likes directly from the client world state.</li>
        <li><b>Custom Target Goal:</b> Editable goal field with real-time reactive progress updates.</li>
        <li><b>Strict Percentage Format:</b> Displays progress formatted strictly to two decimal places (<code>00.00%</code>).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h4>Universal & Background Operation</h4>
      <ul>
        <li><b>All Rooms Supported:</b> Universal operation across any room in Club Penguin Journey without room restrictions.</li>
        <li><b>Background Keepalive:</b> Employs Web Worker timers and synthetic event loops to continue execution in minimized or background tabs.</li>
        <li><b>Auto-Dance (D):</b> Automatically triggers the dance command once upon activation.</li>
      </ul>
    </td>
    <td width="50%">
      <h4>Club Penguin Authentic UI</h4>
      <ul>
        <li><b>Zero Emojis:</b> Pure SVG vector iconography matching authentic Club Penguin sprites and assets.</li>
        <li><b>Free 2D Dragging:</b> Drag the modal anywhere across the viewport via mouse drag.</li>
        <li><b>Floating Launcher & Shortcut:</b> Floating snow-white igloo button with <code>F9</code> hotkey toggle.</li>
      </ul>
    </td>
  </tr>
</table>

---

## Rotating Anti-Spam Phrases

To comply with the Club Penguin Journey chat filter and prevent automatic muting, the bot rotates through four dedicated phrases that state the 1,000 likes milestone using words (**"one k"**) instead of numeric digits:

1. `"Igloo liking party! Help me reach one k! Thanks for your support"`
2. `"Drop a like at my igloo to help me reach one k! Much appreciated!"`
3. `"Working on my one k igloo likes goal! Any like helps a lot!"`
4. `"Please visit my igloo and leave a like for one k! Thank you so much!"`

> **Note on Anti-Spam Timing:** The delay between messages dynamically jitters between **9 and 11 seconds** (`9000ms - 11000ms`), providing optimal safety against flood filters.

---

## Installation Guide

### Option 1: Tampermonkey / Violentmonkey (Recommended)

1. Install the [Tampermonkey Extension](https://www.tampermonkey.net/) in your web browser (Firefox, Chrome, Brave, or Edge).
2. Open the Tampermonkey Dashboard and click **Create a new script** (`+`).
3. Copy the entire contents of [`cpj_igloo_booster.user.js`](./cpj_igloo_booster.user.js).
4. Paste into the Tampermonkey script editor and save (`Ctrl + S`).
5. Navigate to [play.cpjourney.net](https://play.cpjourney.net) and log into your penguin.
6. The circular igloo launcher icon will appear in the top-right corner of the screen. Click it or press **`F9`** to open the control panel.

### Option 2: Browser Developer Console (Quick Test)

1. Open [play.cpjourney.net](https://play.cpjourney.net) in your browser and log in.
2. Press `F12` (or `Ctrl + Shift + I`) to open Developer Tools and navigate to the **Console** tab.
3. Paste the contents of [`cpj_igloo_booster.user.js`](./cpj_igloo_booster.user.js) into the console and press `Enter`.

---

## User Guide

```
+-------------------------------------------------------------------------+
| [HUD]                      IGLOOLIKER 3000                      [-] [X] |
+-------------------------------------------------------------------------+
| Status: Active & Dancing                                                |
|                                                                         |
| Progress: 00.00%                                                        |
| Likes: [ 000 ] / Goal: [ 1000 ]                                         |
| [======================== progress bar ===============================] |
|                                                                         |
| [X] Auto-Dance ('D')                                                    |
| [X] Rotate 4 Like Phrases                                                |
| [X] Random Anti-Spam (9s to 11s)                                        |
|                                                                         |
| Next Message: "Igloo liking party! Help me reach one k!..."             |
|                                                                         |
| +---------------------------------------------------------------------+ |
| |                            START BOT                                | |
| +---------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
```

1. **Setting Your Goal:**
   - Click the **Goal** input pill to enter your desired target (e.g., `1000`, `1500`, `2000`).
   - The current likes count will automatically sync from your account. You can also manually adjust the count if needed.
2. **Configuring Options:**
   - **Auto-Dance ('D'):** Automatically executes the dance keypress once when the bot starts.
   - **Rotate 4 Like Phrases:** Cycles through the 4 pre-configured anti-spam phrases.
   - **Random Anti-Spam (9s to 11s):** Adds randomized timing jitter to prevent server spam detection.
3. **Activating the Bot:**
   - Click the single full-width button **START BOT** (vibrant blue).
   - The button switches to **PAUSE BOT** (warm red) and the status indicator turns green.
   - You can minimize the window with `[-]` or hide it with `[X]`. The bot continues running in the background until paused.
4. **Moving the Interface:**
   - Click and drag the header bar to reposition the panel anywhere on your screen.

---

## Interactive Local Preview

You can test the entire user interface and logic locally without opening the game:

1. Open [`preview.html`](./preview.html) in any modern web browser.
2. The simulation environment loads the Welcome Room background and a simulated game chat log.
3. Click **START BOT** to inspect the simulated dance action and chat log output in real time.
4. Adjust goal values to verify progress bar transitions and percentage formatting.

---

## Repository Structure

```
iglooliker-3000/
|-- cpj_igloo_booster.user.js   # Complete standalone userscript
|-- preview.html                # Interactive local simulation preview
|-- README.md                   # Project documentation
|-- assets/                     # Design mockups, UI reference sprites, and backgrounds
|-- core/                       # Modular business logic (< 250 lines)
|   |-- engine.js               # Background timer, chat dispatch, and dance engine
|   `-- state.js                # Reactive state container, validation, and storage
|-- ui/                         # Modular user interface components (< 250 lines)
|   |-- components.js           # Modal DOM construction, event handlers, and dragging
|   |-- icons.js                # SVG vector icons (pure vectors, zero emojis)
|   `-- styles.css              # Club Penguin authentic styles and animations
`-- openspec/                   # Technical architecture proposals, specs, and tasks
    `-- changes/
        `-- cpj-afk-igloo-booster/
            |-- design.md       # Technical design specification
            |-- proposal.md     # Architecture proposal
            `-- tasks.md        # Comprehensive task breakdown
```

---

## Update History (Sprint Log)

### Release 3.0.0 (NEW) - 20/09/2026
- **Chat Duplication Bugfix:** Selected single active input element and eliminated redundant `insertFromPaste` input event dispatching, ensuring single-instance text entry.
- **HUD Send Button Click Simulation:** Implemented proportional canvas pointer event dispatching targeting the exact coordinates of `chat_send_button` (`x=1026, y=923` in 1520x960 resolution).
- **Native Page Keyboard Events:** Utilized `pageWin.KeyboardEvent` to bypass Firefox Gecko XrayWrapper property masking on synthetic keydown events.
- **One K Target Terminology:** Updated rotating phrase catalog to explicitly state the 1k goal written in words (`one k`) to prevent chat filter suppression.
- **Anti-Spam Delay Window:** Increased randomized anti-spam jitter window from 7-9s to 9-11s for elevated server safety.
- **Universal Room Support:** Removed Welcome Room confinement, allowing the bot to operate in any public or private room.
- **Single Action Button:** Implemented unified 100% full-width toggle button switching between Start (Blue) and Pause (Red).

### Release 2.0.0 - 20/09/2026
- **Zero Disconnect Architecture:** Completely removed direct WebSocket packet transmission (`net.send`) in favor of Yukon DOM input injection.
- **Pure Vector Iconography:** Replaced all emoji indicators with custom SVG paths styled after Club Penguin's original interface.
- **Dynamic Account Likes Sync:** Replaced hardcoded initial like counts with automatic client state detection.
- **Free 2D Viewport Dragging:** Added unconstrained drag-and-drop movement across both X and Y axes.
- **Opsx-Build Modular Refactoring:** Split codebase into modular files (`core/engine.js`, `core/state.js`, `ui/components.js`, `ui/icons.js`, `ui/styles.css`), each strictly under 250 lines.

---

## License & Copyright

Copyright (c) 2026 **CAIOVSKI**. All rights reserved.

This project is licensed under the **MIT License**. See the [`LICENSE`](./LICENSE) file for the full license terms and conditions.

### Disclaimer
Developed for educational and personal automation purposes. Club Penguin Journey is a community recreation project; this tool is unaffiliated with Disney, Disney Interactive, or CPJ staff.

<br />

<div align="center">
  <a href="https://github.com/caiovski">
    <img src="https://img.shields.io/badge/CAIOVSKI-GitHub%20Profile-00284d?style=for-the-badge&logo=github&logoColor=00e5ff" alt="CAIOVSKI GitHub" />
  </a>
  <br />
  <sub><b>IGLOOLIKER 3000</b> &bull; Built with precision by <b>CAIOVSKI</b></sub>
</div>

