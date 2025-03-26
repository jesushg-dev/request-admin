'use client';

import type React from 'react';
import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { downloadFile } from '@/lib/document-utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface DocumentViewerProps {
  fileUrl: string;
  contentType?: string;
  title?: string;
}

const DocumentViewer = ({ fileUrl, contentType = 'application/octet-stream', title = 'Document' }: DocumentViewerProps) => {
  const t = useTranslations('admin.document.view.documentViewer');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleDownload = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title || t('default_document_name');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openLightbox = () => setLightboxOpen(true);

  const renderContent = (inLightbox = false) => {
    const handleClick = inLightbox ? undefined : openLightbox;

    if (!contentType) return renderGenericFile(handleClick, inLightbox);

    if (contentType.startsWith('image/')) {
      return (
        <Card className={`rounded-lg overflow-hidden ${!inLightbox && 'cursor-pointer'}`} onClick={handleClick}>
          {/*eslint-disable-next-line @next/next/no-img-element*/}
          <img
            src={fileUrl || '/placeholder.svg'}
            alt={title}
            className={`w-full object-contain ${inLightbox ? 'max-h-[80vh]' : 'max-h-[600px]'}`}
            role="img"
            aria-label={t('aria.document_preview', { title })}
          />
        </Card>
      );
    }

    if (contentType === 'application/pdf') {
      return (
        <Card className={`rounded-lg overflow-hidden ${!inLightbox && 'cursor-pointer'}`} onClick={handleClick}>
          <embed src={fileUrl} type="application/pdf" className={`w-full ${inLightbox ? 'h-[80vh]' : 'h-[500px]'}`} aria-label={t('aria.pdf_document')} title={title} />
        </Card>
      );
    }

    if (contentType.startsWith('video/')) {
      return (
        <Card className={`rounded-lg overflow-hidden p-2 ${!inLightbox && 'cursor-pointer'}`} onClick={handleClick}>
          <video controls className={`w-full rounded-lg ${inLightbox ? 'max-h-[80vh]' : 'max-h-96'}`} aria-label={t('aria.video_player')}>
            <source src={fileUrl} type={contentType} />
            {t('browser_no_support.video')}
          </video>
        </Card>
      );
    }

    if (contentType.startsWith('audio/')) {
      return (
        <Card className={`rounded-lg p-4 ${!inLightbox && 'cursor-pointer'}`} onClick={handleClick}>
          <audio controls className="w-full" aria-label={t('aria.audio_player')}>
            <source src={fileUrl} type={contentType} />
            {t('browser_no_support.audio')}
          </audio>
        </Card>
      );
    }

    if (contentType.startsWith('text/')) {
      return (
        <Card className={`rounded-lg overflow-hidden ${!inLightbox && 'cursor-pointer'}`} onClick={handleClick}>
          <iframe src={fileUrl} className={`w-full ${inLightbox ? 'h-[80vh]' : 'h-96'}`} title={title} aria-label={t('aria.text_content')} />
        </Card>
      );
    }

    return renderGenericFile(handleClick, inLightbox);
  };

  const renderGenericFile = (handleClick?: () => void, inLightbox = false) => (
    <Card className={`rounded-lg p-6 flex flex-col items-center gap-4 ${!inLightbox && 'cursor-pointer'}`} onClick={handleClick}>
      <FileText className="h-16 w-16 text-gray-400" />
      <p className="text-gray-600 dark:text-gray-400">{t('preview_not_available')}</p>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}>
        <Download className="mr-2 h-4 w-4" />
        {t('download_file')}
      </Button>
    </Card>
  );

  if (!fileUrl) {
    return (
      <Card className="rounded-lg p-6 flex flex-col items-center gap-4">
        <p className="text-gray-600 dark:text-gray-400">{t('no_file_url')}</p>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {renderContent()}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] p-4 border-none bg-background shadow-lg">
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <DialogTitle>{title}</DialogTitle>
            </div>
            <div className="flex-1 overflow-auto justify-center items-center">{renderContent(true)}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const DocumentDownloadButton = ({ fileUrl, title = 'Document' }: DocumentViewerProps) => {
  const t = useTranslations('admin.document.view.documentViewer');

  return (
    <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => downloadFile(fileUrl, title)}>
      <Download className="h-4 w-4" />
      <span className="sr-only">{t('actions.download')}</span>
    </Button>
  );
};

export default DocumentViewer;
