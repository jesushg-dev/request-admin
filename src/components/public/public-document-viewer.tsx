'use client';

import { useEffect } from 'react';
import DocumentViewer from '@/components/common/documents/document-viewer';

interface PublicDocumentViewerProps {
  fileUrl: string;
  contentType?: string | null;
  title?: string;
  allowDownload: boolean;
  enableScreenshotProtection: boolean;
  enableWatermark: boolean;
}

export function PublicDocumentViewer({
  fileUrl,
  contentType,
  title,
  allowDownload,
  enableScreenshotProtection,
  enableWatermark,
}: PublicDocumentViewerProps) {
  // Apply screenshot protection
  useEffect(() => {
    if (enableScreenshotProtection) {
      // Disable right-click context menu
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      // Disable common screenshot shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        // Disable Print Screen, F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.key === 'PrintScreen' ||
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'u')
        ) {
          e.preventDefault();
          return false;
        }
      };

      // Disable text selection
      document.addEventListener('selectstart', (e) => e.preventDefault());
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('selectstart', (e) => e.preventDefault());
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enableScreenshotProtection]);

  // Apply watermark if enabled
  useEffect(() => {
    if (enableWatermark) {
      // Create watermark overlay
      const watermark = document.createElement('div');
      watermark.style.position = 'fixed';
      watermark.style.top = '0';
      watermark.style.left = '0';
      watermark.style.width = '100%';
      watermark.style.height = '100%';
      watermark.style.pointerEvents = 'none';
      watermark.style.zIndex = '9999';
      watermark.style.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(0,0,0,0.05) 100px, rgba(0,0,0,0.05) 200px)';
      watermark.style.opacity = '0.3';

      document.body.appendChild(watermark);

      return () => {
        if (document.body.contains(watermark)) {
          document.body.removeChild(watermark);
        }
      };
    }
  }, [enableWatermark]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {title && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
        )}
        <div className={enableScreenshotProtection ? 'select-none' : ''}>
          <DocumentViewer fileUrl={fileUrl} contentType={contentType || undefined} title={title} />
        </div>
        {!allowDownload && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Download is disabled for this document
          </div>
        )}
      </div>
    </div>
  );
}

