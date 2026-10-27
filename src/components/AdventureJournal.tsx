import React, { useState, useMemo } from 'react';
import { AdventureLogEvent, AdventureLogCategory } from '../types/wizardry';
import { 
  ScrollText, 
  Swords, 
  Sparkles, 
  Skull, 
  ShieldCheck, 
  Castle, 
  Clock, 
  MapPin, 
  Filter, 
  Trash2, 
  Compass,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface AdventureJournalProps {
  events: AdventureLogEvent[];
  onClearEvents?: () => void;
  onEnterMaze?: () => void;
}

export const AdventureJournal: React.FC<AdventureJournalProps> = ({
  events,
  onClearEvents,
  onEnterMaze
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AdventureLogCategory | 'ALL'>('ALL');

  // Display only the last 10 events as requested
  const recentEvents = useMemo(() => {
    return events.slice(0, 10);
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'ALL') return recentEvents;
    return recentEvents.filter(e => e.category === selectedCategory);
  }, [recentEvents, selectedCategory]);

  const categoryStats = useMemo(() => {
    const stats = {
      ALL: recentEvents.length,
      COMBAT: recentEvents.filter(e => e.category === 'COMBAT').length,
      DISCOVERY: recentEvents.filter(e => e.category === 'DISCOVERY').length,
      LOSS: recentEvents.filter(e => e.category === 'LOSS').length,
      RESCUE: recentEvents.filter(e => e.category === 'RESCUE').length,
      CASTLE: recentEvents.filter(e => e.category === 'CASTLE').length,
    };
    return stats;
  }, [recentEvents]);

  const getCategoryConfig = (category: AdventureLogCategory) => {
    switch (category) {
      case 'COMBAT':
        return {
          label: 'Combat',
          icon: Swords,
          badgeBg: 'bg-rose-950/80',
          badgeBorder: 'border-rose-600/60',
          badgeText: 'text-rose-400',
          glow: 'shadow-rose-950/20'
        };
      case 'DISCOVERY':
        return {
          label: 'Découverte',
          icon: Sparkles,
          badgeBg: 'bg-amber-950/80',
          badgeBorder: 'border-amber-500/60',
          badgeText: 'text-amber-400',
          glow: 'shadow-amber-950/20'
        };
      case 'LOSS':
        return {
          label: 'Perte',
          icon: Skull,
          badgeBg: 'bg-red-950/90',
          badgeBorder: 'border-red-600/80',
          badgeText: 'text-red-300',
          glow: 'shadow-red-950/30'
        };
      case 'RESCUE':
        return {
          label: 'Secours',
          icon: ShieldCheck,
          badgeBg: 'bg-emerald-950/80',
          badgeBorder: 'border-emerald-600/60',
          badgeText: 'text-emerald-400',
          glow: 'shadow-emerald-950/20'
        };
      case 'CASTLE':
      default:
        return {
          label: 'Château',
          icon: Castle,
          badgeBg: 'bg-sky-950/80',
          badgeBorder: 'border-sky-600/60',
          badgeText: 'text-sky-400',
          glow: 'shadow-sky-950/20'
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-400 shadow-lg shadow-amber-950/30 shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-black text-white tracking-wide">
                  Journal d'Aventures
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  10 Derniers Récits
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Chroniques officielles des hauts faits, victoires au combat, butins déterrés et drames essuyés par votre guilde dans les profondeurs de Trebor.
              </p>
            </div>
          </div>

          {onClearEvents && events.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Réinitialiser le journal d'aventures ?")) {
                  sounds.playTurn();
                  onClearEvents();
                }
              }}
              className="self-start sm:self-center px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
              title="Effacer l'historique du journal"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Effacer</span>
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-slate-800/80 mt-5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filtres :
          </span>

          <button
            onClick={() => { setSelectedCategory('ALL'); sounds.playTurn(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              selectedCategory === 'ALL'
                ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
            }`}
          >
            <span>Tous</span>
            <span className="text-[10px] opacity-75 font-mono">({categoryStats.ALL})</span>
          </button>

          <button
            onClick={() => { setSelectedCategory('COMBAT'); sounds.playTurn(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              selectedCategory === 'COMBAT'
                ? 'bg-rose-900/80 text-rose-200 border-rose-500 shadow-sm'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
            }`}
          >
            <Swords className="w-3 h-3 text-rose-400" />
            <span>Combats</span>
            <span className="text-[10px] opacity-75 font-mono">({categoryStats.COMBAT})</span>
          </button>

          <button
            onClick={() => { setSelectedCategory('DISCOVERY'); sounds.playTurn(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              selectedCategory === 'DISCOVERY'
                ? 'bg-amber-900/80 text-amber-200 border-amber-500 shadow-sm'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Découvertes</span>
            <span className="text-[10px] opacity-75 font-mono">({categoryStats.DISCOVERY})</span>
          </button>

          <button
            onClick={() => { setSelectedCategory('LOSS'); sounds.playTurn(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              selectedCategory === 'LOSS'
                ? 'bg-red-950 text-red-200 border-red-500 shadow-sm'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
            }`}
          >
            <Skull className="w-3 h-3 text-red-400" />
            <span>Pertes</span>
            <span className="text-[10px] opacity-75 font-mono">({categoryStats.LOSS})</span>
          </button>

          <button
            onClick={() => { setSelectedCategory('RESCUE'); sounds.playTurn(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              selectedCategory === 'RESCUE'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-500 shadow-sm'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Secours</span>
            <span className="text-[10px] opacity-75 font-mono">({categoryStats.RESCUE})</span>
          </button>

          <button
            onClick={() => { setSelectedCategory('CASTLE'); sounds.playTurn(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              selectedCategory === 'CASTLE'
                ? 'bg-sky-950 text-sky-200 border-sky-500 shadow-sm'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
            }`}
          >
            <Castle className="w-3 h-3 text-sky-400" />
            <span>Château</span>
            <span className="text-[10px] opacity-75 font-mono">({categoryStats.CASTLE})</span>
          </button>
        </div>
      </div>

      {/* Events Timeline List */}
      <div className="space-y-3.5">
        {filteredEvents.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500">
              <ScrollText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-bold text-slate-200">
                Aucun récit dans cette catégorie
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Vos aventuriers n'ont pas encore consigné d'événement correspondant. Aventurez-vous dans le labyrinthe !
              </p>
            </div>
            {onEnterMaze && (
              <button
                onClick={onEnterMaze}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition shadow-md"
              >
                Entrer dans le Donjon
              </button>
            )}
          </div>
        ) : (
          filteredEvents.map((event, idx) => {
            const config = getCategoryConfig(event.category);
            const Icon = config.icon;

            return (
              <div
                key={event.id}
                className="bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/90 rounded-xl p-4.5 transition duration-200 space-y-2.5 shadow-md group relative"
              >
                {/* Top Row: Category Badge + Timestamp + Coordinates */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 font-bold">
                      #{idx + 1}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1.5 ${config.badgeBg} ${config.badgeBorder} ${config.badgeText}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{config.label}</span>
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {event.timestamp} {event.dateStr ? `(${event.dateStr})` : ''}
                    </span>
                  </div>

                  {event.level !== undefined && (
                    <div className="flex items-center gap-1.5 text-[11px] bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800 text-amber-400/90 font-mono">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      <span>Niv. {event.level}</span>
                      {event.coordinates && (
                        <span className="text-slate-400">({event.coordinates.x}, {event.coordinates.y})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Event Title */}
                <div className="font-serif font-bold text-sm text-white group-hover:text-amber-300 transition">
                  {event.title}
                </div>

                {/* Event Narrative Body */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {event.description}
                </p>

                {/* Additional Details (XP, Loot, Trap, etc.) */}
                {event.details && (
                  <div className="p-2.5 bg-slate-950/60 border border-slate-800/70 rounded-lg text-[11px] text-amber-300/90 font-mono">
                    {event.details}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
