# ABYSSAL DRIFT TV

添付HTMLをAndroid TV向けWebViewアプリとして包んだ最小Android Studioプロジェクトです。

## 構成

```text
AbyssalDriftTv/
  settings.gradle
  build.gradle
  app/
    build.gradle
    src/main/
      AndroidManifest.xml
      assets/index.html
      java/com/example/abyssaldrift/MainActivity.java
      res/
```

## ビルド方法

1. Android Studioでこのフォルダを開く
2. Gradle Syncを実行
3. `Build > Build Bundle(s) / APK(s) > Build APK(s)` を実行
4. 生成されたAPKをAndroid TVへインストール

ADBで入れる場合:

```bash
adb connect <Android TVのIPアドレス>:5555
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## 操作

- リモコンの決定ボタン / Enter / 再生一時停止: HUD表示・非表示
- Back: アプリを閉じてホームへ戻る

## 注意

`assets/index.html` は外部CDNや外部Webフォントを参照しない構成です。Three.js、チャイム音源、任意の数字フォントは `app/src/main/assets/` 配下のローカルアセットとして配置してください。

- `three.min.js` はローカル同梱済みです。上流Three.js r128へ差し替える場合も、同じパス `app/src/main/assets/three.min.js` に配置してください。
- 数字フォントの `.woff2` が未配置の場合はシステムフォントへフォールバックします。
- `audio/chime.mp3` が未配置または再生不可の場合はWeb Audio APIの簡易チャイムへフォールバックします。

## 追加機能（AndroidTVからの移植）

AbyssalDriftTvの深海UI / Three.js表現 / HUD構成は維持したまま、AndroidTV側の機能ロジックを部品として移植しています。

### チャイム機能

- `09:20` / `11:30` / `12:30` / `17:45` にチャイムを再生します。
- 音源は `app/src/main/assets/audio/chime.mp3` を参照します。
- `chime.mp3` が存在しない、読み込めない、またはWebViewの自動再生制限などで再生できない場合は、Web Audio APIで簡易チャイムを生成してフォールバック再生します。
- 同じ日付・同じ時刻では1回だけ再生し、同じ分内の連続再生を防ぎます。
- チャイム時は深海UIに合わせた控えめなToastを約2.5秒表示します。
- DevTools / WebViewデバッグでは次のコマンドでテスト再生できます。

```javascript
window.playTestChime()
```

### 数字フォントプリセット

時計数字のフォントプリセットを切り替えられます。

- `readable`
- `soft`
- `handwritten`
- `design`

操作:

- Android TVリモコンの右キー、またはキーボードの `ArrowRight`: 次のプリセットへ切替
- Android TVリモコンの左キー、またはキーボードの `ArrowLeft`: 前のプリセットへ切替

仕様:

- 選択中のプリセットは `localStorage` に保存され、次回起動時に復元されます。
- 切替時だけ `Font: Readable` のようなToastを約2秒表示します。
- `data-font-preset="readable"` のような属性を `html` / `body` / 時計パネルへ付与し、CSS変数で時計数字に適用します。
- `app/src/main/assets/fonts/readable.woff2`、`soft.woff2`、`handwritten.woff2`、`design.woff2` が存在する場合は優先利用し、存在しない場合はシステムフォントへフォールバックします。

### Innovation Lab表示

画面右下に `Created by Innovation Lab` を探査機・深海観測装置の刻印のように控えめに常時表示します。

- `aria-hidden="true"` を付与しています。
- `pointer-events: none` で操作を妨げません。
- 焼き付き対策として低めのopacity相当の色指定にしています。

## オフラインアセット

アプリ本体は外部CDN、外部API、外部Webフォントに依存しない構成です。

- Three.js互換のローカル `app/src/main/assets/three.min.js` を同梱しています。必要に応じて上流Three.js r128の同名ファイルへ差し替えできます。
- チャイム音源は `app/src/main/assets/audio/chime.mp3` としてローカル配置してください。
- 数字フォントを移植する場合は `app/src/main/assets/fonts/*.woff2` に配置してください。未配置でもシステムフォントで表示されます。

補助スクリプト:

```bash
python3 tools/localize_three.py
```

このスクリプトはネットワーク接続が許可された環境で上流Three.js r128を取得し、同梱の `three.min.js` を差し替える用途で利用できます。

## 確認手順

1. Android StudioでGradle Sync後、APKをビルドします。
2. Android TV / WebViewで起動し、従来の深海アニメーション、時計、カレンダーが表示されることを確認します。
3. リモコン右/左キー、またはキーボードの `ArrowRight` / `ArrowLeft` で時計数字のフォントが切り替わり、Toastが表示されることを確認します。
4. アプリを再起動し、最後に選んだフォントプリセットが復元されることを確認します。
5. DevToolsで `window.playTestChime()` を実行し、MP3またはWeb Audio APIフォールバックのチャイムが鳴ることを確認します。
6. `audio/chime.mp3` を一時的にリネームしても、画面が止まらずフォールバックチャイムが鳴ることを確認します。
7. 右下に `Created by Innovation Lab` が控えめに表示され、時計やToastの邪魔をしないことを確認します。
