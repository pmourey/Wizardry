# Analyse Juridique : Propriété Intellectuelle, Distribution Commerciale & Feuille de Route "Successeur Spirituel"

> **Date d'archivage :** 30 octobre 2026  
> **Objet :** Faisabilité de la distribution commerciale du projet (Steam, Google Play, Apple App Store, Itch.io payant) et transformation en propriété intellectuelle originale (*Spiritual Successor*).

---

## 1. Constat Actuel : Impossibilité Légale en l'État

Il est **formellement interdit** de commercialiser ou de monétiser le projet dans sa forme actuelle sous le nom *Wizardry* ou avec ses ressources d'origine. Les risques juridiques comprennent la contrefaçon de marque, la violation du droit d'auteur, la suppression immédiate des plateformes (DMCA) et le bannissement définitif des comptes développeurs (Steamworks, Google Play Console).

### A. La marque déposée « Wizardry »
* La marque mondiale **Wizardry** appartient à la société japonaise **Drecom Co., Ltd.** (qui a racheté les droits historiques de Sir-Tech en 2020).
* Drecom exploite très activement cette propriété intellectuelle :
  * Publication du remake commercial officiel *Wizardry: Proving Grounds of the Mad Overlord* (développé par Digital Eclipse) sur **Steam**, PlayStation 4/5, Xbox One / Series X|S et Nintendo Switch en 2023-2024.
  * Exploitation de titres mobiles comme *Wizardry Variants Daphne*.
* L'utilisation du nom *Wizardry* dans le titre d'un produit commercial constitue une **contrefaçon de marque** (*trademark infringement*).

### B. Éléments protégés par le droit d'auteur (*Copyright*)
1. **Le lore et les noms propres d'origine** : Les personnages (*Trebor*, *Werdna*), les lieux (*Llylgamyn*), et les noms de sorts (*Tiltowait*, *Mahalito*, *Katino*, *Badios*...) créés par Robert Woodhead et Andrew Greenberg.
2. **Les données propriétaires des scénarios** : L'agencement exact des cartes, tables de monstres et algorithmes extraits des disques originaux de Sir-Tech.
3. **Les compositions musicales** : Les pistes composées par **Kentaro Haneda** (羽田健太郎) appartiennent aux ayants droit du compositeur et aux éditeurs musicaux (notamment Pony Canyon).

### C. Politiques contractuelles des plateformes
* **Steam (Valve)** et **Google Play** imposent une déclaration sur l'honneur certifiant la détention de 100 % des droits ou licences écrites. Une infraction entraîne le gel des revenus et la clôture définitive du compte.
* **Itch.io** : Tolère les hommages amateurs gratuits (*Fan Games* / préservation historique), mais bloque immédiatement tout projet payant dès réception d'une notification DMCA des ayants droit.

---

## 2. Ce qui n'est PAS protégeable (Ce qui vous appartient)

En droit de la propriété intellectuelle (droit d'auteur international et jurisprudence du jeu vidéo) :
* **Les règles et mécaniques de jeu ne sont pas protégeables par copyright** ni brevetables.
* Le concept d'un *dungeon crawler* en vue subjective 3D, avec déplacement pas à pas sur une grille orthogonale ($20 \times 20$), combats au tour par tour, équipe de 6 aventuriers, système d'alignement (Bon/Neutre/Maléfique) et jets de dés pour les caractéristiques (Force, Intelligence, etc.) est **totalement libre de droits**.
* **Le code source du moteur** développé dans ce projet (React, TypeScript, Three.js, shaders, gestionnaire audio, interface utilisateur, etc.) **vous appartient à 100 %**.

Des franchises cultes et très rentables sont nées exactement de cette manière en tant que successeurs spirituels de Wizardry :
* *Etrian Odyssey* (Atlus)
* *Elminage* (Starfish-SD)
* *The Dark Spire* (Success / Atlus)
* *Legend of Grimrock* (Almost Human)
* *Class of Heroes* (Acquire)

---

## 3. Feuille de Route : Transformer le Moteur en Successeur Spirituel Commercialisable

Pour vendre légalement le jeu sur Steam, Google Play, itch.io ou consoles, il suffit de procéder à un **re-skinning** complet du contenu tout en conservant le moteur technique :

| Composant Actuel (Sous Licence) | Remplacement pour la Commercialisation |
| :--- | :--- |
| **Titre du Jeu** | Création d'un nom de franchise original (ex. : *Chronicles of the Deep*, *Abyssal Oath*, *Labyrinth of the Iron King*). |
| **Noms de Sorts** (*Tiltowait*, *Katino*, etc.) | Sorts classiques de fantasy (*Flamme Solaire*, *Sommeil Astral*, *Souffle de Foudre*, *Guérison Sacrée*...). |
| **Lore & Personnages** (*Trebor*, *Werdna*) | Récit et univers inédits : un souverain tyran, une sorcière du néant, des divinités originales. |
| **Donjons & Niveaux** | Nouveaux agencements de cartes $20 \times 20$ avec énigmes, téléporteurs et zones de ténèbres personnalisées. |
| **Graphismes des Monstres** | Illustrations originales commandées ou achetées sous licence commerciale libre de droits (ex. : packs d'artistes sur Unity/Unreal Asset Store ou itch.io). |
| **Bande Sonore** | Musiques orchestrales libres de droits commerciaux ou composées spécifiquement. |
| **Moteur Technique (Three.js / React)** | **Conservé à 100 %** (votre propriété intellectuelle). |

---

## 4. Stratégie de Distribution Recommandée

1. **Phase 1 (Actuelle - Non Commerciale)** :
   * Maintenir la version actuelle en hommage/remake **gratuit** sur GitHub Pages et Itch.io.
   * Sert de vitrine technique, de portfolio et de démonstration de compétences pour fédérer une communauté de passionnés de *dungeon crawlers*.

2. **Phase 2 (Projet Commercial - "Fork" du Moteur)** :
   * Créer un nouveau dépôt dérivé dédié au jeu commercial.
   * Remplacer les textes, données de scénarios, graphismes et sons par des ressources 100 % originales ou sous licence commerciale.
   * Packager le moteur pour le desktop (Electron ou Tauri pour Steam) et pour le mobile (Capacitor ou PWA pour Google Play).
   * Lancer la page "Wishlist" Steam et la commercialisation en toute sérénité juridique.
