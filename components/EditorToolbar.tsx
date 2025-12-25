import React from 'react';
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
  Sun
} from 'lucide-react';
import { Button } from './Button';
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

  return (
    <div className="sticky top-0 z-20 flex flex-col gap-2 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-borderSoft transition-colors">
      
      {/* Top Row: Main Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button 
            variant="primary" 
            label={saving ? "Saving..." : "Save"} 
            icon={<Save />} 
            onClick={onSave}
            disabled={saving}
          />
          <Button 
            variant="secondary" 
            icon={<Download />} 
            onClick={onExport} 
            tooltip="Export Entry as TXT" 
          />
          <Button 
            variant="ghost" 
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
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

      {/* Bottom Row: Formatting & Typography */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-borderSoft overflow-x-auto pb-1">
        
        {/* Font Family */}
        <div className="flex items-center gap-2 min-w-fit">
          <Type className="w-4 h-4 text-textSecondary" />
          <select 
            value={settings.editorFont}
            onChange={(e) => onSettingChange('editorFont', e.target.value)}
            className="h-9 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 text-textMain focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {fontOptions.map(font => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

        {/* Font Size */}
        <div className="flex items-center gap-2 min-w-fit">
          <span className="text-xs text-textSecondary font-mono w-4">{settings.editorFontSize}</span>
          <input 
            type="range" 
            min="10" 
            max="74" 
            value={settings.editorFontSize}
            onChange={(e) => onSettingChange('editorFontSize', Number(e.target.value))}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
          />
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

        {/* Color Picker */}
        <div className="flex items-center gap-2 relative group min-w-fit">
          <label htmlFor="color-picker" className="cursor-pointer flex items-center gap-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <div 
              className="w-5 h-5 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: settings.editorColor }}
            />
            <span className="text-xs text-textSecondary">Color</span>
          </label>
          <input 
            id="color-picker"
            type="color" 
            value={settings.editorColor}
            onChange={(e) => onSettingChange('editorColor', e.target.value)}
            className="absolute opacity-0 w-8 h-8 pointer-events-none"
          />
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

        {/* Basic Formatting */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            icon={<Bold />} 
            onClick={() => onFormat('bold')} 
            className="px-2"
            tooltip="Bold"
          />
          <Button 
            variant="ghost" 
            icon={<Italic />} 
            onClick={() => onFormat('italic')} 
            className="px-2"
            tooltip="Italic"
          />
          <Button 
            variant="ghost" 
            icon={<Underline />} 
            onClick={() => onFormat('underline')} 
            className="px-2"
            tooltip="Underline"
          />
        </div>

        {/* Highlighting */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
           <Highlighter className="w-4 h-4 text-textSecondary ml-2 mr-1" />
           {highlightColors.map((c) => (
             <button
               key={c.value}
               className={`w-5 h-5 rounded-full ${c.bg} hover:scale-110 transition-transform border border-black/10`}
               onClick={() => onFormat('hiliteColor', c.value)}
               title={`Highlight ${c.label}`}
             />
           ))}
        </div>

      </div>
    </div>
  );
};