// Listener for when the user clicks the browser action icon (toolbar button)
chrome.browserAction.onClicked.addListener(() => {
  // Query all tabs in the current window
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    // Find the index of the currently active tab
    const activeIndex = tabs.findIndex(tab => tab.active);

    // Calculate the index of the next tab (wraps around to 0 if at the end)
    const nextIndex = (activeIndex + 1) % tabs.length;

    // Switch focus to the next tab
    chrome.tabs.update(tabs[nextIndex].id, { active: true });
  });
});
