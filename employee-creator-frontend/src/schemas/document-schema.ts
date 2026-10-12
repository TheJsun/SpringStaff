import { z } from "zod";

export interface DocumentResponse {
  id: number;
  name: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedByUserId: number;
  uploadedByName: string;
}

export const UploadDocumentRequest = z.object({
  name: z
    .string()
    .min(1, "Document name is required")
    .max(255, "Document name must be 255 characters or fewer"),
});

export type UploadDocumentRequest = z.infer<typeof UploadDocumentRequest>;
