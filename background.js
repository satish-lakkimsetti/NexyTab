const ALARM_NAME = 'tabRotationAlarm';

// PERFORMANCE LOCKS
let isRotationInProgress = false;
let lastExecutionTime = 0;

// Note: We removed the isPopupOpen check so rotation continues even when the extension is open.

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
    const tabs = await browser.tabs.query({ currentWindow: true });
    
    if (!tabs || tabs.length <= 1) {
      isRotationInProgress = false;
      return;
    }

    let activeIndex = -1;
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].active) {
        activeIndex = i;
        break;
      }
    }

    if (activeIndex !== -1) {
      const nextIndex = (activeIndex + 1) % tabs.length;
      const previousTabId = tabs[activeIndex].id; // The tab we are leaving
      const nextTabId = tabs[nextIndex].id;       // The tab we are going to
      
      // STEP 1: Switch to the new tab FIRST
      await browser.tabs.update(nextTabId, { active: true });

      // STEP 2: Discard the OLD tab (if enabled)
      const settings = await browser.storage.local.get(['sleepEnabled']);
      
      if (settings.sleepEnabled) {
        setTimeout(() => {
          browser.tabs.discard(previousTabId).catch((err) => {
             console.log("Tab discard skipped:", err);
          });
        }, 500);
      }
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