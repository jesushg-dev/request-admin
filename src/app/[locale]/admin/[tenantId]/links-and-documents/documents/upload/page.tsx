import { DocumentUpload } from '@/components/documents/document-upload';
import { MainLayout } from '@/components/layouts/main-layout';

export default function DocumentUploadPage() {
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Upload Document</h2>
        </div>
        <DocumentUpload />
      </div>
    </MainLayout>
  );
}
