import 'package:flutter/material.dart';

/// A full-screen overlay with a transparent rectangular cut-out in the centre
/// acting as a guide for aligning a receipt. Corner markers are drawn around
/// the cut-out (similar to QR-code scanner guides).
class ReceiptOverlay extends StatelessWidget {
  const ReceiptOverlay({
    this.overlayColor = Colors.black54,
    this.borderColor = Colors.white,
    this.cornerLength = 28.0,
    this.cornerWidth = 3.5,
    this.hintText = 'Align receipt within the frame',
    super.key,
  });

  /// Semi-transparent colour painted outside the guide rectangle.
  final Color overlayColor;

  /// Colour of the corner markers.
  final Color borderColor;

  /// Length of each corner line.
  final double cornerLength;

  /// Stroke width of the corner lines.
  final double cornerWidth;

  /// Instruction text shown below the guide area.
  final String hintText;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // The guide rectangle occupies ~80% width and ~55% height, centred.
        final guideWidth = constraints.maxWidth * 0.80;
        final guideHeight = constraints.maxHeight * 0.55;
        final left = (constraints.maxWidth - guideWidth) / 2;
        final top = (constraints.maxHeight - guideHeight) / 2;
        final guideRect =
            Rect.fromLTWH(left, top, guideWidth, guideHeight);

        return Stack(
          children: [
            // Semi-transparent overlay with clear cut-out.
            CustomPaint(
              size: Size(constraints.maxWidth, constraints.maxHeight),
              painter: _OverlayPainter(
                guideRect: guideRect,
                overlayColor: overlayColor,
              ),
            ),
            // Corner markers.
            CustomPaint(
              size: Size(constraints.maxWidth, constraints.maxHeight),
              painter: _CornerPainter(
                guideRect: guideRect,
                color: borderColor,
                cornerLength: cornerLength,
                strokeWidth: cornerWidth,
              ),
            ),
            // Hint text below the guide.
            Positioned(
              left: 0,
              right: 0,
              top: guideRect.bottom + 24,
              child: Text(
                hintText,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white.withOpacity(0.85),
                    ),
              ),
            ),
          ],
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Custom painters
// ---------------------------------------------------------------------------

/// Paints a semi-transparent overlay with a clear rectangular hole.
class _OverlayPainter extends CustomPainter {
  _OverlayPainter({
    required this.guideRect,
    required this.overlayColor,
  });

  final Rect guideRect;
  final Color overlayColor;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = overlayColor;

    // Full-screen path minus the guide rectangle.
    final fullScreen = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height));
    final guidePath = Path()
      ..addRRect(
        RRect.fromRectAndRadius(guideRect, const Radius.circular(12)),
      );

    final combined = Path.combine(PathOperation.difference, fullScreen, guidePath);
    canvas.drawPath(combined, paint);
  }

  @override
  bool shouldRepaint(_OverlayPainter oldDelegate) =>
      guideRect != oldDelegate.guideRect ||
      overlayColor != oldDelegate.overlayColor;
}

/// Paints corner bracket markers around the guide rectangle.
class _CornerPainter extends CustomPainter {
  _CornerPainter({
    required this.guideRect,
    required this.color,
    required this.cornerLength,
    required this.strokeWidth,
  });

  final Rect guideRect;
  final Color color;
  final double cornerLength;
  final double strokeWidth;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final l = guideRect.left;
    final t = guideRect.top;
    final r = guideRect.right;
    final b = guideRect.bottom;
    final cl = cornerLength;

    // Top-left corner
    canvas.drawLine(Offset(l, t + cl), Offset(l, t), paint);
    canvas.drawLine(Offset(l, t), Offset(l + cl, t), paint);

    // Top-right corner
    canvas.drawLine(Offset(r - cl, t), Offset(r, t), paint);
    canvas.drawLine(Offset(r, t), Offset(r, t + cl), paint);

    // Bottom-left corner
    canvas.drawLine(Offset(l, b - cl), Offset(l, b), paint);
    canvas.drawLine(Offset(l, b), Offset(l + cl, b), paint);

    // Bottom-right corner
    canvas.drawLine(Offset(r - cl, b), Offset(r, b), paint);
    canvas.drawLine(Offset(r, b), Offset(r, b - cl), paint);
  }

  @override
  bool shouldRepaint(_CornerPainter oldDelegate) =>
      guideRect != oldDelegate.guideRect ||
      color != oldDelegate.color ||
      cornerLength != oldDelegate.cornerLength ||
      strokeWidth != oldDelegate.strokeWidth;
}
