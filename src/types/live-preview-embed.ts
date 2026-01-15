export type IframeStatus = "loading" | "ready" | "error" | "unknown" | "checking" | "missing" | "unsupported" | "supported" | "connected";

export const MESSAGE = {
  THEME_UPDATE: "THEME_UPDATE",
  IFRAME_READY: "IFRAME_READY",
  IFRAME_ERROR: "IFRAME_ERROR",
  PING: "PING",
  PONG: "PONG",
  EMBED_LOADED: "EMBED_LOADED",
  CHECK_SHADCN: "CHECK_SHADCN",
  SHADCN_STATUS: "SHADCN_STATUS",
  EMBED_ERROR: "EMBED_ERROR",
} as const;

export type MESSAGE = typeof MESSAGE[keyof typeof MESSAGE];

export interface EmbedMessage {
  type: MESSAGE;
  payload?: unknown;
}

