import React, { useState } from 'react';
import { TCharacter } from '../types/wizardry';
import { ITEMS_DATABASE, getExpForNextLevel } from '../data/provingGroundsData';
import { getScenarioCheatConfig, ScenarioBossDef } from '../data/scenarioCheatConfig';
import { sounds } from '../utils/soundEffects';
import { useI18n } from '../i18n';
import {
  Zap,
  Coins,
  Sparkles,
  Key,
  HeartPulse,
  X,
  Check,
  Crown,
  ShieldAlert,
  Award,
  Skull,
  RotateCcw,
  Swords
} from 'lucide-react';

interface CheatModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenarioId: string;
  party: TCharacter[];
  setParty: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  allCharacters: TCharacter[];
  setAllCharacters: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  onRestoreAllHeroes: () => void;
  onRespawnBosses?: (eventKeys?: string[], targetFloor?: number) => void;
  onRespawnWerdna?: () => void;
}

export const CheatModal: React.FC<CheatModalProps> = ({
  isOpen,
  onClose,
  activeScenarioId,
  party,
  setParty,
  allCharacters,
  setAllCharacters,
  onRestoreAllHeroes,
  onRespawnBosses,
  onRespawnWerdna
}) => {
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState<'GOLD' | 'EXP' | 'KEYS' | 'RESTORE'>('EXP');
  const [selectedHeroId, setSelectedHeroId] = useState<string>('ALL');
  const [targetLevel, setTargetLevel] = useState<number>(10);
  const [customGold, setCustomGold] = useState<number>(50000);
  const [customExp, setCustomExp] = useState<number>(100000);
  const [notice, setNotice] = useState<string | null>(null);

  const cheatConfig = getScenarioCheatConfig(activeScenarioId);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotice(msg);
    sounds.playFanfare();
    setTimeout(() => {
      setNotice(null);
    }, 4500);
  };

  // Helper to update party and roster in sync
  const updateHeroes = (updater: (hero: TCharacter) => void, targetId: string = selectedHeroId) => {
    const updatedParty = party.map(h => {
      if (targetId === 'ALL' || h.id === targetId) {
        const clone = { ...h };
        updater(clone);
        return clone;
      }
      return h;
    });

    const updatedRoster = allCharacters.map(h => {
      if (targetId === 'ALL' || h.id === targetId) {
        const clone = { ...h };
        updater(clone);
        return clone;
      }
      return h;
    });

    setParty(updatedParty);
    setAllCharacters(updatedRoster);
  };

  // 1. Gold Cheat Handlers
  const handleAddGold = (amount: number) => {
    updateHeroes(h => {
      h.gold = Math.max(0, (h.gold || 0) + amount);
    });
    showNotification(t.cheat.goldGivenSuccess(amount));
  };

  // 2. EXP Cheat Handlers (for leveling up at the Inn)
  const handleAddExp = (amount: number) => {
    updateHeroes(h => {
      h.exp = Math.max(0, (h.exp || 0) + amount);
    });
    const targetLabel =
      selectedHeroId === 'ALL'
        ? (lang === 'fr' ? 'tout le groupe' : 'the entire party')
        : party.find(p => p.id === selectedHeroId)?.name || 'hero';
    showNotification(`🌟 +${amount.toLocaleString()} XP -> ${targetLabel}`);
  };

  const handleSetTargetLevelExp = (desiredLvl: number) => {
    if (desiredLvl <= 1) return;

    updateHeroes(h => {
      const currentLvl = h.charLevel || 1;
      if (currentLvl < desiredLvl) {
        const targetExpNeeded = getExpForNextLevel(h.class, desiredLvl - 1) + 1;
        if (h.exp < targetExpNeeded) {
          h.exp = targetExpNeeded;
        }
      }
    });

    showNotification(t.cheat.levelSetSuccess(desiredLvl));
  };

  // 3. Scenario-Aware Quest Item Injection
  const handleGiveItem = (itemId: number, itemName: string) => {
    const item = ITEMS_DATABASE.find(i => i.id === itemId);
    if (!item) {
      alert(`Item #${itemId} (${itemName}) not found in the current scenario database.`);
      return;
    }

    // Find first hero in party with free slot
    const targetHero = party.find(h => h.status !== 'DEAD' && h.status !== 'ASHES' && h.possessions.length < 8);
    if (!targetHero) {
      alert(t.dungeon.backpackFullNotice);
      return;
    }

    // Check if already in party
    const alreadyHas = party.some(h => h.possessions.some(p => p.itemIndex === itemId));
    if (alreadyHas) {
      const confirmMsg =
        lang === 'fr'
          ? `Le groupe possède déjà l'objet "${itemName}". Voulez-vous en ajouter un exemplaire supplémentaire ?`
          : `Party already has "${itemName}". Add another copy?`;
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }

    targetHero.possessions.push({
      equipped: false,
      cursed: item.cursed || false,
      identified: true,
      itemIndex: item.id
    });

    setParty([...party]);
    setAllCharacters(allCharacters.map(c => (c.id === targetHero.id ? targetHero : c)));
    showNotification(`🔑 "${item.name}" -> ${targetHero.name}`);
  };

  // Primary Bundle Injector
  const handleGivePrimaryBundle = () => {
    const itemIds = cheatConfig.primaryBundleItemIds;
    let givenCount = 0;
    const updatedParty = [...party];

    for (const id of itemIds) {
      const alreadyHas = updatedParty.some(h => h.possessions.some(p => p.itemIndex === id));
      if (!alreadyHas) {
        const receiver = updatedParty.find(h => h.status !== 'DEAD' && h.status !== 'ASHES' && h.possessions.length < 8);
        const itemDef = ITEMS_DATABASE.find(i => i.id === id);
        if (receiver && itemDef) {
          receiver.possessions.push({
            equipped: false,
            cursed: itemDef.cursed || false,
            identified: true,
            itemIndex: itemDef.id
          });
          givenCount++;
        }
      }
    }

    setParty(updatedParty);
    setAllCharacters(
      allCharacters.map(c => {
        const inParty = updatedParty.find(p => p.id === c.id);
        return inParty || c;
      })
    );

    if (givenCount > 0) {
      showNotification(t.cheat.keysGivenSuccess);
    } else {
      showNotification(
        lang === 'fr'
          ? "ℹ️ Le groupe possède déjà l'ensemble des reliques de ce pack."
          : 'ℹ️ Party already possesses all items in this pack.'
      );
    }
  };

  // All Scenario Quest Items Bundle
  const handleGiveAllScenarioQuestItems = () => {
    const itemIds = cheatConfig.allQuestItemIds;
    let given = 0;
    const updatedParty = [...party];

    for (const id of itemIds) {
      const has = updatedParty.some(h => h.possessions.some(p => p.itemIndex === id));
      if (!has) {
        const hero = updatedParty.find(h => h.status !== 'DEAD' && h.status !== 'ASHES' && h.possessions.length < 8);
        const itemDef = ITEMS_DATABASE.find(i => i.id === id);
        if (hero && itemDef) {
          hero.possessions.push({
            equipped: false,
            cursed: itemDef.cursed || false,
            identified: true,
            itemIndex: itemDef.id
          });
          given++;
        }
      }
    }

    setParty(updatedParty);
    setAllCharacters(
      allCharacters.map(c => {
        const inParty = updatedParty.find(p => p.id === c.id);
        return inParty || c;
      })
    );

    showNotification(t.cheat.keysGivenSuccess);
  };

  // Boss Respawn Handlers
  const handleTriggerBossRespawn = (boss: ScenarioBossDef) => {
    if (onRespawnBosses) {
      onRespawnBosses(boss.eventKeys, boss.floor);
    } else if (onRespawnWerdna) {
      onRespawnWerdna();
    }
    const name = lang === 'fr' ? boss.nameFr : boss.nameEn;
    const msg =
      lang === 'fr'
        ? `⚔️ ${name} a réapparu (${boss.coordsText}) ! Le combat est prêt.`
        : `⚔️ ${name} has respawned (${boss.coordsText})! The battle awaits.`;
    showNotification(msg);
  };

  const handleResetAllScenarioEncounters = () => {
    if (onRespawnBosses) {
      onRespawnBosses([], undefined);
    } else if (onRespawnWerdna) {
      onRespawnWerdna();
    }
    const msg =
      lang === 'fr'
        ? "🔄 Tous les gardiens et boss vaincus de ce scénario ont été réinitialisés !"
        : "🔄 All defeated guardians and scenario bosses have been reset!";
    showNotification(msg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-3xl flex flex-col rounded-2xl bg-slate-900 border border-rose-500/50 shadow-2xl shadow-rose-950/40 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 md:p-5 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
              <Zap className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-600/40">
                  DEVELOPER / CHEAT ENGINE
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {lang === 'fr' ? cheatConfig.titleFr : cheatConfig.titleEn}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-black text-rose-200 mt-1">
                {t.cheat.modalTitle}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'fr' 
                  ? "Actions arcaniques et triches contextuelles adaptées au scénario en cours."
                  : 'Arcane actions and cheats contextually adapted to the active scenario.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-700"
            title={t.common.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Notification Banner */}
        {notice && (
          <div className="px-5 py-2.5 bg-rose-950/60 border-b border-rose-600/40 text-xs font-semibold text-rose-200 flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Hero Target Selector */}
        <div className="p-3.5 px-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>{t.cheat.targetHeroLabel}</span>
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setSelectedHeroId('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition border ${
                selectedHeroId === 'ALL'
                  ? 'bg-rose-700 text-white border-rose-400 shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              ⭐ {t.cheat.allPartyOption} ({party.length})
            </button>
            {party.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHeroId(h.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition border ${
                  selectedHeroId === h.id
                    ? 'bg-amber-600 text-white border-amber-400 shadow'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {h.name} ({lang === 'fr' ? 'N.' : 'L.'}{h.charLevel})
              </button>
            ))}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="p-3.5 px-5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'EXP', label: t.cheat.tabExp, icon: Sparkles },
            { id: 'GOLD', label: t.cheat.tabGold, icon: Coins },
            { id: 'KEYS', label: t.cheat.tabKeys, icon: Key },
            { id: 'RESTORE', label: t.cheat.tabRestore, icon: HeartPulse },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-rose-600 text-white border-rose-400 shadow'
                    : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-5 md:p-6 overflow-y-auto max-h-[60vh] space-y-5">
          {/* TAB 1: EXP & LEVELS */}
          {activeTab === 'EXP' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'fr' ? "Calculateur de Niveau Cible pour l'Auberge (Inn)" : "Target Level Calculator for the Inn"}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'fr'
                    ? "Conformément aux règles authentiques de Wizardry, les héros montent de niveau en se reposant à l'Auberge de l'Aventurier. Cette triche calcule et attribue la quantité exacte d'XP requise pour atteindre le niveau cible souhaité lors du repos aux Écuries (gratuit) ou en chambre."
                    : "In authentic Wizardry, adventurers level up by resting at the Adventurer's Inn. This cheat calculates and grants the exact EXP required to achieve the desired level upon resting at the Stables or in a room."}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-semibold text-slate-300">{t.cheat.targetLevelLabel}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[3, 5, 8, 10, 13, 15, 20, 25].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setTargetLevel(lvl)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                          targetLevel === lvl
                            ? 'bg-amber-500 text-slate-950 border-amber-300 shadow'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {lang === 'fr' ? `Niv. ${lvl}` : `Lvl. ${lvl}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleSetTargetLevelExp(targetLevel)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs tracking-wide shadow flex items-center justify-center gap-2 transition"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>{t.cheat.setLevelBtn(targetLevel)}</span>
                  </button>
                </div>
              </div>

              {/* Raw EXP Injection */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  {lang === 'fr' ? "Ajout Rapide de Points d'Expérience (XP Brute)" : "Quick Grant Experience Points (Raw EXP)"}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[10000, 50000, 250000, 1000000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => handleAddExp(amt)}
                      className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 transition"
                    >
                      +{amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`} XP
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="number"
                    value={customExp}
                    onChange={e => setCustomExp(Number(e.target.value) || 0)}
                    step={10000}
                    className="w-40 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    onClick={() => handleAddExp(customExp)}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 text-xs font-bold transition"
                  >
                    {lang === 'fr' ? "Ajouter ce montant personnalisé" : "Add custom amount"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOLD */}
          {activeTab === 'GOLD' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Coins className="w-4 h-4" />
                  <span>{t.cheat.tabGold}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {lang === 'fr' 
                    ? "Ajoutez de l'or à vos aventuriers pour acquérir les armes et armures mythiques au comptoir commercial de Boltac, ou pour financer les nuits en suite royale à l'Auberge."
                    : "Grant gold to your adventurers to purchase mythical equipment at Boltac's Trading Post or royal suite lodgings at the Inn."}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {[10000, 50000, 250000, 1000000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => handleAddGold(amt)}
                      className="py-2.5 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-600/50 text-xs font-bold text-amber-300 transition shadow-sm"
                    >
                      +{amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`} GP
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="number"
                    value={customGold}
                    onChange={e => setCustomGold(Number(e.target.value) || 0)}
                    step={10000}
                    className="w-40 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    onClick={() => handleAddGold(customGold)}
                    className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs transition"
                  >
                    {lang === 'fr' ? "Ajouter ce montant en PO" : "Add custom gold"}
                  </button>
                </div>
              </div>

              {/* Party gold summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">
                  {lang === 'fr' ? "Solde actuel de l'escouade :" : "Current Party Gold Balances:"}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                  {party.map(h => (
                    <div key={h.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300 truncate">{h.name}:</span>
                      <span className="text-amber-400 font-bold">{(h.gold || 0).toLocaleString()} GP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCENARIO-AWARE QUEST ITEMS & KEYS */}
          {activeTab === 'KEYS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
                    <Key className="w-4 h-4 text-sky-400" />
                    <span>{lang === 'fr' ? "Objets de Quête & Clés Spécifiques au Scénario" : "Scenario-Specific Quest Items & Keys"}</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
                    {lang === 'fr' ? cheatConfig.titleFr : cheatConfig.titleEn}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {lang === 'fr' ? cheatConfig.questLoreFr : cheatConfig.questLoreEn}
                </p>

                {/* 1-Click Primary Bundle */}
                {cheatConfig.primaryBundleItemIds.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={handleGivePrimaryBundle}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-black text-xs tracking-wide shadow flex items-center justify-center gap-2 transition"
                    >
                      <Key className="w-4 h-4" />
                      <span>🔑 {lang === 'fr' ? cheatConfig.primaryBundleNameFr : cheatConfig.primaryBundleNameEn}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Individual Item Injections */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  {lang === 'fr' ? "Ajout d'objets de quête individuels de ce scénario :" : "Grant Individual Scenario Quest Items:"}
                </span>

                {cheatConfig.questItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    {lang === 'fr'
                      ? "Ce scénario ne comporte aucun objet de quête répertorié dans sa base d'objets."
                      : "This scenario has no registered quest items in its item database."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {cheatConfig.questItems.map(itm => (
                      <button
                        key={itm.id}
                        onClick={() => handleGiveItem(itm.id, itm.name)}
                        className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition group"
                        title={lang === 'fr' ? itm.descFr : itm.descEn}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-slate-200 group-hover:text-amber-300 truncate">
                            {itm.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {lang === 'fr' ? itm.descFr : itm.descEn}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono shrink-0">
                          + {lang === 'fr' ? 'Ajouter' : 'Add'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {cheatConfig.allQuestItemIds.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={handleGiveAllScenarioQuestItems}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/40 text-xs font-bold transition"
                    >
                      🎁 {lang === 'fr' ? "Donner Tous les Objets de Quête de ce Scénario" : "Grant All Scenario Quest Items"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RESTORE / HEAL & SCENARIO BOSS RESPAWNS */}
          {activeTab === 'RESTORE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <HeartPulse className="w-4 h-4" />
                  <span>{t.cheat.tabRestore}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'fr'
                    ? "Restaure immédiatement l'intégralité des points de vie (PV Max), dissipe tous les statuts invalidants (mort, cendres, paralysie, pétrification, sommeil) à l'état normal (OK), soigne le poison et recharge les points de sorts de l'ensemble de la guilde."
                    : "Fully restores Hit Points (Max HP), resets all afflictions (dead, ashes, paralysis, petrified, asleep) to OK status, cleanses poison, and recharges spell points for all guild members."}
                </p>

                <button
                  onClick={() => {
                    onRestoreAllHeroes();
                    showNotification(t.cheat.restoreSuccess);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs tracking-wide shadow flex items-center justify-center gap-2 transition"
                >
                  <HeartPulse className="w-4 h-4 fill-current" />
                  <span>{t.cheat.restoreAllHpBtn}</span>
                </button>
              </div>

              {/* Scenario-Specific Boss and Encounter Respawns */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <Skull className="w-4 h-4 text-purple-400" />
                    <span>{lang === 'fr' ? "Réapparition des Monstres & Boss Vaincus" : "Respawn Defeated Bosses & Guardians"}</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                    {lang === 'fr' ? cheatConfig.titleFr : cheatConfig.titleEn}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'fr'
                    ? "Permet de réaffronter les créatures légendaires et boss déjà terrassés sans devoir réinitialiser l'ensemble de votre aventure."
                    : "Allows confronting legendary monsters and defeated storyline bosses again without restarting the whole game."}
                </p>

                {cheatConfig.bosses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    {lang === 'fr'
                      ? "Aucun combat unique de boss persistant n'est configuré pour ce scénario."
                      : "No persistent unique boss fights are registered for this scenario."}
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {cheatConfig.bosses.map(boss => (
                      <div
                        key={boss.id}
                        className="p-3 rounded-xl bg-slate-900 border border-purple-900/60 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Swords className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="font-bold text-sm text-purple-200">
                              {lang === 'fr' ? boss.nameFr : boss.nameEn}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
                            {boss.coordsText}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {lang === 'fr' ? boss.descriptionFr : boss.descriptionEn}
                        </p>

                        <button
                          onClick={() => handleTriggerBossRespawn(boss)}
                          className="w-full py-2 px-3 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-100 font-bold text-xs border border-purple-600/50 flex items-center justify-center gap-2 transition"
                        >
                          <Skull className="w-3.5 h-3.5" />
                          <span>
                            {lang === 'fr'
                              ? `Faire réapparaître : ${boss.nameFr}`
                              : `Respawn: ${boss.nameEn}`}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Universal reset all encounters button */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={handleResetAllScenarioEncounters}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-amber-600/40 flex items-center justify-center gap-2 transition"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>
                      {lang === 'fr'
                        ? "🔄 Réinitialiser tous les boss & gardiens vaincus de ce scénario"
                        : "🔄 Reset all defeated bosses & fixed guardians of this scenario"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-6 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'fr' ? "Disponible sur GitHub Pages & Développement." : "Available on GitHub Pages & Development."}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition"
          >
            {t.common.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
