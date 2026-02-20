# 📋 Copy as Markdown

> Copy web content as clean Markdown with one right-click.

A Chrome extension that converts selected text, links, images, or entire pages into well-formatted Markdown and copies it to your clipboard.

## ✨ Features

- **Selection → Markdown**: Select any text on a page, right-click → "Copy Selection as Markdown"
- **Link → `[text](url)`**: Right-click any link → "Copy Link as Markdown"
- **Image → `![alt](src)`**: Right-click any image → "Copy Image as Markdown"
- **Full Page → Markdown**: Right-click on page → "Copy Page as Markdown"
- **Rich HTML Support**: Tables, code blocks, nested lists, blockquotes, headings — all converted faithfully
- **Absolute URL Resolution**: Relative links and images are automatically resolved to absolute URLs
- **Keyboard Shortcuts**: `Cmd+Shift+C` (copy selection), `Cmd+Shift+M` (copy page)
- **CSS-Isolated Notifications**: Shadow DOM toast that works on any page without style interference
- **Accessible**: Screen reader support via `aria-live` notifications

## 🏗️ Architecture

```
src/
├── background.ts           # Service Worker — context menu registration
├── content.ts              # Content Script — DOM extraction & clipboard
├── lib/
│   ├── html-to-markdown.ts # Core conversion engine (no external deps)
│   └── templates.ts        # Output formatting templates
└── popup/
    ├── popup.html           # Extension popup UI
    ├── popup.ts             # Popup event handling
    └── popup.css            # Popup styling (dark theme)
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

### Build

```bash
# Build for Chrome
bash build.sh
```

### Load in Chrome

1. Run `bash build.sh`
2. Open `chrome://extensions/`
3. Enable **Developer mode**
4. Click **"Load unpacked"** → select the `dist/` directory
5. Right-click on any page to test

## 📊 Test Coverage

| Test Suite               | Tests  | Status             |
| ------------------------ | ------ | ------------------ |
| html-to-markdown.test.ts | 35     | ✅                 |
| templates.test.ts        | 10     | ✅                 |
| scenario.test.ts         | 12     | ✅                 |
| **Total**                | **57** | **✅ All Passing** |

### Test Categories

- **Unit Tests**: Core HTML→Markdown conversion (headings, inline elements, links, images, lists, tables, code blocks, blockquotes, HR, entities)
- **Unit Tests**: Template functions (page, link, image, selection)
- **Scenario Tests**: End-to-end user workflows (selection copy, page copy, complex article conversion)

## 📦 Tech Stack

| Component | Technology     |
| --------- | -------------- |
| API       | Manifest V3    |
| Language  | TypeScript     |
| Build     | esbuild        |
| Testing   | Vitest + jsdom |
| Styling   | Vanilla CSS    |

## 🗂️ Supported Conversions

| HTML Element      | Markdown Output           |
| ----------------- | ------------------------- |
| `<h1>`–`<h6>`     | `#` – `######`            |
| `<strong>`, `<b>` | `**bold**`                |
| `<em>`, `<i>`     | `*italic*`                |
| `<del>`, `<s>`    | `~~strikethrough~~`       |
| `<code>`          | `` `inline code` ``       |
| `<pre><code>`     | ` ```code block``` `      |
| `<a href="...">`  | `[text](url)`             |
| `<img>`           | `![alt](src)`             |
| `<ul>`, `<ol>`    | `-` / `1.` (with nesting) |
| `<blockquote>`    | `>`                       |
| `<table>`         | Markdown table            |
| `<hr>`            | `---`                     |
| `<br>`            | Line break                |

## 📝 License

MIT
