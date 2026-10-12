import { useRef, useState } from "react";
import HomeHeader from "../../components/Header/HomeHeader";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown";
import AuditLogList from "../../components/AuditLogList/AuditLogList";
import Pagination from "../../components/Pagination/Pagination";
import { useAuditActors, useAuditLogs } from "../../hooks/useAuditLogs";
import {
  ACTION_OPTIONS,
  ENTITY_TYPE_OPTIONS,
} from "../../services/audit-services";
import type { AuditAction } from "../../schemas/audit-schema";
import classes from "./AuditLogPage.module.scss";

const PAGE_SIZE = 20;

const AuditLogPage = () => {
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState<AuditAction | "">("");
  const [actorId, setActorId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const paginationRef = useRef<HTMLDivElement>(null);

  const { data: actors = [] } = useAuditActors();

  const { data, isLoading, isError, error } = useAuditLogs({
    page: currentPage - 1,
    size: PAGE_SIZE,
    entityType: entityType || undefined,
    action: action || undefined,
    actorId: actorId ? Number(actorId) : null,
  });

  const logs = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;

  const resetToFirstPage = () => setCurrentPage(1);

  const actorOptions = actors.map((actor) => ({
    value: String(actor.actorId),
    label: actor.actorEmail,
  }));

  const hasActiveFilters = Boolean(entityType || action || actorId);
  const clearFilters = () => {
    setEntityType("");
    setAction("");
    setActorId("");
    resetToFirstPage();
  };

  return (
    <main className={classes.auditPage}>
      <HomeHeader
        title="Audit log"
        count={totalElements}
        countLabel={totalElements === 1 ? "entry" : "entries"}
        isLoading={isLoading}
      />
      <section className={classes.content}>
        <div className={classes.contentInner}>
          <div className={classes.toolbar}>
            <div className={classes.filters}>
              <button
                type="button"
                className={
                  hasActiveFilters
                    ? classes.allButton
                    : `${classes.allButton} ${classes.allButtonActive}`
                }
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                aria-label="Clear all filters"
              >
                All
              </button>
              <span className={classes.divider} aria-hidden="true" />
              <FilterDropdown
                label="Entity"
                allLabel="All entities"
                options={ENTITY_TYPE_OPTIONS.map((option) => ({ ...option }))}
                value={entityType}
                onChange={(value) => {
                  setEntityType(value);
                  resetToFirstPage();
                }}
              />
              <FilterDropdown
                label="Action"
                allLabel="All actions"
                options={ACTION_OPTIONS}
                value={action}
                onChange={(value) => {
                  setAction(value as AuditAction | "");
                  resetToFirstPage();
                }}
              />
              <FilterDropdown
                label="Actor"
                allLabel="All actors"
                options={actorOptions}
                value={actorId}
                onChange={(value) => {
                  setActorId(value);
                  resetToFirstPage();
                }}
                disabled={actorOptions.length === 0}
              />
            </div>
          </div>

          <AuditLogList
            logs={logs}
            isLoading={isLoading}
            isError={isError}
            error={error}
          />
        </div>
      </section>
      <Pagination
        currentPage={currentPage}
        totalItems={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        containerRef={paginationRef}
      />
    </main>
  );
};

export default AuditLogPage;
