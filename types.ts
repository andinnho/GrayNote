export interface DiaryEntry {
  id: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  content: string; // HTML content
  tags: string[];
  updatedAt: number;
}

export type FontFamily = 'inter' | 'roboto' | 'source' | 'montserrat' | 'serif' | 'mono';

export interface AppSettings {
  darkMode: boolean;
  editorFont: FontFamily;
  editorFontSize: number; // px
  editorColor: string;
  sidebarOpen: boolean;
}

export interface SearchFilters {
  query: string;
  tag: string | null;
}