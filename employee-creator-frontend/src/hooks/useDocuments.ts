import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteDocument,
  getDocuments,
  uploadDocument,
} from "../api/documentApi";

export function useDocuments(employeeId: number, enabled = true) {
  return useQuery({
    queryKey: ["documents", employeeId],
    queryFn: () => getDocuments(employeeId),
    enabled,
  });
}

export function useUploadDocument(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { file: File; name: string }) =>
      uploadDocument(employeeId, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", employeeId] });
    },
  });
}

export function useDeleteDocument(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: number) => deleteDocument(employeeId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", employeeId] });
    },
  });
}
