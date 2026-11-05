import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sparkles,
  ArrowRight,
  Plus,
  X,
  ShieldAlert,
  Info,
  Check,
  Zap,
} from "lucide-react";
import { FlaggedMedicalIssue } from "../utils/medicalSpellchecker.ts";

interface MedicalSpellcheckPanelProps {
  issues: FlaggedMedicalIssue[];
  isOpen: boolean;
  onClose: () => void;
  onApplyFix: (issue: FlaggedMedicalIssue, replacement: string) => void;
  onIgnore: (issueId: string) => void;
  onAddToLexicon: (word: string) => void;
  customLexicon: string[];
}

export const MedicalSpellcheckPanel: React.FC<MedicalSpellcheckPanelProps> = ({
  issues,
  isOpen,
  onClose,
  onApplyFix,
  onIgnore,
  onAddToLexicon,
  customLexicon,
}) => {
  const [filterType, setFilterType] = useState<"all" | "misspelling" | "acronym" | "misinterpretation_risk">("all");
  const [newLexiconTerm, setNewLexiconTerm] = useState("");

  const filteredIssues = issues.filter((iss) => {
    if (filterType === "all") return true;
    return iss.type === filterType;
  });

  const misspellCount = issues.filter((i) => i.type === "misspelling").length;
  const acronymCount = issues.filter((i) => i.type === "acronym").length;
  const riskCount = issues.filter((i) => i.type === "misinterpretation_risk").length;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] bg-[#161619] border-l border-[#27272A] shadow-2xl flex flex-col text-neutral-200 animate-in slide-in-from-right duration-200"
      role="region"
      aria-labelledby="spellcheck-panel-title"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#0A1930] border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 id="spellcheck-panel-title" className="text-xs font-bold tracking-wider uppercase text-white font-sans">
              Radiology Lexicon & Spell-Checker
            </h2>
            <p className="text-[10px] text-neutral-400">
              ACR & RSNA verified medical terminology database
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/5 transition-colors"
          aria-label="Close spellcheck panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#27272A] bg-[#121214] text-[11px] font-mono">
        <button
          onClick={() => setFilterType("all")}
          className={`flex-1 py-2.5 px-3 border-b-2 text-center transition-colors ${
            filterType === "all"
              ? "border-emerald-500 text-white bg-white/5 font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          All ({issues.length})
        </button>
        <button
          onClick={() => setFilterType("misspelling")}
          className={`flex-1 py-2.5 px-3 border-b-2 text-center transition-colors ${
            filterType === "misspelling"
              ? "border-amber-500 text-amber-300 bg-white/5 font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Spelling ({misspellCount})
        </button>
        <button
          onClick={() => setFilterType("acronym")}
          className={`flex-1 py-2.5 px-3 border-b-2 text-center transition-colors ${
            filterType === "acronym"
              ? "border-blue-500 text-blue-300 bg-white/5 font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Acronyms ({acronymCount})
        </button>
        <button
          onClick={() => setFilterType("misinterpretation_risk")}
          className={`flex-1 py-2.5 px-3 border-b-2 text-center transition-colors ${
            filterType === "misinterpretation_risk"
              ? "border-rose-500 text-rose-300 bg-white/5 font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Risks ({riskCount})
        </button>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/50" />
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              No Issues Detected
            </h4>
            <p className="text-[11px] max-w-xs leading-relaxed">
              All medical terms, radiological findings, and clinical acronyms conform to ACR/RSNA standard guidelines.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className={`p-3.5 rounded-xl border text-xs flex flex-col gap-2 transition-all ${
                issue.type === "misinterpretation_risk"
                  ? "bg-rose-500/10 border-rose-500/30"
                  : issue.type === "misspelling"
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-blue-500/10 border-blue-500/30"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  {issue.type === "misinterpretation_risk" ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : issue.type === "misspelling" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                  <span className="font-mono text-sm tracking-wide text-white">
                    "{issue.token}"
                  </span>
                </div>

                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold tracking-wider ${
                    issue.dangerLevel === "critical"
                      ? "bg-rose-600 text-white"
                      : issue.dangerLevel === "warning"
                      ? "bg-amber-500/30 text-amber-200 border border-amber-500/40"
                      : "bg-blue-500/20 text-blue-200 border border-blue-500/30"
                  }`}
                >
                  {issue.type === "misinterpretation_risk"
                    ? "Misinterpretation Risk"
                    : issue.type === "misspelling"
                    ? "Spelling Error"
                    : "Radiology Acronym"}
                </span>
              </div>

              {/* Context Snippet */}
              <div className="text-[11px] text-neutral-400 bg-black/30 p-2 rounded border border-white/5 font-sans leading-relaxed">
                "...{issue.contextSnippet}..."
              </div>

              {/* Explanation & Definition */}
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                {issue.explanation}
              </p>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-white/5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {issue.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => onApplyFix(issue, sug)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                        issue.type === "misinterpretation_risk"
                          ? "bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
                          : issue.type === "misspelling"
                          ? "bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                      }`}
                      title={issue.type === "acronym" ? `Expand to '${sug}'` : `Replace with '${sug}'`}
                    >
                      <span>
                        {issue.type === "acronym" ? "Expand to:" : "Replace with:"}
                      </span>
                      <strong className="underline">{sug}</strong>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <button
                    onClick={() => onIgnore(issue.id)}
                    className="text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Ignore
                  </button>
                  {issue.type === "misspelling" && (
                    <button
                      onClick={() => onAddToLexicon(issue.token)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      + Add to Lexicon
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Lexicon Term Drawer */}
      <div className="p-3.5 bg-[#111113] border-t border-[#27272A] flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="font-semibold text-white">Department Lexicon</span>
          <span className="text-[10px] font-mono text-neutral-500">
            {customLexicon.length} custom hospital terms
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newLexiconTerm}
            onChange={(e) => setNewLexiconTerm(e.target.value)}
            placeholder="Add surgeon name, hospital acronym..."
            className="flex-1 bg-[#1A1A1E] border border-[#2D2D33] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newLexiconTerm.trim()) {
                onAddToLexicon(newLexiconTerm.trim());
                setNewLexiconTerm("");
              }
            }}
          />
          <button
            onClick={() => {
              if (newLexiconTerm.trim()) {
                onAddToLexicon(newLexiconTerm.trim());
                setNewLexiconTerm("");
              }
            }}
            disabled={!newLexiconTerm.trim()}
            className="px-3 py-1.5 rounded-lg bg-[#0A1930] hover:bg-[#112240] border border-blue-500/40 text-blue-200 text-xs font-semibold disabled:opacity-40 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
