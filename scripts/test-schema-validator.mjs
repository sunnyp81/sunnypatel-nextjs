import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/lib/schema-validation.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const exports = {};
new Function("exports", compiled)(exports);
const { validateSchema } = exports;

const context = "https://schema.org";
const cases = [
  {
    name: "valid Product with Offer",
    input: JSON.stringify({
      "@context": context,
      "@type": "Product",
      name: "Example",
      image: "https://example.com/image.jpg",
      description: "Example product",
      brand: "Example",
      offers: {
        "@type": "Offer",
        price: "10",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        url: "https://example.com/product",
      },
    }),
    expectedErrors: 0,
  },
  {
    name: "Product missing offers, review and aggregateRating",
    input: JSON.stringify({
      "@context": context,
      "@type": "Product",
      name: "Example",
    }),
    expectedErrors: 1,
  },
  {
    name: "broken JSON",
    input: '{\n  "@context": "https://schema.org",\n  "@type": "Article",\n}',
    expectedErrors: 1,
    line: 4,
  },
  {
    name: "Article without headline",
    input: JSON.stringify({
      "@context": context,
      "@type": "Article",
      author: {
        "@type": "Person",
        name: "Example",
      },
    }),
    expectedErrors: 0,
    expectedWarnings: 1,
  },
  {
    name: "Service offer under makesOffer",
    input: JSON.stringify({
      "@context": context,
      "@type": "Organization",
      name: "Example",
      makesOffer: {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Audit" },
      },
    }),
    expectedErrors: 0,
  },
];

for (const fixture of cases) {
  const issues = validateSchema(fixture.input);
  const errors = issues.filter((issue) => issue.level === "error").length;
  const warnings = issues.filter((issue) => issue.level === "warning").length;
  const notes = issues.filter((issue) => issue.level === "note").length;
  assert.equal(errors, fixture.expectedErrors, fixture.name);
  if (fixture.expectedWarnings !== undefined) {
    assert.equal(warnings, fixture.expectedWarnings, fixture.name);
  }
  if (fixture.line)
    assert.match(issues[0].message, new RegExp(`line ${fixture.line}`));
  console.log(
    `${fixture.name}: ${errors} errors, ${warnings} warnings, ${notes} notes`,
  );
}

const response = await fetch("https://sunnypatel.co.uk/");
assert.equal(response.ok, true, "homepage fetch");
const html = await response.text();
const blocks = [
  ...html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  ),
];
const homepage = blocks.flatMap((match) => validateSchema(match[1]));
const counts = {
  errors: homepage.filter((issue) => issue.level === "error").length,
  warnings: homepage.filter((issue) => issue.level === "warning").length,
  notes: homepage.filter((issue) => issue.level === "note").length,
};
console.log(
  `sunnypatel.co.uk homepage (${blocks.length} blocks): ${counts.errors} errors, ${counts.warnings} warnings, ${counts.notes} notes`,
);
for (const issue of homepage)
  console.log(`  ${issue.level} ${issue.path}: ${issue.message}`);
assert.equal(
  counts.errors,
  0,
  JSON.stringify(homepage.filter((issue) => issue.level === "error")),
);
