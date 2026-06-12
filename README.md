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

現状の `assets/index.html` は、元HTMLと同じくThree.jsとGoogle FontsをCDNから読み込みます。そのため `INTERNET` 権限を入れています。
完全オフライン化する場合は、次の手順を実施してください。

1. `three.min.js` を `app/src/main/assets/three.min.js` として配置
2. `app/src/main/assets/index.html` の下記を変更

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

```html
<script src="three.min.js"></script>
```

Google Fontsは読み込めなくてもシステムフォントへフォールバックします。
