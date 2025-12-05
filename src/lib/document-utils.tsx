import { FileText } from 'lucide-react';

import { cn } from './utils';

export const getFileIcon = (type: string | null | undefined, className: string = 'h-4 w-4') => {
  switch (type) {
    case 'pdf':
      return <FileText className={cn(className, 'text-red-500')} />;
    case 'docx':
    case 'doc':
      return <FileText className={cn(className, 'text-blue-500')} />;
    case 'xlsx':
    case 'xls':
      return <FileText className={cn(className, 'text-green-500')} />;
    case 'pptx':
    case 'ppt':
      return <FileText className={cn(className, 'text-orange-500')} />;
    default:
      return <FileText className={cn(className, 'text-gray-500')} />;
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
