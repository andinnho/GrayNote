import { DiaryEntry, AppSettings } from '../types';

const STORAGE_KEYS = {
  ENTRIES: 'zenjournal_entries',
  SETTINGS: 'zenjournal_settings',
};

export const saveEntries = (entries: Record<string, DiaryEntry>) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save entries', error);
  }
};

export const loadEntries = (): Record<string, DiaryEntry> => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load entries', error);
    return {};
  }
};

export const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings', error);
  }
};

export const loadSettings = (): AppSettings => {
  const defaults: AppSettings = {
    darkMode: false,
    editorFont: 'inter',
    editorFontSize: 16,
    editorColor: '#111827',
    sidebarOpen: true,
  };
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  } catch (error) {
    return defaults;
  }
};