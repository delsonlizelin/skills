#!/usr/bin/env bash
# Install the IBM Plex families (OFL-1.1) for the current macOS/Linux user.
# Source: official GitHub releases of github.com/IBM/plex (static OTF + variable TTF).
#
#   install_fonts.sh            core Latin families + variable + Math + Sans SC + small scripts
#   install_fonts.sh --all      also Sans TC, JP, KR (≈750 MB of downloads)
#   install_fonts.sh --only sans-sc,sans-jp     install just these keys
#   install_fonts.sh --check    list which families are installed, then exit
#
# Idempotent: a family whose files already exist is skipped. Downloads go to a
# fresh temp dir that is removed afterwards.
set -euo pipefail

REL="https://github.com/IBM/plex/releases/download"
# key | release tag (url-encoded) | zip name
CATALOG=$(cat <<'EOF'
sans|%40ibm/plex-sans%401.1.0|ibm-plex-sans.zip
sans-condensed|%40ibm/plex-sans-condensed%402.0.0|ibm-plex-sans-condensed.zip
serif|%40ibm/plex-serif%402.0.0|ibm-plex-serif.zip
mono|%40ibm/plex-mono%402.5.0|ibm-plex-mono.zip
math|%40ibm/plex-math%401.1.0|ibm-plex-math.zip
sans-variable|%40ibm/plex-sans-variable%400.2.0|plex-sans-variable.zip
serif-variable|%40ibm/plex-serif-variable%402.0.0|plex-serif-variable.zip
mono-variable|%40ibm/plex-mono-variable%401.0.0|plex-mono-variable.zip
sans-sc|%40ibm/plex-sans-sc%401.1.0|ibm-plex-sans-sc.zip
sans-arabic|%40ibm/plex-sans-arabic%401.1.0|ibm-plex-sans-arabic.zip
sans-devanagari|%40ibm/plex-sans-devanagari%401.1.0|ibm-plex-sans-devanagari.zip
sans-hebrew|%40ibm/plex-sans-hebrew%401.1.0|ibm-plex-sans-hebrew.zip
sans-thai|%40ibm/plex-sans-thai%401.1.0|ibm-plex-sans-thai.zip
sans-thai-looped|%40ibm/plex-sans-thai-looped%401.1.0|ibm-plex-sans-thai-looped.zip
sans-tc|%40ibm/plex-sans-tc%401.1.1|ibm-plex-sans-tc.zip
sans-jp|%40ibm/plex-sans-jp%403.0.0|ibm-plex-sans-jp.zip
sans-kr|%40ibm/plex-sans-kr%401.1.0|ibm-plex-sans-kr.zip
EOF
)
DEFAULT_SKIP="sans-tc sans-jp sans-kr"

case "$(uname)" in
  Darwin) DEST="$HOME/Library/Fonts" ;;
  *)      DEST="${XDG_DATA_HOME:-$HOME/.local/share}/fonts/ibm-plex" ;;
esac
mkdir -p "$DEST"

mode=default; only=""
case "${1:-}" in
  --all) mode=all ;;
  --only) mode=only; only=",${2:?--only needs a comma list},";;
  --check)
    if command -v fc-list >/dev/null; then fc-list : family | grep -i 'IBM Plex' | sort -u
    else ls "$DEST" | grep -i 'IBMPlex\|IBM Plex' | sed 's/-.*//' | sort | uniq -c; fi
    exit 0 ;;
  "") ;;
  *) echo "unknown option $1" >&2; exit 2 ;;
esac

TMP=$(mktemp -d "${TMPDIR:-/tmp}/plex-fonts.XXXXXX"); trap 'rm -rf "$TMP"' EXIT

marker() { echo "$DEST/.ibm-plex-$1.installed"; }

while IFS='|' read -r key tag zip; do
  [ -z "$key" ] && continue
  if [ "$mode" = default ] && [[ " $DEFAULT_SKIP " == *" $key "* ]]; then continue; fi
  if [ "$mode" = only ] && [[ "$only" != *",$key,"* ]]; then continue; fi
  if [ -f "$(marker "$key")" ]; then echo "✓ $key (already installed)"; continue; fi
  echo "↓ $key …"
  d="$TMP/$key"; mkdir -p "$d"
  curl -fsSL --retry 3 -o "$d/f.zip" "$REL/$tag/$zip"
  unzip -q -o "$d/f.zip" -d "$d/x"
  # Prefer static OTF under fonts/complete; fall back to TTF (variable families ship TTF only).
  # Hinted beats unhinted when both exist.
  files=$(find "$d/x" -path '*complete*' -name '*.otf' | grep -v unhinted || true)
  [ -z "$files" ] && files=$(find "$d/x" -path '*complete*' -name '*.otf' || true)
  [ -z "$files" ] && files=$(find "$d/x" -path '*complete*' -name '*.ttf' | grep -v unhinted || true)
  [ -z "$files" ] && { echo "  ! no font files found in $zip" >&2; continue; }
  n=0; while IFS= read -r f; do cp -f "$f" "$DEST/"; n=$((n+1)); done <<< "$files"
  touch "$(marker "$key")"
  rm -rf "$d"
  echo "  installed $n files"
done <<< "$CATALOG"

command -v fc-cache >/dev/null && fc-cache -f "$DEST" >/dev/null 2>&1 || true
echo "Done → $DEST  (restart apps / browsers to pick up new fonts)"
