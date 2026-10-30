import React, { useState, useMemo } from 'react';
import { WIZARDRY_SCENARIOS, WizardryScenarioMeta } from '../data/scenariosCatalog';
import { TCharacter } from '../types/wizardry';
import {
  Sword,
  Shield,
  Sparkles,
  Compass,
  FolderUp,
  Download,
  Upload,
  Play,
  Users,
  Layers,
  Award,
  AlertTriangle,
  HardDrive,
  ArrowRightLeft,
  CheckCircle2,
  Cpu
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
  const [selectedId, setSelectedId] = useState<string>(activeScenarioId || 'proving-grounds');
  const [filterTheme, setFilterTheme] = useState<'ALL' | 'LVL1' | 'HIGH' | 'ORIENTAL' | 'GOTHIC' | 'SCIFI'>('ALL');
  const [transferSourceId, setTransferSourceId] = useState<string>('proving-grounds');
  const [transferNotice, setTransferNotice] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState<number>(0);

  const selectedScenario = useMemo(
    () => WIZARDRY_SCENARIOS.find(s => s.id === selectedId) || WIZARDRY_SCENARIOS[0],
    [selectedId]
  );

  // Compute localStorage summary per scenario
  const scenarioSummaries = useMemo(() => {
    const map: Record<string, ScenarioLocalSummary> = {};
    for (const scen of WIZARDRY_SCENARIOS) {
      const keys = getStorageKeysForScenario(scen.id);
      let party: TCharacter[] = [];
      let roster: TCharacter[] = [];
      let locationLabel = 'Nouvelle Partie';
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
              locationLabel = `En expédition (Niv. ${sess.dungeonLevel || 1}, [${sess.posX ?? 0},${sess.posY ?? 0}])`;
            } else if (sess.location === 'GAME_OVER') {
              locationLabel = `Cimetière (Niv. ${sess.dungeonLevel || 1})`;
            } else {
              locationLabel = 'Au Château de Trebor';
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
  }, [getStorageKeysForScenario, refreshTick]);

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
      setTransferNotice('Veuillez choisir un scénario source différent du scénario cible.');
      return;
    }
    const sourceKeys = getStorageKeysForScenario(transferSourceId);
    const targetKeys = getStorageKeysForScenario(selectedScenario.id);
    const rawSourceRoster = localStorage.getItem(sourceKeys.roster);
    if (!rawSourceRoster) {
      setTransferNotice('Aucun personnage trouvé dans la sauvegarde locale du scénario source.');
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
        setTransferNotice('Tous les héros du scénario source sont déjà présents dans ce scénario.');
        return;
      }

      const mergedRoster = [...targetRoster, ...imported];
      localStorage.setItem(targetKeys.roster, JSON.stringify(mergedRoster));
      if (!localStorage.getItem(targetKeys.party)) {
        localStorage.setItem(targetKeys.party, JSON.stringify(mergedRoster.slice(0, 6)));
      }
      setRefreshTick(t => t + 1);
      setTransferNotice(
        `${imported.length} personnage(s) transféré(s) vers "${selectedScenario.title}" (sans équipement, conformément aux règles inter-scénarios Wizardry).`
      );
    } catch {
      setTransferNotice('Erreur lors de la lecture des personnages à transférer.');
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
        setRefreshTick(t => t + 1);
        setTransferNotice('Sauvegardes locales importées avec succès dans le navigateur.');
      } catch {
        setTransferNotice('Fichier JSON de sauvegarde invalide.');
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

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Hero Banner */}
        <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900/95 to-amber-950/30 p-5 md:p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ANTHOLOGIE WIZARDRY ENGINE v3.3 — {WIZARDRY_SCENARIOS.length} SCÉNARIOS</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-black tracking-wider text-white">
                CHOISISSEZ VOTRE SCÉNARIO D’AVENTURE
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-3xl">
                Explorez la trilogie classique officielle (<strong className="text-amber-300">#1 Proving Grounds of the Mad Overlord</strong>, <strong className="text-amber-300">#2 Knight of Diamonds</strong>, <strong className="text-amber-300">#3 The Legacy of Llylgamyn</strong>) ou l’une des 9 campagnes alternatives de la collection <span className="text-amber-200">Zimlab / Snafaru</span>. Chaque scénario dispose de sa propre sauvegarde isolée dans le stockage local de votre navigateur (<code className="text-amber-300">localStorage</code>).
              </p>
            </div>

            {/* Backup & LocalStorage Controls */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stockage : <strong className="text-emerald-400">Navigateur (Local)</strong></span>
              </div>
              <button
                onClick={handleExportAllSaves}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-amber-300 transition"
                title="Exporter toutes vos sauvegardes locales en JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter Sauvegardes</span>
              </button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-sky-300 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Importer JSON</span>
                <input type="file" accept=".json" onChange={handleImportAllSaves} className="hidden" />
              </label>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/80">
            {[
              { id: 'ALL', label: 'Tous les scénarios (10)' },
              { id: 'LVL1', label: 'Débutants Niv. 1+ (8)' },
              { id: 'HIGH', label: 'Vétérans Niv. 7+ / 13+ (2)' },
              { id: 'ORIENTAL', label: 'Cycle Oriental (3)' },
              { id: 'GOTHIC', label: 'Gothique & Cryptes (2)' },
              { id: 'SCIFI', label: 'Sci-Fi 2098 (1)' }
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
          {/* Left Column: 10 Scenario Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
            {filteredScenarios.map(scen => {
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
                        SCÉNARIO #{scen.number}
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
                          {summary.rosterCount} héros (Max N.{summary.maxHeroLevel})
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-500">Aucune sauvegarde locale</span>
                    )}

                    <span className="text-slate-400 font-mono">{scen.floors} niv.</span>
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
                    SCÉNARIO #{selectedScenario.number} • MOTEUR {selectedScenario.engineVersion}
                  </div>
                  <h2 className="text-xl font-serif font-black text-white mt-0.5">
                    {selectedScenario.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Par {selectedScenario.author} ({selectedScenario.year})
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
                  <div className="text-[10px] text-slate-400 uppercase">Niveau Recommandé</div>
                  <div className="text-xs font-bold text-amber-300 mt-0.5">{selectedScenario.recommendedLevel}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Profondeur</div>
                  <div className="text-xs font-bold text-white mt-0.5">{selectedScenario.floors} Étages</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Disquette Source</div>
                  <div className="text-[11px] font-mono text-emerald-400 truncate mt-0.5" title={selectedScenario.diskFileName}>
                    {selectedScenario.diskFileName}
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Notes du Guide du Joueur (Zimlab)</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
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
                    <span>État de la session locale ({selectedScenario.id})</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {scenarioSummaries[selectedScenario.id]?.locationLabel}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>
                    Escouade active : <strong>{scenarioSummaries[selectedScenario.id]?.partyCount || 0}</strong> héros
                  </span>
                  <span>
                    Guilde (Roster) : <strong>{scenarioSummaries[selectedScenario.id]?.rosterCount || 0}</strong> inscrits
                  </span>
                </div>
              </div>

              {/* Inter-Scenario Character Transfer (without equipment, per Zimlab ReadMe) */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Transférer des personnages depuis un autre scénario (sans équipement)</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={transferSourceId}
                    onChange={e => setTransferSourceId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    {WIZARDRY_SCENARIOS.map(s => (
                      <option key={s.id} value={s.id}>
                        #{s.number} - {s.title} ({scenarioSummaries[s.id]?.rosterCount || 0} héros)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleTransferCharacters}
                    className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold transition shrink-0"
                  >
                    Importer
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
                    Ce scénario utilise actuellement sa propre sauvegarde locale isolée sur le moteur Wizardry v3.2. L’extraction automatique de son fichier <code className="text-amber-300">{selectedScenario.diskFileName}</code> via <code className="text-amber-300">scripts/extract_pgmo.py</code> chargera ses cartes, monstres et objets dédiés.
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
                    ? `REPRENDRE "${selectedScenario.title.toUpperCase()}"`
                    : `LANCER "${selectedScenario.title.toUpperCase()}"`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
