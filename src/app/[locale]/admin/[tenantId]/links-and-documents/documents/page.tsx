import { DocumentList } from '@/components/common/documents/document-list';

export default function DocumentsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
      </div>
      <DocumentList />
    </div>
  );
}
