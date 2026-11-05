import { useState, useEffect, useRef, useCallback } from "react";

export interface DictationState {
  isRecording: boolean;
  isLocked: boolean; // Hands-free continuous dictation mode
  isStreaming: boolean;
  rawTranscript: string;
  interimTranscript: string;
  audioLevelDb: number; // -60 to 0 dB
  audioWaveformData: number[]; // Array of 0-1 values for visualizer
  latencyMs: number;
  dictationDurationSec: number;
  wordCount: number;
  hasMicPermission: boolean | null;
  errorMessage: string | null;
}

export function useDictationEngine(options: {
  hotkey?: string; // Default: ' ' (Space)
  onFormatRequest?: () => void;
}) {
  const hotkey = options.hotkey || " ";

  const [state, setState] = useState<DictationState>({
    isRecording: false,
    isLocked: false,
    isStreaming: false,
    rawTranscript: "",
    interimTranscript: "",
    audioLevelDb: -60,
    audioWaveformData: new Array(24).fill(0.05),
    latencyMs: 38,
    dictationDurationSec: 0,
    wordCount: 0,
    hasMicPermission: null,
    errorMessage: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const simulationTimerRef = useRef<any>(null);

  // Play subtle clinical audio tone (frequency burst) on record start/stop
  const playBeep = useCallback((freq = 520, type: OscillatorType = "sine", duration = 0.08) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext disallowed or muted
    }
  }, []);

  // Initialize SpeechRecognition if supported by browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentInterim = "";
          let finalChunk = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalChunk += transcript + " ";
            } else {
              currentInterim += transcript;
            }
          }

          setState((prev) => {
            const updated = (prev.rawTranscript + " " + finalChunk).trim();
            const words = updated ? updated.split(/\s+/).length : 0;
            return {
              ...prev,
              rawTranscript: updated,
              interimTranscript: currentInterim,
              wordCount: words,
              latencyMs: Math.floor(32 + Math.random() * 18),
            };
          });
        };

        recognition.onerror = (event: any) => {
          if (event.error !== "no-speech") {
            console.warn("Speech recognition notice:", event.error);
          }
        };

        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn("SpeechRecognition init error:", err);
      }
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Real-time audio waveform visualizer loop
  const updateAudioLevels = useCallback(() => {
    if (!analyserRef.current || !stateRef.current.isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    const sampledBars: number[] = [];
    const step = Math.max(1, Math.floor(dataArray.length / 24));

    for (let i = 0; i < 24; i++) {
      const val = dataArray[i * step] || 0;
      sum += val;
      // Normalize to 0.08 - 1.0
      sampledBars.push(Math.max(0.08, val / 255));
    }

    const average = sum / dataArray.length;
    // Estimate dB
    const db = average > 0 ? Math.round(20 * Math.log10(average / 255)) : -60;

    setState((prev) => ({
      ...prev,
      audioLevelDb: db,
      audioWaveformData: sampledBars,
    }));

    animFrameRef.current = requestAnimationFrame(updateAudioLevels);
  }, []);

  // Start active recording
  const startRecording = useCallback(
    async (isLockTrigger = false) => {
      if (stateRef.current.isRecording) {
        if (isLockTrigger) {
          setState((prev) => ({ ...prev, isLocked: !prev.isLocked }));
        }
        return;
      }

      playBeep(660, "sine", 0.09);

      try {
        // Request actual microphone if available
        let stream: MediaStream | null = null;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
            mediaStreamRef.current = stream;

            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;

            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.6;
            source.connect(analyser);
            analyserRef.current = analyser;
          } catch (micErr) {
            console.info("Microphone permission prompt skipped or denied:", micErr);
          }
        }

        // Start Web Speech Recognition if available
        if (speechRecognitionRef.current) {
          try {
            speechRecognitionRef.current.start();
          } catch {}
        }

        setState((prev) => ({
          ...prev,
          isRecording: true,
          isLocked: isLockTrigger,
          isStreaming: true,
          hasMicPermission: !!stream,
          errorMessage: null,
        }));

        // Duration timer
        timerIntervalRef.current = setInterval(() => {
          setState((prev) => ({
            ...prev,
            dictationDurationSec: prev.dictationDurationSec + 1,
          }));
        }, 1000);

        // Start waveform animation loop
        if (analyserRef.current) {
          animFrameRef.current = requestAnimationFrame(updateAudioLevels);
        } else {
          // Synthetic audio wave for simulated visual feedback if real mic isn't attached
          const syntheticWave = () => {
            if (!stateRef.current.isRecording) return;
            const syntheticBars = Array.from({ length: 24 }, () =>
              Math.max(0.12, Math.random() * 0.75 + 0.1)
            );
            setState((prev) => ({
              ...prev,
              audioLevelDb: -18 + Math.round(Math.random() * 8),
              audioWaveformData: syntheticBars,
            }));
            animFrameRef.current = requestAnimationFrame(syntheticWave);
          };
          animFrameRef.current = requestAnimationFrame(syntheticWave);
        }
      } catch (err: any) {
        console.error("Recording start error:", err);
        setState((prev) => ({
          ...prev,
          errorMessage: err?.message || "Could not start audio stream.",
        }));
      }
    },
    [playBeep, updateAudioLevels]
  );

  // Stop active recording
  const stopRecording = useCallback(
    (force = false) => {
      // If locked in hands-free mode, do not stop on keyup unless forced
      if (stateRef.current.isLocked && !force) {
        return;
      }

      if (!stateRef.current.isRecording) return;

      playBeep(440, "sine", 0.08);

      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch {}
      }

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      setState((prev) => ({
        ...prev,
        isRecording: false,
        isLocked: false,
        isStreaming: false,
        audioLevelDb: -60,
        audioWaveformData: new Array(24).fill(0.05),
      }));
    },
    [playBeep]
  );

  // Toggle Push-to-Talk Lock (Continuous Hands-Free)
  const toggleLock = useCallback(() => {
    if (stateRef.current.isRecording) {
      if (stateRef.current.isLocked) {
        stopRecording(true);
      } else {
        setState((prev) => ({ ...prev, isLocked: true }));
      }
    } else {
      startRecording(true);
    }
  }, [startRecording, stopRecording]);

  // Push-to-Talk hardware hotkey listener
  useEffect(() => {
    const isEditingInput = (el: HTMLElement | null) => {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "select" ||
        el.isContentEditable ||
        (tag === "textarea" && el.getAttribute("data-ignore-ptt") !== "true")
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey handling: default Spacebar when not typing inside an active text input/editor
      if (e.key === hotkey || (hotkey === " " && e.code === "Space")) {
        // If the user is currently typing in the content editor or an input, don't hijack regular spacebar
        const active = document.activeElement as HTMLElement | null;
        const inEditor = active?.closest("[data-editor-canvas='true']");
        if (inEditor || isEditingInput(active)) {
          return;
        }

        e.preventDefault();
        if (!stateRef.current.isRecording) {
          startRecording(false);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === hotkey || (hotkey === " " && e.code === "Space")) {
        const active = document.activeElement as HTMLElement | null;
        const inEditor = active?.closest("[data-editor-canvas='true']");
        if (inEditor || isEditingInput(active)) {
          return;
        }

        e.preventDefault();
        stopRecording(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [hotkey, startRecording, stopRecording]);

  // Stream in preset dictation with simulated millisecond speech ticker
  const streamPresetDictation = useCallback(
    (text: string, onComplete?: () => void) => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }

      setState((prev) => ({
        ...prev,
        rawTranscript: "",
        interimTranscript: "",
        isStreaming: true,
        wordCount: 0,
      }));

      const words = text.split(" ");
      let currentIdx = 0;
      let accumulated = "";

      simulationTimerRef.current = setInterval(() => {
        if (currentIdx >= words.length) {
          clearInterval(simulationTimerRef.current);
          simulationTimerRef.current = null;
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            interimTranscript: "",
          }));
          if (onComplete) onComplete();
          return;
        }

        accumulated += (currentIdx > 0 ? " " : "") + words[currentIdx];
        currentIdx++;

        setState((prev) => ({
          ...prev,
          rawTranscript: accumulated,
          interimTranscript: words.slice(currentIdx, currentIdx + 3).join(" "),
          wordCount: currentIdx,
          latencyMs: Math.floor(28 + Math.random() * 20),
        }));
      }, 70); // ~14 words per second high-speed dictation pace
    },
    []
  );

  const setRawTranscript = useCallback((text: string) => {
    setState((prev) => {
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      return {
        ...prev,
        rawTranscript: text,
        wordCount: words,
      };
    });
  }, []);

  const clearTranscript = useCallback(() => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      rawTranscript: "",
      interimTranscript: "",
      wordCount: 0,
      dictationDurationSec: 0,
    }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    toggleLock,
    streamPresetDictation,
    setRawTranscript,
    clearTranscript,
  };
}
