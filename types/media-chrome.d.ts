// Type declarations for media-chrome web components

declare namespace JSX {
  interface IntrinsicElements {
    'media-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { autoplay?: boolean }, HTMLElement>;
    'media-provider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'media-controls': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'media-control-bar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'media-play-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'media-seek-backward-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'media-seek-forward-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'media-time-range': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'media-time-display': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'media-mute-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'media-volume-range': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'media-playback-rate-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'media-fullscreen-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
