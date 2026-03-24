import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/features/receipt_ocr/providers/ocr_provider.dart';
import 'package:paisa_track/features/receipt_ocr/presentation/widgets/receipt_overlay.dart';

/// Full-screen camera screen for capturing receipt photos.
///
/// Displays a live camera preview with a receipt alignment overlay, capture
/// button, flash toggle, and gallery picker. After capture shows a preview
/// with "Use This" / "Retake" options before proceeding to review.
class CameraScreen extends ConsumerStatefulWidget {
  const CameraScreen({super.key});

  @override
  ConsumerState<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends ConsumerState<CameraScreen>
    with WidgetsBindingObserver {
  CameraController? _cameraController;
  List<CameraDescription> _cameras = [];
  bool _isInitialized = false;
  bool _isTakingPicture = false;
  FlashMode _flashMode = FlashMode.auto;

  // Preview state after capture.
  String? _capturedPath;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initCamera();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }
    if (state == AppLifecycleState.inactive) {
      _cameraController?.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initCamera();
    }
  }

  Future<void> _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No camera available')),
          );
        }
        return;
      }

      // Prefer the back camera.
      final camera = _cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.back,
        orElse: () => _cameras.first,
      );

      _cameraController = CameraController(
        camera,
        ResolutionPreset.high,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.jpeg,
      );

      await _cameraController!.initialize();
      await _cameraController!.setFlashMode(_flashMode);

      if (mounted) {
        setState(() => _isInitialized = true);
      }
    } catch (e) {
      debugPrint('Camera init error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to initialise camera: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // ── Captured image preview mode ────────────────────────────
    if (_capturedPath != null) {
      return _buildPreview(context, theme, colorScheme);
    }

    // ── Live camera mode ───────────────────────────────────────
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Camera preview
          if (_isInitialized && _cameraController != null)
            Center(
              child: CameraPreview(_cameraController!),
            )
          else
            const Center(
              child: CircularProgressIndicator(color: Colors.white),
            ),

          // Receipt alignment overlay
          const ReceiptOverlay(),

          // ── Top controls ─────────────────────────────────────
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            left: 8,
            right: 8,
            child: Row(
              children: [
                IconButton(
                  icon:
                      const Icon(Icons.close, color: Colors.white, size: 28),
                  onPressed: () => context.pop(),
                ),
                const Spacer(),
                // Flash toggle
                IconButton(
                  icon: Icon(
                    _flashIcon,
                    color: Colors.white,
                    size: 28,
                  ),
                  onPressed: _toggleFlash,
                ),
              ],
            ),
          ),

          // ── Bottom controls ──────────────────────────────────
          Positioned(
            bottom: MediaQuery.of(context).padding.bottom + 24,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                // Gallery pick
                _CircleButton(
                  icon: Icons.photo_library_outlined,
                  size: 52,
                  onTap: _pickFromGallery,
                ),
                // Capture
                _CaptureButton(
                  onTap: _isInitialized && !_isTakingPicture
                      ? _takePicture
                      : null,
                ),
                // Spacer to balance the row
                const SizedBox(width: 52),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Preview after capture ──────────────────────────────────────────────

  Widget _buildPreview(
    BuildContext context,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.file(
            File(_capturedPath!),
            fit: BoxFit.contain,
          ),
          // Actions at the bottom.
          Positioned(
            bottom: MediaQuery.of(context).padding.bottom + 24,
            left: 24,
            right: 24,
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white),
                    ),
                    onPressed: _retake,
                    child: const Text('Retake'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: FilledButton(
                    onPressed: () => _useImage(context),
                    child: const Text('Use This'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Actions ────────────────────────────────────────────────────────────

  Future<void> _takePicture() async {
    if (_cameraController == null || _isTakingPicture) return;

    setState(() => _isTakingPicture = true);

    try {
      final XFile file = await _cameraController!.takePicture();
      setState(() {
        _capturedPath = file.path;
        _isTakingPicture = false;
      });
    } catch (e) {
      setState(() => _isTakingPicture = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Capture failed: $e')),
        );
      }
    }
  }

  Future<void> _pickFromGallery() async {
    final notifier = ref.read(ocrNotifierProvider.notifier);
    await notifier.pickFromGallery();

    final state = ref.read(ocrNotifierProvider);
    if (state.imagePath != null && mounted) {
      context.push(AppRoutes.receiptReview);
    }
  }

  void _retake() {
    setState(() => _capturedPath = null);
  }

  void _useImage(BuildContext context) {
    if (_capturedPath == null) return;

    final notifier = ref.read(ocrNotifierProvider.notifier);
    notifier.processImage(_capturedPath!);

    if (context.mounted) {
      context.push(AppRoutes.receiptReview);
    }
  }

  void _toggleFlash() {
    if (_cameraController == null) return;
    setState(() {
      _flashMode = switch (_flashMode) {
        FlashMode.auto => FlashMode.always,
        FlashMode.always => FlashMode.off,
        FlashMode.off => FlashMode.auto,
        _ => FlashMode.auto,
      };
    });
    _cameraController!.setFlashMode(_flashMode);
  }

  IconData get _flashIcon => switch (_flashMode) {
        FlashMode.auto => Icons.flash_auto,
        FlashMode.always => Icons.flash_on,
        FlashMode.off => Icons.flash_off,
        _ => Icons.flash_auto,
      };
}

// ---------------------------------------------------------------------------
// Small helper widgets
// ---------------------------------------------------------------------------

class _CaptureButton extends StatelessWidget {
  const _CaptureButton({this.onTap});

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 72,
        height: 72,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 4),
        ),
        padding: const EdgeInsets.all(4),
        child: Container(
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}

class _CircleButton extends StatelessWidget {
  const _CircleButton({
    required this.icon,
    required this.onTap,
    this.size = 48,
  });

  final IconData icon;
  final VoidCallback onTap;
  final double size;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withOpacity(0.2),
        ),
        child: Icon(icon, color: Colors.white, size: size * 0.5),
      ),
    );
  }
}
