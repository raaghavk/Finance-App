import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:paisa_track/app.dart';
import 'package:paisa_track/bootstrap.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final container = await bootstrap();

  runApp(
    UncontrolledProviderScope(
      container: container,
      child: const PaisaTrackApp(),
    ),
  );
}
