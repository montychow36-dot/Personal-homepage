import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';

// Helper to get global position
const getClientXY = (e: any) => {
  if (e.clientX !== undefined) return { x: e.clientX, y: e.clientY };
  if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: 0, y: 0 };
};

// Corner cuts: 20px off TL, TR, BL. BR is uncut.
const normalClip = "polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)";
// Portrait rotated -90deg. Visual uncut corner is BR, which is Local BL. So cut TL, TR, BR.
const portraitClip = "polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)";

type PhotoData = {
  id: string;
  src: string;
};

type FreePhotoData = PhotoData & {
  x: number;
  y: number;
  width: number;
  height: number;
  rotateZ: number;
};

const Slot: React.FC<{ 
  index: number; 
  photo: PhotoData | null; 
  onMove: (originIdx: number, dropIdx: number, photo: PhotoData) => void;
  onFree: (index: number, photo: PhotoData, x: number, y: number, width: number, height: number) => void;
  onClick: (src: string) => void;
}> = ({ index, photo, onMove, onFree, onClick }) => {
  const { playSound } = useAppStore();
  const [isPortrait, setIsPortrait] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [isFreed, setIsFreed] = useState(false);
  const [previewSlotIdx, setPreviewSlotIdx] = useState<number | null>(null);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const childX = useMotionValue(0);
  const childY = useMotionValue(0);

  useEffect(() => { 
    setIsFreed(false); 
    setPreviewSlotIdx(null);
    dragX.set(0);
    dragY.set(0);
    childX.set(0);
    childY.set(0);
  }, [photo, dragX, dragY, childX, childY]);

  return (
    <div className="album-slot relative w-full h-full p-2 flex items-center justify-center overflow-visible min-w-0 min-h-0" data-index={index} data-occupied={!!photo}>
      {/* Subtle indicator for empty slots */}
      {!photo && (
        <div className="w-[30%] h-[30%] border border-dashed border-zinc-500/20 rounded pointer-events-none" />
      )}
      
      <AnimatePresence>
        {photo && (
          <motion.div
            style={{ x: dragX, y: dragY, filter: 'drop-shadow(2px 3px 5px rgba(0,0,0,0.25))' }}
            whileDrag={{ zIndex: 100, cursor: 'grabbing', filter: 'drop-shadow(3px 5px 8px rgba(0,0,0,0.3))' }}
            drag
            dragConstraints={false}
            dragElastic={isFreed ? 1 : 0}
            dragMomentum={false}
            onDragStart={() => {
              setIsDragging(true);
              playSound('click');
            }}
            onDrag={(e, info) => {
              const targetEl = (e.target as HTMLElement).closest('.drag-container') || (e.target as HTMLElement);
              const photoRect = targetEl.getBoundingClientRect();
              const centerX = photoRect.left + photoRect.width / 2;
              const centerY = photoRect.top + photoRect.height / 2;

              let currentFreed = isFreed;

              // State 1: Enforce physical boundaries
              if (!currentFreed) {
                if (dragX.get() < 0) { dragX.set(0); }
                if (dragY.get() < 0) { dragY.set(0); }
                
                // If they pull hard enough right/down, instantly free it
                if (dragX.get() > 15 || dragY.get() > 15) {
                  currentFreed = true;
                  setIsFreed(true);
                  playSound('flip');
                }
              }
              
              // State 2: Free snapping interactions
              let currentPreviewIdx = previewSlotIdx;

              if (currentFreed) {
                const slots = Array.from(document.querySelectorAll('.album-slot'));
                let foundIdx = -1;
                slots.forEach(slot => {
                  const slotRect = slot.getBoundingClientRect();
                  if (centerX >= slotRect.left && centerX <= slotRect.right && 
                      centerY >= slotRect.top && centerY <= slotRect.bottom) {
                    foundIdx = parseInt(slot.getAttribute('data-index') || '-1');
                  }
                });

                if (foundIdx !== -1) {
                  const slotEl = slots.find(s => parseInt(s.getAttribute('data-index') || '-1') === foundIdx);
                  const isOccupied = slotEl?.getAttribute('data-occupied') === 'true';
                  
                  if (!isOccupied || foundIdx === index) {
                    // Any push left or up triggers the lock
                    if (info.delta.x < 0 || info.delta.y < 0) {
                      if (currentPreviewIdx !== foundIdx) {
                        currentPreviewIdx = foundIdx;
                        setPreviewSlotIdx(foundIdx);
                        playSound('click');
                      }
                    }
                    // Pulling right/down un-locks it
                    else if (info.delta.x > 1 || info.delta.y > 1) {
                      if (currentPreviewIdx === foundIdx) {
                        currentPreviewIdx = null;
                        setPreviewSlotIdx(null);
                        playSound('flip');
                      }
                    }
                  } else {
                    if (currentPreviewIdx !== null) {
                      currentPreviewIdx = null;
                      setPreviewSlotIdx(null);
                    }
                  }
                } else {
                  if (currentPreviewIdx !== null) {
                    currentPreviewIdx = null;
                    setPreviewSlotIdx(null);
                    playSound('flip');
                  }
                }

                // Pure Visual Pinning without fighting Framer Motion
                if (currentPreviewIdx !== null) {
                  const lockSlotEl = document.querySelector(`.album-slot[data-index="${currentPreviewIdx}"]`);
                  if (lockSlotEl) {
                    const sRect = lockSlotEl.getBoundingClientRect();
                    const sCX = sRect.left + sRect.width / 2;
                    const sCY = sRect.top + sRect.height / 2;
                    childX.set(sCX - centerX);
                    childY.set(sCY - centerY);
                  }
                } else {
                  childX.set(0);
                  childY.set(0);
                }
              } else {
                childX.set(0);
                childY.set(0);
              }
            }}
            onDragEnd={(e, info) => {
              setTimeout(() => setIsDragging(false), 50);
              childX.set(0);
              childY.set(0);
              
              if (!isFreed) {
                dragX.set(0);
                dragY.set(0);
                playSound('flip');
                return;
              }

              if (previewSlotIdx !== null) {
                if (previewSlotIdx === index) {
                  dragX.set(0);
                  dragY.set(0);
                  setIsFreed(false);
                  playSound('flip');
                } else {
                  onMove(index, previewSlotIdx, photo);
                  setPreviewSlotIdx(null);
                }
              } else {
                const targetEl = (e.target as HTMLElement).closest('.drag-container') || (e.target as HTMLElement);
                const photoRect = targetEl.getBoundingClientRect();
                const centerX = photoRect.left + photoRect.width / 2;
                const centerY = photoRect.top + photoRect.height / 2;
                onFree(index, photo, centerX, centerY, photoRect.width, photoRect.height);
                setPreviewSlotIdx(null);
              }
            }}
            onClick={() => { if (!isDragging) onClick(photo.src); }}
            initial={{ rotate: 0 }}
            animate={{ rotate: isPortrait ? -90 : 0 }}
            className="drag-container relative cursor-grab flex items-center justify-center z-10 w-full h-full"
          >
            <motion.div 
              style={{
                x: childX,
                y: childY,
                aspectRatio: aspectRatio,
                clipPath: isFreed ? (previewSlotIdx !== null ? (isPortrait ? portraitClip : normalClip) : 'none') : (isPortrait ? portraitClip : normalClip)
              }}
              animate={{ scale: previewSlotIdx !== null ? 0.95 : 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="bg-white p-1 md:p-2 border border-zinc-200 flex items-center justify-center relative transition-[clip-path] duration-200 w-fit h-fit max-w-full max-h-full min-w-0 min-h-0"
            >
              <div className="absolute -top-1 -left-1 w-3 h-3 md:w-4 md:h-4 border-l-2 border-t-2 border-zinc-300 z-10" />
              <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 border-r-2 border-t-2 border-zinc-300 z-10" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 md:w-4 md:h-4 border-l-2 border-b-2 border-zinc-300 z-10" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 border-r-2 border-b-2 border-zinc-300 z-10" />
              
              <img 
                src={photo.src}
                onLoad={(e) => { const el = e.target as HTMLImageElement; setIsPortrait(el.naturalHeight > el.naturalWidth); setAspectRatio(`${el.naturalWidth}/${el.naturalHeight}`); }}
                className="max-w-full max-h-full w-auto h-auto block pointer-events-none object-contain"
                alt="" 
                draggable={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
const FreeImage: React.FC<{ 
  photo: FreePhotoData;
  onSnap: (photo: FreePhotoData, dropIdx: number) => void;
  onClick: (src: string) => void;
}> = ({ photo, onSnap, onClick }) => {
  const { playSound } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string | undefined>(undefined);
  const [previewSlotIdx, setPreviewSlotIdx] = useState<number | null>(null);

  const childX = useMotionValue(0);
  const childY = useMotionValue(0);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => {
        setIsDragging(true);
        playSound('click');
      }}
      onDrag={(e, info) => {
        const targetEl = (e.target as HTMLElement).closest('.drag-container') || (e.target as HTMLElement);
        const photoRect = targetEl.getBoundingClientRect();
        const centerX = photoRect.left + photoRect.width / 2;
        const centerY = photoRect.top + photoRect.height / 2;
        
        const slots = Array.from(document.querySelectorAll('.album-slot'));
        let foundIdx = -1;

        slots.forEach(slot => {
          const slotRect = slot.getBoundingClientRect();
          if (centerX >= slotRect.left && centerX <= slotRect.right && 
              centerY >= slotRect.top && centerY <= slotRect.bottom) {
            foundIdx = parseInt(slot.getAttribute('data-index') || '-1');
          }
        });

        let currentPreviewIdx = previewSlotIdx;

        if (foundIdx !== -1) {
          const slotEl = slots.find(s => parseInt(s.getAttribute('data-index') || '-1') === foundIdx);
          const isOccupied = slotEl?.getAttribute('data-occupied') === 'true';
          
          if (!isOccupied) {
            if (info.delta.x < 0 || info.delta.y < 0) {
              if (currentPreviewIdx !== foundIdx) {
                currentPreviewIdx = foundIdx;
                setPreviewSlotIdx(foundIdx);
                playSound('click'); 
              }
            } 
            else if (info.delta.x > 1 || info.delta.y > 1) {
              if (currentPreviewIdx === foundIdx) {
                currentPreviewIdx = null;
                setPreviewSlotIdx(null);
                playSound('flip'); 
              }
            }
          } else {
            if (currentPreviewIdx !== null) {
              currentPreviewIdx = null;
              setPreviewSlotIdx(null);
            }
          }
        } else {
          if (currentPreviewIdx !== null) {
            currentPreviewIdx = null;
            setPreviewSlotIdx(null);
            playSound('flip');
          }
        }

        if (currentPreviewIdx !== null) {
          const lockSlotEl = document.querySelector(`.album-slot[data-index="${currentPreviewIdx}"]`);
          if (lockSlotEl) {
            const sRect = lockSlotEl.getBoundingClientRect();
            const sCX = sRect.left + sRect.width / 2;
            const sCY = sRect.top + sRect.height / 2;
            childX.set(sCX - centerX);
            childY.set(sCY - centerY);
          }
        } else {
          childX.set(0);
          childY.set(0);
        }
      }}
      onDragEnd={(e) => {
        setTimeout(() => setIsDragging(false), 50);
        childX.set(0);
        childY.set(0);
        
        if (previewSlotIdx !== null) {
          onSnap(photo, previewSlotIdx);
          setPreviewSlotIdx(null);
        } else {
          playSound('click'); // Drop on empty table
        }
      }}
      onClick={() => { if (!isDragging) onClick(photo.src); }}
      initial={{ rotate: (isPortrait ? -90 : 0) + (photo.rotateZ || 0) }}
      animate={{ rotate: (isPortrait ? -90 : 0) + (photo.rotateZ || 0) }}
      style={{ 
        position: 'fixed',
        left: photo.x,
        top: photo.y,
        width: photo.width,
        height: photo.height,
        x: '-50%', 
        y: '-50%', // Center on coordinates
        filter: 'drop-shadow(3px 5px 8px rgba(0,0,0,0.3))'
      }}
      whileDrag={{ zIndex: 200, cursor: 'grabbing', filter: 'drop-shadow(5px 8px 12px rgba(0,0,0,0.4))' }}
      className="drag-container cursor-grab flex items-center justify-center z-[150]"
    >
      <motion.div 
        style={{
          x: childX,
          y: childY,
          aspectRatio: aspectRatio,
          clipPath: previewSlotIdx !== null ? (isPortrait ? portraitClip : normalClip) : 'none'
        }}
        animate={{ scale: previewSlotIdx !== null ? 0.95 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="bg-white p-1 md:p-2 border border-zinc-200 flex items-center justify-center relative w-fit h-fit max-w-full max-h-full transition-[clip-path] duration-200 min-w-0 min-h-0"
      >
        <div className="absolute -top-1 -left-1 w-3 h-3 md:w-4 md:h-4 border-l-2 border-t-2 border-zinc-300 z-10" />
        <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 border-r-2 border-t-2 border-zinc-300 z-10" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 md:w-4 md:h-4 border-l-2 border-b-2 border-zinc-300 z-10" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 border-r-2 border-b-2 border-zinc-300 z-10" />
        
        <img 
          src={photo.src}
          onLoad={(e) => { const el = e.target as HTMLImageElement; setIsPortrait(el.naturalHeight > el.naturalWidth); setAspectRatio(`${el.naturalWidth}/${el.naturalHeight}`); }}
          className="max-w-full max-h-full w-auto h-auto block pointer-events-none object-contain"
          alt="" 
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
};
export const AlbumScene: React.FC = () => {
  
  const { navigateToRoom, previousRoom, activeAlbum, playSound } = useAppStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [slots, setSlots] = useState<(PhotoData | null)[]>(new Array(9).fill(null));
  const [freePhotos, setFreePhotos] = useState<FreePhotoData[]>([]);

  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (activeAlbum) {
      setIsLoading(true);
      // reset details to clear stale data
      setDetails(null);
      fetch('/api/notion/crafts/' + activeAlbum.id)
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
  }, [activeAlbum?.id]);

  const albumData = details || activeAlbum;

  useEffect(() => {
    if (!albumData) return;
    let currentImages: string[] = [];
    let extraFreePhotos = [];
    if (albumData.pages && Object.keys(albumData.pages).length > 0) {
      // Notion Pages are 1-indexed (Page:1, Page:2, etc.)
      const pageKey = currentPage + 1;
      const pageImages = albumData.pages[pageKey] || [];
      currentImages = pageImages.slice(0, 9);
      const extraImages = pageImages.slice(9);
      
      const w = typeof window !== 'undefined' ? window.innerWidth : 800;
      const h = typeof window !== 'undefined' ? window.innerHeight : 600;
      const gridSize = Math.min(w * 0.8, h * 0.75);
      const slotSize = Math.max(100, (gridSize - 32) / 3);
      
      extraFreePhotos = extraImages.map((src, idx) => ({
        id: `photo-extra-${currentPage}-${idx}`,
        src,
        x: w * 0.5 + (Math.random() - 0.5) * (gridSize * 0.3),
        y: h * 0.5 + (Math.random() - 0.5) * (gridSize * 0.3),
        width: slotSize,
        height: slotSize,
        rotateZ: (Math.random() - 0.5) * 30
      }));
    } else {
      const images = albumData.images && albumData.images.length > 0
                    ? albumData.images
                    : (albumData.imageUrl ? [albumData.imageUrl] : []);
      // Take up to 10 photos per page: 9 in grid, 1 on top
      const pageImages = images.slice(currentPage * 10, (currentPage + 1) * 10);
      currentImages = pageImages.slice(0, 9);
      
      // Scatter remaining photos (the 10th photo) on the screen
      const extraImages = pageImages.slice(9);
      const w = typeof window !== 'undefined' ? window.innerWidth : 800;
      const h = typeof window !== 'undefined' ? window.innerHeight : 600;
      
      const gridSize = Math.min(w * 0.8, h * 0.75);
      const slotSize = Math.max(100, (gridSize - 32) / 3);
      
      extraFreePhotos = extraImages.map((src, idx) => ({
        id: `photo-extra-${currentPage}-${idx}`,
        src,
        x: w * 0.5 + (Math.random() - 0.5) * (gridSize * 0.3),
        y: h * 0.5 + (Math.random() - 0.5) * (gridSize * 0.3),
        width: slotSize,
        height: slotSize,
        rotateZ: (Math.random() - 0.5) * 30
      }));
    }
    
    const newSlots = new Array(9).fill(null);
    currentImages.forEach((src: string, idx: number) => {
      newSlots[idx] = { id: `photo-${currentPage}-${idx}`, src };
    });
    setSlots(newSlots);
    setFreePhotos(extraFreePhotos);
  }, [currentPage, albumData]);


  if (!albumData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-12 pointer-events-auto">
        <p className="text-zinc-500 font-serif">無選擇的相簿 (No album selected)</p>
        <button onClick={() => navigateToRoom(previousRoom !== 'album' ? previousRoom : 'home')} className="mt-4 px-4 py-2 border border-zinc-800 rounded text-sm font-serif">
          返回 (Return)
        </button>
      </div>
    );
  }

  let totalPages = 1;
  let totalImagesCount = 0;
  if (albumData?.pages && Object.keys(albumData?.pages).length > 0) {
    const keys = Object.keys(albumData?.pages).map(Number);
    totalPages = Math.max(...keys);
    totalImagesCount = Object.values(albumData?.pages).flat().length;
  } else {
    const images = albumData?.images && albumData?.images.length > 0 
                 ? albumData?.images 
                 : (albumData?.imageUrl ? [albumData?.imageUrl] : []);
    totalPages = Math.ceil(images.length / 10) || 1;
    totalImagesCount = images.length;
  }

  const handleNextPage = () => {
    playSound('flip');
    setCurrentPage(p => Math.min(totalPages - 1, p + 1));
  };

  const handlePrevPage = () => {
    playSound('flip');
    setCurrentPage(p => Math.max(0, p - 1));
  };

  const openEnlarged = (src: string) => {
    playSound('click');
    setEnlargedImage(src);
  };

  const handleMove = (originIdx: number, dropIdx: number, photo: PhotoData) => {
    setSlots(prev => {
      if (prev[dropIdx] !== null) {
        playSound('click'); // Reject if occupied
        return prev;
      }
      playSound('flip');
      const next = [...prev];
      next[dropIdx] = photo;
      next[originIdx] = null; 
      return next;
    });
  };

  const handleFree = (originIdx: number, photo: PhotoData, x: number, y: number, width: number, height: number) => {
    playSound('flip');
    setSlots(prev => {
      const next = [...prev];
      next[originIdx] = null;
      return next;
    });
    setFreePhotos(prev => [
      ...prev,
      { ...photo, x, y, width, height, rotateZ: (originIdx % 2 === 0 ? -2 : 2) + (Math.random() * 4 - 2) }
    ]);
  };

  const handleSnap = (photo: FreePhotoData, dropIdx: number) => {
    setSlots(prev => {
      if (prev[dropIdx] !== null) {
        playSound('click'); // Reject if occupied
        return prev;
      }
      playSound('flip');
      const next = [...prev];
      next[dropIdx] = { id: photo.id, src: photo.src };
      setFreePhotos(free => free.filter(p => p.id !== photo.id));
      return next;
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-12 pointer-events-auto">
      <div className="max-w-4xl w-full flex flex-col h-full justify-between relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#e4e1d9]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-zinc-800 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 font-serif text-sm text-zinc-600">正在讀取相簿資料 (Loading...)</p>
            </div>
          </div>
        )}

        
        {/* Title */}
        <div className="text-center mt-4 mb-2 shrink-0">
          <h1 className="text-2xl md:text-3xl font-serif text-zinc-900 font-bold tracking-widest">
            《 {albumData?.title.replace(/photo/i, '').trim() || '相片集'} 》
          </h1>
          <p className="text-[11px] font-serif text-zinc-500 mt-2">
            往右下方拉動以取出相片；將相片移至空白卡角處即可重新收納。<br/>
            (Drag bottom-right to free; drop on any slot to store)
          </p>
        </div>
        
        {/* 3x3 Grid */}
        <div className="flex-1 w-full flex items-center justify-center min-h-0 py-4 overflow-visible">
          <div className="grid grid-cols-3 grid-rows-3 gap-2 md:gap-4 w-full max-w-[75vh] aspect-square relative mx-auto">
            {slots.map((photo, i) => (
               <Slot 
                 key={`slot-${i}`} 
                 index={i} 
                 photo={photo} 
                 onMove={handleMove}
                 onFree={handleFree}
                 onClick={openEnlarged}
               />
            ))}
            
            {totalImagesCount === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <p className="text-zinc-400 italic">此相簿為空 (Empty album)</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination & Return */}
        <div className="mt-2 flex flex-col items-center gap-4 shrink-0">
          {totalPages > 1 && (
            <div className="flex items-center gap-4 font-serif">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="px-3 py-1 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 transition-colors"
              >
                ← 上一頁
              </button>
              <span className="text-zinc-600 text-sm">{currentPage + 1} / {totalPages}</span>
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 transition-colors"
              >
                下一頁 →
              </button>
            </div>
          )}
          <button 
            onClick={() => navigateToRoom(previousRoom !== 'album' ? previousRoom : 'home')}
            className="px-6 py-2 border border-zinc-800 text-zinc-800 hover:bg-zinc-800 hover:text-[#e4e1d9] transition-colors rounded font-serif text-sm tracking-wider bg-white/50"
          >
            返回目錄 (Return to Index)
          </button>
        </div>
      </div>

      {/* Render Free Photos globally on top */}
      {freePhotos.map(photo => (
        <FreeImage 
          key={photo.id} 
          photo={photo} 
          onSnap={handleSnap} 
          onClick={openEnlarged} 
        />
      ))}

      {/* Enlarged Image Modal */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { playSound('click'); setEnlargedImage(null); }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={enlargedImage} 
              alt="Enlarged"
              className="max-w-[90vw] max-h-[90vh] object-contain drop-shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Close button */}
            <button
              onClick={() => { playSound('click'); setEnlargedImage(null); }}
              className="absolute top-6 right-6 text-white hover:text-zinc-300 transition-colors pointer-events-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


