# 概要

React + WebAudioAPI を使ったシンセサイザーのアプリです。 動作は
https://web-audio-synthesizer.vercel.app/ で確認できます。

# 設計

## コンポーネント

- parts: 最小限の UI コンポーネント
- circuits: 振舞いを興味ごとに纏めたコンポーネント
- controls: parts と circuits を用いた操作を表現できるコンポーネント

## SVG-based Components

画像素材を極力、使わないことで読み込み時間の短縮と CSS
による表現の恩恵を受けています。

<!-- ## Written in SCSS

Tailwind ではなく SCSS を使うことでコンポーネントの可読性を高めています。 -->

# アプリケーションの起動

ルートディレクトリで下記のコマンドを実行してください。

```shell
npm start
```
