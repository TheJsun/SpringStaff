import type {
  AuditAction,
  FieldChange,
} from "../schemas/audit-schema";

// Fields that are noise in an audit diff: every entity carries its own `id`,
// and Document rows carry the raw binary `data` payload.
const HIDDEN_FIELDS = new Set(["id", "data"]);

export const ENTITY_TYPE_OPTIONS = [
  { value: "Employee", label: "Employee" },
  { value: "Department", label: "Department" },
  { value: "Document", label: "Document" },
  { value: "User", label: "User" },
] as const;

export const ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
  { value: "CREATED", label: "Created" },
  { value: "UPDATED", label: "Updated" },
  { value: "DELETED", label: "Deleted" },
];

export function formatActionLabel(action: AuditAction): string {
  return action.charAt(0) + action.slice(1).toLowerCase();
}

export function formatAuditTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toDisplayChanges(details: FieldChange[]): FieldChange[] {
  if (!Array.isArray(details)) return [];
  return details.filter((change) => !HIDDEN_FIELDS.has(change.field));
}

export function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
