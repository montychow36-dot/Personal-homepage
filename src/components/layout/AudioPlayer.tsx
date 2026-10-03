import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

declare global {
  interface Window {
    playAppSound?: (type: 'open' | 'close' | 'flip' | 'click') => void;
  }
}

export const AudioPlayer: React.FC = () => {
  const { soundEnabled } = useAppStore();
  
  const openAudioRef = useRef<HTMLAudioElement | null>(null);
  const closeAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    window.playAppSound = (type) => {
      if (!soundEnabled) return;

      if (type === 'open' || type === 'flip') {
        if (openAudioRef.current) {
          openAudioRef.current.currentTime = 0;
          openAudioRef.current.play().catch(() => {});
        }
      } else if (type === 'close') {
        if (closeAudioRef.current) {
          closeAudioRef.current.currentTime = 0;
          closeAudioRef.current.play().catch(() => {});
        }
      } else if (type === 'click') { 
        if (openAudioRef.current) {
          openAudioRef.current.currentTime = 0;
          openAudioRef.current.play().catch(() => {});
        }
      }
    };

    return () => {
      delete window.playAppSound;
    };
  }, [soundEnabled]);

  // Handle browser autoplay policy by waiting for the first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (soundEnabled && bgAudioRef.current && bgAudioRef.current.paused) {
        bgAudioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [soundEnabled]);

  // Toggle background music based on soundEnabled
  useEffect(() => {
    if (bgAudioRef.current) {
      if (soundEnabled) {
        bgAudioRef.current.play().catch(() => {});
      } else {
        bgAudioRef.current.pause();
      }
    }
  }, [soundEnabled]);

  return (
    <>
      <audio 
        ref={bgAudioRef} 
        src="/Recording_68.m4a" 
        loop 
        preload="auto" 
        style={{ display: 'none' }} 
      />
      <audio 
        ref={openAudioRef} 
        src="/Open page.m4a" 
        preload="auto" 
        style={{ display: 'none' }} 
      />
      <audio 
        ref={closeAudioRef} 
        src="/Close page.m4a" 
        preload="auto" 
        style={{ display: 'none' }} 
      />
    </>
  );
};
