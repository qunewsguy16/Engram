import "server-only";
import { defineConnector } from "./define";

/** Live Google Drive connector. Lifecycle from defineConnector. */
export interface DriveSnapshot {
  recentFiles: number;
  latestName?: string;
}

interface DriveFile {
  name?: string;
}

export const driveConnector = defineConnector<DriveSnapshot>({
  meta: { id: "gdrive", name: "Google Drive", category: "notes" },
  errorCode: "drive_error",
  disabledDetail: "Set GOOGLE_DRIVE_TOKEN + FEATURE_REAL_CONNECTORS",
  async fetchSnapshot(token, f) {
    const res = await f(
      "https://www.googleapis.com/drive/v3/files?orderBy=modifiedTime%20desc&pageSize=10&fields=files(name)",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error(`Google Drive ${res.status}`);
    const { files } = (await res.json()) as { files: DriveFile[] };
    return {
      recentFiles: files.length,
      latestName: files[0]?.name,
    };
  },
  detail: (s) => (s.latestName ? `Latest: ${s.latestName}` : `${s.recentFiles} files`),
});
