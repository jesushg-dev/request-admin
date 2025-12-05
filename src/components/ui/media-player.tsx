'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  PlayIcon,
  PauseIcon,
  RewindIcon,
  FastForwardIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
  Maximize2Icon,
  Minimize2Icon,
  SettingsIcon,
  CheckIcon,
  Loader2Icon,
  AlertTriangleIcon,
  RefreshCcwIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SEEK_STEP_SHORT = 5;
const SEEK_STEP_LONG = 10;

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface MediaPlayerContextValue {
  mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  isVideo: boolean;
}

const MediaPlayerContext = React.createContext<MediaPlayerContextValue | null>(null);

function useMediaPlayerContext() {
  const context = React.useContext(MediaPlayerContext);
  if (!context) {
    throw new Error('MediaPlayer components must be used within MediaPlayer.Root');
  }
  return context;
}

interface MediaPlayerRootProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

function MediaPlayerRoot({ children, className, ...props }: MediaPlayerRootProps) {
  const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const [isVideo, setIsVideo] = React.useState(false);

  React.useEffect(() => {
    if (mediaRef.current) {
      setIsVideo(mediaRef.current instanceof HTMLVideoElement);
    }
  }, []);

  const contextValue = React.useMemo<MediaPlayerContextValue>(
    () => ({
      mediaRef,
      isVideo,
    }),
    [isVideo]
  );

  return (
    <MediaPlayerContext.Provider value={contextValue}>
      <div
        className={cn(
          'relative isolate flex flex-col overflow-hidden rounded-lg bg-background outline-none',
          className
        )}
        {...props}>
        {children}
      </div>
    </MediaPlayerContext.Provider>
  );
}

interface MediaPlayerVideoProps extends React.ComponentProps<'video'> {}

function MediaPlayerVideo({ ref, className, ...props }: MediaPlayerVideoProps) {
  const context = useMediaPlayerContext();
  const composedRef = React.useCallback(
    (node: HTMLVideoElement | null) => {
      context.mediaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLVideoElement | null>).current = node;
      }
    },
    [context.mediaRef, ref]
  );

  return (
    <video
      ref={composedRef}
      className={cn('relative w-full object-contain', className)}
      {...props}
    />
  );
}

interface MediaPlayerAudioProps extends React.ComponentProps<'audio'> {}

function MediaPlayerAudio({ ref, className, ...props }: MediaPlayerAudioProps) {
  const context = useMediaPlayerContext();
  const composedRef = React.useCallback(
    (node: HTMLAudioElement | null) => {
      context.mediaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLAudioElement | null>).current = node;
      }
    },
    [context.mediaRef, ref]
  );

  return (
    <audio
      ref={composedRef}
      className={cn('hidden', className)}
      {...props}
    />
  );
}

interface MediaPlayerControlsProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

function MediaPlayerControls({ children, className, ...props }: MediaPlayerControlsProps) {
  return (
    <div
      className={cn(
        'absolute right-0 bottom-0 left-0 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent',
        className
      )}
      {...props}>
      {children}
    </div>
  );
}

interface MediaPlayerControlsOverlayProps extends React.ComponentProps<'div'> {}

function MediaPlayerControlsOverlay({ className, ...props }: MediaPlayerControlsOverlayProps) {
  return (
    <div
      className={cn(
        '-z-10 pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 to-transparent',
        className
      )}
      {...props}
    />
  );
}

interface MediaPlayerLoadingProps extends React.ComponentProps<'div'> {}

function MediaPlayerLoading({ className, children, ...props }: MediaPlayerLoadingProps) {
  const context = useMediaPlayerContext();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    media.addEventListener('loadstart', handleLoadStart);
    media.addEventListener('canplay', handleCanPlay);
    media.addEventListener('waiting', handleWaiting);
    media.addEventListener('playing', handlePlaying);

    return () => {
      media.removeEventListener('loadstart', handleLoadStart);
      media.removeEventListener('canplay', handleCanPlay);
      media.removeEventListener('waiting', handleWaiting);
      media.removeEventListener('playing', handlePlaying);
    };
  }, [context.mediaRef]);

  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-50 flex items-center justify-center',
        className
      )}
      {...props}>
      {children ?? <Loader2Icon className="size-20 animate-spin stroke-[.0938rem] text-primary" />}
    </div>
  );
}

interface MediaPlayerPlayProps extends React.ComponentProps<typeof Button> {}

function MediaPlayerPlay({ className, ...props }: MediaPlayerPlayProps) {
  const context = useMediaPlayerContext();
  const t = useTranslations('component.mediaPlayer');
  const [isPaused, setIsPaused] = React.useState(true);

  React.useEffect(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    const updatePaused = () => setIsPaused(media.paused);
    media.addEventListener('play', updatePaused);
    media.addEventListener('pause', updatePaused);
    updatePaused();

    return () => {
      media.removeEventListener('play', updatePaused);
      media.removeEventListener('pause', updatePaused);
    };
  }, [context.mediaRef]);

  const handleClick = () => {
    const media = context.mediaRef.current;
    if (!media) return;

    if (media.paused) {
      media.play();
    } else {
      media.pause();
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('size-8 text-white hover:bg-white/20', className)}
          onClick={handleClick}
          {...props}>
          {isPaused ? <PlayIcon className="fill-current" /> : <PauseIcon className="fill-current" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isPaused ? t('controls.play') : t('controls.pause')}</TooltipContent>
    </Tooltip>
  );
}

interface MediaPlayerSeekBackwardProps extends React.ComponentProps<typeof Button> {
  seconds?: number;
}

function MediaPlayerSeekBackward({ seconds = SEEK_STEP_SHORT, className, ...props }: MediaPlayerSeekBackwardProps) {
  const context = useMediaPlayerContext();
  const t = useTranslations('component.mediaPlayer');

  const handleClick = () => {
    const media = context.mediaRef.current;
    if (!media) return;
    media.currentTime = Math.max(0, media.currentTime - seconds);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('size-8 text-white hover:bg-white/20', className)}
          onClick={handleClick}
          {...props}>
          <RewindIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('controls.back', { seconds })}</TooltipContent>
    </Tooltip>
  );
}

interface MediaPlayerSeekForwardProps extends React.ComponentProps<typeof Button> {
  seconds?: number;
}

function MediaPlayerSeekForward({ seconds = SEEK_STEP_LONG, className, ...props }: MediaPlayerSeekForwardProps) {
  const context = useMediaPlayerContext();
  const t = useTranslations('component.mediaPlayer');

  const handleClick = () => {
    const media = context.mediaRef.current;
    if (!media) return;
    media.currentTime = Math.min(media.duration, media.currentTime + seconds);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('size-8 text-white hover:bg-white/20', className)}
          onClick={handleClick}
          {...props}>
          <FastForwardIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('controls.forward', { seconds })}</TooltipContent>
    </Tooltip>
  );
}

interface MediaPlayerSeekProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  withTime?: boolean;
}

function MediaPlayerSeek({ withTime = false, className, ...props }: MediaPlayerSeekProps) {
  const context = useMediaPlayerContext();
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    const updateTime = () => setCurrentTime(media.currentTime);
    const updateDuration = () => setDuration(media.duration);

    media.addEventListener('timeupdate', updateTime);
    media.addEventListener('loadedmetadata', updateDuration);
    updateTime();
    updateDuration();

    return () => {
      media.removeEventListener('timeupdate', updateTime);
      media.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [context.mediaRef]);

  const handleValueChange = (value: number[]) => {
    const media = context.mediaRef.current;
    if (!media) return;
    media.currentTime = value[0] ?? 0;
  };

  const SeekSlider = (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      value={[currentTime]}
      onValueChange={handleValueChange}
      max={duration || 100}
      step={0.01}
      {...props}>
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-white/40">
        <SliderPrimitive.Range className="absolute h-full bg-white will-change-[width]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="relative z-10 block size-2.5 shrink-0 rounded-full bg-white shadow-sm ring-white/50 transition-[color,box-shadow] will-change-transform hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );

  if (withTime) {
    return (
      <div className="flex w-full items-center gap-2">
        <span className="text-sm tabular-nums text-white">{formatTime(currentTime)}</span>
        {SeekSlider}
        <span className="text-sm tabular-nums text-white">{formatTime(duration)}</span>
      </div>
    );
  }

  return SeekSlider;
}

interface MediaPlayerVolumeProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  expandable?: boolean;
}

function MediaPlayerVolume({ expandable = false, className, ...props }: MediaPlayerVolumeProps) {
  const context = useMediaPlayerContext();
  const t = useTranslations('component.mediaPlayer');
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(false);

  React.useEffect(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    const updateVolume = () => {
      setVolume(media.volume);
      setMuted(media.muted);
    };

    media.addEventListener('volumechange', updateVolume);
    updateVolume();

    return () => {
      media.removeEventListener('volumechange', updateVolume);
    };
  }, [context.mediaRef]);

  const handleMute = () => {
    const media = context.mediaRef.current;
    if (!media) return;
    media.muted = !media.muted;
  };

  const handleVolumeChange = (value: number[]) => {
    const media = context.mediaRef.current;
    if (!media) return;
    media.volume = value[0] ?? 0;
    media.muted = false;
  };

  const effectiveVolume = muted ? 0 : volume;

  return (
    <div
      className={cn(
        'group flex items-center',
        expandable ? 'gap-0 group-focus-within:gap-2 group-hover:gap-1.5' : 'gap-1.5',
        className
      )}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-white hover:bg-white/20"
            onClick={handleMute}>
            {muted ? (
              <VolumeXIcon />
            ) : volume > 0.5 ? (
              <Volume2Icon />
            ) : (
              <Volume1Icon />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{muted ? t('controls.unmute') : t('controls.mute')}</TooltipContent>
      </Tooltip>
      <SliderPrimitive.Root
        className={cn(
          'relative flex touch-none select-none items-center',
          expandable
            ? 'w-0 opacity-0 transition-[width,opacity] duration-200 ease-in-out group-focus-within:w-16 group-focus-within:opacity-100 group-hover:w-16 group-hover:opacity-100'
            : 'w-16',
          className
        )}
        value={[effectiveVolume]}
        onValueChange={handleVolumeChange}
        max={1}
        step={0.1}
        {...props}>
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-white/40">
          <SliderPrimitive.Range className="absolute h-full bg-white will-change-[width]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block size-2.5 shrink-0 rounded-full bg-white shadow-sm ring-white/50 transition-[color,box-shadow] will-change-transform hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  );
}

interface MediaPlayerTimeProps extends React.ComponentProps<'div'> {
  variant?: 'progress' | 'remaining' | 'duration';
}

function MediaPlayerTime({ variant = 'progress', className, ...props }: MediaPlayerTimeProps) {
  const context = useMediaPlayerContext();
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    const updateTime = () => setCurrentTime(media.currentTime);
    const updateDuration = () => setDuration(media.duration);

    media.addEventListener('timeupdate', updateTime);
    media.addEventListener('loadedmetadata', updateDuration);
    updateTime();
    updateDuration();

    return () => {
      media.removeEventListener('timeupdate', updateTime);
      media.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [context.mediaRef]);

  if (variant === 'remaining') {
    return (
      <div className={cn('text-white text-sm tabular-nums', className)} {...props}>
        {formatTime(duration - currentTime)}
      </div>
    );
  }

  if (variant === 'duration') {
    return (
      <div className={cn('text-white text-sm tabular-nums', className)} {...props}>
        {formatTime(duration)}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 text-white text-sm', className)} {...props}>
      <span className="tabular-nums">{formatTime(currentTime)}</span>
      <span role="separator" aria-hidden="true">
        /
      </span>
      <span className="tabular-nums">{formatTime(duration)}</span>
    </div>
  );
}

interface MediaPlayerPlaybackSpeedProps extends React.ComponentProps<typeof DropdownMenuTrigger> {
  speeds?: number[];
}

function MediaPlayerPlaybackSpeed({ speeds = SPEEDS, ...props }: MediaPlayerPlaybackSpeedProps) {
  const context = useMediaPlayerContext();
  const t = useTranslations('component.mediaPlayer');
  const [playbackRate, setPlaybackRate] = React.useState(1);

  React.useEffect(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    const updateRate = () => setPlaybackRate(media.playbackRate);
    media.addEventListener('ratechange', updateRate);
    updateRate();

    return () => {
      media.removeEventListener('ratechange', updateRate);
    };
  }, [context.mediaRef]);

  const handleRateChange = (rate: number) => {
    const media = context.mediaRef.current;
    if (!media) return;
    media.playbackRate = rate;
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-16 text-white hover:bg-white/20"
              {...props}>
              {playbackRate}x
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('controls.playbackSpeed')}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="center" className="min-w-[--radix-dropdown-menu-trigger-width]">
        {speeds.map((speed) => (
          <DropdownMenuItem key={speed} className="justify-between" onSelect={() => handleRateChange(speed)}>
            {speed}x{playbackRate === speed && <CheckIcon />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MediaPlayerFullscreenProps extends React.ComponentProps<typeof Button> {}

function MediaPlayerFullscreen({ className, ...props }: MediaPlayerFullscreenProps) {
  const context = useMediaPlayerContext();
  const t = useTranslations('component.mediaPlayer');
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleClick = () => {
    const media = context.mediaRef.current;
    if (!media) return;

    // Fullscreen only works for video elements, not audio
    if (media instanceof HTMLVideoElement) {
      if (!document.fullscreenElement) {
        media.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('size-8 text-white hover:bg-white/20', className)}
          onClick={handleClick}
          {...props}>
          {isFullscreen ? <Minimize2Icon /> : <Maximize2Icon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isFullscreen ? t('controls.exitFullscreen') : t('controls.fullscreen')}</TooltipContent>
    </Tooltip>
  );
}

interface MediaPlayerErrorProps extends React.ComponentProps<'div'> {
  error?: MediaError | null;
  label?: string;
  description?: string;
  onRetry?: () => void;
}

function MediaPlayerError({ error: errorProp, label, description, onRetry, className, children, ...props }: MediaPlayerErrorProps) {
  const context = useMediaPlayerContext();
  const t = useTranslations('component.mediaPlayer');
  const [error, setError] = React.useState<MediaError | null>(errorProp ?? null);

  React.useEffect(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    const handleError = () => {
      setError(media.error);
    };

    media.addEventListener('error', handleError);
    return () => {
      media.removeEventListener('error', handleError);
    };
  }, [context.mediaRef]);

  const mediaError = error ?? errorProp;

  const errorLabel = React.useMemo(() => {
    if (label) return label;
    if (!mediaError) return t('errors.playbackError');

    const labelMap: Record<number, string> = {
      [MediaError.MEDIA_ERR_ABORTED]: t('errors.playbackInterrupted'),
      [MediaError.MEDIA_ERR_NETWORK]: t('errors.connectionProblem'),
      [MediaError.MEDIA_ERR_DECODE]: t('errors.mediaError'),
      [MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED]: t('errors.unsupportedFormat'),
    };

    return labelMap[mediaError.code] ?? t('errors.playbackError');
  }, [label, mediaError, t]);

  const errorDescription = React.useMemo(() => {
    if (description) return description;
    if (!mediaError) return t('errors.unknownError');

    const descriptionMap: Record<number, string> = {
      [MediaError.MEDIA_ERR_ABORTED]: t('errors.aborted'),
      [MediaError.MEDIA_ERR_NETWORK]: t('errors.networkError'),
      [MediaError.MEDIA_ERR_DECODE]: t('errors.decodeError'),
      [MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED]: t('errors.unsupported'),
    };

    return descriptionMap[mediaError.code] ?? t('errors.unknownError');
  }, [description, mediaError, t]);

  if (!mediaError) return null;

  const handleRetry = () => {
    const media = context.mediaRef.current;
    if (!media) return;

    if (onRetry) {
      onRetry();
    } else {
      const currentSrc = media.currentSrc ?? (media as HTMLVideoElement | HTMLAudioElement).src;
      if (currentSrc) {
        media.load();
      }
    }
    setError(null);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn('pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-sm', className)}
      {...props}>
      {children ?? (
        <div className="flex max-w-md flex-col items-center gap-4 px-6 py-8 text-center">
          <AlertTriangleIcon className="size-12 text-destructive" />
          <div className="flex flex-col gap-px text-center">
            <h3 className="font-semibold text-xl tracking-tight">{errorLabel}</h3>
            <p className="text-balance text-muted-foreground text-sm leading-relaxed">{errorDescription}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleRetry}>
            <RefreshCcwIcon className="mr-2 h-4 w-4" />
            {t('actions.tryAgain')}
          </Button>
        </div>
      )}
    </div>
  );
}

export {
  MediaPlayerRoot as MediaPlayer,
  MediaPlayerVideo,
  MediaPlayerAudio,
  MediaPlayerControls,
  MediaPlayerControlsOverlay,
  MediaPlayerLoading,
  MediaPlayerError,
  MediaPlayerPlay,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerSeek,
  MediaPlayerVolume,
  MediaPlayerTime,
  MediaPlayerPlaybackSpeed,
  MediaPlayerFullscreen,
  //
  MediaPlayerRoot as Root,
  MediaPlayerVideo as Video,
  MediaPlayerAudio as Audio,
  MediaPlayerControls as Controls,
  MediaPlayerControlsOverlay as ControlsOverlay,
  MediaPlayerLoading as Loading,
  MediaPlayerError as Error,
  MediaPlayerPlay as Play,
  MediaPlayerSeekBackward as SeekBackward,
  MediaPlayerSeekForward as SeekForward,
  MediaPlayerSeek as Seek,
  MediaPlayerVolume as Volume,
  MediaPlayerTime as Time,
  MediaPlayerPlaybackSpeed as PlaybackSpeed,
  MediaPlayerFullscreen as Fullscreen,
};
