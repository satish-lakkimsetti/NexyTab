// A constant name for our alarm
const ALARM_NAME = 'tabRotationAlarm';

/**
 * Logic to switch to the next tab.
 */
function rotateToNextTab() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    // Don't rotate if there's only one tab
    if (tabs.length <= 1) {
      return;
    }
    const index = tabs.findIndex(tab => tab.active);
    const nextIndex = (index + 1) % tabs.length;
    chrome.tabs.update(tabs[nextIndex].id, { active: true });
  });
}

// 1. Listen for the alarm to fire
// This is what wakes up the script and triggers the rotation
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    rotateToNextTab();
  }
});

/**
 * Clears any old alarm and creates a new one with the specified time.
 * @param {number} timeInSeconds - The time from the stepper (1-30).
 */
function createOrUpdateAlarm(timeInSeconds) {
  // Convert seconds to minutes for the API.
  // This is the key part that allows the 1-30s timer to work in Firefox.
  const periodInMinutes = timeInSeconds / 60; 

  // Clear any existing alarm first, then create the new one
  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: periodInMinutes
    });
  });
}

// 2. Listen for messages from the popup (popup.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if (request.action === "toggleRotation") {
    // Check if the alarm is already running
    chrome.alarms.get(ALARM_NAME, (existingAlarm) => {
      if (existingAlarm) {
        // Alarm exists, so stop it
        chrome.alarms.clear(ALARM_NAME);
        sendResponse({ isPlaying: false });
      } else {
        // Alarm doesn't exist, so create it
        createOrUpdateAlarm(request.time);
        // We don't call rotateToNextTab() here, 
        // because popup.js calls it to feel more responsive.
        sendResponse({ isPlaying: true });
      }
    });
  
  } else if (request.action === "getState") {
    // The popup is opening and needs to know the current state
    chrome.alarms.get(ALARM_NAME, (alarm) => {
      // Respond with 'true' if the alarm exists, 'false' if not
      sendResponse({ isPlaying: (alarm !== undefined) });
    });
  }
  
  // Return true to indicate we will send a response asynchronously
  return true;
});