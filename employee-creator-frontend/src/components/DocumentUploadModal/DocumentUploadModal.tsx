import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { useUploadDocument } from "../../hooks/useDocuments";
import { UploadDocumentRequest } from "../../schemas/document-schema";
import {
  ACCEPTED_FILE_TYPES,
  defaultNameFromFileName,
  fileBadgeLabel,
  formatFileSize,
} from "../../services/document-services";
import classes from "./DocumentUploadModal.module.scss";

interface DocumentUploadModalProps {
  employeeId: number;
  file: File;
  onClose: () => void;
  onUploaded: () => void;
}

export function DocumentUploadModal({
  employeeId,
  file,
  onClose,
  onUploaded,
}: DocumentUploadModalProps) {
  const [currentFile, setCurrentFile] = useState<File>(file);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument(employeeId);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UploadDocumentRequest>({
    resolver: zodResolver(UploadDocumentRequest),
    defaultValues: { name: defaultNameFromFileName(file.name) },
  });

  const onReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (next) setCurrentFile(next);
    event.target.value = "";
  };

  const onSubmit = (data: UploadDocumentRequest) => {
    uploadMutation.mutate(
      { file: currentFile, name: data.name.trim() },
      {
        onSuccess: onUploaded,
        onError: (error: Error) =>
          setError("name", { type: "server", message: error.message }),
      },
    );
  };

  return (
    <Modal title="Add document" onClose={onClose}>
      <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={classes.fileRow}>
          <span className={classes.badge}>
            {fileBadgeLabel(currentFile.type, currentFile.name)}
          </span>
          <div className={classes.fileInfo}>
            <span className={classes.fileName}>{currentFile.name}</span>
            <span className={classes.fileSize}>
              {formatFileSize(currentFile.size)}
            </span>
          </div>
          <button
            type="button"
            className={classes.replace}
            onClick={() => replaceInputRef.current?.click()}
          >
            Replace
          </button>
          <input
            ref={replaceInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            className={classes.hiddenInput}
            onChange={onReplace}
          />
        </div>

        <div className={classes.fieldGroup}>
          <label className={classes.label} htmlFor="documentName">
            Name
          </label>
          <input
            id="documentName"
            className={`${classes.field} ${errors.name ? classes["field--invalid"] : ""}`.trim()}
            autoFocus
            {...register("name")}
          />
          {errors.name && (
            <p className={classes.error}>{errors.name.message}</p>
          )}
        </div>

        <div className={classes.actions}>
          <Button
            type="submit"
            variant="primary"
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
          <button
            type="button"
            className={classes.cancel}
            onClick={onClose}
            disabled={uploadMutation.isPending}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
