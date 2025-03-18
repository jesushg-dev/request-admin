import { DocumentDetail } from '@/components/common/documents/document-detail';

interface DocumentDetailPageProps {
  params: {
    id: string;
  };
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DocumentDetail id={params.id} />
    </div>
  );
}
