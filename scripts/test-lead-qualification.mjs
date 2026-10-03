import test from "node:test";
import assert from "node:assert/strict";
import {
  formatQualificationDetails,
  getSupportOfferCopy,
  parseLeadQualification,
  qualificationAnalyticsParams,
} from "../src/lib/lead-qualification.js";

test("qualification accepts URL and bare-domain input and stores only its HTTP(S) origin", () => {
  const cases = [
    [" HTTPS://Example.com/path?email=private@example.com#section ", "https://example.com"],
    ["example.com/path?token=private", "https://example.com"],
    ["www.example.co.uk", "https://www.example.co.uk"],
    ["http://example.com:8080/path", "http://example.com:8080"],
  ];
  for (const [website, origin] of cases) {
    const result = parseLeadQualification({
      website,
      supportType: "ongoing_implementation",
      budget: "1500_plus",
      timing: "within_3_months",
    });
    assert.equal(result.ok, true, website);
    assert.deepEqual(result.value, {
      website: origin,
      websiteOmitted: false,
      supportType: "ongoing_implementation",
      budget: "1500_plus",
      timing: "within_3_months",
    });
  }
});

test("qualification omits an unrecognised optional website without retaining its raw value", () => {
  for (const website of [
    "javascript:alert(1)",
    "ftp://example.com",
    "//example.com",
    "https://user:pass@example.com",
    "https://example..com",
    "https://-example.com",
    "https://example.com:invalid",
    "https://exa mple.com",
    "https://example.com\\@evil.test",
  ]) {
    const result = parseLeadQualification({ website });
    assert.equal(result.ok, true, website);
    assert.equal(result.value.website, "");
    assert.equal(result.value.websiteOmitted, true);
    assert.doesNotMatch(JSON.stringify(result.value), /javascript|ftp|evil|user:pass/i);
  }
  const nonString = parseLeadQualification({ website: { private: "value" } });
  assert.equal(nonString.ok, true);
  assert.deepEqual(nonString.value, {
    website: "",
    websiteOmitted: true,
    supportType: "",
    budget: "",
    timing: "",
  });
  const oversized = parseLeadQualification({ website: `https://${"a".repeat(2050)}.com` });
  assert.equal(oversized.ok, true);
  assert.equal(oversized.value.website, "");
  assert.equal(oversized.value.websiteOmitted, true);
});

test("qualification still rejects invalid enums and non-string enum inputs", () => {
  assert.equal(parseLeadQualification({ supportType: "bespoke_package" }).ok, false);
  assert.equal(parseLeadQualification({ budget: "exactly_999" }).ok, false);
  assert.equal(parseLeadQualification({ timing: ["now"] }).ok, false);
});

test("selected support maps to the existing offer label for contact and service forms", () => {
  assert.equal(getSupportOfferCopy("ongoing_implementation").offerLabel, "Ongoing SEO implementation (from £1,500/month)");
  assert.equal(getSupportOfferCopy("ongoing_advice").offerLabel, "Ongoing SEO advice (£600/month for four hours)");
  assert.equal(getSupportOfferCopy("one_off_audit").offerLabel, "Paid SEO Audit (£495)");
  assert.equal(getSupportOfferCopy("single_session").offerLabel, "Single SEO consulting session (£200)");
  assert.equal(getSupportOfferCopy("quarterly_strategy_review").offerLabel, "Quarterly strategy review (£500)");
  assert.equal(getSupportOfferCopy("not_sure").offerLabel, "Free 20-minute SEO diagnosis");
  assert.equal(getSupportOfferCopy("unknown"), null);
});

test("legacy payloads remain valid and delivery details describe a selection, not a qualification decision", () => {
  const result = parseLeadQualification({ name: "Existing lead", email: "lead@example.com", message: "Hello" });
  assert.equal(result.ok, true);
  const details = formatQualificationDetails(result.value);
  assert.deepEqual(details, [
    "Selected support: Not selected",
    "Website: Not provided",
    "Monthly budget: Not provided",
    "Timing: Not provided",
  ]);

  const selected = parseLeadQualification({ supportType: "ongoing_advice", website: "https://example.com/path" });
  assert.equal(selected.ok, true);
  assert.match(formatQualificationDetails(selected.value)[0], /Selected support: Ongoing advice/);
  assert.doesNotMatch(formatQualificationDetails(selected.value).join("\n"), /qualified lead/i);
  const single = parseLeadQualification({ supportType: "single_session" });
  assert.equal(single.ok, true);
  assert.match(formatQualificationDetails(single.value)[0], /Single consulting session/);
});

test("analytics receives only the allowlisted support category", () => {
  assert.deepEqual(qualificationAnalyticsParams("ongoing_advice"), { support_type: "ongoing_advice" });
  assert.deepEqual(qualificationAnalyticsParams("unknown"), {});
  assert.deepEqual(qualificationAnalyticsParams(undefined), {});
});
