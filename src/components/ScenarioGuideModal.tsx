import React, { useState, useEffect, useMemo } from 'react';
import { 
  getFloorGuide, 
  getLocalizedFloorGuide, 
  HINT_LEVELS, 
  HintLevel, 
  FloorKeyLocation, 
  FloorHazard, 
  FloorMonsterTip 
} from '../data/scenarioFloorGuides';
import { useGuidanceLevel } from '../utils/guidanceManager';
import { WIZARDRY_SCENARIOS, getLocalizedScenario } from '../data/scenariosCatalog';
import { useI18n } from '../i18n';
import {
  Compass,
  X,
  Shield,
  Skull,
  Sparkles,
  Eye,
  EyeOff,
  Flame,
  Key,
  DoorOpen,
  MapPin,
  AlertTriangle,
  BookOpen,
  Zap,
  CheckCircle2,
  Navigation,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ScenarioGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenarioId: string;
  currentFloor?: number;
  initialFloor?: number;
}

export const ScenarioGuideModal: React.FC<ScenarioGuideModalProps> = ({
  isOpen,
  onClose,
  activeScenarioId,
  currentFloor,
  initialFloor
}) => {
  const { lang } = useI18n();
  const [guidanceLevel, setGuidanceLevel] = useGuidanceLevel();
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const scenarioMeta = useMemo(() => {
    const raw = WIZARDRY_SCENARIOS.find(s => s.id === activeScenarioId) || WIZARDRY_SCENARIOS[0];
    return getLocalizedScenario(raw, lang);
  }, [activeScenarioId, lang]);

  const totalFloors = scenarioMeta.floors || 10;
  const [selectedFloor, setSelectedFloor] = useState<number>(() => {
    if (currentFloor && currentFloor >= 1 && currentFloor <= totalFloors) return currentFloor;
    if (initialFloor && initialFloor >= 1 && initialFloor <= totalFloors) return initialFloor;
    return 1;
  });

  useEffect(() => {
    if (isOpen) {
      if (initialFloor && initialFloor >= 1 && initialFloor <= totalFloors) {
        setSelectedFloor(initialFloor);
      } else if (currentFloor && currentFloor >= 1 && currentFloor <= totalFloors) {
        setSelectedFloor(currentFloor);
      }
    }
  }, [isOpen, currentFloor, initialFloor, totalFloors]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const rawGuide = useMemo(() => {
    return getFloorGuide(activeScenarioId, selectedFloor);
  }, [activeScenarioId, selectedFloor]);

  const guide = useMemo(() => {
    return getLocalizedFloorGuide(rawGuide, lang);
  }, [rawGuide, lang]);

  if (!isOpen) return null;

  const currentLevelMeta = HINT_LEVELS[guidanceLevel];

  const floorNumbers = Array.from({ length: totalFloors }, (_, i) => i + 1);

  return (
    <div 
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md ${isMaximized ? 'p-0' : 'p-2 md:p-4'} animate-fadeIn`}
      onClick={onClose}
    >
      <div 
        className={`${isMaximized ? 'w-screen h-screen max-w-none max-h-none rounded-none border-0' : 'w-full max-w-5xl max-h-[92vh] rounded-2xl border border-amber-600/50'} bg-slate-950 shadow-2xl flex flex-col overflow-hidden text-slate-100 transition-all duration-200`}
        onClick={e => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 md:px-6 md:py-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-serif font-black text-amber-300 tracking-wide">
                  {lang === 'fr' ? "Oracle & Guide Tactique des Niveaux" : "Oracle & Floor Strategy Guide"}
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {scenarioMeta.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'fr'
                  ? "Conseils de survie, cartographie, faiblesses des monstres et secrets issus des manuels originaux"
                  : "Tactical tips, bestiary counters, maze secrets, and dungeon lore from original player manuals"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized(prev => !prev)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title={isMaximized 
                ? (lang === 'fr' ? 'Réduire la fenêtre' : 'Restore window') 
                : (lang === 'fr' ? 'Agrandir la fenêtre (Plein écran)' : 'Maximize window')}
            >
              {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title={lang === 'fr' ? 'Fermer (Échap)' : 'Close (Esc)'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GUIDANCE LEVEL SELECTOR STRIP */}
        <div className="bg-slate-900/70 border-b border-slate-800/80 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-slate-200">
              {lang === 'fr' ? "Niveau de Guidage Actif :" : "Active Guidance Level:"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(['OFF', 'SUBTLE', 'STRATEGY', 'EXHAUSTIVE'] as HintLevel[]).map(lvlKey => {
              const meta = HINT_LEVELS[lvlKey];
              const isSelected = guidanceLevel === lvlKey;
              return (
                <button
                  key={lvlKey}
                  onClick={() => setGuidanceLevel(lvlKey)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                    isSelected
                      ? `${meta.colorClass} ring-1 ring-amber-400/50 shadow-md`
                      : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title={lang === 'fr' ? meta.descriptionFr : meta.descriptionEn}
                >
                  {lvlKey === 'OFF' && <EyeOff className="w-3.5 h-3.5" />}
                  {lvlKey === 'SUBTLE' && <Eye className="w-3.5 h-3.5" />}
                  {lvlKey === 'STRATEGY' && <Shield className="w-3.5 h-3.5" />}
                  {lvlKey === 'EXHAUSTIVE' && <Sparkles className="w-3.5 h-3.5" />}
                  <span>{lang === 'fr' ? meta.badgeFr : meta.badgeEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FLOOR SELECTOR TABS */}
        <div className="bg-slate-950 px-4 md:px-6 py-2.5 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-thin shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1.5">
            {lang === 'fr' ? "Étages :" : "Floors:"}
          </span>
          {floorNumbers.map(fNum => {
            const isSelected = selectedFloor === fNum;
            const isCurrent = currentFloor === fNum;
            return (
              <button
                key={fNum}
                onClick={() => setSelectedFloor(fNum)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-amber-600 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{lang === 'fr' ? `Sous-sol ${fNum}` : `Floor ${fNum}`}</span>
                {isCurrent && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-slate-950 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* MODAL MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {/* FLOOR TITLE BANNER */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  {lang === 'fr' ? `Étage ${selectedFloor} / ${totalFloors}` : `Floor ${selectedFloor} / ${totalFloors}`}
                </span>
                {currentFloor === selectedFloor && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-sans text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Navigation className="w-3 h-3 fill-current" />
                    <span>{lang === 'fr' ? "Votre position actuelle" : "Your current location"}</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg md:text-xl font-serif font-black text-white mt-1">
                {guide.title}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {guide.subtitle}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-right shrink-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                {lang === 'fr' ? "Niveau d'escouade conseillé" : "Recommended Party Level"}
              </div>
              <div className="text-sm font-bold text-amber-300 mt-0.5">
                {guide.recommendedLevel}
              </div>
            </div>
          </div>

          {/* VIEW ACCORDING TO GUIDANCE LEVEL */}
          {guidanceLevel === 'OFF' ? (
            <div className="p-8 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-xl max-w-xl mx-auto my-6">
              <div className="p-3 bg-slate-800/80 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-slate-400">
                <EyeOff className="w-6 h-6" />
              </div>
              <h4 className="text-base font-serif font-bold text-white">
                {lang === 'fr' ? "Mode Puriste Rétro Actif" : "Purist Retro Mode Active"}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'fr'
                  ? "Vous avez choisi de jouer sans aide ni prophétie divine, comme sur micro-ordinateur Apple II en 1981. Pour afficher les objectifs tactiques, activez un des niveaux d'aide ci-dessus."
                  : "You have chosen to play without hints or divine divination, just like on the Apple II in 1981. Select a guidance tier above to reveal tactical briefings."}
              </p>
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => setGuidanceLevel('STRATEGY')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl transition"
                >
                  {lang === 'fr' ? "Activer le Mode Stratégique" : "Enable Strategic Mode"}
                </button>
              </div>
            </div>
          ) : guidanceLevel === 'SUBTLE' ? (
            /* SUBTLE / ATMOSPHERIC CLUES */
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="p-5 rounded-2xl bg-sky-950/30 border border-sky-600/40 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{lang === 'fr' ? "Murmure de l'Oracle" : "Whisper of the Oracle"}</span>
                </div>
                <blockquote className="text-sm md:text-base italic text-slate-200 border-l-2 border-sky-400 pl-4 py-1 leading-relaxed font-serif">
                  « {guide.subtleClue} »
                </blockquote>
                <p className="text-xs text-slate-400">
                  {lang === 'fr'
                    ? "En mode subtil, seuls les indices énigmatiques et les alertes de péril imminent vous sont révélés pour préserver l'exploration."
                    : "In subtle mode, only cryptic omens and immediate danger warnings are revealed to preserve pure exploration."}
                </p>
              </div>

              {/* Major Hazards only */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'fr' ? "Périls Cardinaux Détectés" : "Detected Major Perils"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {guide.hazards?.map((haz, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="font-bold text-rose-300 flex items-center justify-between">
                        <span>{haz.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/40">
                          {haz.severity}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] leading-relaxed">{haz.warning}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* STRATEGY & EXHAUSTIVE MODES */
            <div className="space-y-5">
              {/* SUMMARY & OBJECTIVES */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'fr' ? "Aperçu & Enjeux de l'Étage" : "Floor Overview & Stakes"}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {guide.summary}
                  </p>
                  {guide.subtleClue && (
                    <div className="mt-2 text-xs italic text-amber-200/90 bg-amber-950/30 p-2.5 rounded-lg border border-amber-600/30 font-serif">
                      « {guide.subtleClue} »
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'fr' ? "Objectifs Stratégiques Clés" : "Key Strategic Objectives"}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {guide.objectives?.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 shrink-0 font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* TACTICAL TIPS & SPELL RECOMMENDATIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>{lang === 'fr' ? "Conseils de Combat & Survie" : "Combat & Survival Tactics"}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {guide.strategicTips?.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>{lang === 'fr' ? "Sorts Clés Recommandés" : "Key Spells to Memorize"}</span>
                  </div>
                  <div className="space-y-1.5">
                    {guide.spellRecommendations?.map((sp, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-purple-200">
                        ⚡ {sp}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MONSTER BESTIARY COUNTERS */}
              {guide.monsterTips && guide.monsterTips.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Skull className="w-4 h-4 text-rose-400" />
                    <span>{lang === 'fr' ? "Menaces du Bestiaire & Contre-Mesures" : "Bestiary Threats & Counter-Tactics"}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {guide.monsterTips.map((m, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-rose-950/60 space-y-1 text-xs">
                        <div className="font-bold text-amber-300 font-serif text-sm">
                          {m.monsterName}
                        </div>
                        <div className="text-rose-300 text-[11px]">
                          <strong>{lang === 'fr' ? "Danger :" : "Threat:"}</strong> {m.threat}
                        </div>
                        <div className="text-emerald-300 text-[11px]">
                          <strong>{lang === 'fr' ? "Riposte :" : "Counter:"}</strong> {m.counterStrategy}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HAZARDS & TRAPS */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'fr' ? "Pièges & Anomalies du Labyrinthe" : "Hazards & Maze Anomalies"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {guide.hazards?.map((haz, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="font-bold text-rose-300 flex items-center justify-between">
                        <span>{haz.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/40">
                          {haz.severity}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] leading-relaxed">{haz.warning}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EXHAUSTIVE COORDINATES MATRIX (ONLY IN EXHAUSTIVE MODE) */}
              {guidanceLevel === 'EXHAUSTIVE' ? (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-700/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'fr' ? "Coordonnées Exactes & Secrets du Labyrinthe" : "Exact Coordinates & Secret Matrix"}</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      {lang === 'fr' ? "Mode Exhaustif Débloqué" : "Exhaustive Mode Active"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {guide.keyLocations?.map((loc, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1 hover:border-emerald-600/50 transition">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate">{loc.name}</span>
                          <span className="font-mono text-xs font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                            ({loc.x}, {loc.y})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {loc.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {lang === 'fr'
                        ? "Envie de voir les coordonnées exactes (X, Y) des clés, escaliers et téléporteurs ?"
                        : "Want to unlock exact (X, Y) coordinates for all keys, stairs, and teleporters?"}
                    </span>
                  </div>
                  <button
                    onClick={() => setGuidanceLevel('EXHAUSTIVE')}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition shrink-0"
                  >
                    {lang === 'fr' ? "Passer en Guide Complet" : "Switch to Exhaustive"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 px-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {lang === 'fr' 
                ? `Scénario actif : ${scenarioMeta.title} (${totalFloors} étages)` 
                : `Active Scenario: ${scenarioMeta.title} (${totalFloors} floors)`}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
          >
            {lang === 'fr' ? "Fermer" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
