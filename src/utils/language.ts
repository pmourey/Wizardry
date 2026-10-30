import { useState, useEffect } from 'react';

export type AppLanguage = 'en' | 'fr';

const LANG_STORAGE_KEY = 'wiz_app_lang';

export const getAppLanguage = (): AppLanguage => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'fr' || saved === 'en') return saved;
  }
  return 'en'; // Default to English per request
};

export const setAppLanguage = (lang: AppLanguage) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent('wizardry_lang_change', { detail: lang }));
  }
};

export function useLanguage(): [AppLanguage, (lang: AppLanguage) => void] {
  const [lang, setLangState] = useState<AppLanguage>(getAppLanguage);

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppLanguage>;
      if (customEvent.detail && (customEvent.detail === 'en' || customEvent.detail === 'fr')) {
        setLangState(customEvent.detail);
      }
    };
    window.addEventListener('wizardry_lang_change', handleLangChange);
    return () => window.removeEventListener('wizardry_lang_change', handleLangChange);
  }, []);

  const changeLang = (newLang: AppLanguage) => {
    setLangState(newLang);
    setAppLanguage(newLang);
  };

  return [lang, changeLang];
}

export const UI_TEXT = {
  en: {
    scenarios: 'Scenarios',
    backToGame: 'Return to Game',
    keyboardLayoutTitle: (layout: string) =>
      `Current keyboard layout: ${layout} (${layout === 'AZERTY' ? 'Z=Forward, Q=Left, D=Right' : 'W=Forward, A=Left, D=Right'}). Click to toggle.`,
    musicActive: (title: string) => `Ambient music active (${title}) — Click to mute`,
    musicInactive: 'Enable ambient music (We Love Wizardry)',
    music: 'Music',
    mute: 'Mute',
    sfxMute: 'Mute sound effects (SFX)',
    sfxUnmute: 'Enable sound effects (SFX)',
    exportPySide6: 'Export PySide6',

    // ScenarioMenuView
    badgeAnthology: (count: number) => `WIZARDRY ENGINE ANTHOLOGY v3.3 — ${count} SCENARIOS`,
    chooseScenario: 'CHOOSE YOUR ADVENTURE SCENARIO',
    heroDescription:
      'Explore the official classic trilogy (#1 Proving Grounds of the Mad Overlord, #2 Knight of Diamonds, #3 The Legacy of Llylgamyn) or one of the 9 alternative campaigns from the Zimlab / Snafaru collection. Each scenario features its own isolated save in your browser local storage (localStorage).',
    storageLabel: 'Storage: Browser (Local)',
    exportSaves: 'Export Saves',
    exportSavesTooltip: 'Export all your local saves to JSON',
    importJson: 'Import JSON',

    // Filters
    filterAll: (count: number) => `All Scenarios (${count})`,
    filterLvl1: (count: number) => `Beginners Lvl 1+ (${count})`,
    filterHigh: (count: number) => `Veterans Lvl 7+ / 13+ (${count})`,
    filterOriental: (count: number) => `Oriental Cycle (${count})`,
    filterGothic: (count: number) => `Gothic & Crypts (${count})`,
    filterScifi: (count: number) => `Sci-Fi 2098 (${count})`,

    // Scenario Cards
    scenarioTag: 'SCENARIO #',
    engineTag: 'ENGINE',
    noLocalSave: 'No local save',
    heroSaveSummary: (heroes: number, maxLvl: number) => `${heroes} heroes (Max Lvl ${maxLvl})`,
    floorsCount: (floors: number) => `${floors} fl.`,

    // Inspector
    byAuthorYear: (author: string, year: string) => `By ${author} (${year})`,
    recommendedLevel: 'RECOMMENDED LEVEL',
    depth: 'DEPTH',
    floorsLabel: (floors: number) => `${floors} Floors`,
    sourceDisk: 'SOURCE DISK',
    zimlabNotes: "Player's Guide Notes (Zimlab)",
    localSessionStatus: (id: string) => `Local session status (${id})`,
    activeParty: 'Active party:',
    rosterGuild: 'Guild (Roster):',
    heroes: 'heroes',
    registered: 'registered',
    newGame: 'New Game',
    exploringMaze: (lvl: number, x: number, y: number) => `Exploring Maze (Floor ${lvl}, [${x},${y}])`,
    graveyard: (lvl: number) => `Graveyard (Floor ${lvl})`,
    atCastle: (name: string) => `At ${name}`,

    // Transfer
    transferHeader: 'Transfer characters from another scenario (without equipment)',
    transferSelectOption: (num: number, title: string, count: number) => `#${num} - ${title} (${count} heroes)`,
    transferBtn: 'Import',
    transferDiffPrompt: 'Please choose a source scenario different from the destination scenario.',
    transferNoHeroes: 'No characters found in the source scenario local save.',
    transferAllPresent: 'All characters from the source scenario are already present in this scenario.',
    transferSuccess: (count: number, title: string) =>
      `${count} character(s) transferred to "${title}" (without equipment, per authentic Wizardry inter-scenario rules).`,
    transferError: 'Error reading characters to transfer.',
    importSuccess: 'Local saves successfully imported into browser.',
    importInvalid: 'Invalid save JSON file.',

    // Launch
    resumeBtn: (title: string) => `RESUME "${title.toUpperCase()}"`,
    launchBtn: (title: string) => `LAUNCH "${title.toUpperCase()}"`,

    // Castle
    welcomeToCastle: (name: string) => `Welcome to: ${name}. Choose your destination.`,
    welcomeFallback: (title: string) => `Welcome to the Lands of ${title}`,
  },
  fr: {
    scenarios: 'Scénarios',
    backToGame: 'Retour au Jeu',
    keyboardLayoutTitle: (layout: string) =>
      `Disposition clavier actuelle : ${layout} (${layout === 'AZERTY' ? 'Z=Avancer, Q=Gauche, D=Droite' : 'W=Avancer, A=Gauche, D=Droite'}). Cliquer pour basculer AZERTY / QWERTY.`,
    musicActive: (title: string) => `Musique d'ambiance active (${title}) — Cliquer pour couper`,
    musicInactive: "Activer la musique d'ambiance (We Love Wizardry)",
    music: 'Musique',
    mute: 'Muet',
    sfxMute: 'Couper les bruitages (SFX)',
    sfxUnmute: 'Activer les bruitages (SFX)',
    exportPySide6: 'Export PySide6',

    // ScenarioMenuView
    badgeAnthology: (count: number) => `ANTHOLOGIE WIZARDRY ENGINE v3.3 — ${count} SCÉNARIOS`,
    chooseScenario: 'CHOISISSEZ VOTRE SCÉNARIO D’AVENTURE',
    heroDescription:
      'Explorez la trilogie classique officielle (#1 Proving Grounds of the Mad Overlord, #2 Knight of Diamonds, #3 The Legacy of Llylgamyn) ou l’une des 9 campagnes alternatives de la collection Zimlab / Snafaru. Chaque scénario dispose de sa propre sauvegarde isolée dans le stockage local de votre navigateur (localStorage).',
    storageLabel: 'Stockage : Navigateur (Local)',
    exportSaves: 'Exporter Sauvegardes',
    exportSavesTooltip: 'Exporter toutes vos sauvegardes locales en JSON',
    importJson: 'Importer JSON',

    // Filters
    filterAll: (count: number) => `Tous les scénarios (${count})`,
    filterLvl1: (count: number) => `Débutants Niv. 1+ (${count})`,
    filterHigh: (count: number) => `Vétérans Niv. 7+ / 13+ (${count})`,
    filterOriental: (count: number) => `Cycle Oriental (${count})`,
    filterGothic: (count: number) => `Gothique & Cryptes (${count})`,
    filterScifi: (count: number) => `Sci-Fi 2098 (${count})`,

    // Scenario Cards
    scenarioTag: 'SCÉNARIO #',
    engineTag: 'MOTEUR',
    noLocalSave: 'Aucune sauvegarde locale',
    heroSaveSummary: (heroes: number, maxLvl: number) => `${heroes} héros (Max N.${maxLvl})`,
    floorsCount: (floors: number) => `${floors} niv.`,

    // Inspector
    byAuthorYear: (author: string, year: string) => `Par ${author} (${year})`,
    recommendedLevel: 'NIVEAU RECOMMANDÉ',
    depth: 'PROFONDEUR',
    floorsLabel: (floors: number) => `${floors} Étages`,
    sourceDisk: 'DISQUETTE SOURCE',
    zimlabNotes: 'Notes du Guide du Joueur (Zimlab)',
    localSessionStatus: (id: string) => `État de la session locale (${id})`,
    activeParty: 'Escouade active :',
    rosterGuild: 'Guilde (Roster) :',
    heroes: 'héros',
    registered: 'inscrits',
    newGame: 'Nouvelle Partie',
    exploringMaze: (lvl: number, x: number, y: number) => `En expédition (Niv. ${lvl}, [${x},${y}])`,
    graveyard: (lvl: number) => `Cimetière (Niv. ${lvl})`,
    atCastle: (name: string) => `Au ${name}`,

    // Transfer
    transferHeader: 'Transférer des personnages depuis un autre scénario (sans équipement)',
    transferSelectOption: (num: number, title: string, count: number) => `#${num} - ${title} (${count} héros)`,
    transferBtn: 'Importer',
    transferDiffPrompt: 'Veuillez choisir un scénario source différent du scénario cible.',
    transferNoHeroes: 'Aucun personnage trouvé dans la sauvegarde locale du scénario source.',
    transferAllPresent: 'Tous les héros du scénario source sont déjà présents dans ce scénario.',
    transferSuccess: (count: number, title: string) =>
      `${count} personnage(s) transféré(s) vers "${title}" (sans équipement, conformément aux règles inter-scénarios Wizardry).`,
    transferError: 'Erreur lors de la lecture des personnages à transférer.',
    importSuccess: 'Sauvegardes locales importées avec succès dans le navigateur.',
    importInvalid: 'Fichier JSON de sauvegarde invalide.',

    // Launch
    resumeBtn: (title: string) => `REPRENDRE "${title.toUpperCase()}"`,
    launchBtn: (title: string) => `LANCER "${title.toUpperCase()}"`,

    // Castle
    welcomeToCastle: (name: string) => `Bienvenue à : ${name}. Choisissez votre destination.`,
    welcomeFallback: (title: string) => `Bienvenue dans les Terres de ${title}`,
  }
};
