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
  details: FieldChange[];
  createdAt: string;
}

export interface AuditActor {
  actorId: number;
  actorEmail: string;
}

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
