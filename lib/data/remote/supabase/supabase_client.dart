import 'dart:async';

import 'package:supabase_flutter/supabase_flutter.dart';

/// Singleton wrapper around the Supabase client.
///
/// Call [initialize] once at app startup before accessing [instance].
class AppSupabaseClient {
  AppSupabaseClient._();

  static final AppSupabaseClient _singleton = AppSupabaseClient._();

  /// The shared singleton instance.
  static AppSupabaseClient get I => _singleton;

  SupabaseClient? _client;

  StreamSubscription<AuthState>? _authSubscription;

  /// Whether the client has been initialised.
  bool get isInitialized => _client != null;

  /// The underlying [SupabaseClient]. Throws if not yet initialised.
  SupabaseClient get instance {
    final client = _client;
    if (client == null) {
      throw StateError(
        'AppSupabaseClient has not been initialized. '
        'Call AppSupabaseClient.I.initialize() first.',
      );
    }
    return client;
  }

  /// Initialise the Supabase client with your project URL and anon key.
  ///
  /// Typically called once in `main()`.
  Future<void> initialize({
    required String url,
    required String anonKey,
  }) async {
    await Supabase.initialize(
      url: url,
      anonKey: anonKey,
    );
    _client = Supabase.instance.client;

    // Listen for auth state changes globally.
    _authSubscription = _client!.auth.onAuthStateChange.listen(
      _onAuthStateChange,
    );
  }

  /// Dispose resources when the app is shutting down.
  void dispose() {
    _authSubscription?.cancel();
    _authSubscription = null;
  }

  void _onAuthStateChange(AuthState state) {
    // Hook point for downstream listeners (e.g. trigger sync on sign-in).
    // Individual services can subscribe to the stream directly via
    // `instance.auth.onAuthStateChange`.
  }
}
