import type { Ref } from "react";
import type { AuditLogResponse } from "../../schemas/audit-schema";
import AuditLogRow from "../AuditLogRow/AuditLogRow";
import classes from "./AuditLogList.module.scss";

interface AuditLogListProps {
  logs: AuditLogResponse[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  listBodyRef?: Ref<HTMLDivElement>;
}

export default function AuditLogList({
  logs,
  isLoading,
  isError,
  error,
  listBodyRef,
}: AuditLogListProps) {
  return (
    <section className={classes.auditListContainer}>
      <header className={classes.auditListHeader}>
        <p>Action</p>
        <p>Entity</p>
        <p className={classes.actor}>Actor</p>
        <p className={classes.when}>When</p>
        <p></p>
      </header>
      <div className={classes.auditList} ref={listBodyRef}>
        {isLoading && (
          <p className={classes.loadingMessage}>Loading audit logs...</p>
        )}

        {isError && (
          <div>
            <p className={classes.errorMessage}>Failed to fetch audit logs.</p>
            <p className={classes.errorMessage}>{error?.message}</p>
          </div>
        )}

        {!isLoading && !isError && logs.length === 0 && (
          <h4 className={classes.emptyListMessage}>No audit entries yet.</h4>
        )}

        {!isLoading &&
          !isError &&
          logs.map((log) => <AuditLogRow key={log.id} log={log} />)}
      </div>
    </section>
  );
}
