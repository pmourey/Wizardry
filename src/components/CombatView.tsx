import { MonsterPicture, getMonsterPictureUrl } from './MonsterPicture';
import React, { useState, useEffect } from 'react';
import { 
  TCharacter, 
  TSpell 
} from '../types/wizardry';
import { 
  CombatGroup, 
  PlayerCombatAction, 
  executeCombatRound,
  attemptPartyRun
} from '../engine/combatEngine';
import { SPELLS } from '../data/provingGroundsData';
import { CombatEffects, isFriendlySingleSpell } from '../engine/spellEngine';
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
  MicOff,
  Target
} from 'lucide-react';
import { getActiveStatusEffects } from '../engine/statusSystem';

interface CombatViewProps {
  party: TCharacter[];
  setParty: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  groups: CombatGroup[];
  surprise: 'PARTY' | 'MONSTERS' | 'NONE';
  mazeLevel?: number;
  acModifier?: number;
  onSpellEffects?: (effects: CombatEffects) => void;
  onCombatEnd: (won: boolean, fled: boolean, alarmTriggered: boolean, effects?: CombatEffects) => void;
}

export const CombatView: React.FC<CombatViewProps> = ({
  party,
  setParty,
  groups,
  surprise,
  mazeLevel = 1,
  acModifier = 0,
  onSpellEffects,
  onCombatEnd
}) => {
  const [pendingSpell, setPendingSpell] = useState<TSpell | null>(null);
  const acModifierRef = React.useRef(acModifier);
  acModifierRef.current = acModifier;

  // Temporary combat AC bonuses only last for one battle
  useEffect(() => {
    party.forEach(h => { h.combatAcMod = 0; });
    return () => { party.forEach(h => { h.combatAcMod = 0; }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentHeroIdx, setCurrentHeroIdx] = useState<number>(0);
  const [actions, setActions] = useState<PlayerCombatAction[]>([]);
  const [roundLog, setRoundLog] = useState<string[]>([]);
  const [selectingSpell, setSelectingSpell] = useState<boolean>(false);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  // Mutable round surprise state: surprise only lasts for Round 1!
  const [currentSurprise, setCurrentSurprise] = useState<'PARTY' | 'MONSTERS' | 'NONE'>(surprise);

  // Target group selection: default to first group that has living monsters
  const [selectedTargetGroupIdx, setSelectedTargetGroupIdx] = useState<number>(() => {
    const firstAlive = groups.findIndex(g => g.instances.some(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0));
    return firstAlive >= 0 ? firstAlive : 0;
  });

  // Keep target group pointing to a living group
  useEffect(() => {
    const isCurrentTargetAlive = groups[selectedTargetGroupIdx]?.instances.some(
      i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0
    );
    if (!isCurrentTargetAlive) {
      const firstAlive = groups.findIndex(g => g.instances.some(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0));
      if (firstAlive >= 0) {
        setSelectedTargetGroupIdx(firstAlive);
      }
    }
  }, [groups, selectedTargetGroupIdx]);

  // Living heroes who are conscious (OK) and can choose actions
  const livingHeroes = party.filter(h => h.status === 'OK' && h.hpLeft > 0);
  const anyHeroAlive = party.some(h => h.status !== 'DEAD' && h.status !== 'ASHES' && h.hpLeft > 0);
  const allHelpless = anyHeroAlive && livingHeroes.length === 0;

  const safeHeroIdx = Math.min(currentHeroIdx, Math.max(0, livingHeroes.length - 1));
  const activeHero = livingHeroes[safeHeroIdx];

  const handleSelectAction = (type: PlayerCombatAction['actionType'], spellId?: number, targetGrpIdx?: number, targetCharIdx?: number) => {
    sounds.playTurn();
    if (!activeHero) return;
    const heroIndexInParty = party.findIndex(p => p.id === activeHero.id);

    const targetGroup = targetGrpIdx !== undefined ? targetGrpIdx : selectedTargetGroupIdx;

    const newAction: PlayerCombatAction = {
      charIndex: heroIndexInParty,
      actionType: type,
      targetGroupIndex: targetGroup,
      targetCharIndex: targetCharIdx,
      spellId
    };

    const nextActions = [...actions, newAction];
    setActions(nextActions);
    setSelectingSpell(false);
    setPendingSpell(null);

    if (currentHeroIdx + 1 < livingHeroes.length) {
      setCurrentHeroIdx(currentHeroIdx + 1);
    } else {
      // All conscious heroes chose actions -> resolve combat round
      resolveRound(nextActions);
    }
  };

  // Authentic Pascal PROCEDURE RUNAWAY (COMBAT2.TEXT l. 279-313):
  // Run is a collective decision for the entire party, not per individual character.
  const handlePartyRun = () => {
    sounds.playTurn();
    setIsResolving(true);
    setSelectingSpell(false);
    setPendingSpell(null);

    if (attemptPartyRun(party, groups, mazeLevel)) {
      setRoundLog([`🏃 Fuite collective réussie ! Votre escouade décroche et échappe aux monstres !`]);
      setTimeout(() => onCombatEnd(false, true, false), 1400);
      return;
    }

    // RUNFAILD: entire party forfeits its turn (AGILITY := -1) and monsters attack
    const result = executeCombatRound(party, groups, [], 'NONE', { mazeLevel, acModifier: acModifierRef.current });
    const fx = result.effects;
    if (fx.lightAdd || fx.lightMax || fx.acModifier) onSpellEffects?.(fx);
    setParty([...party]);
    setRoundLog([
      `⚠️ Échec de la fuite collective (RUNFAILD) ! Toute l'escouade perd son tour pendant que les monstres attaquent !`,
      ...result.combatLog
    ]);

    if (currentSurprise !== 'NONE') {
      setCurrentSurprise('NONE');
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

    setTimeout(() => {
      setActions([]);
      setCurrentHeroIdx(0);
      setIsResolving(false);
    }, 1200);
  };

  const resolveRound = (finalActions: PlayerCombatAction[]) => {
    setIsResolving(true);
    sounds.playHit();

    // Execute combat round with current surprise state
    const result = executeCombatRound(party, groups, finalActions, currentSurprise, { mazeLevel, acModifier: acModifierRef.current });
    const fx = result.effects;
    if (fx.lightAdd || fx.lightMax || fx.acModifier) onSpellEffects?.(fx);
    setParty([...party]);
    setRoundLog(result.combatLog);

    // CRITICAL: Surprise only applies to round 1! From round 2 onward, surprise is always NONE
    if (currentSurprise !== 'NONE') {
      setCurrentSurprise('NONE');
    }

    if (fx.malor || fx.loktofeit) {
      setTimeout(() => onCombatEnd(false, true, false, fx), 2000);
      return;
    }

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
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-3 sm:p-6 select-none overflow-y-auto safe-top safe-bottom safe-left safe-right">
      {/* Combat Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-950/80 border border-red-600/40 rounded-lg text-red-400 shrink-0">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Engagement en Combat !
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {currentSurprise === 'PARTY' 
                ? '⚡ Vous surprenez les monstres (Tour gratuit pour vos aventuriers) !' 
                : currentSurprise === 'MONSTERS' 
                ? '⚠️ Les monstres vous ont pris par surprise (Embuscade au Round 1) !' 
                : 'Combat au corps-à-corps dans les ténèbres'}
            </p>
          </div>
        </div>

        {/* Surprise round indicator */}
        {currentSurprise !== 'NONE' && (
          <span className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold border ${
            currentSurprise === 'PARTY'
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
              : 'bg-red-950/80 border-red-500/60 text-red-400 animate-pulse'
          }`}>
            {currentSurprise === 'PARTY' ? 'Surprise : Escouade' : 'Surprise : Monstres (Round 1)'}
          </span>
        )}
      </div>

      {/* Battlefield & Monster Groups */}
      <div className="max-w-4xl mx-auto w-full flex flex-wrap justify-center items-stretch gap-2 sm:gap-4 py-3 sm:py-6">
        {groups.map((grp, gIdx) => {
          const isAlive = grp.instances.some(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0);
          const isTargeted = selectedTargetGroupIdx === gIdx && isAlive;

          return (
            <div 
              key={gIdx}
              onClick={() => {
                if (isAlive) {
                  setSelectedTargetGroupIdx(gIdx);
                  sounds.playTurn();
                }
              }}
              className={`p-2.5 sm:p-4 rounded-xl border flex flex-col justify-between transition cursor-pointer flex-1 min-w-[140px] sm:min-w-[170px] max-w-[215px] ${
                isTargeted
                  ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/50 shadow-lg'
                  : isAlive 
                  ? 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 shadow-md active:bg-slate-800' 
                  : 'bg-slate-950 border-slate-800/40 opacity-40 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] sm:text-xs font-bold text-amber-400">GRP #{gIdx + 1}</span>
                    {isTargeted && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-amber-300 font-bold bg-amber-950/80 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded border border-amber-600/50">
                        <Target className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-300">
                    {grp.instances.filter(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0).length}/{grp.count}
                  </span>
                </div>
                <div className="py-2 sm:py-3 text-center">
                  <div className="mx-auto mb-1.5 sm:mb-2 w-full max-w-[140px] aspect-[7/5] bg-black border border-slate-700 rounded shadow-inner flex items-center justify-center overflow-hidden">
                    {getMonsterPictureUrl(grp.monster.picId) ? (
                      <MonsterPicture picId={grp.monster.picId} alt={grp.identified ? grp.monster.name : grp.monster.nameUnknown} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-amber-400 text-xl sm:text-2xl font-serif font-bold">{grp.monster.name[0]}</span>
                    )}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-white truncate" title={grp.identified ? grp.monster.name : grp.monster.nameUnknown}>
                    {grp.identified ? grp.monster.name : grp.monster.nameUnknown}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400">
                    Niv.{grp.monster.level} · CA {grp.monster.ac}
                  </div>
                </div>
              </div>

              {/* Living status pill badges */}
              <div className="flex flex-wrap gap-1 justify-center pt-1.5 sm:pt-2">
                {grp.instances.map((inst, iIdx) => {
                  const isInstAlive = inst.status !== 'DEAD' && inst.status !== 'ASHES' && inst.hpLeft > 0;
                  const isAsleep = inst.status === 'ASLEEP';
                  const isPlyze = inst.status === 'PLYZE';

                  return (
                    <div 
                      key={iIdx}
                      className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] flex items-center justify-center font-bold ${
                        !isInstAlive
                          ? 'bg-red-950 text-red-500'
                          : isAsleep
                          ? 'bg-purple-900 text-purple-200 border border-purple-500'
                          : isPlyze
                          ? 'bg-yellow-900 text-yellow-200 border border-yellow-500'
                          : 'bg-emerald-600 text-white'
                      }`}
                      title={`PV: ${inst.hpLeft}/${inst.maxHp} [${inst.status}]`}
                    >
                      {isInstAlive ? `${iIdx + 1}${isAsleep ? ' 💤' : isPlyze ? ' ⚡' : ''}` : '†'}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Party Status Overview Strip in Combat: 3 Frontline / 3 Backline */}
      <div className="bg-slate-900/60 border border-slate-800 p-2 sm:p-3 rounded-xl max-w-4xl mx-auto w-full mb-3 sm:mb-4">
        <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 mb-1.5 sm:mb-2 flex items-center justify-between">
          <span>Escouade ({party.filter(p => p.status !== 'DEAD' && p.status !== 'ASHES').length}/{party.length} debout)</span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:inline">Statuts & Afflictions en temps réel</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
          {party.map((hero, hIdx) => {
            const effs = getActiveStatusEffects(hero);
            const isTurn = !isResolving && activeHero && activeHero.id === hero.id;

            return (
              <div 
                key={hero.id}
                className={`p-1.5 sm:p-2 rounded-lg border text-xs flex flex-col justify-between transition ${
                  isTurn 
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-md ring-1 ring-amber-500/50' 
                    : hero.status === 'DEAD' || hero.status === 'ASHES'
                    ? 'bg-slate-950 border-red-950/60 opacity-60'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-bold text-white text-[11px] sm:text-xs">
                    <span className="truncate">{hero.name}</span>
                    <span className="text-[8px] sm:text-[9px] text-amber-400 font-mono">N{hero.charLevel}</span>
                  </div>
                  <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-400 pt-0.5">
                    <span className="truncate">{hero.class}</span>
                    <span>CA {hero.armorClass}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex justify-between text-[9px] sm:text-[10px] font-semibold">
                    <span className="text-slate-400">PV:</span>
                    <span className={hero.hpLeft < hero.hpMax / 3 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {hero.hpLeft}/{hero.hpMax}
                    </span>
                  </div>
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-0.5 sm:gap-1 pt-0.5 min-h-[16px]">
                    {effs.map(e => (
                      <span 
                        key={e.id}
                        className={`text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded border ${e.bgColor} ${e.borderColor} ${e.color}`}
                        title={e.description}
                      >
                        {e.badge}
                      </span>
                    ))}
                    {effs.length === 0 && (
                      <span className="text-[8px] sm:text-[9px] text-emerald-500 font-medium">OK</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special State: Surprise Ambush by Monsters in Round 1 */}
      {currentSurprise === 'MONSTERS' && !isResolving && (
        <div className="bg-red-950/60 border border-red-600/60 p-4 rounded-xl max-w-3xl mx-auto w-full text-center space-y-3 shadow-lg">
          <div className="text-sm font-bold text-red-200 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-red-400 animate-bounce" />
            <span>Embuscade ennemie ! Les monstres attaquent par surprise lors de ce 1er round.</span>
          </div>
          <p className="text-xs text-red-300/90 max-w-lg mx-auto">
            Vos héros sont pris au dépourvu et ne peuvent pas riposter ce tour-ci. Le combat reprendra normalement dès le round suivant.
          </p>
          <button
            onClick={() => resolveRound([])}
            className="px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition shadow-lg inline-flex items-center gap-2"
          >
            <Swords className="w-4 h-4" />
            <span>Subir l'assaut de surprise des monstres</span>
          </button>
        </div>
      )}

      {/* Special State: All Living Heroes Helpless (Asleep or Paralyzed) */}
      {allHelpless && !isResolving && currentSurprise !== 'MONSTERS' && (
        <div className="bg-purple-950/60 border border-purple-600/60 p-4 rounded-xl max-w-3xl mx-auto w-full text-center space-y-3 shadow-lg">
          <div className="text-sm font-bold text-purple-200 flex items-center justify-center gap-2">
            <Moon className="w-4 h-4 text-purple-400" />
            <span>Tous vos aventuriers sont endormis ou paralysés !</span>
          </div>
          <p className="text-xs text-purple-300/90 max-w-lg mx-auto">
            Aucun héros conscient n'est en état de donner d'ordre ce tour-ci. Les monstres mènent leur assaut. Les héros endormis ont une chance de se réveiller à chaque tour ou à chaque coup reçu.
          </p>
          <button
            onClick={() => resolveRound([])}
            className="px-6 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl transition shadow-lg inline-flex items-center gap-2"
          >
            <Moon className="w-4 h-4" />
            <span>Résoudre le tour des monstres</span>
          </button>
        </div>
      )}

      {/* Command Panel for Active Hero */}
      {!isResolving && currentSurprise !== 'MONSTERS' && !allHelpless && activeHero && (
        <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-5 rounded-xl space-y-3 sm:space-y-4 max-w-3xl mx-auto w-full shadow-lg">
          {(() => {
            const heroPartyIdx = party.findIndex(p => p.id === activeHero.id);
            const isFrontRank = heroPartyIdx < 3;

            return (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
                      Ordre #{currentHeroIdx + 1}/{livingHeroes.length} :
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {activeHero.name} ({activeHero.class} · CA {activeHero.armorClass} · {activeHero.hpLeft}/{activeHero.hpMax} PV)
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      isFrontRank 
                        ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' 
                        : 'bg-blue-950/80 border-blue-500/60 text-blue-300'
                    }`}>
                      {isFrontRank ? `Avant-garde · #${heroPartyIdx + 1}` : `Arrière-garde · #${heroPartyIdx + 1}`}
                    </span>
                  </div>
                  {currentHeroIdx > 0 && (
                    <button
                      onClick={() => {
                        setCurrentHeroIdx(currentHeroIdx - 1);
                        setActions(actions.slice(0, -1));
                      }}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 shrink-0 p-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Revenir</span>
                    </button>
                  )}
                </div>

                {/* Target Group Selector for Current Order */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-xs pt-1 border-t border-slate-800/80">
                  <span className="font-bold text-slate-400 flex items-center gap-1 shrink-0 text-[11px] sm:text-xs">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    Cible :
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {groups.map((grp, gIdx) => {
                      const isAlive = grp.instances.some(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0);
                      if (!isAlive) return null;
                      const isSel = selectedTargetGroupIdx === gIdx;
                      const mName = grp.identified ? grp.monster.name : grp.monster.nameUnknown;

                      return (
                        <button
                          key={gIdx}
                          type="button"
                          onClick={() => {
                            setSelectedTargetGroupIdx(gIdx);
                            sounds.playTurn();
                          }}
                          className={`px-2.5 py-1.5 sm:py-1 rounded-lg text-xs font-semibold border min-h-[36px] flex items-center transition ${
                            isSel 
                              ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-sm' 
                              : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
                          }`}
                        >
                          #{gIdx + 1} {mName} ({grp.instances.filter(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0).length})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Hero Silence Alert */}
                {activeHero.silencedRounds && activeHero.silencedRounds > 0 && (
                  <div className="px-3 py-1.5 bg-cyan-950/50 border border-cyan-500/40 rounded-lg text-xs text-cyan-300 flex items-center gap-2">
                    <MicOff className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                    <span>{activeHero.name} est sous l'effet du silence magique MONTINO (sorts bloqués pour encore {activeHero.silencedRounds} tour(s)).</span>
                  </div>
                )}

                {!selectingSpell ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {/* Fight attack button: ONLY front 3 characters can attack in melee as per Pascal */}
                    <button
                      onClick={() => handleSelectAction('FIGHT', undefined, selectedTargetGroupIdx)}
                      disabled={!isFrontRank}
                      className={`p-2.5 sm:p-3 min-h-[52px] rounded-lg flex flex-col items-center justify-center gap-1 text-xs font-bold transition active:scale-95 ${
                        isFrontRank 
                          ? 'bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/60 text-amber-300' 
                          : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                      }`}
                      title={isFrontRank ? `Attaquer le Groupe #${selectedTargetGroupIdx + 1}` : "Arrière-garde : Seuls les 3 premiers héros peuvent attaquer au corps-à-corps selon le code Pascal"}
                    >
                      <Swords className="w-4 h-4 text-amber-400" />
                      <span>Attaquer</span>
                      {!isFrontRank && <span className="text-[9px] text-slate-400 font-normal">Arrière-garde</span>}
                    </button>

                    <button
                      onClick={() => setSelectingSpell(true)}
                      disabled={availableSpells.length === 0 || (activeHero.silencedRounds !== undefined && activeHero.silencedRounds > 0)}
                      className="p-2.5 sm:p-3 min-h-[52px] bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg flex flex-col items-center justify-center gap-1 text-xs font-bold transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
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
                      className="p-2.5 sm:p-3 min-h-[52px] bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg flex flex-col items-center justify-center gap-1 text-xs font-bold transition active:scale-95"
                    >
                      <ShieldAlert className="w-4 h-4 text-blue-400" />
                      <span>Parade (-2 CA)</span>
                    </button>

                    {(activeHero.class === 'PRIEST' || activeHero.class === 'BISHOP' || activeHero.class === 'LORD') && (
                      <button
                        onClick={() => handleSelectAction('DISPELL', undefined, selectedTargetGroupIdx)}
                        className="p-2.5 sm:p-3 min-h-[52px] bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg flex flex-col items-center justify-center gap-1 text-xs font-bold transition active:scale-95"
                      >
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span>Exorcisme</span>
                      </button>
                    )}

                    <button
                      onClick={handlePartyRun}
                      className="p-2.5 sm:p-3 min-h-[52px] bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg flex flex-col items-center justify-center gap-1 text-xs font-bold transition active:scale-95"
                      title="Fuite collective du groupe (PROCEDURE RUNAWAY)"
                    >
                      <Footprints className="w-4 h-4 text-emerald-400" />
                      <span>Fuir (Groupe)</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">Sélectionnez un sort magique :</span>
                      <button
                        onClick={() => setSelectingSpell(false)}
                        className="text-xs text-slate-400 hover:text-white p-1"
                      >
                        Annuler
                      </button>
                    </div>
                    {pendingSpell && (
                      <div className="p-2.5 bg-slate-900 border border-purple-700 rounded-lg space-y-2">
                        <div className="text-xs font-bold text-purple-300">{pendingSpell.name} : choisissez le personnage ciblé</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {party.map((p, idx) => (
                            <button
                              key={p.id}
                              onClick={() => handleSelectAction('SPELL', pendingSpell.id, selectedTargetGroupIdx, idx)}
                              className="p-2 min-h-[44px] bg-slate-800 hover:bg-purple-950/50 border border-slate-700 hover:border-purple-500 rounded-lg text-left text-xs transition active:scale-95"
                            >
                              <div className="font-bold text-white">{idx + 1}. {p.name}</div>
                              <div className="text-[11px] text-slate-400">{p.hpLeft}/{p.hpMax} PV{p.status !== 'OK' ? ` [${p.status}]` : ''}{p.poisonAmount > 0 ? ' [POISON]' : ''}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {availableSpells.map(sp => (
                        <button
                          key={sp.id}
                          onClick={() => {
                            if (isFriendlySingleSpell(sp.name)) setPendingSpell(sp);
                            else handleSelectAction('SPELL', sp.id, selectedTargetGroupIdx);
                          }}
                          className="p-2.5 min-h-[44px] bg-slate-800 hover:bg-purple-950/50 border border-slate-700 hover:border-purple-500 rounded-lg text-left text-xs transition active:scale-95"
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
              </>
            );
          })()}
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
