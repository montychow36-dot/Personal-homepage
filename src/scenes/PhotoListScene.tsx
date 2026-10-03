import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { fetchCraftsData } from '../services/craftsData';

const ITEMS_PER_PAGE = 6;

export const PhotoListScene: React.FC = () => {
  const { navigateToRoom } = useAppStore();
  const [photos, setPhotos] = useState<any[]>([]);
  const [isFromNotion, setIsFromNotion] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    fetchCraftsData()
      .then((data) => {
        if (isMounted && data && Array.isArray(data)) {
          const newPhotos = data.filter((item: any) => {
            const cat = (item.category || '').toLowerCase();
            const title = (item.title || '').toLowerCase();
            return item.customType === 'photo' || cat.includes('photo') || cat.includes('相片') || title.includes('photo') || title.includes('相片');
          });
          
          newPhotos.sort((a, b) => {
             const dateA = a.date || a.publishDate || '2024';
             const dateB = b.date || b.publishDate || '2024';
             return dateA < dateB ? 1 : dateA > dateB ? -1 : 0;
          });

          setPhotos(newPhotos);
          setIsFromNotion(true);
        }
      })
      .catch((err) => console.warn('Notion API error', err));
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.ceil(photos.length / ITEMS_PER_PAGE);
  const currentPhotos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return photos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [photos, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-6 md:p-12 pointer-events-auto overflow-hidden">
      <div className="max-w-4xl w-full flex flex-col h-full justify-between">
        
        {/* Header */}
        <div className="text-center mt-4 mb-8 shrink-0">
          <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 font-bold tracking-widest">
            【 相 片 紀 錄 】
          </h1>
          {isFromNotion && (
            <p className="text-[11px] font-mono text-zinc-500 mt-2">
              ✦ 連線至 Notion 即時同步中 (Synced with Notion)
            </p>
          )}
        </div>

        {/* Photo List */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-4">
          <ul className="space-y-4 font-serif text-lg">
            {currentPhotos.length > 0 ? (
              currentPhotos.map((item) => {
                const images = item.images && item.images.length > 0 ? item.images : (item.imageUrl ? [item.imageUrl] : []);
                return (
                  <li 
                    key={item.id}
                    className="cursor-pointer group flex flex-col items-start justify-center pb-4 border-b border-dashed border-zinc-200 last:border-0 hover:bg-zinc-50 transition-colors p-3 -mx-3 rounded"
                    onClick={() => useAppStore.getState().setActiveAlbum(item)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-zinc-800 font-bold group-hover:text-zinc-600 transition-colors text-xl">
                        {item.title.replace(/photo/i, '').trim() || item.title}
                      </span>
                      <span className="text-zinc-400 text-sm font-mono whitespace-nowrap ml-4">
                        {item.imageCount !== undefined ? item.imageCount : images.length} photos
                      </span>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="text-zinc-400 italic text-center text-sm py-10">尚無相片 (No photos yet)</li>
            )}
          </ul>
        </div>

        {/* Pagination & Footer */}
        <div className="mt-6 flex flex-col items-center gap-6 shrink-0">
          {totalPages > 1 && (
            <div className="flex items-center gap-6 font-mono text-sm text-zinc-600">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="hover:text-zinc-900 disabled:opacity-30 transition-colors px-2 py-1"
              >
                ← 上一頁 (Prev)
              </button>
              <span>{currentPage} / {totalPages}</span>
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="hover:text-zinc-900 disabled:opacity-30 transition-colors px-2 py-1"
              >
                下一頁 (Next) →
              </button>
            </div>
          )}

          <button 
            onClick={() => navigateToRoom('articles')}
            className="px-6 py-2 border border-zinc-800 text-zinc-800 hover:bg-zinc-800 hover:text-[#e4e1d9] transition-colors rounded font-serif text-sm tracking-wider"
          >
            返回目錄 (Return)
          </button>
        </div>
      </div>
    </div>
  );
};
