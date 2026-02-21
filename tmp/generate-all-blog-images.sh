#!/bin/bash
# Generate ALL 22 blog featured images in one run
# Includes 90s delays between images to avoid rate limits
# Total estimated time: ~35 minutes
#
# Run: bash tmp/generate-all-blog-images.sh
# Or run individual batches: bash tmp/batch1-generate.sh (etc.)

echo "Starting full generation run (~35 min total)..."
echo "Each image takes ~30s to generate + 90s delay between images"
echo ""

bash "C:/Users/sunny/Desktop/sunnypatel-nextjs/tmp/batch1-generate.sh"
echo ""
echo "=== Batch 1 done. Waiting 5 min before batch 2... ==="
sleep 300

bash "C:/Users/sunny/Desktop/sunnypatel-nextjs/tmp/batch2-generate.sh"
echo ""
echo "=== Batch 2 done. Waiting 5 min before batch 3... ==="
sleep 300

bash "C:/Users/sunny/Desktop/sunnypatel-nextjs/tmp/batch3-generate.sh"
echo ""
echo "=== Batch 3 done. Waiting 5 min before batch 4... ==="
sleep 300

bash "C:/Users/sunny/Desktop/sunnypatel-nextjs/tmp/batch4-generate.sh"

echo ""
echo "=== All images generated! Updating ogImage paths... ==="
bash "C:/Users/sunny/Desktop/sunnypatel-nextjs/tmp/update-og-images.sh"

echo ""
echo "Done! Review images in: public/images/blog/"
echo "Then commit and deploy:"
echo "  cd C:/Users/sunny/Desktop/sunnypatel-nextjs"
echo "  git add public/images/blog/ src/content/blog/"
echo "  git commit -m 'Add generated featured images for all blog posts'"
echo "  git push origin master"
