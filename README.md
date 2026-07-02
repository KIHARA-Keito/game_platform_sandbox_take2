# ミニゲームプラットフォーム

フロントエンドのみで動くシンプルなミニゲームプラットフォーム。データの永続化はなし。

## 技術スタック

- [Vite 5](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)(`@tailwindcss/vite` プラグイン経由)
- ゲームは Canvas / DOM 直書き(ゲームエンジン不使用)

## 開発

```sh
npm install
npm run dev      # 開発サーバー (http://localhost:5173)
npm run build    # 型チェック + 本番ビルド
npm run lint     # ESLint
```

## ディレクトリ構成

```
src/
  games/           # 各ゲーム(自己完結モジュール)
    types.ts       # GameDefinition インターフェース
    registry.ts    # ゲームの登録一覧
    tic-tac-toe/   # サンプル: マルバツゲーム
  platform/        # 共通UI(ゲーム一覧、ゲーム画面コンテナ)
  App.tsx          # 一覧 ↔ ゲーム画面の切り替え
```

## ゲームの追加方法

1. `src/games/<ゲーム名>/index.tsx` にゲームコンポーネントを作成(default export)
2. `src/games/registry.ts` の `games` 配列に `GameDefinition` を追加

これだけで一覧ページにカードが表示され、遊べるようになります。
