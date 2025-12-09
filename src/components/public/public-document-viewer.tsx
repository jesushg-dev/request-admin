'use client';

import { useEffect, useState, useCallback, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Search, ZoomIn, ZoomOut, Bookmark, MessageSquare, Download, Maximize2, Minimize2, HelpCircle, MessagesSquare, Smile } from 'lucide-react';
import { submitFeedback, toggleBookmark } from '@/actions/link-access';
import { toast } from 'sonner';
import { useFullscreen } from '@/hooks/use-full-screen';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { PublicDocumentQuestions } from './public-document-questions';
import { PublicDocumentConversations } from './public-document-conversations';
import { PublicDocumentReactions } from './public-document-reactions';

interface PublicDocumentViewerProps {
  viewId: string;
  documentId: string;
  tenantId: string;
  contentType?: string | null;
  title?: string;
  allowDownload: boolean;
  enableScreenshotProtection: boolean;
  enableWatermark: boolean;
  linkId: string;
  enableFeedback: boolean;
  enableQuestion: boolean;
  enableConversation: boolean;
  viewerEmail?: string | null;
  viewerName?: string | null;
}

export function PublicDocumentViewer({
  viewId,
  documentId,
  tenantId,
  contentType,
  title,
  allowDownload,
  enableScreenshotProtection,
  enableWatermark,
  linkId,
  enableFeedback,
  enableQuestion,
  enableConversation,
  viewerEmail,
  viewerName,
}: PublicDocumentViewerProps) {
  const t = useTranslations('public.link.viewer');
  
  // Generate secure document URL
  const documentUrl = `/api/documents/${viewId}/serve`;
  const downloadUrl = `/api/documents/${viewId}/serve?download=true`;
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [conversationsOpen, setConversationsOpen] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [isPendingFeedback, startFeedbackTransition] = useTransition();
  const [isPendingBookmark, startBookmarkTransition] = useTransition();
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen<HTMLDivElement>();

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.25;

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - ZOOM_STEP, MIN_ZOOM);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleBookmark = useCallback(() => {
    if (!viewId || isPendingBookmark) return;
    
    startBookmarkTransition(async () => {
      try {
        const result = await toggleBookmark(viewId);
        if (result.success) {
          setIsBookmarked(result.isBookmarked);
          toast.success(result.isBookmarked ? t('bookmarked') : t('bookmarkRemoved'));
        } else {
          toast.error(result.error || t('feedbackDialog.error'));
        }
      } catch (error) {
        toast.error(t('feedbackDialog.error'));
      }
    });
  }, [viewId, isPendingBookmark, t]);

  const handleSubmitFeedback = useCallback(() => {
    if (!feedbackText.trim()) {
      toast.error(t('feedbackDialog.emptyError'));
      return;
    }

    if (!viewId || isPendingFeedback) {
      toast.error(t('feedbackDialog.waitError'));
      return;
    }

    startFeedbackTransition(async () => {
      try {
        const result = await submitFeedback(viewId, { text: feedbackText, timestamp: new Date().toISOString() });
        if (result.success) {
          toast.success(t('feedbackDialog.success'));
          setFeedbackText('');
          setFeedbackOpen(false);
        } else {
          toast.error(result.error || t('feedbackDialog.error'));
        }
      } catch (error) {
        toast.error(t('feedbackDialog.error'));
      }
    });
  }, [viewId, feedbackText, isPendingFeedback, t]);

  // Handle zoom with mouse wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom((prev) => {
          const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta));
          if (newZoom === 1) {
            setPosition({ x: 0, y: 0 });
          }
          return newZoom;
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);
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
    if (enableWatermark && viewerEmail) {
      // Create watermark overlay with repeating email text
      const watermark = document.createElement('div');
      watermark.style.position = 'fixed';
      watermark.style.top = '0';
      watermark.style.left = '0';
      watermark.style.width = '100%';
      watermark.style.height = '100%';
      watermark.style.pointerEvents = 'none';
      watermark.style.zIndex = '9999';
      watermark.style.overflow = 'hidden';
      watermark.style.opacity = '0.15';
      
      // Create repeating pattern of email text
      const watermarkText = viewerName ? `${viewerEmail} • ${viewerName}` : viewerEmail;
      const rows = Math.ceil(window.innerHeight / 80) + 1;
      const cols = Math.ceil(window.innerWidth / 300) + 1;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const textElement = document.createElement('div');
          textElement.textContent = watermarkText;
          textElement.style.position = 'absolute';
          textElement.style.fontSize = '16px';
          textElement.style.fontWeight = '500';
          textElement.style.color = '#000';
          textElement.style.transform = 'rotate(-45deg)';
          textElement.style.whiteSpace = 'nowrap';
          textElement.style.userSelect = 'none';
          textElement.style.left = `${col * 300}px`;
          textElement.style.top = `${row * 80}px`;
          watermark.appendChild(textElement);
        }
      }

      document.body.appendChild(watermark);

      // Handle window resize
      const handleResize = () => {
        watermark.remove();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        if (document.body.contains(watermark)) {
          document.body.removeChild(watermark);
        }
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [enableWatermark, viewerEmail, viewerName]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - Request Engine Style (consistent with LinkAccessGuard) */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6">
          {/* Left side - Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t('brandName')}
              </span>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                className="pl-9 h-9 w-full bg-muted/50"
                disabled
              />
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 border rounded-md bg-muted/30">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted"
                onClick={handleZoomOut}
                disabled={zoom <= MIN_ZOOM}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <button
                onClick={handleResetZoom}
                className="text-xs font-medium px-2 min-w-[3.5rem] text-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {Math.round(zoom * 100)}%
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted"
                onClick={handleZoomIn}
                disabled={zoom >= MAX_ZOOM}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Fullscreen */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-muted" 
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? t('exitFullscreen') : t('fullscreen')}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            {/* Download button (if allowed) */}
            {allowDownload && (
              <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-muted" asChild>
                <a href={downloadUrl} download={title || 'document'}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('download')}
                </a>
              </Button>
            )}

            {/* Bookmark */}
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8 hover:bg-muted', isBookmarked && 'text-primary')}
              onClick={handleBookmark}
              aria-label={t('bookmark')}>
              <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
            </Button>

            {/* Feedback */}
            {enableFeedback && (
              <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-muted" onClick={() => setFeedbackOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('feedback')}
              </Button>
            )}

            {/* Questions */}
            {enableQuestion && (
              <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-muted" onClick={() => setQuestionsOpen(true)}>
                <HelpCircle className="h-4 w-4 mr-2" />
                {t('questions')}
              </Button>
            )}

            {/* Conversations */}
            {enableConversation && (
              <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-muted" onClick={() => setConversationsOpen(true)}>
                <MessagesSquare className="h-4 w-4 mr-2" />
                {t('conversations')}
              </Button>
            )}

            {/* Reactions */}
            {enableFeedback && (
              <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-muted" onClick={() => setReactionsOpen(true)}>
                <Smile className="h-4 w-4 mr-2" />
                Reactions
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Title - Always show if available */}
          {title && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
          )}
          
          {/* Error Message */}
          {loadError && (
            <Card className="rounded-lg p-6 flex flex-col items-center gap-4 w-full max-w-4xl mx-auto">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-destructive mb-2">{t('accessDenied')}</h2>
                <p className="text-muted-foreground">{loadError}</p>
              </div>
            </Card>
          )}
          
          {viewId && !loadError ? (
            <div
              ref={containerRef}
              className={cn(
                enableScreenshotProtection ? 'select-none' : '',
                'w-full py-8',
                'cursor-default relative'
              )}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}>
              <div
                ref={contentRef}
                className="w-full flex justify-center items-center"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}>
                {contentType?.startsWith('image/') ? (
                  <Card className="rounded-lg overflow-hidden">
                    {/*eslint-disable-next-line @next/next/no-img-element*/}
                    <img
                      src={documentUrl}
                      alt={title || 'Document'}
                      className="w-full max-w-4xl object-contain max-h-[80vh]"
                      draggable={false}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.naturalWidth === 0) {
                          // Image failed to load - likely a 403/404
                          setLoadError(t('forbidden'));
                        }
                      }}
                    />
                  </Card>
                ) : contentType === 'application/pdf' ? (
                  <Card className="rounded-lg overflow-hidden w-full max-w-4xl">
                    <embed 
                      src={documentUrl} 
                      type="application/pdf" 
                      className="w-full h-[80vh]"
                      onError={() => {
                        setLoadError(t('forbidden'));
                      }}
                    />
                  </Card>
                ) : contentType?.startsWith('video/') ? (
                  <Card className="rounded-lg overflow-hidden p-2 w-full max-w-4xl">
                    <video 
                      controls 
                      className="w-full rounded-lg max-h-[80vh]"
                      onError={() => {
                        setLoadError(t('forbidden'));
                      }}>
                      <source src={documentUrl} type={contentType} />
                    </video>
                  </Card>
                ) : contentType?.startsWith('audio/') ? (
                  <Card className="rounded-lg p-4 w-full max-w-4xl">
                    <audio 
                      controls 
                      className="w-full"
                      onError={() => {
                        setLoadError(t('forbidden'));
                      }}>
                      <source src={documentUrl} type={contentType} />
                    </audio>
                  </Card>
                ) : contentType?.startsWith('text/') ? (
                  <Card className="rounded-lg overflow-hidden w-full max-w-4xl">
                    <iframe 
                      src={documentUrl} 
                      className="w-full h-[80vh]" 
                      title={title}
                      onError={() => {
                        setLoadError(t('forbidden'));
                      }}
                    />
                  </Card>
                ) : (
                  <Card className="rounded-lg p-6 flex flex-col items-center gap-4 w-full max-w-4xl">
                    <p className="text-muted-foreground">{t('previewNotAvailable')}</p>
                    {allowDownload && (
                      <Button asChild>
                        <a href={downloadUrl} download={title || 'document'}>
                          <Download className="mr-2 h-4 w-4" />
                          {t('downloadFile')}
                        </a>
                      </Button>
                    )}
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8">{t('documentNotAvailable')}</div>
          )}
          {!allowDownload && (
            <div className="mt-6 text-center text-sm text-muted-foreground bg-muted/30 rounded-md py-3 px-4">
              {t('downloadDisabled')}
            </div>
          )}
        </div>
      </main>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('feedbackDialog.title')}</DialogTitle>
            <DialogDescription>{t('feedbackDialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t('feedbackDialog.placeholder')}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFeedbackOpen(false)} disabled={isPendingFeedback}>
                {t('feedbackDialog.cancel')}
              </Button>
              <Button onClick={handleSubmitFeedback} disabled={isPendingFeedback || !feedbackText.trim()}>
                {isPendingFeedback ? t('feedbackDialog.submitting') : t('feedbackDialog.submit')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Questions Sheet */}
      {enableQuestion && (
        <Sheet open={questionsOpen} onOpenChange={setQuestionsOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
            <PublicDocumentQuestions viewId={viewId} linkId={linkId} viewerEmail={viewerEmail || null} />
          </SheetContent>
        </Sheet>
      )}

      {/* Conversations Sheet */}
      {enableConversation && (
        <Sheet open={conversationsOpen} onOpenChange={setConversationsOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
            <PublicDocumentConversations viewId={viewId} linkId={linkId} viewerEmail={viewerEmail || null} />
          </SheetContent>
        </Sheet>
      )}

      {/* Reactions Sheet */}
      {enableFeedback && (
        <Sheet open={reactionsOpen} onOpenChange={setReactionsOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
            <PublicDocumentReactions viewId={viewId} documentId={documentId} tenantId={tenantId} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

