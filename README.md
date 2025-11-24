# NexyTab-Firefox

NexyTab is a minimal, fast browser extension designed to help you manage and monitor tabs. It allows you to switch with ease, or start a **persistent, configurable tab rotation** that runs in the background.

---

## Features

* **Navigate Tabs:** Go to the previous or next tab with a single click.
* **Auto-Rotation:** Start or stop a rotation that is configurable from **1 second to 30 seconds**. The timer persists even after closing the popup.
* **Smarter Control:** Rotation **automatically stops** if you click any other button (Next, Previous, Reload, or change the time).
* **Reload Tabs:** Instantly refresh all tabs in the window.
* **Modern UI:** A clean, dark-themed popup with media player-style controls and a **terminal-style** timer display.
* **Lightweight:** Built with modern WebExtension APIs and minimal permissions.

Tip: Pin NexyTab to your browser toolbar for easy access.

---

## Installation

### Firefox

1.  Clone this repo.
2.  Open `about:debugging` in the address bar.
3.  Click "This Firefox" (or "This Nightly").
4.  Click "Load Temporary Add-on".
5.  Locate and select the `manifest.json` file from the project folder.

You can also install the original version from the Firefox Add-ons store:
[https://addons.mozilla.org/en-US/firefox/addon/nexyTab/](https://addons.mozilla.org/en-US/firefox/addon/nexyTab/)

---

## Usage

1.  Click the NexyTab icon in your toolbar.
2.  **Set the Time:** Use the **[- 1s +]** stepper control to set the rotation interval between 1 and 30 seconds.
3.  Click the **Play** (▶️) button to start the rotation. It will now run persistently in the background.
4.  Click the **Pause** (⏸) button or any navigation button to stop the rotation.
5.  Click the **Repeat** (🔁) button to reload all tabs.

No configuration required.

---

## Folder Structure

```

NexyTab/
├── icons/             \# All icon sizes (16x16 to 512x512)
├── popup.html         \# Extension popup interface
├── popup.css          \# Styles for the popup interface
├── popup.js           \# UI logic, state loading, and message sending
├── background.js      \# PERSISTENT: Manages the chrome.alarms timer and rotation
└── manifest.json      \# Metadata, permissions (tabs, storage, alarms)

```

---

## Permissions

NexyTab requests only the `tabs`, `storage`, and `alarms` permissions.
* `tabs`: To switch between and reload tabs.
* `storage`: To save the user's preferred rotation time (1-30s).
* `alarms`: Required to run the persistent timer in the background.

No tracking. No data collection.

---

## License


This project is licensed under the terms of the MIT License. See the [LICENSE](LICENSE) file for details.




