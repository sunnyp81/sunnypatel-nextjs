#!/bin/bash
# Update all blog index.yaml files with correct ogImage paths
# Run after all batch generation scripts complete
# Usage: bash tmp/update-og-images.sh

BLOG_DIR="C:/Users/sunny/Desktop/sunnypatel-nextjs/src/content/blog"
IMG_DIR="C:/Users/sunny/Desktop/sunnypatel-nextjs/public/images/blog"

echo "Checking generated images and updating ogImage paths..."
echo ""

updated=0
missing=0

for dir in "$BLOG_DIR"/*/; do
  slug=$(basename "$dir")
  yaml="$dir/index.yaml"
  png="$IMG_DIR/$slug.png"

  if [ ! -f "$yaml" ]; then
    continue
  fi

  if [ -f "$png" ]; then
    # Check if ogImage already points to the PNG
    current=$(grep "^ogImage:" "$yaml" | head -1)
    target="ogImage: /images/blog/$slug.png"

    if [ "$current" != "$target" ]; then
      # Update the ogImage line using sed
      sed -i "s|^ogImage:.*|ogImage: /images/blog/$slug.png|" "$yaml"
      echo "  UPDATED: $slug -> /images/blog/$slug.png"
      ((updated++))
    else
      echo "  OK: $slug (already correct)"
    fi
  else
    echo "  MISSING IMAGE: $slug (no PNG found)"
    ((missing++))
  fi
done

echo ""
echo "Done. Updated: $updated, Missing images: $missing"
echo ""
if [ "$missing" -gt 0 ]; then
  echo "Re-run the failed batch scripts for missing images, then run this script again."
fi
