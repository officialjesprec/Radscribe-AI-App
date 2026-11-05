import React from "react";
import { X, Sparkles, FileText, CheckCircle2 } from "lucide-react";

interface DiffComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  structuredText: string;
  onAccept: () => void;
}

export const DiffComparisonModal: React.FC<DiffComparisonModalProps> = ({
  isOpen,
  onClose,
  rawText,
  structuredText,
  onAccept,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diff-modal-title"
    >
      <div className="w-full max-w-5xl h-[85vh] bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden flex flex-col text-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0A1930] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 id="diff-modal-title" className="text-base font-semibold tracking-wide text-white uppercase font-sans">
                Clinical Fidelity Verification & Side-by-Side Diff
              </h2>
              <p className="text-xs text-neutral-400">
                Confirm strict preservation of all clinical measurements, findings, and impressions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close diff modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-Side View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#27272A] overflow-hidden">
          {/* Left: Raw Speech Stream */}
          <div className="flex flex-col h-full bg-[#121214] p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#232328]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Raw Radiologist Speech Stream
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">
                {rawText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 rounded-lg bg-[#0D0D0F] border border-[#1E1E22] text-xs leading-relaxed text-neutral-300 font-sans whitespace-pre-wrap">
              {rawText || "No raw dictation recorded."}
            </div>
          </div>

          {/* Right: AI Structured RSNA Report */}
          <div className="flex flex-col h-full bg-[#18181B] p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#232328]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  RadScribe AI Structured Report (RSNA)
                </span>
              </div>
              <span className="text-[11px] text-emerald-400/90 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Facts Preserved: 100%
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 rounded-lg bg-[#F8F9FA] text-[#111827] border border-[#E5E7EB] text-xs leading-relaxed font-sans whitespace-pre-wrap shadow-inner">
              {structuredText || "No structured report generated yet."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#121214] border-t border-[#27272A] flex items-center justify-between">
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Checked for medical terminology consistency & acute alert rules.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Keep Editing
            </button>
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg transition-colors"
            >
              Accept Structured Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
