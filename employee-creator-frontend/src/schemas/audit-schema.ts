export type AuditAction = "CREATED" | "UPDATED" | "DELETED";

export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditLogResponse {
  id: number;
  actorEmail: string;
  action: AuditAction;
  entityType: string;
  entityId: number;
  entityLabel: string;
  // The backend serialises the JsonNode `details` as a JSON array of changes.
  details: FieldChange[];
  createdAt: string;
}

export interface AuditActor {
  actorId: number;
  actorEmail: string;
}

// Mirror of Spring Data's Page<T> envelope (only the fields the UI reads).
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

export interface AuditLogParams {
  page?: number;
  size?: number;
  entityType?: string;
  action?: AuditAction | "";
  actorId?: number | null;
}
