#!/usr/bin/env bash
# Idempotent Cloud Agent install for PaisaTrack web development.
# Flutter 3.47.x is expected at /opt/flutter (environment snapshot).
set -euo pipefail

export PATH="/opt/flutter/bin:${PATH}"
export CHROME_EXECUTABLE="${CHROME_EXECUTABLE:-/usr/local/bin/google-chrome}"
export PUB_CACHE="${PUB_CACHE:-${HOME}/.pub-cache}"

if ! command -v flutter >/dev/null 2>&1; then
  echo "Flutter not found. Expected /opt/flutter from the environment snapshot." >&2
  exit 1
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

# flutter create / pub get may rewrite analysis_options.yaml
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git checkout -- analysis_options.yaml 2>/dev/null || true
fi
echo "Cloud Agent install complete: $(flutter --version | head -n 1)"
