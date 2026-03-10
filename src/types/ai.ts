import type { UIMessage } from "ai";
import { ThemeStyles } from "@/features/theme-designer/types/theme";

export type ThemeMentionData = {
  light: Partial<ThemeStyles["light"]>;
  dark: Partial<ThemeStyles["dark"]>;
};

export interface PromptImage {
  url: string;
}

export interface MentionReference {
  id: string;
  label: string;
  themeData: ThemeMentionData;
}

export interface AIPromptData {
  content: string;
  mentions: MentionReference[];
  images?: PromptImage[];
}

export interface ChatMessageMetadata {
  promptData?: AIPromptData;
  themeStyles?: ThemeMentionData;
}

export type ChatMessage = UIMessage<ChatMessageMetadata>;
export type ChatMessagePart = ChatMessage["parts"][number];

export interface AdditionalAIContext {
  currentTheme?: ThemeStyles;
  userPreferences?: Record<string, unknown>;
}

