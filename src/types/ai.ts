import { ThemeStyles } from "@/features/theme-designer/types/theme";

export interface PromptImage {
  url: string;
}

export interface MentionReference {
  id: string;
  label: string;
  themeData: Partial<ThemeStyles>;
}

export interface AIPromptData {
  content: string;
  mentions: MentionReference[];
  images?: PromptImage[];
}

export interface ChatMessagePart {
  type: "text" | "theme" | "tool-generateTheme" | "reasoning";
  text?: string;
  themeStyles?: ThemeStyles;
  state?: string;
  output?: ThemeStyles;
}

export interface ChatMessageMetadata {
  promptData?: AIPromptData;
  themeStyles?: ThemeStyles;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: ChatMessagePart[];
  metadata?: ChatMessageMetadata;
  createdAt?: Date;
}

export interface AdditionalAIContext {
  currentTheme?: ThemeStyles;
  userPreferences?: Record<string, unknown>;
}

