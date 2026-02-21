#!/bin/bash
# Batch 5: 4 remaining blog images (statistics posts)
# Run: bash tmp/batch5-generate.sh

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

gen "ai-search-statistics" \
  "A robotic AI head outline in profile view with a magnifying glass overlapping it. Small data chart bars and signal waves emanating from the head. Head outline in blue, magnifying glass and data bars in gold."

gen "content-marketing-statistics" \
  "A large clipboard or document outline with a bar chart rising from it. A pen or pencil at an angle beside it. Small percentage symbols floating around. Clipboard and chart bars in blue, pen and percentage symbols in gold."

gen "local-seo-statistics" \
  "A storefront building outline with a large location pin above it. Small graph line showing upward trend beside it. A star rating symbol at the bottom. Building and pin in gold, graph line and stars in blue."

gen "seo-statistics-uk" \
  "A simplified UK map outline with a large upward trending arrow across it. Small data points scattered on the map. Map outline in blue, arrow and data points in gold."

echo ""
echo "=== BATCH 5 COMPLETE ==="
echo "Run: bash tmp/update-og-images.sh"
