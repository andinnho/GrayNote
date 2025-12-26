import React, { useEffect, useRef, useState } from 'react';
import { Smile, Heart, Coffee,  Zap, Flag, Activity,  User, Globe } from 'lucide-react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const CATEGORIES = [
  {
    id: 'emotions',
    name: 'Emotions',
    icon: <Smile className="w-4 h-4" />,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '😊', 
      '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', 
      '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', 
      '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', 'worried', '😕', 
      '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', 
      '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', 'dS', 
      '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', 
      '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', 
      '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑'
    ]
  },
  {
    id: 'people',
    name: 'People',
    icon: <User className="w-4 h-4" />,
    emojis: [
      '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', 
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', 
      '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', 
      '🙏', '💪', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁', '👅', 
      '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩',
      '🙅', '🙆', '💁', '🙋', '🙇', '🤦', '🤷'
    ]
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: <Globe className="w-4 h-4" />,
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', 
      '🦁', 'cow', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', 
      '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', 
      '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', 
      '🐙', '🦑', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋',
      '💐', '🌸', '💮', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', 
      '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂'
    ]
  },
  {
    id: 'food',
    name: 'Food',
    icon: <Coffee className="w-4 h-4" />,
    emojis: [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', 
      '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', 
      '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', 
      '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', 
      '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', 
      '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🍲',
      '☕', '🍵', '🧉', '🥛', '🍺', '🍻', '🍷', '🥂', '🥃', '🍸'
    ]
  },
  {
    id: 'activity',
    name: 'Activity',
    icon: <Activity className="w-4 h-4" />,
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', 
      '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', 
      '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸', 
      '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', 
      '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', 
      '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🎗', '🎫', '🎟'
    ]
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: <Zap className="w-4 h-4" />,
    emojis: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', 
      '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', 
      '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', 
      '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', 
      '💡', '🔦', '🕯', '🪔', '💸', '💵', '💴', '💶', '💷', '🪙', 
      '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', 
      '🛠', '⛏', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫'
    ]
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: <Heart className="w-4 h-4" />,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', 
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', 
      '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', 
      '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', 
      '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', 
      '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', 
      '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', 
      '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️'
    ]
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('emotions');
  const pickerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle keyboard (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const element = document.getElementById(`emoji-cat-${catId}`);
    if (element && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: element.offsetTop - scrollRef.current.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      ref={pickerRef}
      className="absolute top-full left-0 mt-2 z-50 w-80 max-w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{ height: '320px' }}
    >
      {/* Header/Categories - WhatsApp style bottom nav moved to top for better desktop ux here, or we can keep bottom */}
      <div className="flex items-center justify-between px-2 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => scrollToCategory(cat.id)}
            className={`p-2 rounded-lg transition-colors ${
              activeCategory === cat.id 
                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title={cat.name}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Scrollable Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-3"
      >
        {CATEGORIES.map((cat) => (
          <div key={cat.id} id={`emoji-cat-${cat.id}`} className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm py-1 z-10">
              {cat.name}
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {cat.emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};