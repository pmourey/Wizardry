# ⚔️ Wizardry I: Proving Grounds of the Mad Overlord & Collection 10 Scénarios (1981–2026)

Une recréation moderne, fidèle et enrichie du jeu de rôle culte de **Sir-Tech (1981)** et de **9 scénarios additionnels** compatibles avec le moteur Apple II v3.2, rétro-ingéniée directement d'après le code source originel en **UCSD Pascal** (`pascal_source/Wizardry1_UCSD_Pascal.pas`) et les images disques `.dsk` d'époque.

Ce projet combine l'authenticité des règles historiques de Wizardry 1 avec une interface web moderne, un menu principal multi-scénarios (10 campagnes complètes), un moteur 3D temps réel Three.js, les portraits originaux des monstres (`SPCCHRS` 80×50), un système de cartographie tactique persistant, un journal d'aventures narratif et le support des claviers **AZERTY** et **QWERTY**.

> 📜 **DIRECTIVE IMPÉRATIVE DE DÉVELOPPEMENT :**
> Pour **toute modification, correction de bogue ou ajout de fonctionnalité** touchant aux règles, tables de monstres, probabilités, calculs de dégâts ou mécanismes du moteur de jeu, **TOUJOURS se référer impérativement au code source Pascal UCSD originel et aux données extraites des images disques Apple II** via `scripts/extract_pgmo.py` (basé sur `WizardryApp`) :
> `pascal_source/Wizardry1_UCSD_Pascal.pas`, `pascal_source/Wiz1A..Wiz1E/`, `src/data/provingGroundsData.ts` et `src/data/scenarios/*Data.ts` (voir également `INSTRUCTIONS_DEVELOPPEUR.md`).

---

## 🏛️ Nature du Projet & Nouveautés

Le projet propose une expérience de *dungeon crawler* à la première personne respectant à la lettre les mécanismes de jeu fondamentaux :
- **Catalogue de 10 Scénarios Jouables (`ScenarioMenuView`)** :
  1. **#1 — Proving Grounds of the Mad Overlord** (*Andrew Greenberg & Robert Woodhead, 1981*)
  2. **#2 — The Black Stone** (*1982*)
  3. **#3 — The Catacombs of Vlad** (*1983*)
  4. **#4 — DragonQuest** (*v1.4 / moteur v3.2*)
  5. **#5 — Knight of the Grave**
  6. **#6 — Scarlet Brotherhood of Hsi-So**
  7. **#7 — Nihonbashi (日本橋)**
  8. **#8 — O'Connor's Mine**
  9. **#9 — The Emperor's Seal**
  10. **#10 — Atomic Wasteland 2098**
  Chaque scénario dispose de ses propres cartes (10 niveaux), objets, monstres, tables d'expérience, messages d'événements, personnages pré-tirés (`ZCHAR`) et de ses **20 portraits de monstres originaux** (`src/assets/monsters/<scenarioId>/pic0.png..pic19.png`), avec une sauvegarde `localStorage` totalement isolée et exportable/importable en JSON.
- **Règles authentiques de Wizardry 1 (UCSD Pascal)** :
  - Système de caractéristiques (`FOR`, `INT`, `PIE`, `VIT`, `AGI`, `CHA`), tables d'expérience `ZEXP` par classe (`CHNEWLEV`), classes d'armure (CA décroissante) et calcul des dégâts d'armes (`THPREC` : `LEVEL`d`HPFAC` + `HPMINAD`, recalculé via `EQUIPCHR` / `ARM4CHAR`).
  - **Attribution et apprentissage des sorts (`SETSPELS`, `SPLPERLV`, `TRY2LRN`)** : calcul fidèle des emplacements de sorts de Mage et de Prêtre (incluant la progression décalée de l'Évêque / *Bishop* : sorts de Mage dès le niveau 1, miracles de Prêtre à partir du niveau 4).
  - **Gain d'XP en combat (`GIVEEXP` / `CALC1EXP` / `TOTALEXP`)** : calcul exact de l'expérience de chaque groupe de monstres vaincu et partage équitable entre les membres survivants (`status === 'OK'`).
  - **Formation dynamique, fuite de groupe et retour au château (`RUNAWAY` & `CHK4WIN`)** :
    - Les personnages morts ou réduits en cendres sont automatiquement déplacés en dernière position afin que les survivants prennent leur place en première ligne.
    - Au retour au Château, les personnages morts sont automatiquement retirés de l'escouade active et confiés au Temple de Cant.
    - L'action **Fuir** s'applique à l'ensemble du groupe selon la formule probabiliste de `PROCEDURE RUNAWAY` (`COMBAT2.TEXT.pas`).
- **Décimation et sauvetage authentique des corps (`LOSTXYL.LOCATION`)** : Un groupe anéanti reste perdu dans le labyrinthe à ses coordonnées exactes (`x, y, étage`), et une expédition de secours doit être formée pour aller hisser les corps et les ramener au Temple de Cant.
- **Moteur 3D moderne & Rétro** : Exploration du dédale en 3D temps réel avec éclairage dynamique à la torche, brume de distance, textures procédurales de pierre, ou bascule instantanée en mode rétro fil de fer (*wireframe*).
- **Cartographie & Mini-carte tactique persistante** : Radar HUD (7×7) et carte globale (20×20) avec brouillard de guerre, orientation, cases spéciales et balises `💀`. **Tous les paramètres d'affichage de la mini-carte** (mode `7×7` ou `20×20`, clairvoyance `DUMAPIC`, légende, visibilité HUD, mode 3D/Fil de fer) sont automatiquement mémorisés lorsque vous revenez en mode labyrinthe.
- **Clavier configurable AZERTY / QWERTY** : Bascule instantanée entre **AZERTY** (`Z` / `Q` / `D`) et **QWERTY** (`W` / `A` / `D`) depuis la barre supérieure ou le panneau d'exploration du donjon, en complément des touches fléchées (`↑` / `←` / `→`).
- **Double cible technologique** : Application Web SPA (React/Vite) déployable sur GitHub Pages (`docs/`) et exportateur de code autonome pour **PySide6 / Python**.

---

## 🏗️ Architecture du Projet

```
├── pascal_source/
│   ├── Wizardry1_UCSD_Pascal.pas    # Code source Pascal UCSD complet extrait des disquettes
│   └── Wiz1A..Wiz1E/*.TEXT.pas      # Unités Pascal UCSD et routines Assembleur 6502 par disquette
├── scripts/
│   └── extract_pgmo.py              # Extracteur UCSD (--all-scenarios : 10 scénarios, monstres PNG & Pascal)
├── src/
│   ├── assets/
│   │   └── monsters/<scenarioId>/   # 200 bitmaps de monstres (pic0.png..pic19.png pour chacun des 10 scénarios)
│   ├── components/
│   │   ├── AdventureJournal.tsx     # Composant Journal d'Aventures
│   │   ├── CastleView.tsx           # Menu et quartiers du Château de Trebor
│   │   ├── CharacterSheetModal.tsx  # Fiche détaillée des caractéristiques, dégâts d'armes et équipement
│   │   ├── ChestView.tsx            # Inspection, désamorçage de pièges et pillage de coffres
│   │   ├── CombatView.tsx           # Moteur visuel et tactique des combats au tour par tour
│   │   ├── DungeonView.tsx          # Exploration 3D, campement, formation et sélecteur AZERTY/QWERTY
│   │   ├── MiniMap.tsx              # Mini-carte SVG avec préférences d'affichage persistantes
│   │   ├── MonsterPicture.tsx       # Affichage des portraits de monstres 80x50 par scénario actif
│   │   ├── PySide6Exporter.tsx      # Exportateur de code source Python / PySide6 autonome
│   │   └── ScenarioMenuView.tsx     # Menu principal de sélection des 10 scénarios et gestion des sauvegardes
│   ├── data/
│   │   ├── provingGroundsData.ts    # Données Wizardry 1, registre multi-scénarios et formules Pascal
│   │   ├── scenariosCatalog.ts      # Catalogue et métadonnées des 10 scénarios
│   │   └── scenarios/*Data.ts       # Bases de données extraites des 9 scénarios alternatifs
│   ├── engine/
│   │   ├── chestEngine.ts           # Moteur des coffres et pièges de Wizardry
│   │   ├── combatEngine.ts          # Moteur des rencontres, initiatives, fuite de groupe, XP et attaques
│   │   ├── dungeonRenderer3D.tsx    # Rendu 3D Three.js (caméra première personne, torche, murs, sols)
│   │   ├── spellEngine.ts           # Résolution des sorts de combat et d'exploration
│   │   └── statusSystem.ts          # Altérations d'état (Poison, Sommeil, Paralysie, Silence, Mort, Cendres)
│   ├── types/
│   │   └── wizardry.ts              # Définitions strictes TypeScript du modèle de données
│   ├── utils/
│   │   └── soundEffects.ts          # Synthétiseur d'effets sonores chiptune (Web Audio API)
│   ├── App.tsx                      # Composant racine, machine à états, persistance par scénario et clavier
│   └── main.tsx                     # Point d'entrée de l'application React
├── docs/                            # Bundle statique de production pour GitHub Pages
├── dist/                            # Sortie de compilation Vite
├── package.json                     # Scripts et dépendances du projet
├── vite.config.ts                   # Configuration Vite avec support Tailwind CSS
└── README.md                        # Documentation générale et technique
```

---

## 🎮 Systèmes et Fonctionnalités Détaillés

### 0. Menu Principal & Sélecteur des 10 Scénarios (`ScenarioMenuView`)
- **Sélection au démarrage** : Choix immédiat entre *Proving Grounds of the Mad Overlord* et les 9 scénarios additionnels (médiéval-fantastique, gothique, oriental, post-apocalyptique).
- **Sauvegardes isolées par scénario** : Chaque scénario conserve son propre registre de héros, son escouade active, ses cartes explorées et son journal d'aventures dans le `localStorage`.
- **Import / Export JSON & Architecture Cloud** : Sauvegarde manuelle en fichier `.json` et guide intégré d'évolution vers une synchronisation Cloud multi-appareils (Supabase / Firebase) et une commercialisation légale.

### 1. Le Château de Trebor (`CastleView`)
- **Taverne de Gilgamesh** :
  - Recrutement et gestion d'une guilde d'aventuriers (1 à 6 membres par expédition).
  - Statut des héros tombés au combat : les personnages décimés dans le dédale affichent `💀 Corps perdu dans le dédale` et les morts ramenés du donjon sont automatiquement déposés au Temple de Cant.
- **Auberge de l'Aventurier** :
  - 5 types de chambres (Écuries gratuites, Paillasses, Suites économiques, marchandes et royales).
  - Récupération des points de vie et recharge des emplacements de sorts de Mage et de Prêtre (`SETSPELS`).
  - Calcul et déclenchement des montées de niveau (`CHNEWLEV`) selon les tables `ZEXP` du scénario actif avec gain de PV max (`MOREHP`), évolution des caractéristiques et apprentissage de nouveaux sorts (`TRY2LRN`).
- **Comptoir de Boltac** :
  - Achat et revente d'armes (avec affichage des dés de dégâts exacts `XdY+Z`), boucliers, armures, casques et objets spéciaux.
  - Mise en commun de l'or de l'escouade (*Pool Gold*) et gestion des objets maudits.
- **Temple Radiant de Cant** :
  - Rituels de résurrection des morts (`DEAD`) et des cendres (`ASHES`) avec probabilité dépendante de la Vitalité, et guérison de la paralysie (`PLYZE`) et de la pétrification (`STONED`).
- **Terrains d'Entraînement** :
  - Création de nouveau héros avec attribution des points bonus et dotation initiale des sorts de niveau 1 (`KEEPCHYN`).

---

### 2. Le Labyrinthe (`DungeonView` & `DungeonRenderer3D`)
- **Rendu Three.js à la première personne** :
  - Rendu immersif des couloirs de pierre avec éclairage dynamique à la torche ou bascule en mode fil de fer (*wireframe retro*) mémorisée entre les combats.
- **Cases et événements authentiques des 10 scénarios** :
  - Murs pleins, portes ouvrables, portes secrètes (`HIDEDOOR`), zones d'obscurité (`DARK`), fosses (`PIT`), chutes (`CHUTE`), ascenseurs (`BUTTONZ`), dalles tournantes (`SPINNER`), téléporteurs (`TRANSFER`), énigmes, passages conditionnés par objet (`ITEM_TO_PASS`) et rencontres fixes (`ENCOUNTE` / `SEARCH_FIGHT`).
- **Mode Campement (`C`)** :
  - Lancement de sorts hors combat (`DIOS`, `DIAL`, `DIALMA`, `MADI`, `LATUMOFI`, `DIALKO`, `DUMAPIC`, `MILWA`, `LOMILWA`, `MAPORFIC`, `KANDI`, `DI`, `KADORTO`, `MALOR`).
  - Identification d'objets par l'Évêque (*Bishop*), échange d'objets entre compagnons et réorganisation tactique de la formation (Avant-garde #1–#3 / Arrière-garde #4–#6).

---

### 3. Minicarte & Cartographie Tactique Persistante (`MiniMap`)
- **Conservation automatique des réglages** : Vos préférences de minicarte (vue `7×7` ou `20×20`, clairvoyance `DUMAPIC`, affichage de la légende, ouverture/fermeture du HUD) sont sauvegardées dans `localStorage` (`wiz_minimap_prefs`) et restaurées automatiquement à chaque retour en mode labyrinthe (après un combat, un coffre ou un passage au château).
- **Mode Radar HUD (7×7) & Mode Global (20×20)** : Affichage du cône de vision directionnel, de la rose des vents, du brouillard de guerre et des marqueurs `💀` pour les corps tombés.

---

### 4. Moteur de Combat (`combatEngine`) & Coffres (`chestEngine`)
- **Portraits authentiques des monstres (`MonsterPicture`)** : Affichage des bitmaps 80×50 extraits du disque du scénario actif.
- **Actions et Fuite de groupe** : Attaquer, Lancer un Sort, Parer, Utiliser un Objet, Dissiper les Morts-Vivants, ou **Fuir** (action collective pour tout le groupe fidèle à `PROCEDURE RUNAWAY`).
- **Repositionnement automatique des morts** : Dès qu'un personnage meurt en combat ou sur un piège de coffre, il est placé en queue de groupe et le survivant suivant monte d'un rang.
- **Les 5 options authentiques des coffres (`PROCEDURE ACHEST`)** : `(O) Ouvrir`, `(C) Sort CALFO`, `(L) Laisser le coffre`, `(I) Inspecter`, `(D) Désarmer`.

---

## 💻 Technologies Utilisées

| Composant | Technologie |
|---|---|
| **Framework UI** | [React 19](https://react.dev/) |
| **Langage** | [TypeScript](https://www.typescriptlang.org/) |
| **Bundler & Dev Server** | [Vite 8](https://vitejs.dev/) |
| **Moteur 3D** | [Three.js](https://threejs.org/) |
| **Styles & Design** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icônes** | [Lucide React](https://lucide.dev/) |
| **Effets Audio** | Web Audio API procédurale (zéro dépendance externe) |
| **Extracteur Disquettes** | Python 3 (`scripts/extract_pgmo.py`, UCSD Pascal block reader) |

---

## 🚀 Installation, Extraction et Lancement

### Installation & Développement
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement local sur le port 3000
npm run dev
```

### Extraction des 10 Scénarios depuis les images disques `.dsk`
```bash
# Extraire les 10 scénarios (.dsk) et les 200 images de monstres PNG
python3 scripts/extract_pgmo.py --all-scenarios /chemin/vers/dossier_dsk
```

### Compilation et Déploiement
```bash
# Vérifier les types TypeScript
npm run lint

# Compiler pour la production (met à jour dist/ et docs/ pour GitHub Pages)
npm run build
```

---

## ⌨️ Raccourcis Clavier en Donjon (AZERTY & QWERTY)

Le bouton **AZERTY / QWERTY** (barre supérieure et panneau de commandes du donjon) adapte les touches de déplacement :

| Action | Clavier AZERTY | Clavier QWERTY | Touches alternatives |
|---|---|---|---|
| **Avancer d'une case** | <kbd>Z</kbd> | <kbd>W</kbd> | <kbd>↑</kbd> ou <kbd>F</kbd> |
| **Pivoter à gauche (90°)** | <kbd>Q</kbd> | <kbd>A</kbd> | <kbd>←</kbd> ou <kbd>L</kbd> |
| **Pivoter à droite (90°)** | <kbd>D</kbd> | <kbd>D</kbd> | <kbd>→</kbd> ou <kbd>R</kbd> |
| **Enfoncer / ouvrir une porte** | <kbd>K</kbd> | <kbd>K</kbd> | — |
| **Établir le Campement** | <kbd>C</kbd> | <kbd>C</kbd> | — |
| **Ouvrir / fermer la Minicarte plein écran** | <kbd>M</kbd> | <kbd>M</kbd> | — |
| **Inspecter la case (escaliers, fouille)** | <kbd>I</kbd> | <kbd>I</kbd> | — |

---

## 📜 Références et Crédits
- **Jeu d'origine** : *Wizardry: Proving Grounds of the Mad Overlord* © 1981 Sir-Tech Software, Inc. Conçu par Andrew Greenberg et Robert Woodhead.
- **Scénarios additionnels** : Collection des 10 scénarios Apple II v3.2 ([Zimlab Wizardry Mods](https://www.zimlab.com/wizardry/mods/mods.htm)).
- **Référence technique** : Code source Pascal UCSD et données binaires extraits des images disques Apple II via `scripts/extract_pgmo.py` dans `pascal_source/Wizardry1_UCSD_Pascal.pas`, `src/data/provingGroundsData.ts` et `src/data/scenarios/*Data.ts`.
