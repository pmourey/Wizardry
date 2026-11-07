# 📜 Devlog itch.io — Mise à jour Tactique : Exploration sur Mini-Carte, Ergonomie des Ascenseurs & Cartographie Affinée

**Date :** Novembre 2026  
**Version :** v3.5.2  
**Plateformes :** Navigateur Web (HTML5/WebGL), itch.io, APK Android  

---

### 🗺️ 1. Exploration Tactique en Direct sur la Mini-Carte Agrandie

L'une des fonctionnalités les plus demandées est désormais réalité : **il est désormais possible d'explorer le labyrinthe et de déplacer son groupe directement depuis la mini-carte agrandie (`Touche M`) !**

- **Navigation clavier complète** : Déplacement avant (`Z` en AZERTY / `W` en QWERTY / `↑`), pivots à 90° (`Q` / `A` / `D` / `←` / `→`), demi-tour immédiat à 180° (`S` / `↓`), enfoncer les portes (`K` ou `Barre d'espace`) et fouille de la case (`I`).
- **Pavé tactile & commandes D-Pad intégrées** : Un pavé de contrôle ergonomique apparaît sous la carte avec des boutons clairs pour le jeu sur mobile ou à la souris.
- **Gestes tactiles directs (Swipes & Taps)** : Glissez le doigt ou cliquez directement sur le plan pour faire avancer votre escouade ou pivoter dans la direction souhaitée.
- **Persistance du mode de carte** : Le dernier mode choisi (carte agrandie ou compacte HUD) est désormais automatiquement mémorisé. À la fin d'un combat ou après une halte au campement, vous revenez directement dans le mode de visualisation que vous aviez sélectionné.

---

### 🔍 2. Cartographie & Symboles Authentiques

Le moteur de rendu SVG vectoriel de la mini-carte a fait l'objet d'une passe complète d'optimisation et de fidélité par rapport aux règles Sir-Tech de 1981 :

- **Épaisseur des murs et portes calibrée** : Réduction de l'épaisseur des parois et des portes pour une lecture nette, aérée et précise, même sur les niveaux complexes de 20×20 cases.
- **Portes à sens unique (One-Way Doors)** : Affichage de fines flèches directionnelles traversant la porte avec une pointe pleine et une couche dédiée de premier plan, y compris pour les portes situées sur les bords toroïdaux du labyrinthe (ex. coordonnées `19,9` et `1,19`).
- **Harmonisation des fossepièges (Pits)** : Remplacement de l'ancien tracé en croix par l'icône de crâne `☠` en rose vif sur fond pourpre d'alerte, parfaitement conforme à la légende de la carte.
- **Gestion authentique des portes secrètes** : Restauration des règles originales du scénario UCSD Pascal : le test de détection de porte secrète est effectué selon les statistiques du groupe ; une fois détectée et franchie, la porte reste définitivement connue et accessible sans nécessiter de nouvelle fouille.
- **Restauration des passages ouverts** : Correction des passages aux coordonnées `(19, 1)` Sud et `(11, 0)` Ouest au Niveau 3 qui pouvaient être bloqués par des parois solides.
- **Mode Révélation Test / Triche discret** : La mini-carte est un outil de cartographie fidèle respectant le brouillard de guerre. Une case à cocher discrète « Outil Test / Triche » a été intégrée dans la légende pour permettre les tests fonctionnels de cartographie complète sans gêner l'expérience de jeu normale.

---

### 🛗 3. Mécanisme d'Ascenseur & Priorité d'Affichage au Premier Plan

- **Suppression du prompt navigateur basique** : L'ancienne invite `window.prompt` a été totalement éliminée au profit de la **fenêtre modale graphique enrichie**.
- **Sélection rapide des étages** : Boutons tactiles pour chaque étage accessible (Niveaux 1 à 4 pour le premier ascenseur, 4 à 9 pour le second), raccourcis numériques directs clavier (`1`, `2`, `3`, `4`) et fermeture rapide avec `Échap`.
- **Passage garanti au premier plan (`z-index`)** :
  - La fenêtre de sélection de l'ascenseur s'affiche désormais toujours au-dessus de la mini-carte agrandie.
  - Les bandeaux d'action flottants (`🛗 Ascenseur [Actionner (E)]`, `▲ Escalier [Emprunter (Y)]`) restent visibles et actifs en haut de l'écran en mode carte.
  - Tous les messages d'exploration, inscriptions murales (`scenarioMessage`) et alertes de découverte de héros tombés au combat s'affichent prioritairement au premier plan sans être masqués par la carte.

---

### 📦 4. Disponibilité & Liens de Téléchargement

- **Jouable directement dans le navigateur** : [Sur GitHub Pages](https://pmourey.github.io/Wizardry/) et sur la page de jeu **itch.io**.
- **Archive HTML5 / itch.io** : `wizardry-itchio.zip` mise à jour avec les derniers assets et scripts compilés.
- **Application native Android** : `Remix-Wizardry-v3.5.apk` disponible au téléchargement direct.

*Merci pour vos retours et tests continus ! Bonne exploration dans les profondeurs de Trebor !* ⚔️
