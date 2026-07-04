---
name: add-tests
description: 実装した変更内容を分析し、必要であればテストを追加する。対象は引数で指定でき、省略時は直近の変更（未コミットの diff または直近コミット）を対象にする。
argument-hint: "[対象ファイル/ブランチ/コミット（省略時は直近の変更）]"
---

# 実装内容に基づくテスト追加

対象: `$ARGUMENTS`（省略時は `git diff` → 空なら `git diff main...HEAD` → それも空なら直近コミットの順で変更を特定する）

## 手順

1. **変更内容を把握する**
   - 対象の diff を読み、何が実装されたかを理解する。関連する既存コードも読む。

2. **テストが必要か判断する**
   - テストする価値があるもの: ゲームロジック（勝敗判定・状態遷移）、ユーティリティ関数、条件分岐のあるコンポーネントの挙動、バグ修正（回帰テスト）
   - テスト不要なもの: 純粋な見た目・スタイルのみの変更、設定ファイル、単純な JSX の構造変更
   - **不要と判断した場合はテストを書かず、その理由を報告して終える。** 無理にテストをひねり出さない。

3. **テスト環境がなければセットアップする**
   - `package.json` に test スクリプトやテストランナーがあるか確認する。
   - 未導入なら Vitest + React Testing Library を導入する（Vite プロジェクトのため）:
     ```sh
     npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
     ```
     - `vite.config.ts` に `test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' }` を追加（ファイル先頭を `import { defineConfig } from 'vitest/config'` に変更）
     - `src/test/setup.ts` を作成し `import '@testing-library/jest-dom'` を記述
     - `package.json` に `"test": "vitest run"` と `"test:watch": "vitest"` を追加
     - `tsconfig.app.json` の `types` に `vitest/globals` は追加せず、テストファイルでは明示的に import する

4. **テストを書く**
   - テストファイルは対象ファイルの隣に `<対象名>.test.ts(x)` として置く。
   - 実装の内部構造ではなく、外から見た振る舞いをテストする（ロジックは入出力、コンポーネントはユーザー操作と表示結果）。
   - 変更で追加された分岐・境界条件をカバーする。カバレッジの数字合わせのためのテストは書かない。
   - 既存のテストがある場合はその書き方・命名に合わせる。

5. **実行して検証・報告する**
   - `npm test` を実行し、全テストが通ることを確認する。落ちたら修正する（テストの誤りか実装のバグかを見極め、実装のバグならユーザーに報告して指示を仰ぐ）。
   - 報告内容: 追加したテストファイルと各テストの観点、実行結果、テスト不要と判断した変更があればその理由。
