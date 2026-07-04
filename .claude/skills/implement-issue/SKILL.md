---
name: implement-issue
description: 指定した GitHub Issue の内容をフロントエンドコードに実装する。Issue 番号を引数で指定する（例 /implement-issue 12）。
argument-hint: "[Issue番号]"
---

# Issue の内容を実装する

対象 Issue: `$ARGUMENTS`（番号が渡されていない場合は、`gh issue list --state open` の一覧を提示してどれを実装するかユーザーに確認してから進める）

このリポジトリは React 18 + TypeScript + Vite + Tailwind CSS v4 のフロントエンドプロジェクト。

## 手順

1. **Issue の内容を把握する**
   - `gh issue view <番号> --comments` でタイトル・本文・コメントを読む。
   - 要件が曖昧で実装方針が複数考えられる場合のみ、ユーザーに方針を確認する。明確なら確認せず進める。

2. **作業ブランチを切る**
   - main 上で作業しない。`git checkout -b issue-<番号>-<短い英語スラッグ>` を main から作成する。
   - 作業ツリーに未コミットの変更がある場合は中断してユーザーに報告する。

3. **実装する**
   - 関連コードを読み、既存の構成・命名・スタイルに合わせて実装する:
     - ゲーム本体は `src/games/<ゲーム名>/` に置き、`src/games/types.ts` の型に従う
     - 新しいゲームは `src/games/registry.ts` に登録する
     - プラットフォーム UI（一覧・画面枠）は `src/platform/` 配下
     - スタイリングは Tailwind のユーティリティクラスを使う
   - Issue のスコープ外の変更（ついでのリファクタリング等）はしない。

4. **検証する**
   - `npm run lint` と `npm run build` を通す。
   - 動作確認が必要な変更なら `npm run dev` で起動して実際の挙動を確認する。

5. **コミットして報告する**
   - 変更をコミットする。コミットメッセージ本文に `refs #<番号>` を含める。
   - ユーザーへの報告: 実装内容の要約、変更ファイル一覧、検証結果（lint/build/動作確認）、Issue との差分（実装しなかった点があればその理由）。
   - push や PR 作成、Issue のクローズはユーザーから指示された場合のみ行う。
