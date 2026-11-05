/**
 * Radiology text parsing, terminology safeguards, critical alert detection,
 * and structured report utilities for RadScribe AI.
 */

export interface StructuredReportSections {
  studyType: string;
  clinicalIndication: string;
  technique: string;
  comparison: string;
  findings: string[];
  impression: string[];
  criticalAlert?: string | null;
  radsClassification?: string | null;
}

export interface MedicalHomophoneCheck {
  original: string;
  suggested: string;
  explanation: string;
  detectedIndex: number;
}

// Common homophones and speech-to-text confusion pairs in radiology
export const MEDICAL_HOMOPHONE_MAP: Array<{
  pattern: RegExp;
  term: string;
  opposite: string;
  explanation: string;
}> = [
  {
    pattern: /\bdysphasia\b/i,
    term: "dysphasia",
    opposite: "dysphagia",
    explanation: "'dysphasia' relates to speech impairment; 'dysphagia' relates to swallowing difficulty common in GI/neck studies.",
  },
  {
    pattern: /\bdysphagia\b/i,
    term: "dysphagia",
    opposite: "dysphasia",
    explanation: "'dysphagia' is difficulty swallowing; verify if patient has speech impairment ('dysphasia') instead.",
  },
  {
    pattern: /\bilium\b/i,
    term: "ilium",
    opposite: "ileum",
    explanation: "'ilium' is the pelvic bone; 'ileum' is the distal portion of the small intestine.",
  },
  {
    pattern: /\bileum\b/i,
    term: "ileum",
    opposite: "ilium",
    explanation: "'ileum' is the small intestine; 'ilium' is the pelvic bone.",
  },
  {
    pattern: /\bperoneal\b/i,
    term: "peroneal",
    opposite: "perineal",
    explanation: "'peroneal' refers to the fibular leg region; 'perineal' refers to the pelvic floor/perineum.",
  },
  {
    pattern: /\bperineal\b/i,
    term: "perineal",
    opposite: "peroneal",
    explanation: "'perineal' refers to pelvic floor; 'peroneal' refers to the lateral lower leg.",
  },
  {
    pattern: /\bmetaphysis\b/i,
    term: "metaphysis",
    opposite: "epiphysis / diaphysis",
    explanation: "Verify bone segment: metaphysis (growth zone) vs epiphysis (end) vs diaphysis (shaft).",
  },
];

// High-priority critical findings requiring immediate emergency communication
export const CRITICAL_ALERT_PATTERNS: Array<{ pattern: RegExp; alert: string }> = [
  {
    pattern: /tension pneumothorax|large pneumothorax with mediastinal shift/i,
    alert: "CRITICAL: Tension Pneumothorax detected - requires immediate decompression notification.",
  },
  {
    pattern: /intracranial hemorr|subdural hematoma with midline shift|subarachnoid hemorr|epidural hematoma/i,
    alert: "CRITICAL: Acute Intracranial Hemorrhage / Mass Effect - urgent neurosurgical consult.",
  },
  {
    pattern: /acute pulmonary embol|saddle pulmonary embol/i,
    alert: "CRITICAL: Acute Pulmonary Embolism identified - notify ordering team immediately.",
  },
  {
    pattern: /aortic dissection|type a dissection|ruptured aneurysm/i,
    alert: "CRITICAL: Acute Aortic Syndrome / Dissection - emergency vascular escalation.",
  },
  {
    pattern: /free intra-abdominal air|pneumoperitoneum|bowel perforation/i,
    alert: "CRITICAL: Free Air / Pneumoperitoneum - potential acute bowel perforation.",
  },
  {
    pattern: /testicular torsion|ovarian torsion|absent blood flow/i,
    alert: "CRITICAL: Acute Torsion / Ischemia - time-sensitive surgical emergency.",
  },
  {
    pattern: /cauda equina|cord compression with canal stenosis/i,
    alert: "CRITICAL: Acute Spinal Cord / Cauda Equina Compression.",
  },
];

/**
 * Detect critical alert conditions in text
 */
export function detectCriticalAlerts(text: string): string[] {
  if (!text) return [];
  const alerts: string[] = [];
  for (const { pattern, alert } of CRITICAL_ALERT_PATTERNS) {
    if (pattern.test(text)) {
      alerts.push(alert);
    }
  }
  return alerts;
}

/**
 * Identify medical homophone risks in transcript
 */
export function inspectHomophones(text: string): MedicalHomophoneCheck[] {
  if (!text) return [];
  const findings: MedicalHomophoneCheck[] = [];
  for (const item of MEDICAL_HOMOPHONE_MAP) {
    const match = item.pattern.exec(text);
    if (match) {
      findings.push({
        original: match[0],
        suggested: item.opposite,
        explanation: item.explanation,
        detectedIndex: match.index,
      });
    }
  }
  return findings;
}

/**
 * Parse structured radiology sections from formatted text
 */
export function parseRadiologyReport(rawText: string): StructuredReportSections {
  const result: StructuredReportSections = {
    studyType: "RADIOLOGY EXAMINATION",
    clinicalIndication: "Not specified",
    technique: "Standard departmental protocol",
    comparison: "None available",
    findings: [],
    impression: [],
    criticalAlert: null,
    radsClassification: null,
  };

  if (!rawText || !rawText.trim()) return result;

  // Extract Study Type
  const studyMatch = rawText.match(/(?:EXAMINATION|STUDY|EXAM):\s*([^\n]+)/i);
  if (studyMatch && studyMatch[1]) {
    result.studyType = studyMatch[1].trim();
  }

  // Extract Clinical Indication / History
  const indMatch = rawText.match(/(?:CLINICAL INDICATION|INDICATION|HISTORY|REASON FOR EXAM):\s*([^\n]+(?:\n(?!TECHNIQUE|COMPARISON|FINDINGS|IMPRESSION)[^\n]+)*)/i);
  if (indMatch && indMatch[1]) {
    result.clinicalIndication = indMatch[1].trim();
  }

  // Extract Technique
  const techMatch = rawText.match(/(?:TECHNIQUE|PROTOCOL):\s*([^\n]+(?:\n(?!COMPARISON|FINDINGS|IMPRESSION)[^\n]+)*)/i);
  if (techMatch && techMatch[1]) {
    result.technique = techMatch[1].trim();
  }

  // Extract Comparison
  const compMatch = rawText.match(/(?:COMPARISON|PRIOR EXAMS?):\s*([^\n]+(?:\n(?!FINDINGS|IMPRESSION)[^\n]+)*)/i);
  if (compMatch && compMatch[1]) {
    result.comparison = compMatch[1].trim();
  }

  // Extract Findings
  const findingsMatch = rawText.match(/(?:FINDINGS):\s*([\s\S]*?)(?=(?:IMPRESSION|CONCLUSION|RECOMMENDATIONS?|$))/i);
  if (findingsMatch && findingsMatch[1]) {
    const lines = findingsMatch[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.match(/^(?:FINDINGS):/i));
    result.findings = lines;
  }

  // Extract Impression
  const impressionMatch = rawText.match(/(?:IMPRESSION|CONCLUSION):\s*([\s\S]*?)(?=(?:CRITICAL|SIGNATURE|ATTENDING|BI-RADS|LUNG-RADS|$))/i);
  if (impressionMatch && impressionMatch[1]) {
    const lines = impressionMatch[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    result.impression = lines;
  }

  // Check for RADS score (BI-RADS, Lung-RADS, TI-RADS, LI-RADS, PI-RADS)
  const radsMatch = rawText.match(/\b(BI-RADS|Lung-RADS|TI-RADS|LI-RADS|PI-RADS|Fleischner)\s*(?:Category|Class)?\s*[:\s-]?\s*([0-6A-Za-z]+)/i);
  if (radsMatch) {
    result.radsClassification = `${radsMatch[1]} ${radsMatch[2]}`.trim();
  }

  // Critical alerts
  const alerts = detectCriticalAlerts(rawText);
  if (alerts.length > 0) {
    result.criticalAlert = alerts[0];
  }

  return result;
}

/**
 * Calculate clinical dictation metrics (word count, WPM, reading time)
 */
export function calculateDictationMetrics(text: string, durationSeconds: number) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characterCount = text.length;
  const minutes = durationSeconds > 0 ? durationSeconds / 60 : 0;
  const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
  const estimatedReadTimeSec = Math.ceil((words / 200) * 60);

  return {
    words,
    characterCount,
    wpm,
    estimatedReadTimeSec,
  };
}

/**
 * Clean spoken punctuation words into standard punctuation marks
 */
export function cleanSpokenPunctuation(text: string): string {
  if (!text) return "";
  return text
    .replace(/\bperiod\b/gi, ".")
    .replace(/\bcomma\b/gi, ",")
    .replace(/\bsemicolon\b/gi, ";")
    .replace(/\bcolon\b/gi, ":")
    .replace(/\bquestion mark\b/gi, "?")
    .replace(/\bnew line\b/gi, "\n")
    .replace(/\bnext line\b/gi, "\n")
    .replace(/\bnew paragraph\b/gi, "\n\n")
    .replace(/\bnext section\b/gi, "\n\n")
    .replace(/\s+([.,;:?])/g, "$1")
    .replace(/\bnumber one\b/gi, "\n1.")
    .replace(/\bnumber two\b/gi, "\n2.")
    .replace(/\bnumber three\b/gi, "\n3.")
    .replace(/\bnumber four\b/gi, "\n4.");
}

/**
 * Generate standard clean RSNA-compliant template if raw transcription needs fallback structure
 */
export function generateStandardTemplate(
  examName: string,
  rawTranscript: string,
  indication: string = "Routine clinical evaluation"
): string {
  const cleanedText = cleanSpokenPunctuation(rawTranscript).trim();

  // If the raw text already contains an impression, separate it
  const impressionSplit = cleanedText.split(/impression\s*[:\n]/i);
  const findingsPart = impressionSplit[0] || cleanedText || "Normal radiological anatomy. No acute abnormality demonstrated.";
  const impressionPart = impressionSplit[1]
    ? impressionSplit[1].trim()
    : "1. No acute cardiopulmonary or osseous abnormality.\n2. Clinical correlation recommended.";

  return `EXAMINATION: ${examName.toUpperCase()}
CLINICAL INDICATION: ${indication}
TECHNIQUE: Standard multiplanar acquisition.
COMPARISON: None available.

FINDINGS:
${findingsPart.trim()}

IMPRESSION:
${impressionPart}`;
}
