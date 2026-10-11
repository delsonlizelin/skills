#!/usr/bin/env bash
# Scaffold a self-contained page folder from an ibm-design template.
#
#   new_page.sh <specimen|dashboard|editorial|slides|blank> <out-dir> [--lite] [--fonts] [--force]
#
# Writes <out-dir>/index.html and <out-dir>/ibm/{tokens.css,type.css,base.css} (real copies).
#   --lite   tokens.lite.css as ibm/tokens.css (no ai/chat/syntax/tag tokens; ~55 KB instead of ~105 KB)
#   --fonts  bundle Plex Sans/Serif/Mono/Sans Condensed WOFF2 (all weights + italics, ~4 MB) into ibm/plex/ and switch the page
#            from Google Fonts to ibm/plex/plex.css — portable, fully offline output (downloads once from npm).
#            Plex Sans SC/TC/JP/KR are NOT bundled (tens of MB); CJK falls back to local()/system fonts.
#   --force  overwrite an existing index.html / ibm/ in <out-dir>
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
tpl="${1:?template: specimen|dashboard|editorial|slides|blank}"; out="${2:?out-dir}"; shift 2 || true
lite=0; fonts=0; force=0
for f in "$@"; do case "$f" in --lite) lite=1;; --fonts) fonts=1;; --force) force=1;; *) echo "unknown option $f" >&2; exit 2;; esac; done

# preflight: never overwrite any existing destination without --force
if [ $force = 0 ]; then
  clash=""
  for f in index.html ibm/tokens.css ibm/type.css ibm/base.css; do [ -e "$out/$f" ] && clash="$clash $f"; done
  [ $fonts = 1 ] && [ -e "$out/ibm/plex" ] && clash="$clash ibm/plex/"
  if [ -n "$clash" ]; then echo "refusing to overwrite in $out:$clash (pass --force to replace)" >&2; exit 1; fi
fi
mkdir -p "$out/ibm"
if [ "$tpl" = blank ]; then
  cat > "$out/index.html" <<'HTML'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Untitled</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=IBM+Plex+Serif:ital,wght@0,300;0,400;1,300;1,400&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="ibm/tokens.css">
<link rel="stylesheet" href="ibm/type.css">
<link rel="stylesheet" href="ibm/base.css">
</head>
<body>
<main class="ibm-grid ibm-section">
  <div class="lg-10">
    <p class="ibm-eyebrow">Eyebrow</p>
    <h1 class="cds--type-fluid-display-01">Headline</h1>
  </div>
</main>
</body>
</html>
HTML
else
  src="$SKILL/templates/$tpl.html"; [ -f "$src" ] || { echo "no template $tpl" >&2; exit 2; }
  cp "$src" "$out/index.html"
fi
if [ $lite = 1 ]; then cp "$SKILL/tokens/tokens.lite.css" "$out/ibm/tokens.css"; else cp "$SKILL/tokens/tokens.css" "$out/ibm/tokens.css"; fi
cp "$SKILL/tokens/type.css" "$SKILL/tokens/base.css" "$out/ibm/"

if [ $fonts = 1 ]; then
  cache="$HOME/.cache/ibm-design/plex-woff2"; mkdir -p "$cache" "$out/ibm/plex"
  css="$out/ibm/plex/plex.css"; : > "$css"
  # every weight (Thin 100 … Bold 700, incl. Text 450) and italic of the four Latin families,
  # so any template — including the specimen — renders the real faces offline
  for fam in sans serif mono sans-condensed; do
    if [ ! -d "$cache/$fam" ]; then
      tgz=$(npm view "@ibm/plex-$fam" dist.tarball); tmp=$(mktemp -d)
      curl -fsSL "$tgz" | tar xz -C "$tmp"; mkdir -p "$cache/$fam"; cp "$tmp"/package/fonts/complete/woff2/*.woff2 "$cache/$fam/"; rm -rf "$tmp"
    fi
    for f in "$cache/$fam"/*.woff2; do
      base=$(basename "$f" .woff2); stylepart=${base#*-}; filefam=${base%%-*}
      name=$(echo "$filefam" | sed -E 's/^IBMPlex/IBM Plex /; s/([a-z])([A-Z])/\1 \2/g')
      it=normal; case "$stylepart" in *Italic) it=italic; stylepart=${stylepart%Italic};; esac
      case "$stylepart" in Thin) w=100;; ExtraLight) w=200;; Light) w=300;; ""|Regular) w=400;; Text) w=450;; Medium) w=500;; SemiBold) w=600;; Bold) w=700;; *) continue;; esac
      cp "$f" "$out/ibm/plex/"
      echo "@font-face { font-family: \"$name\"; font-style: $it; font-weight: $w; font-display: swap; src: url(\"$base.woff2\") format(\"woff2\"); }" >> "$css"
    done
  done
  # swap the Google Fonts link for the bundled stylesheet
  python3 - "$out/index.html" <<'PY'
import re, sys
p = sys.argv[1]; s = open(p).read()
s = re.sub(r'<link rel="preconnect" href="https://fonts\.googleapis\.com">\s*<link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin>\s*', '', s)
s = re.sub(r'<link href="https://fonts\.googleapis\.com/css2[^"]*" rel="stylesheet">', '<link rel="stylesheet" href="ibm/plex/plex.css">', s)
open(p, 'w').write(s)
PY
  echo "bundled $(ls "$out/ibm/plex" | grep -c woff2) Plex WOFF2 files → $out/ibm/plex/ ($(du -sh "$out/ibm/plex" | cut -f1))"
fi
echo "$out/index.html (+ ibm/tokens.css type.css base.css)"
