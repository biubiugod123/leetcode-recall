# LeetCode Recall Trainer - PWA Version

🧠 Active recall training for LeetCode problems. Works offline!

## Features

- ✅ Fully offline capable (PWA)
- ✅ Install on iOS/Android/Desktop
- ✅ Spaced repetition (SM-2 algorithm)
- ✅ Progress saved locally (localStorage)
- ✅ Auto-updates when you push new problems

## Usage

### Local Development

```bash
# Build problems.json from SecondBrain/LeetCode
npm run build

# Serve locally
npm run serve
# Open http://localhost:5180
```

### Deployment

Push to GitHub → GitHub Actions auto-deploys to GitHub Pages.

### Update Problems

1. Add/edit notes in `SecondBrain/LeetCode/`
2. Run `npm run build`
3. Commit and push
4. PWA auto-updates on next visit

## Structure

```
leetcode-recall-pwa/
├── dist/                 # Built files (served by GitHub Pages)
│   ├── index.html
│   ├── problems.json     # Generated from markdown
│   ├── manifest.json
│   └── sw.js             # Service Worker
├── scripts/
│   └── build.js          # Markdown → JSON converter
└── package.json
```

## Install as App

- **iOS**: Safari → Share → "Add to Home Screen"
- **Android**: Chrome → Menu → "Install App"
- **Desktop**: Chrome → URL bar install icon
