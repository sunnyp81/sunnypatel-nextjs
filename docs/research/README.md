# Research package boundary

The versioned package contains the AI Overview protocols, fixed panel and study configuration, reviewed-input contract, collection and analysis scripts, and offline tests.

Start with the [current study status](ai-overview-citation-status.md), [operations runbook](ai-overview-citation-runbook.md), and [analysis/publication workflow](ai-overview-citation-publication-workflow.md). The [next CTR and AI referral protocols](next-studies-protocols.md) are separate drafts: their panels and matching rules have not been frozen, and no data have been collected for those editions.

Raw provider responses, screenshots, task envelopes, the execution registry, account records, review workspaces, and generated runtime freezes remain under `tmp/ctr-aio/` and are intentionally excluded from Git. Versioned reports may retain selected run identifiers and aggregate metadata. Links from historical reports or operational notes into `tmp/ctr-aio/` refer to private local evidence and will not resolve in a clean checkout. Do not copy those artifacts into the repository to repair the links.

Credentials are also outside the repository. Collection requires an absolute path supplied through `DATAFORSEO_CREDENTIALS_PATH`; the credential file must not be placed under the project root.

Run the offline research checks from the repository root with:

```powershell
$env:AIO_TEST_WITH_LOCAL_W1_EVIDENCE = '0'
node --test scripts/research/*.test.mjs
$ResearchTestExit = $LASTEXITCODE
Remove-Item Env:AIO_TEST_WITH_LOCAL_W1_EVIDENCE
if ($ResearchTestExit -ne 0) { throw "Research tests failed." }
```

The environment flag disables three W1 export integration cases even when their private evidence is present. A separate pilot-accounting integration case skips automatically when its saved proof is absent. An actual clean Windows checkout passes 60 tests and skips those four private-evidence cases; the full local archive passes all 64. The tests make no provider requests and perform no paid operations. On Windows, the scheduler tests exercise PowerShell planning and fail-closed execution paths; those cases are skipped on other operating systems.

For the active study, restore the original `frozen-v1` directory, execution registry, and wave evidence from the private archive before resuming collection or review. The restored freeze must retain the original registration timestamp and hashes from before W1.

Do not initialize a new freeze for the active study: a new registration timestamp would postdate W1 and fail the prospective registration gate. The bare command below is an offline initialization step only for a genuinely new study that has not started collection:

```powershell
node scripts/research/aio-citation-study.mjs
```

The versioned [freeze manifest](./ai-overview-citation-freeze-manifest.json) records the original registration timestamp, seven source paths, byte counts, and SHA-256 values. Git attributes pin those source files to LF so their registered byte hashes remain stable across checkouts.
