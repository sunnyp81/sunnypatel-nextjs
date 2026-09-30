import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(
  new URL(
    "../src/app/tools/meta-description-generator/MetaDescriptionGenerator.tsx",
    import.meta.url,
  ),
  "utf8",
);
const code = source.slice(
  source.indexOf("type Fields"),
  source.indexOf("function width"),
);
const compiled = ts.transpileModule(code, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const drafts = new Function(`${compiled}\nreturn buildDrafts;`)()({
  topic: "Technical SEO audit",
  keyword: "Technical SEO Audit",
  audience: "UK businesses",
  usp: "a clear list of fixes",
  cta: "Request a review",
});

for (const [index, draft] of drafts.entries()) {
  assert.ok(
    draft.length >= 120 && draft.length <= 155,
    `Draft ${index + 1}: ${draft.length}`,
  );
  assert.match(draft, /technical SEO audit/);
  assert.match(draft, /Get a clear list of fixes\./);
  assert.match(draft, /Request a review\./);
  console.log(`${index + 1}: ${draft.length} characters: ${draft}`);
}
