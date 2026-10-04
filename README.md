---
title: Neon Serpent Snake Game
emoji: 🐍
colorFrom: green
colorTo: blue
sdk: static
app_build_command: npm run build
app_file: dist/index.html
pinned: false
fullWidth: true
---

# 🐍 Neon Serpent — Modern Snake Game

React + Vite + Tailwind CSS 製作的現代化貪吃蛇遊戲。

![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## 試玩

本地啟動後開 `http://localhost:3000`

## 本地開發

```bash
npm install
npm run dev
```

Windows（portable Node，不需安裝）：直接雙擊 `start.bat`

## 驗證 build

```bash
npm run typecheck
npm run build
```

Windows：雙擊 `build.bat`

## 遊戲操作

- ↑↓←→ / WASD：移動
- Space：暫停 / 開始
- R：重置
- 手機支援滑動 + 虛擬方向鍵

## 部署

### GitHub Pages（推薦）

1. Push 到 GitHub
2. 到 Repo → Settings → Pages → Source 選 `GitHub Actions`
3. 本專案已內建 `.github/workflows/deploy.yml`，push 到 `master`/`main` 會自動 build 並部署
4. 網址：`https://<你的帳號>.github.io/<repo 名>/`

### Hugging Face Spaces (Static，所有收費變動後仍免費)

`README` 頂部保留 HF 所需的 frontmatter 時亦可直接推到 Static Space：

```yaml
sdk: static
app_build_command: npm run build
app_file: dist/index.html
```

## 專案結構

```text
src/
  App.tsx
  main.tsx
  index.css
  types.ts
  components/GameBoard.tsx
  hooks/useSnakeGame.ts
```

