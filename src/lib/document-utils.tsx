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

export const downloadFile = async (url: string, filename: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const urlObject = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = urlObject;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(urlObject);
};
