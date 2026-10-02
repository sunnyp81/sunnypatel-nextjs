"""Recompute edition-2 statistics from its public anonymised JSON, offline.

Usage: python verify-ai-referral-study-v2.py ai-referral-traffic-study-2026-09-21-v2.json
This verifies aggregate arithmetic, not raw GA4 attribution or human identity.
"""

import argparse
import hashlib
import json
from pathlib import Path
from statistics import median


ASSISTANTS = ("chatgpt", "copilot", "perplexity", "claude", "gemini")


def compute(data):
    rows = data["properties"]
    if not rows:
        raise ValueError("The property frame is empty")
    seen = set()
    for row in rows:
        if row["site_number"] in seen:
            raise ValueError("Duplicate anonymous site number")
        seen.add(row["site_number"])
        fields = ("total_sessions", "organic_sessions", "ai_sessions_total") + tuple(
            name + "_sessions" for name in ASSISTANTS
        )
        if any(type(row[key]) is not int or row[key] < 0 for key in fields):
            raise ValueError("Session counts must be non-negative integers")
        if sum(row[name + "_sessions"] for name in ASSISTANTS) != row["ai_sessions_total"]:
            raise ValueError("Assistant counts do not sum to the row's AI total")
        if row["ai_sessions_total"] > row["total_sessions"] or row["organic_sessions"] > row["total_sessions"]:
            raise ValueError("A subset exceeds the row's total sessions")
    active = [row for row in rows if row["total_sessions"] > 0]
    if not active:
        raise ValueError("No properties have recorded sessions")
    sessions = sum(row["total_sessions"] for row in active)
    organic = sum(row["organic_sessions"] for row in active)
    ai = sum(row["ai_sessions_total"] for row in active)
    largest = max(active, key=lambda row: row["total_sessions"])
    remaining_sessions = sessions - largest["total_sessions"]
    pct = lambda numerator, denominator: round(100 * numerator / denominator, 2) if denominator else None
    return {
        "window": data["window"],
        "frame_properties": len(rows),
        "properties_with_sessions": len(active),
        "properties_without_sessions": len(rows) - len(active),
        "recorded_sessions": sessions,
        "organic_search_sessions": organic,
        "ai_matched_sessions": ai,
        "pooled_ai_share_pct": pct(ai, sessions),
        "ai_sessions_per_100_organic": pct(ai, organic),
        "median_property_ai_share_pct": round(median(100 * row["ai_sessions_total"] / row["total_sessions"] for row in active), 2),
        "properties_with_sessions_but_zero_matched_ai": sum(row["ai_sessions_total"] == 0 for row in active),
        "assistant_counts": {name: sum(row[name + "_sessions"] for row in active) for name in ASSISTANTS},
        "chatgpt_share_of_matched_ai_pct": pct(sum(row["chatgpt_sessions"] for row in active), ai),
        "top_10_share_of_matched_ai_pct": pct(sum(row["ai_sessions_total"] for row in sorted(active, key=lambda row: row["ai_sessions_total"], reverse=True)[:10]), ai),
        "sensitivity_excluding_largest_property": {
            "anonymous_site_number": largest["site_number"],
            "excluded_recorded_sessions": largest["total_sessions"],
            "excluded_ai_matched_sessions": largest["ai_sessions_total"],
            "remaining_recorded_sessions": remaining_sessions,
            "remaining_ai_matched_sessions": ai - largest["ai_sessions_total"],
            "pooled_ai_share_pct": pct(ai - largest["ai_sessions_total"], remaining_sessions),
        },
        "verification_scope": "Arithmetic from published property aggregates; no raw GA4 re-extraction, source reclassification, citation count or human-visit authentication",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dataset", type=Path, help="Downloaded edition-2 JSON file")
    args = parser.parse_args()
    try:
        raw = args.dataset.read_bytes()
        result = compute(json.loads(raw.decode("utf-8")))
    except (OSError, KeyError, ValueError, TypeError) as exc:
        parser.exit(1, "Cannot verify dataset: " + str(exc) + "\n")
    result["dataset_sha256"] = hashlib.sha256(raw).hexdigest()
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
