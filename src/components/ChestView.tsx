import React, { useState } from 'react';
import { TCharacter } from '../types/wizardry';
import { 
  ChestReward, 
  inspectChest, 
  disarmChest, 
  applyTrapEffects, 
  TRAP_NAMES, 
  TTrapType 
} from '../engine/chestEngine';
import { sounds } from '../utils/soundEffects';
import { Package, Search, KeyRound, Unlock, ArrowRight } from 'lucide-react';

interface ChestViewProps {
  party: TCharacter[];
  setParty: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  chest: ChestReward;
  dungeonLevel: number;
  onFinishChest: (alarmTriggered: boolean) => void;
}

export const ChestView: React.FC<ChestViewProps> = ({
  party,
  setParty,
  chest,
  dungeonLevel,
  onFinishChest
}) => {
  const [log, setLog] = useState<string[]>([
    'Les monstres ont laissé un coffre au trésor bardé de ferrements !'
  ]);
  const [selectedHeroIdx, setSelectedHeroIdx] = useState<number>(0);
  const [selectedDisarmTrap, setSelectedDisarmTrap] = useState<TTrapType>('POISON_NEEDLE');
  const [opened, setOpened] = useState<boolean>(false);

  const hero = party[selectedHeroIdx] || party[0];

  const handleInspect = () => {
    sounds.playTurn();
    const result = inspectChest(chest, hero);
    if (result.sprung) {
      sounds.playBump();
      const trapLogs = applyTrapEffects(chest.trapType, party, selectedHeroIdx, dungeonLevel);
      setLog(prev => [...prev, `💥 Catastrophe ! ${hero.name} a déclenché le piège en inspectant la serrure !`, ...trapLogs]);
      setParty([...party]);
    } else {
      setLog(prev => [
        ...prev,
        `${hero.name} examine minutieusement la serrure et soupçonne : ${TRAP_NAMES[result.guess]}`
      ]);
    }
  };

  const handleCalfo = () => {
    // Find priest who knows Calfo (spell 28)
    const priest = party.find(p => p.status === 'OK' && p.spellsKnown[28] && p.priestSpells[2] > 0);
    if (!priest) {
      setLog(prev => [...prev, 'Aucun prêtre en état ne dispose du sort CALFO (Tier 2).']);
      return;
    }
    sounds.playSpellCast();
    priest.priestSpells[2]--;
    chest.calfoRevealed = true;
    setLog(prev => [
      ...prev,
      `✨ ${priest.name} incante CALFO. La vérité mystique se révèle : ce coffre est piégé par "${TRAP_NAMES[chest.trapType]}" !`
    ]);
    setSelectedDisarmTrap(chest.trapType);
    setParty([...party]);
  };

  const handleDisarm = () => {
    sounds.playTurn();
    const result = disarmChest(chest, hero, selectedDisarmTrap);
    if (result.success) {
      sounds.playGold();
      setLog(prev => [
        ...prev,
        `🛠️ ${hero.name} désamorce adroitement le mécanisme de piège (${TRAP_NAMES[selectedDisarmTrap]}) ! Le coffre est sécurisé.`
      ]);
    } else if (result.exploded) {
      sounds.playBump();
      const trapLogs = applyTrapEffects(chest.trapType, party, selectedHeroIdx, dungeonLevel);
      setLog(prev => [
        ...prev,
        `💥 ÉCHEC CRITIQUE ! Le mécanisme de désamorçage se coince et le piège se déclenche !`,
        ...trapLogs
      ]);
      setParty([...party]);
    } else {
      setLog(prev => [
        ...prev,
        `${hero.name} n'arrive pas à crocheter le verrou, mais ne déclenche pas le piège.`
      ]);
    }
  };

  const handleOpen = () => {
    // If not disarmed and not trapless, trigger trap on opener
    if (!chest.disarmed && chest.trapType !== 'TRAPLESS') {
      sounds.playBump();
      const trapLogs = applyTrapEffects(chest.trapType, party, selectedHeroIdx, dungeonLevel);
      setLog(prev => [
        ...prev,
        `💥 Vous forcez le couvercle sans désarmer... Le piège explose !`,
        ...trapLogs
      ]);
    }

    // Distribute gold equally
    const livingHeroes = party.filter(h => h.status === 'OK');
    if (livingHeroes.length > 0) {
      sounds.playGold();
      const share = Math.floor(chest.goldFound / livingHeroes.length);
      livingHeroes.forEach(h => { h.gold += share; });
      setLog(prev => [
        ...prev,
        `💰 Butin : ${chest.goldFound} Pièces d'Or partagées (${share} PO par héros vivant).`
      ]);
    }

    // Distribute Item
    if (chest.itemFound) {
      const recipient = party.find(h => h.status === 'OK' && h.possessions.length < 8);
      if (recipient) {
        recipient.possessions.push({
          equipped: false,
          cursed: chest.itemFound.cursed,
          identified: false,
          itemIndex: chest.itemFound.id
        });
        setLog(prev => [
          ...prev,
          `🎁 Objet trouvé : ${chest.itemFound?.nameUnknown} récupéré dans le sac de ${recipient.name} !`
        ]);
      } else {
        setLog(prev => [...prev, `Les sacs sont pleins, l'objet trouvé est abandonné.`]);
      }
    }

    setOpened(true);
    setParty([...party]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 select-none overflow-y-auto max-w-3xl mx-auto">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-2.5 bg-amber-950/80 border border-amber-600/40 rounded-xl text-amber-400">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white font-serif">Coffre aux Trésors Découvert</h2>
          <p className="text-xs text-slate-400">Inspectez, désamorcez ou forcez le coffre avec précaution.</p>
        </div>
      </div>

      <div className="py-6 space-y-4">
        {/* Active operator selector */}
        {!opened && (
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Aventurier à l'action :</span>
              <span className="text-amber-400 font-bold">{hero.name} ({hero.class} · Agilité {hero.attrib.AGILITY})</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {party.map((h, idx) => (
                <button
                  key={h.id}
                  onClick={() => { setSelectedHeroIdx(idx); sounds.playTurn(); }}
                  disabled={h.status !== 'OK'}
                  className={`p-2 rounded-lg text-xs font-semibold border transition ${selectedHeroIdx === idx ? 'bg-amber-600/20 border-amber-500 text-amber-300' : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white'} disabled:opacity-30`}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions panel */}
        {!opened ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              onClick={handleInspect}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition"
            >
              <Search className="w-4 h-4 text-amber-400" />
              Inspecter le piège
            </button>

            <button
              onClick={handleCalfo}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition"
            >
              <KeyRound className="w-4 h-4 text-purple-400" />
              Sort CALFO (Prêtre)
            </button>

            <div className="col-span-1 md:col-span-2 flex items-center gap-2">
              <select
                value={selectedDisarmTrap}
                onChange={e => setSelectedDisarmTrap(e.target.value as TTrapType)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white flex-1 focus:outline-none"
              >
                {Object.entries(TRAP_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
              <button
                onClick={handleDisarm}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-amber-400 transition shrink-0"
              >
                Désarmer
              </button>
            </div>

            <button
              onClick={handleOpen}
              className="col-span-1 md:col-span-4 p-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30"
            >
              <Unlock className="w-4 h-4" />
              Ouvrir le coffre et piller le trésor
            </button>
          </div>
        ) : (
          <button
            onClick={() => onFinishChest(chest.trapType === 'ALARM')}
            className="w-full p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Reprendre l'exploration du Labyrinthe</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Chest resolution logs */}
        <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-1.5 font-mono text-xs text-slate-300">
          {log.map((line, idx) => (
            <div key={idx} className="leading-relaxed">{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
