/**
 * Autosave draft persistence utilities for RadScribe AI
 */

export interface AutosaveDraft {
  content: string;
  timestamp: string;
  studyId: string;
  accession: string;
  wordCount: number;
}

export const AUTOSAVE_STORAGE_KEY = "radscribe_autosave_draft_v1";

/**
 * Save current report state to localStorage
 */
export function saveDraftToStorage(
  storage: Storage,
  content: string,
  studyId: string,
  accession: string
): AutosaveDraft | null {
  if (!content || !content.trim()) return null;

  const words = content.trim().split(/\s+/).length;
  const draft: AutosaveDraft = {
    content,
    timestamp: new Date().toISOString(),
    studyId,
    accession,
    wordCount: words,
  };

  try {
    storage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(draft));
    return draft;
  } catch (err) {
    console.warn("Autosave storage write error:", err);
    return null;
  }
}

/**
 * Retrieve saved draft from localStorage
 */
export function loadDraftFromStorage(storage: Storage): AutosaveDraft | null {
  try {
    const raw = storage.getItem(AUTOSAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.content === "string") {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn("Autosave storage read error:", err);
    return null;
  }
}

/**
 * Clear autosaved draft from storage
 */
export function clearDraftFromStorage(storage: Storage): void {
  try {
    storage.removeItem(AUTOSAVE_STORAGE_KEY);
  } catch (err) {
    console.warn("Autosave storage clear error:", err);
  }
}

/**
 * Formats a friendly elapsed time string for autosave status
 */
export function formatAutosaveTime(isoString: string): string {
  if (!isoString) return "Not saved yet";
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "Recently";
  }
}
