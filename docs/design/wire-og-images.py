"""Set ogImage in each blog post's index.yaml to its hero webp where the hero file exists.
Replaces empty values, old /images/blog/*.png values and .svg values. Adds the field if missing."""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLOG = os.path.join(ROOT, "src", "content", "blog")
IMG = os.path.join(ROOT, "public", "images", "blog")

ALIASES = {
    "managing-44-websites-seo-data": "hero-managing-44-websites.webp",
    "google-update-portfolio-impact": "hero-google-update-impact.webp",
    "ai-search-traffic-portfolio-data": "hero-ai-search-traffic.webp",
    "negative-seo-backlink-attack-case-study": "hero-negative-seo-case-study.webp",
    "aged-domains-and-domain-collisions": "hero-aged-domains.webp",
}

dry = "--dry" in sys.argv
changed, skipped = [], []
for slug in sorted(os.listdir(BLOG)):
    yaml_path = os.path.join(BLOG, slug, "index.yaml")
    if not os.path.isfile(yaml_path):
        continue
    hero = ALIASES.get(slug, f"hero-{slug}.webp")
    if not os.path.isfile(os.path.join(IMG, hero)):
        continue
    text = open(yaml_path, encoding="utf-8").read()
    target = f"ogImage: /images/blog/{hero}"
    m = re.search(r"^ogImage:\s*(.*)$", text, re.M)
    if not m:
        dm = re.search(r"^description:.*?(?=^\S)", text, re.M | re.S)
        insert_at = dm.end() if dm else 0
        new = text[:insert_at] + target + "\n" + text[insert_at:]
        if not dry:
            open(yaml_path, "w", encoding="utf-8", newline="\n").write(new)
        changed.append(slug + " (field added)")
        continue
    current = m.group(1).strip().strip("'\"")
    replaceable = (not current) or current == f"/images/blog/{hero}" or re.search(r"\.(png|svg)$", current)
    if not replaceable:
        skipped.append((slug, f"kept: {current}"))
        continue
    new = text[: m.start()] + target + text[m.end():]
    if new != text:
        if not dry:
            open(yaml_path, "w", encoding="utf-8", newline="\n").write(new)
        changed.append(slug)

print(f"{'DRY ' if dry else ''}changed {len(changed)}:")
for s in changed:
    print("  ", s)
print(f"skipped {len(skipped)}:")
for s, why in skipped:
    print("  ", s, "|", why)
