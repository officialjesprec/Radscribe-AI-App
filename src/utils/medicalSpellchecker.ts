/**
 * Medical & Radiological Spell-Checking, Acronym Resolution,
 * and Clinical Misinterpretation Safeguard Engine
 */

import {
  MEDICAL_RADIOLOGY_LEXICON,
  RADIOLOGY_ACRONYMS,
  HIGH_RISK_CONFUSIONS,
  MedicalTermEntry,
  RadiologyAcronymEntry,
} from "./medicalDictionary.ts";

export interface FlaggedMedicalIssue {
  id: string;
  type: "misspelling" | "acronym" | "misinterpretation_risk";
  token: string;
  normalizedToken: string;
  startIndex: number;
  endIndex: number;
  suggestions: string[];
  explanation: string;
  dangerLevel: "critical" | "warning" | "advisory" | "info";
  contextSnippet: string;
  acronymDetails?: RadiologyAcronymEntry;
  medicalEntry?: MedicalTermEntry;
}

// Common non-medical valid words and radiological measurement units
export const GENERAL_CLINICAL_WHITELIST = new Set([
  "a", "about", "above", "across", "acute", "adrenal", "after", "again", "against",
  "air", "all", "almost", "also", "although", "always", "am", "an", "and", "anterior",
  "any", "aorta", "apparent", "appear", "appears", "appendix", "are", "area", "artery",
  "as", "at", "attenuation", "axial", "back", "base", "based", "be", "because", "been",
  "before", "being", "below", "benign", "between", "bilateral", "bilaterally", "biopsy",
  "bladder", "bleeding", "blood", "body", "bolus", "bone", "bones", "both", "bowel",
  "brain", "breast", "breasts", "bronchi", "bronchial", "but", "by", "calcification",
  "calcified", "calyces", "canal", "canals", "carcinoma", "cardiac", "case", "catheter",
  "cavity", "central", "cervical", "change", "changes", "chest", "chronic", "clear",
  "clinical", "clinically", "clot", "collection", "colon", "common", "compared", "comparison",
  "compatible", "complex", "computed", "conclusion", "condition", "conduit", "confirmed",
  "conray", "consistent", "consolidation", "contrast", "cord", "coronal", "cortex",
  "cortical", "correlate", "correlation", "cough", "course", "cranial", "cystic",
  "date", "dated", "defect", "defects", "deformity", "degree", "demonstrated", "dense",
  "density", "department", "depth", "desiccation", "detail", "detected", "diameter",
  "diffuse", "dilated", "dilation", "disc", "disease", "distal", "distortion", "diverticulum",
  "duct", "ducts", "due", "during", "each", "early", "edema", "effusion", "either",
  "enhancement", "enhances", "enhancing", "entire", "epidural", "equal", "erosion",
  "evidence", "exam", "examination", "examined", "exiting", "expansion", "extent",
  "extrusion", "fat", "fever", "fibrosis", "filling", "findings", "fine", "first",
  "fluid", "focal", "focus", "follow", "for", "formation", "fossa", "found", "fracture",
  "fragment", "free", "from", "frontal", "further", "gallbladder", "gas", "gastric",
  "given", "gland", "glands", "greater", "has", "have", "head", "heart", "helical",
  "hematoma", "hemorrhage", "hepatic", "herniation", "high", "hilar", "history", "hours",
  "however", "identified", "iliac", "image", "images", "imaging", "immediate", "impacted",
  "impingement", "impression", "in", "included", "indicates", "indication", "infarct",
  "infection", "inferior", "infiltrate", "inflammation", "intact", "intensity", "internal",
  "intervertebral", "interval", "intracranial", "intravenous", "intraventricular", "is",
  "ischemic", "it", "its", "joint", "joints", "kidney", "kidneys", "known", "large",
  "last", "lateral", "left", "lesion", "lesions", "level", "levels", "likely", "limits",
  "line", "lines", "liver", "lobe", "lobes", "local", "location", "long", "loss", "low",
  "lower", "lumbar", "lumen", "lung", "lungs", "lymph", "magnetic", "main", "major",
  "malignancy", "marked", "mass", "masses", "maxillary", "maximal", "may", "mediastinal",
  "mediastinum", "medial", "metabolic", "metastatic", "midline", "mild", "mildly",
  "minimal", "moderate", "mucosa", "mucosal", "multiple", "narrowing", "neck", "negative",
  "nerve", "neurological", "next", "no", "nodal", "nodular", "nodule", "nodules", "none",
  "normal", "not", "noted", "number", "numbers", "oblique", "obscuration", "obvious",
  "occlusion", "of", "off", "on", "once", "one", "onset", "only", "open", "or", "order",
  "ordered", "organ", "osseous", "other", "out", "outer", "over", "pain", "paired",
  "parenchyma", "parietal", "part", "partial", "partially", "particular", "patient",
  "patency", "patent", "pathology", "pelvic", "pelvis", "per", "percent", "perforated",
  "perfusion", "pericardial", "perineal", "period", "peripheral", "peritoneum", "phlegmon",
  "plain", "pleural", "plexus", "point", "pole", "poor", "portal", "position", "positive",
  "posterior", "postoperative", "pre", "present", "presentation", "presents", "pressure",
  "previous", "primary", "prior", "procedure", "process", "projection", "prominent",
  "protrusion", "proximal", "pulmonary", "radiating", "radiograph", "radiographs",
  "radiologist", "radiology", "ratio", "reactive", "reason", "recess", "recommend",
  "recommended", "recovery", "reduce", "region", "related", "relative", "remaining",
  "remarkable", "renal", "report", "reported", "resonance", "respiratory", "result",
  "results", "retention", "retroperitoneal", "review", "rib", "ribs", "right", "rim",
  "ring", "root", "roots", "routine", "rule", "rupture", "sagittal", "same", "scan",
  "scoliosis", "screening", "secondary", "section", "sections", "segment", "segments",
  "seen", "septum", "series", "set", "severe", "severely", "shadow", "shape", "shift",
  "short", "show", "showing", "shown", "shows", "side", "sided", "sign", "signal",
  "signs", "silhouette", "simple", "since", "sinus", "sinuses", "size", "skull", "slice",
  "slight", "slightly", "small", "soft", "solid", "source", "space", "spaces", "spatial",
  "spasm", "spine", "spleen", "splenic", "standard", "stenosis", "stent", "still",
  "stomach", "stranding", "stricture", "structure", "structures", "study", "subacute",
  "subarticular", "subcutaneous", "subpleural", "suggest", "suggested", "suggesting",
  "suggestive", "superior", "surface", "surgery", "surgical", "suspected", "suspicious",
  "symmetrical", "symmetrically", "symptoms", "syndrome", "system", "t1", "t2", "table",
  "tachycardia", "technique", "temporal", "tenderness", "terminal", "test", "than",
  "the", "their", "then", "there", "thickening", "thin", "thoracic", "thorax", "three",
  "through", "time", "times", "tissue", "tissues", "to", "total", "trabecular", "trace",
  "trachea", "tract", "trauma", "tube", "two", "type", "typical", "ultrasound", "under",
  "unremarkable", "up", "upper", "upright", "ureter", "urinary", "valves", "vascular",
  "vein", "veins", "ventricle", "ventricles", "ventricular", "vertebra", "vertebral",
  "vessel", "vessels", "view", "views", "volume", "wall", "walls", "was", "weight",
  "weighted", "well", "were", "what", "when", "where", "which", "while", "white",
  "with", "within", "without", "year", "years", "zone",
  // Radiologic units and abbreviations
  "mm", "cm", "hu", "mgy", "kvp", "mas", "ml", "cc", "mci", "mbq", "ms", "sec", "hz",
  "khz", "mhz", "gy", "sv", "msv", "usv", "mg", "dl", "bpm", "pa", "ap",
]);

/**
 * Compute Levenshtein edit distance between two strings
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Check text against medical radiology terminology, acronyms, and misinterpretation risks
 */
export function analyzeMedicalTerminology(
  text: string,
  customWhitelist: string[] = []
): FlaggedMedicalIssue[] {
  if (!text || !text.trim()) return [];

  const issues: FlaggedMedicalIssue[] = [];
  const customSet = new Set(customWhitelist.map((w) => w.toLowerCase()));

  // 1. Check High-Risk Clinical Confusions / Homophones (e.g. dysphasia vs dysphagia, ileum vs ilium)
  for (const risk of HIGH_RISK_CONFUSIONS) {
    const globalRegex = new RegExp(risk.tokenPattern.source, "gi");
    let match: RegExpExecArray | null;

    while ((match = globalRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      const matchedWord = match[0];
      const start = Math.max(0, matchIndex - 35);
      const end = Math.min(text.length, matchIndex + matchedWord.length + 35);
      const snippet = text.slice(start, end).replace(/\n/g, " ");

      issues.push({
        id: `risk-${matchIndex}-${matchedWord}`,
        type: "misinterpretation_risk",
        token: matchedWord,
        normalizedToken: matchedWord.toLowerCase(),
        startIndex: matchIndex,
        endIndex: matchIndex + matchedWord.length,
        suggestions: [risk.confusedWith],
        explanation: risk.explanation,
        dangerLevel: risk.dangerLevel,
        contextSnippet: snippet,
      });
    }
  }

  // 2. Tokenize words and examine spelling and acronyms
  // Match alphanumeric words with hyphens and slashes (e.g. "BI-RADS", "PA/lateral", "CTPA")
  const wordRegex = /\b[a-zA-Z][a-zA-Z0-9\-_/]*[a-zA-Z0-9]?\b/g;
  let wordMatch: RegExpExecArray | null;

  while ((wordMatch = wordRegex.exec(text)) !== null) {
    const rawWord = wordMatch[0];
    const startIndex = wordMatch.index;
    const endIndex = startIndex + rawWord.length;
    const lowerWord = rawWord.toLowerCase();
    const upperWord = rawWord.toUpperCase();

    // Skip pure numbers or single letters except medical ones (A, B)
    if (rawWord.length <= 1 && lowerWord !== "a") continue;

    // Check if this token was already flagged as a high-risk confusion
    const alreadyFlaggedAsRisk = issues.some(
      (iss) => iss.startIndex === startIndex && iss.endIndex === endIndex
    );
    if (alreadyFlaggedAsRisk) continue;

    // 2a. Check if token matches a recognized Radiology Acronym (e.g. CXR, CTPA, FLAIR, DWI, BI-RADS)
    const matchingAcronym = RADIOLOGY_ACRONYMS.find(
      (acr) => acr.acronym.toUpperCase() === upperWord
    );
    if (matchingAcronym) {
      const start = Math.max(0, startIndex - 25);
      const end = Math.min(text.length, endIndex + 25);
      issues.push({
        id: `acronym-${startIndex}-${upperWord}`,
        type: "acronym",
        token: rawWord,
        normalizedToken: upperWord,
        startIndex,
        endIndex,
        suggestions: [matchingAcronym.expansion],
        explanation: `${matchingAcronym.expansion} (${matchingAcronym.category}): ${matchingAcronym.clinicalContext}`,
        dangerLevel: "info",
        contextSnippet: text.slice(start, end).replace(/\n/g, " "),
        acronymDetails: matchingAcronym,
      });
      continue;
    }

    // 2b. Check if word is valid in general clinical whitelist, medical lexicon, or custom whitelist
    if (
      GENERAL_CLINICAL_WHITELIST.has(lowerWord) ||
      customSet.has(lowerWord) ||
      MEDICAL_RADIOLOGY_LEXICON.some((m) => m.term.toLowerCase() === lowerWord)
    ) {
      continue;
    }

    // 2c. If the word is unknown, calculate distance against the medical lexicon to find close misspellings
    const candidates: Array<{ term: string; dist: number; entry: MedicalTermEntry }> = [];
    for (const med of MEDICAL_RADIOLOGY_LEXICON) {
      const dist = calculateLevenshteinDistance(lowerWord, med.term.toLowerCase());
      // For short words (<=5 chars), allow dist 1; for longer, allow dist <= 2
      const maxAllowed = med.term.length <= 5 ? 1 : 2;
      if (dist <= maxAllowed) {
        candidates.push({ term: med.term, dist, entry: med });
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => a.dist - b.dist);
      const best = candidates.slice(0, 3);
      const topEntry = best[0].entry;
      const start = Math.max(0, startIndex - 30);
      const end = Math.min(text.length, endIndex + 30);

      issues.push({
        id: `misspell-${startIndex}-${rawWord}`,
        type: "misspelling",
        token: rawWord,
        normalizedToken: lowerWord,
        startIndex,
        endIndex,
        suggestions: best.map((b) => b.term),
        explanation: `Potential misspelling of '${best[0].term}' (${topEntry.category}): ${topEntry.definition || ""}`,
        dangerLevel: "warning",
        contextSnippet: text.slice(start, end).replace(/\n/g, " "),
        medicalEntry: topEntry,
      });
    }
  }

  // Sort issues in order of occurrence in the text
  return issues.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Apply a replacement for a flagged term in the report text
 */
export function replaceFlaggedTerm(
  originalText: string,
  issue: FlaggedMedicalIssue,
  replacement: string
): string {
  const before = originalText.substring(0, issue.startIndex);
  const after = originalText.substring(issue.endIndex);
  return before + replacement + after;
}
