"use client";

import { useEffect, useState } from "react";
import styles from "./update-monitor.module.css";

const DAY = 86400000;

// Computed in the browser so the day count stays current between deploys.
export function RolloutProgress({ start }: { start: string }) {
  const [day, setDay] = useState<number | null>(null);
  useEffect(() => {
    setDay(Math.max(1, Math.floor((Date.now() - Date.parse(start)) / DAY) + 1));
  }, [start]);
  if (day === null) return null;
  const pct = Math.min(100, (day / 14) * 100);
  return (
    <div className={styles.progress}>
      <p>
        {day <= 14 ? `Day ${day} of Google's 2-week estimate` : `Day ${day}: past Google's 2-week estimate, not yet marked complete`}
      </p>
      <div className={styles.progressTrack} aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
