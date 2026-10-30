import React, { useState, useMemo } from 'react';
import { WIZARDRY_SCENARIOS, WizardryScenarioMeta, getLocalizedScenario } from '../data/scenariosCatalog';
import { TCharacter } from '../types/wizardry';
import { useLanguage, UI_TEXT } from '../utils/language';
import {
  Sparkles,
  Compass,
  Download,
  Upload,
  Play,
  Users,
  HardDrive,
  ArrowRightLeft,
  CheckCircle2,
  Cpu,
  Languages
} from 'lucide-react';

interface ScenarioLocalSummary {
  hasSave: boolean;
  partyCount: number;
  rosterCount: number;
  locationLabel: string;
  maxHeroLevel: number;
}

interface ScenarioMenuViewProps {
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  getStorageKeysForScenario: (scenarioId: string) => {
    party: string;
    roster: string;
    session: string;
    journal: string;
    visited: string;
    usedEvents: string;
  };
}

export const ScenarioMenuView: React.FC<ScenarioMenuViewProps> = ({
  activeScenarioId,
  onSelectScenario,
  getStorageKeysForScenario
}) => {
  const [lang, setLang] = useLanguage();
  const t = UI_TEXT[lang];

  const [selectedId, setSelectedId] = useState<string>(activeScenarioId || 'proving-grounds');
  const [filterTheme, setFilterTheme] = useState<'ALL' | 'LVL1' | 'HIGH' | 'ORIENTAL' | 'GOTHIC' | 'SCIFI'>('ALL');
  const [transferSourceId, setTransferSourceId] = useState<string>('proving-grounds');
  const [transferNotice, setTransferNotice] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState<number>(0);

  const rawSelected = useMemo(
    () => WIZARDRY_SCENARIOS.find(s => s.id === selectedId) || WIZARDRY_SCENARIOS[0],
    [selectedId]
  );

  const selectedScenario = useMemo(
    () => getLocalizedScenario(rawSelected, lang),
    [rawSelected, lang]
  );

  // Compute localStorage summary per scenario
  const scenarioSummaries = useMemo(() => {
    const map: Record<string, ScenarioLocalSummary> = {};
    for (const scen of WIZARDRY_SCENARIOS) {
      const localized = getLocalizedScenario(scen, lang);
      const keys = getStorageKeysForScenario(scen.id);
      let party: TCharacter[] = [];
      let roster: TCharacter[] = [];
      let locationLabel = t.newGame;
      let hasSave = false;

      if (typeof window !== 'undefined') {
        const rawParty = localStorage.getItem(keys.party);
        const rawRoster = localStorage.getItem(keys.roster);
        const rawSession = localStorage.getItem(keys.session);
        if (rawParty || rawRoster || rawSession) {
          hasSave = true;
        }
        try {
          if (rawParty) party = JSON.parse(rawParty);
        } catch { /* ignore */ }
        try {
          if (rawRoster) roster = JSON.parse(rawRoster);
        } catch { /* ignore */ }
        try {
          if (rawSession) {
            const sess = JSON.parse(rawSession);
            if (sess.location === 'MAZE' || sess.location === 'COMBAT' || sess.location === 'CHEST') {
              locationLabel = t.exploringMaze(sess.dungeonLevel || 1, sess.posX ?? 0, sess.posY ?? 0);
            } else if (sess.location === 'GAME_OVER') {
              locationLabel = t.graveyard(sess.dungeonLevel || 1);
            } else {
              locationLabel = t.atCastle(localized.castleName || 'Castle');
            }
          }
        } catch { /* ignore */ }
      }

      const maxHeroLevel = roster.reduce((m, c) => Math.max(m, c.charLevel || 1), 0);
      map[scen.id] = {
        hasSave,
        partyCount: party.length,
        rosterCount: roster.length,
        locationLabel,
        maxHeroLevel
      };
    }
    return map;
  }, [getStorageKeysForScenario, refreshTick, lang, t]);

  const filteredScenarios = useMemo(() => {
    return WIZARDRY_SCENARIOS.filter(s => {
      if (filterTheme === 'ALL') return true;
      if (filterTheme === 'LVL1') return s.minLevel === 1;
      if (filterTheme === 'HIGH') return s.minLevel >= 7;
      return s.theme === filterTheme;
    });
  }, [filterTheme]);

  // Transfer characters from one scenario to selectedScenario (WITHOUT equipment, per Zimlab / Wizardry rules)
  const handleTransferCharacters = () => {
    if (transferSourceId === selectedScenario.id) {
      setTransferNotice(t.transferDiffPrompt);
      return;
    }
    const sourceKeys = getStorageKeysForScenario(transferSourceId);
    const targetKeys = getStorageKeysForScenario(selectedScenario.id);
    const rawSourceRoster = localStorage.getItem(sourceKeys.roster);
    if (!rawSourceRoster) {
      setTransferNotice(t.transferNoHeroes);
      return;
    }

    try {
      const sourceRoster: TCharacter[] = JSON.parse(rawSourceRoster);
      const targetRoster: TCharacter[] = (() => {
        const raw = localStorage.getItem(targetKeys.roster);
        if (raw) {
          try { return JSON.parse(raw); } catch { /* ignore */ }
        }
        return [];
      })();

      const existingNames = new Set(targetRoster.map(c => c.name.toUpperCase()));
      const imported: TCharacter[] = sourceRoster
        .filter(c => !existingNames.has(c.name.toUpperCase()))
        .map(c => ({
          ...c,
          id: `${selectedScenario.id}-${c.id}`,
          possessions: [], // Authentic rule: equipment tables differ across scenarios
          armorClass: 10,
          inMaze: false,
          lostLocation: undefined
        }));

      if (imported.length === 0) {
        setTransferNotice(t.transferAllPresent);
        return;
      }

      const mergedRoster = [...targetRoster, ...imported];
      localStorage.setItem(targetKeys.roster, JSON.stringify(mergedRoster));
      if (!localStorage.getItem(targetKeys.party)) {
        localStorage.setItem(targetKeys.party, JSON.stringify(mergedRoster.slice(0, 6)));
      }
      setRefreshTick(tick => tick + 1);
      setTransferNotice(t.transferSuccess(imported.length, selectedScenario.title));
    } catch {
      setTransferNotice(t.transferError);
    }
  };

  // Export all scenario localStorage keys into a single JSON file
  const handleExportAllSaves = () => {
    const dump: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('wiz1_') || k.startsWith('wiz_'))) {
        dump[k] = localStorage.getItem(k);
      }
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wizardry-local-saves-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAllSaves = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        Object.entries(parsed).forEach(([k, v]) => {
          if ((k.startsWith('wiz1_') || k.startsWith('wiz_')) && typeof v === 'string') {
            localStorage.setItem(k, v);
          }
        });
        setRefreshTick(tick => tick + 1);
        setTransferNotice(t.importSuccess);
      } catch {
        setTransferNotice(t.importInvalid);
      }
    };
    reader.readAsText(file);
  };

  const themeBadge = (theme: WizardryScenarioMeta['theme']) => {
    switch (theme) {
      case 'FANTASY':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/40';
      case 'GOTHIC':
        return 'bg-rose-950/80 text-rose-300 border-rose-600/40';
      case 'ORIENTAL':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40';
      case 'SCIFI':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-600/40';
    }
  };

  const lvl1Count = WIZARDRY_SCENARIOS.filter(s => s.minLevel === 1).length;
  const highCount = WIZARDRY_SCENARIOS.filter(s => s.minLevel >= 7).length;
  const orientalCount = WIZARDRY_SCENARIOS.filter(s => s.theme === 'ORIENTAL').length;
  const gothicCount = WIZARDRY_SCENARIOS.filter(s => s.theme === 'GOTHIC').length;
  const scifiCount = WIZARDRY_SCENARIOS.filter(s => s.theme === 'SCIFI').length;

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Hero Banner */}
        <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900/95 to-amber-950/30 p-5 md:p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.badgeAnthology(WIZARDRY_SCENARIOS.length)}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-black tracking-wider text-white">
                {t.chooseScenario}
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {t.heroDescription}
              </p>
            </div>

            {/* Language Switcher, Backup & LocalStorage Controls */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Language Selector FR | EN */}
              <div className="flex items-center rounded-xl bg-slate-950/90 border border-slate-700 p-1 text-xs font-bold shadow-inner">
                <Languages className="w-3.5 h-3.5 text-amber-400 mx-1.5" />
                <button
                  onClick={() => setLang('fr')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    lang === 'fr'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Afficher l'interface et les résumés en Français"
                >
                  FR
                </button>
                <span className="text-slate-600 px-0.5">|</span>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    lang === 'en'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Display interface and scenario summaries in English"
                >
                  EN
                </button>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.storageLabel}</span>
              </div>

              <button
                onClick={handleExportAllSaves}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-amber-300 transition"
                title={t.exportSavesTooltip}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.exportSaves}</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-sky-300 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{t.importJson}</span>
                <input type="file" accept=".json" onChange={handleImportAllSaves} className="hidden" />
              </label>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/80">
            {[
              { id: 'ALL', label: t.filterAll(WIZARDRY_SCENARIOS.length) },
              { id: 'LVL1', label: t.filterLvl1(lvl1Count) },
              { id: 'HIGH', label: t.filterHigh(highCount) },
              { id: 'ORIENTAL', label: t.filterOriental(orientalCount) },
              { id: 'GOTHIC', label: t.filterGothic(gothicCount) },
              { id: 'SCIFI', label: t.filterScifi(scifiCount) }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTheme(tab.id as typeof filterTheme)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                  filterTheme === tab.id
                    ? 'bg-amber-600 text-white border-amber-400 shadow'
                    : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-Column Layout: Scenario Grid + Selected Scenario Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Scenario Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
            {filteredScenarios.map(rawScen => {
              const scen = getLocalizedScenario(rawScen, lang);
              const summary = scenarioSummaries[scen.id];
              const isSelected = scen.id === selectedScenario.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => {
                    setSelectedId(scen.id);
                    setTransferNotice(null);
                  }}
                  className={`cursor-pointer rounded-xl p-4 border transition flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-400 ring-1 ring-amber-400/50 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        {t.scenarioTag}{scen.number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${themeBadge(scen.theme)}`}>
                          {scen.theme}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                          {scen.recommendedLevel}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-base text-white leading-snug">
                        {scen.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{scen.subtitle}</p>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {scen.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    {summary?.hasSave ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {t.heroSaveSummary(summary.rosterCount, summary.maxHeroLevel)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-500">{t.noLocalSave}</span>
                    )}

                    <span className="text-slate-400 font-mono">{t.floorsCount(scen.floors)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Inspector & Launch Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-4 rounded-2xl border border-slate-800 bg-slate-900/95 p-5 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs font-mono text-amber-400 font-bold">
                    {t.scenarioTag}{selectedScenario.number} • {t.engineTag} {selectedScenario.engineVersion}
                  </div>
                  <h2 className="text-xl font-serif font-black text-white mt-0.5">
                    {selectedScenario.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t.byAuthorYear(selectedScenario.author, selectedScenario.year)}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${themeBadge(selectedScenario.theme)}`}>
                  {selectedScenario.difficulty}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedScenario.description}
              </p>

              {/* Key Specs */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">{t.recommendedLevel}</div>
                  <div className="text-xs font-bold text-amber-300 mt-0.5">{selectedScenario.recommendedLevel}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">{t.depth}</div>
                  <div className="text-xs font-bold text-white mt-0.5">{t.floorsLabel(selectedScenario.floors)}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">{t.sourceDisk}</div>
                  <div className="text-[11px] font-mono text-emerald-400 truncate mt-0.5" title={selectedScenario.diskFileName}>
                    {selectedScenario.diskFileName}
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{t.zimlabNotes}</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                  {selectedScenario.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Local Save Status for Selected Scenario */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-700/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{t.localSessionStatus(selectedScenario.id)}</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {scenarioSummaries[selectedScenario.id]?.locationLabel}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>
                    {t.activeParty} <strong>{scenarioSummaries[selectedScenario.id]?.partyCount || 0}</strong> {t.heroes}
                  </span>
                  <span>
                    {t.rosterGuild} <strong>{scenarioSummaries[selectedScenario.id]?.rosterCount || 0}</strong> {t.registered}
                  </span>
                </div>
              </div>

              {/* Inter-Scenario Character Transfer (without equipment, per Zimlab ReadMe) */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{t.transferHeader}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={transferSourceId}
                    onChange={e => setTransferSourceId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    {WIZARDRY_SCENARIOS.map(s => (
                      <option key={s.id} value={s.id}>
                        {t.transferSelectOption(s.number, s.title, scenarioSummaries[s.id]?.rosterCount || 0)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleTransferCharacters}
                    className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold transition shrink-0"
                  >
                    {t.transferBtn}
                  </button>
                </div>
                {transferNotice && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-700/40 rounded-lg p-2">
                    {transferNotice}
                  </div>
                )}
              </div>

              {!selectedScenario.dataExtracted && (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-700/40 text-[11px] text-amber-200 flex items-start gap-2">
                  <Cpu className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'fr'
                      ? `Ce scénario utilise actuellement sa propre sauvegarde locale isolée sur le moteur Wizardry v3.2. L’extraction automatique de son fichier ${selectedScenario.diskFileName} via scripts/extract_pgmo.py chargera ses cartes, monstres et objets dédiés.`
                      : `This scenario uses its own isolated local save on the Wizardry v3.2 engine. Extraction of its ${selectedScenario.diskFileName} disk via scripts/extract_pgmo.py loads its dedicated maps, monsters, and items.`}
                  </span>
                </div>
              )}

              {/* Launch Button */}
              <button
                onClick={() => onSelectScenario(selectedScenario.id)}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {scenarioSummaries[selectedScenario.id]?.hasSave
                    ? t.resumeBtn(selectedScenario.title)
                    : t.launchBtn(selectedScenario.title)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
