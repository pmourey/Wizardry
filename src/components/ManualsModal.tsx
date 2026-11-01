import React, { useState, useMemo, useEffect } from 'react';
import { MANUALS_CATALOG, ManualItem } from '../data/manualsCatalog';
import { useLanguage } from '../utils/language';
import {
  BookOpen,
  Download,
  ExternalLink,
  Search,
  X,
  FileText,
  Sparkles,
  Compass,
  Scroll,
  Wrench,
  Layers,
  Archive,
  Globe
} from 'lucide-react';

interface ManualsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScenarioId?: string;
}

export const ManualsModal: React.FC<ManualsModalProps> = ({
  isOpen,
  onClose,
  initialScenarioId
}) => {
  const [lang] = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'OFFICIAL' | 'FAN_SCENARIO' | 'SPELLS_GRIMOIRE' | 'TOOLS_MODDING'>('ALL');
  const [languageFilter, setLanguageFilter] = useState<'ALL' | 'FR' | 'EN'>('ALL');

  // Pre-filter if an initialScenarioId was passed
  useEffect(() => {
    if (isOpen && initialScenarioId) {
      const match = MANUALS_CATALOG.find(m => m.scenarioId === initialScenarioId);
      if (match) {
        if (match.category === 'OFFICIAL') {
          setActiveCategory('OFFICIAL');
        } else if (match.category === 'FAN_SCENARIO') {
          setActiveCategory('FAN_SCENARIO');
        }
      }
    }
  }, [isOpen, initialScenarioId]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = useMemo(() => {
    return MANUALS_CATALOG.filter(item => {
      // Category filter
      if (activeCategory !== 'ALL' && item.category !== activeCategory) {
        return false;
      }
      // Language filter
      if (languageFilter !== 'ALL') {
        if (item.language !== languageFilter && item.language !== 'MULTI') {
          return false;
        }
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const subMatch = item.subtitle.toLowerCase().includes(q);
        const authorMatch = item.author.toLowerCase().includes(q);
        const descMatch = (lang === 'fr' ? item.descriptionFr : item.descriptionEn).toLowerCase().includes(q);
        const badgeMatch = item.badge?.toLowerCase().includes(q);
        return titleMatch || subMatch || authorMatch || descMatch || badgeMatch;
      }
      return true;
    });
  }, [activeCategory, languageFilter, searchQuery, lang]);

  if (!isOpen) return null;

  const categoryCounts = {
    ALL: MANUALS_CATALOG.length,
    OFFICIAL: MANUALS_CATALOG.filter(m => m.category === 'OFFICIAL').length,
    FAN_SCENARIO: MANUALS_CATALOG.filter(m => m.category === 'FAN_SCENARIO').length,
    SPELLS_GRIMOIRE: MANUALS_CATALOG.filter(m => m.category === 'SPELLS_GRIMOIRE').length,
    TOOLS_MODDING: MANUALS_CATALOG.filter(m => m.category === 'TOOLS_MODDING').length,
  };

  const langCounts = {
    ALL: MANUALS_CATALOG.length,
    FR: MANUALS_CATALOG.filter(m => m.language === 'FR' || m.language === 'MULTI').length,
    EN: MANUALS_CATALOG.filter(m => m.language === 'EN' || m.language === 'MULTI').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-amber-600/50 shadow-2xl shadow-amber-950/40 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 md:p-6 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-600/40">
                  {lang === 'fr' ? 'ARCHIVES SIR-TECH, EDICIEL & ZIMLAB' : 'SIR-TECH, EDICIEL & ZIMLAB ARCHIVES'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {MANUALS_CATALOG.length} {lang === 'fr' ? 'documents & manuels référencés (FR & EN)' : 'documents & manuals (FR & EN)'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-black text-amber-200 mt-1">
                {lang === 'fr' ? 'Bibliothèque des Manuels de Jeu (Éditions FR & EN)' : 'Game Manuals Library (FR & EN Editions)'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'fr'
                  ? 'Téléchargez les manuels officiels originaux en Français (Ediciel) et en Anglais (Sir-Tech), ainsi que les guides de Snafaru (Zimlab).'
                  : 'Download official original player manuals in French (Ediciel) and English (Sir-Tech), plus Snafaru’s Zimlab clue books & spell grimoires.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-700"
            title={lang === 'fr' ? 'Fermer (Échap)' : 'Close (Esc)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Category Tabs + Language Filter + Search Input */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', labelFr: `Tous (${categoryCounts.ALL})`, labelEn: `All (${categoryCounts.ALL})`, icon: Layers },
                { id: 'OFFICIAL', labelFr: `Opus 1 à 4 Officiels (${categoryCounts.OFFICIAL})`, labelEn: `Official Wiz 1-4 (${categoryCounts.OFFICIAL})`, icon: Scroll },
                { id: 'FAN_SCENARIO', labelFr: `Scénarios Zimlab (${categoryCounts.FAN_SCENARIO})`, labelEn: `Zimlab Scenarios (${categoryCounts.FAN_SCENARIO})`, icon: Compass },
                { id: 'SPELLS_GRIMOIRE', labelFr: `Grimoires & Sorts (${categoryCounts.SPELLS_GRIMOIRE})`, labelEn: `Spell Grimoires (${categoryCounts.SPELLS_GRIMOIRE})`, icon: Sparkles },
                { id: 'TOOLS_MODDING', labelFr: `Outils & Modding (${categoryCounts.TOOLS_MODDING})`, labelEn: `Tools & Modding (${categoryCounts.TOOLS_MODDING})`, icon: Wrench },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      isActive
                        ? 'bg-amber-600 text-white border-amber-400 shadow'
                        : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? tab.labelFr : tab.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative min-w-[200px] lg:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={lang === 'fr' ? 'Rechercher un manuel, sort...' : 'Search manual, spell...'}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Sub-row: Language Selector Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'fr' ? 'Langue du document :' : 'Document language:'}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLanguageFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition border ${
                    languageFilter === 'ALL'
                      ? 'bg-slate-700 text-white border-slate-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {lang === 'fr' ? `Toutes (${langCounts.ALL})` : `All (${langCounts.ALL})`}
                </button>
                <button
                  onClick={() => setLanguageFilter('FR')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition border flex items-center gap-1 ${
                    languageFilter === 'FR'
                      ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-300'
                  }`}
                >
                  <span>🇫🇷</span>
                  <span>{lang === 'fr' ? `Français (${langCounts.FR})` : `French (${langCounts.FR})`}</span>
                </button>
                <button
                  onClick={() => setLanguageFilter('EN')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition border flex items-center gap-1 ${
                    languageFilter === 'EN'
                      ? 'bg-sky-900/80 text-sky-200 border-sky-500 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-sky-300'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>{lang === 'fr' ? `Anglais (${langCounts.EN})` : `English (${langCounts.EN})`}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              {filteredItems.length} {lang === 'fr' ? 'document(s) affiché(s)' : 'document(s) displayed'}
            </div>
          </div>
        </div>

        {/* Scrollable Document List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">
                {lang === 'fr' ? 'Aucun document ne correspond à vos critères de recherche.' : 'No document found matching your criteria.'}
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); setLanguageFilter('ALL'); }}
                className="text-xs text-amber-400 underline hover:text-amber-300"
              >
                {lang === 'fr' ? 'Réinitialiser tous les filtres' : 'Reset all filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`rounded-xl border transition flex flex-col justify-between p-4 space-y-3 ${
                    item.language === 'FR'
                      ? 'border-emerald-800/40 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/20 hover:border-emerald-500/60'
                      : 'border-slate-800 bg-slate-950/70 hover:border-amber-600/40 hover:bg-slate-950'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Tags row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Format tag */}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                          item.format === 'PDF' 
                            ? 'bg-red-950/60 text-red-300 border-red-700/50' 
                            : 'bg-sky-950/60 text-sky-300 border-sky-700/50'
                        }`}>
                          {item.format} {item.pages ? `• ${item.pages}` : ''}
                        </span>

                        {/* Language Tag */}
                        {item.language === 'FR' && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 flex items-center gap-1">
                            <span>🇫🇷</span>
                            <span>FRANÇAIS</span>
                          </span>
                        )}
                        {item.language === 'EN' && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-sky-950/80 text-sky-300 border border-sky-600/50 flex items-center gap-1">
                            <span>🇬🇧</span>
                            <span>ENGLISH</span>
                          </span>
                        )}
                        {item.language === 'MULTI' && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-purple-950/80 text-purple-300 border border-purple-600/50 flex items-center gap-1">
                            <span>🌐</span>
                            <span>MULTI</span>
                          </span>
                        )}

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {item.year}
                        </span>
                      </div>

                      {item.badge && (
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/40">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Title & Author */}
                    <div>
                      <h3 className="font-serif font-bold text-white text-base leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        {item.subtitle}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {item.author}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lang === 'fr' ? item.descriptionFr : item.descriptionEn}
                    </p>
                  </div>

                  {/* Actions / Download Links */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                    <a
                      href={item.primaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition shadow-sm ${
                        item.language === 'FR'
                          ? 'bg-emerald-700 hover:bg-emerald-600'
                          : 'bg-amber-600 hover:bg-amber-500'
                      }`}
                    >
                      {item.format === 'PDF' ? <Download className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                      <span>{lang === 'fr' ? item.primaryLabelFr : item.primaryLabelEn}</span>
                    </a>

                    {item.secondaryUrl && (
                      <a
                        href={item.secondaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lang === 'fr' ? (item.secondaryLabelFr || 'Lien Miroir') : (item.secondaryLabelEn || 'Mirror Link')}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer with Tribute */}
        <div className="p-3.5 px-6 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {lang === 'fr'
                ? 'Hommage & remerciements à Snafaru (Zimlab), Ediciel France, Museum of Computer Adventure Game History (Mocagh) et Robert Woodhead & Andrew Greenberg (Sir-Tech).'
                : 'Special tribute & thanks to Snafaru (Zimlab), Ediciel France, Mocagh Archive Museum, and Robert Woodhead & Andrew Greenberg (Sir-Tech).'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
