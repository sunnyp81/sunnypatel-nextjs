#!/bin/bash
# Batch 4 of 4: Blog images 19-22
# Run: bash tmp/batch4-generate.sh

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

gen "best-seo-companies-uk" \
  "A trophy cup on a three-tier podium with position markers 1 2 3. A small star above the trophy. Trophy in gold, podium steps in blue, star outline in white."

gen "eeat-checker-audit-guide" \
  "A magnifying glass examining a checklist document with checkmark items. A circular progress meter ring around the magnifying glass lens showing completion. Magnifying glass in blue, checkmarks and progress arc in gold."

gen "freelance-seo-consultant-uk" \
  "A single person silhouette sitting with an open laptop. Above the laptop screen, a small upward graph line and a search magnifying glass icon float. Person and laptop in blue, graph and search icon in gold."

gen "seo-semantic-markup-guide" \
  "Code angle brackets < > with a structured tree of connected nodes inside them, branching out like a schema hierarchy. Small tag label shapes on each branch. Brackets in blue, nodes and connections in gold."

echo ""
echo "=== BATCH 4 COMPLETE - ALL DONE ==="
echo ""
echo "Now run the update script to set ogImage paths:"
echo "  bash tmp/update-og-images.sh"
