/// Consistent spacing system for PaisaTrack.
///
/// Provides spacing constants, convenience SizedBox widgets, and
/// EdgeInsets presets for a cohesive layout rhythm throughout the app.
library;

import 'package:flutter/material.dart';

abstract final class AppSpacing {
  // ══════════════════════════════════════════════════════════════════════════
  // SPACING SCALE
  // ══════════════════════════════════════════════════════════════════════════

  /// 4.0
  static const double xs = 4;

  /// 8.0
  static const double sm = 8;

  /// 12.0
  static const double md = 12;

  /// 16.0
  static const double lg = 16;

  /// 24.0
  static const double xl = 24;

  /// 32.0
  static const double xxl = 32;

  /// 48.0
  static const double xxxl = 48;

  // ══════════════════════════════════════════════════════════════════════════
  // BORDER RADIUS
  // ══════════════════════════════════════════════════════════════════════════

  /// Cards, containers: 16
  static const double radiusCard = 16;

  /// Buttons, inputs: 12
  static const double radiusButton = 12;

  /// Chips, tags, badges: 24
  static const double radiusChip = 24;

  /// Bottom sheets: 24
  static const double radiusBottomSheet = 24;

  /// Dialogs: 20
  static const double radiusDialog = 20;

  /// Convenience [BorderRadius] constants.
  static final BorderRadius borderRadiusCard =
      BorderRadius.circular(radiusCard);
  static final BorderRadius borderRadiusButton =
      BorderRadius.circular(radiusButton);
  static final BorderRadius borderRadiusChip =
      BorderRadius.circular(radiusChip);
  static final BorderRadius borderRadiusBottomSheet =
      BorderRadius.circular(radiusBottomSheet);
  static final BorderRadius borderRadiusDialog =
      BorderRadius.circular(radiusDialog);

  // ══════════════════════════════════════════════════════════════════════════
  // HORIZONTAL SPACERS
  // ══════════════════════════════════════════════════════════════════════════

  static const SizedBox horizontalSpaceXs = SizedBox(width: xs);
  static const SizedBox horizontalSpaceSm = SizedBox(width: sm);
  static const SizedBox horizontalSpaceMd = SizedBox(width: md);
  static const SizedBox horizontalSpaceLg = SizedBox(width: lg);
  static const SizedBox horizontalSpaceXl = SizedBox(width: xl);
  static const SizedBox horizontalSpaceXxl = SizedBox(width: xxl);

  // ══════════════════════════════════════════════════════════════════════════
  // VERTICAL SPACERS
  // ══════════════════════════════════════════════════════════════════════════

  static const SizedBox verticalSpaceXs = SizedBox(height: xs);
  static const SizedBox verticalSpaceSm = SizedBox(height: sm);
  static const SizedBox verticalSpaceMd = SizedBox(height: md);
  static const SizedBox verticalSpaceLg = SizedBox(height: lg);
  static const SizedBox verticalSpaceXl = SizedBox(height: xl);
  static const SizedBox verticalSpaceXxl = SizedBox(height: xxl);
  static const SizedBox verticalSpaceXxxl = SizedBox(height: xxxl);

  // ══════════════════════════════════════════════════════════════════════════
  // EDGE INSETS PRESETS
  // ══════════════════════════════════════════════════════════════════════════

  /// Standard screen padding: horizontal 16, vertical 8.
  static const EdgeInsets screenPadding =
      EdgeInsets.symmetric(horizontal: lg, vertical: sm);

  /// Card internal padding: 16 all sides.
  static const EdgeInsets cardPadding = EdgeInsets.all(lg);

  /// Compact card padding: 12 all sides.
  static const EdgeInsets cardPaddingCompact = EdgeInsets.all(md);

  /// List item padding: horizontal 16, vertical 12.
  static const EdgeInsets listItemPadding =
      EdgeInsets.symmetric(horizontal: lg, vertical: md);

  /// Section padding: horizontal 16, vertical 24.
  static const EdgeInsets sectionPadding =
      EdgeInsets.symmetric(horizontal: lg, vertical: xl);

  /// Dialog content padding.
  static const EdgeInsets dialogPadding = EdgeInsets.all(xl);

  /// Bottom sheet padding.
  static const EdgeInsets bottomSheetPadding =
      EdgeInsets.fromLTRB(lg, sm, lg, xl);

  /// Button padding (internal).
  static const EdgeInsets buttonPadding =
      EdgeInsets.symmetric(horizontal: xl, vertical: md);

  /// Chip padding (internal).
  static const EdgeInsets chipPadding =
      EdgeInsets.symmetric(horizontal: md, vertical: xs);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE MARGINS
  // ══════════════════════════════════════════════════════════════════════════

  /// Horizontal margin for all pages.
  static const double pageMarginHorizontal = lg;

  /// Vertical margin for all pages.
  static const double pageMarginVertical = sm;
}
