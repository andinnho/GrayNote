import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { Menu, X } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

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
import { supabase } from './utils/supabaseClient';
import { formatDateForStorage, formatDateForDisplay } from './utils/dateUtils';

import { Sidebar } from './components/Sidebar';
import { EditorToolbar } from './components/EditorToolbar';
import { Button } from './components/Button';
import { Auth } from './components/Auth';

const App: React.FC = () => {
  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // App State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Editor State
  const [editorContent, setEditorContent] = useState('');
  const [selectionFontSize, setSelectionFontSize] = useState<number | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const dateKey = formatDateForStorage(currentDate);

  // --- Auth & Init Effect ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setEntries({}); 
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Data Loading Effect ---
  useEffect(() => {
    if (!session) return;

    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Use div for paragraphs to avoid default block margin issues
    document.execCommand('defaultParagraphSeparator', false, 'div');

    const localData = loadEntries();
    setEntries(localData);
    
    fetchAndMergeEntries(localData).then(mergedData => {
      if (JSON.stringify(mergedData) !== JSON.stringify(localData)) {
        setEntries(mergedData);
        saveEntries(mergedData);
        
        const updatedCurrentEntry = mergedData[dateKey];
        if (updatedCurrentEntry) {
          setEditorContent(updatedCurrentEntry.content);
          if (editorRef.current) {
            editorRef.current.innerHTML = updatedCurrentEntry.content;
          }
        }
      }
    });

    const defaultLightColor = '#111827';
    const defaultDarkColor = '#F3F4F6';
    if (settings.darkMode && settings.editorColor === defaultLightColor) {
      setSettings(prev => ({ ...prev, editorColor: defaultDarkColor }));
    }
  }, [session]);

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
      if (editorRef.current) {
        editorRef.current.innerHTML = entry.content;
      }
    } else {
      setEditorContent('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [dateKey, entries]);

  // Save logic
  const handleSave = useCallback(() => {
    setSaving(true);
    const content = editorRef.current?.innerHTML || '';
    
    const newEntry: DiaryEntry = {
      id: dateKey,
      date: dateKey,
      content,
      tags: [],
      updatedAt: Date.now()
    };

    const newEntries = { ...entries, [dateKey]: newEntry };
    setEntries(newEntries);
    saveEntries(newEntries); 
    
    if (session) {
      upsertEntryToSupabase(newEntry).then(() => {
          setSaving(false);
      }).catch(() => {
          setSaving(false);
      });
    } else {
      setSaving(false);
    }
    
  }, [dateKey, entries, session]);

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentStored = entries[dateKey];
      const currentHtml = editorRef.current?.innerHTML || '';
      
      const contentChanged = currentHtml !== (currentStored?.content || '');

      if (editorRef.current && contentChanged) {
        handleSave();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [editorContent, handleSave, dateKey, entries]);

  // --- Font Size & Formatting Logic ---

  const checkSelectionStyle = () => {
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
      setSelectionFontSize(null);
      return;
    }

    const anchorNode = selection.anchorNode;
    
    // Check if inside editor
    if (!editorRef.current.contains(anchorNode)) {
      return;
    }

    if (anchorNode) {
       // Get computed style of current text position
       const element = anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode as HTMLElement;
       
       if (element) {
         const computed = window.getComputedStyle(element);
         const fontSizePx = computed.fontSize;
         const size = Math.round(parseFloat(fontSizePx)); 
         
         if (!isNaN(size)) {
           setSelectionFontSize(size);
         }
       }
    }
  };

  const applyFontSize = (size: number) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;

    if (!selection.isCollapsed) {
      // === SELECTION MODE ===
      // Apply size ONLY to selected text.
      // Do NOT update global editorFontSize.

      // 1. Create a unique marker font-family
      const markerId = `fs-marker-${Date.now()}`;
      
      // 2. Apply marker to selection using native command (handles splitting tags correctly)
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontName', false, markerId);
      document.execCommand('styleWithCSS', false, 'false');

      // 3. Find all elements that got the marker
      // Note: We look for both <font face="..."> and <span style="font-family: ...">
      const markers = editorRef.current.querySelectorAll(`font[face="${markerId}"], span[style*="${markerId}"]`);
      
      markers.forEach(markerEl => {
        // Create the new container
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        
        // Helper to clean styles from children recursively
        // This ensures "Absolute" application by removing nested font sizes
        const cleanElement = (el: HTMLElement) => {
          // Clear font size inline style
          if (el.style) {
             el.style.fontSize = ''; 
             el.style.fontFamily = ''; // Also clear the marker if it stuck
          }
          // Clear font tag size/face
          if (el.tagName === 'FONT') {
             el.removeAttribute('size');
             el.removeAttribute('face');
          }
          
          // Recurse to children
          Array.from(el.childNodes).forEach(child => {
            if (child.nodeType === 1) { // Element
               cleanElement(child as HTMLElement);
            }
          });
        };

        // Move children to new span and clean them
        while (markerEl.firstChild) {
          const child = markerEl.firstChild;
          if (child.nodeType === 1) {
            cleanElement(child as HTMLElement);
          }
          span.appendChild(child);
        }

        // Replace marker
        if (markerEl.parentNode) {
          markerEl.parentNode.replaceChild(span, markerEl);
        }
      });
      
      setSelectionFontSize(size);

    } else {
      // === CURSOR MODE (NO SELECTION) ===
      // Update global setting for FUTURE typing
      updateSetting('editorFontSize', size);
      setSelectionFontSize(size);

      // Insert invisible character with new style to force browser to adopt it
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      span.innerHTML = '&#8203;'; // Zero width space
      
      range.deleteContents(); // Should be empty but safe to call
      range.insertNode(span);
      
      // Move cursor inside the zero-width space
      // We set it after the character so user types "out" of the void but inside the span
      const textNode = span.childNodes[0];
      range.setStart(textNode, 1);
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Force React sync
    setEditorContent(editorRef.current.innerHTML);
    editorRef.current.focus();
  };

  const handleFormat = (command: string, value?: string) => {
    if (command === 'fontSize' && value) {
      applyFontSize(parseInt(value));
    } else {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      checkSelectionStyle();
      setEditorContent(editorRef.current?.innerHTML || '');
    }
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
      saveEntries(rest); 
      if (session) {
        deleteEntryFromSupabase(dateKey); 
      }
      
      setEditorContent('');
      if (editorRef.current) editorRef.current.innerHTML = '';
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEntries({});
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

  const fontClass = {
    'inter': 'font-inter',
    'roboto': 'font-roboto',
    'source': 'font-source',
    'montserrat': 'font-montserrat',
    'serif': 'font-serif',
    'mono': 'font-mono'
  }[settings.editorFont];

  // --- RENDER ---

  if (loadingSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-bgMain">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

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
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full h-full bg-bgSurface transition-colors">
        
        {/* Toolbar */}
        <EditorToolbar 
          settings={settings}
          selectionFontSize={selectionFontSize}
          onSettingChange={updateSetting}
          onFormat={handleFormat}
          onSave={handleSave}
          onExport={handleExport}
          onDelete={handleDelete}
          saving={saving}
        />

        {/* Date Header */}
        <div className="px-8 py-6 pb-4">
           <h2 className="text-3xl font-bold text-textMain font-serif capitalize">
             {formatDateForDisplay(dateKey)}
           </h2>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-20 custom-scrollbar" onClick={() => editorRef.current?.focus()}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className={`
              w-full min-h-[60vh] outline-none max-w-4xl text-left editor-content
              ${fontClass}
            `}
            // Removed global fontSize to allow inline styles to win
            style={{ 
              color: settings.editorColor,
              lineHeight: '1.6'
            }}
            onInput={(e) => {
              setEditorContent(e.currentTarget.innerHTML);
              checkSelectionStyle();
            }}
            onMouseUp={checkSelectionStyle}
            onKeyUp={checkSelectionStyle}
            onClick={checkSelectionStyle}
            onBlur={checkSelectionStyle}
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