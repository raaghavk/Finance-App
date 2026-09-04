#!/usr/bin/env bash
# Idempotent Cloud Agent install for the static Zenith finance app.
# Safe on older revisions that still contain the previous Flutter tree.
set -euo pipefail

if [[ -f Zenith.html && -f app.jsx && -d components ]]; then
  python3 -c "import http.server, socketserver"
  echo "Zenith static app files present; python3 http.server is available."
else
  echo "Zenith.html not in this revision; skipping static-app checks."
fi
