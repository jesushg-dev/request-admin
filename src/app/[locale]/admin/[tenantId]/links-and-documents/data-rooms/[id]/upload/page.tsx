import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataroomDocumentUpload } from '@/components/common/datarooms/dataroom-document-upload';

export const metadata: Metadata = {
  title: 'Upload Document to Dataroom',
  description: 'Upload a new document to the dataroom',
};

interface DataroomUploadPageProps {
  params: {
    id: string;
  };
}

export default function DataroomUploadPage({ params }: DataroomUploadPageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href={`/datarooms/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dataroom
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Upload Document to Dataroom</h1>
        </div>
      </div>

      <DataroomDocumentUpload dataroomId={params.id} />
    </div>
  );
}
