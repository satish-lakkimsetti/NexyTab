document.getElementById('left').addEventListener('click', () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const index = tabs.findIndex(tab => tab.active);
    const prevIndex = (index - 1 + tabs.length) % tabs.length;
    chrome.tabs.update(tabs[prevIndex].id, { active: true });
  });
});

document.getElementById('right').addEventListener('click', () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const index = tabs.findIndex(tab => tab.active);
    const nextIndex = (index + 1) % tabs.length;
    chrome.tabs.update(tabs[nextIndex].id, { active: true });
  });
});

document.getElementById('refresh').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) chrome.tabs.reload(tabs[0].id);
  });
});
