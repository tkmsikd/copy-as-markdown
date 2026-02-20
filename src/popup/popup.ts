/**
 * Popup Script
 * ポップアップ UI のイベントハンドリング
 */

document.addEventListener('DOMContentLoaded', () => {
  const copyPageBtn = document.getElementById('copy-page-btn');
  const copySelectionBtn = document.getElementById('copy-selection-btn');

  copyPageBtn?.addEventListener('click', async () => {
    await sendToActiveTab({ type: 'COPY_PAGE' });
    showButtonSuccess(copyPageBtn, '✅ Copied!');
  });

  copySelectionBtn?.addEventListener('click', async () => {
    await sendToActiveTab({ type: 'COPY_SELECTION' });
    showButtonSuccess(copySelectionBtn, '✅ Copied!');
  });
});

async function sendToActiveTab(message: { type: string }) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, message);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }
}

function showButtonSuccess(btn: HTMLElement, text: string) {
  const original = btn.textContent;
  btn.textContent = text;
  btn.classList.add('success');

  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove('success');
  }, 1500);
}
