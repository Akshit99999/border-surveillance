import {
  ActivityLogEntry,
  Alert,
  Camera,
  Guard,
  Sector,
  Shift,
} from "@/lib/types";

export interface BlockchainStatus {
  configured: boolean;
  connected: boolean;
  mode: "live" | "not_configured" | "unavailable" | string;
  network: string;
  chainId: number | null;
  contractAddress: string | null;
  explorerBaseUrl: string | null;
  message: string;
}

export interface VerificationResult {
  status: "verified" | "mismatch" | "not_configured" | "unavailable" | "not_anchored" | string;
  verified: boolean;
  incidentReferenceHash: string;
  evidenceSha256: string;
  transactionHash: string | null;
  explorerUrl?: string | null;
  message: string;
}

export interface BootstrapData {
  currentUser: {
    name: string;
    rank: string;
    badgeId: string;
    role: string;
  };
  guards: Guard[];
  shifts: Shift[];
  activityLog: ActivityLogEntry[];
  alerts: Alert[];
  cameras: Camera[];
  sectors: Sector[];
  pois?: unknown[];
  anprRecords?: unknown[];
  system: {
    lockdownActive: boolean;
    defconLevel: 1 | 2 | 3 | 4 | 5;
  };
}

export interface BootstrapResponse {
  data: BootstrapData;
  meta: { source: string; generatedAt: string };
  blockchain: BlockchainStatus;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const apiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new ApiError(String(payload.error || `API request failed (${response.status})`), response.status);
  }
  return payload as T;
}

export const backendApi = {
  getBootstrap: () => request<BootstrapResponse>("/bootstrap"),
  getBlockchainStatus: () => request<BlockchainStatus>("/blockchain/status"),
  verifyAlert: (alertId: string) =>
    request<{ verification: VerificationResult }>(`/alerts/${encodeURIComponent(alertId)}/verification`),
  actionAlert: (alertId: string, action: "acknowledge" | "escalate", actorName: string) =>
    request(`/alerts/${encodeURIComponent(alertId)}/action`, {
      method: "POST",
      body: JSON.stringify({ action, actorName }),
    }),
  createAlert: (alert: Alert) =>
    request(`/alerts`, { method: "POST", body: JSON.stringify(alert) }),
  addActivity: (entry: ActivityLogEntry) =>
    request(`/activity`, { method: "POST", body: JSON.stringify(entry) }),
  updateGuard: (guardId: string, changes: Partial<Guard>) =>
    request(`/guards/${encodeURIComponent(guardId)}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  updateShift: (shiftId: string, changes: Partial<Shift>) =>
    request(`/shifts/${encodeURIComponent(shiftId)}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  handover: (payload: { outgoingGuardId: string; incomingGuardId: string; notes?: string }) =>
    request(`/handover`, { method: "POST", body: JSON.stringify(payload) }),
  updateCamera: (cameraId: string, changes: Partial<Camera>) =>
    request(`/cameras/${encodeURIComponent(cameraId)}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  systemAction: (action: "lockdown" | "abort_lockdown" | "defcon", level?: number, actorName?: string) =>
    request(`/system/action`, {
      method: "POST",
      body: JSON.stringify({ action, level, actorName }),
    }),
  sync: (alerts: Alert[], activityLog: ActivityLogEntry[]) =>
    request<{ data: BootstrapData; blockchain: BlockchainStatus }>("/sync", {
      method: "POST",
      body: JSON.stringify({ alerts, activityLog }),
    }),
  reset: () => request<BootstrapResponse>("/reset", { method: "POST" }),
  anchorAlert: (alertId: string) =>
    request<{ alert: Alert; blockchain: Record<string, unknown> }>(
      `/alerts/${encodeURIComponent(alertId)}/anchor`,
      { method: "POST" }
    ),
};
