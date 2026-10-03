import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { translations } from '../i18n/translations';

export const ExhibitScene: React.FC = () => {
  const { activeModalExhibit, setExhibitModal, navigateToRoom, previousRoom, language } = useAppStore();
  const t = translations[language] || translations.zh;
  
  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Get image array (fallback to imageUrl if images is not populated)
  
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    let isMounted = true;
    if (activeModalExhibit) {
      setIsLoading(true);
      setDetails(null);
      fetch('/api/notion/crafts/' + activeModalExhibit.id)
        .then(res => res.json())
        .then(json => {
          if (isMounted && json.data) {
            setDetails(json.data);
          }
          if (isMounted) setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          if (isMounted) setIsLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [activeModalExhibit?.id]);

  const exhibitData = details || activeModalExhibit;
  const images = exhibitData?.images?.length 
    ? exhibitData.images 
    : (exhibitData?.imageUrl ? [exhibitData.imageUrl] : []);


  // Stack ordering state for scattered photos (progressive loading/Option 3)
  const [stackOrder, setStackOrder] = useState<number[]>(() => images.map((_, i) => i));
  
  // Track which images have been revealed so they don't turn blank again
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    images.forEach((_, i) => { if (i < 1) init[i] = true; }); // Only load top 1 initially to let the intersection observer do its job
    return init;
  });

  const cardRefs = React.useRef<Record<number, HTMLDivElement | null>>({});

  React.useEffect(() => {
    setStackOrder(images.map((_, i) => i));
    setLoadedImages(() => {
      const init: Record<number, boolean> = {};
      images.forEach((_, i) => { if (i < 1) init[i] = true; });
      return init;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModalExhibit.id, images.length]);

  React.useEffect(() => {
    // Spatial intersection check: if an image is not heavily covered by any image above it, load it.
    const interval = setInterval(() => {
      setLoadedImages(prev => {
        let hasChanges = false;
        const next = { ...prev };

        images.forEach((_, i) => {
          if (next[i]) return;

          const elI = cardRefs.current[i];
          if (!elI) return;

          const rectI = elI.getBoundingClientRect();
          const cxI = rectI.left + rectI.width / 2;
          const cyI = rectI.top + rectI.height / 2;

          let isCovered = false;
          const posI = stackOrder.indexOf(i);
          
          // Check against all images that are visually above this one
          for (let j = 0; j < posI; j++) {
            const upperIdx = stackOrder[j];
            const elUpper = cardRefs.current[upperIdx];
            if (!elUpper) continue;

            const rectUpper = elUpper.getBoundingClientRect();
            const cxUpper = rectUpper.left + rectUpper.width / 2;
            const cyUpper = rectUpper.top + rectUpper.height / 2;

            const dist = Math.hypot(cxI - cxUpper, cyI - cyUpper);
            // Threshold for ~75% coverage. 
            // Cards are roughly 200px wide. A center distance < 80px means they are heavily overlapping.
            if (dist < 80) {
              isCovered = true;
              break;
            }
          }

          if (!isCovered) {
            next[i] = true;
            hasChanges = true;
          }
        });

        return hasChanges ? next : prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [images.length, stackOrder]);

  const bringToFront = (idx: number) => {
    setStackOrder(prev => {
      if (prev[0] === idx) return prev;
      return [idx, ...prev.filter(i => i !== idx)];
    });
    setLoadedImages(prev => {
      if (prev[idx]) return prev;
      return { ...prev, [idx]: true };
    });
  };

  // Handle back navigation safely
  const handleBack = () => {
    navigateToRoom(previousRoom !== 'exhibit' ? previousRoom : 'home');
  };

  if (!activeModalExhibit) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-12 pointer-events-auto">
        <h2 className="text-xl font-serif text-zinc-600 mb-8">找不到作品 (Exhibit not found)</h2>
        <button 
          onClick={handleBack}
          className="px-6 py-2 border border-zinc-800 text-zinc-800 hover:bg-zinc-800 hover:text-[#e4e1d9] transition-colors rounded font-serif text-sm tracking-wider"
        >
          返回 (Back)
        </button>
      </div>
    );
  }

  const title = typeof exhibitData?.title === 'string' 
    ? exhibitData?.title 
    : exhibitData?.title[language] || exhibitData?.title.zh;
  const category = typeof exhibitData?.category === 'string' 
    ? exhibitData?.category 
    : exhibitData?.category[language] || exhibitData?.category.zh;
  const description = typeof exhibitData?.description === 'string' 
    ? exhibitData?.description 
    : exhibitData?.description[language] || exhibitData?.description.zh;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && images.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && images.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-start p-6 md:p-12 pointer-events-auto overflow-y-auto overflow-x-hidden relative">
        {/* Top action bar */}
        <div className="w-full max-w-2xl flex justify-between items-center mb-10 pt-4">
          <button 
            onClick={handleBack}
            className="text-zinc-500 hover:text-zinc-900 font-mono text-sm border-b border-transparent hover:border-zinc-900 transition-colors"
          >
            ← 返回目錄 (Back to works)
          </button>
          <span className="text-xs font-mono text-zinc-400">INDEX NO. {activeModalExhibit.id.slice(-6).toUpperCase()}</span>
        </div>

        {/* Exhibit Content Layout */}
        <div className="w-full max-w-2xl flex flex-col gap-6">
          
          {/* Header / Title area */}
          <div className="text-center border-b-2 border-zinc-900 pb-8 mb-6">
            <div className="flex justify-center items-center gap-3 mb-4">
              <span className="text-xs font-serif text-zinc-500 tracking-widest uppercase border border-zinc-300 px-3 py-1 rounded">
                {category}
              </span>
              <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2 py-1">
                {activeModalExhibit.date}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 tracking-wide">
              {title}
            </h1>
          </div>

          {/* Tags */}
          {activeModalExhibit.tags && activeModalExhibit.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {activeModalExhibit.tags.map((tag, idx) => (
                <span key={idx} className="text-[11px] font-mono px-3 py-1 bg-zinc-800/5 border border-zinc-800/10 text-zinc-600 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Scattered Draggable Photos Layout */}
          {images.length > 0 && (
            <div className="flex flex-col items-center mb-12">
              <div className="relative w-full max-w-2xl min-h-[350px] md:min-h-[450px] flex justify-center items-center select-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-zinc-300 font-mono text-xs tracking-widest border border-dashed border-zinc-300 p-2 opacity-50">
                    DRAG & EXPLORE
                  </span>
                </div>
                {images.map((src, originalIdx) => {
                const currentStackPos = stackOrder.indexOf(originalIdx);
                // Deterministic but "random" looking rotation and position
                const rotate = (originalIdx % 2 === 0 ? 1 : -1) * ((originalIdx * 7) % 15) + (originalIdx === 0 ? -5 : 0);
                const xOffset = (originalIdx % 3 === 0 ? 1 : -1) * ((originalIdx * 12) % 40) + (originalIdx === 1 ? 30 : 0);
                const yOffset = (originalIdx % 2 === 0 ? 1 : -1) * ((originalIdx * 8) % 30) + (originalIdx === 2 ? -20 : 0);
                
                // Progressive Loading: render real img if it's been loaded before (handled by intersection observer)
                const isLoaded = loadedImages[originalIdx];
                
                return (
                  <motion.div
                    key={originalIdx}
                    ref={(el) => { cardRefs.current[originalIdx] = el; }}
                    drag
                    dragMomentum={false}
                    whileDrag={{ scale: 1.05, rotate: 0 }}
                    whileHover={{ scale: 1.02 }}
                    initial={{ rotate, x: xOffset, y: yOffset }}
                    onPointerDown={() => bringToFront(originalIdx)}
                    onClick={() => setLightboxIndex(originalIdx)}
                    className="absolute cursor-grab active:cursor-grabbing p-3 bg-white shadow-md border border-zinc-200 transition-shadow hover:shadow-xl"
                    style={{ zIndex: images.length - currentStackPos }}
                  >
                    {isLoaded ? (
                      <img 
                        src={src} 
                        alt={`${title} - ${originalIdx + 1}`}
                        className="w-48 h-48 md:w-64 md:h-64 object-cover pointer-events-none"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-48 h-48 md:w-64 md:h-64 bg-zinc-100/40 pointer-events-none flex items-center justify-center">
                        <span className="text-zinc-300 font-mono text-[10px]">PHOTO</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <p className="mt-8 text-[10px] font-mono text-[#c0c0c0] text-center uppercase tracking-[0.2em] select-none pointer-events-none">
              點擊照片以放大檢視 (Click to enlarge)
            </p>
          </div>
          )}

          {/* Text Description */}
          <div className="prose prose-zinc prose-p:font-serif prose-p:leading-loose prose-p:text-zinc-800 max-w-none text-justify mx-auto w-full md:w-[90%] lg:w-[80%]">
            {description.split('\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="mb-4 text-base md:text-lg">
                {paragraph}
              </p>
            ))}
          </div>

        </div>
        
        <div className="mt-auto pt-16 pb-4">
          <p className="text-[10px] font-mono text-zinc-400 text-center uppercase tracking-[0.2em]">
            End of document
          </p>
        </div>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/95 backdrop-blur-sm pointer-events-auto"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close Button */}
            <button 
              className="absolute top-6 right-6 text-zinc-400 hover:text-white font-mono text-3xl transition-colors p-2 z-10"
              onClick={() => setLightboxIndex(null)}
            >
              ✕
            </button>

            {/* Prev Button */}
            {images.length > 1 && (
              <button 
                className="absolute left-2 md:left-8 text-zinc-400 hover:text-white text-5xl hover:scale-110 p-4 transition-all z-10"
                onClick={handlePrev}
              >
                ‹
              </button>
            )}

            {/* Current Image Container */}
            <div 
              className="relative w-full h-full flex items-center justify-center p-12"
              onClick={() => setLightboxIndex(null)}
            >
              <motion.img 
                key={lightboxIndex}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                src={images[lightboxIndex]}
                alt={`View ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain shadow-2xl"
                referrerPolicy="no-referrer"
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image itself
              />
            </div>

            {/* Next Button */}
            {images.length > 1 && (
              <button 
                className="absolute right-2 md:right-8 text-zinc-400 hover:text-white text-5xl hover:scale-110 p-4 transition-all z-10"
                onClick={handleNext}
              >
                ›
              </button>
            )}

            {/* Counter */}
            <div className="absolute bottom-8 text-zinc-500 font-mono text-sm tracking-widest z-10">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
