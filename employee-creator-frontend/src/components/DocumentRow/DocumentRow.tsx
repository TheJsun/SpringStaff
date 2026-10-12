import { useEffect, useRef, useState } from "react";
import type { DocumentResponse } from "../../schemas/document-schema";
import { documentContentUrl } from "../../api/documentApi";
import { useDeleteDocument } from "../../hooks/useDocuments";
import {
  fileBadgeLabel,
  formatAddedDate,
  formatFileSize,
} from "../../services/document-services";
import classes from "./DocumentRow.module.scss";

interface DocumentRowProps {
  employeeId: number;
  doc: DocumentResponse;
  isMine: boolean;
}

export function DocumentRow({ employeeId, doc, isMine }: DocumentRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteMutation = useDeleteDocument(employeeId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uploader = isMine ? "You" : doc.uploadedByName;
  const addedLine = `${uploader} · ${formatAddedDate(doc.uploadedAt)} · ${formatFileSize(
    doc.sizeBytes,
  )}`;

  const handleDelete = () => {
    setIsMenuOpen(false);
    if (window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(doc.id);
    }
  };

  return (
    <div className={classes.row}>
      <div className={classes.main}>
        <span className={classes.badge}>
          {fileBadgeLabel(doc.contentType, doc.fileName)}
        </span>
        <div className={classes.nameBlock}>
          <span className={classes.name}>{doc.name}</span>
          <span className={classes.metaMobile}>{addedLine}</span>
        </div>
      </div>

      <span className={classes.metaDesktop}>{addedLine}</span>

      <div className={classes.actions}>
        <a
          className={classes.view}
          href={documentContentUrl(employeeId, doc.id)}
          target="_blank"
          rel="noreferrer"
        >
          View
        </a>
        <div
          className={classes.menu}
          ref={menuRef}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className={classes.menuTrigger}
            aria-label="Document actions"
            aria-expanded={isMenuOpen}
            disabled={deleteMutation.isPending}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            ⋮
          </button>
          {isMenuOpen && (
            <div className={classes.menuDropdown}>
              <button
                type="button"
                className={classes.menuItem}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
