"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchPage } from "@/lib/fetch-page-client";
import {
  schemaRules,
  validateSchema,
  type SchemaIssue,
} from "@/lib/schema-validation";

type Result = { label: string; issues: SchemaIssue[]; types: string[] };
type Group = { level: SchemaIssue["level"]; message: string; paths: string[] };

function typesFrom(text: string): string[] {
  try {
    const data = JSON.parse(
      text.replace(/^<script\b[^>]*>/i, "").replace(/<\/script>\s*$/i, ""),
    );
    const found = new Set<string>();
    const walk = (item: unknown) => {
      if (!item || typeof item !== "object") return;
      if (Array.isArray(item)) {
        item.forEach(walk);
        return;
      }
      const node = item as Record<string, unknown>;
      if (typeof node["@type"] === "string") found.add(node["@type"]);
      Object.values(node).forEach(walk);
    };
    walk(data);
    return [...found];
  } catch {
    return [];
  }
}

function groupIssues(issues: SchemaIssue[]): Group[] {
  const groups = new Map<string, Group>();
  for (const issue of issues) {
    const key = `${issue.level}:${issue.message}`;
    const group = groups.get(key) || {
      level: issue.level,
      message: issue.message,
      paths: [],
    };
    if (!group.paths.includes(issue.path)) group.paths.push(issue.path);
    groups.set(key, group);
  }
  const order = { error: 0, warning: 1, note: 2 };
  return [...groups.values()].sort((a, b) => order[a.level] - order[b.level]);
}

export default function SchemaValidator() {
  const [code, setCode] = useState("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"code" | "url">("code");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    setResults([]);
    try {
      let blocks = [code];
      if (mode === "url") {
        const page = await fetchPage(url.trim());
        if (!/html/i.test(page.contentType))
          throw new Error("The URL did not return HTML.");
        const doc = new DOMParser().parseFromString(page.text, "text/html");
        blocks = [
          ...doc.querySelectorAll('script[type="application/ld+json"]'),
        ].map((element) => element.textContent || "");
        if (!blocks.length)
          throw new Error(
            "No application/ld+json blocks were found in the returned HTML.",
          );
      }
      setResults(
        blocks.map((block, index) => ({
          label: `Block ${index + 1}`,
          issues: validateSchema(block),
          types: typesFrom(block),
        })),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Validation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-hairline bg-wash p-5 dark:bg-white/[0.02] sm:p-7">
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          className="rounded-lg border border-hairline px-4 py-2 text-sm text-foreground aria-pressed:bg-brand/10"
          aria-pressed={mode === "code"}
          onClick={() => setMode("code")}
        >
          Paste JSON-LD
        </button>
        <button
          className="rounded-lg border border-hairline px-4 py-2 text-sm text-foreground aria-pressed:bg-brand/10"
          aria-pressed={mode === "url"}
          onClick={() => setMode("url")}
        >
          Fetch a URL
        </button>
      </div>
      {mode === "code" ? (
        <label className="block text-sm font-medium text-foreground">
          JSON-LD code
          <textarea
            className="mt-2 min-h-56 w-full rounded-lg border border-hairline bg-background p-3 font-mono text-sm text-foreground"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={
              '{"@context":"https://schema.org","@type":"Article","headline":"Example"}'
            }
          />
        </label>
      ) : (
        <label className="block text-sm font-medium text-foreground">
          Page URL
          <input
            type="url"
            className="mt-2 w-full rounded-lg border border-hairline bg-background p-3 text-foreground"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/page/"
          />
        </label>
      )}
      <button
        disabled={busy || !(mode === "code" ? code.trim() : url.trim())}
        onClick={run}
        className="mt-4 rounded-lg bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Checking..." : "Validate schema"}
      </button>
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
      <div aria-live="polite" className="mt-6 space-y-4">
        {results.map((result) => {
          const counts = { error: 0, warning: 0, note: 0 };
          result.issues.forEach((issue) => counts[issue.level]++);
          return (
            <div
              key={result.label}
              className="rounded-lg border border-hairline bg-background p-4"
            >
              <h2 className="font-semibold text-foreground">{result.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {counts.error} errors · {counts.warning} warnings ·{" "}
                {counts.note} notes
              </p>
              {!result.issues.length && (
                <p className="mt-2 text-sm text-muted-foreground">
                  No issues found in this basic check.
                </p>
              )}
              <ul className="mt-3 space-y-3">
                {groupIssues(result.issues).map((group) => (
                  <li
                    key={`${group.level}:${group.message}`}
                    className="text-sm text-muted-foreground"
                  >
                    <strong
                      className={
                        group.level === "error"
                          ? "text-destructive"
                          : "text-foreground"
                      }
                    >
                      {group.level}
                    </strong>{" "}
                    {group.message}{" "}
                    {group.paths.length > 1 && `(${group.paths.length})`}
                    <details className="mt-1">
                      <summary className="cursor-pointer text-brand">
                        Show paths
                      </summary>
                      <ul className="mt-1 list-disc pl-5 font-mono text-xs">
                        {group.paths.map((path) => (
                          <li key={path}>{path}</li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-3">
                {result.types.map((type) => {
                  const rule = schemaRules[type];
                  return rule ? (
                    <span key={type} className="text-sm">
                      <a
                        className="text-brand underline"
                        href={rule.doc}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {type} guidance
                      </a>
                      {rule.generator && (
                        <>
                          {" "}
                          ·{" "}
                          <Link
                            className="text-brand underline"
                            href={`/tools/schema-generator/${rule.generator}/`}
                          >
                            Fix it
                          </Link>
                        </>
                      )}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
