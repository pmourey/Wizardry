import React from 'react';

// Official monster pictures extracted from the scenario disk (scripts/extract_pgmo.py)
const PICTURES = import.meta.glob('../assets/monsters/pic*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export const getMonsterPictureUrl = (picId: number): string | undefined =>
  PICTURES[`../assets/monsters/pic${picId}.png`];

interface MonsterPictureProps {
  picId: number;
  alt: string;
  className?: string;
}

export const MonsterPicture: React.FC<MonsterPictureProps> = ({ picId, alt, className = '' }) => {
  const url = getMonsterPictureUrl(picId);
  if (!url) return null;
  return (
    <img
      src={url}
      alt={alt}
      width={80}
      height={50}
      className={className}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
