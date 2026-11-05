import React, { useState, useEffect, useCallback } from "react";
import {
  Mic,
  Activity,
  Download,
  Copy,
  Printer,
  Sparkles,
  Sliders,
  ShieldCheck,
  FileText,
  Volume2,
  RefreshCw,
  Columns,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  Database,
  Check,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useDictationEngine } from "./hooks/useDictationEngine.ts";
import { EditorCanvas } from "./components/EditorCanvas.tsx";
import { DictationHUD } from "./components/DictationHUD.tsx";
import { WorklistSidebar, SAMPLE_WORKLIST, WorklistItem } from "./components/WorklistSidebar.tsx";
import { MicrophoneCheckModal } from "./components/MicrophoneCheckModal.tsx";
import { DiffComparisonModal } from "./components/DiffComparisonModal.tsx";
import { downloadReportAsDocx } from "./utils/docxExport.ts";
import {
  detectCriticalAlerts,
  inspectHomophones,
  parseRadiologyReport,
  generateStandardTemplate,
  MedicalHomophoneCheck,
} from "./utils/radiologyRules.ts";
import { ClinicalPreset, CLINICAL_PRESETS } from "./data/clinicalPresets.ts";
import { MedicalSpellcheckPanel } from "./components/MedicalSpellcheckPanel.tsx";
import {
  analyzeMedicalTerminology,
  replaceFlaggedTerm,
  FlaggedMedicalIssue,
} from "./utils/medicalSpellchecker.ts";
import {
  saveDraftToStorage,
  loadDraftFromStorage,
  clearDraftFromStorage,
  formatAutosaveTime,
} from "./utils/autosave.ts";

export default function App() {
  // Navigation & Modal states
  const [isMicCheckOpen, setIsMicCheckOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [currentHotkey, setCurrentHotkey] = useState(" "); // Default: Spacebar
  const [worklistItems, setWorklistItems] = useState<WorklistItem[]>(SAMPLE_WORKLIST);
  const [selectedStudy, setSelectedStudy] = useState<WorklistItem>(SAMPLE_WORKLIST[0]);

  // Editor and report content states
  const [editorContent, setEditorContent] = useState<string>("");
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [lastFormattedTime, setLastFormattedTime] = useState<string | null>(null);
  const [criticalAlerts, setCriticalAlerts] = useState<string[]>([]);
  const [homophoneRisks, setHomophoneRisks] = useState<MedicalHomophoneCheck[]>([]);
  const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);
  const [isSendingHl7, setIsSendingHl7] = useState<boolean>(false);
  const [hl7SentSuccess, setHl7SentSuccess] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [lastAutosaveTimestamp, setLastAutosaveTimestamp] = useState<string | null>(null);

  // Spell-checking and radiology terminology state
  const [isSpellcheckOpen, setIsSpellcheckOpen] = useState(false);
  const [customLexicon, setCustomLexicon] = useState<string[]>([
    "Omnipaque",
    "Visipaque",
    "Isovue",
    "Gadavist",
    "ProHance",
    "Radiant",
  ]);
  const [ignoredIssueIds, setIgnoredIssueIds] = useState<string[]>([]);

  // Dynamically analyze medical terminology, acronyms, and misinterpretation risks
  const flaggedIssues = React.useMemo(() => {
    const raw = analyzeMedicalTerminology(editorContent, customLexicon);
    return raw.filter((iss) => !ignoredIssueIds.includes(iss.id));
  }, [editorContent, customLexicon, ignoredIssueIds]);

  const handleApplySpellcheckFix = (issue: FlaggedMedicalIssue, replacement: string) => {
    const updated = replaceFlaggedTerm(editorContent, issue, replacement);
    setEditorContent(updated);
    showNotice(`Applied fix: "${issue.token}" → "${replacement}"`);
  };

  const handleIgnoreSpellcheck = (issueId: string) => {
    setIgnoredIssueIds((prev) => [...prev, issueId]);
    showNotice("Issue dismissed for current session.");
  };

  const handleAddToLexicon = (word: string) => {
    setCustomLexicon((prev) => [...prev, word]);
    showNotice(`Added "${word}" to Department Lexicon.`);
  };

  // Initialize dictation engine hook
  const {
    isRecording,
    isLocked,
    isStreaming,
    rawTranscript,
    interimTranscript,
    audioWaveformData,
    audioLevelDb,
    latencyMs,
    dictationDurationSec,
    wordCount,
    startRecording,
    stopRecording,
    toggleLock,
    streamPresetDictation,
    setRawTranscript,
    clearTranscript,
  } = useDictationEngine({
    hotkey: currentHotkey,
  });

  // On initial mount: restore from localStorage if an existing autosaved draft exists
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const savedDraft = loadDraftFromStorage(window.localStorage);
        if (savedDraft && savedDraft.content && savedDraft.content.trim()) {
          setEditorContent(savedDraft.content);
          setLastAutosaveTimestamp(savedDraft.timestamp);
          showNotice(`Restored autosaved draft from local storage (${formatAutosaveTime(savedDraft.timestamp)})`);
          return;
        }
      }
    } catch (err) {
      console.warn("Storage draft retrieval note:", err);
    }

    const initialReport = generateStandardTemplate(
      selectedStudy.examDescription,
      "Dictation pending. Push to talk or select a clinical preset above.",
      selectedStudy.clinicalIndication
    );
    setEditorContent(initialReport);
  }, []);

  // Autosave mechanism: saves editorContent to localStorage every 5 seconds
  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;

    const autosaveTimer = setInterval(() => {
      if (editorContent && editorContent.trim()) {
        const saved = saveDraftToStorage(
          window.localStorage,
          editorContent,
          selectedStudy.id,
          selectedStudy.accession
        );
        if (saved) {
          setLastAutosaveTimestamp(saved.timestamp);
        }
      }
    }, 5000);

    return () => clearInterval(autosaveTimer);
  }, [editorContent, selectedStudy]);

  // Flush save on window unload / accidental close
  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;

    const handleBeforeUnload = () => {
      if (editorContent && editorContent.trim()) {
        saveDraftToStorage(
          window.localStorage,
          editorContent,
          selectedStudy.id,
          selectedStudy.accession
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editorContent, selectedStudy]);

  const handleClearAutosavedDraft = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      clearDraftFromStorage(window.localStorage);
    }
    setLastAutosaveTimestamp(null);
    const freshTemplate = generateStandardTemplate(
      selectedStudy.examDescription,
      "",
      selectedStudy.clinicalIndication
    );
    setEditorContent(freshTemplate);
    showNotice("Autosaved draft cleared from local storage.");
  };

  // Update editor content when study changes from worklist
  const handleSelectStudy = (study: WorklistItem) => {
    setSelectedStudy(study);
    clearTranscript();
    setCriticalAlerts([]);
    setHomophoneRisks([]);
    setHl7SentSuccess(false);

    // Initialize with standard empty report template for this modality
    const template = generateStandardTemplate(
      study.examDescription,
      "",
      study.clinicalIndication
    );
    setEditorContent(template);
    showNotice(`Loaded study: ${study.patientName} (${study.modality})`);
  };

  const showNotice = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      setStatusNotification(null);
    }, 3500);
  };

  // Format with Gemini API
  const handleFormatReport = async () => {
    if (!rawTranscript.trim()) return;

    setIsFormatting(true);
    showNotice("RadScribe AI formatting engine processing...");

    try {
      const response = await fetch("/api/format-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: rawTranscript,
          examType: selectedStudy.examDescription,
          clinicalIndication: selectedStudy.clinicalIndication,
          formatStyle: "standard",
          criticalFindingsAlert: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setEditorContent(data.formattedReport);
      setCriticalAlerts(data.criticalAlerts || []);
      setHomophoneRisks(data.homophoneRisks || []);
      setLastFormattedTime(new Date().toLocaleTimeString());

      // Mark study as completed in worklist
      setWorklistItems((prev) =>
        prev.map((item) =>
          item.id === selectedStudy.id ? { ...item, status: "Completed" } : item
        )
      );

      showNotice("Structured report generated according to RSNA guidelines.");
    } catch (err: any) {
      console.warn("Formatting fallback error:", err);
      // Fallback local formatter
      const fallback = generateStandardTemplate(
        selectedStudy.examDescription,
        rawTranscript,
        selectedStudy.clinicalIndication
      );
      setEditorContent(fallback);
      setCriticalAlerts(detectCriticalAlerts(rawTranscript));
      setHomophoneRisks(inspectHomophones(rawTranscript));
      setLastFormattedTime(new Date().toLocaleTimeString());
      showNotice("Generated structured report with local rules engine.");
    } finally {
      setIsFormatting(false);
    }
  };

  const [isMobileWorklistOpen, setIsMobileWorklistOpen] = useState(false);

  // Load a clinical preset for instant demonstration
  const handleLoadPreset = (preset: ClinicalPreset) => {
    // Find or create matching worklist study
    const matchingStudy = worklistItems.find((w) => w.modality === preset.modality) || selectedStudy;
    setSelectedStudy({
      ...matchingStudy,
      examDescription: preset.title,
      clinicalIndication: preset.clinicalIndication,
    });

    if (preset.isEmergencyAlert) {
      const immediateAlerts = detectCriticalAlerts(preset.rawSpokenDictation);
      setCriticalAlerts(immediateAlerts);
    } else {
      setCriticalAlerts([]);
    }

    // Stream the preset dictation into the HUD in real-time
    streamPresetDictation(preset.rawSpokenDictation, () => {
      showNotice(`Simulated audio capture complete. Ready to Format.`);
    });
  };

  // Replace acoustic homophone (e.g. dysphasia -> dysphagia)
  const handleApplyHomophoneFix = (original: string, replacement: string) => {
    const regex = new RegExp(`\\b${original}\\b`, "gi");
    setEditorContent((prev) => prev.replace(regex, replacement));
    setHomophoneRisks((prev) => prev.filter((h) => h.original.toLowerCase() !== original.toLowerCase()));
    showNotice(`Safeguard applied: Replaced '${original}' with '${replacement}'`);
  };

  // Insert standard macro
  const handleInsertMacro = (_title: string, body: string) => {
    setEditorContent((prev) => {
      if (prev.includes("FINDINGS:")) {
        return prev.replace("FINDINGS:", `FINDINGS:\n${body}\n`);
      }
      return `${prev}\n\n${body}`;
    });
    showNotice(`Macro inserted into report.`);
  };

  // Export as .docx
  const handleExportDocx = async () => {
    try {
      await downloadReportAsDocx(editorContent, {
        patientName: selectedStudy.patientName,
        patientId: selectedStudy.mrn,
        accessionNumber: selectedStudy.accession,
        institutionName: "DEPARTMENT OF RADIOLOGY & IMAGING SCIENCES",
        radiologistName: "Staff Radiologist, MD, DABR",
      });
      showNotice("Saved perfectly formatted .docx file to local environment.");
    } catch (err) {
      console.error("Docx generation error:", err);
      showNotice("Failed to generate .docx file.");
    }
  };

  // Copy to PACS clipboard
  const handleCopyToPacs = async () => {
    try {
      await navigator.clipboard.writeText(editorContent);
      setCopiedToClipboard(true);
      showNotice("Report copied to system clipboard for PACS / RIS pasting.");
      setTimeout(() => setCopiedToClipboard(false), 2500);
    } catch {
      showNotice("Clipboard write permission blocked.");
    }
  };

  // Simulate HL7 ORU_R01 transmission
  const handleSendHl7Simulated = () => {
    setIsSendingHl7(true);
    setTimeout(() => {
      setIsSendingHl7(false);
      setHl7SentSuccess(true);
      showNotice("HL7 ORU_R01 message dispatched to Epic Radiant / PACS!");
    }, 1400);
  };

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to format
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (rawTranscript.trim() && !isFormatting) {
          handleFormatReport();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rawTranscript, isFormatting]);

  return (
    <div className="min-h-screen bg-[#18181B] text-neutral-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Application Desktop Shell Bar */}
      <header className="h-14 bg-[#121214] border-b border-[#27272A] px-4 sm:px-6 flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#0A1930] border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-md">
            <Stethoscope className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-white font-['Bebas_Neue'] uppercase text-xl leading-none">
                RADSCRIBE AI
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                Clinical Enterprise
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-sans hidden sm:inline">
              High-Speed Voice-to-Text & Intelligent Radiology Reporting Suite
            </span>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Active Recording Pill in Header if engaged */}
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9381E]/20 border border-[#D9381E] text-rose-300 animate-pulse font-mono font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#D9381E]"></span>
              <span>MIC CAPTURE ENGAGED</span>
            </div>
          )}

          <button
            onClick={() => setIsMobileWorklistOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202024] hover:bg-[#28282D] text-neutral-300 hover:text-white border border-[#2E2E33] transition-colors"
            title="Open PACS Worklist"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Worklist</span>
          </button>

          <button
            onClick={() => setIsSpellcheckOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              flaggedIssues.length > 0
                ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40"
                : "bg-[#202024] hover:bg-[#28282D] text-neutral-300 hover:text-white border-[#2E2E33]"
            }`}
            title="Open Medical & Radiological Spellchecker"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Medical Spellcheck</span>
            {flaggedIssues.length > 0 && (
              <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono">
                {flaggedIssues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsDiffModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202024] hover:bg-[#28282D] text-neutral-300 hover:text-white border border-[#2E2E33] transition-colors"
            title="Open Side-by-Side Raw vs Structured Comparison"
          >
            <Columns className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Side-by-Side Diff</span>
          </button>

          <button
            onClick={() => setIsMicCheckOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A1930] hover:bg-[#112240] text-blue-200 hover:text-white border border-blue-500/30 transition-colors font-medium shadow-sm"
            title="Open Microphone Hardware Check & Noise Calibration"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hardware Setup</span>
          </button>
        </div>
      </header>

      {/* Floating Status Notification Toast */}
      {statusNotification && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-lg bg-[#0A1930] border border-blue-500/40 text-white text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Main Clinical Work Environment */}
      <main className="flex-1 p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1780px] w-full mx-auto overflow-hidden">
        {/* Left Column: PACS / RIS Worklist (3 Cols) */}
        <div className="lg:col-span-3 h-[84vh] hidden lg:block">
          <WorklistSidebar
            items={worklistItems}
            selectedItem={selectedStudy}
            onSelectItem={handleSelectStudy}
            onSendHl7Simulated={handleSendHl7Simulated}
            isSendingHl7={isSendingHl7}
            hl7SentSuccess={hl7SentSuccess}
          />
        </div>

        {/* Center / Right Column: Dictation HUD & Document Editor Canvas (9 Cols) */}
        <div className="lg:col-span-9 flex flex-col gap-4 h-auto lg:h-[84vh]">
          {/* Top Half: Real-time Audio Capture & Raw ASR Stream HUD */}
          <div className="shrink-0">
            <DictationHUD
              isRecording={isRecording}
              isLocked={isLocked}
              isStreaming={isStreaming}
              rawTranscript={rawTranscript}
              interimTranscript={interimTranscript}
              audioWaveformData={audioWaveformData}
              audioLevelDb={audioLevelDb}
              latencyMs={latencyMs}
              dictationDurationSec={dictationDurationSec}
              wordCount={wordCount}
              currentHotkey={currentHotkey}
              isFormatting={isFormatting}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onToggleLock={toggleLock}
              onFormatRequest={handleFormatReport}
              onClearTranscript={clearTranscript}
              onLoadPreset={handleLoadPreset}
              onOpenMicCheck={() => setIsMicCheckOpen(true)}
            />
          </div>

          {/* Bottom Half: Off-white Paper Text Editor Canvas */}
          <div className="flex-1 min-h-[500px]">
            <EditorCanvas
              content={editorContent}
              onChange={setEditorContent}
              criticalAlerts={criticalAlerts}
              homophoneRisks={homophoneRisks}
              onApplyHomophoneFix={handleApplyHomophoneFix}
              onExportDocx={handleExportDocx}
              onCopyToPacs={handleCopyToPacs}
              copiedToClipboard={copiedToClipboard}
              onInsertMacro={handleInsertMacro}
              isFormatting={isFormatting}
              lastFormattedTime={lastFormattedTime}
              patientInfo={{
                name: selectedStudy.patientName,
                mrn: selectedStudy.mrn,
                accession: selectedStudy.accession,
                modality: selectedStudy.modality,
              }}
              flaggedIssues={flaggedIssues}
              onOpenSpellcheck={() => setIsSpellcheckOpen(true)}
              lastAutosavedTime={lastAutosaveTimestamp ? formatAutosaveTime(lastAutosaveTimestamp) : null}
              onClearAutosavedDraft={handleClearAutosavedDraft}
            />
          </div>
        </div>
      </main>

      {/* Mandatory Microphone & Noise Calibration Modal */}
      <MicrophoneCheckModal
        isOpen={isMicCheckOpen}
        onClose={() => setIsMicCheckOpen(false)}
        onCompleted={() => {
          setIsMicCheckOpen(false);
          showNotice("Microphone hardware verified & noise calibrated for dark reading suite.");
        }}
        currentHotkey={currentHotkey}
        onHotkeyChange={setCurrentHotkey}
      />

      {/* Side-by-Side Diff Modal */}
      <DiffComparisonModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        rawText={rawTranscript}
        structuredText={editorContent}
        onAccept={() => {
          showNotice("Structured report accepted.");
        }}
      />

      {/* Mobile PACS Worklist Modal */}
      {isMobileWorklistOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg h-[80vh] flex flex-col bg-[#161618] border border-[#27272A] rounded-xl overflow-hidden shadow-2xl">
            <div className="p-3 bg-[#0A1930] flex items-center justify-between border-b border-[#1E293B]">
              <span className="font-semibold text-xs text-white uppercase tracking-wider">
                Select PACS Study
              </span>
              <button
                onClick={() => setIsMobileWorklistOpen(false)}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <WorklistSidebar
                items={worklistItems}
                selectedItem={selectedStudy}
                onSelectItem={(item) => {
                  handleSelectStudy(item);
                  setIsMobileWorklistOpen(false);
                }}
                onSendHl7Simulated={handleSendHl7Simulated}
                isSendingHl7={isSendingHl7}
                hl7SentSuccess={hl7SentSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* Medical & Radiological Spellcheck Panel */}
      <MedicalSpellcheckPanel
        isOpen={isSpellcheckOpen}
        onClose={() => setIsSpellcheckOpen(false)}
        issues={flaggedIssues}
        onApplyFix={handleApplySpellcheckFix}
        onIgnore={handleIgnoreSpellcheck}
        onAddToLexicon={handleAddToLexicon}
        customLexicon={customLexicon}
      />
    </div>
  );
}
