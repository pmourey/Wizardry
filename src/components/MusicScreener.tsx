import React, { useState, useEffect, useRef } from 'react';
import { Music, Youtube, ExternalLink, SkipForward, X, Info, Sparkles } from 'lucide-react';
import { music, ActiveTrackInfo } from '../utils/musicManager';

interface MusicScreenerProps {
  lang?: 'en' | 'fr';
}

export const MusicScreener: React.FC<MusicScreenerProps> = ({ lang = 'en' }) => {
  const [trackInfo, setTrackInfo] = useState<ActiveTrackInfo | null>(() => music.getActiveTrackInfo());
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showCopyrightDetails, setShowCopyrightDetails] = useState<boolean>(false);
  const hideTimerRef = useRef<any>(null);

  useEffect(() => {
    const handleTrackChange = (e: Event) => {
      const customEvent = e as CustomEvent<ActiveTrackInfo>;
      if (customEvent.detail) {
        setTrackInfo(customEvent.detail);
        setIsExpanded(true);
        setIsDismissed(false);
        resetAutoHideTimer();
      }
    };

    window.addEventListener('wizardry_track_change', handleTrackChange);
    return () => window.removeEventListener('wizardry_track_change', handleTrackChange);
  }, []);

  const resetAutoHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 7000);
  };

  useEffect(() => {
    if (isExpanded) {
      resetAutoHideTimer();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isExpanded]);

  const handleMouseEnter = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  const handleMouseLeave = () => {
    if (isExpanded && !showCopyrightDetails) {
      resetAutoHideTimer();
    }
  };

  if (isDismissed || !trackInfo) return null;

  const isLeoJean = trackInfo.isExternalArtist;
  const moodDesc = lang === 'fr' ? trackInfo.styleMoodFr : trackInfo.styleMoodEn;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-30 select-none max-w-[calc(100vw-1rem)] sm:max-w-md pointer-events-auto transition-all duration-300"
    >
      {/* Minimized Pill View */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/85 hover:bg-slate-900/95 border border-amber-500/40 hover:border-amber-400 rounded-full text-slate-300 hover:text-white text-[11px] font-mono shadow-xl backdrop-blur-md transition active:scale-95 group"
          title={lang === 'fr' ? 'Détails du morceau & crédits musicaux' : 'Music track details & credits'}
        >
          <Music className="w-3 h-3 text-amber-400 animate-pulse group-hover:scale-110 transition" />
          <span className="font-semibold text-amber-300 truncate max-w-[170px] sm:max-w-[220px]">
            {trackInfo.shortTitle}
          </span>
          <span className="text-[9px] text-slate-400">· {trackInfo.artist}</span>
        </button>
      ) : (
        /* Expanded Screener Card */
        <div className="bg-slate-950/90 border border-amber-500/50 rounded-xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md space-y-2 animate-fadeIn text-xs">
          {/* Header row: Status & Actions */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-400/90">
                {lang === 'fr' ? 'Ambiance Donjon' : 'Dungeon Soundtrack'}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Skip to Next Dungeon Track */}
              <button
                onClick={() => music.playNextDungeonTrack()}
                className="p-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition active:scale-95"
                title={lang === 'fr' ? 'Morceau suivant' : 'Next track'}
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                title={lang === 'fr' ? 'Réduire' : 'Minimize'}
              >
                <span className="text-xs font-bold leading-none px-0.5">_</span>
              </button>

              {/* Dismiss */}
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
                title={lang === 'fr' ? 'Masquer' : 'Dismiss'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Track Details */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <h4 className="font-bold text-white text-xs sm:text-sm tracking-wide">
                {trackInfo.shortTitle}
              </h4>
              <span className="text-[11px] text-amber-300 font-semibold shrink-0">
                — {trackInfo.artist}
              </span>
            </div>

            {moodDesc && (
              <p className="text-[11px] text-slate-400 italic">
                {moodDesc}
              </p>
            )}
          </div>

          {/* Creator channel & legal broadcast disclaimer (for Léo Jean) */}
          {isLeoJean && (
            <div className="pt-1 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {trackInfo.youtubeUrl && (
                  <a
                    href={trackInfo.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 rounded text-[11px] font-bold text-rose-300 hover:text-white transition shadow-sm active:scale-95"
                    title={lang === 'fr' ? 'Visiter la chaîne YouTube officielle de Léo Jean' : "Visit Léo Jean's official YouTube channel"}
                  >
                    <Youtube className="w-3.5 h-3.5 text-rose-400 fill-current" />
                    <span>YouTube @LeoJean890</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-70 ml-0.5" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setShowCopyrightDetails(prev => !prev)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-amber-300 transition"
                  title={lang === 'fr' ? 'Consulter les mentions légales et droits d’auteur' : 'View legal copyright & broadcasting terms'}
                >
                  <Info className="w-3 h-3 text-slate-400" />
                  <span>{lang === 'fr' ? 'Mentions légales' : 'Broadcaster terms'}</span>
                </button>
              </div>

              {/* Collapsible / toggled copyright & broadcaster protection text */}
              {showCopyrightDetails && (
                <div className="p-2 bg-slate-900/95 border border-slate-700/80 rounded-lg text-[10px] text-slate-300 leading-relaxed space-y-1 animate-fadeIn">
                  <p>
                    {lang === 'fr' ? trackInfo.copyrightNoticeFr : trackInfo.copyrightNoticeEn}
                  </p>
                  <p className="text-slate-400 italic text-[9px]">
                    {lang === 'fr' 
                      ? 'Projet fan-remaster à but non-lucratif. Tous droits de propriété intellectuelle des compositions et enregistrements restent la propriété exclusive de Léo Jean.'
                      : 'Non-commercial fan-remaster project. All intellectual property rights of the compositions and master recordings remain the exclusive property of Léo Jean.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
