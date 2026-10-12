import type {
  AuditActor,
  AuditLogParams,
  AuditLogResponse,
  SpringPage,
} from "../schemas/audit-schema";

const BASE_URL = import.meta.env.VITE_API_URL;
const AUDIT_BASE_URL = `${BASE_URL}/audit-logs`;

export const getAuditLogs = async (params: AuditLogParams = {}) => {
  const query = new URLSearchParams();
  if (params.page != null) query.set("page", String(params.page));
  if (params.size != null) query.set("size", String(params.size));
  if (params.entityType) query.set("entityType", params.entityType);
  if (params.action) query.set("action", params.action);
  if (params.actorId != null) query.set("actorId", String(params.actorId));

  const queryString = query.toString();
  const url = queryString ? `${AUDIT_BASE_URL}?${queryString}` : AUDIT_BASE_URL;

  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to fetch audit logs: ${response.status}`,
    );
  }
  return (await response.json()) as SpringPage<AuditLogResponse>;
};

export const getAuditActors = async () => {
  const response = await fetch(`${AUDIT_BASE_URL}/actors`, {
    credentials: "include",
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to fetch audit actors: ${response.status}`,
    );
  }
  return (await response.json()) as AuditActor[];
};
