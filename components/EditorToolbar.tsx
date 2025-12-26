import React, { useState } from 'react';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  Highlighter, 
  Trash2, 
  Save, 
  Download,
  Moon,
  Sun,
  Smile
} from 'lucide-react';
import { Button } from './Button';
import { EmojiPicker } from './EmojiPicker';
import { AppSettings, FontFamily } from '../types';

interface EditorToolbarProps {
  settings: AppSettings;
  onSettingChange: (key: keyof AppSettings, value: any) => void;
  onFormat: (command: string, value?: string) => void;
  onSave: () => void;
  onExport: () => void;
  onDelete: () => void;
  saving: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  settings,
  onSettingChange,
  onFormat,
  onSave,
  onExport,
  onDelete,
  saving
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const fontOptions: { value: FontFamily; label: string }[] = [
    { value: 'inter', label: 'Inter' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'source', label: 'Source Sans 3' },
    { value: 'montserrat', label: 'Montserrat' },
    { value: 'serif', label: 'Serif' },
    { value: 'mono', label: 'Monospace' },
  ];

  const highlightColors = [
    { value: '#FEF3C7', label: 'Yellow', bg: 'bg-yellow-100' },
    { value: '#D1FAE5', label: 'Green', bg: 'bg-green-100' },
    { value: '#DBEAFE', label: 'Blue', bg: 'bg-blue-100' },
    { value: '#FCE7F3', label: 'Pink', bg: 'bg-pink-100' },
  ];

  const handleEmojiSelect = (emoji: string) => {
    onFormat('insertText', emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="sticky top-0 z-20 flex flex-col gap-3 px-6 py-4 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all">
      
      {/* Top Row: Main Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button 
            variant="primary" 
            label={saving ? "Saving..." : "Save"} 
            icon={<Save />} 
            onClick={onSave}
            disabled={saving}
            className="shadow-sm"
          />
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />
          <Button 
            variant="secondary" 
            icon={<Download />} 
            onClick={onExport} 
            tooltip="Export Entry as TXT" 
          />
          <Button 
            variant="ghost" 
            className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            icon={<Trash2 />} 
            onClick={onDelete} 
            tooltip="Clear Entry" 
          />
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            icon={settings.darkMode ? <Sun /> : <Moon />} 
            onClick={() => onSettingChange('darkMode', !settings.darkMode)}
            tooltip="Toggle Theme"
          />
        </div>
      </div>

      {/* Bottom Row: Formatting Tools (Grouped in a visual container) */}
      <div className="flex flex-wrap items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative">
        
        {/* Font Family */}
        <div className="flex items-center gap-2 min-w-fit px-2">
          <Type className="w-4 h-4 text-textSecondary" />
          <select 
            value={settings.editorFont}
            onChange={(e) => onSettingChange('editorFont', e.target.value)}
            className="h-8 rounded-md border-none bg-transparent text-sm text-textMain focus:ring-0 focus:outline-none font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 transition-colors"
          >
            {fontOptions.map(font => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600" />

        {/* Font Size */}
        <div className="flex items-center gap-2 min-w-fit px-2">
          <span className="text-xs text-textSecondary font-mono w-4">{settings.editorFontSize}</span>
          <input 
            type="range" 
            min="12" 
            max="48" 
            value={settings.editorFontSize}
            onChange={(e) => onSettingChange('editorFontSize', Number(e.target.value))}
            className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-primary"
          />
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600" />

        {/* Color Picker */}
        <div className="flex items-center gap-2 relative group min-w-fit px-1">
          <label htmlFor="color-picker" className="cursor-pointer flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            <div 
              className="w-4 h-4 rounded-full border border-gray-300 shadow-sm ring-1 ring-white dark:ring-gray-700"
              style={{ backgroundColor: settings.editorColor }}
            />
            <span className="text-xs text-textSecondary font-medium">Color</span>
          </label>
          <input 
            id="color-picker"
            type="color" 
            value={settings.editorColor}
            onChange={(e) => onSettingChange('editorColor', e.target.value)}
            className="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0"
          />
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600" />

        {/* Basic Formatting */}
        <div className="flex items-center gap-0.5">
          <Button 
            variant="ghost" 
            icon={<Bold className="w-4 h-4" />} 
            onClick={() => onFormat('bold')} 
            className="h-8 w-8 px-0"
            tooltip="Bold"
          />
          <Button 
            variant="ghost" 
            icon={<Italic className="w-4 h-4" />} 
            onClick={() => onFormat('italic')} 
            className="h-8 w-8 px-0"
            tooltip="Italic"
          />
          <Button 
            variant="ghost" 
            icon={<Underline className="w-4 h-4" />} 
            onClick={() => onFormat('underline')} 
            className="h-8 w-8 px-0"
            tooltip="Underline"
          />
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600" />

        {/* Highlighting */}
        <div className="flex items-center gap-1.5 px-2">
           <Highlighter className="w-3.5 h-3.5 text-textSecondary mr-1" />
           {highlightColors.map((c) => (
             <button
               key={c.value}
               className={`w-4 h-4 rounded-full ${c.bg} hover:scale-125 transition-transform border border-black/5 ring-1 ring-transparent hover:ring-gray-300`}
               onClick={() => onFormat('hiliteColor', c.value)}
               title={`Highlight ${c.label}`}
             />
           ))}
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600" />

        {/* Emoji Picker Trigger */}
        <div className="relative">
          <Button 
            variant={showEmojiPicker ? "secondary" : "ghost"}
            icon={<Smile className="w-4 h-4 text-yellow-500" />} 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            className="h-8 w-8 px-0"
            tooltip="Insert Emoji"
          />
          {showEmojiPicker && (
            <EmojiPicker 
              onSelect={handleEmojiSelect} 
              onClose={() => setShowEmojiPicker(false)} 
            />
          )}
        </div>

      </div>
    </div>
  );
};