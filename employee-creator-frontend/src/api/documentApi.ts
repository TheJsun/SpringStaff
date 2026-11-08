import { apiFetch } from "./http";
import type { DocumentResponse } from "../schemas/document-schema";

const BASE_URL = import.meta.env.VITE_API_URL;

const documentsUrl = (employeeId: number) =>
  `${BASE_URL}/employees/${employeeId}/documents`;

export const getDocuments = async (employeeId: number) => {
  const response = await apiFetch(documentsUrl(employeeId), {
    credentials: "include",
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to fetch documents: ${response.status}`,
    );
  }
  return (await response.json()) as DocumentResponse[];
};

export const uploadDocument = async (
  employeeId: number,
  { file, name }: { file: File; name: string },
) => {
  const linkRes = await apiFetch(`${documentsUrl(employeeId)}/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    }),
  });

  if (!linkRes.ok) {
    const errorBody = await linkRes.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to upload document: ${linkRes.status}`,
    );
  }
  const { key, uploadUrl } = await linkRes.json();

  const s3Res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!s3Res.ok) {
    const errorBody = await s3Res.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to upload document: ${s3Res.status}`,
    );
  }

  const response = await apiFetch(documentsUrl(employeeId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ s3Key: key, name, fileName: file.name }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to upload document: ${response.status}`,
    );
  }
  return (await response.json()) as DocumentResponse;
};

export const deleteDocument = async (
  employeeId: number,
  documentId: number,
) => {
  const response = await apiFetch(`${documentsUrl(employeeId)}/${documentId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to delete document: ${response.status}`,
    );
  }
};

export const documentContentUrl = (employeeId: number, documentId: number) =>
  `${documentsUrl(employeeId)}/${documentId}/content`;
