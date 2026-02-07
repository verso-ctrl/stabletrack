'use client';

import { FileText, Plus } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface DocumentsTabProps {
  horse: {
    id: string;
    documents?: Document[];
  };
  canEdit?: boolean;
}

export function DocumentsTab({ horse, canEdit = true }: DocumentsTabProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Documents</h3>
        {canEdit && (
          <button className="btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            Upload
          </button>
        )}
      </div>
      {horse.documents && horse.documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {horse.documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-accent transition-all"
            >
              <FileText className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{doc.title}</p>
                <p className="text-sm text-muted-foreground">{doc.type}</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No documents uploaded</p>
      )}
    </div>
  );
}
