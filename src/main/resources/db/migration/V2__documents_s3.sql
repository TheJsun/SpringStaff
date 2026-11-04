DELETE FROM documents;
ALTER TABLE documents DROP COLUMN data;
ALTER TABLE documents ADD COLUMN s3_key VARCHAR(512) NOT NULL;
ALTER TABLE documents ADD CONSTRAINT uk_documents_s3_key UNIQUE (s3_key);