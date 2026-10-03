import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ExhibitData } from '../types';
import { PerspectiveMuseumCanvas } from '../components/museum/PerspectiveMuseumCanvas';
import { getAssetUrl } from '../utils/assets';

export const Leather1Scene: React.FC = () => {
  const { navigateToRoom, previousRoom, setExhibitModal } = useAppStore();
  const [exhibits, setExhibits] = useState<ExhibitData[]>([]);

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
        } else {
          if (isMounted) setExhibits([]);
        }
      })
      .catch(() => {
        if (isMounted) setExhibits([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const leather1Items = exhibits.filter((item) => {
    const cat = typeof item.category === 'string' ? item.category : item.category.zh;
    return cat.includes('1') || cat.includes('皮');
  });

  const firstItem = leather1Items[0];
  const secondItem = leather1Items[1];

  const handleExhibitClick = (exhibit: ExhibitData | undefined) => {
    if (exhibit) {
      setExhibitModal(exhibit);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-0 md:p-0 pointer-events-auto">
      <PerspectiveMuseumCanvas 
        hallTitle="LEATHER DEPT. 1"
        leftBg={getAssetUrl('card_holder_in_museum.png')}
        rightBg={getAssetUrl('Leather_Coin_Box_in_museum.png')}
        leftContainerClassName="scale-[1.25] md:scale-[1.3] origin-left translate-y-12 md:translate-y-16"
        rightContainerClassName="scale-[0.8] md:scale-[0.85] origin-right -translate-y-4"
        leftOverlay={
          firstItem && (
            <div 
              className="absolute inset-0 cursor-pointer group"
              onClick={() => handleExhibitClick(firstItem)}
              title={`查看 ${typeof firstItem.title === 'string' ? firstItem.title : firstItem.title.zh}`}
            >
               <img src={getAssetUrl('Leather_bag_1_in_museum.png')} alt="Leather Bag" className="absolute bottom-full left-1/2 -translate-x-1/2 w-[80%] mb-12 object-contain mix-blend-multiply opacity-90 pointer-events-none drop-shadow-md" />
               <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
            </div>
          )
        }
        rightOverlay={
          secondItem && (
            <div 
              className="absolute inset-0 cursor-pointer group"
              onClick={() => handleExhibitClick(secondItem)}
              title={`查看 ${typeof secondItem.title === 'string' ? secondItem.title : secondItem.title.zh}`}
            >
               <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
            </div>
          )
        }
      >
        
        {/* Gateway Image placed top middle */}
        <div className="absolute top-[-60px] md:top-[-120px] left-[55%] md:left-[56%] -translate-x-1/2 translate-y-0 z-40 pointer-events-none w-[505px] sm:w-[709px] md:w-[946px] lg:w-[1261px]">
          <img 
            src={getAssetUrl('leather_area_1_gateway_final_version-1.png')} 
            alt="Leather Area 1 Gateway"
            className="w-full h-auto object-contain mix-blend-multiply opacity-80"
          />
        </div>
        <div className="absolute top-6 left-6 z-50 pointer-events-auto">
          <button 
            onClick={() => navigateToRoom('home')}
            className="text-zinc-600 hover:text-zinc-900 font-mono text-sm border-b border-transparent hover:border-zinc-900 transition-colors bg-white/60 px-3 py-1.5 backdrop-blur-sm rounded-sm"
          >
            ← 返回 (Back)
          </button>
        </div>
      </PerspectiveMuseumCanvas>
    </div>
  );
};
