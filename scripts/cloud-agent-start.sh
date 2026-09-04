#!/usr/bin/env bash
# Per-boot start: serve the static Zenith app if this revision has it.
# Idempotent: reuse an already-listening server, then return.
set -euo pipefail

PORT="${ZENITH_PORT:-5173}"
ROOT="${ZENITH_ROOT:-$(pwd)}"
URL="http://127.0.0.1:${PORT}/Zenith.html"

if [[ ! -f "${ROOT}/Zenith.html" ]]; then
  echo "Zenith.html not in this revision; nothing to start."
  exit 0
fi

if curl -sf -o /dev/null --max-time 2 "${URL}"; then
  echo "Zenith already listening on port ${PORT}."
  exit 0
fi

mkdir -p /tmp
nohup python3 -m http.server "${PORT}" --bind 0.0.0.0 --directory "${ROOT}" \
  >/tmp/zenith-server.log 2>&1 &
echo $! >/tmp/zenith-server.pid

for _ in $(seq 1 50); do
  if curl -sf -o /dev/null --max-time 1 "${URL}"; then
    echo "Zenith static server ready at ${URL}"
    exit 0
  fi
  sleep 0.1
done

echo "Zenith static server failed to become ready. Last log:" >&2
tail -n 50 /tmp/zenith-server.log >&2 || true
exit 1
