import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ExhibitData } from '../types';
import { fetchCraftsData } from '../services/craftsData';

export const WorksScene: React.FC = () => {
  const { navigateToRoom, setExhibitModal, language } = useAppStore();
  const [exhibits, setExhibits] = useState<ExhibitData[]>([]);
  const [isFromNotion, setIsFromNotion] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchCraftsData()
      .then((data) => {
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          const formatted: ExhibitData[] = data.map((item: any) => ({
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
          setIsFromNotion(true);
        } else {
          setExhibits([]);
        }
      })
      .catch((err) => {
        console.warn('Notion API fetch fallback', err);
        setExhibits([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const leather1Items = exhibits.filter((item) => {
    if (item.customType === 'photo' || item.customType === 'article') return false;
    const cat = typeof item.category === 'string' ? item.category : item.category.zh;
    const lowerCat = cat.toLowerCase();
    const title = typeof item.title === 'string' ? item.title : item.title.zh;
    const lowerTitle = title.toLowerCase();
    if (lowerCat.includes('photo') || lowerCat.includes('相片') || lowerCat.includes('article') || lowerCat.includes('文章') || lowerCat.includes('blog') || lowerTitle.includes('photo') || lowerTitle.includes('相片')) return false;
    return cat.includes('1') || (!cat.includes('2') && !cat.includes('其'));
  });

  const leather2Items = exhibits.filter((item) => {
    if (item.customType === 'photo' || item.customType === 'article') return false;
    const cat = typeof item.category === 'string' ? item.category : item.category.zh;
    const lowerCat = cat.toLowerCase();
    const title = typeof item.title === 'string' ? item.title : item.title.zh;
    const lowerTitle = title.toLowerCase();
    if (lowerCat.includes('photo') || lowerCat.includes('相片') || lowerCat.includes('article') || lowerCat.includes('文章') || lowerCat.includes('blog') || lowerTitle.includes('photo') || lowerTitle.includes('相片')) return false;
    return cat.includes('2');
  });

  const otherItems = exhibits.filter((item) => {
    if (item.customType === 'photo' || item.customType === 'article') return false;
    const cat = typeof item.category === 'string' ? item.category : item.category.zh;
    const lowerCat = cat.toLowerCase();
    const title = typeof item.title === 'string' ? item.title : item.title.zh;
    const lowerTitle = title.toLowerCase();
    if (lowerCat.includes('photo') || lowerCat.includes('相片') || lowerCat.includes('article') || lowerCat.includes('文章') || lowerCat.includes('blog') || lowerTitle.includes('photo') || lowerTitle.includes('相片')) return false;
    return cat.includes('其') || cat.toLowerCase().includes('other');
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-12 pointer-events-auto">
      <div className="max-w-2xl w-full flex flex-col h-full justify-between">
        {/* Page Title */}
        <div className="text-center mt-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 font-bold tracking-widest">
            《 作 品 》
          </h1>
          {isFromNotion && (
            <p className="text-[11px] font-mono text-zinc-500 mt-1">
              ✦ 連線至 Notion 即時同步中 (Synced with Notion)
            </p>
          )}
        </div>

        {/* Table of Contents style list */}
        <div className="flex-1 flex flex-col justify-center gap-8 px-4 md:px-12">
          {/* Section 1: 皮革部區域 1 */}
          <div>
            <h2 
              onClick={() => navigateToRoom('leather1')}
              className="text-xl font-serif font-bold text-zinc-800 mb-3 border-b border-zinc-800/20 pb-1 cursor-pointer hover:text-zinc-500 transition-colors inline-block"
              title="進入皮革區域 1 展廳 (Enter Leather 1 Gallery)"
            >
              一、 皮革部區域 1 <span>↗</span>
            </h2>
            <ul className="space-y-3 pl-2 md:pl-4 font-serif text-lg">
              {leather1Items.length > 0 ? (
                leather1Items.map((item) => (
                  <li 
                    key={item.id}
                    onClick={() => setExhibitModal(item)}
                    className="cursor-pointer group flex items-center justify-between"
                  >
                    <span className="text-zinc-800 group-hover:text-zinc-500 transition-colors">
                      {typeof item.title === 'string' ? item.title : item.title[language] || item.title.zh}
                    </span>
                    <span className="text-zinc-400 group-hover:text-zinc-600 border-b border-dashed border-zinc-400 flex-1 mx-4"></span>
                    <span className="text-zinc-500 text-sm italic group-hover:text-zinc-800">檢視</span>
                  </li>
                ))
              ) : (
                <li className="text-zinc-400 italic text-sm">尚無紀錄 (No records)</li>
              )}
            </ul>
          </div>

          {/* Section 2: 皮革部區域 2 */}
          <div>
            <h2 className="text-xl font-serif font-bold text-zinc-800 mb-3 border-b border-zinc-800/20 pb-1">
              二、 皮革部區域 2
            </h2>
            <ul className="space-y-3 pl-2 md:pl-4 font-serif text-lg">
              {leather2Items.length > 0 ? (
                leather2Items.map((item) => (
                  <li 
                    key={item.id}
                    onClick={() => setExhibitModal(item)}
                    className="cursor-pointer group flex items-center justify-between"
                  >
                    <span className="text-zinc-800 group-hover:text-zinc-500 transition-colors">
                      {typeof item.title === 'string' ? item.title : item.title[language] || item.title.zh}
                    </span>
                    <span className="text-zinc-400 group-hover:text-zinc-600 border-b border-dashed border-zinc-400 flex-1 mx-4"></span>
                    <span className="text-zinc-500 text-sm italic group-hover:text-zinc-800">檢視</span>
                  </li>
                ))
              ) : (
                <li className="text-zinc-400 italic text-sm">尚無紀錄 (No records yet)</li>
              )}
            </ul>
          </div>

          {/* Section 3: 其他 */}
          <div>
            <h2 className="text-xl font-serif font-bold text-zinc-800 mb-3 border-b border-zinc-800/20 pb-1">
              三、 其 他
            </h2>
            <ul className="space-y-3 pl-2 md:pl-4 font-serif text-lg">
              {otherItems.length > 0 ? (
                otherItems.map((item) => (
                  <li 
                    key={item.id}
                    onClick={() => setExhibitModal(item)}
                    className="cursor-pointer group flex items-center justify-between"
                  >
                    <span className="text-zinc-800 group-hover:text-zinc-500 transition-colors">
                      {typeof item.title === 'string' ? item.title : item.title[language] || item.title.zh}
                    </span>
                    <span className="text-zinc-400 group-hover:text-zinc-600 border-b border-dashed border-zinc-400 flex-1 mx-4"></span>
                    <span className="text-zinc-500 text-sm italic group-hover:text-zinc-800">檢視</span>
                  </li>
                ))
              ) : (
                <li className="text-zinc-400 italic text-sm">尚無紀錄 (No records yet)</li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 text-center mb-4">
          <button 
            onClick={() => navigateToRoom('home')}
            className="px-6 py-2 border border-zinc-800 text-zinc-800 hover:bg-zinc-800 hover:text-[#e4e1d9] transition-colors rounded font-serif text-sm tracking-wider"
          >
            返回首頁 (Return)
          </button>
        </div>
      </div>
    </div>
  );
};
