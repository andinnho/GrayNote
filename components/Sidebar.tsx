import React, { useMemo } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Search, X, LogOut } from 'lucide-react';
import { DiaryEntry } from '../types';
import { Logo } from './Logo';

interface SidebarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  entries: Record<string, DiaryEntry>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentDate,
  onDateSelect,
  entries,
  searchQuery,
  onSearchChange,
  isOpen,
  onCloseMobile,
  onLogout
}) => {
  const [viewDate, setViewDate] = React.useState(new Date());

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(viewDate),
      end: endOfMonth(viewDate)
    });
  }, [viewDate]);

  // Search Logic
  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return Object.values(entries)
      .filter((entry) => {
        const entryData = entry as DiaryEntry;
        const dateObj = parseISO(entryData.date);
        const formattedDate = format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }).toLowerCase();
        const plainText = (entryData.content || '').replace(/<[^>]*>/g, ' ').toLowerCase();
        
        // Match content, raw date (2023-10-25), formatted date (25 de outubro)
        return (
          plainText.includes(query) ||
          entryData.date.includes(query) ||
          formattedDate.includes(query)
        );
      })
      .sort((a, b) => (b as DiaryEntry).date.localeCompare((a as DiaryEntry).date)); // Newest first
  }, [entries, searchQuery]);

  // Calendar render helper
  const hasEntry = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = entries[dateStr];
    return !!entry;
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
        <div className="flex items-center justify-center gap-3 py-2">
            <Logo className="w-10 h-10 text-primary" />
            <h1 className="text-xl font-bold text-primary font-serif tracking-tight">
              GrayNote
            </h1>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-textSecondary" />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-2 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-textSecondary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {searchQuery.trim() ? (
          /* Search Results View */
          <div className="p-4 space-y-3">
             <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
               Search Results ({filteredEntries.length})
             </div>
             {filteredEntries.length > 0 ? (
               filteredEntries.map(entry => {
                  const entryData = entry as DiaryEntry;
                  const dateObj = parseISO(entryData.date);
                  return (
                    <button
                      key={entryData.id}
                      onClick={() => {
                        onDateSelect(dateObj);
                        if (window.innerWidth < 768) onCloseMobile();
                      }}
                      className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-800 border border-borderSoft hover:border-primary hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-textMain text-sm capitalize">
                          {format(dateObj, "d MMM", { locale: ptBR })}
                        </span>
                        <span className="text-xs text-textSecondary">
                           {format(dateObj, "yyyy")}
                        </span>
                      </div>
                      <div className="text-xs text-textSecondary line-clamp-2 h-8 leading-4">
                        {(entryData.content || '').replace(/<[^>]*>/g, ' ')}
                      </div>
                    </button>
                  );
               })
             ) : (
                <div className="text-center py-10 text-textSecondary flex flex-col items-center">
                   <Search className="w-8 h-8 mb-2 opacity-20" />
                   <p className="text-sm">No matches found</p>
                </div>
             )}
          </div>
        ) : (
          /* Calendar View */
          <>
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
                        h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all relative
                        ${isSelected ? 'bg-primary text-white font-bold shadow-md' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
                        ${!isSelected && isToday ? 'text-primary font-bold border border-primary' : ''}
                        ${!isSelected && !isToday ? 'text-textMain' : ''}
                      `}
                    >
                      <span>{format(date, 'd')}</span>
                      {entryExists && !isSelected && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {onLogout && (
        <div className="p-4 border-t border-borderSoft">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
};