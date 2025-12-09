# NexyTab

NexyTab is a minimal, fast browser extension designed to help you manage and monitor tabs. It allows you to switch with ease, reload tabs instantly, or start a persistent, configurable tab rotation that runs in the background.

## Features

- **Navigate Tabs**: Go to the previous or next tab with a single click.
- **Auto-Rotation**: Start or stop a rotation that is configurable from 1 second to 30 seconds. The timer persists even after closing the popup.
- **Tab Sleeping (New)**: Toggle "Sleep Mode" (Moon icon) to automatically discard the previous tab during rotation, significantly reducing RAM usage.
- **Random Tab (New)**: Jump to a random tab with the shuffle button.
- **Reload Options**: Instantly reload All Tabs (staggered to prevent freezing) or just the Current Tab.
- **Modern UI**: A clean, dark-themed popup with media player-style controls and a terminal-style timer display.
- **Lightweight**: Built using modern WebExtension APIs and minimal permissions.

## Tip
Pin NexyTab to your browser toolbar for easy access.

## Installation

### Firefox

1. Clone this repo or download the latest release.
2. Open `about:debugging` in the address bar.
3. Click "This Firefox" (or "This Nightly").
4. Click "Load Temporary Add-on".
5. Locate and select the `manifest.json` file from the project folder.

You can also install the original version from the Firefox Add-ons store:
[https://addons.mozilla.org/en-US/firefox/addon/nexyTab/](https://addons.mozilla.org/en-US/firefox/addon/nexyTab/)

## Usage

1. Click the NexyTab icon in your toolbar.
2. **Set the Time**: Use the `[- 1s +]` stepper control to set the rotation interval between 1 and 30 seconds.
3. **Tab Sleeping**: Toggle the Moon icon to enable/disable automatic tab discarding (saves memory).

### Controls

- **Play (▶️)**: Start the persistent rotation.
- **Pause (⏸)**: Stop the rotation.
- **Previous/Next (⏮/⏭)**: Manually navigate tabs (stops rotation).
- **Shuffle (🔀)**: Jump to a random tab.
- **Reload All (🔁)**: Reload every tab in the window.
- **Reload Current (🔄)**: Reload only the active tab.

No configuration required.

## Folder Structure

```

NexyTab/
├── icons/             # All icon sizes (16x16 to 512x512)
├── popup.html         # Extension popup interface
├── popup.css          # Styles for the popup interface
├── popup.js           # UI logic, state loading, and message sending
├── background.js      # PERSISTENT: Manages the chrome.alarms timer and rotation
└── manifest.json      # Metadata, permissions (tabs, storage, alarms)

```

## Permissions

NexyTab requests only the following permissions:

- **tabs**: To switch between and reload tabs.
- **storage**: To save user preferences (time setting, sleep mode).
- **alarms**: Required to run the persistent timer in the background.

No tracking. No data collection.

## License

This project is licensed under the terms of the MIT License. See the LICENSE file for details.