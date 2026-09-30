"use client";

import { useState } from "react";

type Fields = {
  topic: string;
  keyword: string;
  audience: string;
  usp: string;
  cta: string;
};

const tidy = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
const sentence = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) + "." : "";

function naturalKeyword(value: string): string {
  const words = tidy(value).split(" ");
  return words
    .map((word) => {
      if (/[A-Z].*[A-Z]|[a-z][A-Z]/.test(word)) return word;
      return word.charAt(0).toLowerCase() + word.slice(1);
    })
    .join(" ");
}

function buildDrafts(fields: Fields): string[] {
  const topic = tidy(fields.topic);
  const keyword = naturalKeyword(fields.keyword);
  const audience = tidy(fields.audience);
  const usp = tidy(fields.usp);
  const cta = tidy(fields.cta);
  const subject = topic.toLowerCase().includes(keyword.toLowerCase())
    ? topic.charAt(0).toLowerCase() + topic.slice(1)
    : keyword;
  const article = /^(?:[aeiou]|seo\b|ai\b|xml\b|llm\b)/i.test(subject)
    ? "an"
    : "a";
  const scope = audience ? ` for ${audience}` : "";
  const benefit = usp
    ? /^(we|our|I|my|you|the)\b/i.test(usp)
      ? sentence(usp)
      : sentence(`Get ${usp}`)
    : "";
  const action = cta
    ? sentence(`${cta} to discuss the next step for your site`)
    : "";
  const patterns = [
    [
      `Find guidance on your ${subject}${scope} and what to consider next.`,
      benefit,
      action,
    ],
    [
      `Compare what matters for your ${subject}${scope} before planning the work.`,
      benefit,
      action,
    ],
    [
      `Review the key details in your ${subject}${scope} before acting.`,
      benefit,
      action,
    ],
    [
      `Get a clearer view of your ${subject}${scope} before choosing your next step.`,
      benefit,
      action,
    ],
    [
      `See what ${article} ${subject} means${audience ? ` for ${audience}` : " for your page"} and what may need attention first.`,
      benefit,
      action,
    ],
    [
      `Plan your next step with ${article} ${subject}${scope} and a clearer view of the work involved.`,
      benefit,
      action,
    ],
  ];
  return patterns.map((parts) => {
    const full = parts.filter(Boolean).join(" ");
    if (full.length <= 155) return full;
    const shorterAction = sentence(cta);
    const shorter = [parts[0], benefit, shorterAction]
      .filter(Boolean)
      .join(" ");
    return shorter.length >= 120 ? shorter : full;
  });
}

function width(value: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return value.length * 7;
  context.font = "14px Arial";
  return Math.round(context.measureText(value).width);
}

function highlight(value: string, keyword: string) {
  const at = value.toLowerCase().indexOf(keyword.toLowerCase());
  if (!keyword || at < 0) return value;
  return (
    <>
      {value.slice(0, at)}
      <span className="rounded bg-brand/20 text-foreground">
        {value.slice(at, at + keyword.length)}
      </span>
      {value.slice(at + keyword.length)}
    </>
  );
}

export default function MetaDescriptionGenerator() {
  const [fields, setFields] = useState<Fields>({
    topic: "",
    keyword: "",
    audience: "",
    usp: "",
    cta: "",
  });
  const [results, setResults] = useState<string[]>([]);
  const labels: Record<keyof Fields, string> = {
    topic: "Page topic",
    keyword: "Primary keyword",
    audience: "Audience or location",
    usp: "Unique selling point",
    cta: "Call to action",
  };
  const closest = results.reduce(
    (best, draft, index) =>
      Math.abs(width(draft) - 920) < Math.abs(width(results[best] || "") - 920)
        ? index
        : best,
    0,
  );

  return (
    <section className="rounded-xl border border-hairline bg-wash p-5 dark:bg-white/[0.02] sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.keys(fields) as (keyof Fields)[]).map((key) => (
          <label key={key} className="text-sm font-medium text-foreground">
            {labels[key]}
            {key === "topic" || key === "keyword" ? " *" : ""}
            <input
              value={fields[key]}
              onChange={(event) =>
                setFields({ ...fields, [key]: event.target.value })
              }
              className="mt-2 w-full rounded-lg border border-hairline bg-background p-3 text-foreground"
            />
          </label>
        ))}
      </div>
      <button
        disabled={!fields.topic.trim() || !fields.keyword.trim()}
        onClick={() => setResults(buildDrafts(fields))}
        className="mt-5 rounded-lg bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        Generate six descriptions
      </button>
      {results.length > 0 && (
        <div className="mt-7 space-y-3">
          <h2 className="text-xl font-bold text-foreground">Six drafts</h2>
          <p className="text-sm text-muted-foreground">
            Desktop guide: around 920 px. Mobile guide: around 680 px. These are
            estimates, not fixed Google limits.
          </p>
          {results.map((value, index) => {
            const pixels = width(value);
            const outsideRange = value.length < 120 || value.length > 160;
            return (
              <div
                key={index}
                className="rounded-lg border border-hairline bg-background p-4"
              >
                {index === closest && (
                  <p className="mb-2 text-xs font-semibold text-brand">
                    Closest to the desktop guide
                  </p>
                )}
                <p className="break-words text-sm leading-relaxed text-foreground">
                  {highlight(value, naturalKeyword(fields.keyword))}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`text-xs ${outsideRange ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
                  >
                    {value.length} characters
                    {outsideRange ? " · outside 120 to 160 characters" : ""} ·
                    about {pixels} px ·{" "}
                    {pixels <= 680
                      ? "within mobile guide"
                      : pixels <= 920
                        ? "within desktop guide"
                        : "over desktop guide"}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(value)}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-foreground"
                  >
                    Copy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
