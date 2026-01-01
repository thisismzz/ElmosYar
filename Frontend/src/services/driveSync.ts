type DrivePayload = {
  notes: any[];   // replace with your Note type
  folders: any[]; // replace with your Folder type
};

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";
const APPDATA_FILENAME = "my-notes-app.json";

// Narrow scope for hidden app storage
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";

declare global {
  interface Window {
    google?: any;
  }
}

let accessToken: string | null = null;
let tokenClient: any | null = null;

export function initGoogleTokenClient(clientId: string) {
  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity Services not loaded yet.");
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: DRIVE_SCOPE,
    callback: (resp: any) => {
      if (resp?.access_token) accessToken = resp.access_token;
    },
  });
}

export async function ensureAccessToken(): Promise<string> {
  if (!tokenClient) throw new Error("Token client not initialized.");

  // If we already have a token, use it (you may also track expiry if you want).
  if (accessToken) return accessToken;

  // Request a token interactively (popup). GIS will reuse prior consent when possible.
  await new Promise<void>((resolve, reject) => {
    tokenClient.callback = (resp: any) => {
      if (resp?.access_token) {
        accessToken = resp.access_token;
        resolve();
      } else {
        reject(new Error("No access token returned."));
      }
    };
    tokenClient.requestAccessToken({ prompt: "" }); // "" = try silent; Google may still prompt
  });

  if (!accessToken) throw new Error("Failed to obtain access token.");
  return accessToken;
}

async function driveFetch(input: RequestInfo, init?: RequestInit) {
  const token = await ensureAccessToken();
  const headers = new Headers(init?.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

/**
 * Find the app data file by name in appDataFolder.
 */
async function findAppDataFileId(): Promise<string | null> {
  const q = encodeURIComponent(`name='${APPDATA_FILENAME}' and trashed=false`);
  const url =
    `${DRIVE_API_BASE}/files?spaces=appDataFolder&q=${q}&fields=files(id,name)`;

  const res = await driveFetch(url);
  if (!res.ok) throw new Error(`Drive list failed: ${res.status} ${await res.text()}`);

  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

/**
 * Upload JSON (create or update) into appDataFolder.
 *
 * Uses multipart upload so you can include metadata + content in one request. :contentReference[oaicite:4]{index=4}
 */
export async function savePayloadToDrive(payload: unknown): Promise<void> {
  const fileId = await findAppDataFileId();
  const json = JSON.stringify(payload);

  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = fileId
    ? { name: APPDATA_FILENAME } // update doesn’t need parents
    : { name: APPDATA_FILENAME, parents: ["appDataFolder"] };

  const multipartBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    json +
    closeDelimiter;

  const url = fileId
    ? `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=multipart`
    : `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`;

  const method = fileId ? "PATCH" : "POST";

  const res = await driveFetch(url, {
    method,
    headers: {
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  if (!res.ok) throw new Error(`Drive upload failed: ${res.status} ${await res.text()}`);
}

/**
 * Download the JSON content using files.get?alt=media. :contentReference[oaicite:5]{index=5}
 */
export async function loadPayloadFromDrive<T>(): Promise<T | null> {
  const fileId = await findAppDataFileId();
  if (!fileId) return null;

  const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;
  const res = await driveFetch(url);

  if (!res.ok) throw new Error(`Drive download failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}
