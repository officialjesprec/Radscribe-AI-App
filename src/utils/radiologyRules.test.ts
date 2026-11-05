import test from "node:test";
import assert from "node:assert/strict";
import {
  detectCriticalAlerts,
  inspectHomophones,
  parseRadiologyReport,
  calculateDictationMetrics,
  generateStandardTemplate,
  cleanSpokenPunctuation,
} from "./radiologyRules.ts";

test("detectCriticalAlerts flags tension pneumothorax", () => {
  const text = "Left-sided large tension pneumothorax with mediastinal shift to the right.";
  const alerts = detectCriticalAlerts(text);
  assert.equal(alerts.length, 1);
  assert.match(alerts[0], /Tension Pneumothorax/i);
});

test("detectCriticalAlerts returns empty for normal reports", () => {
  const text = "Clear lungs bilaterally. Normal cardiac silhouette. No acute fractures.";
  const alerts = detectCriticalAlerts(text);
  assert.equal(alerts.length, 0);
});

test("detectCriticalAlerts flags acute pulmonary embolism", () => {
  const text = "CTA CHEST: Acute pulmonary embolism in the right main pulmonary artery.";
  const alerts = detectCriticalAlerts(text);
  assert.equal(alerts.length, 1);
  assert.match(alerts[0], /Pulmonary Embolism/i);
});

test("inspectHomophones catches ilium vs ileum confusion", () => {
  const text = "Inflammation of the terminal ilium consistent with Crohn disease.";
  const homophones = inspectHomophones(text);
  assert.equal(homophones.length, 1);
  assert.equal(homophones[0].original.toLowerCase(), "ilium");
  assert.equal(homophones[0].suggested, "ileum");
});

test("inspectHomophones catches dysphagia vs dysphasia", () => {
  const text = "Patient presents with progressive dysphasia when swallowing solid food.";
  const homophones = inspectHomophones(text);
  assert.equal(homophones.length, 1);
  assert.equal(homophones[0].suggested, "dysphagia");
});

test("parseRadiologyReport extracts structured sections correctly", () => {
  const report = `
EXAMINATION: CHEST X-RAY 2 VIEWS
CLINICAL INDICATION: Chronic cough, rule out infiltrate
TECHNIQUE: Upright PA and lateral chest radiographs.
COMPARISON: CXR dated January 12, 2025.

FINDINGS:
Lungs are clear without focal consolidation, pneumothorax, or effusion.
Cardiomediastinal silhouette is within normal limits.
Osseous structures are intact.

IMPRESSION:
1. No acute cardiopulmonary disease.
2. Stable examination compared to prior.
`;

  const parsed = parseRadiologyReport(report);
  assert.equal(parsed.studyType, "CHEST X-RAY 2 VIEWS");
  assert.match(parsed.clinicalIndication, /Chronic cough/);
  assert.match(parsed.technique, /Upright PA and lateral/);
  assert.match(parsed.comparison, /January 12, 2025/);
  assert.equal(parsed.findings.length, 3);
  assert.equal(parsed.impression.length, 2);
  assert.equal(parsed.criticalAlert, null);
});

test("calculateDictationMetrics computes WPM and reading time accurately", () => {
  const sampleText = "The lungs are clear bilaterally without evidence of focal consolidation or pleural effusion.";
  const metrics = calculateDictationMetrics(sampleText, 6); // 13 words in 6 seconds = ~130 WPM
  assert.equal(metrics.words, 13);
  assert.equal(metrics.wpm, 130);
  assert.ok(metrics.estimatedReadTimeSec > 0);
});

test("generateStandardTemplate provides structured fallback with study header", () => {
  const template = generateStandardTemplate("MRI BRAIN WITH AND WITHOUT CONTRAST", "No intracranial mass or acute infarct.");
  assert.match(template, /EXAMINATION: MRI BRAIN WITH AND WITHOUT CONTRAST/);
  assert.match(template, /CLINICAL INDICATION:/);
  assert.match(template, /FINDINGS:/);
  assert.match(template, /IMPRESSION:/);
});

test("cleanSpokenPunctuation replaces spoken words with proper clinical punctuation", () => {
  const spoken = "Lungs clear bilaterally period No effusion comma no pneumothorax period Number one normal exam period";
  const cleaned = cleanSpokenPunctuation(spoken);
  assert.equal(cleaned.includes("period"), false);
  assert.equal(cleaned.includes("comma"), false);
  assert.match(cleaned, /Lungs clear bilaterally\./);
  assert.match(cleaned, /No effusion, no pneumothorax\./);
  assert.match(cleaned, /1\./);
});
