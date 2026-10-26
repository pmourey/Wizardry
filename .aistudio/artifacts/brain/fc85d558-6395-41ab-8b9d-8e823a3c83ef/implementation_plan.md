# Wizardry I: Proving Grounds of the Mad Overlord (Édition Moderne & Moteur Fidèle)

Reconstitution fidèle du jeu de rôle mythique de 1981 à partir du code source Pascal d'origine (Trebor, Werdna, tables d'objets, sorts, monstres, labyrinthe 10 niveaux, combats, pièges et coffres), propulsée par une interface moderne et fluide en React/Three.js avec panneau d'exportation complet du code autonome Python PySide6.

## Décisions validées & Directives utilisateur

> [!IMPORTANT]
> Les choix confirmés par l'utilisateur orientent l'architecture du projet :
> - **Plateforme principale** : Application Web interactive riche et fluide, immédiatement jouable dans AI Studio, assortie d'un module d'exportation complet du code source Python / PySide6 équivalent et autonome.
> - **Rendu visuel** : Moteur 3D à la première personne dans le donjon (murs texturés médiévaux, voûtes de pierre, portes, effets de lumière Milwa/Lomilwa) couplé à un HUD sombre, une typographie soignée et des portraits modernisés.
> - **Démarrage de la partie** : Équipe pré-constituée équilibrée de 6 aventuriers (Guerrier, Samouraï, Prêtre, Voleur, Mage, Évêque) prête pour l'exploration immédiate au château, tout en préservant l'accès intégral aux Terrains d'Entraînement pour créer, inspecter et modifier des personnages.

---

## 1. Vue d'ensemble & Mécaniques Pascal d'origine

Le jeu intègre la transposition exacte de la logique du code Pascal extrait (`Wiz1WizardryPascal_fb30a53c.txt`) :

1. **Règles & Caractéristiques D&D-like** :
   - 6 Caractéristiques (Force, I.Q., Piété, Vitalité, Agilité, Chance) plafonnées à 18.
   - 5 Races d'origine (Humain, Elfe, Nain, Gnome, Hobbit) avec leurs valeurs de base exactes (`'885889'`, `'7::696'`, etc.).
   - 8 Classes : Combattant, Mage, Prêtre, Voleur, Évêque, Samouraï, Seigneur, Ninja avec prérequis et compétences spéciales (critique du Ninja, désamorçage du Voleur, identification de l'Évêque).
   - 3 Alignements : Bon, Neutre, Mauvais (incompatibilité Bon/Mauvais dans la même escouade au départ).
   - 8 États de santé : OK, Effrayé, Endormi, Paralysé, Pétrifié, Mort, Cendres, Perdu.

2. **Lieux du Château (Castle)** :
   - **Taverne de Gilgamesh** : Gestion du groupe de 1 à 6 personnages, inspection, filtrage d'alignement.
   - **Auberge de l'Aventurier (Adventurer's Inn)** : Écuries (gratuit, recharge les sorts), Paillasses (10 PO, 1 PV/sem), Chambres Économiques (50 PO, 3 PV/sem), Suites Marchandes (200 PO, 7 PV/sem), Suites Royales (500 PO, 10 PV/sem). Montée de niveau automatique avec calcul des PV de classe, gains/pertes d'attributs selon l'âge et apprentissage des sorts.
   - **Comptoir de Boltac (Trading Post)** : Achat, vente, désenvoûtement des objets maudits, identification payante, mise en commun de l'or.
   - **Temple de Cant** : Résurrection des Morts (250 PO × niveau), des Cendres (500 PO × niveau), guérison de paralysie (100 PO × niveau) et pétrification (200 PO × niveau), avec risques d'échec (Mort -> Cendres -> Perdu à jamais).
   - **Terrains d'Entraînement (Training Grounds)** : Création de personnage avec tirage de points bonus (7 à 29), choix de classe, attribution manuelle, inspection détaillée, changement de classe (remise à niveau 1, réinitialisation des caractéristiques de base et conservation des sorts appris).
   - **Orée de la ville (Edge of Town)** : Entrée dans le Labyrinthe ou sauvegarde.

3. **Exploration du Labyrinthe (Runner & Dungeons)** :
   - 10 étages de 20×20 cases avec la topologie complète du Proving Grounds.
   - Murs simples, portes, portes dérobées (détectables sous sort de lumière ou perception).
   - Cases spéciales : Escaliers (haut/bas), Fosses (dégâts d'agilité), Chutes vers niveaux inférieurs, Tournoyeurs (inversion/rotation d'orientation aléatoire), Ténèbres (extinction de lumière et aveuglement temporaire), Téléporteurs vers coordonnées cibles, Boutons d'ascenseur, Énigmes textuelles, Messages cryptés de scénario.
   - Système de campement dans le dédale : équipement, lancer de sorts de guérison (Dios, Dial, Dialma, Madi), localisation Kandikando/Dumapic, téléportation Malor, inspection des parchemins.

4. **Système de Combat & Coffres** :
   - Initiative dynamique basée sur l'Agilité et le hasard (1-10 avec bonus/malus raciaux).
   - Ordre de bataille : les 3 premiers combattent en mêlée, l'arrière lance sorts/objets.
   - 50 sorts exacts (Mage : Halito, Katino, Mahalito, Molito, Lahalito, Makanito, Madalto, Zilwan, Tiltowai, etc. ; Prêtre : Kalki, Dios, Badios, Milwa, Montino, Dial, Badial, Latumapi, Madi, Mabadi, Malikto, Kadorto, etc.).
   - Comportement des monstres : attaques multiples, sorts adverses, souffle de dragon (demi-dégâts sur sauvegarde), appel à l'aide, fuite, absorption de niveaux (drain level), coup critique décapitant.
   - Coffres piégés : inspection par voleur/ninja, sort Calfo, désamorçage (aiguille empoisonnée, bombe à gaz, carreau d'arbalète, boîte explosive, éclats, lames, assommoir, téléporteur, anti-mage, anti-prêtre, alarme provoquant un nouveau combat), butin d'or partagé et tirage d'objets rares selon la table de niveau.

5. **Module d'Exportation PySide6** :
   - Fichier Python 3 / PySide6 complet généré et téléchargeable, comprenant l'interface graphique Qt (QGraphicsView ou rendu OpenGL / Canvas, panneaux d'équipe, boîte de dialogue, menus du château) et le moteur de jeu en pur Python.

---

## 2. Expérience Utilisateur & Design Visuel

- **Ambiance Visuelle** : Dark Fantasy gothique épurée et moderne. Palette dominée par les pierres d'ardoise sombres (`slate-950`, `zinc-900`), des touches d'or antique (`amber-500/600`), des accents mystiques d'améthyste et de rouge sang pour les alertes critiques.
- **Rendu Donjon 3D** :
  - Fenêtre centrale en perspective 3D fluide (Three.js / WebGL Canvas 60 FPS) avec déplacements et rotations lisses (pas-à-pas fluide ou classique au choix).
  - Textures de maçonnerie de donjon, portes sculptées en chêne renforcé de fer, torches animées projetant des ombres dynamiques.
  - Bascule en un clic vers le mode "Wireframe Rétro Monochrome / Ambre" pour les puristes Apple II.
- **HUD & Panneaux Tactiques** :
  - **Panneau Groupe (Partie Inférieure)** : Carte de statut de chaque aventurier avec barre de PV/Max, classe, niveau, CA (Classe d'Armure avec affichage LO pour les scores légendaires), statut altéré, icône d'avatar stylisée.
  - **Panneau de Commande (Partie Droite)** : Pavé de navigation rapide (ZQSD / Flèches), boutons d'action d'exploration (Avancer, Pivoter, Inspecter, Camper, Frapper porte), boussole et indicateurs de buffs actifs (Lumière Milwa/Lomilwa, Protection Maporfic).
  - **Zone d'Événements / Journal de Combat** : Log interactif à défilement fluide racontant avec élégance les actions de combat, les désamorçages de pièges et les découvertes.

---

## 3. Architecture Technique & Flux de Données

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React Application Root                          │
├───────────────────┬───────────────────────────────┬────────────────────┤
│   Castle View     │        Dungeon Engine         │   Camp & Training  │
│  - Gilgamesh Inn  │  - 3D Viewport (Three.js/GL)  │  - Character Sheet │
│  - Boltac Shop    │  - Raycast/Wall Renderer      │  - Inventory/Equip │
│  - Cant Temple    │  - Step & Turn Interpolation  │  - Spells Ledger   │
│  - Adventurer Inn │  - Torch & Ambient Lighting   │  - Class Promotion │
├───────────────────┴───────────────────────────────┴────────────────────┤
│                       Wizardry Core Engine                             │
│  - Pascal Data Tables (Spells, Items, Monsters, Mazes Lv 1-10)         │
│  - Battle Turn Resolver (Initiative, Hit/AC, Crit, Level Drain)        │
│  - Traps & Chests Engine (Calfo, Disarm, Poison/Teleport Effects)      │
│  - Party State & Persistence (localStorage + JSON import/export)       │
├────────────────────────────────────────────────────────────────────────┤
│                   Python PySide6 Code Exporter                         │
│  - Complete Standalone Python 3 + PySide6 Source Generator             │
│  - In-browser Code Viewer, Syntax Highlighter & Download Button        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Plan de Réalisation Détaillé

1. **Structure de Données & Tables du Code Pascal** :
   - Transposition en TypeScript pur de toutes les structures : sorts mages & prêtres avec leurs hachages et effets, liste complète des objets de Boltac (armes, armures, boucliers, casques, objets maudits et magiques), bestiaire complet (Kobolds, Creeping Cruds, Mages, Dragons, Vampires, Werdna), et plans complets des labyrinthes 1 à 10 avec cases spéciales.
2. **Moteur Graphique 3D du Donjon** :
   - Mise en place du canevas 3D Three.js pour le rendu subjectif des couloirs, intersections, portes et objets de niveau.
   - Système de transition fluide lors des déplacements (translation et rotation caméra interpolées).
   - Support d'effets d'éclairage dynamique (Milwa/Lomilwa qui augmentent la distance de vue).
3. **Moteur de Combat au Tour par Tour** :
   - Gestion des groupes de monstres (1 à 4 groupes), options tactiques complètes par membre (Attaquer, Sort, Parade, Objet, Fuite, Exorcisme/Dispell).
   - Calcul des dégâts, jets de sauvegarde contre les souffles, résistances à la magie, poisons et drainage d'expérience.
4. **Villes & Boutiques du Château** :
   - Intégration de la Taverne, du Comptoir de Boltac (achat/vente/désenvoûtement), de l'Auberge avec vieillissement et montée de niveau, et du Temple de Cant avec taux de résurrection.
   - Terrains d'entraînement pour la création et le reroll de personnages.
5. **Équipe Pré-construite & Persistance** :
   - Équipe de départ déjà formée au niveau 1 avec équipements de base pour jouer immédiatement.
   - Sauvegarde automatique dans le navigateur (`localStorage`).
6. **Exportateur PySide6** :
   - Générateur du code Python complet utilisant `PySide6.QtWidgets`, `PySide6.QtGui` et `PySide6.QtCore`, téléchargeable sous forme de fichier `.py` autonome avec documentation d'exécution.
