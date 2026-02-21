#!/bin/bash
# Batch 1 of 4: Blog images 1-6
# Run: bash tmp/batch1-generate.sh
# Wait 5+ minutes between batches

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

gen "how-long-does-seo-take" \
  "A clock face circle in blue with white tick marks and clock hands. A bold gold zigzag upward growth arrow emerging from bottom-left through the clock to upper-right. A small plant seedling with two leaves at the arrow base in gold."

gen "how-many-keywords" \
  "Multiple floating oval keyword tag shapes of varying sizes, some in blue outlines, some in gold outlines, connected by thin white dotted lines forming a loose network. Represents keyword selection and volume."

gen "how-to-be-an-seo" \
  "A person silhouette outline at a desk with a laptop, a large magnifying glass hovering over the screen showing search results lines. Small floating icons around: a gear, a bar chart, a link chain. Person in blue, magnifying glass in gold."

gen "how-to-build-topical-authority" \
  "A pyramid of stacked hexagonal content blocks, getting smaller toward the top, with a glowing gold crown or star at the apex. Blue connecting lines between the hexagons. Represents building layered topical authority."

gen "how-to-choose-seo-consultant" \
  "A clipboard with a checklist showing 4 items with checkmark boxes. A magnifying glass examining one of the items. Clipboard outline in blue, checkmarks in gold. Represents evaluating and choosing a consultant."

gen "increase-organic-traffic" \
  "An upward-curving line graph with a bold arrow shooting upward at the end. Organic plant leaves and stems growing along the graph line. Graph line and arrow in gold, leaves in blue, grid lines in faint white."

echo ""
echo "=== BATCH 1 COMPLETE ==="
echo "Wait at least 5 minutes, then run: bash tmp/batch2-generate.sh"
