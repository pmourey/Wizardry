import React, { useState } from 'react';
import { TCharacter } from '../types/wizardry';
import { ITEMS_DATABASE, getExpForNextLevel } from '../data/provingGroundsData';
import { sounds } from '../utils/soundEffects';
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
  Flame,
  Award,
  Skull
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
  onRespawnWerdna
}) => {
  const [activeTab, setActiveTab] = useState<'GOLD' | 'EXP' | 'KEYS' | 'RESTORE'>('EXP');
  const [selectedHeroId, setSelectedHeroId] = useState<string>('ALL');
  const [targetLevel, setTargetLevel] = useState<number>(10);
  const [customGold, setCustomGold] = useState<number>(50000);
  const [customExp, setCustomExp] = useState<number>(100000);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotice(msg);
    sounds.playFanfare();
    setTimeout(() => {
      setNotice(null);
    }, 4000);
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
    const targetLabel = selectedHeroId === 'ALL' ? 'tout le groupe' : party.find(p => p.id === selectedHeroId)?.name || 'le héros';
    showNotification(`💰 +${amount.toLocaleString()} Pièces d'Or accordées à ${targetLabel} !`);
  };

  // 2. EXP Cheat Handlers (for leveling up at the Inn)
  const handleAddExp = (amount: number) => {
    updateHeroes(h => {
      h.exp = Math.max(0, (h.exp || 0) + amount);
    });
    const targetLabel = selectedHeroId === 'ALL' ? 'tout le groupe' : party.find(p => p.id === selectedHeroId)?.name || 'le héros';
    showNotification(`🌟 +${amount.toLocaleString()} XP accordés à ${targetLabel} ! Rendez-vous à l'Auberge pour monter de niveau.`);
  };

  const handleSetTargetLevelExp = (desiredLvl: number) => {
    if (desiredLvl <= 1) return;
    let count = 0;

    updateHeroes(h => {
      const currentLvl = h.charLevel || 1;
      if (currentLvl < desiredLvl) {
        // Total EXP needed to reach desiredLvl
        const targetExpNeeded = getExpForNextLevel(h.class, desiredLvl - 1) + 1;
        if (h.exp < targetExpNeeded) {
          h.exp = targetExpNeeded;
          count++;
        }
      }
    });

    const targetLabel = selectedHeroId === 'ALL' ? 'les membres du groupe' : party.find(p => p.id === selectedHeroId)?.name || 'le héros';
    showNotification(`✨ XP ajustée pour ${targetLabel} afin d'atteindre le Niveau ${desiredLvl} à l'Auberge de l'Aventurier !`);
  };

  // 3. Wizardry 1 Elevator Keys & Blue Ribbon Injector
  const handleGiveItem = (itemId: number, itemName: string) => {
    const item = ITEMS_DATABASE.find(i => i.id === itemId);
    if (!item) {
      alert(`Objet #${itemId} introuvable dans la base de données.`);
      return;
    }

    // Find first hero in party with free slot
    const targetHero = party.find(h => h.status !== 'DEAD' && h.status !== 'ASHES' && h.possessions.length < 8);
    if (!targetHero) {
      alert("Inventaires pleins ! Libérez de la place dans l'escouade (max 8 objets par héros).");
      return;
    }

    // Check if already in party
    const alreadyHas = party.some(h => h.possessions.some(p => p.itemIndex === itemId));
    if (alreadyHas) {
      if (!window.confirm(`Le groupe possède déjà l'objet "${itemName}". Voulez-vous en ajouter un exemplaire supplémentaire ?`)) {
        return;
      }
    }

    targetHero.possessions.push({
      equipped: false,
      cursed: false,
      identified: true,
      itemIndex: item.id
    });

    setParty([...party]);
    setAllCharacters(allCharacters.map(c => c.id === targetHero.id ? targetHero : c));
    showNotification(`🔑 "${item.name}" ajouté à l'inventaire de ${targetHero.name} !`);
  };

  // One-click Elevator Bundle (Bronze Key, Silver Key, Blue Ribbon)
  const handleGiveElevatorKeyBundle = () => {
    const bundleItems = [
      { id: 97, name: 'BRONZE KEY (Clé de Bronze - Niveaux 1 à 4)' },
      { id: 98, name: 'SILVER KEY (Clé d’Argent - Niveaux 1 à 4)' },
      { id: 100, name: 'BLUE RIBBON (Ruban Bleu d’Accréditation - Niveaux 4 à 10)' }
    ];

    let givenCount = 0;
    const updatedParty = [...party];

    for (const itemDef of bundleItems) {
      const alreadyHas = updatedParty.some(h => h.possessions.some(p => p.itemIndex === itemDef.id));
      if (!alreadyHas) {
        const receiver = updatedParty.find(h => h.status !== 'DEAD' && h.status !== 'ASHES' && h.possessions.length < 8);
        if (receiver) {
          receiver.possessions.push({
            equipped: false,
            cursed: false,
            identified: true,
            itemIndex: itemDef.id
          });
          givenCount++;
        }
      }
    }

    setParty(updatedParty);
    setAllCharacters(allCharacters.map(c => {
      const inParty = updatedParty.find(p => p.id === c.id);
      return inParty || c;
    }));

    if (givenCount > 0) {
      showNotification(`🔑 Pack Ascenseurs injecté : Bronze Key, Silver Key & Blue Ribbon reçus !`);
    } else {
      showNotification(`ℹ️ Le groupe possède déjà l'ensemble des clés et le Blue Ribbon.`);
    }
  };

  // All W1 Quest Artifacts Bundle (Statuettes, Keys, Ribbon)
  const handleGiveAllW1QuestItems = () => {
    const allW1Items = [
      { id: 97, name: 'BRONZE KEY' },
      { id: 98, name: 'SILVER KEY' },
      { id: 99, name: 'GOLD KEY' },
      { id: 100, name: 'BLUE RIBBON' },
      { id: 95, name: 'STATUETTE/BEAR' },
      { id: 96, name: 'STATUETTE/FROG' }
    ];

    let given = 0;
    const updatedParty = [...party];

    for (const itm of allW1Items) {
      const has = updatedParty.some(h => h.possessions.some(p => p.itemIndex === itm.id));
      if (!has) {
        const hero = updatedParty.find(h => h.status !== 'DEAD' && h.status !== 'ASHES' && h.possessions.length < 8);
        if (hero) {
          hero.possessions.push({
            equipped: false,
            cursed: false,
            identified: true,
            itemIndex: itm.id
          });
          given++;
        }
      }
    }

    setParty(updatedParty);
    setAllCharacters(allCharacters.map(c => {
      const inParty = updatedParty.find(p => p.id === c.id);
      return inParty || c;
    }));

    showNotification(`🎁 ${given} objet(s) de quête Wizardry 1 injecté(s) dans l'escouade !`);
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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-600/40">
                  DEVELOPER / GITHUB PAGES CHEAT ENGINE
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Scénario actif : {activeScenarioId}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-black text-rose-200 mt-1">
                Console de Triche & Outils de Test
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Modifiez l'or, les points d'XP pour le passage à l'Auberge, et injectez les clés d'ascenseurs et ruban bleu.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-700"
            title="Fermer"
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
            <span>Cible de l'action de triche :</span>
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
              ⭐ Tout le groupe ({party.length} héros)
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
                {h.name} (N.{h.charLevel})
              </button>
            ))}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="p-3.5 px-5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'EXP', label: 'Points d’Expérience & Niveaux', icon: Sparkles },
            { id: 'GOLD', label: 'Pièces d’Or (Gold)', icon: Coins },
            { id: 'KEYS', label: 'Clés & Ruban Bleu (Wiz 1)', icon: Key },
            { id: 'RESTORE', label: 'Soin & Résurrection', icon: HeartPulse },
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
                  <span>Calculateur de Niveau Cible pour l'Auberge (Inn)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conformément aux règles authentiques de Wizardry, les héros ne montent pas de niveau automatiquement en combat mais en se reposant à l'<strong>Auberge de l'Aventurier</strong>.
                  Cette triche calcule et attribue la quantité exacte d'XP requise pour atteindre le niveau cible souhaité lors du repos aux Écuries (gratuit) ou dans une chambre.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-semibold text-slate-300">Niveau souhaité :</span>
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
                        Niv. {lvl}
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
                    <span>Attribuer l'XP requise pour atteindre le Niveau {targetLevel} à l'Auberge</span>
                  </button>
                </div>
              </div>

              {/* Raw EXP Injection */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Ajout Rapide de Points d'Expérience (XP Brute)
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
                    Ajouter ce montant personnalisé
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
                  <span>Trésor de Pièces d'Or (Gold)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Ajoutez de l'or à vos aventuriers pour acquérir les armes et armures mythiques au comptoir commercial de Boltac, ou pour financer les nuits en suite royale à l'Auberge.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {[10000, 50000, 250000, 1000000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => handleAddGold(amt)}
                      className="py-2.5 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-600/50 text-xs font-bold text-amber-300 transition shadow-sm"
                    >
                      +{amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`} PO
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
                    Ajouter ce montant en PO
                  </button>
                </div>
              </div>

              {/* Party gold summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Solde actuel de l'escouade :</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                  {party.map(h => (
                    <div key={h.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300 truncate">{h.name}:</span>
                      <span className="text-amber-400 font-bold">{(h.gold || 0).toLocaleString()} PO</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WIZARDRY 1 ELEVATOR KEYS & BLUE RIBBON */}
          {activeTab === 'KEYS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
                  <Key className="w-4 h-4 text-sky-400" />
                  <span>Clés d'Ascenseurs & Pass d'Accréditation (Wizardry 1)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dans <em>Wizardry I : Proving Grounds of the Mad Overlord</em>, les ascenseurs du donjon de Trebor nécessitent des objets spéciaux dans l'inventaire :
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>BRONZE KEY (#97) & SILVER KEY (#98)</strong> : Permettent de déverrouiller les portes de l'ascenseur reliant les <strong>Niveaux 1 à 4</strong>.</li>
                  <li><strong>BLUE RIBBON (#100)</strong> : Le ruban bleu remis par Trebor, indispensable au 4e sous-sol en case (10, 1) pour franchir la barrière magique de l'ascenseur express menant aux <strong>Niveaux 4 à 9/10</strong> !</li>
                  <li><strong>STATUETTES OURS & GRENOUILLE (#95 & #96)</strong> : Portes blindées du 4e sous-sol.</li>
                </ul>

                {/* 1-Click Bundle */}
                <div className="pt-2">
                  <button
                    onClick={handleGiveElevatorKeyBundle}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-black text-xs tracking-wide shadow flex items-center justify-center gap-2 transition"
                  >
                    <Key className="w-4 h-4" />
                    <span>🔑 Injecter le Pack Ascenseurs : Bronze Key + Silver Key + Blue Ribbon</span>
                  </button>
                </div>
              </div>

              {/* Individual Item Injections */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Ajout d'objets de quête individuels :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 94, name: "WERDNA'S AMULET", desc: "Amulette de Werdna (#94) - Quête Finale" },
                    { id: 97, name: 'BRONZE KEY', desc: 'Clé de Bronze (#97)' },
                    { id: 98, name: 'SILVER KEY', desc: 'Clé d’Argent (#98)' },
                    { id: 100, name: 'BLUE RIBBON', desc: 'Ruban Bleu d’Accréditation (#100)' },
                    { id: 99, name: 'GOLD KEY', desc: 'Clé d’Or (#99)' },
                    { id: 95, name: 'STATUETTE/BEAR', desc: 'Statuette d’Ours (#95)' },
                    { id: 96, name: 'STATUETTE/FROG', desc: 'Statuette de Grenouille (#96)' },
                  ].map(itm => (
                    <button
                      key={itm.id}
                      onClick={() => handleGiveItem(itm.id, itm.name)}
                      className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition group"
                    >
                      <span className="font-semibold text-slate-200 group-hover:text-amber-300">{itm.desc}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">+ Ajouter</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={handleGiveAllW1QuestItems}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/40 text-xs font-bold transition"
                  >
                    🎁 Donner tous les artefacts de quête W1
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RESTORE / HEAL */}
          {activeTab === 'RESTORE' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <HeartPulse className="w-4 h-4" />
                <span>Restauration & Résurrection Intégrale</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Restaure immédiatement l'intégralité des points de vie (PV Max), réinitialise tous les statuts (mort, cendres, paralysie, pétrification, sommeil) à l'état normal (OK), dissipe le poison et recharge les points de sorts de l'ensemble de la guilde.
              </p>

              <button
                onClick={() => {
                  onRestoreAllHeroes();
                  showNotification("💖 Tous les héros ont été soignés, ressuscités et leurs sorts restaurés !");
                }}
                className="w-full py-3 px-4 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs tracking-wide shadow flex items-center justify-center gap-2 transition"
              >
                <HeartPulse className="w-4 h-4 fill-current" />
                <span>Ressusciter et soigner 100% de la Guilde</span>
              </button>

              <div className="pt-3 border-t border-slate-800 space-y-1.5">
                <button
                  onClick={() => {
                    onRespawnWerdna?.();
                    showNotification("💀 L'Archi-Mage Werdna a été ressuscité dans son antre au Niveau 10 ! Le combat est de nouveau prêt.");
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-purple-200 font-bold text-xs tracking-wide shadow flex items-center justify-center gap-2 transition"
                >
                  <Skull className="w-4 h-4 text-purple-400" />
                  <span>Réanimer l'Archi-Mage Werdna (Niveau 10)</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Permet d'affronter Werdna et sa garde à nouveau en case (17, 3) du Niveau 10 sans recommencer une partie.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-6 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Disponible sur GitHub Pages & Développement (inactif sur les builds de distribution itch.io).</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
