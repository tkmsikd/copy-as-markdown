/**
 * シナリオレベルテスト（Medium サイズ）
 * ユースケース単位で HTML → Markdown 変換フロー全体を検証する。
 */
import { describe, it, expect } from 'vitest';
import { htmlToMarkdown } from '../src/lib/html-to-markdown';
import { pageTemplate, linkTemplate, imageTemplate, selectionTemplate } from '../src/lib/templates';

describe('ユースケース: 選択テキストを Markdown でコピーする', () => {
  it('段落テキストを選択してコピーするとプレーン Markdown になる', () => {
    const selectedHtml = '<p>This is a <strong>bold</strong> and <em>italic</em> paragraph.</p>';
    const result = selectionTemplate(htmlToMarkdown(selectedHtml));
    expect(result).toBe('This is a **bold** and *italic* paragraph.');
  });

  it('リンクを含むテキストを選択してコピーする', () => {
    const selectedHtml = '<p>Visit <a href="https://example.com">Example</a> for more.</p>';
    const result = selectionTemplate(htmlToMarkdown(selectedHtml));
    expect(result).toBe('Visit [Example](https://example.com) for more.');
  });

  it('空の選択でコピーすると空文字列になる', () => {
    const result = selectionTemplate(htmlToMarkdown(''));
    expect(result).toBe('');
  });
});

describe('ユースケース: ページ全体を Markdown でコピーする', () => {
  it('見出し + 段落 + リストの記事ページをコピーする', () => {
    const pageHtml = `
      <article>
        <h1>Introduction to TypeScript</h1>
        <p>TypeScript is a <strong>typed superset</strong> of JavaScript.</p>
        <ul>
          <li>Type safety</li>
          <li>Better tooling</li>
          <li>Modern features</li>
        </ul>
      </article>
    `;
    const body = htmlToMarkdown(pageHtml);
    const result = pageTemplate('Introduction to TypeScript', 'https://example.com/ts', body);

    expect(result).toContain('# Introduction to TypeScript');
    expect(result).toContain('> Source: [Introduction to TypeScript](https://example.com/ts)');
    expect(result).toContain('**typed superset**');
    expect(result).toContain('- Type safety');
    expect(result).toContain('- Better tooling');
    expect(result).toContain('- Modern features');
  });

  it('テーブルを含むページをコピーする', () => {
    const pageHtml = `
      <h2>Comparison</h2>
      <table>
        <thead><tr><th>Feature</th><th>TS</th><th>JS</th></tr></thead>
        <tbody>
          <tr><td>Types</td><td>Yes</td><td>No</td></tr>
          <tr><td>Enums</td><td>Yes</td><td>No</td></tr>
        </tbody>
      </table>
    `;
    const body = htmlToMarkdown(pageHtml);
    const result = pageTemplate('Comparison', 'https://example.com/compare', body);

    expect(result).toContain('| Feature | TS | JS |');
    expect(result).toContain('| --- | --- | --- |');
    expect(result).toContain('| Types | Yes | No |');
  });
});

describe('ユースケース: リンクを Markdown でコピーする', () => {
  it('リンクテキストと URL で [text](url) を生成する', () => {
    const result = linkTemplate('GitHub', 'https://github.com');
    expect(result).toBe('[GitHub](https://github.com)');
  });

  it('テキストのないリンクは URL をテキストに使う', () => {
    const result = linkTemplate('', 'https://github.com');
    expect(result).toBe('[https://github.com](https://github.com)');
  });
});

describe('ユースケース: 画像を Markdown でコピーする', () => {
  it('画像 URL で ![](src) を生成する', () => {
    const result = imageTemplate('', 'https://example.com/photo.png');
    expect(result).toBe('![](https://example.com/photo.png)');
  });
});

describe('ユースケース: 複雑な記事ページのコピー', () => {
  it('見出し + コードブロック + テーブル + リスト + 引用が混在するページを変換する', () => {
    const complexHtml = `
      <article>
        <h1>Advanced Guide</h1>
        <p>This guide covers <strong>advanced topics</strong>.</p>
        <h2>Code Examples</h2>
        <pre><code class="language-typescript">const greeting: string = "Hello";</code></pre>
        <blockquote>Important: Always use strict mode.</blockquote>
        <h2>Data Table</h2>
        <table>
          <thead><tr><th>Method</th><th>Returns</th></tr></thead>
          <tbody><tr><td>map</td><td>Array</td></tr></tbody>
        </table>
        <h2>Steps</h2>
        <ol>
          <li>Install dependencies</li>
          <li>Configure TypeScript</li>
          <li>Write tests</li>
        </ol>
      </article>
    `;

    const body = htmlToMarkdown(complexHtml);
    const result = pageTemplate('Advanced Guide', 'https://docs.example.com', body);

    // タイトルとソースリンク
    expect(result).toContain('# Advanced Guide');
    expect(result).toContain('> Source: [Advanced Guide](https://docs.example.com)');

    // インライン要素
    expect(result).toContain('**advanced topics**');

    // コードブロック（言語付き）
    expect(result).toContain('```typescript');
    expect(result).toContain('const greeting: string = "Hello";');
    expect(result).toContain('```');

    // 引用
    expect(result).toContain('> Important: Always use strict mode.');

    // テーブル
    expect(result).toContain('| Method | Returns |');
    expect(result).toContain('| map | Array |');

    // 番号付きリスト
    expect(result).toContain('1. Install dependencies');
    expect(result).toContain('2. Configure TypeScript');
    expect(result).toContain('3. Write tests');
  });

  it('ネストしたリストと画像とリンクが混在するコンテンツを変換する', () => {
    const html = `
      <div>
        <h2>Resources</h2>
        <ul>
          <li>Official docs:
            <ul>
              <li><a href="https://ts.dev">TypeScript</a></li>
              <li><a href="https://vitejs.dev">Vite</a></li>
            </ul>
          </li>
          <li>Images: <img src="https://example.com/logo.svg" alt="Logo"></li>
        </ul>
      </div>
    `;
    const result = selectionTemplate(htmlToMarkdown(html));

    expect(result).toContain('## Resources');
    expect(result).toContain('[TypeScript](https://ts.dev)');
    expect(result).toContain('[Vite](https://vitejs.dev)');
    expect(result).toContain('![Logo](https://example.com/logo.svg)');
  });
});

describe('ユースケース: 相対URLを含むコンテンツのコピー', () => {
  const baseUrl = 'https://docs.example.com/guide/intro.html';

  it('相対リンクと相対画像を含む選択テキストを絶対URLで出力する', () => {
    const html = `
      <p>Read the <a href="/api/reference">API docs</a> and see the
      <img src="../images/diagram.png" alt="Architecture Diagram">.</p>
    `;
    const result = selectionTemplate(htmlToMarkdown(html, baseUrl));

    expect(result).toContain('[API docs](https://docs.example.com/api/reference)');
    expect(result).toContain('![Architecture Diagram](https://docs.example.com/images/diagram.png)');
  });

  it('ページ全体コピー時に相対URLが解決される', () => {
    const pageHtml = `
      <article>
        <h1>Getting Started</h1>
        <p>See <a href="setup.html">Setup Guide</a>.</p>
        <img src="/assets/logo.png" alt="Logo">
      </article>
    `;
    const body = htmlToMarkdown(pageHtml, baseUrl);
    const result = pageTemplate('Getting Started', baseUrl, body);

    expect(result).toContain('[Setup Guide](https://docs.example.com/guide/setup.html)');
    expect(result).toContain('![Logo](https://docs.example.com/assets/logo.png)');
  });
});
