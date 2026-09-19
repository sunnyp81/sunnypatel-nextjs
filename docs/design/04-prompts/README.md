# Phase 4 generation commands

One command pair per image: generate with Nano Banana Pro, then resize/re-encode with sharp to the hero spec (2400x1350 webp, quality 82, under 250KB). Both approved heroes (`hero-managing-44-websites.webp`, `hero-negative-seo-case-study.webp`) are passed as style references on every call so the model locks onto the established papercraft look rather than drifting.

Run each pair from the repo root (`C:\Users\sunny\repos\sunnypatel-nextjs`). Generated files land in `~/Downloads` by default; the resize step reads from there and writes into `public/images/blog/`.

## Shared reference images

```
REF1=C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-managing-44-websites.webp
REF2=C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-negative-seo-case-study.webp
```

## Per-image commands

### H01, how-many-websites-are-there

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H01-how-many-websites-are-there.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-how-many-websites-are-there.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-how-many-websites-are-there.webp').size)"
```

### H02, top-geo-agencies

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H02-top-geo-agencies.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-top-geo-agencies.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-top-geo-agencies.webp').size)"
```

### H03, uk-dental-marketing-statistics

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H03-uk-dental-marketing-statistics.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-uk-dental-marketing-statistics.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-uk-dental-marketing-statistics.webp').size)"
```

### H04, uk-ecommerce-seo-statistics

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H04-uk-ecommerce-seo-statistics.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-uk-ecommerce-seo-statistics.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-uk-ecommerce-seo-statistics.webp').size)"
```

### H05, ai-referral-traffic-study

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H05-ai-referral-traffic-study.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-ai-referral-traffic-study.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-ai-referral-traffic-study.webp').size)"
```

### H06, autonomous-seo-agent

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H06-autonomous-seo-agent.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-autonomous-seo-agent.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-autonomous-seo-agent.webp').size)"
```

### H07, how-to-add-schema-markup

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H07-how-to-add-schema-markup.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-how-to-add-schema-markup.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-how-to-add-schema-markup.webp').size)"
```

### H08, how-to-calculate-seo-roi

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H08-how-to-calculate-seo-roi.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-how-to-calculate-seo-roi.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-how-to-calculate-seo-roi.webp').size)"
```

### H09, chatgpt-prompts-for-seo

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H09-chatgpt-prompts-for-seo.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-chatgpt-prompts-for-seo.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-chatgpt-prompts-for-seo.webp').size)"
```

### H10, google-open-knowledge-format

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H10-google-open-knowledge-format.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-google-open-knowledge-format.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-google-open-knowledge-format.webp').size)"
```

### H11, seo-consultant-vs-seo-agency

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H11-seo-consultant-vs-seo-agency.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-seo-consultant-vs-seo-agency.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-seo-consultant-vs-seo-agency.webp').size)"
```

### H12, optimise-content-for-ai-search

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H12-optimise-content-for-ai-search.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-optimise-content-for-ai-search.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-optimise-content-for-ai-search.webp').size)"
```

### H13, freelance-seo-consultant-uk

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H13-freelance-seo-consultant-uk.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-freelance-seo-consultant-uk.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-freelance-seo-consultant-uk.webp').size)"
```

### H14, wordpress-vs-webflow

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H14-wordpress-vs-webflow.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-wordpress-vs-webflow.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-wordpress-vs-webflow.webp').size)"
```

### H15, how-to-be-an-seo

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H15-how-to-be-an-seo.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-how-to-be-an-seo.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-how-to-be-an-seo.webp').size)"
```

### H16, seo-semantic-markup-guide

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H16-seo-semantic-markup-guide.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-seo-semantic-markup-guide.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-seo-semantic-markup-guide.webp').size)"
```

### H17, what-is-eeat-seo

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H17-what-is-eeat-seo.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-what-is-eeat-seo.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-what-is-eeat-seo.webp').size)"
```

### H18, optimise-multiple-keywords

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H18-optimise-multiple-keywords.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-optimise-multiple-keywords.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-optimise-multiple-keywords.webp').size)"
```

### H19, increase-organic-traffic

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H19-increase-organic-traffic.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-increase-organic-traffic.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-increase-organic-traffic.webp').size)"
```

### H20, how-many-keywords

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H20-how-many-keywords.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-how-many-keywords.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-how-many-keywords.webp').size)"
```

### H21, technical-seo-vs-on-page-seo

```
python C:\Users\sunny\repos\claude-code-skills\nano-banana\scripts\generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image %REF1% --image %REF2% < C:\Users\sunny\repos\sunnypatel-nextjs\docs\design\04-prompts\H21-technical-seo-vs-on-page-seo.json
```
```
node -e "require('sharp')('%USERPROFILE%\Downloads\<generated-file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-technical-seo-vs-on-page-seo.webp')"
```
```
node -e "const fs=require('fs');console.log(fs.statSync('C:\Users\sunny\repos\sunnypatel-nextjs\public\images\blog\hero-technical-seo-vs-on-page-seo.webp').size)"
```

## Notes

- `<generated-file>` is whatever filename `generate_image.py` writes to `~/Downloads`; check the script's own console output for the exact name before running the sharp step, it is not predictable in advance.
- If the size check prints over 250000, drop the sharp `quality` to 78 and re-run before accepting the file; do not ship an over-budget hero.
- `sharp` resolves from the repo's own `node_modules` because the `node -e` command runs with the repo as the working directory. Run these from `C:\Users\sunny\repos\sunnypatel-nextjs`, not from the `docs\design` folder.
- Generation cost: Gemini 3 Pro Image at 2K is $0.134 per successful image (see `nano-banana/SKILL.md`). Budget 1.5 attempts per image for brand-fidelity misses (banned elements, wrong navy, second light source, stray text).
