import React, { useState } from 'react';
import { 
  TCharacter, 
  GameLocation, 
  TRace, 
  TClass, 
  TAlign, 
  TItem 
} from '../types/wizardry';
import { 
  RACE_BASE_ATTRIBUTES, 
  ITEMS_DATABASE, 
  EXP_TABLES, 
  SPELLS 
} from '../data/wizardryData';
import { sounds } from '../utils/soundEffects';
import { 
  Shield, 
  Sparkles, 
  HeartHandshake, 
  Store, 
  DoorOpen, 
  UserPlus, 
  Cross, 
  Coins, 
  ChevronRight, 
  Layers, 
  FileCode,
  Flame,
  User,
  ArrowRight
} from 'lucide-react';

interface CastleViewProps {
  party: TCharacter[];
  setParty: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  allCharacters: TCharacter[];
  setAllCharacters: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  onEnterMaze: () => void;
  onOpenPySide6Export: () => void;
}

type CastleTab = 'COURTYARD' | 'TAVERN' | 'INN' | 'BOLTAC' | 'TEMPLE' | 'TRAINING';

export const CastleView: React.FC<CastleViewProps> = ({
  party,
  setParty,
  allCharacters,
  setAllCharacters,
  onEnterMaze,
  onOpenPySide6Export
}) => {
  const [currentTab, setCurrentTab] = useState<CastleTab>('COURTYARD');
  const [message, setMessage] = useState<string>('Bienvenue au Château de Trebor. Choisissez votre destination.');
  const [selectedCharIndex, setSelectedCharIndex] = useState<number>(0);

  // Character Creation state in Training Grounds
  const [newCharName, setNewCharName] = useState('');
  const [newCharRace, setNewCharRace] = useState<TRace>('HUMAN');
  const [newCharAlign, setNewCharAlign] = useState<TAlign>('GOOD');
  const [bonusPoints, setBonusPoints] = useState<number>(10);
  const [allocatedStats, setAllocatedStats] = useState({
    STRENGTH: 8,
    IQ: 8,
    PIETY: 5,
    VITALITY: 8,
    AGILITY: 8,
    LUCK: 9
  });
  const [isRollingStats, setIsRollingStats] = useState(false);

  const selectedHero = party[selectedCharIndex] || party[0];

  // ==========================================
  // INN LOGIC (HEALING & LEVEL UP)
  // ==========================================
  const handleRestAtInn = (roomType: 'STABLES' | 'COTS' | 'ECONOMY' | 'MERCHANT' | 'ROYAL') => {
    sounds.playGold();
    const costMap = { STABLES: 0, COTS: 10, ECONOMY: 50, MERCHANT: 200, ROYAL: 500 };
    const cost = costMap[roomType];

    if (selectedHero.gold < cost) {
      setMessage(`Fonds insuffisants ! ${selectedHero.name} n'a pas assez d'or.`);
      return;
    }

    // Deduct cost and rest
    selectedHero.gold -= cost;
    selectedHero.hpLeft = selectedHero.hpMax;
    // Recharge all spells
    if (selectedHero.class === 'MAGE' || selectedHero.class === 'SAMURAI' || selectedHero.class === 'BISHOP') {
      selectedHero.mageSpells = [0, 3, 2, 2, 1, 1, 1, 1];
    }
    if (selectedHero.class === 'PRIEST' || selectedHero.class === 'LORD' || selectedHero.class === 'BISHOP') {
      selectedHero.priestSpells = [0, 3, 2, 2, 1, 1, 1, 1];
    }

    // Check level up
    const expNeeded = EXP_TABLES[selectedHero.class][Math.min(EXP_TABLES[selectedHero.class].length - 1, selectedHero.charLevel - 1)];
    let levelUpMsg = '';
    if (selectedHero.exp >= expNeeded) {
      selectedHero.charLevel += 1;
      const hpGain = Math.floor(Math.random() * 8) + 4;
      selectedHero.hpMax += hpGain;
      selectedHero.hpLeft = selectedHero.hpMax;
      levelUpMsg = ` 🌟 NIVEAU SUPÉRIEUR ! ${selectedHero.name} est maintenant Niveau ${selectedHero.charLevel} (+${hpGain} PV Max) !`;
      sounds.playFanfare();
    }

    setParty([...party]);
    setMessage(`${selectedHero.name} a passé un repos réparateur. Tous ses PV et sorts sont restaurés !${levelUpMsg}`);
  };

  // ==========================================
  // BOLTAC TRADING POST (BUY / SELL / IDENTIFY / POOL)
  // ==========================================
  const handleBuyItem = (item: TItem) => {
    if (selectedHero.gold < item.price) {
      setMessage(`Vous n'avez pas assez d'or pour acheter ${item.name} (${item.price} PO).`);
      return;
    }
    if (selectedHero.possessions.length >= 8) {
      setMessage(`L'inventaire de ${selectedHero.name} est plein (max 8 objets).`);
      return;
    }

    sounds.playGold();
    selectedHero.gold -= item.price;
    selectedHero.possessions.push({
      equipped: false,
      cursed: item.cursed,
      identified: true,
      itemIndex: item.id
    });

    setParty([...party]);
    setMessage(`Achat réussi : ${item.name} pour ${item.price} PO.`);
  };

  const handleSellItem = (slotIdx: number) => {
    const slot = selectedHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    if (slot.cursed && slot.equipped) {
      setMessage(`Impossible de vendre un objet maudit actuellement équipé ! Faites-le désenvoûter.`);
      return;
    }

    sounds.playGold();
    const sellPrice = Math.max(1, Math.floor(itm.price / 2));
    selectedHero.gold += sellPrice;
    selectedHero.possessions.splice(slotIdx, 1);
    setParty([...party]);
    setMessage(`Objet vendu : ${itm.name} pour ${sellPrice} PO.`);
  };

  const handlePoolGold = () => {
    sounds.playGold();
    let total = 0;
    party.forEach(h => {
      total += h.gold;
      h.gold = 0;
    });
    selectedHero.gold = total;
    setParty([...party]);
    setMessage(`Tout l'or du groupe (${total} PO) a été rassemblé dans la bourse de ${selectedHero.name}.`);
  };

  // ==========================================
  // TEMPLE OF CANT (RESURRECT / CURE)
  // ==========================================
  const handleResurrect = (targetHero: TCharacter) => {
    sounds.playSpellCast();
    const cost = targetHero.status === 'DEAD' ? targetHero.charLevel * 250 : targetHero.charLevel * 500;
    if (selectedHero.gold < cost) {
      setMessage(`Dons insuffisants ! Le Temple exige ${cost} PO.`);
      return;
    }

    selectedHero.gold -= cost;
    // Resurrection chance based on vitality
    const successChance = Math.min(95, targetHero.attrib.VITALITY * 5 + 30);
    if (Math.random() * 100 < successChance) {
      targetHero.status = 'OK';
      targetHero.hpLeft = 1;
      sounds.playFanfare();
      setMessage(`« CHANT - PRIÈRE - MIRACLE ! » ${targetHero.name} revient parmi les vivants avec 1 PV !`);
    } else {
      if (targetHero.status === 'DEAD') {
        targetHero.status = 'ASHES';
        setMessage(`« MALHEUR ! » Le rituel échoue, le corps de ${targetHero.name} est réduit en CENDRES !`);
      } else {
        targetHero.status = 'LOST';
        setMessage(`« HÉLAS ! » Les cendres se dispersent... ${targetHero.name} est PERDU À JAMAIS !`);
      }
    }
    setParty([...party]);
  };

  // ==========================================
  // TRAINING GROUNDS (CREATE CHARACTER)
  // ==========================================
  const startRollStats = () => {
    sounds.playTurn();
    const base = RACE_BASE_ATTRIBUTES[newCharRace];
    const bonus = 7 + Math.floor(Math.random() * 5); // 7 to 12
    setBonusPoints(bonus);
    setAllocatedStats({ ...base } as any);
    setIsRollingStats(true);
    setMessage(`Points bonus tirés : ${bonus}. Allouez-les judicieusement aux caractéristiques.`);
  };

  const handleAddStat = (stat: keyof typeof allocatedStats) => {
    if (bonusPoints <= 0 || allocatedStats[stat] >= 18) return;
    sounds.playTurn();
    setAllocatedStats(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
    setBonusPoints(prev => prev - 1);
  };

  const handleCreateNewHero = (chosenClass: TClass) => {
    if (!newCharName.trim()) {
      setMessage('Veuillez entrer un nom pour votre héros.');
      return;
    }
    sounds.playFanfare();

    const newHero: TCharacter = {
      id: `hero-${Date.now()}`,
      name: newCharName.toUpperCase().trim(),
      race: newCharRace,
      class: chosenClass,
      align: newCharAlign,
      status: 'OK',
      age: 18 * 52,
      attrib: { ...allocatedStats },
      luckSkill: [16, 16, 16, 16, 16],
      gold: 100 + Math.floor(Math.random() * 50),
      exp: 0,
      maxLevel: 1,
      charLevel: 1,
      hpLeft: 10,
      hpMax: 10,
      spellsKnown: new Array(51).fill(false),
      mageSpells: [0, 2, 0, 0, 0, 0, 0, 0],
      priestSpells: [0, 2, 0, 0, 0, 0, 0, 0],
      armorClass: 10,
      healPts: 0,
      critHit: chosenClass === 'NINJA',
      swingCount: 1,
      wepDamage: { level: 1, hpFac: 6, hpMinAdd: 1 },
      hitMod: 0,
      poisonAmount: 0,
      awards: [0, 0, 0, 0, 0],
      inMaze: false,
      possessions: [
        { equipped: true, cursed: false, identified: true, itemIndex: 1 } // Dagger
      ]
    };

    setAllCharacters(prev => [...prev, newHero]);
    if (party.length < 6) {
      setParty(prev => [...prev, newHero]);
    }
    setNewCharName('');
    setIsRollingStats(false);
    setMessage(`Le héros ${newHero.name} (${newHero.race} ${newHero.class}) a été créé et inscrit au registre !`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-400 font-bold font-serif shadow-sm">
            W1
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              Château de Trebor
            </h1>
            <p className="text-xs text-slate-400">
              Cité de garnison surplombant le Labyrinthe de Werdna
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPySide6Export}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
          >
            <FileCode className="w-3.5 h-3.5" />
            Code PySide6 (.py)
          </button>
          <button
            onClick={onEnterMaze}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-amber-950/30"
          >
            <DoorOpen className="w-4 h-4" />
            Entrer dans le Donjon
          </button>
        </div>
      </div>

      {/* Main Town Navigation Tabs */}
      <div className="flex items-center gap-1 px-6 py-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto text-xs">
        <button
          onClick={() => { setCurrentTab('COURTYARD'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'COURTYARD' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Grande Cour
        </button>
        <button
          onClick={() => { setCurrentTab('INN'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'INN' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Auberge de l'Aventurier
        </button>
        <button
          onClick={() => { setCurrentTab('TAVERN'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'TAVERN' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Taverne de Gilgamesh
        </button>
        <button
          onClick={() => { setCurrentTab('BOLTAC'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'BOLTAC' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Comptoir de Boltac
        </button>
        <button
          onClick={() => { setCurrentTab('TEMPLE'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'TEMPLE' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Temple de Cant
        </button>
        <button
          onClick={() => { setCurrentTab('TRAINING'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'TRAINING' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Terrains d'Entraînement
        </button>
      </div>

      {/* Information Banner */}
      <div className="px-6 py-2.5 bg-slate-900/40 border-b border-slate-800/40 text-xs text-amber-300/90 font-medium flex items-center justify-between">
        <span>{message}</span>
        <span className="text-slate-400">Héros sélectionné : <strong className="text-white">{selectedHero?.name}</strong> ({selectedHero?.gold} PO)</span>
      </div>

      {/* Town Views Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {currentTab === 'COURTYARD' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl space-y-4">
              <h2 className="text-xl font-serif font-bold text-white tracking-wide">
                Bienvenue dans les Terres de l'Overlord Trebor
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Le tyran et mage maléfique <strong>Werdna</strong> s'est emparé de la sainte amulette et s'est retranché au dixième sous-sol du labyrinthe magique.
                Composez votre escouade, équipez-vous chez Boltac, bénissez vos héros au Temple de Cant et plongez dans le dédale.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <button
                  onClick={() => setCurrentTab('INN')}
                  className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition space-y-1.5"
                >
                  <div className="text-amber-400 font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Auberge de l'Aventurier
                  </div>
                  <p className="text-xs text-slate-400">Soignez les blessures, rechargez vos sorts et gagnez des niveaux.</p>
                </button>

                <button
                  onClick={() => setCurrentTab('BOLTAC')}
                  className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition space-y-1.5"
                >
                  <div className="text-amber-400 font-bold flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Comptoir de Boltac
                  </div>
                  <p className="text-xs text-slate-400">Achetez armes, armures et potions, identifiez vos trouvailles.</p>
                </button>

                <button
                  onClick={() => setCurrentTab('TEMPLE')}
                  className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition space-y-1.5"
                >
                  <div className="text-amber-400 font-bold flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4" />
                    Temple de Cant
                  </div>
                  <p className="text-xs text-slate-400">Ressuscitez les défunts et purifiez les pétrifications et paralysies.</p>
                </button>
              </div>
            </div>

            {/* Ready Party Summary Strip */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">
                  Composition Actuelle de l'Escouade ({party.length}/6)
                </h3>
                <span className="text-xs text-slate-400">Cliquez sur un héros pour interagir dans les boutiques</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
                {party.map((hero, idx) => (
                  <div
                    key={hero.id}
                    onClick={() => { setSelectedCharIndex(idx); sounds.playTurn(); }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition flex flex-col justify-between ${selectedCharIndex === idx ? 'bg-amber-950/40 border-amber-500/60 shadow-sm' : 'bg-slate-800/60 border-slate-700/40 hover:border-slate-600'}`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>{hero.name}</span>
                        <span className="text-[10px] text-amber-400">Niv.{hero.charLevel}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{hero.class}</div>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">PV:</span>
                        <span className={hero.hpLeft < hero.hpMax / 2 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                          {hero.hpLeft}/{hero.hpMax}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>CA: {hero.armorClass}</span>
                        <span className="text-amber-400">{hero.gold} PO</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INN VIEW */}
        {currentTab === 'INN' && (
          <div className="max-w-3xl mx-auto bg-slate-900/70 border border-slate-800 p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">L'Auberge de l'Aventurier</h2>
              <p className="text-xs text-slate-400">Reposez-vous pour restaurer vos forces et accumuler vos montées de niveau.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { type: 'STABLES' as const, name: 'Les Écuries', cost: 0, desc: 'Gratuit. Restaure tous les sorts, aucun soin de PV.' },
                { type: 'COTS' as const, name: 'Les Paillasses', cost: 10, desc: '10 PO / sem. Rend tous les PV et sorts.' },
                { type: 'ECONOMY' as const, name: 'Chambres Économiques', cost: 50, desc: '50 PO / sem. Soins rapides et sorts.' },
                { type: 'MERCHANT' as const, name: 'Suites Marchandes', cost: 200, desc: '200 PO / sem. Confort royal et soins.' },
                { type: 'ROYAL' as const, name: 'Suites Royales', cost: 500, desc: '500 PO / sem. Le summum de la noblesse.' }
              ].map(r => (
                <div key={r.type} className="p-3.5 bg-slate-800/60 border border-slate-700/50 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-amber-300">{r.name}</div>
                    <div className="text-xs text-slate-400">{r.desc}</div>
                  </div>
                  <button
                    onClick={() => handleRestAtInn(r.type)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition shrink-0 ml-3"
                  >
                    Dormir
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOLTAC SHOP */}
        {currentTab === 'BOLTAC' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div>
                <h2 className="text-lg font-serif font-bold text-white">Comptoir de Boltac</h2>
                <p className="text-xs text-slate-400">Armes, protections et artefacts magiques.</p>
              </div>
              <button
                onClick={handlePoolGold}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5" />
                Mettre tout l'or en commun sur {selectedHero?.name}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buy catalog */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Articles en vente</h3>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {ITEMS_DATABASE.filter(it => it.price > 0 && it.boltacStock > 0).map(item => (
                    <div key={item.id} className="p-2.5 bg-slate-800/50 border border-slate-700/40 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.objType} {item.armorMod ? `· CA -${item.armorMod}` : ''} {item.price} PO
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuyItem(item)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition"
                      >
                        Acheter
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Inventory (Sell) */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Inventaire de {selectedHero?.name} (Vendre)
                </h3>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {selectedHero?.possessions.length === 0 && (
                    <p className="text-xs text-slate-500 italic py-6 text-center">Aucun objet dans l'inventaire.</p>
                  )}
                  {selectedHero?.possessions.map((slot, sIdx) => {
                    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
                    if (!itm) return null;
                    return (
                      <div key={sIdx} className="p-2.5 bg-slate-800/50 border border-slate-700/40 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{itm.name}</span>
                            {slot.equipped && <span className="text-[10px] text-emerald-400 font-bold">[Équipé]</span>}
                            {slot.cursed && <span className="text-[10px] text-red-400 font-bold">[Maudit]</span>}
                          </div>
                          <div className="text-[11px] text-slate-400">Valeur de vente : {Math.floor(itm.price / 2)} PO</div>
                        </div>
                        <button
                          onClick={() => handleSellItem(sIdx)}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-semibold transition"
                        >
                          Vendre
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEMPLE OF CANT */}
        {currentTab === 'TEMPLE' && (
          <div className="max-w-3xl mx-auto bg-slate-900/70 border border-slate-800 p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Le Temple Radiant de Cant</h2>
              <p className="text-xs text-slate-400">Les prêtres invoquent les miracles divins pour relever les héros morts au combat.</p>
            </div>

            <div className="space-y-3">
              {party.map(h => (
                <div key={h.id} className="p-3.5 bg-slate-800/60 border border-slate-700/50 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-sm text-white">{h.name} ({h.class})</div>
                    <div className="text-slate-400">
                      État : <strong className={h.status === 'OK' ? 'text-emerald-400' : 'text-red-400'}>{h.status}</strong>
                    </div>
                  </div>
                  {h.status !== 'OK' && h.status !== 'LOST' ? (
                    <button
                      onClick={() => handleResurrect(h)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition"
                    >
                      Prier & Ressusciter ({h.charLevel * 250} PO)
                    </button>
                  ) : (
                    <span className="text-slate-500 italic">En pleine santé</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRAINING GROUNDS */}
        {currentTab === 'TRAINING' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-xl space-y-4">
              <h2 className="text-lg font-serif font-bold text-white">Création d'un Nouveau Héros</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nom du Héros</label>
                  <input
                    type="text"
                    value={newCharName}
                    onChange={e => setNewCharName(e.target.value)}
                    placeholder="Ex: ARTHUR"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Race</label>
                  <select
                    value={newCharRace}
                    onChange={e => setNewCharRace(e.target.value as TRace)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="HUMAN">Humain (Équilibré)</option>
                    <option value="ELF">Elfe (I.Q. & Piété élevés)</option>
                    <option value="DWARF">Nain (Force & Vitalité)</option>
                    <option value="GNOME">Gnome (Piété & Agilité)</option>
                    <option value="HOBBIT">Hobbit (Chance légendaire)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Alignement</label>
                  <select
                    value={newCharAlign}
                    onChange={e => setNewCharAlign(e.target.value as TAlign)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="GOOD">Bon</option>
                    <option value="NEUTRAL">Neutre</option>
                    <option value="EVIL">Mauvais</option>
                  </select>
                </div>
              </div>

              {!isRollingStats ? (
                <button
                  onClick={startRollStats}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  Tirer les dés & Allouer les Caractéristiques
                </button>
              ) : (
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-300 font-bold">
                      Points bonus restants à distribuer : {bonusPoints}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {Object.entries(allocatedStats).map(([st, val]) => (
                      <div key={st} className="p-2.5 bg-slate-800/70 border border-slate-700/50 rounded-lg text-center">
                        <div className="text-[10px] text-slate-400 uppercase">{st.slice(0, 3)}</div>
                        <div className="text-base font-bold text-white py-1">{val}</div>
                        <button
                          onClick={() => handleAddStat(st as any)}
                          disabled={bonusPoints <= 0 || val >= 18}
                          className="w-full py-1 bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white rounded text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition"
                        >
                          +1
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs text-slate-400 block">Choisissez la Classe Éligible :</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { cls: 'FIGHTER' as const, req: allocatedStats.STRENGTH >= 11 },
                        { cls: 'MAGE' as const, req: allocatedStats.IQ >= 11 },
                        { cls: 'PRIEST' as const, req: allocatedStats.PIETY >= 11 && newCharAlign !== 'NEUTRAL' },
                        { cls: 'THIEF' as const, req: allocatedStats.AGILITY >= 11 && newCharAlign !== 'GOOD' },
                        { cls: 'BISHOP' as const, req: allocatedStats.IQ >= 12 && allocatedStats.PIETY >= 12 },
                        { cls: 'SAMURAI' as const, req: allocatedStats.STRENGTH >= 15 && allocatedStats.VITALITY >= 14 },
                        { cls: 'LORD' as const, req: allocatedStats.STRENGTH >= 15 && allocatedStats.PIETY >= 12 && newCharAlign === 'GOOD' },
                        { cls: 'NINJA' as const, req: allocatedStats.STRENGTH >= 17 && allocatedStats.AGILITY >= 17 && newCharAlign === 'EVIL' }
                      ].map(item => (
                        <button
                          key={item.cls}
                          disabled={!item.req}
                          onClick={() => handleCreateNewHero(item.cls)}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-amber-600 text-white rounded-lg text-xs font-bold disabled:opacity-25 disabled:pointer-events-none transition border border-slate-700"
                        >
                          Devenir {item.cls}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAVERN VIEW */}
        {currentTab === 'TAVERN' && (
          <div className="max-w-3xl mx-auto bg-slate-900/70 border border-slate-800 p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Taverne de Gilgamesh</h2>
              <p className="text-xs text-slate-400">Recrutez ou libérez des aventuriers pour former une équipe de 1 à 6 membres.</p>
            </div>

            <div className="space-y-3">
              {allCharacters.map(h => {
                const isInActiveParty = party.some(p => p.id === h.id);
                return (
                  <div key={h.id} className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{h.name} · {h.race} {h.class} (Niv.{h.charLevel})</div>
                      <div className="text-slate-400">Alignement : {h.align} · PV: {h.hpLeft}/{h.hpMax} · {h.gold} PO</div>
                    </div>
                    {isInActiveParty ? (
                      <button
                        onClick={() => {
                          setParty(party.filter(p => p.id !== h.id));
                          sounds.playTurn();
                        }}
                        className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700/50 rounded text-xs transition"
                      >
                        Retirer du groupe
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (party.length >= 6) {
                            setMessage('Le groupe est déjà au maximum de 6 aventuriers.');
                            return;
                          }
                          setParty([...party, h]);
                          sounds.playTurn();
                        }}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs transition"
                      >
                        Ajouter au groupe
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
