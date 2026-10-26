# TheNexopp Agent mobile app

Flutter application for the TheNexopp partner network.

The interface uses an ivory and forest-green palette, bundled Plus Jakarta Sans typography, accessible labelled navigation, and shared financial, listing and verification components. Welcome, phone sign-in, OTP, dashboard, listings, earnings, profile, support and the three account setup steps share this design system.

Existing API endpoints, authentication routing, listing submissions, payout receipts and live event subscriptions are retained. Profile verification labels use the server response; failed dashboard requests show a retry state instead of a misleading empty balance.

Profile menu actions open read-only KYC and bank details from the existing agent APIs, partner support, and in-app Terms & Privacy documents. Account identifiers remain masked. The policy text is a project-based draft that needs business and legal review before publication.

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

## Android photo access

Gallery uploads use `image_picker` system pickers and access only selected files. No broad photo, video or shared-storage permissions are requested. Manifest merger removal rules prevent dependencies from adding these permissions back. Camera and location permissions remain available for their separate features.

Before a Play upload, inspect the merged release manifest and the packaged AAB/APK permissions. Version 1.0.2 (code 3) replaces the affected version codes 1 and 2; update every affected active release or testing track in Play Console rather than retaining an older noncompliant bundle in the submission.
