#!/bin/bash
# Batch 3 of 4: Blog images 13-18
# Run: bash tmp/batch3-generate.sh

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

gen "topical-authority-vs-domain-authority" \
  "A balance scale with two pans. Left pan holds a cluster of interconnected small circles (topical). Right pan holds a single large globe icon (domain). Scale beam in white, left pan contents in blue, right pan in gold."

gen "what-is-a-content-brief" \
  "A document paper outline with structured horizontal section lines, a pen or pencil positioned to write on it, and small bullet point dots along the left margin. Document outline in blue, pen and bullet highlights in gold."

gen "what-is-eeat-seo" \
  "A shield or badge shape divided into four quadrant sections. Each quadrant has a distinct small icon: a star (experience), an open book (expertise), a laurel wreath (authority), a handshake (trust). Shield outline in blue, quadrant icons in gold."

gen "what-is-entity-seo" \
  "A knowledge graph: one larger central circle node with a person icon inside, connected by lines to 6 surrounding smaller circle nodes arranged in a ring. Central node in gold, connections and outer nodes in blue."

gen "what-is-llm-optimisation" \
  "A brain outline shape made of circuit board traces with small nodes at junctions. A chat bubble emerging from the top-right of the brain with a small citation bracket symbol inside. Brain circuits in blue, chat bubble in gold."

gen "wordpress-vs-webflow" \
  "Two browser window outlines side by side. Left window has a W-shaped element inside. Right window has a flowing curved wave element. Comparison double-arrow between them. Left window in blue, right in gold, arrows in white."

echo ""
echo "=== BATCH 3 COMPLETE ==="
echo "Wait at least 5 minutes, then run: bash tmp/batch4-generate.sh"
