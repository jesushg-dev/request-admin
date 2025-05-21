import { useCallback, useEffect, useRef, useState } from 'react';

type UseFullscreenResult<T extends HTMLElement> = {
  ref: React.RefObject<T | null>;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
};

export function useFullscreen<T extends HTMLElement = HTMLDivElement>(): UseFullscreenResult<T> {
  const ref = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      msFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
    };

    if (!document.fullscreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch((err) => {
          alert(`We encountered an error trying to enable full-screen mode: ${err.message}`);
        });
      } else if (
        (
          el as HTMLElement & {
            webkitRequestFullscreen?: () => void;
            msRequestFullscreen?: () => void;
          }
        ).webkitRequestFullscreen
      ) {
        (el as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen!();
      } else if ((el as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen) {
        (el as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen!();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          alert(`We encountered an error trying to exit full-screen mode: ${err.message}`);
        });
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        msFullscreenElement?: Element | null;
      };
      const isCurrentlyFullscreen = document.fullscreenElement !== null || doc.webkitFullscreenElement !== null || doc.msFullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return { ref, isFullscreen, toggleFullscreen };
}
