"""Batch generate featured images for all blog posts using Gemini."""
import os, sys, json, time, base64
from pathlib import Path

# Load API key from nano-banana .env
env_path = Path(r"G:\My Drive\_SHARED\skills\nano-banana\.env")
if env_path.exists():
    for line in open(env_path):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip("\"'"))

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("ERROR: No GEMINI_API_KEY found"); sys.exit(1)

from google import genai
from google.genai import types

client = genai.Client(api_key=api_key)
out_dir = Path(r"C:\Users\sunny\Desktop\sunnypatel-nextjs\public\images\blog")
out_dir.mkdir(parents=True, exist_ok=True)

# All 21 blog posts: slug -> visual concept
posts = {
    "what-is-llm-optimisation": "a glowing neural network brain made of interconnected blue light nodes floating in dark space, with streams of data flowing through it",
    "google-algorithm-update-recovery": "a cracked digital landscape being rebuilt with golden light seeping through the cracks, dark geometric terrain with blue restoration beams",
    "technical-seo-vs-on-page-seo": "two interlocking geometric gears, one made of circuit board patterns (technical) and one made of flowing text lines (content), blue and gold tones on dark background",
    "what-is-a-content-brief": "a floating blueprint or wireframe document made of glowing blue lines and grid patterns, with golden annotation markers, dark space background",
    "how-to-choose-an-seo-consultant": "a magnifying glass with a glowing blue lens examining a constellation of connected profile nodes, dark background with subtle gold highlights",
    "local-seo-berkshire-guide": "an abstract aerial view of a city map made of glowing blue grid lines with golden location pins and radius circles, dark background",
    "what-is-eeat-in-seo": "four interconnected crystal pillars (Experience, Expertise, Authority, Trust) glowing in blue and gold, arranged in a diamond formation on dark background",
    "topical-authority-vs-domain-authority": "two scales of justice, one holding a glowing blue topical web network, the other holding a golden numerical score badge, dark space background",
    "how-to-build-topical-authority": "a tree growing from a central node, branches forming an intricate network of connected topics, blue glowing connections with golden leaf endpoints, dark background",
    "what-is-entity-seo": "a digital fingerprint or DNA helix made of connected entity nodes and relationship lines, glowing blue with golden identity markers, dark background",
    "optimise-content-for-ai-search": "a robotic eye or AI lens analyzing floating content blocks, with blue scan lines and golden highlight markers on the content, dark background",
    "generative-engine-optimisation-2": "an abstract generative engine: flowing streams of content being processed through a geometric machine structure, blue energy flows with golden output particles, dark background",
    "how-long-does-seo-take": "an abstract hourglass or timeline made of data points and progress bars, blue sand particles flowing through golden milestones, dark background",
    "b2b-content-marketing-services": "two abstract building/tower structures connected by flowing content streams and data bridges, blue glass architecture with golden connection points, dark background",
    "how-to-be-an-seo": "a compass or navigation instrument made of search-related symbols and SEO elements, glowing blue with a golden north star, dark background",
    "increase-organic-traffic": "an upward-flowing stream of abstract visitors or data particles, growing from a small trickle to a powerful river of blue light, golden growth arrows, dark background",
    "wordpress-vs-webflow": "two abstract platforms or foundations side by side, one structured and modular (WordPress), one sleek and flowing (Webflow), blue and gold tones, dark background",
    "how-many-keywords": "a constellation map where stars represent keywords of varying sizes, connected by semantic relationship lines, blue stars with golden cluster highlights, dark background",
    "seo-mistakes": "warning symbols and broken chain links scattered across a dark digital landscape, with blue diagnostic scan lines revealing the problems, golden repair indicators",
    "intent-competition-data": "abstract data visualization with layered charts and graphs floating in space, blue bar charts intersecting with golden trend lines, dark background",
    "optimise-multiple-keywords": "multiple search query streams converging and interweaving into a unified content structure, blue flowing lines merging with golden convergence points, dark background",
}

style_prefix = "Create a minimalist abstract digital illustration. Dark background (#050507). Primary color: electric blue (#5B8AEF). Secondary accent: warm gold (#d79f1e). Clean geometric style, no text, no words, no letters, no UI elements. Suitable as a blog header image. The scene shows: "

generated = 0
failed = 0

for slug, concept in posts.items():
    out_path = out_dir / f"{slug}.png"
    if out_path.exists():
        print(f"SKIP: {slug} (already exists)")
        generated += 1
        continue

    prompt = {"instruction": style_prefix + concept}
    print(f"\nGenerating: {slug}...")

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=[json.dumps(prompt)],
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=types.ImageConfig(aspect_ratio="16:9"),
                ),
            )

            for part in response.candidates[0].content.parts:
                if hasattr(part, "inline_data") and part.inline_data is not None:
                    data = part.inline_data.data
                    if isinstance(data, str):
                        data = base64.b64decode(data)
                    with open(out_path, "wb") as f:
                        f.write(data)
                    print(f"  SAVED: {out_path.name} ({len(data) // 1024}KB)")
                    generated += 1
                    break
            else:
                print(f"  WARN: No image in response for {slug}")
                failed += 1

            break  # success, exit retry loop

        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err:
                wait = 15 * (attempt + 1)
                print(f"  Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"  ERROR: {e}")
                if attempt == 2:
                    failed += 1
                time.sleep(3)

    time.sleep(2)  # gentle rate limiting between requests

print(f"\nDone: {generated} generated, {failed} failed")
