import React from "react";
import {
  Mic,
  MicOff,
  Radio,
  Lock,
  Unlock,
  Sparkles,
  Trash2,
  Play,
  RotateCcw,
  Zap,
  Activity,
  ChevronDown,
  Volume2,
} from "lucide-react";
import { CLINICAL_PRESETS, ClinicalPreset } from "../data/clinicalPresets.ts";

interface DictationHUDProps {
  isRecording: boolean;
  isLocked: boolean;
  isStreaming: boolean;
  rawTranscript: string;
  interimTranscript: string;
  audioWaveformData: number[];
  audioLevelDb: number;
  latencyMs: number;
  dictationDurationSec: number;
  wordCount: number;
  currentHotkey: string;
  isFormatting: boolean;
  onStartRecording: (isLock?: boolean) => void;
  onStopRecording: (force?: boolean) => void;
  onToggleLock: () => void;
  onFormatRequest: () => void;
  onClearTranscript: () => void;
  onLoadPreset: (preset: ClinicalPreset) => void;
  onOpenMicCheck: () => void;
}

export const DictationHUD: React.FC<DictationHUDProps> = ({
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
  currentHotkey,
  isFormatting,
  onStartRecording,
  onStopRecording,
  onToggleLock,
  onFormatRequest,
  onClearTranscript,
  onLoadPreset,
  onOpenMicCheck,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden shadow-2xl text-neutral-200">
      {/* Top Banner: Clinical ASR Engine Status */}
      <div className="px-5 py-3 bg-[#0A1930] border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              isRecording
                ? "bg-[#D9381E] shadow-[0_0_12px_#D9381E] animate-pulse"
                : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
            }`}
          />
          <div>
            <span className="font-semibold text-xs tracking-wider uppercase text-white font-sans">
              Real-Time Medical ASR Stream
            </span>
            <span className="ml-2 text-[10px] font-mono text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-500/30">
              Nova-3 Medical Engine
            </span>
          </div>
        </div>

        {/* Latency & Quality telemetry */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div
            className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded border border-white/5"
            title="Real-time WebSocket roundtrip processing latency (< 1500ms required by PRD)"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-neutral-400 text-[11px]">Latency:</span>
            <span className="text-emerald-400 font-bold">{latencyMs} ms</span>
          </div>

          <button
            onClick={onOpenMicCheck}
            className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/10 transition-colors"
            title="Open Microphone Hardware & Noise Calibration"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Hardware Check</span>
          </button>
        </div>
      </div>

      {/* Main Push-to-Talk Capture Deck */}
      <div className="p-5 bg-gradient-to-b from-[#1C1C20] to-[#161619] border-b border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Tactile Push-to-Talk Big Button */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onMouseDown={() => !isLocked && onStartRecording(false)}
            onMouseUp={() => !isLocked && onStopRecording(false)}
            onTouchStart={() => !isLocked && onStartRecording(false)}
            onTouchEnd={() => !isLocked && onStopRecording(false)}
            onClick={() => isLocked && onToggleLock()}
            aria-label={
              isRecording
                ? "Recording active. Release or click to stop"
                : "Hold to talk or click with continuous lock"
            }
            className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-200 select-none shadow-xl border cursor-pointer ${
              isRecording
                ? "bg-[#D9381E] text-white border-rose-400 shadow-[0_0_25px_rgba(217,56,30,0.5)] scale-[0.98]"
                : "bg-[#0A1930] hover:bg-[#112240] text-white border-blue-500/40 hover:border-blue-400 shadow-[0_4px_15px_rgba(10,25,48,0.5)] active:scale-95"
            }`}
          >
            <div
              className={`p-2 rounded-full ${
                isRecording ? "bg-white/20 animate-pulse" : "bg-blue-500/20"
              }`}
            >
              {isRecording ? <Mic className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-blue-400" />}
            </div>
            <div className="text-left">
              <div className="text-xs text-blue-200/80 font-mono">
                {isRecording ? "CAPTURE ENGAGED" : `HOLD ${currentHotkey === " " ? "SPACEBAR" : currentHotkey}`}
              </div>
              <div className="text-sm font-extrabold tracking-wide">
                {isRecording ? "RECORDING SPEECH..." : "PUSH-TO-TALK"}
              </div>
            </div>
          </button>

          {/* Continuous Lock Switch */}
          <button
            onClick={onToggleLock}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
              isLocked
                ? "bg-[#D9381E]/20 border-[#D9381E] text-rose-300"
                : "bg-[#202024] hover:bg-[#28282D] border-[#2C2C30] text-neutral-400 hover:text-white"
            }`}
            title="Toggle hands-free continuous dictation lock (no need to hold key down)"
          >
            {isLocked ? <Lock className="w-4 h-4 text-[#D9381E]" /> : <Unlock className="w-4 h-4" />}
            <span className="text-[10px] mt-1 font-mono">{isLocked ? "LOCKED" : "LOCK"}</span>
          </button>
        </div>

        {/* Real-time Waveform Visualizer & Level Meter */}
        <div className="flex-1 max-w-md w-full bg-[#121214] border border-[#27272A] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Radio
                className={`w-3.5 h-3.5 ${
                  isRecording ? "text-[#D9381E] animate-pulse" : "text-neutral-500"
                }`}
              />
              <span>
                {isRecording ? (
                  <strong className="text-rose-400">AUDIO STREAM ACTIVE</strong>
                ) : (
                  "ACOUSTIC STANDBY"
                )}
              </span>
            </span>
            <div className="flex items-center gap-3">
              <span>Time: <strong className="text-neutral-200">{formatDuration(dictationDurationSec)}</strong></span>
              <span>Level: <strong className="text-neutral-200">{audioLevelDb} dB</strong></span>
            </div>
          </div>

          {/* Animated 24-bar audio frequency spectrum */}
          <div className="h-9 flex items-end justify-between gap-1 px-1">
            {audioWaveformData.map((heightNorm, i) => (
              <div
                key={i}
                className={`w-full rounded-t transition-all duration-75 ${
                  isRecording
                    ? heightNorm > 0.6
                      ? "bg-[#D9381E]"
                      : heightNorm > 0.3
                      ? "bg-amber-400"
                      : "bg-emerald-500"
                    : "bg-neutral-800"
                }`}
                style={{
                  height: `${Math.max(8, heightNorm * 100)}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preset Study Quick Bar for instant demonstration */}
      <div className="px-5 py-2.5 bg-[#141416] border-b border-[#242428] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-neutral-300">Quick Clinical Cases:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {CLINICAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onLoadPreset(preset)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border flex items-center gap-1 ${
                preset.isEmergencyAlert
                  ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                  : "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border-neutral-700"
              }`}
              title={`Simulate dictation for: ${preset.title}`}
            >
              <span>{preset.modality}</span>
              <span className="text-neutral-400">•</span>
              <span className="truncate max-w-[140px]">{preset.title.split("(")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Raw Transcript Stream Area (Millisecond Latency Projection) */}
      <div className="p-4 bg-[#121214] flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300 font-mono text-[11px]">
              RAW DICTATION STREAM
            </span>
            <span className="text-[11px] text-neutral-500">
              ({wordCount} words captured)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {rawTranscript && (
              <button
                onClick={onClearTranscript}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-rose-400 transition-colors"
                title="Clear current raw transcription"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Pulsing Recording & Low-Latency Status Banner */}
        {isRecording && (
          <div className="p-2.5 rounded-lg bg-[#D9381E]/15 border border-[#D9381E]/40 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-200 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9381E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D9381E]"></span>
              </span>
              <span className="font-bold tracking-wider uppercase text-white font-mono text-[11px] animate-pulse">
                RECORDING IN PROGRESS...
              </span>
              <span className="text-neutral-300 font-mono text-[11px]">
                Active audio capture ({formatDuration(dictationDurationSec)})
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              {latencyMs > 1200 ? (
                <span className="text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 animate-pulse">
                  ▲ Minor network lag ({latencyMs}ms) — audio processing
                </span>
              ) : (
                <span className="text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  ● Real-Time Medical ASR Synced ({latencyMs}ms)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Transcript Box with Real-Time Word Projection */}
        <div className="relative min-h-[90px] max-h-[140px] overflow-y-auto p-3 rounded-lg bg-[#0F0F12] border border-[#232328] font-sans text-xs sm:text-sm text-neutral-200 leading-relaxed shadow-inner">
          {rawTranscript || interimTranscript ? (
            <div>
              <span>{rawTranscript}</span>
              {interimTranscript && (
                <span className="text-emerald-400 italic font-semibold ml-1 bg-emerald-500/10 px-1 py-0.5 rounded animate-pulse">
                  {interimTranscript}
                </span>
              )}
              {isRecording && (
                <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-1 translate-y-0.5 animate-pulse" />
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-500 text-xs italic py-4">
              Hold Spacebar or select a clinical preset above to begin streaming radiology speech...
            </div>
          )}
        </div>

        {/* Bottom Actions: One-Click AI Format Trigger */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px]">
              Ctrl + Enter
            </kbd>
            <span>to format</span>
          </div>

          <button
            onClick={onFormatRequest}
            disabled={!rawTranscript.trim() || isFormatting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A1930] hover:bg-[#112240] border border-blue-500/40 hover:border-blue-400 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-blue-950/40 active:scale-98"
          >
            <Sparkles className={`w-4 h-4 text-emerald-400 ${isFormatting ? "animate-spin" : ""}`} />
            <span>
              {isFormatting ? "FORMATTING WITH RADSCRIBE AI..." : "FORMAT REPORT (GEMINI)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
