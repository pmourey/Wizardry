/**
 * Wizardry I - Comprehensive Status Effect System
 * Matches authentic Pascal mechanics for afflictions:
 * Poison, Paralysis (PLYZE), Sleep (KATINO), Silence (MONTINO), Stoned, Dead, Ashes
 */
import { TCharacter, TStatus } from '../types/wizardry';

export type TStatusEffectType = 
  | 'POISONED' 
  | 'PARALYZED' 
  | 'ASLEEP' 
  | 'SILENCED' 
  | 'AFRAID' 
  | 'STONED' 
  | 'DEAD' 
  | 'ASHES' 
  | 'LOST';

export interface TActiveStatusEffect {
  id: TStatusEffectType;
  label: string;
  badge: string;
  description: string;
  gameplayPenalty: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: 'Biohazard' | 'Zap' | 'Moon' | 'MicOff' | 'ShieldAlert' | 'Skull' | 'Flame' | 'HelpCircle';
  severity: 'LETHAL' | 'CRITICAL' | 'DEBUFF';
  details?: string;
}

/**
 * Returns an array of all active status effects afflicting a character.
 * A character can be affected by primary physical states (DEAD, PLYZE, ASLEEP)
 * as well as secondary compounding afflictions (POISONED, SILENCED).
 */
export function getActiveStatusEffects(hero: TCharacter, lang: 'en' | 'fr' = 'en'): TActiveStatusEffect[] {
  const effects: TActiveStatusEffect[] = [];
  const isEn = lang === 'en';

  // 1. Primary Statuses
  if (hero.status === 'DEAD') {
    effects.push({
      id: 'DEAD',
      label: isEn ? 'Dead' : 'Mort',
      badge: isEn ? 'DEAD' : 'MORT',
      description: isEn 
        ? "The adventurer has succumbed to wounds or a lethal spell." 
        : "L'aventurier a succombé à ses blessures ou à un sort mortel.",
      gameplayPenalty: isEn 
        ? "Incapable of moving or acting. Requires divine resurrection (DI spell or Temple of Cant)." 
        : "Incapable de se déplacer ou d'agir. Nécessite une résurrection divine (Sort DI ou Temple de Cant).",
      color: 'text-red-400',
      bgColor: 'bg-red-950/60',
      borderColor: 'border-red-500/50',
      iconName: 'Skull',
      severity: 'LETHAL'
    });
  } else if (hero.status === 'ASHES') {
    effects.push({
      id: 'ASHES',
      label: isEn ? 'Ashed' : 'Réduit en Cendres',
      badge: isEn ? 'ASHES' : 'CENDRES',
      description: isEn 
        ? "The body was cremated following a failed resurrection." 
        : "Le corps a été incinéré suite à un échec de résurrection.",
      gameplayPenalty: isEn 
        ? "Precarious state. Only the supreme miracle KADORTO or a high priest can restore life." 
        : "Forme résiduelle précaire. Seul le grand miracle KADORTO ou un prêtre suprême peut le ramener à la vie.",
      color: 'text-orange-400',
      bgColor: 'bg-orange-950/60',
      borderColor: 'border-orange-500/50',
      iconName: 'Flame',
      severity: 'LETHAL'
    });
  } else if (hero.status === 'STONED') {
    effects.push({
      id: 'STONED',
      label: isEn ? 'Petrified' : 'Pétrifié',
      badge: isEn ? 'STONED' : 'PÉTRIFIÉ',
      description: isEn 
        ? "Turned into solid stone by a Gorgon or Basilisk." 
        : "Le corps du héros a été transformé en pierre solide (regard de Méduse ou basilic).",
      gameplayPenalty: isEn 
        ? "Total petrification. Treated as dead in combat until cured by MADI or at the Temple." 
        : "Totalement pétrifié. Traité comme mort au combat jusqu'à guérison par le sort MADI ou au Temple.",
      color: 'text-slate-300',
      bgColor: 'bg-slate-800',
      borderColor: 'border-slate-600',
      iconName: 'ShieldAlert',
      severity: 'CRITICAL'
    });
  } else if (hero.status === 'PLYZE') {
    effects.push({
      id: 'PARALYZED',
      label: isEn ? 'Paralyzed' : 'Paralysé',
      badge: isEn ? 'PLYZE' : 'PARALYSÉ',
      description: isEn 
        ? "Paralyzing venom or MANIFO spell completely paralyzes the nervous system." 
        : "Un poison paralysant ou le sort MANIFO bloque complètement le système nerveux.",
      gameplayPenalty: isEn 
        ? "Unable to attack, cast spells, or act. Persists after combat (DIALKO or Temple required)." 
        : "Incapable d'attaquer, de lancer des sorts ou d'agir. Persiste après le combat (Sort DIALKO ou Temple requis).",
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/60',
      borderColor: 'border-purple-500/50',
      iconName: 'Zap',
      severity: 'CRITICAL'
    });
  } else if (hero.status === 'ASLEEP') {
    effects.push({
      id: 'ASLEEP',
      label: isEn ? 'Asleep' : 'Endormi',
      badge: isEn ? 'ASLEEP' : 'ENDORMI',
      description: isEn 
        ? "Plunged into magical slumber by KATINO or sleep gas." 
        : "Plongé dans un sommeil enchanté par le sort KATINO ou une brume soporifique.",
      gameplayPenalty: isEn 
        ? "Unable to act in combat (+6 AC penalty). 30% chance to wake up each round or when taking damage." 
        : "Incapable d'agir au combat. Peut se réveiller en subissant des dégâts, à la fin du round ou via le sort DIALKO.",
      color: 'text-blue-300',
      bgColor: 'bg-blue-950/60',
      borderColor: 'border-blue-500/50',
      iconName: 'Moon',
      severity: 'DEBUFF'
    });
  } else if (hero.status === 'AFRAID') {
    effects.push({
      id: 'AFRAID',
      label: isEn ? 'Afraid' : 'Effrayé',
      badge: isEn ? 'AFRAID' : 'EFFRAYÉ',
      description: isEn 
        ? "Panicked by a monster's terrifying aura or MORLIS spell." 
        : "Pris de panique face à l'aura terrifiante d'un monstre ou au sort MORLIS.",
      gameplayPenalty: isEn 
        ? "Terrified. Attacks frequently miss and may attempt involuntary flight." 
        : "Pris de panique. Ses attaques manquent souvent leur cible et il peut tenter de fuir involontairement.",
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/60',
      borderColor: 'border-amber-500/50',
      iconName: 'HelpCircle',
      severity: 'DEBUFF'
    });
  }

  // 2. Poison Affliction (Compounding)
  if (hero.poisonAmount && hero.poisonAmount > 0 && hero.status !== 'DEAD' && hero.status !== 'ASHES') {
    effects.push({
      id: 'POISONED',
      label: isEn ? `Poisoned (Level ${hero.poisonAmount})` : `Empoisonné (Niveau ${hero.poisonAmount})`,
      badge: `POISON x${hero.poisonAmount}`,
      description: isEn 
        ? "Virulent venom is coursing through the adventurer's veins." 
        : "Une toxine virulente circule dans le sang de l'aventurier.",
      gameplayPenalty: isEn 
        ? `Inflicts ${hero.poisonAmount} damage every combat round and each dungeon step. Curable with LATUMOFIS or at the Temple.` 
        : `Inflige ${hero.poisonAmount} dégât(s) à chaque round de combat et à chaque pas dans le donjon. Neutralisable avec le sort LATUMOFI ou au Temple.`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/60',
      borderColor: 'border-emerald-500/50',
      iconName: 'Biohazard',
      severity: 'CRITICAL',
      details: isEn ? `${hero.poisonAmount} HP per step / turn` : `${hero.poisonAmount} PV par pas / tour`
    });
  }

  // 3. Magical Silence (MONTINO)
  if (hero.silencedRounds && hero.silencedRounds > 0 && hero.status !== 'DEAD' && hero.status !== 'ASHES') {
    effects.push({
      id: 'SILENCED',
      label: isEn 
        ? `Silenced (${hero.silencedRounds} round${hero.silencedRounds > 1 ? 's' : ''})` 
        : `Silence Magique (${hero.silencedRounds} tour${hero.silencedRounds > 1 ? 's' : ''})`,
      badge: isEn ? `SILENCE (${hero.silencedRounds}R)` : `SILENCE (${hero.silencedRounds}T)`,
      description: isEn 
        ? "Under the anti-magic field effect of MONTINO." 
        : "Sous l'effet de la bulle d'anti-magie du sort MONTINO.",
      gameplayPenalty: isEn 
        ? "Voice is stifled: unable to cast Mage or Priest spells." 
        : "La voix est étouffée : impossible de prononcer les incantations de Mage ou de Prêtre.",
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/60',
      borderColor: 'border-cyan-500/50',
      iconName: 'MicOff',
      severity: 'DEBUFF',
      details: isEn ? `${hero.silencedRounds} round(s) remaining` : `${hero.silencedRounds} tour(s) restant(s)`
    });
  }

  return effects;
}

/**
 * Checks whether a hero is capable of taking physical actions (Attack, Use Item, Run, Parry).
 */
export function canHeroAct(hero: TCharacter, lang: 'en' | 'fr' = 'en'): { canAct: boolean; reason?: string } {
  const isEn = lang === 'en';
  if (hero.status === 'DEAD' || hero.status === 'ASHES') {
    return { canAct: false, reason: isEn ? 'This hero is dead.' : 'Ce héros est mort.' };
  }
  if (hero.status === 'STONED') {
    return { canAct: false, reason: isEn ? 'This hero is petrified into stone.' : 'Ce héros est pétrifié en pierre.' };
  }
  if (hero.status === 'PLYZE') {
    return { canAct: false, reason: isEn ? 'This hero is completely paralyzed.' : 'Ce héros est complètement paralysé.' };
  }
  if (hero.status === 'ASLEEP') {
    return { canAct: false, reason: isEn ? 'This hero is in a deep sleep.' : 'Ce héros est plongé dans un profond sommeil.' };
  }
  if (hero.hpLeft <= 0) {
    return { canAct: false, reason: isEn ? 'Hit points depleted.' : 'Points de vie épuisés.' };
  }
  return { canAct: true };
}

/**
 * Checks whether a hero is capable of casting spells.
 */
export function canHeroCastSpells(hero: TCharacter, lang: 'en' | 'fr' = 'en'): { canCast: boolean; reason?: string } {
  const actCheck = canHeroAct(hero, lang);
  if (!actCheck.canAct) return { canCast: false, reason: actCheck.reason };

  if (hero.silencedRounds && hero.silencedRounds > 0) {
    return { 
      canCast: false, 
      reason: lang === 'en'
        ? `Silence (MONTINO) active! Cannot incant for ${hero.silencedRounds} more round(s).`
        : `Silence magique (MONTINO) actif ! Impossible d'incanter pendant encore ${hero.silencedRounds} tour(s).` 
    };
  }

  return { canCast: true };
}

/**
 * Applies poison damage to a hero.
 */
export function applyPoisonDamage(hero: TCharacter): { damage: number; died: boolean } {
  if (!hero.poisonAmount || hero.poisonAmount <= 0 || hero.status === 'DEAD' || hero.status === 'ASHES') {
    return { damage: 0, died: false };
  }

  const damage = hero.poisonAmount;
  hero.hpLeft = Math.max(0, hero.hpLeft - damage);

  if (hero.hpLeft <= 0) {
    hero.status = 'DEAD';
    return { damage, died: true };
  }

  return { damage, died: false };
}

/**
 * Cures a specific status effect on a character.
 */
export function cureStatus(
  hero: TCharacter, 
  target: 'POISON' | 'PARALYSIS' | 'SLEEP' | 'SILENCE' | 'ALL'
): string {
  let cured = false;
  const messages: string[] = [];

  if (target === 'POISON' || target === 'ALL') {
    if (hero.poisonAmount > 0) {
      hero.poisonAmount = 0;
      messages.push('Le poison est neutralisé');
      cured = true;
    }
  }

  if (target === 'PARALYSIS' || target === 'ALL') {
    if (hero.status === 'PLYZE') {
      hero.status = 'OK';
      messages.push('La paralysie est dissipée');
      cured = true;
    }
  }

  if (target === 'SLEEP' || target === 'ALL') {
    if (hero.status === 'ASLEEP') {
      hero.status = 'OK';
      messages.push('Le héros se réveille de son sommeil');
      cured = true;
    }
  }

  if (target === 'SILENCE' || target === 'ALL') {
    if (hero.silencedRounds && hero.silencedRounds > 0) {
      hero.silencedRounds = 0;
      messages.push('Le silence magique est levé');
      cured = true;
    }
  }

  if (target === 'ALL') {
    if (hero.status === 'AFRAID') {
      hero.status = 'OK';
      messages.push('Le courage revient');
      cured = true;
    }
    if (hero.status === 'STONED') {
      hero.status = 'OK';
      messages.push('La pierre redevient chair vivante');
      cured = true;
    }
  }

  return cured ? messages.join(', ') + '.' : 'Aucune affliction à dissiper.';
}
