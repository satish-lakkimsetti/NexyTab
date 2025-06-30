# NexyTab

**NexyTab** is a lightweight Firefox extension designed to streamline tab navigation. With a single click on the toolbar icon, it cycles to the next open tab in the current browser window.

## Features

- Instantly switches to the next tab when the extension icon is clicked  
- Helps prevent accidental tab closures caused by manual tab switching  
- Recommended to pin the extension icon to the toolbar for easy access  
- Especially useful for users who repeatedly monitor content across multiple tabs

## Installation

1. Download or clone this repository.
2. Open Firefox and navigate to `about:debugging`.
3. Click on **This Firefox**.
4. Click **Load Temporary Add-on** and select the `manifest.json` file.

Here’s **Part 3: Folder Structure and Usage**

## Folder Structure

```
NexyTab/
├── manifest.json
├── background.js
```

## Usage

Once loaded and pinned, simply click the NexyTab icon in your toolbar to move to the next tab in your window.

## Development Notes

- Built using the WebExtensions API  
- Designed for modern Firefox versions  
- No user data is stored or collected  

## License

This project is licensed under the [MIT License](LICENSE).
