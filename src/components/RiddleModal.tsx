/* eslint-disable */
/**
 * RIDDLE MODAL COMPONENT
 * Interactive riddle prompt with text input, answer validation,
 * case-insensitive matching, multi-language support (FR/EN),
 * and quest reward / mechanism unlock resolution.
 */
import React, { useState, useEffect, useRef } from 'react';
import { TMazeEvent } from '../types/wizardry';
import { useI18n } from '../i18n';
import { 
  HelpCircle, 
  X, 
  Sparkles, 
  AlertCircle, 
  Languages, 
  Key, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';

interface RiddleModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: TMazeEvent;
  x: number;
  y: number;
  dungeonLevel: number;
  onSuccess: (answerGiven: string, event: TMazeEvent) => void;
}

/**
 * Normalizes input text for forgiving riddle answer matching
 */
export function normalizeRiddleText(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/['".,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Strips articles in French & English (le, la, l', the, a, an...) */
export function stripRiddleArticles(text: string): string {
  return text.replace(/^(L|LE|LA|LES|UN|UNE|DES|DU|DE|THE|A|AN)\s+/, '');
}

/**
 * Known canonical synonyms and French translations for classic Wizardry riddles
 */
const RIDDLE_SYNONYMS: Record<string, string[]> = {
  // Wizardry 3: Legacy of Llylgamyn
  "AIR": ["AIR", "L'AIR", "L AIR", "THE AIR", "DE L'AIR", "AIR PUR"],
  "ABDUL SENT YOU": ["ABDUL SENT YOU", "ABDUL", "ABDUL SENT ME", "ABDUL M ENVOIE", "ABDUL VOUS ENVOIE"],
  "FIRE": ["FIRE", "FEU", "LE FEU", "THE FIRE", "FLAME", "LA FLAMME", "FLAMME"],
  "THE CHARIOT": ["THE CHARIOT", "CHARIOT", "LE CHARIOT", "LE CHARIOT DE TAROT"],
  "WHEEL": ["WHEEL", "THE WHEEL", "ROUE", "LA ROUE"],
  "DEATH": ["DEATH", "THE DEATH", "MORT", "LA MORT", "LA CARTE DE LA MORT"],

  // Wizardry 2: Knight of Diamonds
  "SHIELD": ["SHIELD", "THE SHIELD", "A SHIELD", "BOUCLIER", "LE BOUCLIER", "UN BOUCLIER"],
  "THE KNIGHT OF DIAMONDS": ["THE KNIGHT OF DIAMONDS", "KNIGHT OF DIAMONDS", "LE CHEVALIER DE DIAMANT", "CHEVALIER DE DIAMANT"],

  // Other Scenarios (Scarlet Brotherhood, Black Stone, Dragon Quest, Nihonbashi, Emperor's Seal)
  "36-24-36-W": ["36 24 36 W", "362436W", "36-24-36W", "36-24-36 W"],
  "BLACK": ["BLACK", "NOIR", "LE NOIR"],
  "RING": ["RING", "THE RING", "ANNEAU", "L ANNEAU", "BAGUE", "LA BAGUE"],
  "ZEN": ["ZEN"],
  "DAN": ["DAN"],
  "KOI": ["KOI"],
  "YUI": ["YUI"],
  "XI": ["XI"],
  "RICKSHAW": ["RICKSHAW", "POUSSE POUSSE", "LE POUSSE POUSSE", "POUSSE-POUSSE"],
  "SHURIKEN": ["SHURIKEN", "SHURIKENS", "ETOILE NINJA", "ÉTOILE NINJA"]
};

/**
 * Checks whether user input satisfies expected riddle answer
 */
export function isRiddleAnswerCorrect(input: string, expectedAnswer: string): boolean {
  const normInput = normalizeRiddleText(input);
  const normExpected = normalizeRiddleText(expectedAnswer);

  if (!normInput || !normExpected) return false;
  if (normInput === normExpected) return true;
  if (normInput.replace(/\s+/g, '') === normExpected.replace(/\s+/g, '')) return true;

  const strippedInput = stripRiddleArticles(normInput);
  const strippedExpected = stripRiddleArticles(normExpected);
  if (strippedInput === strippedExpected) return true;

  // Synonyms check
  for (const [key, syns] of Object.entries(RIDDLE_SYNONYMS)) {
    const normKey = normalizeRiddleText(key);
    if (normExpected === normKey || stripRiddleArticles(normExpected) === stripRiddleArticles(normKey)) {
      for (const s of syns) {
        const normS = normalizeRiddleText(s);
        if (normInput === normS || strippedInput === stripRiddleArticles(normS)) return true;
      }
    }
  }

  return false;
}

export const RiddleModal: React.FC<RiddleModalProps> = ({
  isOpen,
  onClose,
  event,
  x,
  y,
  dungeonLevel,
  onSuccess
}) => {
  const { lang, t } = useI18n();
  const [playerInput, setPlayerInput] = useState<string>('');
  const [showOriginalText, setShowOriginalText] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'ERROR' | 'SUCCESS'; text: string } | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPlayerInput('');
      setStatusMessage(null);
      setIsSolved(false);
      setShowOriginalText(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, event]);

  if (!isOpen) return null;

  const rawLines = event.message || [];
  const expectedAnswer = event.answer || '';

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSolved) {
      onClose();
      return;
    }

    const trimmed = playerInput.trim();
    if (!trimmed) {
      setStatusMessage({
        type: 'ERROR',
        text: lang === 'fr' 
          ? "Veuillez saisir une réponse." 
          : "Please enter an answer."
      });
      return;
    }

    const correct = isRiddleAnswerCorrect(trimmed, expectedAnswer);
    if (correct) {
      setIsSolved(true);
      setStatusMessage({
        type: 'SUCCESS',
        text: lang === 'fr'
          ? "✨ Réponse exacte ! Le mécanisme de l'énigme s'enclenche et la voie s'ouvre !"
          : "✨ Correct answer! The mechanism unlocks and the way opens!"
      });
      onSuccess(trimmed, event);
    } else {
      setStatusMessage({
        type: 'ERROR',
        text: lang === 'fr'
          ? "Rien ne se produit... Ce n'est pas la réponse attendue. Réfléchissez bien ou explorez d'autres couloirs !"
          : "Nothing happens... That is not the expected answer. Ponder the clues or explore elsewhere!"
      });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
      onClick={isSolved ? onClose : undefined}
    >
      <div 
        className="max-w-xl w-full max-h-[90vh] overflow-y-auto bg-slate-950 border-2 border-amber-500/90 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100 ring-2 ring-amber-500/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <HelpCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-amber-400 font-serif font-black tracking-wide text-base uppercase">
                {lang === 'fr' ? "Énigme du Donjon" : "Dungeon Riddle"}
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {lang === 'fr' ? `Niveau ${dungeonLevel} • Coordonnées (${x}, ${y})` : `Floor ${dungeonLevel} • Coordinates (${x}, ${y})`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {rawLines.length > 0 && (
              <button
                onClick={() => setShowOriginalText(prev => !prev)}
                className="px-2.5 py-1 text-[11px] rounded-lg font-mono font-semibold transition border border-amber-500/40 bg-slate-900 hover:bg-slate-800 text-amber-300 flex items-center gap-1.5"
                title={lang === 'fr' ? 'Basculer texte original anglais' : 'Toggle original text'}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{showOriginalText ? 'Version FR' : 'Original EN'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title={lang === 'fr' ? 'Fermer (Échap)' : 'Close (Esc)'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Riddle Text Card */}
        <div className="bg-slate-900/90 rounded-xl p-4 sm:p-5 border border-amber-600/30 font-mono text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap shadow-inner selection:bg-amber-500/30">
          {rawLines.join('\n')}
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-fadeIn ${
            statusMessage.type === 'SUCCESS' 
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200' 
              : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
          }`}>
            {statusMessage.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{statusMessage.text}</span>
          </div>
        )}

        {/* Input Form */}
        {!isSolved ? (
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'fr' ? "Votre réponse à l'énigme :" : "Your answer to the riddle:"}</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                value={playerInput}
                onChange={e => setPlayerInput(e.target.value)}
                placeholder={lang === 'fr' ? "Saisissez la réponse..." : "Type your answer..."}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-amber-500/50 focus:border-amber-400 text-white font-mono text-xs sm:text-sm placeholder-slate-500 outline-none transition shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'fr' ? "Valider la réponse (Entrée)" : "Submit Answer (Enter)"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
              >
                {lang === 'fr' ? "Abandonner" : "Cancel"}
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-2">
            <button
              autoFocus
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>{lang === 'fr' ? "Continuer l'exploration" : "Continue Exploration"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
