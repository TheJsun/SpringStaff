import { useRef, useState } from "react";
import { useDocuments } from "../../hooks/useDocuments";
import { useAuth } from "../../context/useAuth";
import { Skeleton } from "../Skeleton/Skeleton";
import { DocumentRow } from "../DocumentRow/DocumentRow";
import { DocumentUploadModal } from "../DocumentUploadModal/DocumentUploadModal";
import { ACCEPTED_FILE_TYPES } from "../../services/document-services";
import classes from "./DocumentsPanel.module.scss";

interface DocumentsPanelProps {
  employeeId: number;
}

export function DocumentsPanel({ employeeId }: DocumentsPanelProps) {
  const { user } = useAuth();
  const { data: documents, isLoading, isError } = useDocuments(employeeId);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) setPendingFile(file);
  };

  return (
    <section className={classes.panel}>
      <div
        className={`${classes.dropzone} ${isDragging ? classes.dragging : ""}`.trim()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
      >
        <div className={classes.dropzoneText}>
          <p className={classes.dropzoneTitle}>
            Drag files here, or{" "}
            <button
              type="button"
              className={classes.browse}
              onClick={() => fileInputRef.current?.click()}
            >
              browse
            </button>
          </p>
          <p className={classes.dropzoneHint}>
            PDF, JPG, PNG or DOCX · up to 10 MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          className={classes.hiddenInput}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {isError && (
        <p className={classes.message}>Could not load documents.</p>
      )}

      {isLoading && (
        <div className={classes.list}>
          <Skeleton height="3rem" variant="light" />
          <Skeleton height="3rem" variant="light" />
          <Skeleton height="3rem" variant="light" />
        </div>
      )}

      {!isLoading && !isError && documents && documents.length === 0 && (
        <p className={classes.message}>No documents yet.</p>
      )}

      {!isLoading && !isError && documents && documents.length > 0 && (
        <div className={classes.list}>
          <div className={classes.listHeader}>
            <span>Name</span>
            <span>Added</span>
            <span />
          </div>
          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              employeeId={employeeId}
              doc={doc}
              isMine={doc.uploadedByUserId === user?.userId}
            />
          ))}
        </div>
      )}

      {pendingFile && (
        <DocumentUploadModal
          employeeId={employeeId}
          file={pendingFile}
          onClose={() => setPendingFile(null)}
          onUploaded={() => setPendingFile(null)}
        />
      )}
    </section>
  );
}
