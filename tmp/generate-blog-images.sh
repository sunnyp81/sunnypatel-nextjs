#!/bin/bash
# Generate featured images for all blog posts using Nano Banana
# Style: minimalist line-art icon on dark background, blue (#5B8AEF) + gold (#d79f1e) palette

PYTHON="G:/My Drive/_SHARED/mcp-servers/design-studio/.venv/Scripts/python.exe"
SCRIPT="G:/My Drive/_SHARED/skills/nano-banana/scripts/generate_image.py"
REF_IMG="g:/My Drive/--temp/Screenshot 2026-02-20 225108.png"
OUTPUT_DIR="C:/Users/sunny/Desktop/sunnypatel-nextjs/public/images/blog"

STYLE_PREFIX="Create a minimalist line-art icon illustration on a pure dark background (#0a0a0f). Use thin clean lines in blue (#5B8AEF) and gold/amber (#d79f1e) with occasional white (#e0e0e0) detail lines. The icon should be centered, simple, elegant, no text, no words, no letters. Similar style to a clock with growth arrow icon."

generate() {
  local slug="$1"
  local desc="$2"
  local outfile="$OUTPUT_DIR/$slug.png"

  echo "=== Generating: $slug ==="

  # Create prompt JSON
  local prompt="{\"subject\": \"$STYLE_PREFIX Icon concept: $desc\"}"

  # Generate image with reference
  local result
  result=$(echo "$prompt" | "$PYTHON" "$SCRIPT" --model flash --image "$REF_IMG" --aspect-ratio 16:9 --no-open 2>&1)
  echo "$result"

  # Extract output path from SUCCESS line
  local src_path
  src_path=$(echo "$result" | grep "SUCCESS:" | sed 's/SUCCESS: Image saved to //')

  if [ -n "$src_path" ] && [ -f "$src_path" ]; then
    cp "$src_path" "$outfile"
    echo "  -> Saved to $outfile"
    rm "$src_path"
  else
    echo "  -> FAILED for $slug"
  fi
}

# All 22 blog posts
generate "how-long-does-seo-take" "A clock face with hour markers and hands in white/blue lines, with a bold gold upward-trending zigzag growth arrow emerging from the bottom, and a small plant seedling at the arrow base. Represents time and growth in SEO"

generate "how-many-keywords" "Multiple floating keyword tag bubbles of different sizes connected by thin lines, like a word cloud network. Some tags in blue, some in gold, representing keyword volume and selection"

generate "how-to-be-an-seo" "A person silhouette sitting at a desk with a large magnifying glass over a search results page, with small gear and chart icons floating around. Represents learning the SEO profession"

generate "how-to-build-topical-authority" "A pyramid or tower made of stacked content blocks/layers, with a crown or star at the top glowing in gold, and connecting lines between blocks in blue. Represents building authority through layered content"

generate "how-to-choose-seo-consultant" "A checklist clipboard with checkmarks next to items, and a magnifying glass examining one item closely. Some checks in gold, clipboard outline in blue. Represents evaluating and selecting a consultant"

generate "increase-organic-traffic" "An upward trending line graph with a bold arrow shooting upward, combined with organic plant leaves growing along the graph line. Graph in gold, leaves and grid in blue. Represents organic traffic growth"

generate "intent-competition-data" "A bar chart with three bars of different heights, overlaid with a crosshair/target symbol and data points connected by lines. Bars in gold, crosshair and data lines in blue. Represents analyzing search intent and competition data"

generate "local-seo-berkshire-guide" "A map pin/location marker inside a circular boundary, with a small compass rose and dotted path lines around it. Pin in gold, circle and compass in blue. Represents local SEO and geographic targeting"

generate "optimise-content-for-ai-search" "A document page with an AI brain circuit pattern overlaid on it, with small citation/quote marks and connection nodes. Brain circuit in blue, document and citations in gold. Represents optimizing content for AI-powered search engines"

generate "optimise-multiple-keywords" "Multiple interconnected nodes/circles arranged in a constellation pattern, each node representing a keyword, with lines connecting related terms. Some nodes gold, connections blue. Represents a keyword cluster strategy"

generate "seo-mistakes" "A warning triangle with an exclamation mark inside, surrounded by small X marks and broken chain links. Triangle border in gold, exclamation and X marks in blue. Represents common SEO errors and pitfalls"

generate "technical-seo-vs-on-page-seo" "A split circle divided in half - left side shows a gear/cog (technical), right side shows a document with text lines (on-page). A vs divider line between them. Gear in blue, document in gold. Represents comparing two SEO approaches"

generate "topical-authority-vs-domain-authority" "A balance scale with two pans - one holding a topic cluster icon (interconnected circles), the other holding a domain/globe icon. Scale beam in white, left pan contents in blue, right pan in gold. Represents comparing authority types"

generate "what-is-a-content-brief" "A document/paper outline with structured sections marked by horizontal lines, a pen/pencil writing on it, and small bullet point indicators. Document in blue, pen and highlights in gold. Represents a content brief template"

generate "what-is-eeat-seo" "A shield or badge with four quadrant sections, each with a small distinct icon (star, book, checkmark, handshake) representing Experience, Expertise, Authority, Trust. Shield outline in blue, icons in gold. Represents Google EEAT quality framework"

generate "what-is-entity-seo" "A knowledge graph visualization - a central node connected to multiple surrounding nodes by lines, forming a network. Central node larger with a person/entity icon. Central node gold, connections and outer nodes blue. Represents entity relationships in SEO"

generate "what-is-llm-optimisation" "A brain outline made of circuit board traces and nodes, with a chat bubble emerging from it containing a citation bracket. Brain circuits in blue, chat bubble in gold. Represents optimizing content for large language models"

generate "wordpress-vs-webflow" "Two browser window outlines side by side, one showing a W logo shape, the other showing a flowing wave shape. A comparison arrows icon between them. Left window in blue, right in gold. Represents comparing two website platforms"

generate "best-seo-companies-uk" "A trophy or award cup with a small star above it, sitting on a podium with position markers (1,2,3). Trophy in gold, podium and star lines in blue. Represents ranking the best SEO companies"

generate "eeat-checker-audit-guide" "A magnifying glass examining a checklist with EEAT-style checkmarks, with a circular progress meter around the magnifying glass lens. Magnifying glass in blue, checkmarks and progress in gold. Represents auditing EEAT signals"

generate "freelance-seo-consultant-uk" "A single person silhouette with a laptop, with search/SEO graph elements floating above the screen and a small location pin. Person and laptop in blue, graph elements in gold. Represents an independent SEO consultant"

generate "seo-semantic-markup-guide" "Code angle brackets < > with connected schema nodes inside them, forming a structured data tree. Small tag labels branching out. Brackets in blue, schema nodes and connections in gold. Represents semantic HTML markup and structured data"

echo ""
echo "=== ALL DONE ==="
echo "Generated images are in: $OUTPUT_DIR"
