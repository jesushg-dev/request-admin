'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ExternalLink, Maximize2, Minimize2, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
  images?: string[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  contentType?: string;
  viewUrl?: string;
}

export function ImageLightbox({ open, onOpenChange, imageUrl, title, images, currentIndex = 0, onNavigate, viewUrl }: ImageLightboxProps) {
  const t = useTranslations('component.imageLightbox');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFitted, setIsFitted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.25;

  useEffect(() => {
    if (open) {
      setImageLoaded(false);
      setImageError(false);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsFitted(false);
      setRotation(0);
    }
  }, [open, imageUrl]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

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

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (isFitted) {
      // Minimize: volver a zoom 1
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsFitted(false);
    } else {
      // Maximize: ajustar a pantalla
      if (imageRef.current && containerRef.current) {
        const img = imageRef.current;
        const container = containerRef.current;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const containerAspect = container.clientWidth / container.clientHeight;

        let newZoom = 1;
        if (imgAspect > containerAspect) {
          newZoom = container.clientWidth / img.naturalWidth;
        } else {
          newZoom = container.clientHeight / img.naturalHeight;
        }

        setZoom(Math.min(newZoom * 0.9, 1)); // 90% to leave some padding
        setPosition({ x: 0, y: 0 });
        setIsFitted(true);
      }
    }
  }, [isFitted]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    },
    [zoom, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, zoom, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
    }
  }, []);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = title || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl, title]);

  const handlePrevious = useCallback(() => {
    if (images && onNavigate && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [images, onNavigate, currentIndex]);

  const handleNext = useCallback(() => {
    if (images && onNavigate && currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [images, onNavigate, currentIndex]);

  const hasNavigation = images && images.length > 1;

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
                aria-label={t('actions.previousImage')}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex === (images?.length ?? 0) - 1}
                className={cn(
                  'absolute right-4 top-1/2 -translate-y-1/2 z-20',
                  'h-10 w-10 rounded-full bg-black/50 hover:bg-black/70',
                  'text-white border border-white/20',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
                aria-label={t('actions.nextImage')}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Zoom Controls Bar - Bottom Center */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full border border-white/20">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full disabled:opacity-30"
              aria-label={t('actions.zoomOut')}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-white text-sm font-medium min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full disabled:opacity-30"
              aria-label={t('actions.zoomIn')}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-white/20 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFitToScreen}
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
              aria-label={isFitted ? t('actions.minimize') : t('actions.fitToScreen')}>
              {isFitted ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleRotate} className="h-8 w-8 text-white hover:bg-white/20 rounded-full" aria-label={t('actions.rotateImage')}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Image container - Google Drive style */}
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden flex justify-center items-center p-4 sm:p-8 pt-16 sm:pt-20 pb-24"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}>
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-white/50">{t('loading')}</div>
              </div>
            )}
            {imageError ? (
              <div className="flex flex-col items-center justify-center text-white/70">
                <p className="text-sm mb-2">{t('errors.failedToLoad')}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImageError(false);
                    setImageLoaded(false);
                  }}
                  className="text-white border-white/30 hover:bg-white/10">
                  {t('errors.retry')}
                </Button>
              </div>
            ) : (
              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}>
                {/*eslint-disable-next-line @next/next/no-img-element*/}
                <img
                  ref={imageRef}
                  src={imageUrl || '/placeholder.svg'}
                  alt={title || 'Image preview'}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className={cn('object-contain', 'transition-opacity duration-300', imageLoaded ? 'opacity-100' : 'opacity-0')}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                  role="img"
                  aria-label={title || 'Image preview'}
                  draggable={false}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
