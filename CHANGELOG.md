# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-20

### Added

- Keyboard shortcuts: `Cmd+Shift+C` (copy selection), `Cmd+Shift+M` (copy page)
- Relative URL resolution — all relative links and images are converted to absolute URLs on copy
- Keyboard shortcuts section in popup UI with styled `<kbd>` elements

### Changed

- Toast notification refactored to use **Shadow DOM** for CSS isolation from host pages
- Added `role="status"` and `aria-live="polite"` to notification for screen reader accessibility
- Refactored background.ts to share `sendToActiveTab` helper across context menus and shortcuts

### Testing

- 57 automated tests (35 unit + 10 template + 12 scenario), all passing

## [1.0.0] - 2026-02-20

### Added

- HTML to Markdown conversion engine with support for:
  - Headings (h1–h6)
  - Inline formatting (bold, italic, strikethrough, inline code)
  - Links and images
  - Ordered and unordered lists (with nesting)
  - Code blocks with language detection
  - Tables with header/body support
  - Blockquotes
  - Horizontal rules
  - HTML entity decoding
- Context menu integration:
  - Copy Selection as Markdown
  - Copy Link as Markdown
  - Copy Page as Markdown
  - Copy Image as Markdown
- Popup UI with quick action buttons
- Toast notification on successful copy
- Clipboard fallback for environments without Clipboard API
- 47 automated tests (unit + scenario)
