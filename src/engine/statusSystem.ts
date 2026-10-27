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
export function getActiveStatusEffects(hero: TCharacter): TActiveStatusEffect[] {
  const effects: TActiveStatusEffect[] = [];

  // 1. Primary Statuses
  if (hero.status === 'DEAD') {
    effects.push({
      id: 'DEAD',
      label: 'Mort',
      badge: 'MORT',
      description: 'L\'aventurier a succombé à ses blessures ou à un sort mortel.',
      gameplayPenalty: 'Incapable de se déplacer ou d\'agir. Nécessite une résurrection divine (Sort DI ou Temple de Cant).',
      color: 'text-red-400',
      bgColor: 'bg-red-950/60',
      borderColor: 'border-red-500/50',
      iconName: 'Skull',
      severity: 'LETHAL'
    });
  } else if (hero.status === 'ASHES') {
    effects.push({
      id: 'ASHES',
      label: 'Réduit en Cendres',
      badge: 'CENDRES',
      description: 'Le corps a été incinéré suite à un échec de résurrection.',
      gameplayPenalty: 'Forme résiduelle précaire. Seul le grand miracle KADORTO ou un prêtre suprême peut le ramener à la vie.',
      color: 'text-orange-400',
      bgColor: 'bg-orange-950/60',
      borderColor: 'border-orange-500/50',
      iconName: 'Flame',
      severity: 'LETHAL'
    });
  } else if (hero.status === 'STONED') {
    effects.push({
      id: 'STONED',
      label: 'Pétrifié',
      badge: 'PÉTRIFIÉ',
      description: 'Le corps du héros a été transformé en pierre solide (regard de Méduse ou basilic).',
      gameplayPenalty: 'Totalement pétrifié. Traité comme mort au combat jusqu\'à guérison par le sort MADI ou au Temple.',
      color: 'text-slate-300',
      bgColor: 'bg-slate-800',
      borderColor: 'border-slate-600',
      iconName: 'ShieldAlert',
      severity: 'CRITICAL'
    });
  } else if (hero.status === 'PLYZE') {
    effects.push({
      id: 'PARALYZED',
      label: 'Paralysé',
      badge: 'PARALYSÉ',
      description: 'Un poison paralysant ou le sort MANIFO bloque complètement le système nerveux.',
      gameplayPenalty: 'Incapable d\'attaquer, de lancer des sorts ou d\'agir. Persiste après le combat (Sort DIALKO ou Temple requis).',
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/60',
      borderColor: 'border-purple-500/50',
      iconName: 'Zap',
      severity: 'CRITICAL'
    });
  } else if (hero.status === 'ASLEEP') {
    effects.push({
      id: 'ASLEEP',
      label: 'Endormi',
      badge: 'ENDORMI',
      description: 'Plongé dans un sommeil enchanté par le sort KATINO ou une brume soporifique.',
      gameplayPenalty: 'Incapable d\'agir au combat. Peut se réveiller en subissant des dégâts, à la fin du round ou via le sort DIALKO.',
      color: 'text-blue-300',
      bgColor: 'bg-blue-950/60',
      borderColor: 'border-blue-500/50',
      iconName: 'Moon',
      severity: 'DEBUFF'
    });
  } else if (hero.status === 'AFRAID') {
    effects.push({
      id: 'AFRAID',
      label: 'Effrayé',
      badge: 'EFFRAYÉ',
      description: 'Pris de panique face à l\'aura terrifiante d\'un monstre ou au sort MORLIS.',
      gameplayPenalty: 'Pris de panique. Ses attaques manquent souvent leur cible et il peut tenter de fuir involontairement.',
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
      label: `Empoisonné (Niveau ${hero.poisonAmount})`,
      badge: `POISON x${hero.poisonAmount}`,
      description: `Une toxine virulente circule dans le sang de l'aventurier.`,
      gameplayPenalty: `Inflige ${hero.poisonAmount} dégât(s) à chaque round de combat et à chaque pas dans le donjon. Neutralisable avec le sort LATUMOFI ou au Temple.`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/60',
      borderColor: 'border-emerald-500/50',
      iconName: 'Biohazard',
      severity: 'CRITICAL',
      details: `${hero.poisonAmount} PV par pas / tour`
    });
  }

  // 3. Magical Silence (MONTINO)
  if (hero.silencedRounds && hero.silencedRounds > 0 && hero.status !== 'DEAD' && hero.status !== 'ASHES') {
    effects.push({
      id: 'SILENCED',
      label: `Silence Magique (${hero.silencedRounds} tour${hero.silencedRounds > 1 ? 's' : ''})`,
      badge: `SILENCE (${hero.silencedRounds}T)`,
      description: 'Sous l\'effet de la bulle d\'anti-magie du sort MONTINO.',
      gameplayPenalty: 'La voix est étouffée : impossible de prononcer les incantations de Mage ou de Prêtre.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/60',
      borderColor: 'border-cyan-500/50',
      iconName: 'MicOff',
      severity: 'DEBUFF',
      details: `${hero.silencedRounds} tour(s) restant(s)`
    });
  }

  return effects;
}

/**
 * Checks whether a hero is capable of taking physical actions (Attack, Use Item, Run, Parry).
 */
export function canHeroAct(hero: TCharacter): { canAct: boolean; reason?: string } {
  if (hero.status === 'DEAD' || hero.status === 'ASHES') {
    return { canAct: false, reason: 'Ce héros est mort.' };
  }
  if (hero.status === 'STONED') {
    return { canAct: false, reason: 'Ce héros est pétrifié en pierre.' };
  }
  if (hero.status === 'PLYZE') {
    return { canAct: false, reason: 'Ce héros est complètement paralysé.' };
  }
  if (hero.status === 'ASLEEP') {
    return { canAct: false, reason: 'Ce héros est plongé dans un profond sommeil.' };
  }
  if (hero.hpLeft <= 0) {
    return { canAct: false, reason: 'Points de vie épuisés.' };
  }
  return { canAct: true };
}

/**
 * Checks whether a hero is capable of casting spells.
 */
export function canHeroCastSpells(hero: TCharacter): { canCast: boolean; reason?: string } {
  const actCheck = canHeroAct(hero);
  if (!actCheck.canAct) return { canCast: false, reason: actCheck.reason };

  if (hero.silencedRounds && hero.silencedRounds > 0) {
    return { 
      canCast: false, 
      reason: `Silence magique (MONTINO) actif ! Impossible d'incanter pendant encore ${hero.silencedRounds} tour(s).` 
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
