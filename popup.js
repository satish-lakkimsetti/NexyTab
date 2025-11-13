function reloadAllTabs() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.forEach(tab => chrome.tabs.reload(tab.id));
  });
}

function goToPreviousTab() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const index = tabs.findIndex(tab => tab.active);
    const prevIndex = (index - 1 + tabs.length) % tabs.length;
    chrome.tabs.update(tabs[prevIndex].id, { active: true });
  });
}

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

const playPauseBtn = document.getElementById('play-pause');
let isPlaying = false;
let rotationInterval = null;

document.getElementById('reload').addEventListener('click', reloadAllTabs);
document.getElementById('left').addEventListener('click', goToPreviousTab);
document.getElementById('right').addEventListener('click', goToNextTab);

playPauseBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;

  if (isPlaying) {
    rotationInterval = setInterval(goToNextTab, 10000); 
    playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    playPauseBtn.title = "Stop Rotating Tabs";
  } else {
    clearInterval(rotationInterval);
    rotationInterval = null;
    playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    playPauseBtn.title = "Start rotating tabs (10s)";
  }
});