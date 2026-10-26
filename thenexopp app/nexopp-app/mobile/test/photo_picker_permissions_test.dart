import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:thenexopp_agent/core/services/permission_service.dart';
import 'package:thenexopp_agent/features/properties/add_property_screen.dart';
import 'package:thenexopp_agent/features/onboarding/profile_onboarding_screen.dart';
import 'package:thenexopp_agent/features/onboarding/kyc_onboarding_screen.dart';
import 'widget_test.dart' as fixtures;

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  const permissionsChannel =
      MethodChannel('flutter.baseflow.com/permissions/methods');
  const pickerChannel = MethodChannel('plugins.flutter.io/image_picker');
  final broadPermissions = {
    Permission.photos.value,
    Permission.storage.value,
    Permission.videos.value,
    Permission.manageExternalStorage.value
  };
  final requestedPermissions = <int>[];
  final pickerCalls = <MethodCall>[];
  late File selectedImage;

  setUpAll(() async {
    GoogleFonts.config.allowRuntimeFetching = false;
    final loader = FontLoader('MaterialIcons')
      ..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'));
    await loader.load();
    selectedImage = File('build/photo-picker-test/selected.png').absolute;
    await selectedImage.parent.create(recursive: true);
    final image = await rootBundle.load('assets/images/app_logo.png');
    await selectedImage.writeAsBytes(image.buffer.asUint8List());
  });

  setUp(() {
    requestedPermissions.clear();
    pickerCalls.clear();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(permissionsChannel, (call) async {
      if (call.method == 'requestPermissions') {
        final ids = List<int>.from(call.arguments as List);
        requestedPermissions.addAll(ids);
        // Explicitly deny broad library/storage access to prove gallery
        // selection never depends on those permissions being granted.
        return {
          for (final id in ids) id: broadPermissions.contains(id) ? 0 : 1
        };
      }
      return 0;
    });
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(pickerChannel, (call) async {
      pickerCalls.add(call);
      return call.method == 'pickMultiImage'
          ? [selectedImage.path]
          : selectedImage.path;
    });
  });

  tearDown(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(permissionsChannel, null);
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(pickerChannel, null);
  });

  Future<void> choosePhoto(WidgetTester tester, Finder control) async {
    // Run the plugin callback and its file reads outside the fake widget clock.
    await tester.runAsync(() async {
      await tester.tap(control);
      await Future<void>.delayed(const Duration(milliseconds: 100));
    });
    await tester.pumpAndSettle();
    expect(requestedPermissions.where(broadPermissions.contains), isEmpty);
    expect(pickerCalls.last.arguments['requestFullMetadata'], false);
    expect(tester.takeException(), isNull);
  }

  testWidgets(
      'Property multi-photo selection works with broad library permissions denied',
      (tester) async {
    await fixtures.renderScreen(tester, const AddPropertyScreen());
    await tester.scrollUntilVisible(find.text('Add Photos'), 300,
        scrollable: find.byType(Scrollable).first);
    await choosePhoto(tester, find.text('Add Photos'));
    expect(pickerCalls.single.method, 'pickMultiImage');
    expect(find.text('1 Added'), findsOneWidget);
  });

  testWidgets(
      'Profile gallery selection uses the system picker without library access',
      (tester) async {
    await fixtures.renderScreen(tester, const ProfileOnboardingScreen());
    await tester.tap(find.text('Add Photo'));
    await tester.pumpAndSettle();
    await choosePhoto(tester, find.text('From Gallery'));
    expect(pickerCalls.single.method, 'pickImage');
    expect(pickerCalls.single.arguments['source'], ImageSource.gallery.index);
    expect(find.text('Photo Selected (Tap to Change)'), findsOneWidget);
  });

  testWidgets('KYC gallery selection uses only the selected document image',
      (tester) async {
    await fixtures.renderScreen(tester, const KycOnboardingScreen());
    await tester.scrollUntilVisible(
        find.text('Upload Aadhaar Document Photo'), 300,
        scrollable: find.byType(Scrollable).first);
    await tester.tap(find.text('Upload Aadhaar Document Photo'));
    await tester.pumpAndSettle();
    await choosePhoto(tester, find.text('Choose from Gallery'));
    expect(pickerCalls.single.method, 'pickImage');
    expect(find.textContaining('selected.png'), findsOneWidget);
  });

  testWidgets('Startup requests never ask for broad photo or storage access',
      (tester) async {
    await tester.pumpWidget(MaterialApp(
        home: Builder(
            builder: (context) => TextButton(
                onPressed: () =>
                    PermissionService.requestAllAppPermissions(context),
                child: const Text('Request app permissions')))));
    await tester.tap(find.text('Request app permissions'));
    await tester.pumpAndSettle();
    expect(requestedPermissions.where(broadPermissions.contains), isEmpty);
    expect(requestedPermissions, contains(Permission.notification.value));
  });
}
