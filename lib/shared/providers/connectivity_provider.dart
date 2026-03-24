/// Provides a reactive stream of online / offline connectivity status.
library;

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'connectivity_provider.g.dart';

/// Emits `true` when the device has network connectivity and `false`
/// when it is offline.
///
/// Uses the `connectivity_plus` plugin under the hood.
@riverpod
Stream<bool> connectivityStatus(Ref ref) {
  final connectivity = Connectivity();

  return connectivity.onConnectivityChanged.map((results) {
    // connectivity_plus v6 returns List<ConnectivityResult>.
    return results.any((r) => r != ConnectivityResult.none);
  });
}
