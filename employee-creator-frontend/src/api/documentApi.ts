import type { DocumentResponse } from "../schemas/document-schema";

const BASE_URL = import.meta.env.VITE_API_URL;

const documentsUrl = (employeeId: number) =>
  `${BASE_URL}/employees/${employeeId}/documents`;

export const getDocuments = async (employeeId: number) => {
  const response = await fetch(documentsUrl(employeeId), {
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
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);

  // Deliberately no Content-Type header: the browser sets multipart/form-data
  // with the correct boundary itself.
  const response = await fetch(documentsUrl(employeeId), {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ?? `Failed to upload document: ${response.status}`,
    );
  }
  return (await response.json()) as DocumentResponse;
};

export const deleteDocument = async (employeeId: number, documentId: number) => {
  const response = await fetch(`${documentsUrl(employeeId)}/${documentId}`, {
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
