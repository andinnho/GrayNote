import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Search, Hash, Calendar as CalendarIcon } from 'lucide-react';
import { DiaryEntry } from '../types';

interface SidebarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  entries: Record<string, DiaryEntry>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentDate,
  onDateSelect,
  entries,
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  isOpen,
  onCloseMobile
}) => {
  const [viewDate, setViewDate] = React.useState(new Date());

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(viewDate),
      end: endOfMonth(viewDate)
    });
  }, [viewDate]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    Object.values(entries).forEach(entry => {
      entry.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [entries]);

  // Calendar render helper
  const hasEntry = (date: Date) => {
    return !!entries[format(date, 'yyyy-MM-dd')];
  };

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-bgMain dark:bg-gray-900 border-r border-borderSoft transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col
      `}
    >
      {/* Search Area */}
      <div className="p-4 border-b border-borderSoft flex flex-col gap-4">
        <div className="flex justify-center py-2">
            <img 
              src="/logo.png" 
              alt="GrayNote" 
              className="h-32 w-auto object-contain transition-all duration-300 dark:filter dark:invert dark:hue-rotate-180"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                // Show fallback text if image fails
                const fallback = document.getElementById('logo-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <h1 id="logo-fallback" className="text-xl font-bold text-primary flex items-center gap-2 hidden">
              <CalendarIcon className="w-6 h-6" />
              GrayNote
            </h1>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-textSecondary" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Calendar Widget */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-textMain capitalize">
              {format(viewDate, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button 
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <span key={`${d}-${i}`} className="text-textSecondary font-medium">{d}</span>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty cells for start offset could be added here if we want exact day alignment, strictly not required for MVP but nicer */}
            {Array(startOfMonth(viewDate).getDay()).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            
            {daysInMonth.map(date => {
              const isSelected = isSameDay(date, currentDate);
              const isToday = isSameDay(date, new Date());
              const entryExists = hasEntry(date);

              return (
                <button
                  key={date.toString()}
                  onClick={() => {
                    onDateSelect(date);
                    if (window.innerWidth < 768) onCloseMobile();
                  }}
                  className={`
                    h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all
                    ${isSelected ? 'bg-primary text-white font-bold shadow-md' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
                    ${!isSelected && isToday ? 'text-primary font-bold border border-primary' : ''}
                    ${!isSelected && !isToday ? 'text-textMain' : ''}
                  `}
                >
                  <div className="relative">
                    {format(date, 'd')}
                    {entryExists && !isSelected && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tag List */}
        <div className="p-4 border-t border-borderSoft">
          <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTagSelect(null)}
              className={`text-xs px-2 py-1 rounded-md border ${
                selectedTag === null 
                  ? 'bg-secondary text-white border-secondary' 
                  : 'bg-white dark:bg-gray-800 text-textSecondary border-gray-200 dark:border-gray-700'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagSelect(tag)}
                className={`text-xs px-2 py-1 rounded-md border flex items-center gap-1 transition-colors ${
                  selectedTag === tag 
                    ? 'bg-accent text-white border-accent' 
                    : 'bg-white dark:bg-gray-800 text-textMain border-gray-200 dark:border-gray-700 hover:border-accent'
                }`}
              >
                <Hash className="w-3 h-3" />
                {tag}
              </button>
            ))}
            {allTags.length === 0 && (
              <p className="text-xs text-textSecondary italic">No tags used yet.</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};