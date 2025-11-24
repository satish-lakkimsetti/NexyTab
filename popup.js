// --- Get DOM Elements ---
const playPauseBtn = document.getElementById('play-pause');
const reloadBtn = document.getElementById('reload');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const timeDisplay = document.getElementById('time-display');
const timeDecreaseBtn = document.getElementById('time-decrease');
const timeIncreaseBtn = document.getElementById('time-increase');

// --- State Variables ---
let currentRotationTime = 1;
let isPlaying = false; 

// --- Reusable Functions ---

// OPTIMIZED: Now offloads the heavy lifting to background.js
function reloadAllTabs() {
  chrome.runtime.sendMessage({ action: "reloadAllTabs" });
}

// Switches to the previous tab
function goToPreviousTab() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const index = tabs.findIndex(tab => tab.active);
    const prevIndex = (index - 1 + tabs.length) % tabs.length;
    chrome.tabs.update(tabs[prevIndex].id, { active: true });
  });
}

// Switches to the next tab
function goToNextTab() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    if (tabs.length <= 1) {
      return;
    }
    const index = tabs.findIndex(tab => tab.active);
    const nextIndex = (index + 1) % tabs.length;
    chrome.tabs.update(tabs[nextIndex].id, { active: true });
  });
}

// --- UI Update Functions ---

// Updates the "1s" text and the play button's tooltip
function updateDisplay(seconds) {
  timeDisplay.textContent = `${seconds}s`;
  if (!isPlaying) {
    playPauseBtn.title = `Start rotating tabs (${seconds}s)`;
  }
}

// Toggles the Play/Pause icon and title
function updateButtonUI(isPlayingState) {
  isPlaying = isPlayingState;
  if (isPlaying) {
    playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    playPauseBtn.title = "Stop rotating tabs";
  } else {
    playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    updateDisplay(currentRotationTime);
  }
}

// --- Function to stop rotation ---
// Called when user manually interacts with tabs or timer
function forceStopRotation() {
  if (isPlaying) {
    // Send message to stop the background alarm
    chrome.runtime.sendMessage({ action: "toggleRotation", time: currentRotationTime }, (response) => {
      if (response) {
        updateButtonUI(response.isPlaying); // Update UI to "Pause"
      }
    });
  }
}

// --- Event Listeners ---

// 1. Other Buttons (Now stops rotation first)
reloadBtn.addEventListener('click', () => {
  forceStopRotation();
  reloadAllTabs();
});

leftBtn.addEventListener('click', () => {
  forceStopRotation();
  goToPreviousTab();
});

rightBtn.addEventListener('click', () => {
  forceStopRotation();
  goToNextTab();
});

// 2. Play/Pause Button
playPauseBtn.addEventListener('click', () => {
  // Sends a message to the background script to start/stop the alarm
  chrome.runtime.sendMessage(
    { action: "toggleRotation", time: currentRotationTime },
    (response) => {
      if (response) {
        updateButtonUI(response.isPlaying);
      }
    }
  );
});

// 3. Time Stepper Buttons (Stops rotation on change)
timeDecreaseBtn.addEventListener('click', () => {
  forceStopRotation();
  if (currentRotationTime > 1) { // Min 1 second
    currentRotationTime--;
    updateDisplay(currentRotationTime);
    chrome.storage.local.set({ rotationTime: currentRotationTime });
  }
});

timeIncreaseBtn.addEventListener('click', () => {
  forceStopRotation();
  if (currentRotationTime < 30) { // Max 30 seconds
    currentRotationTime++;
    updateDisplay(currentRotationTime);
    chrome.storage.local.set({ rotationTime: currentRotationTime });
  }
});

// 4. On Popup Open
// This syncs the UI with the saved state from background & storage
document.addEventListener('DOMContentLoaded', () => {
  // 1. Get the saved time from local storage
  chrome.storage.local.get(['rotationTime'], (result) => {
    const savedTime = result.rotationTime || 1;
    currentRotationTime = savedTime;
    
    // 2. Get the current play/pause state from the background script
    chrome.runtime.sendMessage({ action: "getState" }, (response) => {
      if (response) {
        updateButtonUI(response.isPlaying);
      }
      // 3. Update the text display
      updateDisplay(currentRotationTime); 
    });
  });
});