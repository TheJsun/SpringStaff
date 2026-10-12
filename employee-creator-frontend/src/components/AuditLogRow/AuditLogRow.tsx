import { useState } from "react";
import type { AuditLogResponse } from "../../schemas/audit-schema";
import {
  formatActionLabel,
  formatAuditTimestamp,
  formatAuditValue,
  toDisplayChanges,
} from "../../services/audit-services";
import classes from "./AuditLogRow.module.scss";

interface AuditLogRowProps {
  log: AuditLogResponse;
}

export default function AuditLogRow({ log }: AuditLogRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const changes = toDisplayChanges(log.details);
  const hasChanges = changes.length > 0;
  const actionClass = `${classes.badge} ${classes[`badge${log.action}`] ?? ""}`;

  return (
    <article className={classes.auditRow}>
      <div className={classes.main}>
        <span className={actionClass}>{formatActionLabel(log.action)}</span>

        <div className={classes.entity}>
          <p className={classes.entityLabel}>{log.entityLabel}</p>
          <p className={classes.entityType}>
            {log.entityType} #{log.entityId}
          </p>
        </div>

        <p className={classes.actor}>{log.actorEmail}</p>
        <p className={classes.when}>{formatAuditTimestamp(log.createdAt)}</p>

        <button
          type="button"
          className={classes.toggle}
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={!hasChanges}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Hide changes" : "Show changes"}
        >
          {hasChanges ? (isOpen ? "Hide" : "Details") : "—"}
        </button>
      </div>

      {isOpen && hasChanges && (
        <div className={classes.details}>
          {changes.map((change) => (
            <div key={change.field} className={classes.change}>
              <span className={classes.field}>{change.field}</span>
              {log.action === "CREATED" ? (
                <span className={classes.value}>
                  {formatAuditValue(change.newValue)}
                </span>
              ) : log.action === "DELETED" ? (
                <span className={classes.value}>
                  {formatAuditValue(change.oldValue)}
                </span>
              ) : (
                <span className={classes.diff}>
                  <span className={classes.oldValue}>
                    {formatAuditValue(change.oldValue)}
                  </span>
                  <span className={classes.arrow} aria-hidden="true">
                    →
                  </span>
                  <span className={classes.newValue}>
                    {formatAuditValue(change.newValue)}
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
