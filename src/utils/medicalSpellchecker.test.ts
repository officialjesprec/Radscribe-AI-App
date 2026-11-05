import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateLevenshteinDistance,
  analyzeMedicalTerminology,
  replaceFlaggedTerm,
} from "./medicalSpellchecker.ts";

test("calculateLevenshteinDistance computes accurate edit differences", () => {
  assert.equal(calculateLevenshteinDistance("pneumothorax", "pneumothorax"), 0);
  assert.equal(calculateLevenshteinDistance("pneumothorx", "pneumothorax"), 1); // 1 deletion
  assert.equal(calculateLevenshteinDistance("atelectisis", "atelectasis"), 1); // 1 substitution
  assert.equal(calculateLevenshteinDistance("pancreatits", "pancreatitis"), 1);
});

test("analyzeMedicalTerminology flags misspelled medical terms with suggestions", () => {
  const text = "Dense consolidation with mild atelectisis and small left pneumothorx.";
  const issues = analyzeMedicalTerminology(text);

  const atelectasisIssue = issues.find((i) => i.token.toLowerCase() === "atelectisis");
  assert.ok(atelectasisIssue, "Should flag 'atelectisis'");
  assert.equal(atelectasisIssue?.type, "misspelling");
  assert.equal(atelectasisIssue?.suggestions[0], "atelectasis");

  const pneumoIssue = issues.find((i) => i.token.toLowerCase() === "pneumothorx");
  assert.ok(pneumoIssue, "Should flag 'pneumothorx'");
  assert.equal(pneumoIssue?.suggestions[0], "pneumothorax");
});

test("analyzeMedicalTerminology recognizes common radiology acronyms", () => {
  const text = "Prior CXR and CTPA demonstrate stable mediastinum. MRI brain FLAIR shows periventricular demyelination.";
  const issues = analyzeMedicalTerminology(text);

  const cxrIssue = issues.find((i) => i.token === "CXR");
  assert.ok(cxrIssue, "Should recognize 'CXR'");
  assert.equal(cxrIssue?.type, "acronym");
  assert.equal(cxrIssue?.suggestions[0], "Chest X-Ray");

  const ctpaIssue = issues.find((i) => i.token === "CTPA");
  assert.ok(ctpaIssue, "Should recognize 'CTPA'");
  assert.equal(ctpaIssue?.suggestions[0], "Computed Tomography Pulmonary Angiography");

  const flairIssue = issues.find((i) => i.token === "FLAIR");
  assert.ok(flairIssue, "Should recognize 'FLAIR'");
  assert.equal(flairIssue?.suggestions[0], "Fluid-Attenuated Inversion Recovery");
});

test("analyzeMedicalTerminology flags high-risk acoustic confusions and homophones", () => {
  const text = "Patient with progressive dysphasia for solids and inflammation of the terminal ilium.";
  const issues = analyzeMedicalTerminology(text);

  const dysphasiaRisk = issues.find((i) => i.token.toLowerCase() === "dysphasia");
  assert.ok(dysphasiaRisk, "Should flag 'dysphasia' confusion risk");
  assert.equal(dysphasiaRisk?.type, "misinterpretation_risk");
  assert.equal(dysphasiaRisk?.suggestions[0], "dysphagia");
  assert.equal(dysphasiaRisk?.dangerLevel, "critical");

  const iliumRisk = issues.find((i) => i.token.toLowerCase() === "ilium");
  assert.ok(iliumRisk, "Should flag 'ilium' confusion risk");
  assert.equal(iliumRisk?.suggestions[0], "ileum");
  assert.equal(iliumRisk?.dangerLevel, "critical");
});

test("replaceFlaggedTerm correctly substitutes text preserving formatting", () => {
  const text = "Lungs clear without pneumothorx or effusion.";
  const issues = analyzeMedicalTerminology(text);
  const target = issues.find((i) => i.token === "pneumothorx")!;
  const corrected = replaceFlaggedTerm(text, target, "pneumothorax");
  assert.equal(corrected, "Lungs clear without pneumothorax or effusion.");
});

test("analyzeMedicalTerminology respects custom hospital lexicon", () => {
  const customWord = "omnipaque350";
  const text = `Administered 100 cc of ${customWord} intravenously.`;
  const issuesWithoutCustom = analyzeMedicalTerminology(text);
  const issuesWithCustom = analyzeMedicalTerminology(text, [customWord]);

  assert.equal(issuesWithCustom.some((i) => i.token.toLowerCase() === customWord), false);
});
