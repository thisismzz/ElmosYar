// services/localFileStorage.ts
import { get, set } from "idb-keyval";

const DIR_HANDLE_KEY = "elmosyar_dir_handle_v1";

export async function clearFolderLink(): Promise<void> {
  await set(DIR_HANDLE_KEY, null);
}

export async function getCurrentFolderName(): Promise<string | null> {
  const dir = await getSavedDirHandle();
  return dir?.name || null;
}

export type NotesPayload = { notes: any[]; folders: any[] };
export type PlannerPayload = { tasks: any[] };

function isFsAccessSupported() {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

async function getSavedDirHandle(): Promise<FileSystemDirectoryHandle | null> {
  return (await get(DIR_HANDLE_KEY)) ?? null;
}

async function saveDirHandle(handle: FileSystemDirectoryHandle) {
  await set(DIR_HANDLE_KEY, handle);
}

async function ensurePerm(
  handle: FileSystemDirectoryHandle,
  mode: "read" | "readwrite"
) {
  // @ts-expect-error - Permission API exists in Chromium
  const q = await handle.queryPermission?.({ mode });
  if (q === "granted") return;

  // @ts-expect-error - Permission API exists in Chromium
  const r = await handle.requestPermission?.({ mode });
  if (r !== "granted") throw new Error("Folder permission not granted.");
}

async function getOrCreateFileHandle(
  dir: FileSystemDirectoryHandle,
  filename: string
) {
  return await dir.getFileHandle(filename, { create: true });
}

async function readJsonFile<T>(
  dir: FileSystemDirectoryHandle,
  filename: string
): Promise<T | null> {
  try {
    const fh = await dir.getFileHandle(filename);
    const file = await fh.getFile();
    const text = await file.text();
    if (!text.trim()) return null;
    return JSON.parse(text) as T;
  } catch (e: any) {
    // Not found → null
    if (e?.name === "NotFoundError") return null;
    throw e;
  }
}

async function writeJsonFile(
  dir: FileSystemDirectoryHandle,
  filename: string,
  data: unknown
) {
  const fh = await getOrCreateFileHandle(dir, filename);
  const writable = await fh.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

export async function linkLocalFolder(): Promise<void> {
  if (!isFsAccessSupported()) {
    throw new Error("File System Access API not supported in this browser.");
  }
  // @ts-expect-error - showDirectoryPicker exists in Chromium
  const dir = await window.showDirectoryPicker({ mode: "readwrite" });
  await ensurePerm(dir, "readwrite");
  await saveDirHandle(dir);
}

export async function hasLinkedLocalFolder(): Promise<boolean> {
  const dir = await getSavedDirHandle();
  if (!dir) return false;
  try {
    await ensurePerm(dir, "read");
    return true;
  } catch {
    return false;
  }
}

export async function loadNotesFromDisk(): Promise<NotesPayload | null> {
  const dir = await getSavedDirHandle();
  if (!dir) return null;
  await ensurePerm(dir, "read");
  return await readJsonFile<NotesPayload>(dir, "notes.json");
}

export async function saveNotesToDisk(payload: NotesPayload): Promise<void> {
  const dir = await getSavedDirHandle();
  if (!dir) throw new Error("No folder linked. Please link a folder first.");
  await ensurePerm(dir, "readwrite");
  await writeJsonFile(dir, "notes.json", payload);
}

export async function loadPlannerFromDisk(): Promise<PlannerPayload | null> {
  const dir = await getSavedDirHandle();
  if (!dir) return null;
  await ensurePerm(dir, "read");
  return await readJsonFile<PlannerPayload>(dir, "planner.json");
}

export async function savePlannerToDisk(payload: PlannerPayload): Promise<void> {
  const dir = await getSavedDirHandle();
  if (!dir) throw new Error("No folder linked. Please link a folder first.");
  await ensurePerm(dir, "readwrite");
  await writeJsonFile(dir, "planner.json", payload);
}
