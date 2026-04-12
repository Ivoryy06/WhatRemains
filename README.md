# What Remains

A personal keepsake web app for capturing year-end memories — built as a single-page, offline-capable experience with no backend required.

![What Remains](https://img.shields.io/badge/offline-ready-brightgreen) ![License](https://img.shields.io/badge/license-see%20LICENSE-blue)

## Features

- **Memory card** — fill in your name, class, graduation year, dream, a meaningful memory, and a message to your future self
- **Profile photo** — upload and crop your photo with a built-in cropper
- **Memory gallery** — add multiple photos, drag to reorder, click to view fullscreen
- **Download card** — export your memory card as a PNG image
- **Background customizer** — pick from preset gradients or enter your own CSS gradient
- **Dark / light theme** — toggle with one click, preference is saved
- **Auto-save** — all fields save to `localStorage` automatically as you type
- **Clear all data** — wipe everything with a single button (with confirmation)
- **Toast notifications** — subtle feedback for every action
- **Fully offline** — no server, no account, no data leaves your device

## Usage

Just open `index.html` in any modern browser. No build step, no dependencies to install.

```
WhatRemains/
├── index.html   # markup
├── style.css    # styles
├── script.js    # logic
└── LICENSE
```

Data is stored in your browser's `localStorage` (text fields, avatar, theme, background) and `IndexedDB` (gallery photos). Clearing browser data will erase everything.

## External Libraries (CDN)

| Library | Version | Purpose |
|---|---|---|
| [Cropper.js](https://github.com/fengyuanchen/cropperjs) | 1.5.13 | Profile photo cropping |
| [html2canvas](https://html2canvas.hertzen.com/) | 1.4.1 | Card download as PNG |

## License

See [LICENSE](LICENSE).
