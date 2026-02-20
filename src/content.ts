/**
 * Content Script
 * DOM から HTML を取得し、Markdown に変換してクリップボードにコピーする
 */
import { htmlToMarkdown } from './lib/html-to-markdown';
import { pageTemplate, linkTemplate, imageTemplate, selectionTemplate } from './lib/templates';

// Background Script からのメッセージを受信
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  try {
    handleMessage(message);
    sendResponse({ success: true });
  } catch (err) {
    console.error('CopyAsMarkdown error:', err);
    sendResponse({ success: false, error: (err as Error).message });
  }
  return true;
});

function handleMessage(message: { type: string; payload?: Record<string, string> }) {
  switch (message.type) {
    case 'COPY_SELECTION':
      copySelectionAsMarkdown();
      break;
    case 'COPY_LINK':
      copyLinkAsMarkdown(message.payload!);
      break;
    case 'COPY_PAGE':
      copyPageAsMarkdown();
      break;
    case 'COPY_IMAGE':
      copyImageAsMarkdown(message.payload!);
      break;
    default:
      console.warn('Unknown message type:', message.type);
  }
}

function copySelectionAsMarkdown() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    showNotification('No text selected');
    return;
  }

  const range = selection.getRangeAt(0);
  const container = document.createElement('div');
  container.appendChild(range.cloneContents());

  const markdown = selectionTemplate(htmlToMarkdown(container.innerHTML, window.location.href));
  copyToClipboard(markdown);
  showNotification('Copied as Markdown!');
}

function copyLinkAsMarkdown(payload: Record<string, string>) {
  const { url, text } = payload;
  const markdown = linkTemplate(text, url);
  copyToClipboard(markdown);
  showNotification('Link copied as Markdown!');
}

function copyPageAsMarkdown() {
  // ページの主要コンテンツを取得（article > main > body の優先順）
  const content =
    document.querySelector('article') ??
    document.querySelector('main') ??
    document.body;

  const title = document.title;
  const url = window.location.href;
  const body = htmlToMarkdown(content.innerHTML, window.location.href);
  const markdown = pageTemplate(title, url, body);

  copyToClipboard(markdown);
  showNotification('Page copied as Markdown!');
}

function copyImageAsMarkdown(payload: Record<string, string>) {
  const { src } = payload;
  const markdown = imageTemplate('', src);
  copyToClipboard(markdown);
  showNotification('Image copied as Markdown!');
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    // Fallback: textarea を使ったコピー
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  });
}
/** Shadow DOM ホスト要素の ID */
const NOTIFICATION_HOST_ID = 'copy-as-md-notification-host';

function showNotification(message: string) {
  // 既存の通知ホストがあれば削除
  const existing = document.getElementById(NOTIFICATION_HOST_ID);
  if (existing) existing.remove();

  // Shadow DOM ホスト要素（ページの CSS から完全に隔離）
  const host = document.createElement('div');
  host.id = NOTIFICATION_HOST_ID;
  // ホスト要素自体がページの CSS に影響されないようにリセット
  Object.assign(host.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '2147483647',
    all: 'initial',
  });

  const shadow = host.attachShadow({ mode: 'closed' });

  // Shadow DOM 内部のスタイル（ページ CSS から完全に独立）
  const style = document.createElement('style');
  style.textContent = `
    :host {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
    }
    .notification {
      padding: 12px 20px;
      background: #1a1a2e;
      color: #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      opacity: 0;
      transition: opacity 0.3s ease;
      line-height: 1.4;
      white-space: nowrap;
    }
    .notification.visible {
      opacity: 1;
    }
  `;

  // 通知要素（アクセシビリティ属性付き）
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'polite');

  shadow.appendChild(style);
  shadow.appendChild(notification);
  document.body.appendChild(host);

  // フェードイン
  requestAnimationFrame(() => {
    notification.classList.add('visible');
  });

  // 2秒後にフェードアウト → 削除
  setTimeout(() => {
    notification.classList.remove('visible');
    setTimeout(() => host.remove(), 300);
  }, 2000);
}
