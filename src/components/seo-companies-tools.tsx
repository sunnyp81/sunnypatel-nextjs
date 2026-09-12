"use client";

import { useState } from "react";
import { proposalCriteria, seoNeeds } from "@/data/seo-companies";
import styles from "./seo-companies-guide.module.css";

type FinderCompany = { id: string; name: string; needs: readonly string[]; fit: string; scope: string; owned?: boolean };
type ProposalCriterion = { name: string; weight: number; prompt: string };

export function SeoCompanyFinder({ companies, needs = seoNeeds, caption = "UK SEO providers: suggested fit and scope to confirm" }: {
  companies: readonly FinderCompany[]; needs?: readonly { id: string; label: string }[]; caption?: string;
}) {
  const [need, setNeed] = useState("all");
  const matches = companies.filter((company) => need === "all" || company.needs.includes(need));
  return (
    <div>
      <div className={styles.filterBar}>
        <label htmlFor="seo-need">What do you need help with?</label>
        <select id="seo-need" value={need} onChange={(event) => setNeed(event.target.value)}>
          {needs.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
        <p role="status">Showing {matches.length} of {companies.length} providers</p>
      </div>
      <p id="comparison-scroll-help" className={styles.small}>Choose a name to read its profile. On a small screen, scroll the table sideways.</p>
      <div className={styles.tableFrame} role="region" aria-label="SEO provider comparison" aria-describedby="comparison-scroll-help" tabIndex={0}>
        <table className={styles.comparison}>
          <caption>{caption}</caption>
          <thead><tr><th scope="col">Provider</th><th scope="col">Consider for</th><th scope="col">Before you request a quote</th></tr></thead>
          <tbody>{matches.map((company) => <tr key={company.id} className={company.owned ? styles.ownedRow : undefined}>
            <th scope="row"><a href={`#${company.id}`}>{company.name}</a>{company.needs.includes("consultant") && <span className={styles.tableNote}>{company.owned ? "Consultant / guide author" : "Consultant"}</span>}</th>
            <td>{company.fit}</td><td>{company.scope}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

const initialNames = ["Proposal A", "Proposal B", "Proposal C"];
export function SeoProposalScorecard({ criteria = proposalCriteria, pageUrl = "https://sunnypatel.co.uk/blog/best-seo-companies-uk/", title = "Compare three proposals on the same terms", downloadTitle = "SEO PROPOSAL COMPARISON", downloadFilename = "seo-proposal-comparison.txt" }: {
  criteria?: readonly ProposalCriterion[]; pageUrl?: string; title?: string; downloadTitle?: string; downloadFilename?: string;
}) {
  const emptyScores = () => initialNames.map(() => criteria.map(() => ""));
  const [names, setNames] = useState(initialNames);
  const [scores, setScores] = useState<string[][]>(emptyScores);
  const [notice, setNotice] = useState("");
  const totals = scores.map((row) => Math.round(row.reduce((total, value, index) => total + (Number(value) / 5) * criteria[index].weight, 0)));
  const hasScores = scores.some((row) => row.some((value) => value !== ""));

  function saveComparison() {
    const body = [downloadTitle, "Your own ratings, not an independent assessment.",
      "Scale: 0 = absent; 1 = weak; 2 = partial; 3 = adequate; 4 = strong; 5 = excellent.",
      pageUrl, "",
      ...names.flatMap((name, index) => [name || initialNames[index],
        ...criteria.map((criterion, criterionIndex) => `${criterion.name} (${criterion.weight}%): ${scores[index][criterionIndex] === "" ? "Not scored" : `${scores[index][criterionIndex]}/5`}`),
        scores[index].every((score) => score !== "") ? `Weighted total: ${totals[index]}/100` : "Total: incomplete", ""]),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = downloadFilename; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Your text copy has been prepared for download.");
  }

  return (
    <section id="proposal-scorecard" className={styles.section} aria-labelledby="scorecard-title">
      <p className={styles.eyebrow}>Make the decision</p>
      <h2 id="scorecard-title">{title}</h2>
      <p>Rate the evidence in each proposal from 0 to 5. These are suggested buying criteria and your own scores, not ratings of the providers above. A serious concern about methods or ownership should outweigh a high total.</p>
      <p className={styles.small}>0 = absent; 1 = weak; 2 = partial; 3 = adequate; 4 = strong; 5 = excellent. Total = the sum of each rating ÷ 5 × its weight. Complete all five criteria to see a total.</p>
      <div className={styles.scoreGrid}>
        {names.map((name, index) => <fieldset key={index} className={styles.proposal}>
          <legend>{initialNames[index]}</legend>
          <label htmlFor={`proposal-${index}`}>Provider name</label>
          <input id={`proposal-${index}`} maxLength={80} value={name} onChange={(event) => setNames(names.map((value, i) => i === index ? event.target.value : value))} />
          {criteria.map((criterion, criterionIndex) => <div className={styles.rating} key={criterion.name}>
            <label htmlFor={`rating-${index}-${criterionIndex}`}>{criterion.name} <span>{criterion.weight}%</span></label>
            <p id={`help-${index}-${criterionIndex}`}>{criterion.prompt}</p>
            <select id={`rating-${index}-${criterionIndex}`} aria-describedby={`help-${index}-${criterionIndex}`} value={scores[index][criterionIndex]} onChange={(event) => {
              setScores(scores.map((row, rowIndex) => rowIndex === index ? row.map((value, colIndex) => colIndex === criterionIndex ? event.target.value : value) : row));
              setNotice("");
            }}>
              <option value="">Not scored</option>
              {["0 - Absent", "1 - Weak", "2 - Partial", "3 - Adequate", "4 - Strong", "5 - Excellent"].map((label, value) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>)}
          <p className={styles.score} aria-live="polite" aria-atomic="true">{scores[index].every((value) => value !== "") ? <><strong>{totals[index]}</strong> / 100</> : <><strong>{scores[index].filter((value) => value !== "").length}/5</strong> criteria scored</>}</p>
        </fieldset>)}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={saveComparison} disabled={!hasScores}>Save your comparison (.txt)</button>
        <button type="button" className={styles.secondary} onClick={() => { setNames([...initialNames]); setScores(emptyScores()); setNotice("All proposal names and scores have been reset."); }}>Reset scorecard</button>
      </div>
      <p className={styles.small}>Your entries stay in this page and reset when you reload. Save a text copy before leaving.</p>
      <p role="status" className={styles.small}>{notice}</p>
    </section>
  );
}
