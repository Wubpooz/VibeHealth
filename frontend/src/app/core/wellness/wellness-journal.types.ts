// Mood and Journal Types

export type MoodEmoji = 'VERY_SAD' | 'SAD' | 'NEUTRAL' | 'HAPPY' | 'VERY_HAPPY' | 'EXCITED';
export type MediaType = 'IMAGE' | 'AUDIO';

export interface MoodLog {
  id: string;
  date: Date;
  mood: MoodEmoji;
  note: string | null;
  tags: string[];
  journalEntryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaAttachment {
  id: string;
  type: MediaType;
  url: string;
  mimeType: string;
  durationSeconds: number | null;
}

export interface JournalEntry {
  id: string;
  title: string | null;
  richText: string;
  mood: {
    id: string;
    date: Date;
    mood: MoodEmoji;
  } | null;
  media: MediaAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodUpsertPayload {
  date: string; // YYYY-MM-DD
  mood: MoodEmoji;
  note?: string;
  tags?: string[];
}

export interface JournalEntryCreatePayload {
  title?: string;
  richText: string;
  moodLogId?: string;
}

export interface JournalEntryUpdatePayload {
  title?: string;
  richText?: string;
  moodLogId?: string | null;
}

export interface WellnessListResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface WellnessSingleResponse<T> {
  success: boolean;
  data: T;
}

export const MOOD_EMOJI_MAP: Record<MoodEmoji, string> = {
  VERY_SAD: '😢',
  SAD: '😕',
  NEUTRAL: '😐',
  HAPPY: '🙂',
  VERY_HAPPY: '😄',
  EXCITED: '🤩',
};

export const MOOD_LABELS: Record<MoodEmoji, string> = {
  VERY_SAD: 'WELLNESS.MOOD.VERY_SAD',
  SAD: 'WELLNESS.MOOD.SAD',
  NEUTRAL: 'WELLNESS.MOOD.NEUTRAL',
  HAPPY: 'WELLNESS.MOOD.HAPPY',
  VERY_HAPPY: 'WELLNESS.MOOD.VERY_HAPPY',
  EXCITED: 'WELLNESS.MOOD.EXCITED',
};
