import React from 'react';
import { motion } from 'framer-motion';

interface AlbumPhotoProps {
  imageUrl: string;
  title?: string;
  index: number;
}

export const AlbumPhoto: React.FC<AlbumPhotoProps> = ({ imageUrl, title, index }) => {
  // Generate a slight random rotation for the initial placed state to make it look organic
  const initialRotate = (index % 5) * 2 - 4; // between -4 and +4 degrees

  return (
    <div className="relative inline-block m-4 md:m-8 group touch-none">
      {/* Album Corners (Stay fixed on the page) */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-800 opacity-30 -translate-x-1 -translate-y-1 pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-800 opacity-30 translate-x-1 -translate-y-1 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-800 opacity-30 -translate-x-1 translate-y-1 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-800 opacity-30 translate-x-1 translate-y-1 pointer-events-none" />

      {/* Draggable Photo */}
      <motion.div
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.05, zIndex: 50, rotate: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        initial={{ rotate: initialRotate }}
        className="relative bg-white p-3 pb-8 md:p-4 md:pb-12 shadow-md cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow duration-300"
        style={{
          width: '200px',
          height: 'auto',
          touchAction: 'none'
        }}
      >
        <img
          src={imageUrl}
          alt={title || "Album Photo"}
          className="w-full h-auto object-cover pointer-events-none"
          draggable={false}
        />
        {title && (
          <p className="absolute bottom-2 left-0 w-full text-center text-zinc-600 font-serif text-sm px-2 truncate pointer-events-none">
            {title}
          </p>
        )}
      </motion.div>
    </div>
  );
};
