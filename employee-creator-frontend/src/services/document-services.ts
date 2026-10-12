const BADGE_BY_CONTENT_TYPE: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
};

export const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png,.docx";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function fileBadgeLabel(contentType: string, fileName: string): string {
  const byType = BADGE_BY_CONTENT_TYPE[contentType];
  if (byType) return byType;
  const ext = fileName.includes(".") ? fileName.split(".").pop() : undefined;
  return (ext ?? "FILE").toUpperCase().slice(0, 4);
}

export function defaultNameFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^./\\]+$/, "");
  const spaced = withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!spaced) return withoutExtension;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function formatAddedDate(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
