// Rebuild the public CSV/JSON downloads for uk-marketing-salary-statistics from src/data/marketing-salaries.json.
// Run after editing the data file: node scripts/export-marketing-salaries.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("../src/data/marketing-salaries.json", import.meta.url), "utf8"));
const publicDir = new URL("../public/", import.meta.url);
mkdirSync(new URL("downloads/", publicDir), { recursive: true });

const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const nationalColumns = ["soc", "title", "jobsThousand", "jobsCvPct", "median", "medianChangePct", "medianCvPct", "mean", "meanChangePct", "meanCvPct", "p10", "p25", "p75", "p75CvPct", "p75Quality", "p90"];
const regionalColumns = ["region", "soc2432Median", "soc2432MedianCvPct", "soc2432Quality", "soc3554Median", "soc3554MedianCvPct", "soc3554Quality"];

const nationalRows = [nationalColumns, ...data.national.map((row) => nationalColumns.map((key) => row[key]))];
const regionalRows = [regionalColumns, ...data.regional.map((row) => regionalColumns.map((key) => row[key]))];

const metaRows = [
  ["Reference period", data.referencePeriod],
  ["Annual pay period", data.annualPayPeriodNote],
  ["Published", data.publishedDate],
  ["Next release", data.nextReleaseDate],
].map((row) => row.map(cell).join(","));

const csv =
  [`"UK Marketing Salary Statistics 2026 - ONS ASHE 2025 provisional, full-time employees, gross annual pay"`, ""].join("\r\n") +
  "\r\n" +
  metaRows.join("\r\n") +
  "\r\n\r\n" +
  [`"National, by SOC 2020 unit group (UK)"`].join("\r\n") +
  "\r\n" +
  nationalRows.map((row) => row.map(cell).join(",")).join("\r\n") +
  "\r\n\r\n" +
  [`"Regional median, SOC 2432 and 3554 (Great Britain, Table 15 excludes Northern Ireland)"`].join("\r\n") +
  "\r\n" +
  regionalRows.map((row) => row.map(cell).join(",")).join("\r\n") +
  "\r\n";

writeFileSync(new URL("downloads/uk-marketing-salaries-2026.csv", publicDir), "﻿" + csv, "utf8");
writeFileSync(new URL("downloads/uk-marketing-salaries-2026.json", publicDir), JSON.stringify(data, null, 2) + "\n", "utf8");

console.log(`Exported ${data.national.length} national rows and ${data.regional.length} regional rows.`);
