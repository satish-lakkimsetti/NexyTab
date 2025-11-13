# NexyTab

NexyTab is a minimal, fast browser extension designed to help you manage and monitor tabs. Whether you're monitoring dashboards, logs, or real-time data, NexyTab lets you switch with ease or put your tabs on an automatic rotation.

---

## Features

* **Navigate Tabs:** Go to the previous or next tab with a single click.
* **Auto-Rotation:** Start or stop an automatic 10-second rotation through all your tabs.
* **Reload Tabs:** Instantly refresh all tabs in the window.
* **Modern UI:** A clean, dark-themed popup with media player-style controls.
* **Lightweight:** Built with modern WebExtension APIs and minimal permissions.

Tip: Pin NexyTab to your browser toolbar for easy access.

---

## Installation

### Chrome or Edge

1.  Download the latest release or clone this repository.
2.  Go to `chrome://extensions/` and enable Developer Mode.
3.  Click "Load unpacked" and select the extension folder.

### Firefox

1.  Open `about:debugging` in the address bar.
2.  Click "This Firefox" (or "This Nightly").
3.  Click "Load Temporary Add-on".
4.  Locate and select the `manifest.json` file from the project folder.

You can also install the original version from the Firefox Add-ons store:
[https://addons.mozilla.org/en-US/firefox/addon/nexyTab/](https://addons.mozilla.org/en-US/firefox/addon/nexyTab/)

---

## Usage

1.  Click the NexyTab icon in your toolbar.
2.  Use the **Previous** (⏮) and **Next** (⏭) buttons to navigate between tabs.
3.  Click the **Repeat** (🔁) button to reload all tabs.
4.  Click the **Play** (▶️) button to start rotating through your tabs every 10 seconds.
5.  Click the **Pause** (⏸) button to stop the rotation.

No configuration required.

---

## Folder Structure

```
NexyTab/
├── icons/             \# All icon sizes (16x16 to 512x512)
├── popup.html         \# Extension popup interface
├── popup.css          \# Styles for the popup interface
├── popup.js           \# Logic for tab control and rotation
└── manifest.json      \# Metadata and permissions

```

---

## Permissions

NexyTab requests only the `tabs` permission to manage and interact with your tabs.

No tracking. No data collection.

---

## License

This project is licensed under the terms of the MIT License. See the [LICENSE](LICENSE) file for details.