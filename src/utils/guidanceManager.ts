import { useState, useEffect } from 'react';
import { HintLevel, HINT_LEVELS, HintLevelMeta } from '../data/scenarioFloorGuides';

const GUIDANCE_STORAGE_KEY = 'wiz_guidance_level';

export function getGuidanceLevel(): HintLevel {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(GUIDANCE_STORAGE_KEY);
    if (saved === 'OFF' || saved === 'SUBTLE' || saved === 'STRATEGY' || saved === 'EXHAUSTIVE') {
      return saved as HintLevel;
    }
  }
  return 'STRATEGY'; // Default to strategic advice per user request
}

export function setGuidanceLevel(level: HintLevel): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUIDANCE_STORAGE_KEY, level);
    window.dispatchEvent(new CustomEvent('wizardry_guidance_level_change', { detail: level }));
  }
}

export function useGuidanceLevel(): [HintLevel, (level: HintLevel) => void, HintLevelMeta] {
  const [level, setLevelState] = useState<HintLevel>(getGuidanceLevel);

  useEffect(() => {
    const handleLevelChange = (e: Event) => {
      const customEvent = e as CustomEvent<HintLevel>;
      if (customEvent.detail && HINT_LEVELS[customEvent.detail]) {
        setLevelState(customEvent.detail);
      }
    };
    window.addEventListener('wizardry_guidance_level_change', handleLevelChange);
    return () => window.removeEventListener('wizardry_guidance_level_change', handleLevelChange);
  }, []);

  const changeLevel = (newLevel: HintLevel) => {
    setLevelState(newLevel);
    setGuidanceLevel(newLevel);
  };

  return [level, changeLevel, HINT_LEVELS[level]];
}
