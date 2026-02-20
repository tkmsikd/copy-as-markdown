/**
 * HTML 文字列を Markdown に変換するコアエンジン。
 * ブラウザ環境では DOMParser、テスト環境では jsdom を使用。
 *
 * @param html - 変換対象の HTML 文字列
 * @param baseUrl - 相対URLを絶対URLに解決するための基準URL（省略時は相対URLのまま出力）
 */

// モジュールスコープで baseUrl を保持（再帰呼び出しに引き回すのを避けるため）
let currentBaseUrl: string | undefined;

export function htmlToMarkdown(html: string, baseUrl?: string): string {
  if (!html) return '';

  const trimmed = html.trim();
  if (!trimmed) return '';

  // HTML タグが含まれない場合はエンティティだけデコードして返す
  if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
    return decodeEntities(trimmed).trim();
  }

  currentBaseUrl = baseUrl;

  const doc = new DOMParser().parseFromString(`<div>${trimmed}</div>`, 'text/html');
  const root = doc.body.firstElementChild as HTMLElement;

  if (!root) {
    currentBaseUrl = undefined;
    return decodeEntities(trimmed).trim();
  }

  const result = processNode(root, 0).trim();
  currentBaseUrl = undefined;
  return result;
}

function processNode(node: Node, depth: number): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return decodeEntities(node.textContent ?? '').replace(/\s+/g, ' ');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case 'h1': return `# ${getInlineContent(el)}`;
    case 'h2': return `## ${getInlineContent(el)}`;
    case 'h3': return `### ${getInlineContent(el)}`;
    case 'h4': return `#### ${getInlineContent(el)}`;
    case 'h5': return `##### ${getInlineContent(el)}`;
    case 'h6': return `###### ${getInlineContent(el)}`;

    case 'strong':
    case 'b':
      return `**${getInlineContent(el)}**`;

    case 'em':
    case 'i':
      return `*${getInlineContent(el)}*`;

    case 'code':
      // pre > code はコードブロック（親で処理）
      if (el.parentElement?.tagName.toLowerCase() === 'pre') {
        return el.textContent ?? '';
      }
      return `\`${el.textContent ?? ''}\``;

    case 'del':
    case 's':
      return `~~${getInlineContent(el)}~~`;

    case 'a': {
      const href = el.getAttribute('href');
      const text = getInlineContent(el);
      if (!href) return text;
      const resolvedHref = resolveUrl(href);
      return `[${text}](${resolvedHref})`;
    }

    case 'img': {
      const src = el.getAttribute('src') ?? '';
      const alt = el.getAttribute('alt') ?? '';
      const resolvedSrc = resolveUrl(src);
      return `![${alt}](${resolvedSrc})`;
    }

    case 'br':
      return '\n';

    case 'hr':
      return '---';

    case 'p':
      return getInlineContent(el);

    case 'blockquote':
      return `> ${getInlineContent(el)}`;

    case 'pre':
      return processCodeBlock(el);

    case 'ul':
      return processUnorderedList(el, depth);

    case 'ol':
      return processOrderedList(el, depth);

    case 'li':
      return processListItem(el, depth);

    case 'table':
      return processTable(el);

    case 'div':
    case 'span':
    case 'section':
    case 'article':
    case 'main':
    case 'header':
    case 'footer':
    case 'nav':
      return processChildren(el, depth);

    default:
      return processChildren(el, depth);
  }
}

function getInlineContent(el: HTMLElement): string {
  let result = '';
  for (const child of Array.from(el.childNodes)) {
    result += processNode(child, 0);
  }
  return result.trim();
}

const BLOCK_TAGS = new Set([
  'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'table',
  'section', 'article', 'main', 'header', 'footer', 'nav', 'hr',
]);

function processChildren(el: HTMLElement, depth: number): string {
  let result = '';
  let lastWasBlock = false;

  for (const child of Array.from(el.childNodes)) {
    const content = processNode(child, depth);
    if (!content.trim() && content !== '\n') continue;

    const isBlock = child.nodeType === Node.ELEMENT_NODE &&
      BLOCK_TAGS.has((child as HTMLElement).tagName.toLowerCase());

    if (isBlock && result.trim()) {
      result = result.trimEnd() + '\n\n' + content.trim();
      lastWasBlock = true;
    } else if (lastWasBlock && content.trim()) {
      result = result.trimEnd() + '\n\n' + content.trim();
      lastWasBlock = false;
    } else {
      result += content;
    }
  }

  return result.trim();
}

function processCodeBlock(pre: HTMLElement): string {
  const code = pre.querySelector('code');
  if (!code) return `\`\`\`\n${pre.textContent ?? ''}\n\`\`\``;

  let lang = '';
  const className = code.getAttribute('class') ?? '';
  const langMatch = className.match(/language-(\w+)/);
  if (langMatch) lang = langMatch[1];

  const content = code.textContent ?? '';
  return `\`\`\`${lang}\n${content}\n\`\`\``;
}

function processUnorderedList(ul: HTMLElement, depth: number): string {
  const items: string[] = [];
  const indent = '  '.repeat(depth);

  for (const child of Array.from(ul.children)) {
    if (child.tagName.toLowerCase() === 'li') {
      const { text, sublist } = extractListItemContent(child as HTMLElement, depth);
      items.push(`${indent}- ${text}`);
      if (sublist) items.push(sublist);
    }
  }

  return items.join('\n');
}

function processOrderedList(ol: HTMLElement, depth: number): string {
  const items: string[] = [];
  const indent = '  '.repeat(depth);
  let counter = 1;

  for (const child of Array.from(ol.children)) {
    if (child.tagName.toLowerCase() === 'li') {
      const { text, sublist } = extractListItemContent(child as HTMLElement, depth);
      items.push(`${indent}${counter}. ${text}`);
      if (sublist) items.push(sublist);
      counter++;
    }
  }

  return items.join('\n');
}

function extractListItemContent(li: HTMLElement, depth: number): { text: string; sublist: string | null } {
  let text = '';
  let sublist: string | null = null;

  for (const child of Array.from(li.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += (child.textContent ?? '').replace(/\s+/g, ' ');
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const childEl = child as HTMLElement;
      const childTag = childEl.tagName.toLowerCase();

      if (childTag === 'ul') {
        sublist = processUnorderedList(childEl, depth + 1);
      } else if (childTag === 'ol') {
        sublist = processOrderedList(childEl, depth + 1);
      } else {
        text += processNode(child, depth);
      }
    }
  }

  return { text: text.trim(), sublist };
}

function processListItem(li: HTMLElement, depth: number): string {
  return getInlineContent(li);
}

function processTable(table: HTMLElement): string {
  const rows: string[][] = [];

  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  if (thead) {
    for (const tr of Array.from(thead.querySelectorAll('tr'))) {
      rows.push(Array.from(tr.querySelectorAll('th, td')).map(cell => getInlineContent(cell as HTMLElement)));
    }
  }

  // ヘッダー行がない場合、tbody の最初の行をヘッダーとして扱う
  const bodyRows = tbody
    ? Array.from(tbody.querySelectorAll('tr'))
    : Array.from(table.querySelectorAll('tr'));

  if (!thead && bodyRows.length > 0) {
    const firstRow = bodyRows.shift()!;
    rows.push(Array.from(firstRow.querySelectorAll('th, td')).map(cell => getInlineContent(cell as HTMLElement)));
  }

  if (rows.length === 0) return '';

  const headerRow = rows[0];
  const lines: string[] = [];

  // ヘッダー行
  lines.push(`| ${headerRow.join(' | ')} |`);
  // セパレーター
  lines.push(`| ${headerRow.map(() => '---').join(' | ')} |`);

  // ボディ行
  for (const tr of bodyRows) {
    const cells = Array.from(tr.querySelectorAll('td, th')).map(cell => getInlineContent(cell as HTMLElement));
    lines.push(`| ${cells.join(' | ')} |`);
  }

  return lines.join('\n');
}

function joinBlocks(parts: string[]): string {
  return parts.join('\n\n');
}

/**
 * 相対URLを絶対URLに解決する。
 * baseUrl が未設定、またはURL自体が絶対URLやフラグメントの場合はそのまま返す。
 */
function resolveUrl(url: string): string {
  if (!currentBaseUrl || !url) return url;

  // フラグメントリンク (#...) はそのまま保持
  if (url.startsWith('#')) return url;

  // 既に絶対URLの場合はそのまま
  if (/^https?:\/\//i.test(url)) return url;

  // data: / mailto: / javascript: などのスキームはそのまま
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;

  try {
    const base = new URL(currentBaseUrl);

    // プロトコル相対URL (//example.com/...)
    if (url.startsWith('//')) {
      return `${base.protocol}${url}`;
    }

    // パス相対 or ルート相対
    return new URL(url, currentBaseUrl).href;
  } catch {
    return url;
  }
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
