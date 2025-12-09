// --- CONNECTION HANDSHAKE ---
// Establishes a long-lived connection to the background script.
// This allows the background to know when the popup is open,
// which can be useful for pausing rotation or other state management.
chrome.runtime.connect({ name: "popup-connection" });

// --- Get DOM Elements ---
const playPauseBtn = document.getElementById('play-pause');
const reloadBtn = document.getElementById('reload');
const reloadCurrentBtn = document.getElementById('reload-current');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const randomBtn = document.getElementById('random');

// Sleep Toggle Elements
const sleepToggleContainer = document.getElementById('sleep-toggle-container'); 
const sleepToggleText = document.getElementById('sleep-toggle-text'); 

// Time Stepper Elements
const timeDisplay = document.getElementById('time-display');
const timeDecreaseBtn = document.getElementById('time-decrease');
const timeIncreaseBtn = document.getElementById('time-increase');

// --- State Variables ---
let currentRotationTime = 1;
let isPlaying = false; 
let isSleepEnabled = false; 

// --- Reusable Navigation Functions ---

// Reloads all tabs via background script (staggered to save RAM)
function reloadAllTabs() {
  chrome.runtime.sendMessage({ action: "reloadAllTabs" });
}

// Reloads just the active tab
function reloadCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
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

// Switches to a random tab
function goToRandomTab() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    if (tabs.length <= 1) return;
    
    const activeTabIndex = tabs.findIndex(t => t.active);
    let nextIndex = activeTabIndex;
    
    // Attempt to find a different tab (try 10 times)
    // This prevents picking the same tab we are already on.
    let attempts = 0;
    while (nextIndex === activeTabIndex && attempts < 10) {
      nextIndex = Math.floor(Math.random() * tabs.length);
      attempts++;
    }
    
    chrome.tabs.update(tabs[nextIndex].id, { active: true });
  });
}

// --- UI Update Functions ---

// Updates the time display text (e.g., "5s")
function updateDisplay(seconds) {
  timeDisplay.textContent = `${seconds}s`;
  if (!isPlaying) {
    playPauseBtn.title = `Start rotating tabs (${seconds}s)`;
  }
}

// Toggles the Play/Pause icon based on state
function updateButtonUI(isPlayingState) {
  isPlaying = isPlayingState;
  if (isPlaying) {
    // Pause Icon
    playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    playPauseBtn.title = "Stop rotating tabs";
  } else {
    // Play Icon
    playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
    updateDisplay(currentRotationTime);
  }
}

// Updates the Sleep Toggle Switch (Visuals & Text)
function updateSleepToggleUI(enabled) {
  isSleepEnabled = enabled;
  
  // Update Accessibility State
  sleepToggleContainer.setAttribute('aria-checked', enabled);
  
  if (isSleepEnabled) {
    sleepToggleContainer.classList.add('active'); 
    sleepToggleText.textContent = "ON"; 
    sleepToggleContainer.title = "Turn off Tab Sleeping during rotation (experimental)";
  } else {
    sleepToggleContainer.classList.remove('active'); 
    sleepToggleText.textContent = "OFF"; 
    sleepToggleContainer.title = "Turn on Tab Sleeping during rotation (experimental)";
  }
}

// Stops rotation if user interacts manually with other controls
function forceStopRotation() {
  if (isPlaying) {
    chrome.runtime.sendMessage({ action: "toggleRotation", time: currentRotationTime }, (response) => {
      if (response) {
        updateButtonUI(response.isPlaying); 
      }
    });
  }
}

// --- Event Listeners ---

reloadBtn.addEventListener('click', () => {
  forceStopRotation();
  reloadAllTabs();
});

reloadCurrentBtn.addEventListener('click', () => {
  forceStopRotation();
  reloadCurrentTab();
});

leftBtn.addEventListener('click', () => {
  forceStopRotation();
  goToPreviousTab();
});

rightBtn.addEventListener('click', () => {
  forceStopRotation();
  goToNextTab();
});

randomBtn.addEventListener('click', () => {
  forceStopRotation();
  goToRandomTab();
});

// Tab Sleeping Toggle Click Handler
sleepToggleContainer.addEventListener('click', () => {
  const newState = !isSleepEnabled;
  updateSleepToggleUI(newState);
  // Save to storage so background.js can access it during rotation
  chrome.storage.local.set({ sleepEnabled: newState });
});

// Play/Pause Click Handler
playPauseBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage(
    { action: "toggleRotation", time: currentRotationTime },
    (response) => {
      if (response) {
        updateButtonUI(response.isPlaying);
      }
    }
  );
});

// Time Decrease
timeDecreaseBtn.addEventListener('click', () => {
  forceStopRotation();
  if (currentRotationTime > 1) { 
    currentRotationTime--;
    updateDisplay(currentRotationTime);
    chrome.storage.local.set({ rotationTime: currentRotationTime });
  }
});

// Time Increase
timeIncreaseBtn.addEventListener('click', () => {
  forceStopRotation();
  if (currentRotationTime < 30) { 
    currentRotationTime++;
    updateDisplay(currentRotationTime);
    chrome.storage.local.set({ rotationTime: currentRotationTime });
  }
});

// --- Initialization on Popup Open ---
document.addEventListener('DOMContentLoaded', () => {
  // Load ALL saved settings from storage
  chrome.storage.local.get(['rotationTime', 'sleepEnabled'], (result) => {
    // 1. Restore Time
    const savedTime = result.rotationTime || 1;
    currentRotationTime = savedTime;
    
    // 2. Restore Sleep Toggle
    const savedSleepState = result.sleepEnabled || false;
    updateSleepToggleUI(savedSleepState);
    
    // 3. Get Play/Pause State from Background
    chrome.runtime.sendMessage({ action: "getState" }, (response) => {
      if (response) {
        updateButtonUI(response.isPlaying);
      }
      updateDisplay(currentRotationTime); 
    });
  });
});