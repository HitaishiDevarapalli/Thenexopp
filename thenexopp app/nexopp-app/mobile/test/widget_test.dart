import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:thenexopp_agent/main.dart';
import 'package:thenexopp_agent/features/splash/splash_screen.dart';

void main() {
  testWidgets('App initializes cleanly and renders splash with SwipeToStartSlider', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: TheNexoppAgentApp(),
      ),
    );

    expect(find.byType(SplashScreen), findsOneWidget);
    expect(find.byType(SwipeToStartSlider), findsOneWidget);
  });
}

