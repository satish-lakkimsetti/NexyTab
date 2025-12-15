const ALARM_NAME = 'tabRotationAlarm';

// PERFORMANCE LOCKS
let isRotationInProgress = false;
let lastExecutionTime = 0;

// SETTINGS CACHE
let cachedSleepEnabled = false;

// Initialize cache on load
browser.storage.local.get(['sleepEnabled']).then((result) => {
  cachedSleepEnabled = result.sleepEnabled || false;
});

// Update cache whenever the user toggles the button
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.sleepEnabled) {
    cachedSleepEnabled = changes.sleepEnabled.newValue;
  }
});

/**
 * Logic to switch to the next tab AND optionally discard the old one.
 */
async function rotateToNextTab() {
  // 1. Lock Check
  if (isRotationInProgress) {
    return; 
  }

  // 2. Throttle
  const now = Date.now();
  if (now - lastExecutionTime < 800) {
    return;
  }

  isRotationInProgress = true;

  try {
    // Get the current window details to check if minimized
    const currentWindow = await browser.windows.getCurrent();
    
    // OPTIMIZATION: If window is minimized, skip rotation to save RAM/CPU
    if (currentWindow.state === 'minimized') {
      isRotationInProgress = false;
      return;
    }

    const tabs = await browser.tabs.query({ currentWindow: true });
    
    if (!tabs || tabs.length <= 1) {
      isRotationInProgress = false;
      return;
    }

    // Efficiently find active index
    const activeIndex = tabs.findIndex(t => t.active);
    if (activeIndex === -1) return;

    const nextIndex = (activeIndex + 1) % tabs.length;
    const previousTabId = tabs[activeIndex].id; // The tab we are leaving
    const nextTabId = tabs[nextIndex].id;       // The tab we are going to
    
    // --- STEP 1: Switch to the new tab ---
    await browser.tabs.update(nextTabId, { active: true });

    // --- STEP 2: Preload the UPCOMING 5 tabs ---
    const preloadCount = Math.min(5, tabs.length - 1);

    for (let i = 1; i <= preloadCount; i++) {
      const futureIndex = (nextIndex + i) % tabs.length;
      const futureTab = tabs[futureIndex];

      if (futureTab.id === nextTabId) continue;

      // Don't preload if we are about to discard it
      if (cachedSleepEnabled && futureTab.id === previousTabId) continue;

      // Only reload if currently sleeping
      if (futureTab.discarded) {
        browser.tabs.reload(futureTab.id).catch(() => {});
      }
    }

    // --- STEP 3: Discard the OLD tab ---
    // Uses the cached value for better performance
    if (cachedSleepEnabled) {
      setTimeout(() => {
        browser.tabs.discard(previousTabId).catch((err) => {
            // Ignore errors (e.g., if tab was closed)
        });
      }, 500);
    }
    
  } catch (error) {
    console.error("NexyTab Rotation Error:", error);
  } finally {
    lastExecutionTime = Date.now();
    isRotationInProgress = false;
  }
}

async function smartReloadAllTabs() {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    const activeTab = tabs.find(t => t.active);
    
    if (activeTab) {
      await browser.tabs.reload(activeTab.id);
    }

    for (const tab of tabs) {
      if (tab.active) continue; 
      await browser.tabs.reload(tab.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error("Smart Reload Error:", error);
  }
}

// 1. Listen for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    rotateToNextTab();
  }
});

function createOrUpdateAlarm(timeInSeconds) {
  // Enforce minimum 5s interval for stability
  if (timeInSeconds < 5) timeInSeconds = 5;

  const periodInMinutes = timeInSeconds / 60; 
  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: periodInMinutes
    });
  });
}

// 2. Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if (request.action === "toggleRotation") {
    chrome.alarms.get(ALARM_NAME, (existingAlarm) => {
      if (existingAlarm) {
        chrome.alarms.clear(ALARM_NAME);
        isRotationInProgress = false; 
        sendResponse({ isPlaying: false });
      } else {
        createOrUpdateAlarm(request.time);
        sendResponse({ isPlaying: true });
      }
    });
  
  } else if (request.action === "getState") {
    chrome.alarms.get(ALARM_NAME, (alarm) => {
      sendResponse({ isPlaying: (alarm !== undefined) });
    });

  } else if (request.action === "reloadAllTabs") {
    smartReloadAllTabs();
  }
  
  return true;
});