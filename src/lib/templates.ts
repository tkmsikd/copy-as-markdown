/**
 * 出力テンプレート管理モジュール。
 * Markdown コピー時のフォーマットテンプレートを提供する。
 */

/**
 * ページ全体コピー用テンプレート。
 * タイトル・ソースリンク・本文を含む Markdown を生成する。
 */
export function pageTemplate(title: string, url: string, body: string): string {
  const displayTitle = title || 'Untitled';
  let result = `# ${displayTitle}\n\n> Source: [${displayTitle}](${url})`;

  if (body.trim()) {
    result += `\n\n${body.trim()}`;
  }

  return result;
}

/**
 * リンクコピー用テンプレート。
 * [text](url) 形式の Markdown リンクを生成する。
 */
export function linkTemplate(text: string, url: string): string {
  const displayText = text || url;
  return `[${displayText}](${url})`;
}

/**
 * 画像コピー用テンプレート。
 * ![alt](src) 形式の Markdown 画像を生成する。
 */
export function imageTemplate(alt: string, src: string): string {
  return `![${alt}](${src})`;
}

/**
 * 選択テキストコピー用テンプレート。
 * 変換済み Markdown をトリムして返す。
 */
export function selectionTemplate(markdown: string): string {
  return markdown.trim();
}
