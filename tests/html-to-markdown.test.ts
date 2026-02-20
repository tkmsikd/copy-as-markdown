import { describe, it, expect } from 'vitest';
import { htmlToMarkdown } from '../src/lib/html-to-markdown';

describe('htmlToMarkdown', () => {
  describe('基本テキスト変換', () => {
    it('プレーンテキストはそのまま返す', () => {
      expect(htmlToMarkdown('Hello World')).toBe('Hello World');
    });

    it('空文字列は空文字列を返す', () => {
      expect(htmlToMarkdown('')).toBe('');
    });

    it('前後の空白をトリムする', () => {
      expect(htmlToMarkdown('  Hello  ')).toBe('Hello');
    });
  });

  describe('見出し変換', () => {
    it('h1 を # に変換する', () => {
      expect(htmlToMarkdown('<h1>Title</h1>')).toBe('# Title');
    });

    it('h2 を ## に変換する', () => {
      expect(htmlToMarkdown('<h2>Subtitle</h2>')).toBe('## Subtitle');
    });

    it('h3 を ### に変換する', () => {
      expect(htmlToMarkdown('<h3>Section</h3>')).toBe('### Section');
    });

    it('h4-h6 を対応する # レベルに変換する', () => {
      expect(htmlToMarkdown('<h4>H4</h4>')).toBe('#### H4');
      expect(htmlToMarkdown('<h5>H5</h5>')).toBe('##### H5');
      expect(htmlToMarkdown('<h6>H6</h6>')).toBe('###### H6');
    });
  });

  describe('インライン要素変換', () => {
    it('strong/b を ** に変換する', () => {
      expect(htmlToMarkdown('<strong>bold</strong>')).toBe('**bold**');
      expect(htmlToMarkdown('<b>bold</b>')).toBe('**bold**');
    });

    it('em/i を * に変換する', () => {
      expect(htmlToMarkdown('<em>italic</em>')).toBe('*italic*');
      expect(htmlToMarkdown('<i>italic</i>')).toBe('*italic*');
    });

    it('code をバッククォートに変換する', () => {
      expect(htmlToMarkdown('<code>const x = 1</code>')).toBe('`const x = 1`');
    });

    it('del/s を ~~ に変換する', () => {
      expect(htmlToMarkdown('<del>deleted</del>')).toBe('~~deleted~~');
      expect(htmlToMarkdown('<s>deleted</s>')).toBe('~~deleted~~');
    });
  });

  describe('リンク変換', () => {
    it('a タグを [text](url) に変換する', () => {
      expect(htmlToMarkdown('<a href="https://example.com">Example</a>'))
        .toBe('[Example](https://example.com)');
    });

    it('href のないリンクはテキストのみ返す', () => {
      expect(htmlToMarkdown('<a>No Link</a>')).toBe('No Link');
    });
  });

  describe('画像変換', () => {
    it('img を ![alt](src) に変換する', () => {
      expect(htmlToMarkdown('<img src="photo.jpg" alt="A photo">'))
        .toBe('![A photo](photo.jpg)');
    });

    it('alt がない場合は空文字を使う', () => {
      expect(htmlToMarkdown('<img src="photo.jpg">'))
        .toBe('![](photo.jpg)');
    });
  });

  describe('リスト変換', () => {
    it('ul の li を - に変換する', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
      expect(htmlToMarkdown(html)).toBe('- Item 1\n- Item 2\n- Item 3');
    });

    it('ol の li を番号付きに変換する', () => {
      const html = '<ol><li>First</li><li>Second</li><li>Third</li></ol>';
      expect(htmlToMarkdown(html)).toBe('1. First\n2. Second\n3. Third');
    });

    it('ネストしたリストを変換する', () => {
      const html = '<ul><li>Item 1<ul><li>Sub 1</li><li>Sub 2</li></ul></li><li>Item 2</li></ul>';
      expect(htmlToMarkdown(html)).toBe('- Item 1\n  - Sub 1\n  - Sub 2\n- Item 2');
    });
  });

  describe('段落・改行変換', () => {
    it('p タグを改行区切りに変換する', () => {
      const html = '<p>Paragraph 1</p><p>Paragraph 2</p>';
      expect(htmlToMarkdown(html)).toBe('Paragraph 1\n\nParagraph 2');
    });

    it('br タグを改行に変換する', () => {
      expect(htmlToMarkdown('Line 1<br>Line 2')).toBe('Line 1\nLine 2');
    });
  });

  describe('ブロック引用変換', () => {
    it('blockquote を > に変換する', () => {
      expect(htmlToMarkdown('<blockquote>Quoted text</blockquote>'))
        .toBe('> Quoted text');
    });
  });

  describe('コードブロック変換', () => {
    it('pre > code をコードブロックに変換する', () => {
      const html = '<pre><code>const x = 1;\nconst y = 2;</code></pre>';
      expect(htmlToMarkdown(html)).toBe('```\nconst x = 1;\nconst y = 2;\n```');
    });

    it('言語クラスがある場合はコードブロックに含める', () => {
      const html = '<pre><code class="language-javascript">const x = 1;</code></pre>';
      expect(htmlToMarkdown(html)).toBe('```javascript\nconst x = 1;\n```');
    });
  });

  describe('テーブル変換', () => {
    it('テーブルを Markdown テーブルに変換する', () => {
      const html = `
        <table>
          <thead><tr><th>Name</th><th>Age</th></tr></thead>
          <tbody><tr><td>Alice</td><td>30</td></tr><tr><td>Bob</td><td>25</td></tr></tbody>
        </table>
      `;
      const expected = '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |';
      expect(htmlToMarkdown(html)).toBe(expected);
    });
  });

  describe('水平線変換', () => {
    it('hr を --- に変換する', () => {
      expect(htmlToMarkdown('<hr>')).toBe('---');
    });
  });

  describe('複合コンテンツ', () => {
    it('見出し + 段落 + リストの複合コンテンツを変換する', () => {
      const html = '<h2>Title</h2><p>Some text with <strong>bold</strong>.</p><ul><li>Item 1</li><li>Item 2</li></ul>';
      const expected = '## Title\n\nSome text with **bold**.\n\n- Item 1\n- Item 2';
      expect(htmlToMarkdown(html)).toBe(expected);
    });
  });

  describe('HTML エンティティ', () => {
    it('&amp; &lt; &gt; をデコードする', () => {
      expect(htmlToMarkdown('Tom &amp; Jerry')).toBe('Tom & Jerry');
      expect(htmlToMarkdown('a &lt; b &gt; c')).toBe('a < b > c');
    });
  });

  describe('相対URL解決 (baseUrl)', () => {
    const baseUrl = 'https://example.com/blog/post.html';

    it('リンクの相対パスを絶対URLに解決する', () => {
      expect(htmlToMarkdown('<a href="/about">About</a>', baseUrl))
        .toBe('[About](https://example.com/about)');
    });

    it('画像の相対パスを絶対URLに解決する', () => {
      expect(htmlToMarkdown('<img src="/images/logo.png" alt="Logo">', baseUrl))
        .toBe('![Logo](https://example.com/images/logo.png)');
    });

    it('ディレクトリ相対パスを解決する', () => {
      expect(htmlToMarkdown('<a href="other.html">Other</a>', baseUrl))
        .toBe('[Other](https://example.com/blog/other.html)');
    });

    it('既に絶対URLの場合はそのままにする', () => {
      expect(htmlToMarkdown('<a href="https://other.com/page">Link</a>', baseUrl))
        .toBe('[Link](https://other.com/page)');
    });

    it('プロトコル相対URL (//) を解決する', () => {
      expect(htmlToMarkdown('<a href="//cdn.example.com/file.js">CDN</a>', baseUrl))
        .toBe('[CDN](https://cdn.example.com/file.js)');
    });

    it('baseUrl 未指定の場合はURLをそのまま使う', () => {
      expect(htmlToMarkdown('<a href="/about">About</a>'))
        .toBe('[About](/about)');
    });

    it('画像の相対パスも baseUrl 未指定ならそのまま使う', () => {
      expect(htmlToMarkdown('<img src="photo.jpg" alt="Photo">'))
        .toBe('![Photo](photo.jpg)');
    });

    it('フラグメントリンク (#) はそのまま保持する', () => {
      expect(htmlToMarkdown('<a href="#section-1">Section 1</a>', baseUrl))
        .toBe('[Section 1](#section-1)');
    });
  });
});
