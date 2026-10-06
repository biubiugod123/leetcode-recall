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

> `npm run build` reads LeetCode notes from a Mac path. On any other machine it writes an empty `problems.json` — use `npm run build:bagugu` there.

### Update 八股文

Source lives in `content/八股文/<大类>/<小类>.md` (override with `BAGUGU_DIR`).

1. Edit the markdown
2. Run `npm run build:bagugu` (only touches `dist/bagugu.json`)
3. Bump `CACHE_NAME` in `dist/sw.js`, commit and push

Each `### 标题` is one knowledge point. Besides the original fields (`概念` / `详细解释` / `问题` / `答案要点` / `对比` / `常见陷阱` / `追问`), it supports:

````markdown
**一句话**：30 秒能说完的回答

**对比**：
| | A | B |
|---|---|---|
| 维度 | ... | ... |

**代码题**：下面代码输出什么？

```java
System.out.println(5 / 2);
```

- [x] 2
- [ ] 2.5

解析：int / int 是整数除法

**判断题**：
- ✅ 正确的说法 —— 理由
- ❌ 错误的说法 —— 理由
````

In the app every knowledge point becomes several cards — one concept-recall card plus one card per 代码题 / 判断题 — each with its own spaced-repetition schedule.

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
