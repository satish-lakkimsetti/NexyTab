chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) return;

    const activeIndex = tabs.findIndex(tab => tab.active);
    const nextTab = tabs[(activeIndex + 1) % tabs.length];

    nextTab?.id && chrome.tabs.update(nextTab.id, { active: true });
  });
});
