import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getAuditActors, getAuditLogs } from "../api/auditApi";
import type { AuditLogParams } from "../schemas/audit-schema";

export function useAuditLogs(params: AuditLogParams) {
  return useQuery({
    queryKey: ["auditLogs", params],
    queryFn: () => getAuditLogs(params),
    // Keep the previous page visible while the next one loads so paging and
    // filtering don't flash an empty list.
    placeholderData: keepPreviousData,
  });
}

export function useAuditActors() {
  return useQuery({
    queryKey: ["auditLogs", "actors"],
    queryFn: getAuditActors,
  });
}
