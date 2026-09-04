#!/usr/bin/env bash
# Idempotent Cloud Agent install for PaisaTrack web development.
# Flutter 3.47.x is expected at /opt/flutter (environment snapshot) or $HOME/flutter.
set -euo pipefail

export CHROME_EXECUTABLE="${CHROME_EXECUTABLE:-/usr/local/bin/google-chrome}"
export PUB_CACHE="${PUB_CACHE:-${HOME}/.pub-cache}"
export PATH="/opt/flutter/bin:${HOME}/flutter/bin:${PATH}"

if ! command -v flutter >/dev/null 2>&1 || ! flutter --version 2>/dev/null | grep -q "3.47"; then
  echo "Installing Flutter 3.47.2 to ${HOME}/flutter"
  archive="${TMPDIR:-/tmp}/flutter_linux_3.47.2-stable.tar.xz"
  url="https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.47.2-stable.tar.xz"
  if [[ ! -f "${archive}" ]]; then
    curl -fsSL -o "${archive}" "${url}"
  fi
  rm -rf "${HOME}/flutter"
  tar -xJf "${archive}" -C "${HOME}"
  export PATH="${HOME}/flutter/bin:${PATH}"
fi

flutter config --no-analytics --enable-web

# Preserve the repo's custom web/index.html across flutter create.
index_backup=""
if [[ -f web/index.html ]]; then
  index_backup="$(mktemp)"
  cp web/index.html "${index_backup}"
fi

# --no-pub avoids resolving the mobile pubspec (path/sqflite) during scaffold.
flutter create --no-pub --project-name paisa_track --org com.paisatrack --platforms web .

if [[ -n "${index_backup}" ]]; then
  cp "${index_backup}" web/index.html
  rm -f "${index_backup}"
fi

# Match CI: web builds use pubspec_web.yaml (no sqflite / path_provider).
if [[ -f pubspec_web.yaml ]]; then
  cp pubspec_web.yaml pubspec.yaml
fi

if ! flutter pub get; then
  # Newer Flutter SDKs pin flutter_localizations to a newer intl than ^0.20.2.
  flutter pub add 'intl:^0.20.3'
fi

# Flutter 3.47 moved CupertinoPageTransitionsBuilder into cupertino.dart.
theme="lib/core/theme/app_theme.dart"
if [[ -f "${theme}" ]] && grep -q "CupertinoPageTransitionsBuilder" "${theme}"; then
  if ! grep -q "package:flutter/cupertino.dart" "${theme}"; then
    python3 - <<'PY'
from pathlib import Path
path = Path("lib/core/theme/app_theme.dart")
text = path.read_text()
needle = "import 'package:flutter/material.dart';"
inject = "import 'package:flutter/cupertino.dart';\n" + needle
if needle in text and "package:flutter/cupertino.dart" not in text:
    path.write_text(text.replace(needle, inject, 1))
    print("Added cupertino.dart import for CupertinoPageTransitionsBuilder")
PY
  fi
fi

# flutter create / pub get may rewrite analysis_options.yaml
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git checkout -- analysis_options.yaml 2>/dev/null || true
fi
echo "Cloud Agent install complete: $(flutter --version | head -n 1)"
