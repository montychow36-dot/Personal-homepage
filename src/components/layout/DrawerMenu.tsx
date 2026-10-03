import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { ExhibitData } from '../../types';


export const DrawerMenu: React.FC = () => {
  const { isMapOpen, toggleMap, language, navigateToRoom, setExhibitModal } = useAppStore();
  const [exhibits, setExhibits] = useState<ExhibitData[]>([]);

  // Track expanded state of sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'works': true,
    'leather-1': false,
    'leather-2': false,
    'others': false,
  });

  useEffect(() => {
    let isMounted = true;
    fetch('/api/notion/crafts')
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.data && Array.isArray(json.data) && json.data.length > 0) {
          const formatted: ExhibitData[] = json.data.map((item: any) => ({
            id: item.id || `notion-${Math.random()}`,
            title: { zh: item.title, en: item.title, ja: item.title },
            category: { zh: item.category, en: item.category, ja: item.category },
            date: item.date || '2024',
            description: { zh: item.description, en: item.description, ja: item.description },
            imageUrl: item.imageUrl,
            images: item.images || [],
            tags: item.tags || ['皮革'],
          }));
          setExhibits(formatted);
        }
      })
      .catch((err) => {
        console.warn('Notion sync in drawer fallback', err);
      });
      
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigate = (roomId: string) => {
    navigateToRoom(roomId as any);
    toggleMap(false);
  };

  const handleOpenExhibit = (item: ExhibitData) => {
    // Navigate to the correct room based on category
    const cat = typeof item.category === 'string' ? item.category : item.category.zh;
    const catLower = cat.toLowerCase();
    
    if (catLower.includes('相片') || catLower.includes('photo') || catLower.includes('文章') || catLower.includes('article')) {
      navigateToRoom('articles' as any);
    } else if (cat.includes('2')) {
      navigateToRoom('leather2' as any); 
    } else if (cat.includes('其') || catLower.includes('other')) {
      navigateToRoom('others' as any);
    } else {
      navigateToRoom('leather1');
    }
    
    // Open the modal
    setExhibitModal(item);
    toggleMap(false);
  };

  const leather1Items = exhibits.filter((item) => {
    const cat = typeof item.category === 'string' ? item.category : item.category.zh;
    const catLower = cat.toLowerCase();
    // 排除相片、文章等不屬於 Leather 1 的分類
    if (catLower.includes('相片') || catLower.includes('photo') || catLower.includes('文章') || catLower.includes('article') || catLower.includes('2') || catLower.includes('其') || catLower.includes('other')) {
      return false;
    }
    // 如果包含 '1' 或未被上述排除，則歸入 Leather 1
    return cat.includes('1') || true; 
  });

  const leather2Items = exhibits.filter((item) => {
    const cat = typeof item.category === 'string' ? item.category : item.category.zh;
    return cat.includes('2');
  });

  const otherItems = exhibits.filter((item) => {
    const cat = typeof item.category === 'string' ? item.category : item.category.zh;
    return cat.includes('其') || cat.toLowerCase().includes('other');
  });

  return (
    <AnimatePresence>
      {isMapOpen && (
        <>
          {/* 中度透明的背景遮罩 (Medium transparent overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleMap(false)}
            className="fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-[2px] pointer-events-auto"
          />

          {/* 側邊欄 Drawer (Pagefinder Shape) */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[320px] max-w-[85vw] z-50 pointer-events-none drop-shadow-2xl"
          >
            {/* 主體卡片 (Main Divider Card) */}
            <div className="relative w-full h-full bg-[#e4e1d9]/70 backdrop-blur-xl border-r border-zinc-400 rounded-tr-[4rem] rounded-br-2xl pointer-events-auto flex overflow-hidden shadow-inner">
              
              {/* Scrollable Inner Content */}
              <div className="flex-1 h-full overflow-y-auto">
                {/* 頂部標題 */}
                <div className="p-6 border-b border-zinc-800/20 flex justify-between items-center bg-zinc-800/5">
                  <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-wider">目錄 (Contents)</h2>
                  <button 
                    onClick={() => toggleMap(false)}
                    className="text-zinc-500 hover:text-zinc-900 p-1 font-mono text-sm"
                  >
                    ✕ 關閉
                  </button>
                </div>

                {/* 目錄內容 (4 Main Subjects with expandable nested choices) */}
                <div className="flex-1 p-6 space-y-6 font-serif">
              
              {/* 首頁 (Main Hall) */}
              <div 
                className="cursor-pointer group flex items-center justify-between pb-2 border-b border-dashed border-zinc-800/20"
                onClick={() => handleNavigate('home')}
              >
                <span className="text-lg font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                  回首頁 (Main Hall)
                </span>
                <span className="text-zinc-400 text-xs font-mono">⏎</span>
              </div>

              
              {/* 1. 皮革部區域 1 (Leather 1) */}
              <div>
                <div 
                  className="cursor-pointer group flex items-center justify-between py-2 border-b border-zinc-800/20"
                  onClick={() => {
                    toggleSection('leather-1');
                    navigateToRoom('leather1');
                  }}
                >
                  <span className="text-xl font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    皮革部區域 1 (Leather 1)
                  </span>
                  <span className="text-zinc-500 font-mono text-sm">
                    {expandedSections['leather-1'] ? '−' : '＋'}
                  </span>
                </div>
                <AnimatePresence>
                  {expandedSections['leather-1'] && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="pl-4 pt-3 space-y-3 text-zinc-700">
                        {leather1Items.length > 0 ? (
                          leather1Items.map((item) => (
                            <li 
                              key={item.id}
                              className="flex items-center space-x-2 cursor-pointer hover:text-zinc-950 transition-colors"
                              onClick={() => handleOpenExhibit(item)}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                              <span className="underline decoration-dotted underline-offset-2">
                                {typeof item.title === 'string' ? item.title : item.title[language] || item.title.zh}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="text-zinc-400 italic text-sm">尚無紀錄 (No records)</li>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. 皮革部區域 2 (Leather 2) */}
              <div>
                <div 
                  className="cursor-pointer group flex items-center justify-between py-2 border-b border-zinc-800/20"
                  onClick={() => {
                    toggleSection('leather-2');
                    navigateToRoom('leather2' as any);
                  }}
                >
                  <span className="text-xl font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    皮革部區域 2 (Leather 2)
                  </span>
                  <span className="text-zinc-500 font-mono text-sm">
                    {expandedSections['leather-2'] ? '−' : '＋'}
                  </span>
                </div>
                <AnimatePresence>
                  {expandedSections['leather-2'] && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="pl-4 pt-3 space-y-3 text-zinc-700">
                        {leather2Items.length > 0 ? (
                          leather2Items.map((item) => (
                            <li 
                              key={item.id}
                              className="flex items-center space-x-2 cursor-pointer hover:text-zinc-950 transition-colors"
                              onClick={() => handleOpenExhibit(item)}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                              <span className="underline decoration-dotted underline-offset-2">
                                {typeof item.title === 'string' ? item.title : item.title[language] || item.title.zh}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="text-zinc-400 italic text-sm">尚無紀錄 (No records)</li>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. 其他 (Others) */}
              <div>
                <div 
                  className="cursor-pointer group flex items-center justify-between py-2 border-b border-zinc-800/20"
                  onClick={() => {
                    toggleSection('others');
                    navigateToRoom('others' as any);
                  }}
                >
                  <span className="text-xl font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    其他 (Others)
                  </span>
                  <span className="text-zinc-500 font-mono text-sm">
                    {expandedSections['others'] ? '−' : '＋'}
                  </span>
                </div>
                <AnimatePresence>
                  {expandedSections['others'] && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="pl-4 pt-3 space-y-3 text-zinc-700">
                        {otherItems.length > 0 ? (
                          otherItems.map((item) => (
                            <li 
                              key={item.id}
                              className="flex items-center space-x-2 cursor-pointer hover:text-zinc-950 transition-colors"
                              onClick={() => handleOpenExhibit(item)}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                              <span className="underline decoration-dotted underline-offset-2">
                                {typeof item.title === 'string' ? item.title : item.title[language] || item.title.zh}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="text-zinc-400 italic text-sm">尚無紀錄 (No records)</li>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. 文章與相片 (Articles) */}
              <div>
                <div 
                  className="cursor-pointer group flex items-center justify-between py-2 border-b border-zinc-800/20"
                  onClick={() => handleNavigate('articles')}
                >
                  <span className="text-xl font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    文章與相片 (Articles & Photos)
                  </span>
                  <span className="text-zinc-400 text-xs font-mono">➔</span>
                </div>
              </div>

              {/* 關於 (About) - Optional but good to keep */}
              <div>
                <div 
                  className="cursor-pointer group flex items-center justify-between py-2 border-b border-zinc-800/20"
                  onClick={() => handleNavigate('about')}
                >
                  <span className="text-xl font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    關於 (About)
                  </span>
                  <span className="text-zinc-400 text-xs font-mono">➔</span>
                </div>
              </div>
            </div>
            {/* 底部裝飾 */}
            <div className="p-6 text-center text-zinc-400 text-xs font-mono border-t border-zinc-800/10 bg-zinc-800/5">
              HANDBOOK INDEX • {new Date().getFullYear()}
            </div>
            
              </div>

              {/* 右側邊緣的間尺 (Ruler on the right edge) */}
              <div className="w-8 md:w-10 border-l border-zinc-400/50 flex flex-col pt-24 pb-12 justify-between items-end pr-1 opacity-90 font-mono text-[10px] md:text-xs font-bold text-zinc-800 shrink-0 select-none bg-black/5">
                {[...Array(41)].map((_, i) => {
                  const isMajor = i % 5 === 0;
                  return (
                    <div key={i} className={`flex items-center justify-end w-full`}>
                      {isMajor && <span className="mr-1.5 leading-none">{i / 5}</span>}
                      <div className={`bg-zinc-800 ${isMajor ? 'h-[2px] w-3 md:w-4' : 'h-[1.5px] w-1.5 md:w-2'}`} />
                    </div>
                  );
                })}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
