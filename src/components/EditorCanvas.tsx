import React, { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Undo2,
  Redo2,
  Copy,
  Download,
  Printer,
  Sparkles,
  AlertTriangle,
  FileCheck,
  Check,
  FileText,
  RotateCcw,
} from "lucide-react";
import { MedicalHomophoneCheck } from "../utils/radiologyRules.ts";
import { FlaggedMedicalIssue } from "../utils/medicalSpellchecker.ts";

interface EditorCanvasProps {
  content: string;
  onChange: (newContent: string) => void;
  criticalAlerts: string[];
  homophoneRisks: MedicalHomophoneCheck[];
  onApplyHomophoneFix: (original: string, replacement: string) => void;
  onExportDocx: () => void;
  onCopyToPacs: () => void;
  copiedToClipboard: boolean;
  onInsertMacro: (macroTitle: string, macroBody: string) => void;
  isFormatting: boolean;
  lastFormattedTime: string | null;
  patientInfo: {
    name: string;
    mrn: string;
    accession: string;
    modality: string;
  };
  flaggedIssues: FlaggedMedicalIssue[];
  onOpenSpellcheck: () => void;
  lastAutosavedTime?: string | null;
  onClearAutosavedDraft?: () => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  content,
  onChange,
  criticalAlerts,
  homophoneRisks,
  onApplyHomophoneFix,
  onExportDocx,
  onCopyToPacs,
  copiedToClipboard,
  onInsertMacro,
  isFormatting,
  lastFormattedTime,
  patientInfo,
  flaggedIssues = [],
  onOpenSpellcheck,
  lastAutosavedTime,
  onClearAutosavedDraft,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync cursor / selection operations
  const executeFormatting = (prefix: string, suffix: string = "") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);

    const replacement = `${prefix}${selected || "TEXT"}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onChange(newContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  const handlePrint = () => {
    window.print();
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split("\n").length : 0;

  return (
    <div className="flex flex-col h-full bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden shadow-2xl">
      {/* Top Document Header & PACS Demographics Bar */}
      <div className="px-5 py-3 bg-[#0A1930] border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white tracking-wide uppercase font-sans">
              Clinical Document Canvas
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-neutral-300 font-mono text-[11px] bg-black/30 px-3 py-1 rounded-md border border-white/5">
            <span>
              PT: <strong className="text-white">{patientInfo.name}</strong>
            </span>
            <span className="text-neutral-500">|</span>
            <span>
              MRN: <strong className="text-white">{patientInfo.mrn}</strong>
            </span>
            <span className="text-neutral-500">|</span>
            <span>
              ACC: <strong className="text-white">{patientInfo.accession}</strong>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCopyToPacs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#112240] hover:bg-[#1A365D] border border-blue-500/30 text-white font-medium text-xs transition-colors shadow-sm"
            title="Copy plain-text formatted report to clipboard for Epic Radiant / Cerner / Sectra PACS"
          >
            {copiedToClipboard ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Copied to PACS!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-300" />
                <span>Copy to PACS</span>
              </>
            )}
          </button>

          <button
            onClick={onExportDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
            title="Generate and download standard clinical .docx report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .DOCX</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors"
            title="Print or Save as PDF"
            aria-label="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Critical Findings Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-[#D9381E]/15 border-b border-[#D9381E]/40 px-5 py-2.5 flex items-center justify-between text-xs text-rose-200 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D9381E] shrink-0" />
            <span className="font-bold text-rose-300 uppercase tracking-wider">
              Critical Result Detected:
            </span>
            <span className="text-neutral-100 font-medium">
              {criticalAlerts[0]}
            </span>
          </div>
          <span className="text-[10px] bg-[#D9381E] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Mandatory Escalation
          </span>
        </div>
      )}

      {/* Homophone Safeguard Warning Bar */}
      {homophoneRisks.length > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-300">
              Acoustic Homophone Safeguard:
            </span>
            {homophoneRisks.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onApplyHomophoneFix(item.original, item.suggested)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-[11px] text-amber-100 transition-colors cursor-pointer"
                title={item.explanation}
              >
                <span>Replace "{item.original}" with</span>
                <strong className="underline text-white font-bold">{item.suggested}</strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formatting & Macro Inserter Ribbon */}
      <div className="px-4 py-2 bg-[#202024] border-b border-[#2C2C30] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => executeFormatting("**", "**")}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Bold (Ctrl+B)"
            aria-label="Bold text"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => executeFormatting("*", "*")}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Italic (Ctrl+I)"
            aria-label="Italic text"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => executeFormatting("<u>", "</u>")}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Underline"
            aria-label="Underline text"
          >
            <Underline className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-neutral-700 mx-1" />
          <button
            onClick={() => executeFormatting("### ")}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Section Heading"
            aria-label="Section heading"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => executeFormatting("- ")}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Bullet List"
            aria-label="Bullet list"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => executeFormatting("1. ")}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Numbered Impression"
            aria-label="Numbered impression"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-neutral-700 mx-1" />
          {/* Medical Spellcheck & Acronym Inspector Button */}
          <button
            onClick={onOpenSpellcheck}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
              flaggedIssues.length > 0
                ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            }`}
            title="Inspect medical spelling, abbreviations, and clinical term misinterpretation risks"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Medical Spellcheck</span>
            {flaggedIssues.length > 0 ? (
              <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono">
                {flaggedIssues.length}
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-mono">Clean</span>
            )}
          </button>
        </div>

        {/* Quick Normal Template Macros */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-neutral-400 font-medium">Insert Macro:</span>
          {[
            {
              label: "Normal Chest",
              body: "Lungs are clear bilaterally. Cardiomediastinal silhouette within normal limits. No acute osseous abnormality.",
            },
            {
              label: "Normal Head CT",
              body: "No acute intracranial hemorrhage, mass effect, or midline shift. Ventricles and basal cisterns unremarkable.",
            },
            {
              label: "Normal Abdomen",
              body: "Liver, gallbladder, pancreas, spleen, adrenal glands, and kidneys unremarkable. No free air or free fluid.",
            },
            {
              label: "Clear Impression",
              body: "1. No acute cardiopulmonary or intracranial abnormality.\n2. Normal examination.",
            },
          ].map((macro) => (
            <button
              key={macro.label}
              onClick={() => onInsertMacro(macro.label, macro.body)}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              + {macro.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Editor Canvas (PRD: Soft cream / off-white #F8F9FA paper canvas) */}
      <div className="flex-1 relative bg-[#1E1E1E] p-4 sm:p-6 overflow-y-auto flex justify-center">
        <div
          data-editor-canvas="true"
          className="w-full max-w-4xl bg-[#F8F9FA] text-[#111827] rounded-lg shadow-lg border border-[#E5E7EB] p-8 sm:p-12 min-h-[520px] flex flex-col font-sans transition-all relative"
        >
          {/* Subtle Hospital Watermark / Header */}
          <div className="border-b-2 border-[#0A1930] pb-3 mb-6 flex items-start justify-between">
            <div>
              <h1 className="font-bold text-sm tracking-wide text-[#0A1930] uppercase font-sans">
                Department of Radiology & Imaging Sciences
              </h1>
              <p className="text-[11px] text-[#4B5563] tracking-wider uppercase">
                Diagnostic Radiology Diagnostic Report • RadScribe Verified
              </p>
            </div>
            <div className="text-right text-[11px] text-[#4B5563]">
              <div className="font-semibold text-[#111827]">
                STATUS: {isFormatting ? "FORMATTING WITH AI..." : "FINAL SIGNED DRAFT"}
              </div>
              <div className="font-mono text-[10px] text-[#6B7280]">
                {lastFormattedTime ? `Structured: ${lastFormattedTime}` : "Direct Input Mode"}
              </div>
            </div>
          </div>

          {/* Actual Editable Text Area */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            data-ignore-ptt="true"
            placeholder="Dictated raw text will automatically format here into standardized RSNA sections (Examination, Clinical Indication, Technique, Findings, Impression)..."
            className="w-full flex-1 bg-transparent resize-none border-none outline-none text-[#111827] text-sm leading-relaxed font-sans focus:ring-0 focus:outline-none placeholder:text-[#9CA3AF]"
            style={{
              minHeight: "420px",
              lineHeight: "1.75",
            }}
          />

          {/* Electronic Signature Block at bottom of paper */}
          <div className="mt-8 pt-4 border-t border-[#D1D5DB] flex items-center justify-between text-xs text-[#4B5563]">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Verified Radiologist Attestation: <strong>Staff Radiologist, MD, DABR</strong>
              </span>
            </div>
            <div className="font-mono text-[10px] text-[#6B7280]">
              RadScribe AI Engine v2.4 • Structured RSNA Standard
            </div>
          </div>
        </div>
      </div>

      {/* Editor Footer Status Bar */}
      <div className="px-5 py-2.5 bg-[#121214] border-t border-[#27272A] flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 font-sans">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="text-neutral-200">{wordCount}</strong></span>
          <span>Lines: <strong className="text-neutral-200">{lineCount}</strong></span>
          <span>Est. Reading Time: <strong className="text-neutral-200">{Math.ceil((wordCount / 200) * 60)}s</strong></span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span
            className="inline-flex items-center gap-1.5 text-emerald-400 font-medium"
            title="Editor content automatically persists to local storage every 5 seconds to prevent data loss"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {lastAutosavedTime
                ? `Autosaved to LocalStorage (${lastAutosavedTime})`
                : "Autosave Active (Every 5s)"}
            </span>
          </span>
          {onClearAutosavedDraft && (
            <button
              onClick={onClearAutosavedDraft}
              className="text-neutral-500 hover:text-neutral-300 transition-colors text-[10px] underline"
              title="Clear persisted draft from local storage"
            >
              Reset Draft
            </button>
          )}
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-400">Shortcut: Press Space outside editor to Dictate</span>
        </div>
      </div>
    </div>
  );
};
