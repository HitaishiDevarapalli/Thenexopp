# TheNexopp Agent mobile app

Flutter application for the TheNexopp partner network.

The interface uses an ivory and forest-green palette, bundled Plus Jakarta Sans typography, accessible labelled navigation, and shared financial, listing and verification components. Welcome, phone sign-in, OTP, dashboard, listings, earnings, profile, support and the three account setup steps share this design system.

Existing API endpoints, authentication routing, listing submissions, payout receipts and live event subscriptions are retained. Profile verification labels use the server response; failed dashboard requests show a retry state instead of a misleading empty balance.

## Run

```powershell
flutter pub get
flutter run
```

## Validate and preview

```powershell
flutter analyze
flutter test --dart-define=CAPTURE_PREMIUM_PREVIEWS=true
flutter build apk --debug
```

The tests cover phone validation, API-backed dashboard values, error feedback, listing search and status requests, narrow layouts with enlarged text, OTP layout, profile verification and navigation. Preview PNGs are written to `build/premium-previews/`; their names and balances are test fixtures, not live account data.

The Android preview is built at `build/app/outputs/flutter-apk/app-debug.apk`. This debug build is for review; production release signing remains configured in `android/app/build.gradle.kts`.

Font files and their SIL Open Font License are included in `assets/fonts/`.
