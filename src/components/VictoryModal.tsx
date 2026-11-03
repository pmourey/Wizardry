import React from 'react';
import { Award, Crown, Sparkles, CheckCircle2 } from 'lucide-react';
import { TCharacter } from '../types/wizardry';
import { getCharacterChevrons } from '../utils/awards';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  honoredHeroes: TCharacter[];
  expBonus: number;
  language?: 'fr' | 'en';
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  honoredHeroes,
  expBonus,
  language = 'fr'
}) => {
  if (!isOpen) return null;

  const isEn = language === 'en';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-amber-950/90 via-slate-950 to-slate-950 border-2 border-amber-500/70 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.35)] overflow-hidden my-auto">
        {/* Glow corner effects */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-900/60 via-amber-700/40 to-amber-900/60 border-b border-amber-500/40 p-4 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/20 border border-amber-400/50 mb-2 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Crown className="w-8 h-8 text-amber-300 animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-widest text-amber-200 uppercase drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
            {isEn ? '*** CONGRATULATIONS ***' : '*** FÉLICITATIONS ***'}
          </h1>
          <p className="text-xs sm:text-sm text-amber-300/80 font-mono mt-1">
            {isEn
              ? 'THE QUEST IS COMPLETE · THE MAD OVERLORD REJOICES'
              : 'LA QUÊTE EST ACCOMPLIE · LE SEIGNEUR TREBOR EXULTE'}
          </p>
        </div>

        {/* Main Content & Authentic Pascal Speech */}
        <div className="p-5 sm:p-7 space-y-5 text-center">
          {/* Authentic Trebor Proclamation Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-black/60 border border-amber-500/30 text-left font-mono text-xs sm:text-sm leading-relaxed text-amber-100/90 shadow-inner space-y-3">
            {isEn ? (
              <>
                <p>
                  YOU HAVE COMPLETED YOUR QUEST AND THE <span className="text-amber-400 font-bold">AMULET OF WERDNA</span> IS NOW
                  SAFELY BACK IN THE HANDS OF YOUR BENEFICENT RULER, <span className="text-amber-300 font-bold">TREBOR</span>.
                </p>
                <p>
                  IN RETURN FOR THIS GLORIOUS SERVICE, HE GRANTS YOU A BOON OF{' '}
                  <span className="text-emerald-400 font-bold">+{expBonus.toLocaleString()} EXPERIENCE POINTS</span> EACH!
                </p>
                <p>
                  ADDITIONALLY, YOU WILL BE INITIATED INTO THE <span className="text-amber-300 font-bold">OVERLORD'S HONOR GUARD</span> AND
                  THUS WILL BE ENTITLED TO WEAR THE <span className="text-amber-400 font-bold text-base">&gt; CHEVRON</span> OF THIS RANK EVERMORE.
                </p>
                <p className="text-slate-400 text-[11px] italic border-t border-slate-800/80 pt-2">
                  Trebor securely stores the Amulet in the Royal Citadel Vault, and exceptionally allows your party to keep all personal weapons and equipment!
                </p>
              </>
            ) : (
              <>
                <p>
                  VOUS AVEZ ACCOMPLI VOTRE QUÊTE ET L'<span className="text-amber-400 font-bold">AMULETTE DE WERDNA</span> EST
                  DÉSORMAIS RESTITUÉE ENTRE LES MAINS DE VOTRE SUZERAIN BIENVEILLANT, LE <span className="text-amber-300 font-bold">SEIGNEUR TREBOR</span>.
                </p>
                <p>
                  EN RÉCOMPENSE DE CET IMMENSE EXPLOIT, IL VOUS ACCORDE UN DON ROYAL DE{' '}
                  <span className="text-emerald-400 font-bold">+{expBonus.toLocaleString()} POINTS D'EXPÉRIENCE</span> CHACUN !
                </p>
                <p>
                  DE PLUS, VOUS ÊTES INITIÉS AU SEIN DE LA PRESTIGIEUSE <span className="text-amber-300 font-bold">GARDE D'HONNEUR DU SUZERAIN</span> ET
                  PORTEREZ DÉSORMAIS LE <span className="text-amber-400 font-bold text-base">CHEVRON (&gt;)</span> DE CE RANG POUR TOUJOURS.
                </p>
                <p className="text-slate-400 text-[11px] italic border-t border-slate-800/80 pt-2">
                  Trebor dépose l'Amulette dans la chambre forte du Trésor Royal, et vous accorde le privilège d'élite de conserver l'ensemble de votre équipement !
                </p>
              </>
            )}
          </div>

          {/* List of Honored Heroes */}
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{isEn ? "The Overlord's Honor Guard Roster :" : "Membres de la Garde d'Honneur de Trebor :"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {honoredHeroes.map((hero, idx) => {
                const chevrons = getCharacterChevrons(hero) || '>';
                return (
                  <div
                    key={hero.id || idx}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/40 flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-amber-400 text-sm bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
                        "{chevrons}"
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold font-serif text-white text-xs sm:text-sm truncate block">
                          {hero.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {hero.race} {hero.class} · Niv.{hero.charLevel}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                      +{expBonus.toLocaleString()} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-slate-950 font-bold font-serif text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.5)] transition active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEn ? 'Enter into Legend (Castle of Trebor)' : 'Entrer dans la Légende (Château de Trebor)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
