import { FileText } from 'lucide-react';

export const getFileIcon = (type: string | null | undefined) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-10 w-10 text-red-500" />;
    case 'docx':
    case 'doc':
      return <FileText className="h-10 w-10 text-blue-500" />;
    case 'xlsx':
    case 'xls':
      return <FileText className="h-10 w-10 text-green-500" />;
    case 'pptx':
    case 'ppt':
      return <FileText className="h-10 w-10 text-orange-500" />;
    default:
      return <FileText className="h-10 w-10 text-gray-500" />;
  }
};
