# Native builds (Capacitor)

Zenith is the same static web app on Vercel / PWA and inside a native WebView. This repo scaffolds **iOS + Android** with Capacitor so you can wrap that UI later. **Do not submit to the App Store yet.** TestFlight is the iOS target when you are ready; Play internal testing is the Android target.

The live iPhone path today is still **Safari → Add to Home Screen** on HTTPS (see the README). Capacitor is the next slice.

## What this scaffold includes

- `capacitor.config.json` — `appId` `app.zenith.finance`, `appName` Zenith, `webDir` `www`
- `@capacitor/splash-screen` — cool blue `#2563EB` splash, auto-hide
- `@capacitor/status-bar` — overlays the WebView (`overlaysWebView: true`) so CSS `env(safe-area-inset-*)` + `viewport-fit=cover` own the notches
- `lib/capacitor-bridge.js` — hide splash, force native chrome (never the fake iPhone bezel)
- `resources/icon.png` (1024) and `resources/splash.png` (2732) — white Z on `#2563EB`
- Generated `ios/` and `android/` projects (open these in Xcode / Android Studio on your machine)

Vercel is unchanged: `vercel.json` still rewrites `/api/*` and serves static HTML. Do not point Capacitor `webDir` at `api/`.

## One-time machine setup

### Both platforms

```bash
npm install
npm run cap:sync
```

`cap:sync` copies the web app into `www/` then into each native project. Re-run it whenever `index.html`, `app.jsx`, components, or `lib/` change.

### iOS (macOS + Xcode only)

This Linux environment cannot archive or open the iOS project. On a Mac:

1. Install **Xcode** from the Mac App Store and open it once to accept the license.
2. Install CocoaPods: `sudo gem install cocoapods` (or Homebrew `brew install cocoapods`).
3. From the repo: `cd ios/App && pod install && cd ../..`
4. `npx cap open ios` — or open `ios/App/App.xcworkspace` (workspace, not the `.xcodeproj`).
5. In Xcode:
   - Signing & Capabilities → your Apple Development team
   - Bundle ID is `app.zenith.finance` (change only if that ID is taken)
   - Run on a simulator or a plugged-in iPhone

First launch still loads React / Babel from unpkg (same as the web app), so the device needs network for the shell. The ledger stays in `localStorage` (`zenith_v1_store`) and does not need Notion.

### TestFlight (later — not this PR)

When you want internal iOS testers:

1. Xcode → Product → Archive.
2. Organizer → Distribute App → **App Store Connect** → **TestFlight Internal Only** (or “Upload”).
3. In App Store Connect: create the app record if needed, wait for processing, add internal testers.
4. **Stop there.** Do not submit for App Store review. No screenshots, privacy nutrition labels, or review notes for the public store in this slice.

### Android (Android Studio)

1. Install [Android Studio](https://developer.android.com/studio) and the Android SDK.
2. `npx cap open android` or open the `android/` folder.
3. Run on an emulator or device.
4. Internal testing later: Build → Generate Signed Bundle / APK, then Play Console **internal testing** track. Not production listing work in this slice.

## Icons and splash

Source art lives in `resources/`:

| File | Size | Use |
| --- | --- | --- |
| `resources/icon.png` | 1024×1024 | App icon (iOS / Android / adaptive foreground) |
| `resources/splash.png` | 2732×2732 | Launch splash, `#2563EB` + Z |

Regenerate platform copies after changing those files:

```bash
npx capacitor-assets generate
npm run cap:sync
```

PWA icons in `icons/` (180 / 192 / 512) stay the web/Add to Home Screen set.

## Safe areas

Native mode is the default (`html[data-zenith-chrome="native"]`):

- `viewport-fit=cover`
- `--zenith-pad-top: calc(env(safe-area-inset-top, 0px) + 12px)`
- `--zenith-pad-bottom: calc(96px + env(safe-area-inset-bottom, 0px))`
- Status bar overlays the WebView; iOS `contentInset` is `never` so WKWebView does not double-pad

The fake iPhone frame never shows in Capacitor (`Capacitor.isNativePlatform()`), on `*.vercel.app`, or in PWA standalone.

## What not to do yet

- Do not submit to the **App Store**
- Do not submit to **Play production**
- Do not change the live Vercel/PWA path as part of native work
- Do not enable Notion in the native shell by default — local-first still applies
