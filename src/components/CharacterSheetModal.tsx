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
  recalculateCharacterCombatStats,
  isItemUsable,
  isItemEquippable,
  canHeroEquipItem,
  canClassUseItem,
  getUsableClassesList
} from '../data/provingGroundsData';
import { sounds } from '../utils/soundEffects';
import { getCharacterChevrons } from '../utils/awards';
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
  ShieldAlert,
  FlaskConical,
  Trash2
} from 'lucide-react';
import { getActiveStatusEffects, TActiveStatusEffect } from '../engine/statusSystem';
import { getSpellDescription } from '../engine/spellEngine';
import { useI18n } from '../i18n';

interface CharacterSheetModalProps {
  character: TCharacter;
  party: TCharacter[];
  onClose: () => void;
  onUpdateCharacter?: (updated: TCharacter) => void;
  onSelectCharacter?: (index: number) => void;
  currentIndex?: number;
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  character,
  party,
  onClose,
  onUpdateCharacter,
  onSelectCharacter,
  currentIndex = 0
}) => {
  const { lang, t } = useI18n();
  const [activeTab, setActiveTab] = useState<'ATTRIBUTES' | 'INVENTORY' | 'SPELLS'>('ATTRIBUTES');
  const [hero, setHero] = useState<TCharacter>(character);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const attributeDetails: Record<TAttrib, { label: string; abbr: string; desc: string; iconColor: string; effect: string }> = {
    STRENGTH: {
      ...t.character.attributes.strength,
      iconColor: 'text-red-400',
    },
    IQ: {
      ...t.character.attributes.iq,
      iconColor: 'text-cyan-400',
    },
    PIETY: {
      ...t.character.attributes.piety,
      iconColor: 'text-amber-400',
    },
    VITALITY: {
      ...t.character.attributes.vitality,
      iconColor: 'text-emerald-400',
    },
    AGILITY: {
      ...t.character.attributes.agility,
      iconColor: 'text-blue-400',
    },
    LUCK: {
      ...t.character.attributes.luck,
      iconColor: 'text-purple-400',
    },
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    OK: { label: t.character.statuses.ok, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/30' },
    AFRAID: { label: t.character.statuses.afraid, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/30' },
    ASLEEP: { label: t.character.statuses.asleep, color: 'text-blue-300', bg: 'bg-blue-950/40 border-blue-500/30' },
    PLYZE: { label: t.character.statuses.paralyzed, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-500/30' },
    STONED: { label: t.character.statuses.petrified, color: 'text-slate-400', bg: 'bg-slate-800 border-slate-600' },
    DEAD: { label: t.character.statuses.dead, color: 'text-red-400', bg: 'bg-red-950/40 border-red-500/30' },
    ASHES: { label: t.character.statuses.ashes, color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-500/30' },
    LOST: { label: t.character.statuses.lost, color: 'text-gray-500', bg: 'bg-gray-900 border-gray-700' }
  };

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
        setFeedbackMessage(t.character.cursedCannotRemove(itm.name));
        sounds.playBump();
        return;
      }
      slot.equipped = false;
      recalculateCharacterCombatStats(hero);
      setFeedbackMessage(t.character.unequippedNotice(itm.name, hero.armorClass, formatDamageDice(hero.wepDamage)));
      sounds.playTurn();
    } else {
      // Authentic Pascal Class Proficiency Check (UTILITIE2.TEXT l. 276)
      const check = canHeroEquipItem(hero, itm, lang);
      if (!check.canEquip) {
        setFeedbackMessage(check.reason || (lang === 'fr' ? 'Objet impossible à équiper pour cette classe.' : 'Item cannot be equipped by this class.'));
        sounds.playBump();
        return;
      }

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
      setFeedbackMessage(t.character.equippedNotice(itm.name, hero.armorClass, formatDamageDice(hero.wepDamage)));
      sounds.playDoor();
    }

    const updated = { ...hero };
    setHero(updated);
    if (onUpdateCharacter) onUpdateCharacter(updated);
  };

  const handleBishopIdentify = (slotIdx: number) => {
    sounds.playSpellCast();
    const slot = hero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    // Bishop performing the identification ritual: active hero if Bishop, or first living Bishop in party
    const bishop = hero.class === 'BISHOP' 
      ? hero 
      : party.find(h => h.class === 'BISHOP' && h.status === 'OK') || hero;

    // Authentic Pascal Bishop identification check (Wizardry1_UCSD_Pascal.pas l. 698):
    // (RANDOM MOD 100) < (10 + 5 * bishopLevel)
    const chance = Math.min(95, 10 + (bishop.charLevel || 1) * 5);
    if (Math.random() * 100 < chance) {
      slot.identified = true;
      sounds.playFanfare();
      setFeedbackMessage(t.character.bishopSuccess(bishop.name, itm.name));
    } else {
      // Authentic Pascal curse fumble: (RANDOM MOD 100) < (35 - 3 * bishopLevel)
      const curseChance = Math.max(5, 35 - 3 * (bishop.charLevel || 1));
      if (itm.cursed && Math.random() * 100 < curseChance) {
        slot.identified = true;
        slot.cursed = true;
        slot.equipped = true;
        recalculateCharacterCombatStats(hero);
        sounds.playBump();
        setFeedbackMessage(t.character.bishopCurseFumble(bishop.name, itm.name));
      } else {
        sounds.playBump();
        setFeedbackMessage(t.character.bishopFail(bishop.name));
      }
    }
    const updated = { ...hero };
    setHero(updated);
    if (onUpdateCharacter) onUpdateCharacter(updated);
  };

  const handleUseItem = (slotIdx: number) => {
    const slot = hero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    if (!canClassUseItem(hero.class, itm)) {
      const allowed = getUsableClassesList(itm, false, lang).join(', ') || (lang === 'fr' ? 'Aucune' : 'None');
      setFeedbackMessage(t.character.notQualifiedNotice(hero.name, hero.class, allowed));
      sounds.playBump();
      return;
    }

    sounds.playFanfare();
    let msg = '';
    if (itm.spellPower && itm.spellPower > 0) {
      const sp = SPELLS.find(s => s.id === itm.spellPower);
      if (sp) {
        if (sp.name === 'DIOS' || sp.name === 'DIAL' || sp.name === 'DIALMA') {
          const heal = Math.floor(Math.random() * (sp.name === 'DIOS' ? 8 : sp.name === 'DIAL' ? 16 : 24)) + 1;
          hero.hpLeft = Math.min(hero.hpMax, hero.hpLeft + heal);
          msg = lang === 'fr'
            ? `✨ ${hero.name} utilise ${itm.name} et récupère ${heal} PV (${hero.hpLeft}/${hero.hpMax}).`
            : `✨ ${hero.name} uses ${itm.name} and recovers ${heal} HP (${hero.hpLeft}/${hero.hpMax}).`;
        } else if (sp.name === 'MADI') {
          hero.hpLeft = hero.hpMax;
          hero.poisonAmount = 0;
          hero.status = 'OK';
          msg = lang === 'fr'
            ? `✨ ${hero.name} utilise ${itm.name} : Guérison totale MADI !`
            : `✨ ${hero.name} uses ${itm.name}: Full MADI restoration!`;
        } else if (sp.name === 'LATUMOFI') {
          hero.poisonAmount = 0;
          msg = lang === 'fr'
            ? `✨ ${hero.name} utilise ${itm.name} : Le poison est neutralisé.`
            : `✨ ${hero.name} uses ${itm.name}: Poison is neutralized.`;
        } else {
          msg = lang === 'fr'
            ? `✨ ${hero.name} libère le pouvoir de ${sp.name} via ${itm.name} !`
            : `✨ ${hero.name} unleashes ${sp.name} power via ${itm.name}!`;
        }
      }
    } else if (itm.healPts && itm.healPts > 0) {
      const heal = itm.healPts * 6;
      hero.hpLeft = Math.min(hero.hpMax, hero.hpLeft + heal);
      msg = lang === 'fr'
        ? `💚 ${hero.name} boit ${itm.name} et récupère ${heal} PV (${hero.hpLeft}/${hero.hpMax}).`
        : `💚 ${hero.name} drinks ${itm.name} and recovers ${heal} HP (${hero.hpLeft}/${hero.hpMax}).`;
    } else if (itm.name.toUpperCase().includes('POISON') || itm.name.toUpperCase().includes('LATUMOFIS')) {
      hero.poisonAmount = 0;
      msg = lang === 'fr'
        ? `💚 ${hero.name} boit ${itm.name} : Le poison est guéri.`
        : `💚 ${hero.name} drinks ${itm.name}: Poison cured.`;
    } else {
      msg = lang === 'fr' ? `✨ ${hero.name} utilise ${itm.name}.` : `✨ ${hero.name} uses ${itm.name}.`;
    }

    if (itm.changeChance > 0 && Math.random() * 100 < itm.changeChance) {
      if (!itm.changeTo || itm.changeTo === 0) {
        if (slot.equipped) slot.equipped = false;
        hero.possessions.splice(slotIdx, 1);
        msg += lang === 'fr' ? ` L'objet a été entièrement consommé.` : ` The item was fully consumed.`;
      } else {
        slot.itemIndex = itm.changeTo;
        const newItem = ITEMS_DATABASE.find(i => i.id === itm.changeTo);
        msg += lang === 'fr'
          ? ` L'objet s'est transformé en ${newItem?.name || 'objet inerte'}.`
          : ` The item transformed into ${newItem?.name || 'inert item'}.`;
      }
    }

    recalculateCharacterCombatStats(hero);
    const updated = { ...hero };
    setHero(updated);
    setFeedbackMessage(msg);
    if (onUpdateCharacter) onUpdateCharacter(updated);
  };

  const handleDropItem = (slotIdx: number) => {
    const slot = hero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    const displayName = slot.identified ? (itm?.name || (lang === 'fr' ? 'Objet' : 'Item')) : (itm?.nameUnknown || (lang === 'fr' ? 'Objet non identifié' : 'Unidentified item'));

    if (slot.equipped && slot.cursed) {
      setFeedbackMessage(lang === 'fr'
        ? `💀 Impossible de jeter ${displayName} : cet objet maudit est scellé sur votre corps !`
        : `💀 Cannot drop ${displayName}: this cursed item is bound to your body!`);
      sounds.playBump();
      return;
    }

    if (!window.confirm(t.character.dropConfirm(displayName))) {
      return;
    }

    if (slot.equipped) {
      slot.equipped = false;
    }
    hero.possessions.splice(slotIdx, 1);
    recalculateCharacterCombatStats(hero);

    const updated = { ...hero };
    setHero(updated);
    if (onUpdateCharacter) onUpdateCharacter(updated);
    sounds.playTurn();
    setFeedbackMessage(t.character.dropSuccess(displayName));
  };

  const statusInfo = statusConfig[hero.status] || statusConfig.OK;
  const ageYears = Math.floor(hero.age / 52);
  const activeEffects = getActiveStatusEffects(hero, lang);

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
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full h-full sm:h-auto max-w-3xl bg-slate-900 border-0 sm:border border-amber-600/40 rounded-none sm:rounded-2xl shadow-2xl shadow-amber-950/40 overflow-hidden flex flex-col max-h-screen sm:max-h-[92vh] safe-top safe-bottom safe-left safe-right"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-serif text-base sm:text-lg shadow-inner shrink-0">
              {hero.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {getCharacterChevrons(hero) && (
                  <span
                    className="text-amber-400 font-bold font-mono text-sm sm:text-base bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-500/40 shrink-0"
                    title="Insigne de victoire (Garde d'Honneur de Trebor)"
                  >
                    "{getCharacterChevrons(hero)}"
                  </span>
                )}
                <h2 className="text-base sm:text-xl font-bold font-serif text-white tracking-wide truncate">{hero.name}</h2>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {t.character.races[hero.race.toLowerCase() as keyof typeof t.character.races] || hero.race} · {t.character.classes[hero.class.toLowerCase() as keyof typeof t.character.classes] || hero.class} · {t.character.alignments[hero.align.toLowerCase() as keyof typeof t.character.alignments] || hero.align} · {ageYears} {t.character.years}
              </p>
              {/* Active Status Badges */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5">
                {getCharacterChevrons(hero).includes('>') && (
                  <span
                    className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border border-amber-500/50 bg-amber-950/70 text-amber-300 flex items-center gap-1 shadow-sm"
                    title={t.character.honorGuardDesc}
                  >
                    <Award className="w-3 h-3 text-amber-400" />
                    {t.character.honorGuardTitle}
                  </span>
                )}
                {activeEffects.map(eff => (
                  <span
                    key={eff.id}
                    className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border flex items-center gap-1 ${eff.bgColor} ${eff.borderColor} ${eff.color}`}
                    title={eff.description}
                  >
                    {renderEffectIcon(eff.iconName, "w-3 h-3")}
                    {eff.badge}
                  </span>
                ))}
                {activeEffects.length === 0 && (
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border bg-emerald-950/40 border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {t.character.statuses.ok}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Roster Switching & Close */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {onSelectCharacter && party.length > 1 && (
              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5 mr-1 sm:mr-2">
                <button
                  onClick={() => {
                    const prev = (currentIndex - 1 + party.length) % party.length;
                    onSelectCharacter(prev);
                    sounds.playTurn();
                  }}
                  title={t.character.prevHeroTooltip}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] sm:text-[11px] font-mono px-1 sm:px-1.5 text-amber-400">
                  {currentIndex + 1}/{party.length}
                </span>
                <button
                  onClick={() => {
                    const next = (currentIndex + 1) % party.length;
                    onSelectCharacter(next);
                    sounds.playTurn();
                  }}
                  title={t.character.nextHeroTooltip}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={() => { sounds.playTurn(); onClose(); }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center"
              title={t.character.closeTooltip}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vital Quick Bar */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
          {/* Health */}
          <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-slate-900/80 rounded-lg border border-slate-800">
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${hero.hpLeft < hero.hpMax / 3 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[10px] sm:text-[11px] font-semibold">
                <span className="text-slate-400 truncate">{t.character.hpShort}</span>
                <span className={hero.hpLeft < hero.hpMax / 3 ? 'text-red-400 font-bold' : 'text-emerald-300'}>
                  {hero.hpLeft}/{hero.hpMax}
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
          <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-slate-900/80 rounded-lg border border-slate-800">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold truncate">{t.character.acShort}</div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                <span>{hero.armorClass}</span>
                <span className="text-[9px] text-slate-500 font-normal hidden sm:inline">
                  ({hero.armorClass <= 2 ? (lang === 'fr' ? 'Robuste' : 'Sturdy') : hero.armorClass <= 6 ? (lang === 'fr' ? 'Moyenne' : 'Average') : (lang === 'fr' ? 'Vulnérable' : 'Vulnerable')})
                </span>
              </div>
            </div>
          </div>

          {/* Level & XP */}
          <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-slate-900/80 rounded-lg border border-slate-800">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[10px] sm:text-[11px] font-semibold">
                <span className="text-slate-400 truncate">{t.character.lvlShort}{hero.charLevel}</span>
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
          <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-slate-900/80 rounded-lg border border-slate-800">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold truncate">{t.character.gold}</div>
              <div className="text-xs sm:text-sm font-bold text-yellow-300 truncate">
                {hero.gold.toLocaleString()} <span className="text-[9px] text-yellow-500 font-normal">{t.character.goldShort}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 pt-2 sm:pt-3 border-b border-slate-800 bg-slate-900/40 text-xs overflow-x-auto whitespace-nowrap no-scrollbar">
          <button
            onClick={() => { setActiveTab('ATTRIBUTES'); sounds.playTurn(); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 font-bold border-b-2 transition shrink-0 ${
              activeTab === 'ATTRIBUTES' 
                ? 'border-amber-500 text-amber-400 bg-amber-500/10' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.character.attributesTab}</span>
          </button>
          <button
            onClick={() => { setActiveTab('INVENTORY'); sounds.playTurn(); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 font-bold border-b-2 transition shrink-0 ${
              activeTab === 'INVENTORY' 
                ? 'border-amber-500 text-amber-400 bg-amber-500/10' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t.character.inventoryTab} ({hero.possessions.length}/8)</span>
          </button>
          {hasSpells && (
            <button
              onClick={() => { setActiveTab('SPELLS'); sounds.playTurn(); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 font-bold border-b-2 transition shrink-0 ${
                activeTab === 'SPELLS' 
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.character.spellsTab}</span>
            </button>
          )}
        </div>

        {/* Dynamic Feedback Banner */}
        {feedbackMessage && (
          <div className="px-3 sm:px-6 py-2 bg-amber-950/40 border-b border-amber-800/40 text-xs text-amber-300 font-medium flex items-center justify-between">
            <span>{feedbackMessage}</span>
            <button 
              onClick={() => setFeedbackMessage(null)} 
              className="text-slate-400 hover:text-white text-[10px] p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Content Area */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {/* TAB 1: ATTRIBUTES & COMBAT */}
          {activeTab === 'ATTRIBUTES' && (
            <div className="space-y-6">
              {/* Dedicated Status Afflictions Panel */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    {lang === 'fr' ? 'État de Santé & Afflictions Actives' : 'Health Status & Active Afflictions'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {activeEffects.length > 0
                      ? (lang === 'fr' ? `${activeEffects.length} affliction(s) détectée(s)` : `${activeEffects.length} affliction(s) detected`)
                      : (lang === 'fr' ? 'Sain & Opérationnel' : 'Healthy & Ready')}
                  </span>
                </div>

                {activeEffects.length === 0 ? (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="font-bold text-white">
                        {lang === 'fr' ? 'Condition physique optimale :' : 'Optimal physical condition:'}
                      </strong>
                      <span className="text-emerald-300/90 ml-1.5">
                        {lang === 'fr'
                          ? "Le héros est en pleine santé. Aucun poison, paralysie, sommeil magique ou mutisme n'entrave ses capacités."
                          : 'The adventurer is in full health. No poison, paralysis, magical sleep, or silence impairs their abilities.'}
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
                            <strong className="text-slate-400 font-normal">
                              {lang === 'fr' ? 'Impact mécanique : ' : 'Gameplay impact: '}
                            </strong>
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
                    {lang === 'fr' ? 'Caractéristiques Principales (Dés de Pascal)' : 'Core Attributes (Pascal Dice)'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'fr' ? 'Score maximal naturel : 18' : 'Natural maximum score: 18'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(Object.keys(attributeDetails) as TAttrib[]).map(key => {
                    const info = attributeDetails[key];
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
                          <span className="text-slate-500 font-medium">
                            {lang === 'fr' ? 'Effet principal :' : 'Primary effect:'}
                          </span>
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
                    {lang === 'fr' ? 'Capacité Offensive & Maîtrise Martiale' : 'Offensive Capability & Martial Skill'}
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">
                        {lang === 'fr' ? 'Frappes par Assaut (Swings) :' : 'Attacks per Round (Swings):'}
                      </span>
                      <strong className="text-white font-mono">
                        {hero.swingCount || 1} {lang === 'fr' ? 'coup(s)' : 'swing(s)'}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">
                        {lang === 'fr' ? 'Bonus au Toucher :' : 'Hit Roll Bonus:'}
                      </span>
                      <strong className="text-emerald-400 font-mono">
                        {hero.hitMod >= 0 ? `+${hero.hitMod}` : hero.hitMod}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">
                        {lang === 'fr' ? 'Dégâts de Base Arme :' : 'Base Weapon Damage:'}
                      </span>
                      <strong className="text-amber-300 font-mono">
                        {formatDamageDice(hero.wepDamage)}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">
                        {lang === 'fr' ? 'Coup Mortel (Décapitation) :' : 'Critical Strike (Decapitation):'}
                      </span>
                      <strong className={hero.critHit ? 'text-red-400 font-bold' : 'text-slate-500'}>
                        {hero.critHit
                          ? (lang === 'fr' ? 'OUI (Style Ninja)' : 'YES (Ninja Style)')
                          : (lang === 'fr' ? 'NON' : 'NO')}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Progression & Experience */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    {lang === 'fr' ? "Progression & Points d'Expérience" : 'Progression & Experience Points'}
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">
                        {lang === 'fr' ? 'Expérience Actuelle :' : 'Current Experience:'}
                      </span>
                      <strong className="text-amber-300 font-mono">{hero.exp.toLocaleString()} XP</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">
                        {lang === 'fr' ? `Prochain Palier (Niv.${hero.charLevel + 1}) :` : `Next Level (Lvl.${hero.charLevel + 1}):`}
                      </span>
                      <strong className="text-white font-mono">{nextLevelTier.toLocaleString()} XP</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">
                        {lang === 'fr' ? 'XP Manquante :' : 'XP Needed:'}
                      </span>
                      <strong className="text-emerald-400 font-mono">
                        {Math.max(0, nextLevelTier - hero.exp).toLocaleString()} XP
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">
                        {lang === 'fr' ? 'Titre Héroïque :' : 'Heroic Rank:'}
                      </span>
                      <strong className="text-slate-300">
                        {hero.charLevel >= 10
                          ? (lang === 'fr' ? 'Maître du Donjon' : 'Dungeon Master')
                          : hero.charLevel >= 5
                            ? (lang === 'fr' ? 'Vétéran Aguérri' : 'Seasoned Veteran')
                            : (lang === 'fr' ? 'Novice de Trebor' : 'Novice of Trebor')}
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
                    {lang === 'fr'
                      ? `Équipement & Sac à Dos (${hero.possessions.length}/8 emplacements)`
                      : `Equipment & Backpack (${hero.possessions.length}/8 slots)`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'fr'
                      ? "Cliquez sur un objet pour l'équiper ou le retirer. La CA s'ajuste instantanément."
                      : 'Click an item to equip or unequip it. AC recalculates immediately.'}
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-300">
                  {lang === 'fr' ? "Classe d'Armure globale :" : 'Overall Armor Class:'}{' '}
                  <strong className="text-cyan-400 font-mono text-sm">{hero.armorClass}</strong>
                </div>
              </div>

              {hero.possessions.length >= 8 && (
                <div className="p-2.5 bg-amber-950/60 border border-amber-600/50 rounded-lg flex items-center gap-2 text-amber-200 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>{lang === 'fr' ? 'Sac plein (8/8) !' : 'Backpack full (8/8)!'}</strong>{' '}
                    {lang === 'fr'
                      ? 'Vous pouvez jeter des objets encombrants ou inutiles pour libérer de la place.'
                      : 'You can drop unnecessary items to free up space.'}
                  </span>
                </div>
              )}

              {hero.possessions.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-xl text-slate-500 text-xs italic">
                  {lang === 'fr'
                    ? "Aucun objet dans l'inventaire. Visitez le Comptoir de Boltac pour acheter des pièces d'équipement."
                    : "No items in inventory. Visit Boltac's Trading Post to purchase equipment."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hero.possessions.map((slot, idx) => {
                    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
                    if (!itm) return null;

                    const isProficient = canClassUseItem(hero.class, itm);
                    const equippable = isItemEquippable(itm);
                    const displayName = slot.identified ? itm.name : (itm.nameUnknown || (lang === 'fr' ? 'OBJET INCONNU' : 'UNIDENTIFIED ITEM'));
                    const bishopInParty = hero.class === 'BISHOP' 
                      ? hero 
                      : party.find(h => h.class === 'BISHOP' && h.status === 'OK');
                    const sellPrice = slot.identified ? Math.max(1, Math.floor(itm.price / 2)) : 1;

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
                              <div className="font-bold text-xs text-white flex items-center gap-1.5 flex-wrap">
                                <span>{displayName}</span>
                                {!slot.identified && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-950/80 text-amber-300 border border-amber-600/40 rounded font-bold">
                                    {t.castle.unidentBadge}
                                  </span>
                                )}
                                {slot.equipped && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded font-bold">
                                    {t.castle.equippedBadge}
                                  </span>
                                )}
                                {slot.cursed && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-red-950 text-red-300 border border-red-500/30 rounded font-bold">
                                    {t.castle.cursedBadge}
                                  </span>
                                )}
                                {slot.identified && equippable && !isProficient && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-rose-950/80 text-rose-300 border border-rose-800/60 rounded font-bold" title={lang === 'fr' ? `Incompatible avec ${hero.class}` : `Incompatible with ${hero.class}`}>
                                    {t.castle.incompatibleBadge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{itm.objType}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-yellow-400">
                              {slot.identified ? `${itm.price} ${t.character.goldShort}` : `? ${t.character.goldShort}`}
                            </span>
                          </div>

                          {slot.identified ? (
                            <div className="space-y-1 text-[11px] text-slate-300 py-1">
                              {itm.armorMod !== 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">{lang === 'fr' ? "Protection Armure (CA) :" : "Armor Protection (AC):"}</span>
                                  <strong className="text-cyan-400 font-mono">
                                    {itm.armorMod > 0 ? `-${itm.armorMod} CA` : `+${Math.abs(itm.armorMod)} CA`}
                                  </strong>
                                </div>
                              )}
                              {itm.objType === 'WEAPON' && itm.wepHpDam && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">{lang === 'fr' ? "Dégâts de l'arme :" : "Weapon Damage:"}</span>
                                  <strong className="text-amber-300 font-mono">
                                    {formatDamageDice(itm.wepHpDam)}
                                    {itm.wepHitMod > 0 ? ` (+${itm.wepHitMod} touch)` : ''}
                                  </strong>
                                </div>
                              )}
                              {equippable && (
                                <div className="flex justify-between text-[10px] pt-0.5">
                                  <span className="text-slate-400">{lang === 'fr' ? "Classes autorisées :" : "Allowed Classes:"}</span>
                                  <span className={isProficient ? "text-slate-300 font-mono" : "text-rose-400 font-bold font-mono"}>
                                    {getUsableClassesList(itm, true, lang).join(', ') || (lang === 'fr' ? 'Aucune' : 'None')}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-2 text-[11px] text-slate-400 italic">
                              {lang === 'fr' ? "Propriétés et modificateurs cachés avant identification." : "Properties and bonuses hidden until identified."}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            {!slot.identified && bishopInParty && (
                              <button
                                onClick={() => handleBishopIdentify(idx)}
                                className="px-2.5 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                                title={lang === 'fr'
                                  ? `Faire expertiser et identifier par ${bishopInParty.name} (${bishopInParty.class} Niv. ${bishopInParty.charLevel})`
                                  : `Appraise and identify by ${bishopInParty.name} (${bishopInParty.class} Lvl. ${bishopInParty.charLevel})`}
                              >
                                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                                <span>{lang === 'fr' ? `Identifier ${hero.id !== bishopInParty.id ? `(${bishopInParty.name})` : ''}` : `Identify ${hero.id !== bishopInParty.id ? `(${bishopInParty.name})` : ''}`}</span>
                              </button>
                            )}
                            {(equippable || slot.equipped) && (
                              <button
                                onClick={() => handleToggleEquip(idx)}
                                className={`px-3 py-1 rounded text-xs font-bold transition ${
                                  slot.equipped 
                                    ? 'bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700/50' 
                                    : !isProficient
                                      ? 'bg-slate-800 hover:bg-rose-950/70 text-slate-400 hover:text-rose-200 border border-slate-700 hover:border-rose-700/60'
                                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                                }`}
                                title={!slot.equipped && !isProficient ? (lang === 'fr' ? `Incompatible avec ${hero.class}. Autorisés : ${getUsableClassesList(itm, false, lang).join(', ')}` : `Incompatible with ${hero.class}. Allowed: ${getUsableClassesList(itm, false, lang).join(', ')}`) : undefined}
                              >
                                {slot.equipped ? t.character.unequipBtn : t.character.equipBtn}
                              </button>
                            )}
                            {isItemUsable(itm) && (
                              <button
                                onClick={() => handleUseItem(idx)}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                title={lang === 'fr' ? "Utiliser / Boire / Invoquer cet objet" : "Use / Drink / Invoke item"}
                              >
                                <FlaskConical className="w-3.5 h-3.5 text-emerald-200" />
                                <span>{t.character.useBtn}</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDropItem(idx)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-700/50 rounded text-xs font-semibold transition flex items-center gap-1 shadow-sm active:scale-95"
                              title={lang === 'fr' ? "Jeter définitivement cet objet avec confirmation" : "Discard this item permanently with confirmation"}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{t.character.dropBtn}</span>
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {lang === 'fr' ? 'Revente :' : 'Sell value:'} {sellPrice} {t.character.goldShort}
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
                    <div className="font-bold text-sm text-cyan-300">
                      {lang === 'fr' ? 'Silence Magique Actif (MONTINO)' : 'Magical Silence Active (MONTINO)'}
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {lang === 'fr'
                        ? `La voix du héros est mystiquement étouffée pour encore ${hero.silencedRounds} tour(s). Aucune incantation de Mage ou miracle de Prêtre ne peut être prononcée tant que cette bulle d'anti-magie subsiste.`
                        : `The adventurer's voice is mystically suppressed for another ${hero.silencedRounds} round(s). No Mage spells or Priest miracles can be cast while this anti-magic field persists.`}
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
                    {lang === 'fr' ? 'Emplacements de Sorts de Mage (Tiers 1 à 7)' : 'Mage Spell Points (Tiers 1 to 7)'}
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
                    {lang === 'fr' ? 'Emplacements de Miracles de Prêtre (Tiers 1 à 7)' : 'Priest Miracle Points (Tiers 1 to 7)'}
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
                  {lang === 'fr' ? 'Formules Magiques Connues & Maîtrisées' : 'Known & Mastered Spells'}
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
                        {getSpellDescription(spell, lang)}
                      </p>
                    </div>
                  ))}
                  {[...knownMageSpells, ...knownPriestSpells].length === 0 && (
                    <p className="text-xs text-slate-500 italic col-span-2 py-4 text-center">
                      {t.character.noSpellsKnown}
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
            <span>
              {lang === 'fr'
                ? "Fidèle aux statistiques et formules d'origine du code Pascal de Wizardry I (1981)."
                : "Faithful to the authentic statistics and mechanics of Wizardry I UCSD Pascal (1981)."}
            </span>
          </div>
          <button
            onClick={() => { sounds.playTurn(); onClose(); }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition text-xs"
          >
            {t.common.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
