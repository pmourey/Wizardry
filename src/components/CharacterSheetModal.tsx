import React, { useState, useEffect } from 'react';
import { 
  TCharacter, 
  TAttributes, 
  TAttrib, 
  TItem 
} from '../types/wizardry';
import { 
  ITEMS_DATABASE, 
  SPELLS,
  getExpForNextLevel,
  getMaxCharacterSpells,
  formatDamageDice,
  recalculateCharacterCombatStats
} from '../data/provingGroundsData';
import { sounds } from '../utils/soundEffects';
import { 
  Shield, 
  Heart, 
  Swords, 
  Sparkles, 
  Coins, 
  Award, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Zap, 
  Package,
  Activity,
  User,
  Info,
  Biohazard,
  Moon,
  MicOff,
  Skull,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { getActiveStatusEffects, TActiveStatusEffect } from '../engine/statusSystem';

interface CharacterSheetModalProps {
  character: TCharacter;
  party: TCharacter[];
  onClose: () => void;
  onUpdateCharacter?: (updated: TCharacter) => void;
  onSelectCharacter?: (index: number) => void;
  currentIndex?: number;
}

const ATTRIBUTE_DETAILS: Record<TAttrib, { label: string; abbr: string; desc: string; iconColor: string; effect: string }> = {
  STRENGTH: {
    label: 'Force',
    abbr: 'FOR',
    desc: 'Détermine la puissance des coups au corps-à-corps, le nombre d\'attaques par tour et les armes lourdes maniables.',
    iconColor: 'text-red-400',
    effect: 'Bonus dégâts & toucher'
  },
  IQ: {
    label: 'Intelligence (I.Q.)',
    abbr: 'INT',
    desc: 'Mesure la capacité intellectuelle et la vitesse d\'apprentissage des puissants sorts de Mage.',
    iconColor: 'text-cyan-400',
    effect: 'Sorts de Mage & décryptage'
  },
  PIETY: {
    label: 'Piété',
    abbr: 'PIE',
    desc: 'Dévotion divine accordant la bénédiction des dieux et l\'apprentissage des miracles de Prêtre.',
    iconColor: 'text-amber-400',
    effect: 'Miracles divins de Prêtre'
  },
  VITALITY: {
    label: 'Vitalité',
    abbr: 'VIT',
    desc: 'Constitution physique régissant les points de vie gagnés à chaque niveau et les chances de survie à la résurrection.',
    iconColor: 'text-emerald-400',
    effect: '+PV par niveau & robustesse'
  },
  AGILITY: {
    label: 'Agilité',
    abbr: 'AGI',
    desc: 'Vitesse de réflexes, rapidité d\'initiative au combat et habileté manuelle pour crocheter les coffres piégés.',
    iconColor: 'text-blue-400',
    effect: 'Initiative combat & esquive'
  },
  LUCK: {
    label: 'Chance',
    abbr: 'CHA',
    desc: 'Facteur mystique protégeant des souffles de monstres, du poison, des sorts de mort subite et des pièges pernicieux.',
    iconColor: 'text-purple-400',
    effect: 'Résistance aux souffles & poisons'
  }
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OK: { label: 'EN FORME', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/30' },
  AFRAID: { label: 'EFFRAYÉ', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/30' },
  ASLEEP: { label: 'ENDORMI', color: 'text-blue-300', bg: 'bg-blue-950/40 border-blue-500/30' },
  PLYZE: { label: 'PARALYSÉ', color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-500/30' },
  STONED: { label: 'PÉTRIFIÉ', color: 'text-slate-400', bg: 'bg-slate-800 border-slate-600' },
  DEAD: { label: 'MORT', color: 'text-red-400', bg: 'bg-red-950/40 border-red-500/30' },
  ASHES: { label: 'CENDRES', color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-500/30' },
  LOST: { label: 'PERDU DANS LE NÉANT', color: 'text-gray-500', bg: 'bg-gray-900 border-gray-700' }
};

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  character,
  party,
  onClose,
  onUpdateCharacter,
  onSelectCharacter,
  currentIndex = 0
}) => {
  const [activeTab, setActiveTab] = useState<'ATTRIBUTES' | 'INVENTORY' | 'SPELLS'>('ATTRIBUTES');
  const [hero, setHero] = useState<TCharacter>(character);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    setHero(character);
  }, [character]);

  // Keyboard navigation (Escape = close, Arrows = previous/next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onSelectCharacter && party.length > 1) {
        const prev = (currentIndex - 1 + party.length) % party.length;
        onSelectCharacter(prev);
        sounds.playTurn();
      } else if (e.key === 'ArrowRight' && onSelectCharacter && party.length > 1) {
        const next = (currentIndex + 1) % party.length;
        onSelectCharacter(next);
        sounds.playTurn();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, party.length, onClose, onSelectCharacter]);

  // Compute Experience progress using authentic ZEXP table (CHNEWLEV)
  const expCurrentTier = getExpForNextLevel(hero.class, hero.charLevel - 1);
  const nextLevelTier = getExpForNextLevel(hero.class, hero.charLevel);
  const expDiff = Math.max(1, nextLevelTier - expCurrentTier);
  const expProgress = Math.min(100, Math.max(0, Math.round(((hero.exp - expCurrentTier) / expDiff) * 100)));
  const maxSpellSlots = getMaxCharacterSpells(hero);

  // Equip / Unequip handler (authentic Pascal EQUIPCHR + ARM4CHAR)
  const handleToggleEquip = (slotIdx: number) => {
    const slot = hero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    if (slot.equipped) {
      if (slot.cursed) {
        setFeedbackMessage(`L'objet ${itm.name} est MAUDIT ! Impossible de le retirer sans bénédiction.`);
        sounds.playBump();
        return;
      }
      slot.equipped = false;
      recalculateCharacterCombatStats(hero);
      setFeedbackMessage(`${itm.name} retiré (CA : ${hero.armorClass} · Dégâts : ${formatDamageDice(hero.wepDamage)}).`);
      sounds.playTurn();
    } else {
      // Unequip any non-cursed item of the same equipment slot type (WEAPON, ARMOR, SHIELD, HELMET, GAUNTLET)
      if (itm.objType !== 'SPECIAL' && itm.objType !== 'MISC') {
        hero.possessions.forEach((other, idx) => {
          if (idx !== slotIdx && other.equipped && !other.cursed) {
            const otherItm = ITEMS_DATABASE.find(i => i.id === other.itemIndex);
            if (otherItm && otherItm.objType === itm.objType) {
              other.equipped = false;
            }
          }
        });
      }
      slot.equipped = true;
      if (itm.cursed || (itm.align !== 'UNALIGN' && itm.align !== hero.align)) {
        slot.cursed = true;
      }
      recalculateCharacterCombatStats(hero);
      setFeedbackMessage(`${itm.name} équipé avec succès (CA : ${hero.armorClass} · Dégâts : ${formatDamageDice(hero.wepDamage)}).`);
      sounds.playDoor();
    }

    const updated = { ...hero };
    setHero(updated);
    if (onUpdateCharacter) onUpdateCharacter(updated);
  };

  const statusInfo = STATUS_CONFIG[hero.status] || STATUS_CONFIG.OK;
  const ageYears = Math.floor(hero.age / 52);
  const activeEffects = getActiveStatusEffects(hero);

  const renderEffectIcon = (name: string, className = "w-3.5 h-3.5") => {
    switch (name) {
      case 'Biohazard': return <Biohazard className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Moon': return <Moon className={className} />;
      case 'MicOff': return <MicOff className={className} />;
      case 'Skull': return <Skull className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      default: return <AlertTriangle className={className} />;
    }
  };

  // Collect known spells
  const knownMageSpells = SPELLS.filter(s => s.spellType === 'MAGE' && hero.spellsKnown[s.id]);
  const knownPriestSpells = SPELLS.filter(s => s.spellType === 'PRIEST' && hero.spellsKnown[s.id]);
  const hasSpells = knownMageSpells.length > 0 || knownPriestSpells.length > 0 || 
    hero.class === 'MAGE' || hero.class === 'PRIEST' || hero.class === 'BISHOP' || 
    hero.class === 'SAMURAI' || hero.class === 'LORD';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-amber-600/40 rounded-2xl shadow-2xl shadow-amber-950/40 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-serif text-lg shadow-inner">
              {hero.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif text-white tracking-wide">{hero.name}</h2>
              </div>
              <p className="text-xs text-slate-400">
                {hero.race} · {hero.class} · Alignement {hero.align} · Âge : {ageYears} ans ({hero.age} sem.)
              </p>
              {/* Active Status Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {activeEffects.map(eff => (
                  <span
                    key={eff.id}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${eff.bgColor} ${eff.borderColor} ${eff.color}`}
                    title={eff.description}
                  >
                    {renderEffectIcon(eff.iconName, "w-3 h-3")}
                    {eff.badge}
                  </span>
                ))}
                {activeEffects.length === 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-950/40 border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    EN FORME
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Roster Switching & Close */}
          <div className="flex items-center gap-2">
            {onSelectCharacter && party.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5 mr-2">
                <button
                  onClick={() => {
                    const prev = (currentIndex - 1 + party.length) % party.length;
                    onSelectCharacter(prev);
                    sounds.playTurn();
                  }}
                  title="Héros précédent (Touche Gauche)"
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono px-1.5 text-amber-400">
                  {currentIndex + 1}/{party.length}
                </span>
                <button
                  onClick={() => {
                    const next = (currentIndex + 1) % party.length;
                    onSelectCharacter(next);
                    sounds.playTurn();
                  }}
                  title="Héros suivant (Touche Droite)"
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={() => { sounds.playTurn(); onClose(); }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
              title="Fermer la fiche (Échap)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vital Quick Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Health */}
          <div className="flex items-center gap-2.5 p-2 bg-slate-900/80 rounded-lg border border-slate-800">
            <Heart className={`w-4 h-4 ${hero.hpLeft < hero.hpMax / 3 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-400">Points de Vie</span>
                <span className={hero.hpLeft < hero.hpMax / 3 ? 'text-red-400 font-bold' : 'text-emerald-300'}>
                  {hero.hpLeft} / {hero.hpMax}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full transition-all duration-300 ${hero.hpLeft < hero.hpMax / 3 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.max(0, Math.min(100, (hero.hpLeft / hero.hpMax) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Armor Class */}
          <div className="flex items-center gap-2.5 p-2 bg-slate-900/80 rounded-lg border border-slate-800">
            <Shield className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">Classe d'Armure (CA)</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{hero.armorClass}</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({hero.armorClass <= 2 ? 'Robuste' : hero.armorClass <= 6 ? 'Moyenne' : 'Vulnérable'})
                </span>
              </div>
            </div>
          </div>

          {/* Level & XP */}
          <div className="flex items-center gap-2.5 p-2 bg-slate-900/80 rounded-lg border border-slate-800">
            <Activity className="w-4 h-4 text-amber-400" />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-400">Niveau {hero.charLevel}</span>
                <span className="text-amber-300">{expProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${expProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gold */}
          <div className="flex items-center gap-2.5 p-2 bg-slate-900/80 rounded-lg border border-slate-800">
            <Coins className="w-4 h-4 text-yellow-400" />
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">Bourse Personnelle</div>
              <div className="text-sm font-bold text-yellow-300">
                {hero.gold.toLocaleString()} <span className="text-[10px] text-yellow-500 font-normal">PO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/40 text-xs">
          <button
            onClick={() => { setActiveTab('ATTRIBUTES'); sounds.playTurn(); }}
            className={`flex items-center gap-2 px-4 py-2 font-bold border-b-2 transition ${
              activeTab === 'ATTRIBUTES' 
                ? 'border-amber-500 text-amber-400 bg-amber-500/10' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Caractéristiques & Combat
          </button>
          <button
            onClick={() => { setActiveTab('INVENTORY'); sounds.playTurn(); }}
            className={`flex items-center gap-2 px-4 py-2 font-bold border-b-2 transition ${
              activeTab === 'INVENTORY' 
                ? 'border-amber-500 text-amber-400 bg-amber-500/10' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Inventaire & Équipement ({hero.possessions.length}/8)
          </button>
          {hasSpells && (
            <button
              onClick={() => { setActiveTab('SPELLS'); sounds.playTurn(); }}
              className={`flex items-center gap-2 px-4 py-2 font-bold border-b-2 transition ${
                activeTab === 'SPELLS' 
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Grimoire de Sorts
            </button>
          )}
        </div>

        {/* Dynamic Feedback Banner */}
        {feedbackMessage && (
          <div className="px-6 py-2 bg-amber-950/40 border-b border-amber-800/40 text-xs text-amber-300 font-medium flex items-center justify-between">
            <span>{feedbackMessage}</span>
            <button 
              onClick={() => setFeedbackMessage(null)} 
              className="text-slate-400 hover:text-white text-[10px]"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: ATTRIBUTES & COMBAT */}
          {activeTab === 'ATTRIBUTES' && (
            <div className="space-y-6">
              {/* Dedicated Status Afflictions Panel */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    État de Santé & Afflictions Actives
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {activeEffects.length > 0 ? `${activeEffects.length} affliction(s) détectée(s)` : 'Sain & Opérationnel'}
                  </span>
                </div>

                {activeEffects.length === 0 ? (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="font-bold text-white">Condition physique optimale :</strong>
                      <span className="text-emerald-300/90 ml-1.5">
                        Le héros est en pleine santé. Aucun poison, paralysie, sommeil magique ou mutisme n'entrave ses capacités.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeEffects.map(eff => (
                      <div
                        key={eff.id}
                        className={`p-3 rounded-xl border ${eff.bgColor} ${eff.borderColor} flex flex-col justify-between space-y-2`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold flex items-center gap-1.5 ${eff.color}`}>
                              {renderEffectIcon(eff.iconName, "w-4 h-4")}
                              {eff.label}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/50 font-mono font-bold text-slate-300 border border-white/10">
                              {eff.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">
                            {eff.description}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-white/10 text-[10px] space-y-0.5">
                          <div className="text-amber-200/90 font-medium">
                            <strong className="text-slate-400 font-normal">Impact mécanique : </strong>
                            {eff.gameplayPenalty}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Core 6 Attributes Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Caractéristiques Principales (Dés de Pascal)
                  </h3>
                  <span className="text-[11px] text-slate-400">Score maximal naturel : 18</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(Object.keys(ATTRIBUTE_DETAILS) as TAttrib[]).map(key => {
                    const info = ATTRIBUTE_DETAILS[key];
                    const val = hero.attrib[key] || 10;
                    const percent = Math.min(100, Math.round((val / 18) * 100));

                    return (
                      <div 
                        key={key} 
                        className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-slate-700 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <span className={`font-mono text-sm font-black ${info.iconColor}`}>{info.abbr}</span>
                              <span>{info.label}</span>
                            </span>
                            <span className="text-base font-black font-mono text-white">
                              {val} <span className="text-[10px] text-slate-500 font-normal">/ 18</span>
                            </span>
                          </div>

                          {/* Progress Meter */}
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                val >= 15 ? 'bg-emerald-500' : val >= 11 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <p className="text-[11px] text-slate-400 leading-snug mb-1">
                            {info.desc}
                          </p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-medium">Effet principal :</span>
                          <span className="text-amber-300 font-semibold">{info.effect}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Combat & Progression Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Attack & Weapon Mastery */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-amber-400" />
                    Capacité Offensive & Maîtrise Martiale
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Frappes par Assaut (Swings) :</span>
                      <strong className="text-white font-mono">{hero.swingCount || 1} coup(s)</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Bonus au Toucher :</span>
                      <strong className="text-emerald-400 font-mono">
                        {hero.hitMod >= 0 ? `+${hero.hitMod}` : hero.hitMod}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Dégâts de Base Arme :</span>
                      <strong className="text-amber-300 font-mono">
                        {formatDamageDice(hero.wepDamage)}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Coup Mortel (Décapitation) :</span>
                      <strong className={hero.critHit ? 'text-red-400 font-bold' : 'text-slate-500'}>
                        {hero.critHit ? 'OUI (Style Ninja)' : 'NON'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Progression & Experience */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Progression & Points d'Expérience
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Expérience Actuelle :</span>
                      <strong className="text-amber-300 font-mono">{hero.exp.toLocaleString()} XP</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Prochain Palier (Niv.{hero.charLevel + 1}) :</span>
                      <strong className="text-white font-mono">{nextLevelTier.toLocaleString()} XP</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">XP Manquante :</span>
                      <strong className="text-emerald-400 font-mono">
                        {Math.max(0, nextLevelTier - hero.exp).toLocaleString()} XP
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Titre Héroïque :</span>
                      <strong className="text-slate-300">
                        {hero.charLevel >= 10 ? 'Maître du Donjon' : hero.charLevel >= 5 ? 'Vétéran Aguérri' : 'Novice de Trebor'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & EQUIPMENT */}
          {activeTab === 'INVENTORY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Équipement & Sac à Dos ({hero.possessions.length}/8 emplacements)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Cliquez sur un objet pour l'équiper ou le retirer. La CA s'ajuste instantanément.
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-300">
                  Classe d'Armure globale : <strong className="text-cyan-400 font-mono text-sm">{hero.armorClass}</strong>
                </div>
              </div>

              {hero.possessions.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-xl text-slate-500 text-xs italic">
                  Aucun objet dans l'inventaire. Visitez le Comptoir de Boltac pour acheter des pièces d'équipement.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hero.possessions.map((slot, idx) => {
                    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
                    if (!itm) return null;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                          slot.equipped 
                            ? 'bg-amber-950/20 border-amber-500/50 shadow-sm' 
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div>
                              <div className="font-bold text-xs text-white flex items-center gap-1.5">
                                <span>{itm.name}</span>
                                {slot.equipped && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded font-bold">
                                    Équipé
                                  </span>
                                )}
                                {slot.cursed && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-red-950 text-red-300 border border-red-500/30 rounded font-bold">
                                    Maudit
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{itm.objType}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-yellow-400">{itm.price} PO</span>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-300 py-1">
                            {itm.armorMod !== 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Protection Armure (CA) :</span>
                                <strong className="text-cyan-400 font-mono">
                                  {itm.armorMod > 0 ? `-${itm.armorMod} CA (Améliore)` : `+${Math.abs(itm.armorMod)} CA`}
                                </strong>
                              </div>
                            )}
                            {itm.objType === 'WEAPON' && itm.wepHpDam && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Dégâts de l'arme :</span>
                                <strong className="text-amber-300 font-mono">
                                  {formatDamageDice(itm.wepHpDam)}
                                  {itm.wepHitMod > 0 ? ` (+${itm.wepHitMod} touch)` : ''}
                                </strong>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <button
                            onClick={() => handleToggleEquip(idx)}
                            className={`px-3 py-1 rounded text-xs font-bold transition ${
                              slot.equipped 
                                ? 'bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700/50' 
                                : 'bg-amber-600 hover:bg-amber-500 text-white'
                            }`}
                          >
                            {slot.equipped ? 'Déséquiper' : 'Équiper'}
                          </button>
                          <span className="text-[10px] text-slate-500">
                            Revente : {Math.max(1, Math.floor(itm.price / 2))} PO
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SPELLS */}
          {activeTab === 'SPELLS' && hasSpells && (
            <div className="space-y-6">
              {/* Silence Alert Banner if afflicted */}
              {hero.silencedRounds && hero.silencedRounds > 0 && (
                <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/50 rounded-xl flex items-center gap-3 text-cyan-200 text-xs">
                  <MicOff className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                  <div>
                    <div className="font-bold text-sm text-cyan-300">Silence Magique Actif (MONTINO)</div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      La voix du héros est mystiquement étouffée pour encore <strong>{hero.silencedRounds} tour(s)</strong>.
                      Aucune incantation de Mage ou miracle de Prêtre ne peut être prononcée tant que cette bulle d'anti-magie subsiste.
                    </p>
                  </div>
                </div>
              )}

              {/* Spell Slots Meter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mage Spell Slots */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Emplacements de Sorts de Mage (Tiers 1 à 7)
                  </h4>
                  <div className="grid grid-cols-7 gap-1.5 pt-1 text-center font-mono">
                    {[1, 2, 3, 4, 5, 6, 7].map(tier => (
                      <div key={tier} className="p-1.5 bg-slate-900 border border-slate-700/60 rounded">
                        <div className="text-[9px] text-slate-400 font-sans">T{tier}</div>
                        <div className="text-sm font-bold text-cyan-300">
                          {hero.mageSpells?.[tier] || 0}
                          <span className="text-[10px] text-slate-500">/{maxSpellSlots.mageSpells[tier] || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priest Spell Slots */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Emplacements de Miracles de Prêtre (Tiers 1 à 7)
                  </h4>
                  <div className="grid grid-cols-7 gap-1.5 pt-1 text-center font-mono">
                    {[1, 2, 3, 4, 5, 6, 7].map(tier => (
                      <div key={tier} className="p-1.5 bg-slate-900 border border-slate-700/60 rounded">
                        <div className="text-[9px] text-slate-400 font-sans">T{tier}</div>
                        <div className="text-sm font-bold text-amber-300">
                          {hero.priestSpells?.[tier] || 0}
                          <span className="text-[10px] text-slate-500">/{maxSpellSlots.priestSpells[tier] || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Known Spells List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Formules Magiques Connues & Maîtrisées
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...knownMageSpells, ...knownPriestSpells].map(spell => (
                    <div 
                      key={spell.id}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white font-serif tracking-wider">{spell.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            spell.spellType === 'MAGE' 
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' 
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}>
                            {spell.spellType} T{spell.tier}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {spell.combat ? 'Combat' : ''}{spell.combat && spell.camp ? ' / ' : ''}{spell.camp ? 'Camp' : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {spell.description}
                      </p>
                    </div>
                  ))}
                  {[...knownMageSpells, ...knownPriestSpells].length === 0 && (
                    <p className="text-xs text-slate-500 italic col-span-2 py-4 text-center">
                      Ce personnage n'a pas encore appris de sorts. Progressez en niveau à l'Auberge pour débloquer des incantations.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500" />
            <span>Fidèle aux statistiques et formules d'origine du code Pascal de Wizardry I (1981).</span>
          </div>
          <button
            onClick={() => { sounds.playTurn(); onClose(); }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
