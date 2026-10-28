# 📜 DIRECTIVES DE DÉVELOPPEMENT — MOTEUR ORIGINEL WIZARDRY I (PASCAL)

> **DIRECTIVE IMPÉRATIVE :**
> Pour **toute modification, correction de bogue ou ajout de fonctionnalité** relatif aux règles et au moteur du jeu, vous devez **TOUJOURS vous référer au code source Pascal UCSD originel de Wizardry I** présent dans ce dépôt :
> 📁 **`public/assets/aistudio/Wiz1WizardryPascal_fb30a53c.txt`**

---

## 🏛️ Principes directeurs d'ingénierie

1. **Priorité absolue au code source Pascal** :
   - Toute formule, probabilité, règle de ciblage ou comportement doit être vérifié dans `Wiz1WizardryPascal_fb30a53c.txt` avant d'être codé.
   - Ne pas inventer de règles modernes génériques lorsqu'un mécanisme historique est codé en Pascal.

2. **Références clés du code source Pascal** :
   - **Coffres et Pièges (`PROCEDURE ACHEST`)** (l. 9935-9980) :
     Les 5 choix fondamentaux sont :
     `O)PEN` : Forcer l'ouverture du coffre (déclenche le piège s'il n'a pas été désamorcé ou n'a pas déjà sauté).
     `C)ALFO` : Sort divin révélant avec exactitude le type de piège.
     `L)EAVE` : **Abandonner le coffre sans l'ouvrir** (ne déclenche aucun piège, laisse le trésor sur place, préserve le groupe si le voleur est mort ou s'il n'y a pas de prêtre/Calfo disponible).
     `I)NSPECT` : Inspection par le voleur ou ninja avec estimation probabiliste.
     `D)ISARM` : Tentative de désamorçage du piège désigné.
   - **Règle de Mêlée et Rangs de Combat (`CHARX MOD 3` et `MYCHARX < 3`)** (l. 4446, 4840) :
     - Seuls les **3 premiers aventuriers (indices 0, 1, 2 = Avant-garde)** peuvent choisir la commande `FIGHT` (Attaquer) et subir des attaques directes au corps-à-corps des monstres.
     - Les aventuriers aux **rangs #4, #5 et #6 (Arrière-garde)** sont protégés des attaques de mêlée tant qu'au moins un héros du premier rang est debout, et combattent via des sorts, des objets ou la parade.
   - **Action Parade / PARRY (`SPELLHSH = 0`)** (l. 4441, 6235) :
     - La commande `P` (Parade) est une posture défensive temporaire pour le tour en cours.
     - Elle ne modifie **JAMAIS** la classe d'armure de base du personnage (`CHARACTR[ MYVICTIM].ARMORCL`).
     - Dans le calcul de toucher des monstres (`HPCALCPC`), elle ajoute `+ 2 * (ORD(SPELLHSH = 0))`, augmentant de 2 le seuil de toucher requis pour le monstre (équivalent à un bonus de -2 CA) uniquement face aux attaques de ce tour. Le bonus ne se cumule jamais d'un tour à l'autre.
   - **Changement d'Ordre en Campement (`PROCEDURE REORDER`)** (l. 1516-1578) :
     - En mode Campement (`C`), le joueur peut réorganiser l'ordre des membres de son escouade pour permuter les combattants de première ligne et de soutien.
   - **Guérison automatique du Poison au Château** (l. 3170-3210, structure `LOSTXYL`) :
     - Le poison (`POISNAMT`) n'est actif que dans les profondeurs du labyrinthe. Dès le retour dans l'enceinte du Château, le poison est instantanément et totalement dissipé sans frais.
   - **Décimation et Sauvetage des Corps** (`LOSTXYL.LOCATION`) :
     - Un groupe anéanti ne rentre pas au château par miracle. Ses dépouilles gisent à l'étage et aux coordonnées exactes de sa mort.
     - Une expédition de secours doit descendre sur place pour hisser les corps (1 place par corps dans la limite de 6 membres) et les transporter au Temple de Cant.

   - **Fuite en Groupe (`PROCEDURE RUNAWAY`)** (l. 4306-4340) :
     - L'action « Fuir » (`R`) est une **décision collective appliquée à l'ensemble du groupe**, et non une action individuelle par héros.
     - Formule authentique :
       `TEMP = 38 - 3 * MAZELEV;`
       `IF PARTYCNT < 4 THEN TEMP := TEMP + 20 - 5 * PARTYCNT;`
       `IF BASE12.MYSTRENG > ENSTRENG THEN TEMP := TEMP + 20;`
       `IF MAZELEV = 10 THEN TEMP := -1;` (Fuite impossible au 10e sous-sol face à Werdna)
       `IF (RANDOM MOD 100) > TEMP THEN RUNFAILD;`
     - En cas d'échec (`RUNFAILD`), toute l'escouade perd son initiative (`AGILITY := -1`) et subit immédiatement le tour d'attaque des monstres sans pouvoir se défendre.

   - **Déplacement des Morts en Queue de Groupe (`shiftDeadHeroesToEnd`)** :
     - Dès qu'un personnage meurt ou est réduit en cendres (souffle, sorts mortels, mêlée, poison ou pièges), il est **automatiquement déplacé en dernière position du groupe**.
     - Les personnages survivants avancent immédiatement pour occuper les 3 premiers rangs d'avant-garde (`CHARX MOD 3`) afin de pouvoir attaquer et défendre au corps-à-corps.

   - **Retrait des Dépouilles au Retour au Château & Dépôt au Temple** :
     - Dès le franchissement des portes du Château, tous les personnages morts ou réduits en cendres sont **automatiquement retirés du groupe actif** et confiés au Temple de Cant.
     - Les dépouilles apparaissent au Temple de Cant pour les rituels de résurrection. Une fois ressuscités (`status: OK`), ils peuvent de nouveau être recrutés dans l'escouade à la Taverne de Gilgamesh.

3. **Persistance et Intégrité du Donjon** :
   - Tout l'état du groupe dans le dédale (`location`, `dungeonLevel`, `posX`, `posY`, `direction`, `lightLevel`, `acModifier`, `visitedTilesByLevel`, `combatGroups`, `chestReward`) est fidèlement persisté dans `localStorage` (`wiz1_dungeon_session`).
   - Un rafraîchissement du navigateur (F5) maintient l'escouade exactement à son emplacement dans le labyrinthe ou en combat/coffre.
