# NexyTab

**NexyTab** is a minimal, fast browser extension designed to help you manage and monitor tabs. It lets you switch tabs effortlessly, reload them instantly, or run a persistent, configurable tab rotation that continues in the background.

---

## Features

- **Navigate Tabs**  
  Move to the previous or next tab with a single click.

- **Auto-Rotation**  
  Start or stop a persistent tab rotation configurable from **5 to 30 seconds**.  
  The timer continues running even after the popup is closed.

- **Tab Sleeping (🌙)**  
  Enable *Sleep Mode* (Moon icon) to automatically discard the previous tab during rotation, significantly reducing RAM usage.

- **Random Tab (🔀)**  
  Jump to a random tab using the shuffle button.

- **Reload Options**  
  - **Reload All Tabs (🔁)** — Reload all tabs (staggered to prevent browser freezing)  
  - **Reload Current Tab (🔂)** — Reload only the active tab

- **Modern UI**  
  Clean, dark-themed popup with media player–style controls and a terminal-style timer display.

- **Lightweight**  
  Built using modern WebExtension APIs with minimal permissions.

**Tip:** Pin NexyTab to your browser toolbar for quick access.

---

## Installation (Firefox)

### Temporary Installation (Development)

1. Clone this repository or download the latest release.
2. Open `about:debugging` in the Firefox address bar.
3. Click **This Firefox** (or **This Nightly**).
4. Click **Load Temporary Add-on**.
5. Select the `manifest.json` file from the project folder.

### Firefox Add-ons Store

You can also install the published version from the Firefox Add-ons store:  
https://addons.mozilla.org/en-US/firefox/addon/nexyTab/

---

## Usage

1. Click the **NexyTab** icon in your browser toolbar.
2. **Set the Time**  
   Use the `[- 1s +]` stepper to choose a rotation interval between **5 and 30 seconds**.
3. **Tab Sleeping**  
   Toggle the Moon icon (🌙) to enable or disable automatic tab discarding to save memory.

### Controls

- **Play (▶)** — Start persistent rotation  
- **Pause (⏸)** — Stop rotation  
- **Previous / Next (⏮ / ⏭)** — Manually navigate tabs (pauses rotation)  
- **Tab Sleeping (🌙)** — Toggle sleep mode  
- **Shuffle (🔀)** — Jump to a random tab  
- **Reload All (🔁)** — Reload all tabs in the current window  
- **Reload Current (🔂)** — Reload only the active tab  

No additional configuration is required.

---

## Folder Structure

```text
NexyTab/
├── icons/             # All icon sizes (16x16 to 512x512)
├── popup.html         # Extension popup interface
├── popup.css          # Styles for the popup interface
├── popup.js           # UI logic, state loading, and message sending
├── background.js      # Persistent background script (alarms + rotation)
└── manifest.json      # Metadata and permissions
````

---

## Permissions

NexyTab requests only the following permissions:

* **tabs** — Required to switch between and reload tabs
* **storage** — Used to save user preferences (timer setting, sleep mode)
* **alarms** — Enables the persistent background timer

No tracking.
No data collection.

---

## License

This project is licensed under the **MIT License**.
See the `LICENSE` file for details.