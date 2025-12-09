'use client';

import type React from 'react';
import { useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download, ExternalLink, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import * as MediaPlayer from '@/components/ui/media-player';

interface MediaLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string;
  contentType: string;
  title?: string;
  mediaList?: Array<{ url: string; contentType: string }>;
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  viewUrl?: string;
}

export function MediaLightbox({ open, onOpenChange, mediaUrl, contentType, title, mediaList, currentIndex = 0, onNavigate, viewUrl }: MediaLightboxProps) {
  const t = useTranslations('component.mediaLightbox');
  const isVideo = contentType.startsWith('video/');
  const isAudio = contentType.startsWith('audio/');
  const isMedia = isVideo || isAudio;

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = title || 'media';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [mediaUrl, title]);

  const handlePrevious = useCallback(() => {
    if (mediaList && onNavigate && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [mediaList, onNavigate, currentIndex]);

  const handleNext = useCallback(() => {
    if (mediaList && onNavigate && currentIndex < mediaList.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [mediaList, onNavigate, currentIndex]);

  const hasNavigation = mediaList && mediaList.length > 1;

  if (!isMedia) {
    // This component is for videos and audio only
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-[100vw] max-h-[100vh] h-[100vh] p-0 border-none bg-black/95 backdrop-blur-sm shadow-2xl overflow-hidden m-0 rounded-none">
        <div className="relative flex flex-col h-full w-full overflow-hidden">
          {/* Top Bar - Google Drive Style */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 via-black/80 to-transparent">
            <div className="flex items-center gap-3 flex-1 min-w-0">{title && <DialogTitle className="text-sm sm:text-base font-medium text-white truncate">{title}</DialogTitle>}</div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {viewUrl && (
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-white hover:bg-white/20 hover:text-white rounded-full" aria-label={t('actions.view')}>
                  <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleDownload} className="h-8 w-8 text-white hover:bg-white/20 hover:text-white rounded-full" aria-label={t('actions.download')}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 text-white hover:bg-white/20 hover:text-white rounded-full" aria-label={t('actions.close')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Buttons */}
          {hasNavigation && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={cn(
                  'absolute left-4 top-1/2 -translate-y-1/2 z-20',
                  'h-10 w-10 rounded-full bg-black/50 hover:bg-black/70',
                  'text-white border border-white/20',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
                aria-label={t('actions.previousMedia')}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex === (mediaList?.length ?? 0) - 1}
                className={cn(
                  'absolute right-4 top-1/2 -translate-y-1/2 z-20',
                  'h-10 w-10 rounded-full bg-black/50 hover:bg-black/70',
                  'text-white border border-white/20',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
                aria-label={t('actions.nextMedia')}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Media Player Container */}
          <div className="flex-1 overflow-hidden flex justify-center items-center p-4 sm:p-8 pt-16 sm:pt-20 pb-8">
            {isMedia ? (
              <MediaPlayer.Root className={cn('max-w-full w-full', isAudio ? 'min-h-[200px] max-h-[300px]' : 'max-h-[80vh] h-auto')} style={{ maxWidth: '90vw' }}>
                {isVideo ? (
                  <MediaPlayer.Video>
                    <source src={mediaUrl} type={contentType} />
                  </MediaPlayer.Video>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[200px] w-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-8">
                    <MediaPlayer.Audio className="w-full">
                      <source src={mediaUrl} type={contentType} />
                    </MediaPlayer.Audio>
                  </div>
                )}
                <MediaPlayer.Loading />
                <MediaPlayer.Error />
                <MediaPlayer.Controls>
                  <MediaPlayer.ControlsOverlay />
                  <MediaPlayer.Play />
                  <MediaPlayer.SeekBackward />
                  <MediaPlayer.SeekForward />
                  <MediaPlayer.Volume expandable />
                  <MediaPlayer.Seek />
                  <MediaPlayer.Time />
                  <MediaPlayer.PlaybackSpeed />
                  {isVideo && <MediaPlayer.Fullscreen />}
                </MediaPlayer.Controls>
              </MediaPlayer.Root>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
