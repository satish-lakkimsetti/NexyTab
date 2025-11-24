const ALARM_NAME = 'tabRotationAlarm';

// PERFORMANCE LOCK: Prevents rotation logic from running if it's already active
// or if the system is lagging. This reduces RAM spikes and "hanging."
let isRotationInProgress = false;
let lastExecutionTime = 0;

/**
 * Logic to switch to the next tab.
 * Includes optimizations for memory and performance.
 */
async function rotateToNextTab() {
  // 1. Lock Check: If we are already working, skip this tick.
  if (isRotationInProgress) {
    return; 
  }

  // 2. Throttle: Ensure we don't run more than once every ~800ms
  // This prevents queue pile-up on slow machines.
  const now = Date.now();
  if (now - lastExecutionTime < 800) {
    return;
  }

  isRotationInProgress = true;

  try {
    // Get tabs in the current window
    const tabs = await browser.tabs.query({ currentWindow: true });
    
    // Safety check: Do nothing if 0 or 1 tab
    if (!tabs || tabs.length <= 1) {
      isRotationInProgress = false;
      return;
    }

    // Efficiently find the active tab index
    let activeIndex = -1;
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].active) {
        activeIndex = i;
        break;
      }
    }

    // Switch to next tab
    if (activeIndex !== -1) {
      const nextIndex = (activeIndex + 1) % tabs.length;
      const nextTabId = tabs[nextIndex].id;
      
      await browser.tabs.update(nextTabId, { active: true });
    }
    
  } catch (error) {
    console.error("NexyTab Rotation Error:", error);
  } finally {
    // Always release the lock and update execution time
    lastExecutionTime = Date.now();
    isRotationInProgress = false;
  }
}

/**
 * OPTIMIZED RELOAD: Reloads tabs one by one to prevent RAM spikes.
 */
async function smartReloadAllTabs() {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    
    // 1. Reload the active tab immediately for perceived speed
    const activeTab = tabs.find(t => t.active);
    if (activeTab) {
      await browser.tabs.reload(activeTab.id);
    }

    // 2. Reload background tabs with a stagger delay
    for (const tab of tabs) {
      if (tab.active) continue; // Skip active tab (already done)
      
      await browser.tabs.reload(tab.id);
      
      // Wait 500ms before reloading the next one.
      // This keeps the UI smooth and prevents memory spikes.
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error("Smart Reload Error:", error);
  }
}

// 1. Listen for the alarm to fire
// This wakes up the background script for rotation
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    rotateToNextTab();
  }
});

/**
 * Helper to create or update the alarm.
 * Converts seconds to fractional minutes for Firefox compatibility.
 */
function createOrUpdateAlarm(timeInSeconds) {
  const periodInMinutes = timeInSeconds / 60; 

  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: periodInMinutes
    });
  });
}

// 2. Message Listener (Communication hub with popup.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  // Toggle Play/Pause
  if (request.action === "toggleRotation") {
    chrome.alarms.get(ALARM_NAME, (existingAlarm) => {
      if (existingAlarm) {
        // STOP: Clear alarm and release lock
        chrome.alarms.clear(ALARM_NAME);
        isRotationInProgress = false; 
        sendResponse({ isPlaying: false });
      } else {
        // START: Create alarm
        createOrUpdateAlarm(request.time);
        sendResponse({ isPlaying: true });
      }
    });
  
  // Get State (on popup open)
  } else if (request.action === "getState") {
    chrome.alarms.get(ALARM_NAME, (alarm) => {
      sendResponse({ isPlaying: (alarm !== undefined) });
    });

  // NEW: Handle the smart reload request
  } else if (request.action === "reloadAllTabs") {
    smartReloadAllTabs();
  }
  
  // Keep message channel open for async response
  return true;
});