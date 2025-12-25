import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { Menu, X } from 'lucide-react';

import { DiaryEntry, AppSettings } from './types';
import { 
  loadEntries, 
  saveEntries, 
  loadSettings, 
  saveSettings, 
  fetchAndMergeEntries, 
  upsertEntryToSupabase,
  deleteEntryFromSupabase 
} from './utils/storage';
import { formatDateForStorage, formatDateForDisplay } from './utils/dateUtils';

import { Sidebar } from './components/Sidebar';
import { EditorToolbar } from './components/EditorToolbar';
import { Button } from './components/Button';

const App: React.FC = () => {
  // State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Editor State (Local to the day)
  const [editorContent, setEditorContent] = useState('');
  const [editorTags, setEditorTags] = useState<string[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const dateKey = formatDateForStorage(currentDate);

  // Initialize
  useEffect(() => {
    // 1. Load Local first for instant UI
    const localData = loadEntries();
    setEntries(localData);
    
    // 2. Fetch Remote and Merge
    fetchAndMergeEntries(localData).then(mergedData => {
      // Only update if there are changes to avoid unnecessary re-renders or loops
      if (JSON.stringify(mergedData) !== JSON.stringify(localData)) {
        setEntries(mergedData);
        saveEntries(mergedData); // Update local cache
        
        // Refresh editor content if the current day was updated
        const updatedCurrentEntry = mergedData[dateKey];
        if (updatedCurrentEntry) {
          setEditorContent(updatedCurrentEntry.content);
          setEditorTags(updatedCurrentEntry.tags);
          if (editorRef.current) {
            editorRef.current.innerHTML = updatedCurrentEntry.content;
          }
        }
      }
    });
    
    // Apply theme on load
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Auto-fix contrast
    const defaultLightColor = '#111827';
    const defaultDarkColor = '#F3F4F6';
    if (settings.darkMode && settings.editorColor === defaultLightColor) {
      setSettings(prev => ({ ...prev, editorColor: defaultDarkColor }));
    }
  }, []);

  // Update theme when settings change
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveSettings(settings);
  }, [settings]);

  // Load entry into editor when date changes
  useEffect(() => {
    const entry = entries[dateKey];
    if (entry) {
      setEditorContent(entry.content);
      setEditorTags(entry.tags || []);
      if (editorRef.current) {
        editorRef.current.innerHTML = entry.content;
      }
    } else {
      setEditorContent('');
      setEditorTags([]);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [dateKey, entries]);

  // Save logic
  const handleSave = useCallback(() => {
    setSaving(true);
    // Sanitize content
    const content = editorRef.current?.innerHTML || '';
    
    const newEntry: DiaryEntry = {
      id: dateKey,
      date: dateKey,
      content,
      tags: editorTags,
      updatedAt: Date.now()
    };

    const newEntries = { ...entries, [dateKey]: newEntry };
    setEntries(newEntries);
    saveEntries(newEntries); // Local Save
    
    // Remote Save (Fire and forget, but handle error in console)
    upsertEntryToSupabase(newEntry).then(() => {
        setSaving(false);
    }).catch(() => {
        setSaving(false);
    });
    
  }, [dateKey, entries, editorTags]);

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if content actually changed to avoid spamming DB
      const currentStored = entries[dateKey];
      const currentHtml = editorRef.current?.innerHTML || '';
      
      const contentChanged = currentHtml !== (currentStored?.content || '');
      const tagsChanged = JSON.stringify(editorTags) !== JSON.stringify(currentStored?.tags || []);

      if (editorRef.current && (contentChanged || tagsChanged)) {
        handleSave();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [editorContent, editorTags, handleSave, dateKey, entries]);

  // Editor Handlers
  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setEditorContent(editorRef.current?.innerHTML || '');
  };

  const handleExport = () => {
    const text = editorRef.current?.innerText || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary-${dateKey}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to clear this entry?')) {
      const { [dateKey]: deleted, ...rest } = entries;
      setEntries(rest);
      saveEntries(rest); // Local delete
      deleteEntryFromSupabase(dateKey); // Remote delete
      
      setEditorContent('');
      setEditorTags([]);
      if (editorRef.current) editorRef.current.innerHTML = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = editorTags.filter(t => t !== tagToRemove);
    setEditorTags(newTags);
    // Logic inside handleSave will pick up the tag change via useEffect or manual save
    // But forcing a save immediately is safer for UI consistency
    const newEntry = {
      ...entries[dateKey],
      id: dateKey,
      date: dateKey,
      content: editorContent,
      tags: newTags,
      updatedAt: Date.now()
    };
    const newEntries = { ...entries, [dateKey]: newEntry };
    setEntries(newEntries);
    saveEntries(newEntries);
    upsertEntryToSupabase(newEntry);
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      if (key === 'darkMode') {
        const isDark = value;
        const defaultLightColor = '#111827';
        const defaultDarkColor = '#F3F4F6';
        
        if (isDark && prev.editorColor === defaultLightColor) {
           newSettings.editorColor = defaultDarkColor;
        } else if (!isDark && prev.editorColor === defaultDarkColor) {
           newSettings.editorColor = defaultLightColor;
        }
      }
      return newSettings;
    });
  };

  // Font Classes mapping
  const fontClass = {
    'inter': 'font-inter',
    'roboto': 'font-roboto',
    'source': 'font-source',
    'montserrat': 'font-montserrat',
    'serif': 'font-serif',
    'mono': 'font-mono'
  }[settings.editorFont];

  return (
    <div className="flex h-screen bg-bgMain overflow-hidden">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden fixed z-40 bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <Sidebar 
        currentDate={currentDate}
        onDateSelect={setCurrentDate}
        entries={entries}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full h-full bg-bgSurface transition-colors">
        
        {/* Toolbar */}
        <EditorToolbar 
          settings={settings}
          onSettingChange={updateSetting}
          onFormat={handleFormat}
          onSave={handleSave}
          onExport={handleExport}
          onDelete={handleDelete}
          saving={saving}
        />

        {/* Date Header */}
        <div className="px-8 py-6 pb-2">
           <h2 className="text-3xl font-bold text-textMain font-serif capitalize">
             {formatDateForDisplay(dateKey)}
           </h2>
        </div>

        {/* Tags Input Area */}
        <div className="px-8 py-2 flex flex-wrap items-center gap-2 mb-4">
          {editorTags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-textSecondary rounded text-sm group">
              #{tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500 hidden group-hover:inline ml-1">&times;</button>
            </span>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-20 custom-scrollbar" onClick={() => editorRef.current?.focus()}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className={`
              w-full min-h-[60vh] outline-none max-w-4xl mx-auto editor-content
              ${fontClass}
            `}
            style={{ 
              fontSize: `${settings.editorFontSize}px`,
              color: settings.editorColor,
              lineHeight: '1.6'
            }}
            onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
          />
        </div>

        {/* Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur text-xs text-textSecondary py-1 px-4 border-t border-borderSoft flex justify-between">
           <span>Words: {editorContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length}</span>
           <span>{saving ? 'Syncing...' : 'All changes saved'}</span>
        </div>
      </main>
    </div>
  );
};

export default App;