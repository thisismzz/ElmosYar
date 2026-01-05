import { loadNotesFromDisk, saveNotesToDisk, loadPlannerFromDisk, savePlannerToDisk } from "./localFileStorage";
import { savePayloadToDrive, loadPayloadFromDrive } from "./driveSync";

type DriveBackup = {
  version: 1;
  updatedAt: string;
  notes: { notes: any[]; folders: any[] };
  planner: { tasks: any[] };
};

export async function saveAllToDrive(): Promise<void> {
  const notes = (await loadNotesFromDisk()) ?? { notes: [], folders: [] };
  const planner = (await loadPlannerFromDisk()) ?? { tasks: [] };

  const payload: DriveBackup = {
    version: 1,
    updatedAt: new Date().toISOString(),
    notes,
    planner,
  };

  await savePayloadToDrive(payload);
}

export async function loadAllFromDrive(): Promise<void> {
  const remote = await loadPayloadFromDrive<DriveBackup>();
  if (!remote) return;

  await saveNotesToDisk(remote.notes ?? { notes: [], folders: [] });
  await savePlannerToDisk(remote.planner ?? { tasks: [] });
}
