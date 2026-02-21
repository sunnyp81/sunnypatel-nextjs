#!/bin/bash
# Batch 2 of 4: Blog images 7-12
# Run: bash tmp/batch2-generate.sh

PYTHON="G:/My Drive/_SHARED/mcp-servers/design-studio/.venv/Scripts/python.exe"
SCRIPT="G:/My Drive/_SHARED/skills/nano-banana/scripts/generate_image.py"
OUT="C:/Users/sunny/Desktop/sunnypatel-nextjs/public/images/blog"

STYLE="Minimalist line-art icon illustration on a solid very dark background (#0a0a0f). Single centered icon using thin clean vector-style outlines. Primary colors: blue (#5B8AEF) and gold/amber (#d79f1e) with white (#e0e0e0) accents. No text, no words, no letters, no labels. Clean, minimal, elegant, professional."

gen() {
  local slug="$1"
  local icon="$2"
  echo ""
  echo ">>> Generating: $slug"
  local result
  result=$(echo "{\"subject\": \"$STYLE Icon: $icon\"}" | "$PYTHON" "$SCRIPT" --model flash --aspect-ratio 16:9 --no-open 2>&1)
  echo "$result"
  local src
  src=$(echo "$result" | grep "SUCCESS:" | sed 's/SUCCESS: Image saved to //')
  if [ -n "$src" ] && [ -f "$src" ]; then
    cp "$src" "$OUT/$slug.png"
    rm "$src"
    echo "  SAVED: $OUT/$slug.png"
  else
    echo "  FAILED: $slug"
  fi
  echo "  Waiting 90s..."
  sleep 90
}

gen "intent-competition-data" \
  "A bar chart with three vertical bars of different heights, overlaid with a crosshair target symbol. Small data point dots connected by lines. Bars in gold, crosshair and connecting lines in blue."

gen "local-seo-berkshire-guide" \
  "A large map pin location marker inside a circular boundary ring. A small compass rose at the bottom and dotted path lines curving around the pin. Pin filled gold, circle and compass in blue."

gen "optimise-content-for-ai-search" \
  "A document page outline with an AI brain made of circuit traces overlaid on it. Small citation quote marks and glowing connection nodes around the brain. Brain circuit in blue, document edges and citations in gold."

gen "optimise-multiple-keywords" \
  "A constellation-like pattern of interconnected circles of varying sizes, each representing a keyword node, with lines connecting related ones in a cluster. Some nodes in gold, connections and smaller nodes in blue."

gen "seo-mistakes" \
  "A warning triangle with an exclamation mark inside. Surrounded by small X marks and a broken chain link. Triangle border in gold, exclamation mark in blue, X marks in white."

gen "technical-seo-vs-on-page-seo" \
  "A circle split in half vertically. Left half contains a mechanical gear cog. Right half contains a document with text lines. A thin divider line between. Gear in blue, document in gold."

echo ""
echo "=== BATCH 2 COMPLETE ==="
echo "Wait at least 5 minutes, then run: bash tmp/batch3-generate.sh"
