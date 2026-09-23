# Implementation Tasks: Per-Penguin Profiles, Auto-Pause Safety & Cross-Browser Stability

## 1. Per-Penguin Storage & State Segregation
- [x] 1.1 Preserve global shared storage (`cpj_shared_data_v3`) strictly for custom phrases (`phrases`) and language preference (`lang`).
- [x] 1.2 Implement per-penguin profile schema (`cpj_penguin_{username}`) in `localStorage` storing `likes`, `goal`, `autoDance`, `autoWave`, `repeatAction`, `actionInterval`, `deactivatePhrases`, `rotatePhrases`, and `randomInterval`.
- [x] 1.3 Add reactive `loadPenguin(username)` and `savePenguin()` methods to load profile data seamlessly when a penguin is selected.

## 2. Injected Bridge Detection (Penguin, Room & Map)
- [x] 2.1 Enhance `__CPJ_YUKON_BRIDGE__` to detect authenticated penguin username (`client.penguin.username`) and post `CPJ_PENGUIN_IDENTIFIED`.
- [x] 2.2 Implement room transition monitor comparing `world.room.id` / `roomKey` and hook network packets to post `CPJ_ROOM_CHANGED`.
- [x] 2.3 Implement map open detector (monitoring `'Map'` scene active state, interface map visibility, and 'M' hotkey) to post `CPJ_MAP_OPENED`.

## 3. Auto-Pause Safety Engine
- [x] 3.1 Listen for `CPJ_ROOM_CHANGED` and `CPJ_MAP_OPENED` messages in the userscript.
- [x] 3.2 When running, trigger clean pause routine: clear `botTimer`, call `stopActionLoop()`, set `state.running = false`, and refresh HUD toggle button to "START BOT".
- [x] 3.3 Ensure auto-pause operates identically whether the HUD card is expanded, minimized, or closed (`.cpj-closed`).

## 4. In-DOM Non-Blocking Dark Modal ("Telinha Preta")
- [x] 4.1 Build asynchronous `showDarkPrompt(message, defaultValue)` returning a Promise to replace synchronous `window.prompt()`.
- [x] 4.2 Construct DOM modal markup matching screenshot aesthetic: `#1c1b22` card background, `play.cpjourney.net` title, cyan input outline, OK and Cancelar buttons with Enter/Escape hotkeys.
- [x] 4.3 Replace all `prompt()` calls in Phrases Studio (`+ ADD` fallback and inline edit) with `await showDarkPrompt(...)`.
- [x] 4.4 Verify WebSocket heartbeats remain active during phrase input, eliminating CPJ game disconnects.

## 5. Cross-Browser Range Slider Fix (Gecko & WebKit)
- [x] 5.1 Refactor `.cpj-snow-slider` CSS with explicit, separate rules for Firefox (`::-moz-range-track`, `::-moz-range-progress`, `::-moz-range-thumb`) and WebKit (`::-webkit-slider-runnable-track`, `::-webkit-slider-thumb`).
- [x] 5.2 Eliminate `background: transparent !important` on Firefox track that caused the slider bar to disappear.
- [x] 5.3 Ensure track, fill, and thumb render visibly and consistently before and after login in Firefox, Chrome, and Edge.

## 6. Drag Teleport Elimination
- [x] 6.1 Initialize `modal.style.left` and `modal.style.top` synchronously from `getBoundingClientRect()` prior to unsetting `right`/`bottom`.
- [x] 6.2 Prevent native HTML5 `dragstart` on header text, titles, and SVG icons.
- [x] 6.3 Integrate Pointer Capture (`setPointerCapture`) for seamless, jitter-free card repositioning.

## 7. Non-Regression Safeguards & Verification
- [x] 7.1 Verify Dance ('D') and Wave ('W') work properly in both single-shot and repeat loop modes.
- [x] 7.2 Verify Yukon chat dispatch pipeline (`sendChat`, clipboard paste fallback, canvas click) is completely unaltered.
- [x] 7.3 Verify bilingual localization (`en` and `pt`) and Studio phrases CRUD operations remain fully functional.
- [x] 7.4 Test full flow in local `preview.html` and validate all changes in `cpj_igloo_booster.user.js`.

## 8. Critical Bugfix Sprint (4 Persistent Bugs Resolved)
- [x] 8.1 Bug 1: Range slider fixed height (`14px !important;`) on `::-moz-range-track` & `::-webkit-slider-runnable-track` preventing Firefox Gecko 0px collapse inside game.
- [x] 8.2 Bug 2: Direct room ID and interface map polling (`pageWin.game`/`pageWin.yukon`) + canvas bottom-left map HUD pointerdown hook triggering `pauseBotAuto()` to switch button to 'START BOT' across expanded, minimized, and closed states.
- [x] 8.3 Bug 3: Per-penguin permanent `localStorage` (`cpj_penguin_{username}`) initialized clean for new penguins, loading exact user values without game likes auto-overwrite.
- [x] 8.4 Bug 4: Total keyboard sovereignty with capture-phase `stopPropagation()` and `stopImmediatePropagation()` on `keydown`, `keyup`, and `keypress` in `#cpj-modal`, inputs, and `.cpj-dark-prompt-overlay`.

## 9. Slider Continuous Drag & Studio Inline Phrase Creation
- [x] 9.1 Action Interval Slider: Implement smooth continuous pointer drag tracking on window, with thumb sticking smoothly to the cursor and snapping cleanly to discrete seconds on release.
- [x] 9.2 Phrases Studio: Use inline `#cpj-studio-inp` field directly for phrase creation (+ ADD), keeping the dark prompt modal strictly for editing existing phrases.
- [x] 9.3 Maintain strict card sovereignty: Isolate `#cpj-studio-inp` keyboard events so typing in-card never leaks to game hotkeys.

## 10. Phrases Studio 10s Feedback Banners (Errors & Thumbs-Up Success)
- [x] 10.1 Add Studio message container `#cpj-studio-msg` directly above the `#cpj-studio-input-wrap` with rich aesthetic CSS (error red & grass-green success with circular green badge and white thumbs-up).
- [x] 10.2 Add bilingual strings to `I18N` for maximum limit error, empty input error, and phrase added success.
- [x] 10.3 Implement `showStudioMessage(text, type = 'error' | 'success')` with auto-dismiss after 10 seconds.
- [x] 10.4 Wire up empty input check, max 6 limit check, and successful phrase addition to trigger the feedback banner in both `cpj_igloo_booster.user.js` and `ui/components.js`.

## 11. Authentic Organic Snowball Thumb & Proportional Interval Slider
- [x] 11.1 Remove blue bezel container and render pure 3D snowball directly on the interval track.
- [x] 11.2 Introduce organic asymmetrical contour with vector micro-bumps (Option 5), breaking geometric perfection into an authentic hand-packed snowball.
- [x] 11.3 Enlarge slider track height to 16px and snowball thumb to 28px with enhanced 2.6px dark-blue outline and deeper bottom shadow.

## 12. Animated Igloo Icon Integration (Silver Weather Vane & State Switcher)
- [x] 12.1 Embed the official Option 1 Animated Igloo SVG in `ICONS.igloo` with silver rooster weather vane, wind gusts, stovepipe chimney, and dual online/offline state layers.
- [x] 12.2 Add keyframe animations and utility classes (`cpj-anim-*`) to userscript CSS and `ui/styles.css`.
- [x] 12.3 Enlarge floating launcher button `#cpj-launcher` from 52px to 62px and inner SVG from 28px to 44px, keeping circular blue gradient background and cyan border.
- [x] 12.4 Wire up reactive `.is-running` class toggling on `#cpj-launcher` and `#cpj-modal` in `updateUI()`.
- [x] 12.5 Update `ui/icons.js` and verify clean execution with zero linter errors or regressions.

## 13. Floating Launcher Drag-and-Drop & Per-Penguin Ephemeral Position Memory
- [x] 13.1 Enlarge floating launcher bubble from 62px to 72px and inner SVG from 44px to 52px in CSS (`ui/styles.css` & `cpj_igloo_booster.user.js`), keeping circular blue gradient background and cyan border.
- [x] 13.2 Implement pointer-based dragging on the floating launcher with viewport boundary clamping and clean click-vs-drag distinction (> 5px movement suppresses modal toggle).
- [x] 13.3 Implement ephemeral per-penguin position memory using `sessionStorage` (`cpj_launcher_pos_${penguin}`), ensuring positions reset back to original default corner upon tab/browser closure and restore when switching penguins.
- [x] 13.4 Synchronize logic across `ui/components.js` and `cpj_igloo_booster.user.js`, ensuring modular line limits are preserved (`ui/components.js` < 250 lines).
- [x] 13.5 Verify in preview environment via interactive browser subagent.

## 15. Pointer/Grab Cursors & Classic Igloo Icon in Likes Progression
- [x] 15.1 Change floating launcher hover cursor to `pointer` (hand with pointing finger) and drag cursor to `grab` (open hand, replacing 4-way arrows) across `ui/styles.css` and `cpj_igloo_booster.user.js`.
- [x] 15.2 Restore classic smooth igloo SVG (`iglooClassic`) without snow brick lines in `ui/icons.js`, `cpj_igloo_booster.user.js`, and `ui/components.js`.
- [x] 15.3 Apply `display: inline-flex; align-items: center; gap: 6px;` to `#cpj-prog-title` and `#cpj-lbl-prog` to center the classic igloo vertically with the "Igloo Likes Progression" text.
- [x] 15.4 Maintain `< 250` lines in `ui/components.js` (248 lines) and verify visually in browser.



