# ⚔️ Wizardry I: Proving Grounds of the Mad Overlord (1981)

Une recréation moderne, fidèle et enrichie du jeu de rôle culte de **Sir-Tech (1981)**, rétro-ingéniée directement d'après le code source originel en **UCSD Pascal** (`Wiz1WizardryPascal.txt`).

Ce projet combine l'authenticité des règles historiques de Wizardry 1 avec une interface web moderne, un moteur 3D temps réel Three.js, un système de cartographie tactique, un journal d'aventures narratif et un système de récupération des corps conforme au jeu de 1981.

> 📜 **DIRECTIVE IMPÉRATIVE DE DÉVELOPPEMENT :**
> Pour **toute modification, correction de bogue ou ajout de fonctionnalité** touchant aux règles, tables de monstres, probabilités, calculs de dégâts ou mécanismes du moteur de jeu, **TOUJOURS se référer impérativement au code source Pascal UCSD originel et aux données extraites des images disques Apple II** via `scripts/extract_pgmo.py` (basé sur `WizardryApp`) :
> `pascal_source/Wizardry1_UCSD_Pascal.pas`, `pascal_source/Wiz1A..Wiz1E/` et `src/data/provingGroundsData.ts` (voir également `INSTRUCTIONS_DEVELOPPEUR.md`).

---

## 🏛️ Nature du Projet

Le projet propose une expérience de *dungeon crawler* à la première personne respectant à la lettre les mécanismes de jeu fondamentaux :
- **Règles de Wizardry 1 (Pascal)** : Système de caractéristiques (FOR, INT, PIE, VIT, AGI, CHA), tables d'expérience par classe, sorts de mage et de prêtre, classes d'armure (CA décroissante), et tables de monstres et d'objets conformes.
- **Décimation et sauvetage authentique des corps** : Conformément à la variable `LOSTXYL.LOCATION` du code Pascal, un groupe anéanti ne peut ni se déplacer ni revenir seul au château. Leurs dépouilles restent perdues dans le labyrinthe à leurs coordonnées exactes (`x, y, étage`), et une expédition de secours doit être formée pour aller hisser leurs corps (chaque corps occupant une place dans l'escouade de 6 maximum) afin de les ramener au Temple de Cant.
- **Moteur 3D moderne & Rétro** : Exploration du dédale en 3D temps réel avec éclairage dynamique à la torche, brume de distance, textures procédurales de pierre, ou bascule instantanée en mode rétro fil de fer (*wireframe*).
- **Cartographie & Mini-carte tactique** : Affichage d'un radar HUD (7×7) et d'une carte plein écran (20×20) avec brouillard de guerre, orientation, cases spéciales (fosses, téléporteurs, zones d'obscurité, escaliers) et balises crânes `💀` signalant les corps tombés.
- **Journal d'Aventures narratif** : Chronique des 10 derniers événements marquants (combats, découvertes, pertes, secours, montées de niveau) persistée dans le navigateur.
- **Double cible technologique** : Application Web SPA (React/Vite) déployable sur GitHub Pages (`docs/`) et exportateur de code autonome pour **PySide6 / Python**.

---

## 🏗️ Architecture du Projet

```
├── pascal_source/
│   ├── Wizardry1_UCSD_Pascal.pas    # Code source Pascal UCSD complet extrait des disquettes
│   └── Wiz1A..Wiz1E/*.TEXT.pas      # Unités Pascal UCSD et routines Assembleur 6502 par disquette
├── scripts/
│   └── extract_pgmo.py              # Extracteur UCSD (SCENARIO.DATA, SCENARIO.MESGS & code source Pascal)
├── src/
│   ├── components/
│   │   ├── AdventureJournal.tsx     # Composant Journal d'Aventures (10 derniers récits)
│   │   ├── CastleView.tsx           # Menu et quartiers du Château de Trebor
│   │   ├── CharacterSheetModal.tsx  # Fiche détaillée des caractéristiques et équipement
│   │   ├── ChestView.tsx            # Inspection, désamorçage de pièges et pillage de coffres
│   │   ├── CombatView.tsx           # Moteur visuel et tactique des combats au tour par tour
│   │   ├── DungeonView.tsx          # Exploration 3D du labyrinthe, campement et gestion d'escouade
│   │   ├── MiniMap.tsx              # Mini-carte SVG (mode radar HUD et mode plein écran 20x20)
│   │   └── PySide6Exporter.tsx      # Exportateur de code source Python / PySide6 autonome
│   ├── data/
│   │   └── wizardryData.ts          # Données canoniques (Races, Classes, Monstres, Objets, Sorts, Labyrinthe)
│   ├── engine/
│   │   ├── chestEngine.ts           # Moteur des coffres et 12 types de pièges de Wizardry
│   │   ├── combatEngine.ts          # Moteur des rencontres, initiatives, attaques et sorts
│   │   ├── dungeonRenderer3D.tsx    # Rendu 3D Three.js (caméra première personne, torche, murs, sols)
│   │   └── statusSystem.ts          # Altérations d'état (Poison, Sommeil, Paralysie, Silence, Mort, Cendres)
│   ├── types/
│   │   └── wizardry.ts              # Définitions strictes TypeScript du modèle de données
│   ├── utils/
│   │   └── soundEffects.ts          # Synthétiseur d'effets sonores chiptune (Web Audio API)
│   ├── App.tsx                      # Composant racine, machine à états et persistance localStorage
│   └── main.tsx                     # Point d'entrée de l'application React
├── docs/                            # Bundle statique de production pour GitHub Pages
├── dist/                            # Sortie de compilation Vite
├── package.json                     # Scripts et dépendances du projet
├── vite.config.ts                   # Configuration Vite avec support Tailwind CSS
└── README.md                        # Documentation générale et technique
```

---

## 🎮 Systèmes et Fonctionnalités Détaillés

### 1. Le Château de Trebor (`CastleView`)
- **Taverne de Gilgamesh** :
  - Recrutement et gestion d'une guilde d'aventuriers (1 à 6 membres par expédition).
  - Statut des héros tombés au combat : les personnages décimés dans le dédale affichent `💀 Corps perdu dans le dédale (Niv. X, pos. Y, Z)` et ne peuvent pas être recrutés directement au comptoir sans être secourus.
- **Auberge de l'Aventurier** :
  - 5 types de chambres (Écuries gratuites, Paillasses, Suites économiques, marchandes et royales).
  - Récupération des points de vie et recharge des emplacements de sorts de Mage et de Prêtre.
  - Calcul et déclenchement des montées de niveau selon les tables d'expérience Pascal avec gain de PV max et déblocage de sorts.
- **Comptoir de Boltac** :
  - Achat et revente d'armes, boucliers, armures, casques et objets spéciaux.
  - Mise en commun de l'or de l'escouade (*Pool Gold*).
  - Gestion des objets maudits (impossibles à vendre tant qu'ils sont équipés).
- **Temple Radiant de Cant** :
  - Rituels de résurrection des morts (`DEAD`) et des cendres (`ASHES`) avec probabilité de réussite dépendante de la Vitalité.
  - Risque d'échec : un corps mort peut être réduit en cendres, et des cendres peuvent être irrémédiablement perdues dans le néant (`LOST`).
  - Guérison du poison, des paralysies (`PLYZE`) et de la pétrification (`STONED`).
- **Terrains d'Entraînement** :
  - **Création de nouveau héros** : sélection de race (Humain, Elfe, Nain, Gnome, Hobbit) et d'alignement, tirage des points bonus aux dés, attribution libre sur les caractéristiques de base et choix de la classe selon les prérequis.
  - **Réattribution des caractéristiques (*Respec*)** : optimisation et relance des dés de caractéristiques pour les héros existants.
- **Journal d'Aventures** :
  - Historique narratif des 10 derniers événements (combats, découvertes, pertes, secours, château).
  - Filtres par catégorie et badges de repérage spatial (étage et coordonnées).

---

### 2. Le Labyrinthe (`DungeonView` & `DungeonRenderer3D`)
- **Rendu Three.js à la première personne** :
  - Rendu immersif des couloirs de pierre avec textures procédurales haute résolution (dalles au sol, pierres de taille, mortier).
  - Éclairage dynamique simulant le vacillement d'une torche (intensité, portée et atténuation réalistes).
  - Brume de distance atmosphérique et bascule instantanée en mode fil de fer (*wireframe retro*).
- **Cases et particularités du donjon** :
  - Murs pleins, portes ouvrables, portes dérobées (*secret doors*).
  - Zones d'obscurité magique (*Dark zones*).
  - Fosses piégées infligeant des dégâts de chute.
  - Dalles de tournoiement désorientant le groupe (*Spinners*).
  - Téléporteurs mystiques et escaliers d'accès aux étages.
- **Mode Campement (`C`)** :
  - **Lancement de sorts hors combat** : sorts de soins (`DIOS`, `DIAL`, `DIALMA`, `MADI`), purification (`LATUMOFI`), dissipation de paralysie (`DIALKO`), et localisation spatiale (`DUMAPIC`).
  - **Identification d'objets** : capacité unique de l'Évêque (*Bishop*) à déchiffrer les objets inconnus avec risque de subir la malédiction en cas d'échec.
  - **Échange d'objets entre compagnons** : transfert direct d'un équipement vers un autre membre du groupe avec respect de la limite de 8 objets par sac et verrouillage des objets maudits équipés.
- **Récupération des dépouilles** :
  - Détection automatique des héros tombés se trouvant sur la case actuelle.
  - Action « Hisser le corps » consommant strictement 1 emplacement d'escouade disponible (maximum 6 membres vivants ou morts).

---

### 3. Minicarte & Cartographie Tactique (`MiniMap`)
- **Mode Radar HUD (7×7)** : Vignette semi-transparente en surimpression dans le champ visuel permettant une navigation rapide au clavier (`W/A/S/D` ou flèches).
- **Mode Plein Écran (20×20)** : Affichage de l'étage complet avec cône de vision directionnel, rose des vents, coordonnées exactes, statut d'exploration (brouillard de guerre), et bouton de clairvoyance magique (`DUMAPIC`).
- **Marqueurs de secours** : Affichage d'un crâne `💀` clignotant sur les cases où des corps d'aventuriers attendent une escouade de secours.

---

### 4. Moteur de Combat (`combatEngine`)
- **Groupes de monstres** : Rencontres face à 1 à 4 groupes de créatures simultanées.
- **Initiative et phases** : Actions individuelles par héros (Attaquer, Lancer un Sort, Parer, Utiliser un Objet, Dissiper les Morts-Vivants, Fuir).
- **Magie de combat** : Sorts offensifs de zone et à cible unique (`HALITO`, `MAHALITO`, `KATINO`, `BADIOS`, `MONTINO`, etc.).
- **Altérations d'état dynamiques** : Sommeil, paralysie, silence empêchant les incantations, et poison persistant.

---

### 5. Coffres & Pièges (`chestEngine` & `ChestView`)
- **Les 5 options authentiques du code Pascal (`PROCEDURE ACHEST`)** :
  - `(O) Ouvrir` : Ouvre le coffre (fait sauter le piège s'il n'a pas été désamorcé).
  - `(C) Sort CALFO` : Révélation magique infaillible du piège par le Prêtre.
  - `(L) Laisser le coffre` : **Abandonne le coffre sans y toucher** (vital en l'absence de voleur valide ou de sort Calfo, ne déclenche aucun piège).
  - `(I) Inspecter` : Analyse minutieuse du mécanisme par le voleur ou le ninja avec estimation probabiliste.
  - `(D) Désarmer` : Tentative de désamorçage du piège identifié avec risque de déclenchement en cas d'échec critique.
- **12 pièges fidèles à Wizardry** : Aiguille empoisonnée, bombe à gaz, carreau d'arbalète, boîte explosive, éclats, lames tranchantes, étourdisseur, téléporteur débile, décharge anti-mage, décharge anti-prêtre, alarme rameutant d'autres monstres.
- **Raccourcis clavier authentiques** : Touches directes `O`, `C`, `L`, `I`, `D`.

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
| **Animations & Confettis** | Canvas-Confetti, Motion |

---

## 🚀 Installation et Lancement

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- `npm` ou `pnpm`

### Installation
```bash
# Cloner le dépôt
git clone <URL_DU_DEPOT>

# Installer les dépendances
npm install
```

### Développement
```bash
# Lancer le serveur de développement local sur le port 3000
npm run dev
```
Ouvrez ensuite `http://localhost:3000` dans votre navigateur.

### Compilation et Déploiement
```bash
# Vérifier les types TypeScript
npm run lint

# Compiler pour la production (met à jour dist/ et docs/ pour GitHub Pages)
npm run build
```

---

## ⌨️ Raccourcis Clavier en Donjon

| Touche | Action |
|---|---|
| <kbd>W</kbd> ou <kbd>↑</kbd> | Avancer d'une case |
| <kbd>A</kbd> ou <kbd>←</kbd> | Pivoter à gauche (90°) |
| <kbd>D</kbd> ou <kbd>→</kbd> | Pivoter à droite (90°) |
| <kbd>K</kbd> | Enfoncer / ouvrir une porte |
| <kbd>C</kbd> | Établir le Campement (Sorts, Inventaire, Échange) |
| <kbd>M</kbd> | Ouvrir / fermer la Minicarte plein écran |
| <kbd>I</kbd> | Inspecter la case (escaliers, inscriptions) |

---

## 📜 Références et Crédits
- **Jeu d'origine** : *Wizardry: Proving Grounds of the Mad Overlord* © 1981 Sir-Tech Software, Inc. Conçu par Andrew Greenberg et Robert Woodhead.
- **Référence technique** : Code source Pascal UCSD et données binaires extraits des images disques Apple II via `scripts/extract_pgmo.py` (basé sur `WizardryApp`) dans `pascal_source/Wizardry1_UCSD_Pascal.pas` et `src/data/provingGroundsData.ts`.
