import assert from "node:assert/strict";
import { readFileSync, appendFileSync } from "node:fs";

const deployment = JSON.parse(readFileSync(process.argv[2] || "previous-worker-deployment.json", "utf8"));
assert.equal(deployment.versions?.length, 1, "Release requires one active Worker version");
const [{ version_id: version, percentage }] = deployment.versions;
assert.equal(percentage, 100, "Release requires 100% on the previous Worker");
assert(/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(version), "Invalid Worker version");
assert(process.env.GITHUB_OUTPUT, "GitHub Actions output path is required");
appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
console.log(`Recorded previous Worker version ${version}`);
