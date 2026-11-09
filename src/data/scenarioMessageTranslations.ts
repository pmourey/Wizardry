/* eslint-disable */
/**
 * SCENARIO MESSAGE LOCALIZATION REGISTRY (FR / EN)
 * Complete French translations for authentic in-dungeon pop-ups,
 * wall inscriptions, statues, elevators, riddles, and boss warnings
 * across Wizardry I, II, III, IV and custom scenario modules.
 */

export interface TranslatedMessage {
  frenchLines: string[];
  contextNote?: string;
}

/** Normalizes raw uppercase / whitespace-padded strings from disk dumps */
export function normalizeMessageKey(lines: string[]): string {
  return lines
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

/**
 * EXACT CANONICAL TRANSLATIONS FOR CLASSIC WIZARDRY POP-UP MESSAGES
 */
export const EXACT_SCENARIO_MESSAGES_FR: Record<string, string[]> = {
  // ==========================================
  // WIZARDRY 1: PROVING GROUNDS OF THE MAD OVERLORD
  // ==========================================
  "A LARGE SIGN ON THE WALL READS: *** CORRIDOR OUT OF LIMITS *** TURN BACK!": [
    "UN GRAND PANNEAU SUR LE MUR INDIQUE :",
    "   *** COULOIR STRICTEMENT INTERDIT ***",
    "              REBROUSSEZ CHEMIN !"
  ],

  "A STRANGE GLOW SEEMS TO EMANATE FROM THIS ROOM. IN THE CENTER, A SMALLISH MAN IN A LONG ROBE TURNS TOWARDS THE PARTY AND SHOUTS, \"BEGONE, STRANGERS!\" HE THEN BEGINS WAVING HIS HANDS, AND INTONES THE WORDS, \"MAPIRO MAHAMA DIROMAT\"": [
    "Une lueur étrange semble émaner de cette pièce.",
    "Au centre, un homme de petite taille vêtu d'une longue robe se tourne vers votre groupe et s'écrie :",
    "   « Arrière, étrangers ! »",
    "Il se met alors à agiter les mains et psalmodie ces paroles sacrées :",
    "   « MAPIRO MAHAMA DIROMAT »"
  ],

  "WITHIN THE ROOM IS A STATUETTE OF A STRANGE BEAST WITH THE BODY OF A CHICKEN AND THE HEAD OF A CAT. THE STATUE IS MADE OF BRONZE, AND LIES ON AN ONYX PEDESTAL. THERE ARE UNUSUAL RUNES ON A PLAQUE THEREON.": [
    "Dans cette pièce repose la statuette d'une étrange créature",
    "au corps de poulet et à la tête de félin.",
    "Sculptée dans le bronze, elle trône sur un piédestal d'onyx.",
    "D'inhabituelles runes mystiques y sont gravées sur une plaque."
  ],

  "YOU SEE A LARGE STATUE OF A HOODED HUMANOID. THERE IS A GOLDEN LIGHT COMING FROM A HOLE IN THE HOOD. THE STATUE IS BEJEWELED WITH PRECIOUS AND SEMIPRECIOUS STONES. IN FRONT OF THE STATUE IS AN ALTAR, FROM WHICH FRESH INCENSE IS BURNING.": [
    "Vous apercevez une imposante statue d'un humanoïde encapuchonné.",
    "Une lueur dorée s'échappe d'une cavité sous la capuche.",
    "L'effigie est incrustée de gemmes précieuses et de cristaux scintillants.",
    "Devant la statue se dresse un autel de pierre d'où s'élève la fumée d'un encens fraîchement allumé."
  ],

  "IN THIS ROOM IS A SILVER STATUE OF A BOAR WITH HORNS AND LONG FANGS. ON THE WALL BY THE STATUE IS A MESSAGE (PARTIALLY OBSCURED) THAT APPEARS TO HAVE BEEN LEFT BY PASSING ELVES. IT IS HARDLY LEGIBLE, BUT SOME COMMENTS WARNING ABOUT GHOSTS AND DEMONS CAN STILL BE MADE OUT.": [
    "Dans cette salle trône une statue d'argent représentant un sanglier",
    "muni de cornes acérées et de longues défenses.",
    "Sur le mur près de la statue, une inscription partiellement effacée",
    "semble avoir été gravée par des elfes de passage.",
    "Bien qu'à peine lisible, on y distingue de claires mises en garde",
    "contre des spectres hanteurs et des démons vengeurs."
  ],

  "NOBODY IN THE PARTY CAN BREAK THE DOOR DOWN.": [
    "Aucun membre de votre groupe ne parvient à enfoncer cette porte.",
    "Le vantail de chêne ferré résiste à tous vos assauts."
  ],

  "AS THE PARTY ENTERS THIS ROOM, A BRONZE-COLORED SMOKE FILLS IT. SUDDENLY, THE PARTY FEELS COMPELLED TO LEAVE THE ROOM THE WAY THEY CAME.": [
    "À peine votre groupe pénètre-t-il dans la pièce qu'une fumée cuivrée l'envahit.",
    "Soudain, une force irrésistible et surnaturelle contraint chaque aventurier",
    "à rebrousser chemin et à quitter les lieux par la même issue."
  ],

  "AS THE PARTY ENTERS THIS ROOM, A SILVERY FOG DESCENDS FROM THE CEILING. SUDDENLY, IMAGES OF TERRIBLE DEMONS SEEM TO FORM ALL AROUND THEM. THE PARTY MEMBERS FLEE THE ROOM IN TERROR.": [
    "Dès votre entrée, une brume argentée descend en volutes depuis le plafond.",
    "Soudain, des silhouettes de démons terrifiants semblent se matérialiser tout autour de vous.",
    "Pris de panique face à ces visions d'épouvante, vos aventuriers fuient la pièce sans demander leur reste."
  ],

  "THERE IS A STATUETTE OF A BEAR ON A SMALL PEDESTAL. BEHIND IT IS A SIGN READING, \"I'VE GOT A MILLION OF 'EM\"": [
    "Une statuette d'ours repose sur un socle discret.",
    "Derrière elle est accroché un écriteau taquin :",
    "« J'en ai encore un million comme ça en réserve ! »"
  ],

  "UPON A SMALL SILVERY DISK RESTS A STATUE OF A FROG WEARING A RED AND BLUE CAPE. ALTHOUGH MADE OF METAL, THE STATUE INEXPLICABLY SEEMS TO COME TO LIFE, SHAKING ITS FORELEGS FROM SIDE TO SIDE, ACCOMPANIED BY A HIGH-PITCHED, \"YEAH!!!!...\"": [
    "Sur un disque d'argent repose la statue d'une grenouille parée d'une cape rouge et bleue.",
    "Bien que façonnée dans le métal, la figurine semble inexplicablement s'animer,",
    "agitant ses pattes avant de gauche à droite au rythme d'un braillement aigu :",
    "« OUAAIIIS !!!!... »"
  ],

  "A PLACARD NEAR THE GROUND READS: \"WATCH OUT, OR YOU'LL...\"": [
    "Un panonceau planté au ras du sol prévient :",
    "« Prenez garde, sans quoi vous allez... »",
    "(...tomber au fond du puits !)"
  ],

  "A PLACARD NEAR THE GROUND READS: \"WHEN IT'S NOT LIT...\"": [
    "Un panonceau planté au ras du sol prévient :",
    "« Quand ce n'est point éclairé... »"
  ],

  "A PLACARD NEAR THE GROUND READS: \"A DUNGEON'S DARK...\"": [
    "Un panonceau planté au ras du sol prévient :",
    "« Les donjons sont ténébreux... »"
  ],

  "THE FLOOR HAS A MOSAIC READING: \"TURN LEFT.\"": [
    "Une mosaïque incrustée dans le sol indique :",
    "« TOURNEZ À GAUCHE. »"
  ],

  "THE FLOOR HAS A MOSAIC READING: \"TURN AROUND.\"": [
    "Une mosaïque incrustée dans le sol indique :",
    "« FAITES DEMI-TOUR. »"
  ],

  "THE FLOOR HAS A MOSAIC READING: \"TURN RIGHT.\"": [
    "Une mosaïque incrustée dans le sol indique :",
    "« TOURNEZ À DROITE. »"
  ],

  "A SIGN ON THE DOOR READS: \"TREASURE REPOSITORY.\"": [
    "Un panneau forgé sur la porte annonce :",
    "« DÉPÔT DU TRÉSOR DU LABYRINTHE »"
  ],

  "EVERYBODY IN THE PARTY PASSES OUT! AFTER A TIME, THE PARTY COMES TO. FEELING MUCH WEAKENED, THE PARTY FINDS THEMSELVES OUTSIDE THE DOOR THEY TRIED TO ENTER.": [
    "Un gaz anesthésiant subit envahit l'air : toute votre escouade sombre dans l'inconscience !",
    "Au bout d'un long moment, vos héros rouvrent péniblement les yeux.",
    "Le corps lourd et l'esprit embrumé, vous vous retrouvez refoulés",
    "à l'extérieur de la porte que vous tentiez d'ouvrir."
  ],

  "A SIGN ON THE DOOR READS: PRIVATE ELEVATOR AUTHORIZED USERS ONLY!": [
    "Une pancarte rivetée sur la grille métallique indique :",
    "                 ASCENSEUR PRIVÉ",
    "         RÉSERVÉ AU PERSONNEL AUTORISÉ !"
  ],

  "A SIGN ON THE DOOR READS: *** TESTING GROUNDS CONTROL CENTER *** THIS AREA IS STRICTLY OFF-LIMITS. <<< DO NOT ENTER >>>": [
    "Un panneau officiel sur la porte blindée proclame :",
    "*** CENTRE DE CONTRÔLE DES ÉPREUVES DU SEIGNEUR TREBOR ***",
    "          CETTE ZONE EST STRICTEMENT INTERDITE.",
    "                 <<< DÉFENSE D'ENTRER >>>"
  ],

  "SUDDENLY, A LOUD PENETRATING CLANGING OF BELLS CAN BE HEARD. THERE IS A SUDDEN SILENCE AS THE BELLS STOP, FOLLOWED BY THE CLANKING AND TROMPING OF GUARDIAN MONSTERS. THE PARTY GETS THE IDEA THAT THEY ARE IN BIG TROUBLE!": [
    "Soudain, un carillon assourdissant de cloches d'alarme retentit dans tout l'étage !",
    "Un silence de mort s'abat lorsque les cloches se taisent enfin,",
    "immédiatement suivi du cliquetis d'armes et du pas lourd des monstres gardiens en patrouille.",
    "Votre groupe a la conviction immédiate qu'il s'est fourré dans un très mauvais pas !"
  ],

  "AS THE PARTY ENTERS THE ROOM, THE DOOR SLAMS SHUT, GLOWS BRIGHT ORANGE, AND DISAPPEARS. A DOOR APPEARS TO THE RIGHT. A VOICE, COMING FROM NO APPARENT DIRECTION CAN BE HEARD. IT SAYS: \"CONGRATULATIONS, MY LOYAL AND WORTHY SUBJECTS. TODAY YOU HAVE SERVED ME WELL AND TRULY PROVEN YOURSELF WORTHY OF THE QUEST YOU ARE NOW TO UNDERTAKE. SEVERAL YEARS AGO, AN AMULET WAS STOLEN FROM THE TREASURY BY AN EVIL WIZARD WHO IS PURPORTED TO BE IN THE DUNGEON IMMEDIATELY BELOW WHERE YOU NOW STAND. THIS AMULET HAS POWERS WHICH WE ARE NOW IN DIRE NEED OF. IT IS YOUR QUEST TO FIND THIS AMULET AND RETRIEVE IT FROM THIS WIZARD. IN RECOGNITION OF YOUR GREAT DEED TODAY, I WILL GIVE YOU A BLUE RIBBON, WHICH MAY BE USED TO ACCESS THE LEVEL TRANSPORTER ON THIS FLOOR. WITHOUT IT, THE PARTY WOULD BE UNABLE TO ENTER THE ROOM IN WHICH IT LIES. GO NOW, AND GOD SPEED IN YOUR QUEST!\"": [
    "Dès que vous entrez, la porte claque, brille d'une clarté orange et disparaît mystérieusement.",
    "Une nouvelle issue se dessine sur votre droite. Une voix noble et puissante retentit de nulle part :",
    "",
    "« Félicitations, mes loyaux et braves sujets. Aujourd'hui, vous m'avez fidèlement servi et avez amplement prouvé votre vaillance pour la quête royale qui vous attend désormais.",
    "",
    "Il y a quelques années, une Amulette d'une puissance inouïe fut dérobée au trésor impérial par le sorcier renégat Werdna. Ce scélérat s'est retranché dans les tréfonds du labyrinthe, juste sous vos pieds.",
    "Cette relique détient des pouvoirs indispensables à la survie du royaume. Votre mission suprême est de débusquer ce magicien et de rapporter l'Amulette au château.",
    "",
    "En récompense de votre bravoure, je vous remets le Ruban Bleu (BLUE RIBBON). Il vous permettra d'emprunter le monte-charge magique d'étage. Sans ce laissez-passer, nul ne peut franchir le seuil menant à l'ascenseur.",
    "",
    "Partez à présent, et que les dieux veillent sur votre quête ! »",
    "— Seigneur Trebor, Suzerain d'Overlord"
  ],

  "IN THIS 10 BY 10 ROOM, YOU NOTE A LARGE SEMI-CIRCULAR DESK. UPON IT ARE THE REMAINS OF WHAT MIGHT HAVE BEEN SCRYING GLASSES AND AMULETS OF SUMMONING AND OTHER ARTIFACTS OF CONTROL AND KNOWLEDGE. UNFORTUNATELY, THEY ALL SEEM TO HAVE BEEN DESTROYED BEYOND REPAIR. AS THE PARTY ENTERED THE ROOM, A SLIDING PANEL ON THE LEFT WALL SLAMMED SHUT. SHORTLY AFTER, IT GLOWED A PALE BLUE. NO MEMBER OF THE PARTY WAS ABLE TO PRY IT OPEN. THEN, THE DOOR ON THE OPPOSITE SIDE OF THE ROOM BEGINS TO GLOW A BRIGHT ORANGE, SEEMING TO BECKON TO THE PARTY TO COME. AS THE PARTY TURNS ABOUT, THEY NOTICE THE DOOR WHICH THEY HAD USED HAS DISAPPEARED.": [
    "Dans cette pièce de 10 pas sur 10, vous observez un grand bureau en demi-cercle.",
    "Sur sa surface s'amoncellent les vestiges de ce qui furent des miroirs de divination,",
    "des amulettes d'invocation et des artefacts de contrôle et de savoir arcanique.",
    "Hélas, tous ont été méticuleusement brisés et rendus inutilisables.",
    "",
    "Alors que vous avanciez, un panneau coulissant sur le mur de gauche s'est refermé brutalement,",
    "puis s'est mis à pulser d'une pâle clarté bleutée. Impossible de le rouvrir.",
    "",
    "Aussitôt, la porte qui lui fait face se met à flamboyer d'un orange éclatant,",
    "semblant vous inviter à franchir son seuil.",
    "En regardant en arrière, vous constatez que votre porte d'accès d'origine s'est purement évanouie !"
  ],

  "A SIGN ON THE DOOR READS: \"MONSTER ALLOCATION CENTER\"": [
    "Une inscription peinte sur le chambranle indique :",
    "« CENTRE D'AFFECTATION ET DE DISTRIBUTION DES MONSTRES »"
  ],

  "A LARGE SLIDING WALL WITH THE IMAGE OF A BEAR UPON IT BLOCKS THE PATH OF THE PARTY. THE WALL SLIDES TOWARDS THE PARTY, FORCING THEM OUTSIDE THE ROOM.": [
    "Un immense mur mobile sculpté à l'effigie d'un ours colossal obstrue la route.",
    "Le bloc de pierre glisse inexorablement vers votre groupe,",
    "vous refoulant de force hors de la salle !"
  ],

  "SUDDENDLY YOU SEE A GROUP OF 3 HUMANOIDS. ONE IS A BARBARIAN WITH A SWORD THAT GLOWS, ONE IS A SEXY FEMALE MAGE, AND THE THIRD LOOKS LIKE A HUGE OGRE! THE BARBARIAN POINTS TO THE END OF THE CORRIDOR AND YELLS \"ARIEL.. OOKLA.. THIS WAY!!\" AND THEY ALL RUN OFF!": [
    "Soudain surgit un étrange trio d'aventuriers :",
    "un fier barbare maniant une épée luminescente, une séduisante magicienne vêtue de voiles,",
    "et un colosse poilu aux allures de bête féroce !",
    "Le guerrier désigne l'extrémité du couloir en tonitruant :",
    "« Ariel... Ookla... par ici !! »",
    "Et tous trois détalent à fond de train dans l'obscurité !"
  ],

  "ITS GETTING WARM AROUND HERE!": [
    "L'air commence à devenir tiède par ici..."
  ],

  "ITS GETTING REALLY HOT!": [
    "La température monte d'un coup : il fait vraiment très chaud !"
  ],

  "ITS ALMOST TOO HOT TO BEAR!": [
    "La chaleur devient suffocante, presque insoutenable !"
  ],

  "INSCRIBED ON AN ORNATE GOLD PLAQUE IS A MESSAGE. THE SCRIPT IS ORNATE, AND BLINKS IN VARIOUS BRIGHT HUES: BE IT KNOWN THAT YE ARE TRESPASSING ON THE PROPERTY OF THE ARCH-MAGE WERDNA. THERE IS NO POSSIBLE WAY THAT YE CAN POSSIBLY GET THROUGH MY DEFENSES, LET ALONE DEFEAT ME IN BATTLE! SO SURE AM I OF THIS THAT I GIVE YOU THIS CLUE, \"CONTRA-DEXTRA AVENUE\" PS - TREBOR SUX": [
    "Gravé sur une plaque d'or ouvragée se trouve un message insolent.",
    "La calligraphie soignée scintille de teintes magiques changeantes :",
    "",
    "« Qu'il soit su de tous que vous foulez indûment le domaine privé de l'Archi-Mage Werdna.",
    "Il est absolument impossible que vous franchissiez mes défenses,",
    "et encore moins que vous puissiez espérer me vaincre en combat singulier !",
    "J'ai une telle certitude de votre défaite que je vous offre gracieusement cet indice :",
    "            « AVENUE CONTRA-DEXTRA »",
    "",
    "P.S. — Trebor est un incapable prétentieux ! »"
  ],

  "ONE GROUP OF GUARDIANS YE HAVE BEATEN BUT MANY MORE AWAIT YE! TURN BACK WHILE YOU STILL CAN, MORTALS!": [
    "« Vous avez défait une première cohorte de gardiens,",
    "mais des légions bien plus redoutables vous attendent !",
    "Rebroussez chemin tant que vous le pouvez encore, simples mortels ! »"
  ],

  "\"LAIR OF THE EVIL WIZARD WERDNA\" THE WIZARD IS **IN**": [
    "« REPAIRE DU MALÉFIQUE ARCHI-MAGE WERDNA »",
    "        LE SORCIER EST **PRÉSENT**"
  ],

  // ==========================================
  // WIZARDRY 2: THE KNIGHT OF DIAMONDS
  // ==========================================
  "AS YOU ENTER, AN EERIE GLOW FILLS THE ROOM. WITH A BRILLIANT FLASH, A TOWERING APPARITION APPEARS BEFORE YOU SHE SPEAKS: \"HEAR THESE, THE WORDS OF GNILDA. THE CITY LLYLGAMN HAVING SHOWN ITS UNWORTHINESS, I CHOSE TO RECLAIM THE SYMBOLS OF MY FAVOR. \"ONLY HERE, IN MY TEMPLE, MAY ONE WORTHY ENOUGH REGAIN THOSE SYMBOLS AND RETURN. BUT WOE TO THOSE UNDESERVING WHO MAY TRY. \"TO OBTAIN MY STAFF, ONE MUST ACQUIRE THE FIVE. THESE ARE THE TESTS, AND SHALL BE THE PROOF, BEFORE ME PRESENTED. \"THIS IS THE WILL OF GNILDA.\" THE APPARITION SLOWLY FADES.": [
    "À votre entrée, une lueur surnaturelle emplit la pièce. Dans un éclair éclatant,",
    "une silhouette spectrale grandiose se dresse devant vous. Elle prononce ces mots :",
    "",
    "« Entendez la volonté suprême de Gnilda. La cité de Llylgamyn s'étant montrée indigne,",
    "j'ai résolu de reprendre les emblèmes sacrés de ma protection.",
    "",
    "Seuls en ce temple, ceux qui possèdent une âme d'élite pourront reconquérir ces reliques.",
    "Mais malheur aux présomptueux indignes qui oseraient s'y aventurer.",
    "Pour prétendre à mon Bâton Sacré, vous devrez recouvrer les Cinq Éléments de l'Armure de Diamant.",
    "Telles sont les épreuves, et telle sera votre preuve devant moi.",
    "",
    "Telle est la volonté inébranlable de Gnilda. »",
    "",
    "L'apparition s'estompe lentement dans les ténèbres."
  ],

  "\"THE ARMOR YOU SEEK TO BRING TO THE FRAY. LIES FOUR STEPS AHEAD, BUT THREE STEPS AWAY.\"": [
    "« L'armure que vous cherchez pour affronter la mêlée,",
    "repose quatre pas devant vous, mais à trois foulées d'ici. »"
  ],

  "I AM A LONELY BEING, SCARRED BY SWORDS WOUNDED BY IRON, SATED WITH BATTLE-DEEDS, WEARIED BY BLADES. OFTEN I WITNESS WAR, PERILOUS FIGHT, NOR HOPE FOR CONSOLATION, THAT ANY HELP MAY RESCUE ME FROM STRIFE BEFORE I PERISH AMONG FIGHTING MEN. BUT HAMMERED SWORDS, HARD EDGED AND GRIMLY SHARP, BATTER ME, AND THE HANDWORK OF THE SMITH BITES IN THE CASTLES; I MUST EVER WAIT A CONTEST YET MORE CRUEL. I COULD NEVER IN ANY HABITATION FIND THE SORT OF DOCTOR WHO COULD HEAL MY WOUNDS WITH HERBS BUT CUTS FROM SWORDS EVER INCREASE ON ME THROUGH DEADLY CONTEST, BOTH BY DAY AND NIGHT. WHAT AM I?": [
    "« Je suis un être solitaire, couturé par les épées, meurtri par le fer,",
    "repu de carnage et lassé des taillades. Souvent témoin des guerres et des duels mortels,",
    "sans espoir de réconfort ni de guérison avant de périr aux mains des combattants.",
    "Les lames forgées et tranchantes me martèlent, et l'ouvrage du forgeron m'entaille au combat ;",
    "je dois sans cesse endurer des assauts plus cruels.",
    "Nul médecin n'a jamais pu panser mes plaies avec des onguents,",
    "et les coups d'estoc ne cessent de s'accumuler sur mes flancs, de jour comme de nuit.",
    "",
    "Qui suis-je ? »",
    "(Énigme du Trésor de Gnilda : SHIELD / BOUCLIER)"
  ],

  "\"THREE ROADS TO FOLLOW ONLY ONE MAY YOU TAKE. CHOOSE WISELY AMONG THEM, LEST THE QUEST YOU FORSAKE.\"": [
    "« Trois voies s'offrent à vos pas, mais une seule vous mènera au salut.",
    "Choisissez avec sagesse, de peur d'échouer à jamais dans votre quête. »"
  ],

  "A PANEL SLAMS SHUT BEHIND YOU!": [
    "Un panneau de pierre se referme lourdement derrière vous dans un fracas métallique !"
  ],

  "FROM ALL DIRECTIONS CAN BE HEARD THE OMINOUS SOUNDS OF HUNGRY, WILD BEASTS OF ALL DESCRIPTIONS.": [
    "De tous côtés résonnent les grognements sourds et sinistres",
    "de bêtes sauvages affamées prêtes à bondir."
  ],

  "A WIZENED SAGE, SITTING IN A LARGE PILE OF DUSTY, MYSTERIOUS BOOKS, TURNS TO YOU AND SAYS: \"FOR BUT 100000 GOLD, MANY THINGS WILL YOU BE TOLD.\"": [
    "Un vieux sage voûté, assis au milieu d'une montagne de grimoires poussiéreux,",
    "lève les yeux vers vous et murmure :",
    "« Contre la modique obole de 100 000 pièces d'or,",
    "les secrets les plus profonds de ce sanctuaire vous seront dévoilés. »"
  ],

  "BEFORE YOU IS A PILE OF SHATTERED STONE WHICH APPEARS TO BE THE RESULT OF A CAVE-IN. BENEATH THE ROCKS, YOU DISCOVER SHARDS OF BROKEN BONE AND BITS OF SMASHED, RUSTED ARMOR.": [
    "Devant vous s'amoncelle un éboulis de pierres brisées résultant d'un effondrement.",
    "Sous les décombres, vous découvrez des éclats d'ossements blanchis",
    "et des fragments d'armures rouillées broyées par la roche."
  ],

  "YOU STAND AT THE ENTRANCE OF WHAT SEEMS TO BE A HUGE CAVERN. THE FLOOR AND WALLS ARE COVERED WITH MOISTURE; THE AIR IS COOL AND DANK. FROM THE VAULTED CEILING HANG GREAT STALACTITES, AND UNKNOWN SMALL ANIMALS SQUEAK AND SCURRY IN THE DARKNESS.": [
    "Vous vous tenez à l'entrée d'une cavité monumentale.",
    "La roche ruisselle d'humidité et l'air y est frais et saturé d'embruns.",
    "D'immenses stalactites pendent de la voûte ombreuse,",
    "tandis que de petites bêtes inconnues couinent et fuient dans l'ombre."
  ],

  // ==========================================
  // WIZARDRY 3: LEGACY OF LLYLGAMYN
  // ==========================================
  "YOU STAND ON A BEACH. BEYOND IT LIES A DARK LAKE, IN WHICH IS A SMALL ISLAND.": [
    "Vous vous tenez sur une rive sablonneuse.",
    "Au-delà s'étend un lac aux eaux sombres et profondes,",
    "au centre duquel émerge un îlot isolé nimbé de brume."
  ],

  "YOU ARE AT THE WATER'S EDGE. IF YOU GO ANY FURTHER, YOU'LL DROWN!": [
    "Vous êtes au bord immédiat de l'abîme aquatique.",
    "Si vous faites un seul pas de plus en armure, vous coulerez à pic et vous vous noierez !"
  ],

  "BEFORE YOU STANDS A GREAT FORTRESS. BETWEEN ITS PARAPETS LIES A DEEP MOAT, AND A SIGN BY THE MOAT READS: \"BEWARE OF MOAT MONSTERS!!!\"": [
    "Une imposante forteresse médiévale se dresse devant vous.",
    "Devant ses remparts s'ouvre une douve profonde et vaseuse.",
    "Une pancarte plantée sur la berge avertit :",
    "« ATTENTION AUX MONSTRES DE LA DOUVE !!! »"
  ],

  "A SIGN ON THE DOOR READS: \"BARRACKS\"": [
    "Une plaque en fer forgé sur le chambranle indique :",
    "« CASERNE DU CORPS DE GARDE »"
  ],

  // ==========================================
  // UNIVERSAL / SCENARIOS COMMONS
  // ==========================================
  "SECRET PASSAGE TO THE CASTLE-NORTH!": [
    "Passage secret dérobé vers les remparts Nord du Château !"
  ],

  "YOU FACE AN ORNATE KEYHOLE. RUNES SURROUNDING IT SAY: 'ONLY KEYS OF THE ARCHMAGE WILL OPEN THIS PORTAL!'": [
    "Vous vous trouvez face à une serrure ouvragée cerclée d'or.",
    "Les runes gravées dans la pierre proclament :",
    "« Seules les Clés de l'Archi-Mage déverrouilleront ce portail ! »"
  ],

  "YOU FACE A GIANT METAL DOOR WITH A DIAL IN THE CENTER. THE DIAL HAS NUMBERS AROUND IT AND THE RUNES 'MASTER LOCK' ARE INSCRIBED ON IT. WHAT'S THE COMBINATION?": [
    "Vous faites face à une colossale porte d'acier munie d'un cadran central rotatif.",
    "Des chiffres entourent le mécanisme et des runes désignent le verrou maître.",
    "« Quelle est la combinaison secrète ? »"
  ],

  "YOU ARE IN THE INTERIOR OF THE SAFE. ITS WALLS ARE LINED WITH LEAD, AND THE PLACE IS HEAPED WITH MAGICAL TOOLS AND INSTRUMENTS OF A MUNDANE NATURE. YOU WADE THROUGH BOOKS, SCROLLS,TOMES, GLASSWARE, BOTTLES OF INGREDIENTS AND CHEMICALS, AND FINALLY FIND AN ORNATE MAHOGANY CHEST. OPENING IT, YOU FIND......": [
    "Vous pénétrez au coeur de la chambre forte blindée.",
    "Ses parois sont doublées de plomb, et le sol est encombré de cornues, d'outils magiques",
    "et d'instruments alchimiques rares. Vous vous frayez un passage à travers des grimoires,",
    "parchemins et flacons d'essences arcaniques pour découvrir un luxueux coffre en acajou.",
    "En soulevant son couvercle ouvragé, vous découvrez......"
  ],

  "YOU ENTER A CRYPT FILLED WITH OLD BONES AND FRESHLY INTERRED DEAD.": [
    "Vous pénétrez dans une crypte funéraire glaciale,",
    "tapissée d'ossements séculaires et de sépultures fraîches."
  ],

  "A PLAQUE READS: WELCOME TO BOLTAC'S!": [
    "Une enseigne cuivrée proclame joyeusement :",
    "« Bienvenue à la boutique de Boltac ! »"
  ],

  "UH-OH! A JET OF SCALDING WATER!": [
    "Attention ! Un jet d'eau bouillante jaillit brusquement de la paroi !"
  ],

  "OUCH! BURNING HOT ROCKS!": [
    "Aïe ! Les dalles chauffées à blanc vous brûlent les pieds !"
  ],

  "WATCH OUT! A LAVA GEYSER!": [
    "Prenez garde ! Un geyser de magma en fusion crache des flammèches !"
  ],

  "GEEZ, IT'S COLD ENOUGH TO HURT!": [
    "Brrr ! Le froid est si mordant qu'il engourdit vos membres et blesse vos chairs !"
  ],

  "YOU ENTER A FROSTY NETWORK OF CAVES. THE TEMPERATURE IS SO COLD THAT YOUR RESISTANCE TO ATTACK WILL SUFFER!": [
    "Vous entrez dans un dédale de cavernes givrées.",
    "La température est tellement polaire que votre résistance aux coups en sera affaiblie !"
  ],

  "A POSTER READS: FROST DRAGON'S LAIR!": [
    "Une affiche déchirée prévient :",
    "« REPAIRE DU DRAGON DES GLACES ! »"
  ],

  "THE DOOR IS LOCKED!!": [
    "Cette porte est solidement verrouillée !"
  ],

  "A WALL OF ICE BLOCKS YOUR PATH.": [
    "Un épais mur de glace translucide obstrue totalement le passage."
  ],

  "THERE IS AN OBJECT EMBEDDED IN THE ICE": [
    "Un mystérieux objet scintille, prisonnier dans la glace millénaire."
  ],

  "THE FLOOR LOOKS UNSAFE!!": [
    "Le dallage sous vos bottes semble fissuré et particulièrement instable !"
  ],

  "BEWARE OF FALSE PROPHETS!!": [
    "Méfiez-vous des faux prophètes et de leurs promesses trompeuses !"
  ],

  "YOUR WAY IS BLOCKED BY A WALL OF SHIMMERING RED LIGHT.": [
    "Votre progression est barrée par une barrière magique de lumière rougeoyante."
  ],

  "YOUR WAY IS BLOCKED BY A WALL OF SHIMMERING BLUE LIGHT.": [
    "Votre progression est barrée par une barrière magique de lumière azurée."
  ],

  "YOUR WAY IS BLOCKED BY A WALL OF SHIMMERING YELLOW LIGHT.": [
    "Votre progression est barrée par une barrière magique de lumière dorée."
  ],

  "YOUR WAY IS BLOCKED BY A WALL OF SHIMMERING WHITE LIGHT": [
    "Votre progression est barrée par un rideau impénétrable de lumière blanche immaculée."
  ],

  "TO THE WEST A LONG STAIRCASE DESCENDS INTO THE GLOOM.": [
    "Vers l'Ouest, un monumental escalier de pierre s'enfonce dans les ténèbres."
  ],

  "WHAT IS YOUR FAVOURITE COLOUR?": [
    "« Quelle est votre couleur préférée ? »"
  ]
};

/**
 * Intelligent regex and structural pattern replacer for dynamic scenario messages
 */
export function translateDynamicScenarioLines(lines: string[]): string[] {
  return lines.map(line => {
    let t = line;

    // Prefixes & Inscriptions
    t = t.replace(/^A LARGE SIGN ON THE WALL READS:\s*/i, 'UN GRAND PANNEAU SUR LE MUR INDIQUE :\n');
    t = t.replace(/^A SIGN ON THE DOOR READS:\s*/i, 'UN PANNEAU SUR LA PORTE INDIQUE :\n');
    t = t.replace(/^A SIGN ON THE WALL READS:\s*/i, 'UN PANNEAU SUR LE MUR INDIQUE :\n');
    t = t.replace(/^A SIGN READS:\s*/i, 'UN PANNEAU INDIQUE :\n');
    t = t.replace(/^A PLACARD NEAR THE GROUND READS:\s*/i, 'UN PANONCEAU PRÈS DU SOL INDIQUE :\n');
    t = t.replace(/^A PLAQUE READS:\s*/i, 'UNE PLAQUE INDIQUE :\n');
    t = t.replace(/^A POSTER READS:\s*/i, 'UNE AFFICHE INDIQUE :\n');
    t = t.replace(/^THE FLOOR HAS A MOSAIC READING:\s*/i, 'UNE MOSAÏQUE AU SOL INDIQUE :\n');
    t = t.replace(/^A VOICE (?:BOOMS|SPEAKS IN YOUR MIND|CALLS OUT):\s*/i, 'UNE VOIX RETENTIT DANS VOTRE ESPRIT :\n');

    // Directions
    t = t.replace(/"TURN LEFT\.?"/i, '« TOURNEZ À GAUCHE »');
    t = t.replace(/"TURN RIGHT\.?"/i, '« TOURNEZ À DROITE »');
    t = t.replace(/"TURN AROUND\.?"/i, '« FAITES DEMI-TOUR »');
    t = t.replace(/\bTURN BACK!?\b/i, 'REBROUSSEZ CHEMIN !');

    // Warnings & Standard phrases
    t = t.replace(/\bAUTHORIZED USERS ONLY!?\b/i, 'ACCÈS RÉSERVÉ AU PERSONNEL AUTORISÉ !');
    t = t.replace(/\b<<< DO NOT ENTER >>>\b/i, '<<< DÉFENSE D\'ENTRER >>>');
    t = t.replace(/\bSTRICTLY OFF-LIMITS\b/i, 'STRICTEMENT INTERDIT');
    t = t.replace(/\bTHE DOOR IS LOCKED!?\b/i, 'LA PORTE EST VERROUILLÉE !');
    t = t.replace(/\bENTER AT YOUR OWN RISK!?\b/i, 'ENTREZ À VOS RISQUES ET PÉRILS !');
    t = t.replace(/\bBEWARE OF ([^!]+)!*/i, 'PRENEZ GARDE : $1 !');
    t = t.replace(/\bSECRET PASSAGE TO THE ([A-Z\-]+)!/i, 'PASSAGE SECRET VERS LE $1 !');

    // Short alerts
    if (/^WIPE YOUR FEET!?$/i.test(t.trim())) t = 'ESSUYEZ VOS PIEDS !';
    if (/^DON'T GIVE UP!?$/i.test(t.trim())) t = 'NE PERDEZ PAS COURAGE !';
    if (/^IT IS VERY COLD HERE!?$/i.test(t.trim())) t = 'IL FAIT GLACIAL PAR ICI !';
    if (/^IT'S HOT HERE!?$/i.test(t.trim())) t = 'IL FAIT TRÈS CHAUD ICI !';
    if (/^THE FLOOR LOOKS UNSAFE!?$/i.test(t.trim())) t = 'LE SOL SEMBLE TRÈS INSTABLE !';

    return t;
  });
}

/**
 * Main translation entry point for scenario messages.
 * Returns the localized French lines alongside original lines when lang is 'fr'.
 */
export function localizeScenarioMessageLines(
  rawLines: string[] | undefined,
  lang: string
): { lines: string[]; originalLines?: string[]; isTranslated: boolean } {
  if (!rawLines || rawLines.length === 0) {
    return { lines: [], isTranslated: false };
  }

  if (lang !== 'fr') {
    return { lines: rawLines, isTranslated: false };
  }

  const key = normalizeMessageKey(rawLines);

  // 1. Direct canonical exact match
  if (EXACT_SCENARIO_MESSAGES_FR[key]) {
    return {
      lines: EXACT_SCENARIO_MESSAGES_FR[key],
      originalLines: rawLines,
      isTranslated: true
    };
  }

  // 2. Fuzzy substring check in dictionary (handles formatting variants)
  for (const [dictKey, french] of Object.entries(EXACT_SCENARIO_MESSAGES_FR)) {
    if (key.includes(dictKey) || dictKey.includes(key)) {
      return {
        lines: french,
        originalLines: rawLines,
        isTranslated: true
      };
    }
  }

  // 3. Dynamic pattern translation
  const dynamicallyTranslated = translateDynamicScenarioLines(rawLines);
  const changed = dynamicallyTranslated.some((line, idx) => line !== rawLines[idx]);

  return {
    lines: dynamicallyTranslated,
    originalLines: changed ? rawLines : undefined,
    isTranslated: changed
  };
}
