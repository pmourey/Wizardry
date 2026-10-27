import React, { useState } from 'react';
import { 
  TCharacter, 
  TSpell 
} from '../types/wizardry';
import { 
  CombatGroup, 
  PlayerCombatAction, 
  executeCombatRound 
} from '../engine/combatEngine';
import { SPELLS } from '../data/wizardryData';
import { sounds } from '../utils/soundEffects';
import { 
  Swords, 
  ShieldAlert, 
  Sparkles, 
  Footprints, 
  RotateCcw, 
  Crosshair,
  Skull,
  Zap,
  CheckCircle2,
  Biohazard,
  Moon,
  MicOff
} from 'lucide-react';
import { getActiveStatusEffects } from '../engine/statusSystem';

interface CombatViewProps {
  party: TCharacter[];
  setParty: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  groups: CombatGroup[];
  surprise: 'PARTY' | 'MONSTERS' | 'NONE';
  onCombatEnd: (won: boolean, fled: boolean, alarmTriggered: boolean) => void;
}

export const CombatView: React.FC<CombatViewProps> = ({
  party,
  setParty,
  groups,
  surprise,
  onCombatEnd
}) => {
  const [currentHeroIdx, setCurrentHeroIdx] = useState<number>(0);
  const [actions, setActions] = useState<PlayerCombatAction[]>([]);
  const [roundLog, setRoundLog] = useState<string[]>([]);
  const [selectingSpell, setSelectingSpell] = useState<boolean>(false);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  // Living heroes who can choose actions
  const livingHeroes = party.filter(h => h.status === 'OK' && h.hpLeft > 0);
  const activeHero = livingHeroes[currentHeroIdx];

  const handleSelectAction = (type: PlayerCombatAction['actionType'], spellId?: number, targetGrpIdx?: number) => {
    sounds.playTurn();
    const heroIndexInParty = party.findIndex(p => p.id === activeHero.id);

    const newAction: PlayerCombatAction = {
      charIndex: heroIndexInParty,
      actionType: type,
      targetGroupIndex: targetGrpIdx ?? 0,
      spellId
    };

    const nextActions = [...actions, newAction];
    setActions(nextActions);
    setSelectingSpell(false);

    if (currentHeroIdx + 1 < livingHeroes.length) {
      setCurrentHeroIdx(currentHeroIdx + 1);
    } else {
      // All heroes chose actions -> resolve combat round
      resolveRound(nextActions);
    }
  };

  const resolveRound = (finalActions: PlayerCombatAction[]) => {
    setIsResolving(true);
    sounds.playHit();

    const result = executeCombatRound(party, groups, finalActions, surprise);
    setParty([...party]);
    setRoundLog(result.combatLog);

    if (result.fled) {
      setTimeout(() => onCombatEnd(false, true, false), 1500);
      return;
    }

    if (!result.partyAlive) {
      sounds.playBell();
      setTimeout(() => onCombatEnd(false, false, false), 2000);
      return;
    }

    if (!result.monstersAlive) {
      sounds.playFanfare();
      setTimeout(() => onCombatEnd(true, false, result.alarmTriggered), 2000);
      return;
    }

    // Next round reset
    setTimeout(() => {
      setActions([]);
      setCurrentHeroIdx(0);
      setIsResolving(false);
    }, 1200);
  };

  // Learned combat spells for active hero
  const availableSpells = activeHero
    ? SPELLS.filter(sp => 
        sp.combat && 
        activeHero.spellsKnown[sp.id] && 
        (sp.spellType === 'MAGE' ? (activeHero.mageSpells[sp.tier] > 0) : (activeHero.priestSpells[sp.tier] > 0))
      )
    : [];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 select-none overflow-y-auto">
      {/* Combat Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-950/80 border border-red-600/40 rounded-lg text-red-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Engagement en Combat !
            </h2>
            <p className="text-xs text-slate-400">
              {surprise === 'PARTY' ? '⚡ Vous surprenez les monstres !' : surprise === 'MONSTERS' ? '⚠️ Les monstres vous ont pris par surprise !' : 'Combat au corps-à-corps dans les ténèbres'}
            </p>
          </div>
        </div>
      </div>

      {/* Battlefield & Monster Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
        {groups.map((grp, gIdx) => (
          <div 
            key={gIdx}
            className={`p-4 rounded-xl border flex flex-col justify-between transition ${grp.aliveCount > 0 ? 'bg-slate-900/80 border-slate-700/80 shadow-md' : 'bg-slate-950 border-slate-800/40 opacity-40'}`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400">GROUPE #{gIdx + 1}</span>
                <span className="text-xs font-semibold text-slate-300">
                  {grp.aliveCount}/{grp.count} Vivant(s)
                </span>
              </div>
              <div className="py-3 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center text-amber-400 text-2xl font-serif font-bold shadow-inner mb-2">
                  {grp.monster.name[0]}
                </div>
                <div className="font-bold text-sm text-white">
                  {grp.identified ? grp.monster.name : grp.monster.nameUnknown}
                </div>
                <div className="text-xs text-slate-400">
                  Niveau {grp.monster.level} · CA {grp.monster.ac}
                </div>
              </div>
            </div>

            {/* Living status pill badges */}
            <div className="flex flex-wrap gap-1 justify-center pt-2">
              {grp.instances.map((inst, iIdx) => (
                <div 
                  key={iIdx}
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${inst.status === 'OK' ? 'bg-emerald-600 text-white' : 'bg-red-950 text-red-400'}`}
                  title={`PV: ${inst.hpLeft}/${inst.maxHp} [${inst.status}]`}
                >
                  {inst.status === 'OK' ? (iIdx + 1) : '†'}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Party Status Overview Strip in Combat */}
      <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl max-w-4xl mx-auto w-full mb-4">
        <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
          <span>Escouade en Combat ({party.filter(p => p.status !== 'DEAD' && p.status !== 'ASHES').length}/{party.length} debout)</span>
          <span className="text-[10px] text-slate-500">Statuts & Afflictions en temps réel</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {party.map((hero, hIdx) => {
            const effs = getActiveStatusEffects(hero);
            const isTurn = !isResolving && activeHero && activeHero.id === hero.id;

            return (
              <div 
                key={hero.id}
                className={`p-2 rounded-lg border text-xs flex flex-col justify-between transition ${
                  isTurn 
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-md ring-1 ring-amber-500/50' 
                    : hero.status === 'DEAD' || hero.status === 'ASHES'
                    ? 'bg-slate-950 border-red-950/60 opacity-60'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-bold text-white">
                    <span className="truncate">{hero.name}</span>
                    <span className="text-[9px] text-amber-400 font-mono">N{hero.charLevel}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>{hero.class}</span>
                    <span>CA {hero.armorClass}</span>
                  </div>
                </div>

                <div className="pt-1.5">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-slate-400">PV:</span>
                    <span className={hero.hpLeft < hero.hpMax / 3 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {hero.hpLeft}/{hero.hpMax}
                    </span>
                  </div>
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-1 pt-1 min-h-[18px]">
                    {effs.map(e => (
                      <span 
                        key={e.id}
                        className={`text-[9px] font-bold px-1 py-0.2 rounded border ${e.bgColor} ${e.borderColor} ${e.color}`}
                        title={e.description}
                      >
                        {e.badge}
                      </span>
                    ))}
                    {effs.length === 0 && (
                      <span className="text-[9px] text-emerald-500 font-medium">OK</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Command Panel for Active Hero */}
      {!isResolving && activeHero && (
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-4 max-w-3xl mx-auto w-full shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Ordre #{currentHeroIdx + 1}/{livingHeroes.length} :
              </span>
              <span className="text-sm font-bold text-white">
                {activeHero.name} ({activeHero.class} · CA {activeHero.armorClass} · {activeHero.hpLeft}/{activeHero.hpMax} PV)
              </span>
            </div>
            {currentHeroIdx > 0 && (
              <button
                onClick={() => {
                  setCurrentHeroIdx(currentHeroIdx - 1);
                  setActions(actions.slice(0, -1));
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Revenir
              </button>
            )}
          </div>

          {/* Active Hero Silence Alert */}
          {activeHero.silencedRounds && activeHero.silencedRounds > 0 && (
            <div className="px-3 py-1.5 bg-cyan-950/50 border border-cyan-500/40 rounded-lg text-xs text-cyan-300 flex items-center gap-2">
              <MicOff className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
              <span>{activeHero.name} est sous l'effet du silence magique MONTINO (sorts bloqués pour encore {activeHero.silencedRounds} tour(s)).</span>
            </div>
          )}

          {!selectingSpell ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {/* Fight: only front rank or with ranged */}
              <button
                onClick={() => handleSelectAction('FIGHT', undefined, 0)}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg flex flex-col items-center gap-1 text-xs font-bold transition"
              >
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Attaquer</span>
              </button>

              <button
                onClick={() => setSelectingSpell(true)}
                disabled={availableSpells.length === 0 || (activeHero.silencedRounds !== undefined && activeHero.silencedRounds > 0)}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg flex flex-col items-center gap-1 text-xs font-bold transition disabled:opacity-30 disabled:pointer-events-none"
                title={activeHero.silencedRounds && activeHero.silencedRounds > 0 ? "Sous l'effet du silence magique MONTINO !" : undefined}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>
                  {activeHero.silencedRounds && activeHero.silencedRounds > 0 
                    ? `Silence (${activeHero.silencedRounds}T)` 
                    : `Sorts (${availableSpells.length})`}
                </span>
              </button>

              <button
                onClick={() => handleSelectAction('PARRY')}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg flex flex-col items-center gap-1 text-xs font-bold transition"
              >
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <span>Parade (-2 CA)</span>
              </button>

              {(activeHero.class === 'PRIEST' || activeHero.class === 'BISHOP' || activeHero.class === 'LORD') && (
                <button
                  onClick={() => handleSelectAction('DISPELL', undefined, 0)}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg flex flex-col items-center gap-1 text-xs font-bold transition"
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Exorcisme</span>
                </button>
              )}

              <button
                onClick={() => handleSelectAction('RUN')}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg flex flex-col items-center gap-1 text-xs font-bold transition"
              >
                <Footprints className="w-4 h-4 text-emerald-400" />
                <span>Fuir</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300">Sélectionnez un sort magique :</span>
                <button
                  onClick={() => setSelectingSpell(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableSpells.map(sp => (
                  <button
                    key={sp.id}
                    onClick={() => handleSelectAction('SPELL', sp.id, 0)}
                    className="p-2.5 bg-slate-800 hover:bg-purple-950/50 border border-slate-700 hover:border-purple-500 rounded-lg text-left text-xs transition"
                  >
                    <div className="font-bold text-white flex justify-between">
                      <span>{sp.name}</span>
                      <span className="text-[10px] text-purple-400">T{sp.tier}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{sp.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Combat Resolution Logs */}
      {roundLog.length > 0 && (
        <div className="mt-4 bg-black/60 border border-slate-800 p-4 rounded-xl max-w-3xl mx-auto w-full space-y-1.5 font-mono text-xs text-slate-300">
          <div className="text-amber-400 font-bold border-b border-slate-800 pb-1 mb-2">
            Journal de Combat :
          </div>
          {roundLog.map((line, lIdx) => (
            <div key={lIdx} className="leading-relaxed">
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
