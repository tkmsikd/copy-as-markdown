/**
 * Background Service Worker
 * コンテキストメニューの登録、キーボードショートカット、メッセージハンドリング
 */

/**
 * アクティブタブの Content Script にメッセージを送信するヘルパー。
 * コンテキストメニューとキーボードショートカットの両方で共用。
 */
async function sendToActiveTab(message: { type: string; payload?: Record<string, string> }) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, message);
  } catch (err) {
    console.error('Failed to send message to content script:', err);
  }
}

// キーボードショートカット処理
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'copy-selection':
      sendToActiveTab({ type: 'COPY_SELECTION' });
      break;
    case 'copy-page':
      sendToActiveTab({ type: 'COPY_PAGE' });
      break;
  }
});

// コンテキストメニュー登録
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'copy-selection-as-markdown',
    title: 'Copy Selection as Markdown',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'copy-link-as-markdown',
    title: 'Copy Link as Markdown',
    contexts: ['link'],
  });

  chrome.contextMenus.create({
    id: 'copy-page-as-markdown',
    title: 'Copy Page as Markdown',
    contexts: ['page'],
  });

  chrome.contextMenus.create({
    id: 'copy-image-as-markdown',
    title: 'Copy Image as Markdown',
    contexts: ['image'],
  });
});

// コンテキストメニュークリック処理
chrome.contextMenus.onClicked.addListener((info) => {
  const action = getAction(info.menuItemId as string, info);
  if (action) {
    sendToActiveTab(action);
  }
});

function getAction(
  menuItemId: string,
  info: chrome.contextMenus.OnClickData
): { type: string; payload?: Record<string, string> } | null {
  switch (menuItemId) {
    case 'copy-selection-as-markdown':
      return { type: 'COPY_SELECTION' };
    case 'copy-link-as-markdown':
      return {
        type: 'COPY_LINK',
        payload: {
          url: info.linkUrl ?? '',
          text: info.selectionText ?? info.linkUrl ?? '',
        },
      };
    case 'copy-page-as-markdown':
      return { type: 'COPY_PAGE' };
    case 'copy-image-as-markdown':
      return {
        type: 'COPY_IMAGE',
        payload: {
          src: info.srcUrl ?? '',
        },
      };
    default:
      return null;
  }
}
