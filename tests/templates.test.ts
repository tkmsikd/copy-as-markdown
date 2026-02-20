import { describe, it, expect } from 'vitest';
import {
  pageTemplate,
  linkTemplate,
  imageTemplate,
  selectionTemplate,
} from '../src/lib/templates';

describe('templates', () => {
  describe('pageTemplate', () => {
    it('タイトル・ソースリンク・本文を含むテンプレートを生成する', () => {
      const result = pageTemplate('My Page', 'https://example.com', 'Body content');
      expect(result).toBe(
        '# My Page\n\n> Source: [My Page](https://example.com)\n\nBody content'
      );
    });

    it('本文が空の場合はタイトルとソースのみ返す', () => {
      const result = pageTemplate('Empty', 'https://example.com', '');
      expect(result).toBe('# Empty\n\n> Source: [Empty](https://example.com)');
    });

    it('タイトルが空の場合は Untitled を使用する', () => {
      const result = pageTemplate('', 'https://example.com', 'Content');
      expect(result).toBe(
        '# Untitled\n\n> Source: [Untitled](https://example.com)\n\nContent'
      );
    });
  });

  describe('linkTemplate', () => {
    it('[text](url) 形式のリンクを生成する', () => {
      expect(linkTemplate('Example', 'https://example.com'))
        .toBe('[Example](https://example.com)');
    });

    it('テキストが空の場合は URL をテキストとして使う', () => {
      expect(linkTemplate('', 'https://example.com'))
        .toBe('[https://example.com](https://example.com)');
    });
  });

  describe('imageTemplate', () => {
    it('![alt](src) 形式の画像マークダウンを生成する', () => {
      expect(imageTemplate('Photo', 'https://example.com/img.jpg'))
        .toBe('![Photo](https://example.com/img.jpg)');
    });

    it('alt が空の場合は空の alt を使う', () => {
      expect(imageTemplate('', 'https://example.com/img.jpg'))
        .toBe('![](https://example.com/img.jpg)');
    });
  });

  describe('selectionTemplate', () => {
    it('変換済み Markdown をそのまま返す', () => {
      expect(selectionTemplate('**bold** text')).toBe('**bold** text');
    });

    it('前後の空白をトリムする', () => {
      expect(selectionTemplate('  hello  ')).toBe('hello');
    });

    it('空文字列は空文字列を返す', () => {
      expect(selectionTemplate('')).toBe('');
    });
  });
});
