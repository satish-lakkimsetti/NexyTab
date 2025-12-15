// --- CONNECTION HANDSHAKE ---
chrome.runtime.connect({ name: "popup-connection" });

// --- Get DOM Elements ---
const elements = {
  reloadAll: document.getElementById('reload-all'),
  random: document.getElementById('random'),
  left: document.getElementById('left'),
  playPause: document.getElementById('play-pause'),
  right: document.getElementById('right'),
  reloadCurrent: document.getElementById('reload-current'),
  sleepToggle: document.getElementById('sleep-toggle'),
  timeDisplay: document.getElementById('time-display'),
  timeDecrease: document.getElementById('time-decrease'),
  timeIncrease: document.getElementById('time-increase')
};

// --- State Variables ---
let currentRotationTime = 5; // Default: 5 seconds (Minimum)
let isPlaying = false; 
let isSleepEnabled = false; 

// --- Core Functions ---

// Helper: wrapper to stop rotation before performing manual actions
function handleUserAction(actionCallback) {
  forceStopRotation();
  if (actionCallback) actionCallback();
}

function reloadAllTabs() {
  chrome.runtime.sendMessage({ action: "reloadAllTabs" });
}

function reloadCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
}

// Optimized: Single function for Next (1) and Previous (-1)
function cycleTab(direction) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    if (tabs.length <= 1) return;
    
    const index = tabs.findIndex(tab => tab.active);
    // Calculate next index with wrap-around
    const nextIndex = (index + direction + tabs.length) % tabs.length;
    
    chrome.tabs.update(tabs[nextIndex].id, { active: true });
  });
}

function goToRandomTab() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    if (tabs.length <= 1) return;
    
    const activeTabIndex = tabs.findIndex(t => t.active);
    let nextIndex = activeTabIndex;
    
    // Attempt to pick a different tab
    let attempts = 0;
    while (nextIndex === activeTabIndex && attempts < 10) {
      nextIndex = Math.floor(Math.random() * tabs.length);
      attempts++;
    }
    
    chrome.tabs.update(tabs[nextIndex].id, { active: true });
  });
}

// --- UI Update Functions ---

function updateDisplay(seconds) {
  elements.timeDisplay.textContent = `${seconds}s`;
  if (!isPlaying) {
    elements.playPause.title = `Start Rotating Tabs (${seconds}s)`;
  }
}

function updateButtonUI(isPlayingState) {
  isPlaying = isPlayingState;
  if (isPlaying) {
    elements.playPause.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    elements.playPause.title = "Stop Rotating Tabs"; 
  } else {
    elements.playPause.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
    updateDisplay(currentRotationTime);
  }
}

function updateSleepToggleUI(enabled) {
  isSleepEnabled = enabled;
  const btn = elements.sleepToggle;
  
  btn.setAttribute('aria-checked', enabled);
  if (isSleepEnabled) {
    btn.classList.add('active'); 
    btn.title = "Tab Sleeping - ON"; 
  } else {
    btn.classList.remove('active'); 
    btn.title = "Tab Sleeping - OFF"; 
  }
}

function forceStopRotation() {
  if (isPlaying) {
    chrome.runtime.sendMessage({ action: "toggleRotation", time: currentRotationTime }, (response) => {
      if (chrome.runtime.lastError) return; // Handle connection errors silently
      if (response) {
        updateButtonUI(response.isPlaying); 
      }
    });
  }
}

// Helper to safely update time
function updateTime(newTime) {
  if (newTime >= 5 && newTime <= 30) {
    handleUserAction(); // Stop rotation when changing settings
    currentRotationTime = newTime;
    updateDisplay(currentRotationTime);
    chrome.storage.local.set({ rotationTime: currentRotationTime });
  }
}

// --- Event Listeners ---

// 1. Reload All
elements.reloadAll.addEventListener('click', () => handleUserAction(reloadAllTabs));

// 2. Random Tab
elements.random.addEventListener('click', () => handleUserAction(goToRandomTab));

// 3. Previous Tab
elements.left.addEventListener('click', () => handleUserAction(() => cycleTab(-1)));

// 4. Play/Pause (Direct logic, no wrapper)
elements.playPause.addEventListener('click', () => {
  chrome.runtime.sendMessage(
    { action: "toggleRotation", time: currentRotationTime },
    (response) => {
      if (chrome.runtime.lastError) return;
      if (response) {
        updateButtonUI(response.isPlaying);
      }
    }
  );
});

// 5. Next Tab
elements.right.addEventListener('click', () => handleUserAction(() => cycleTab(1)));

// 6. Reload Current
elements.reloadCurrent.addEventListener('click', () => handleUserAction(reloadCurrentTab));

// 7. Sleep Toggle
elements.sleepToggle.addEventListener('click', () => {
  const newState = !isSleepEnabled;
  updateSleepToggleUI(newState);
  chrome.storage.local.set({ sleepEnabled: newState });
});

// 8. Time Stepper
elements.timeDecrease.addEventListener('click', () => updateTime(currentRotationTime - 1));
elements.timeIncrease.addEventListener('click', () => updateTime(currentRotationTime + 1));

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['rotationTime', 'sleepEnabled'], (result) => {
    // Validate saved time (min 5s)
    let savedTime = result.rotationTime || 5;
    if (savedTime < 5) savedTime = 5;
    currentRotationTime = savedTime;
    
    // Restore sleep state
    const savedSleepState = result.sleepEnabled || false;
    updateSleepToggleUI(savedSleepState);
    
    // Sync state with background
    chrome.runtime.sendMessage({ action: "getState" }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response) {
        updateButtonUI(response.isPlaying);
      }
      updateDisplay(currentRotationTime); 
    });
  });
});