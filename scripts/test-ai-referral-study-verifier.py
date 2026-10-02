import copy
import csv
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import unittest

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "public/downloads/verify-ai-referral-study-v2.py"
DATASET = ROOT / "public/downloads/ai-referral-traffic-study-2026-09-21-v2.json"
spec = importlib.util.spec_from_file_location("verifier", SCRIPT)
verifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)


class PublishedStudyTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(DATASET.read_text(encoding="utf-8"))

    def test_published_headlines_and_sensitivity_reproduce(self):
        result = verifier.compute(self.data)
        expected = {"frame_properties": 108, "properties_with_sessions": 104,
                    "properties_without_sessions": 4, "recorded_sessions": 334744,
                    "organic_search_sessions": 77125, "ai_matched_sessions": 6165,
                    "pooled_ai_share_pct": 1.84, "median_property_ai_share_pct": 0.65,
                    "ai_sessions_per_100_organic": 7.99,
                    "chatgpt_share_of_matched_ai_pct": 86.78,
                    "top_10_share_of_matched_ai_pct": 77.11,
                    "properties_with_sessions_but_zero_matched_ai": 36}
        for key, value in expected.items():
            self.assertEqual(result[key], value, key)
        self.assertEqual(result["sensitivity_excluding_largest_property"]["remaining_recorded_sessions"], 237621)
        self.assertEqual(result["sensitivity_excluding_largest_property"]["remaining_ai_matched_sessions"], 5429)
        self.assertEqual(result["sensitivity_excluding_largest_property"]["pooled_ai_share_pct"], 2.28)

    def test_csv_and_json_property_counts_agree(self):
        with DATASET.with_suffix(".csv").open(encoding="utf-8", newline="") as file:
            rows = list(csv.DictReader(file))
        self.assertEqual(len(rows), 108)
        by_site = {row["site_number"]: row for row in rows}
        for row in self.data["properties"]:
            self.assertEqual(by_site[row["site_number"]]["property_sector"], row["sector"])
            for key in ("total_sessions", "organic_sessions", "ai_sessions_total") + tuple(name + "_sessions" for name in verifier.ASSISTANTS):
                self.assertEqual(int(by_site[row["site_number"]][key]), row[key])

    def test_bad_counts_and_duplicate_sites_are_rejected(self):
        for mutation in ("duplicate", "mismatch", "negative"):
            data = copy.deepcopy(self.data)
            if mutation == "duplicate":
                data["properties"].append(data["properties"][0])
            elif mutation == "mismatch":
                data["properties"][0]["chatgpt_sessions"] += 1
            else:
                data["properties"][0]["total_sessions"] = -1
            with self.assertRaises(ValueError):
                verifier.compute(data)

    def test_cli_is_deterministic_and_emits_parseable_json(self):
        command = [sys.executable, str(SCRIPT), str(DATASET)]
        first = subprocess.check_output(command)
        self.assertEqual(first, subprocess.check_output(command))
        self.assertEqual(json.loads(first)["ai_matched_sessions"], 6165)


if __name__ == "__main__":
    unittest.main()
