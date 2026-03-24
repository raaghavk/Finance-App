import 'dart:async';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:paisa_track/data/remote/supabase/supabase_client.dart';

/// High-level authentication service built on top of Supabase Auth.
class SupabaseAuthService {
  SupabaseAuthService()
      : _client = AppSupabaseClient.I.instance;

  final SupabaseClient _client;

  GoTrueClient get _auth => _client.auth;

  // ── Email / Password ─────────────────────────────────────────────────

  /// Register a new user with email and password.
  Future<AuthResponse> signUpWithEmail({
    required String email,
    required String password,
  }) {
    return _auth.signUp(
      email: email,
      password: password,
    );
  }

  /// Sign in with an existing email and password.
  Future<AuthResponse> signInWithEmail({
    required String email,
    required String password,
  }) {
    return _auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  // ── Social / OAuth ───────────────────────────────────────────────────

  /// Sign in with Google OAuth.
  Future<bool> signInWithGoogle() {
    return _auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: 'io.supabase.paisatrack://login-callback/',
    );
  }

  // ── Session management ───────────────────────────────────────────────

  /// Sign the current user out.
  Future<void> signOut() {
    return _auth.signOut();
  }

  /// The currently authenticated user, or `null`.
  User? getCurrentUser() {
    return _auth.currentUser;
  }

  /// Whether a user is currently signed in.
  bool get isSignedIn => _auth.currentUser != null;

  /// Stream of authentication state changes.
  ///
  /// Emits whenever the user signs in, signs out, or the token refreshes.
  Stream<AuthState> watchAuthState() {
    return _auth.onAuthStateChange;
  }
}
