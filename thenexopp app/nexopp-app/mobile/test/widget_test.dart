import 'dart:io';
import 'dart:ui' as ui;
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:thenexopp_agent/core/constants/api_constants.dart';
import 'package:thenexopp_agent/core/network/dio_client.dart';
import 'package:thenexopp_agent/core/storage/secure_storage_service.dart';
import 'package:thenexopp_agent/core/theme/app_theme.dart';
import 'package:thenexopp_agent/core/widgets/partner_ui.dart';
import 'package:thenexopp_agent/features/auth/login_screen.dart';
import 'package:thenexopp_agent/features/auth/otp_verification_screen.dart';
import 'package:thenexopp_agent/features/earnings/earnings_screen.dart';
import 'package:thenexopp_agent/features/home/home_dashboard_screen.dart';
import 'package:thenexopp_agent/features/profile/profile_screen.dart';
import 'package:thenexopp_agent/features/profile/verification_details_screen.dart';
import 'package:thenexopp_agent/features/profile/terms_privacy_screen.dart';
import 'package:thenexopp_agent/features/onboarding/profile_onboarding_screen.dart';
import 'package:thenexopp_agent/features/onboarding/kyc_onboarding_screen.dart';
import 'package:thenexopp_agent/features/onboarding/bank_onboarding_screen.dart';
import 'package:thenexopp_agent/features/properties/properties_list_screen.dart';
import 'package:thenexopp_agent/features/splash/splash_screen.dart';
import 'package:thenexopp_agent/features/support/support_screen.dart';
import 'package:thenexopp_agent/shared/providers/dio_provider.dart';

class MemoryStorage extends SecureStorageService {
  @override
  Future<String?> getAccessToken() async => null;
}

const listing = {
  'id': 'listing-1',
  'title': 'The Palm Residences',
  'location': 'Jubilee Hills, Hyderabad',
  'category': 'RESIDENTIAL',
  'status': 'APPROVED',
  'price': 12500000,
  'specifications': {'bhk': '3 BHK', 'areaSqFt': 1800},
  'images': <String>[],
};

DioClient fixtureClient(
    {bool fail = false,
    List<String>? requests,
    bool emptyVerification = false}) {
  final client = DioClient(secureStorage: MemoryStorage());
  client.dio.interceptors.clear();
  client.dio.interceptors
      .add(InterceptorsWrapper(onRequest: (options, handler) {
    requests?.add(options.uri.toString());
    if (fail) {
      handler.reject(DioException(
          requestOptions: options, type: DioExceptionType.connectionError));
      return;
    }
    dynamic data;
    if (options.path == ApiConstants.getProfile) {
      data = {
        'profile': {
          'fullName': 'Priya Sharma',
          'areaLocation': 'Hyderabad',
          'workPlatform': 'Property consultant'
        },
        'mobileNumber': '9876543210',
        'status': 'APPROVED',
        'kycStatus': 'APPROVED',
        'bankStatus': 'VERIFIED'
      };
    } else if (options.path == ApiConstants.kycDetails) {
      data = emptyVerification
          ? {'status': 'NOT_SUBMITTED'}
          : {
              'status': 'APPROVED',
              'aadhaarMasked': 'XXXX XXXX 6728',
              'panMasked': 'XXXXX4567Q',
            };
    } else if (options.path == ApiConstants.bankDetails) {
      data = emptyVerification
          ? null
          : {
              'accountLast4': 'XXXX XXXX 7654',
              'ifscCode': 'SBIN0004321',
              'upiId': 'partner@example',
              'phonepeNumber': '9876500000',
              'isVerified': true,
            };
    } else if (options.path == ApiConstants.earnings) {
      data = {
        'summary': {
          'totalEarnings': 248500,
          'pendingEarnings': 42500,
          'paidAmount': 206000,
          'thisMonthEarnings': 38000
        },
        'earnings': [
          {
            'title': 'Palm Residences commission',
            'status': 'PAID',
            'amount': 25000,
            'earnedDate': '2026-10-20'
          }
        ]
      };
    } else if (options.path.startsWith(ApiConstants.properties)) {
      data =
          options.uri.queryParameters['status'] == 'REJECTED' ? [] : [listing];
    } else {
      data = <dynamic>[];
    }
    handler.resolve(Response(
        requestOptions: options,
        statusCode: 200,
        data: {'success': true, 'data': data}));
  }));
  return client;
}

Future<void> renderScreen(
  WidgetTester tester,
  Widget screen, {
  double width = 390,
  double textScale = 1,
  bool fail = false,
  bool emptyVerification = false,
  List<String>? requests,
  int? tab,
}) async {
  tester.view.physicalSize = Size(width, 844);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
  await tester.pumpWidget(ProviderScope(
      overrides: [
        dioClientProvider.overrideWithValue(fixtureClient(
            fail: fail,
            requests: requests,
            emptyVerification: emptyVerification)),
        secureStorageProvider.overrideWithValue(MemoryStorage()),
      ],
      child: MaterialApp(
        theme: AppTheme.lightTheme,
        builder: (context, child) => MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaler: TextScaler.linear(textScale)),
            child: child!),
        home: RepaintBoundary(
            key: const ValueKey('preview'),
            child: tab == null
                ? screen
                : Scaffold(
                    body: screen,
                    bottomNavigationBar:
                        PartnerNavigation(index: tab, onChanged: (_) {}))),
      )));
  await tester.runAsync(() async {
    await GoogleFonts.pendingFonts();
  });
  await tester.runAsync(() async {
    for (final image in tester.widgetList<Image>(find.byType(Image))) {
      await precacheImage(
          image.image, tester.element(find.byType(Image).first));
    }
  });
  await tester.pump(const Duration(milliseconds: 500));
}

Future<void> capture(WidgetTester tester, String name) async {
  if (!const bool.fromEnvironment('CAPTURE_PREMIUM_PREVIEWS')) return;
  final boundary = tester.renderObject<RenderRepaintBoundary>(
      find.byKey(const ValueKey('preview')));
  await tester.runAsync(() async {
    final image = await boundary.toImage(pixelRatio: 2);
    final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
    final file = File('build/premium-previews/$name.png');
    await file.parent.create(recursive: true);
    await file.writeAsBytes(bytes!.buffer.asUint8List());
    image.dispose();
  });
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  GoogleFonts.config.allowRuntimeFetching = false;
  setUpAll(() async {
    final loader = FontLoader('MaterialIcons');
    loader.addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'));
    await loader.load();
  });

  testWidgets('Welcome presents an accessible get-started button',
      (tester) async {
    await renderScreen(tester, const SplashScreen());
    expect(find.text('Great spaces.\nGreater possibilities.'), findsOneWidget);
    expect(find.widgetWithText(ElevatedButton, 'Get started'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await capture(tester, 'welcome');
  });

  testWidgets('Login validates the phone number before making a request',
      (tester) async {
    final requests = <String>[];
    await renderScreen(tester, const LoginScreen(), requests: requests);
    await capture(tester, 'sign-in');
    await tester.ensureVisible(find.text('Continue securely'));
    await tester.tap(find.text('Continue securely'));
    await tester.pumpAndSettle();
    expect(find.text('Enter a valid 10-digit mobile number'), findsOneWidget);
    expect(requests, isEmpty);
    await tester.ensureVisible(find.text('Need help signing in?'));
    await tester.tap(find.text('Need help signing in?'));
    await tester.pumpAndSettle();
    expect(find.text('Partner Support'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Dashboard displays server earnings and actual portfolio counts',
      (tester) async {
    await renderScreen(tester, const HomeDashboardScreen(), tab: 0);
    expect(find.text('Priya Sharma'), findsOneWidget);
    expect(find.text('₹2,48,500'), findsOneWidget);
    expect(find.text('₹42,500'), findsOneWidget);
    expect(find.text('All listings'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await capture(tester, 'dashboard');
  });

  testWidgets(
      'Dashboard failure offers retry without displaying fake zero balances',
      (tester) async {
    await renderScreen(tester, const HomeDashboardScreen(), fail: true);
    expect(find.text('Retry'), findsOneWidget);
    expect(find.byType(PartnerBalanceCard), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Listings search and status filters update the result',
      (tester) async {
    final requests = <String>[];
    await renderScreen(tester, const PropertiesListScreen(),
        tab: 1, requests: requests);
    expect(find.text('The Palm Residences'), findsOneWidget);
    expect(find.text('3 BHK · 1800 sq ft'), findsOneWidget);
    await capture(tester, 'listings');
    await tester.enterText(find.byType(TextField), 'No matching place');
    await tester.pumpAndSettle();
    expect(find.text('No matching listings'), findsOneWidget);
    await tester.enterText(find.byType(TextField), '');
    await tester.drag(find.byType(ListView).first, const Offset(-400, 0));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Rejected'));
    await tester.tap(find.text('Rejected'));
    await tester.pumpAndSettle();
    expect(
        requests.any((request) => request.contains('status=REJECTED')), isTrue);
    expect(find.byType(PartnerListingCard), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
      'Earnings handles large values on a narrow phone with enlarged text',
      (tester) async {
    await renderScreen(tester, const EarningsScreen(),
        width: 320, textScale: 1.3, tab: 2);
    expect(find.text('₹42,500'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
      'OTP inputs fit a narrow screen and remain scrollable above keyboard',
      (tester) async {
    await renderScreen(tester, const OtpVerificationScreen(),
        width: 320, textScale: 1.2);
    expect(find.text('Let’s make it you.'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pumpAndSettle();
  });

  testWidgets(
      'Profile uses real verification states and support fits the same shell',
      (tester) async {
    await renderScreen(tester, const ProfileScreen(),
        width: 320, textScale: 1.2, tab: 4);
    expect(find.text('Priya Sharma'), findsOneWidget);
    expect(find.textContaining('1234'), findsNothing);
    expect(tester.takeException(), isNull);
    await renderScreen(tester, const SupportScreen(), tab: 3);
    expect(find.text('How can we help?'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
      'Profile KYC arrow opens saved masked details and returns with back',
      (tester) async {
    final requests = <String>[];
    await renderScreen(tester, const ProfileScreen(), requests: requests);
    await tester.scrollUntilVisible(find.text('Identity & KYC'), 250,
        scrollable: find.byType(Scrollable).first);
    await tester.tap(find.text('Identity & KYC'));
    await tester.pumpAndSettle();
    expect(find.byType(VerificationDetailsScreen), findsOneWidget);
    expect(
        requests.any((url) => url.contains(ApiConstants.kycDetails)), isTrue);
    expect(find.text('XXXX XXXX 6728'), findsOneWidget);
    expect(find.text('XXXXX4567Q'), findsOneWidget);
    expect(find.textContaining('1234'), findsNothing);
    expect(tester.takeException(), isNull);
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.byType(ProfileScreen), findsOneWidget);
  });

  testWidgets('Profile bank arrow opens the current payout account',
      (tester) async {
    final requests = <String>[];
    await renderScreen(tester, const ProfileScreen(), requests: requests);
    await tester.scrollUntilVisible(find.text('Bank account'), 250,
        scrollable: find.byType(Scrollable).first);
    await tester.tap(find.text('Bank account'));
    await tester.pumpAndSettle();
    expect(find.text('Bank & payout details'), findsOneWidget);
    expect(
        requests.any((url) => url.contains(ApiConstants.bankDetails)), isTrue);
    expect(find.text('XXXX XXXX 7654'), findsOneWidget);
    expect(find.text('SBIN0004321'), findsOneWidget);
    expect(find.text('partner@example'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.byType(ProfileScreen), findsOneWidget);
  });

  testWidgets('Profile support arrow opens the support screen', (tester) async {
    await renderScreen(tester, const ProfileScreen());
    await tester.scrollUntilVisible(find.text('Agent help & support'), 250,
        scrollable: find.byType(Scrollable).first);
    await tester.tap(find.text('Agent help & support'));
    await tester.pumpAndSettle();
    expect(find.byType(SupportScreen), findsOneWidget);
    expect(find.text('How can we help?'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.byType(ProfileScreen), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
      'Profile terms arrow opens readable in-app terms and privacy documents',
      (tester) async {
    await renderScreen(tester, const ProfileScreen());
    await tester.scrollUntilVisible(find.text('Terms & privacy'), 250,
        scrollable: find.byType(Scrollable).first);
    await tester.tap(find.text('Terms & privacy'));
    await tester.pumpAndSettle();
    expect(find.byType(TermsPrivacyScreen), findsOneWidget);
    await tester.tap(find.text('Terms & conditions'));
    await tester.pumpAndSettle();
    expect(find.text('1. About the service'), findsOneWidget);
    expect(find.text('Draft for review'.toUpperCase()), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    await tester.tap(find.text('Privacy policy'));
    await tester.pumpAndSettle();
    expect(
        find.text('1. Registration and account information'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.byType(ProfileScreen), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
      'A failed verification request shows retry and sends another request',
      (tester) async {
    final requests = <String>[];
    await renderScreen(tester,
        const VerificationDetailsScreen(kind: VerificationDetailsKind.kyc),
        fail: true, requests: requests);
    expect(find.text('Retry'), findsOneWidget);
    expect(find.text('XXXX XXXX 1234'), findsNothing);
    await tester.tap(find.text('Retry'));
    await tester.pumpAndSettle();
    expect(requests.length, 2);
    expect(tester.takeException(), isNull);
  });

  for (final kind in VerificationDetailsKind.values) {
    testWidgets(
        '${kind.name} details handle missing records and narrow screens',
        (tester) async {
      await renderScreen(tester, VerificationDetailsScreen(kind: kind),
          emptyVerification: true, width: 320, textScale: 1.3);
      expect(
          find.text(kind == VerificationDetailsKind.kyc
              ? 'No KYC details submitted'
              : 'No bank details submitted'),
          findsOneWidget);
      expect(find.text('Contact partner support'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets(
      'Profile sign out opens confirmation and cancellation keeps the profile open',
      (tester) async {
    await renderScreen(tester, const ProfileScreen());
    await tester.scrollUntilVisible(find.text('Sign out'), 250,
        scrollable: find.byType(Scrollable).first);
    await tester.tap(find.text('Sign out'));
    await tester.pumpAndSettle();
    expect(find.text('Sign out?'), findsOneWidget);
    await tester.tap(find.text('Stay here'));
    await tester.pumpAndSettle();
    expect(find.text('Sign out?'), findsNothing);
    await tester.tap(find.byTooltip('Sign out'));
    await tester.pumpAndSettle();
    expect(find.text('Sign out?'), findsOneWidget);
    await tester.tap(find.text('Stay here'));
    await tester.pumpAndSettle();
    expect(find.byType(ProfileScreen), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  for (final screen in <Widget>[
    const ProfileOnboardingScreen(),
    const KycOnboardingScreen(),
    const BankOnboardingScreen(),
  ]) {
    testWidgets('${screen.runtimeType} fits a narrow phone with larger text',
        (tester) async {
      await renderScreen(tester, screen, width: 320, textScale: 1.2);
      expect(find.byType(PartnerOnboardingProgress), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }
  testWidgets('All five navigation destinations are labelled and tappable',
      (tester) async {
    int selected = 0;
    await tester.pumpWidget(MaterialApp(
        theme: AppTheme.lightTheme,
        home: Scaffold(
            bottomNavigationBar: PartnerNavigation(
                index: 0, onChanged: (value) => selected = value))));
    await tester.tap(find.text('Earnings'));
    expect(selected, 2);
    for (final label in [
      'Home',
      'Listings',
      'Earnings',
      'Support',
      'Profile'
    ]) {
      expect(find.text(label), findsOneWidget);
    }
  });
}
