import { DiaryEntry, AppSettings } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  ENTRIES: 'zenjournal_entries',
  SETTINGS: 'zenjournal_settings',
};

// State to track if remote sync is broken (e.g. missing table) to avoid spamming errors
let isRemoteSyncDisabled = false;

// --- Local Storage Helpers ---

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

// --- Supabase Sync Helpers ---

// Mapeia do formato do Supabase (snake_case) para o App (camelCase)
const mapFromSupabase = (data: any[]): Record<string, DiaryEntry> => {
  const entries: Record<string, DiaryEntry> = {};
  data.forEach((row) => {
    entries[row.id] = {
      id: row.id,
      date: row.date,
      content: row.content,
      tags: row.tags || [],
      updatedAt: row.updated_at || Date.now()
    };
  });
  return entries;
};

// Sincroniza dados remotos com dados locais (estratégia: o mais recente vence)
export const fetchAndMergeEntries = async (localEntries: Record<string, DiaryEntry>): Promise<Record<string, DiaryEntry>> => {
  // Guard Clause: If not configured or disabled, skip remote fetch entirely
  if (!isSupabaseConfigured() || isRemoteSyncDisabled) return localEntries;

  try {
    const { data, error } = await supabase.from('entries').select('*');
    
    if (error) {
      // Handle "Table not found" specifically
      if (error.message.includes('Could not find the table') || error.code === '42P01') {
        console.warn('⚠️ SUPABASE SETUP REQUIRED: The table "entries" was not found.');
        isRemoteSyncDisabled = true; 
        return localEntries;
      }
      
      console.error('Supabase fetch error:', error.message || error);
      return localEntries;
    }

    if (!data || data.length === 0) return localEntries;

    const remoteEntries = mapFromSupabase(data);
    const merged = { ...localEntries };

    Object.values(remoteEntries).forEach(remoteEntry => {
      const localEntry = merged[remoteEntry.id];
      // Se não existe local ou se o remoto é mais novo, atualiza
      if (!localEntry || remoteEntry.updatedAt > localEntry.updatedAt) {
        merged[remoteEntry.id] = remoteEntry;
      }
    });

    return merged;
  } catch (err: any) {
    // Only log critical errors if we expected it to work
    if (isSupabaseConfigured()) {
       console.error('Sync failed:', err?.message || err);
    }
    return localEntries;
  }
};

// Salva uma entrada individual no Supabase
export const upsertEntryToSupabase = async (entry: DiaryEntry) => {
  if (!isSupabaseConfigured() || isRemoteSyncDisabled) return;

  try {
    const payload = {
      id: entry.id,
      date: entry.date,
      content: entry.content,
      tags: entry.tags,
      updated_at: entry.updatedAt
    };

    const { error } = await supabase.from('entries').upsert(payload);
    if (error) throw error;
  } catch (err: any) {
    if (!isRemoteSyncDisabled) {
       console.error('Failed to save to Supabase:', err?.message || err);
    }
  }
};

export const deleteEntryFromSupabase = async (id: string) => {
  if (!isSupabaseConfigured() || isRemoteSyncDisabled) return;

  try {
    const { error } = await supabase.from('entries').delete().match({ id });
    if (error) throw error;
  } catch (err: any) {
    if (!isRemoteSyncDisabled) {
      console.error('Failed to delete from Supabase:', err?.message || err);
    }
  }
};