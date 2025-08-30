# NexyTab

NexyTab is a minimal, fast browser extension designed to help you manage tabs more efficiently. Whether you're monitoring dashboards, logs or real-time data across multiple tabs, NexyTab lets you stay focused and switch with ease.

---

## Features

- Navigate to the previous or next tab with a single click  
- Instantly refresh the current tab or all tabs
- Lightweight popup with a clean and responsive interface  
- Built using modern WebExtension APIs  
- Recommended for users who monitor content across multiple tabs

Tip: Pin NexyTab to your browser toolbar for easy access.

---

## Installation

### Chrome or Edge

1. Download the latest release or clone this repository  
2. Go to `chrome://extensions/` and enable Developer Mode  
3. Click Load unpacked and select the extension folder

### Firefox

1. Open `about:debugging` in the address bar  
2. Click "This Firefox" (or "This Nightly")  
3. Click "Load Temporary Add-on"  
4. Locate and select the `manifest.json` file from the project folder

You can also install NexyTab directly from the Firefox Add-ons store:  
[https://addons.mozilla.org/en-US/firefox/addon/nexytab/](https://addons.mozilla.org/en-US/firefox/addon/nexytab/)

---

## Usage

1. Click the NexyTab icon in your toolbar  
2. Use the left and right arrow buttons to navigate between tabs  
3. Click the refresh button to reload the current tab
4. Click the RELOAD ALL TABS button to reload all the tabs

No configuration required.

---

## Folder Structure

```
NexyTab/
├── icons/             # All icon sizes (16x16 to 512x512)
├── popup.html         # Extension popup interface
├── popup.css         # Styles for the popup interface
├── popup.js           # Logic for tab switching and refreshing
└── manifest.json      # Metadata and permissions
```

---

## Permissions

NexyTab requests only the `tabs` permission to read tab information and change active tabs.

No tracking. No data collection.

---

## License

This project is licensed under the terms of the MIT License. See the [LICENSE](LICENSE) file for details.

---


