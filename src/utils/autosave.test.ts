import test from "node:test";
import assert from "node:assert/strict";
import {
  saveDraftToStorage,
  loadDraftFromStorage,
  clearDraftFromStorage,
  formatAutosaveTime,
  AUTOSAVE_STORAGE_KEY,
} from "./autosave.ts";

// Mock localStorage for Node test environment
class MockLocalStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

test("saveDraftToStorage persists draft and metadata to storage", () => {
  const mockStorage = new MockLocalStorage();
  const sampleContent = "EXAMINATION: CXR\nFINDINGS: Lungs clear.";
  const draft = saveDraftToStorage(mockStorage, sampleContent, "wl-1", "ACC-2026-88102");

  assert.ok(draft);
  assert.equal(draft.content, sampleContent);
  assert.equal(draft.studyId, "wl-1");
  assert.equal(draft.accession, "ACC-2026-88102");
  assert.ok(draft.timestamp);

  const raw = mockStorage.getItem(AUTOSAVE_STORAGE_KEY);
  assert.ok(raw);
  const parsed = JSON.parse(raw!);
  assert.equal(parsed.content, sampleContent);
});

test("loadDraftFromStorage retrieves persisted draft accurately", () => {
  const mockStorage = new MockLocalStorage();
  saveDraftToStorage(mockStorage, "FINDINGS: Acute fracture.", "wl-2", "ACC-88103");

  const loaded = loadDraftFromStorage(mockStorage);
  assert.ok(loaded);
  assert.equal(loaded?.content, "FINDINGS: Acute fracture.");
  assert.equal(loaded?.studyId, "wl-2");
});

test("clearDraftFromStorage removes saved draft", () => {
  const mockStorage = new MockLocalStorage();
  saveDraftToStorage(mockStorage, "Draft text", "wl-1", "ACC-1");
  clearDraftFromStorage(mockStorage);

  const loaded = loadDraftFromStorage(mockStorage);
  assert.equal(loaded, null);
});

test("formatAutosaveTime formats ISO timestamp cleanly", () => {
  const nowIso = new Date("2026-11-05T02:30:00Z").toISOString();
  const formatted = formatAutosaveTime(nowIso);
  assert.ok(formatted.length > 0);
  assert.notEqual(formatted, "Not saved yet");
});
