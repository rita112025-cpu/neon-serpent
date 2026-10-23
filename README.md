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
- Space / Enter：開始、暫停、繼續、下一關
- P / Esc：暫停
- R：回到選單
- 手機支援滑動 + 虛擬方向鍵

## 遊戲內容

- 8 個關卡，依序解鎖：草原 → 花園圍籬 → 十字路口 → 傳送門 → 無盡迴廊（穿越邊界）→ 巡邏者 → 熔岩迷宮 → 終極之蛇
- 每關一首不同的背景音樂（Web Audio 即時合成，不需音檔）
- 特殊食物：金蘋果（+50）、冰晶（暫時減速）、縮小藥（尾巴變短），一段時間後消失
- 連續快速吃到食物會提高連擊倍率（最高 x5）
- 生命數依難度：簡單 5、中等 3、困難 2；撞到後從本關重來，已吃的進度保留

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
  App.tsx                 畫面組裝
  types.ts                共用型別
  game/                   純遊戲邏輯（不依賴 React，可單獨測試）
    engine.ts             每個 tick 的規則：移動、碰撞、吃食物、過關
    levels.ts             關卡資料（ASCII 地圖 + 參數 + 配色 + 配樂）
    compileLevel.ts       地圖解析與檢查（地圖寫錯會在載入時直接報錯）
    config.ts             難度、食物、連擊等可調參數
    grid.ts               座標工具
  audio/
    core.ts               AudioContext、音量與開關設定
    sfx.ts                音效
    tracks.ts             每關配樂的音符資料
    music.ts              配樂播放器
  hooks/
    useSnakeGame.ts       遊戲迴圈、狀態、存檔
    useControls.ts        鍵盤與滑動
    useAudio.ts           音訊設定、背景音樂
  components/             GameBoard、Hud、GameOverlay、DPad、AudioControls
```

### 新增關卡

1. 在 `src/game/levels.ts` 的 `LEVEL_DEFINITIONS` 加一筆，地圖圖例：`.` 空地、`#` 牆、`S` 起點（蛇頭朝右，身體往左兩格需為空地）、`1`–`9` 傳送門（同數字成對）、`H` 水平巡邏者、`V` 垂直巡邏者。
2. 在 `src/types.ts` 的 `TrackId` 加一個配樂代號，並在 `src/audio/tracks.ts` 寫對應的音符。
3. 跑 `npm run typecheck`：漏寫配樂會在型別檢查時報錯，地圖錯誤會在載入時報錯。

