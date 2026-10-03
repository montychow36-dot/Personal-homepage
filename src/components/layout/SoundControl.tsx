import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getAssetUrl } from '../../utils/assets';

export const SoundControl: React.FC = () => {
  const { soundEnabled, toggleSound } = useAppStore();

  const handleSoundOff = () => {
    if (soundEnabled) {
      toggleSound();
    }
  };

  const handleSoundOn = () => {
    if (!soundEnabled) {
      toggleSound();
    }
  };

  return (
    <div className="fixed top-0 right-4 md:right-8 z-50 pointer-events-auto" style={{ width: '22vw', height: '22vh' }}>
      <div className="relative w-full h-full overflow-hidden">
        <img 
          src={getAssetUrl('Sound.png')} 
          alt="Sound Control" 
          className={`absolute bottom-0 left-0 w-full h-[166.67%] object-contain object-bottom transition-opacity duration-300 ${soundEnabled ? 'opacity-100' : 'opacity-60'}`}
          draggable={false}
        />
        {/* Left half for sound OFF */}
        <div 
          className="absolute top-0 left-0 w-1/2 h-full cursor-pointer z-10"
          onClick={handleSoundOff}
          title="Turn Sound Off"
        />
        {/* Right half for sound ON */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-full cursor-pointer z-10"
          onClick={handleSoundOn}
          title="Turn Sound On"
        />
      </div>
    </div>
  );
};
