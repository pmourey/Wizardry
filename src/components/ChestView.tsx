import React, { useState, useEffect } from 'react';
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
import { Package, Search, KeyRound, Unlock, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2, ShieldAlert, Footprints } from 'lucide-react';

interface ChestViewProps {
  party: TCharacter[];
  setParty: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  chest: ChestReward;
  dungeonLevel: number;
  onFinishChest: (alarmTriggered: boolean, wasOpened?: boolean) => void;
  onPartyWipedOut?: () => void;
}

export const ChestView: React.FC<ChestViewProps> = ({
  party,
  setParty,
  chest,
  dungeonLevel,
  onFinishChest,
  onPartyWipedOut
}) => {
  const [log, setLog] = useState<string[]>([
    'Les monstres ont laissé un coffre au trésor bardé de ferrements !'
  ]);
  const [selectedHeroIdx, setSelectedHeroIdx] = useState<number>(0);
  const [selectedDisarmTrap, setSelectedDisarmTrap] = useState<TTrapType>('POISON_NEEDLE');
  const [opened, setOpened] = useState<boolean>(false);

  // Living heroes filter
  const livingHeroes = party.filter(h => h.status === 'OK' && h.hpLeft > 0);
  const hero = party[selectedHeroIdx] && party[selectedHeroIdx].status === 'OK' && party[selectedHeroIdx].hpLeft > 0
    ? party[selectedHeroIdx]
    : livingHeroes[0] || party[0];

  const checkPartyWipeout = (): boolean => {
    const anyAlive = party.some(h => h.status === 'OK' && h.hpLeft > 0);
    if (!anyAlive) {
      sounds.playBell();
      setLog(prev => [
        ...prev,
        `💀 L'escouade entière a été décimée par les ravages du coffre !`
      ]);
      if (onPartyWipedOut) {
        setTimeout(() => onPartyWipedOut(), 1800);
      }
      return true;
    }
    return false;
  };

  const handleInspect = () => {
    if (chest.exploded || chest.disarmed) {
      setLog(prev => [
        ...prev,
        chest.exploded 
          ? `Le mécanisme du piège a déjà explosé et gît en miettes. Le coffre est inoffensif.`
          : `Le piège a déjà été désamorcé avec succès.`
      ]);
      return;
    }

    sounds.playTurn();
    const result = inspectChest(chest, hero);
    if (result.sprung) {
      sounds.playBump();
      const trapLogs = applyTrapEffects(chest.trapType, party, selectedHeroIdx, dungeonLevel);
      setLog(prev => [
        ...prev,
        `💥 Catastrophe ! ${hero.name} a déclenché le piège (${TRAP_NAMES[chest.trapType]}) en inspectant la serrure !`,
        ...trapLogs,
        `⚠️ Le piège s'est déchargé et est désormais inactif. Vous pouvez ouvrir le coffre sans risque supplémentaire.`
      ]);
      setParty([...party]);
      checkPartyWipeout();
    } else {
      setLog(prev => [
        ...prev,
        `${hero.name} examine minutieusement la serrure et soupçonne : ${TRAP_NAMES[result.guess]}`
      ]);
    }
  };

  const handleCalfo = () => {
    if (chest.exploded || chest.disarmed) {
      setLog(prev => [
        ...prev,
        chest.exploded
          ? `Inutile d'incanter CALFO : le piège a déjà sauté et le coffre est neutralisé.`
          : `Inutile d'incanter CALFO : le coffre a déjà été désamorcé.`
      ]);
      return;
    }

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
    if (chest.exploded || chest.disarmed) {
      setLog(prev => [
        ...prev,
        chest.exploded 
          ? `Le mécanisme s'est déjà déclenché et déchargé. Il ne présente plus aucun danger !`
          : `Le coffre a déjà été désamorcé.`
      ]);
      return;
    }

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
        `💥 ÉCHEC CRITIQUE ! Le mécanisme de désamorçage se coince et le piège (${TRAP_NAMES[chest.trapType]}) se déclenche !`,
        ...trapLogs,
        `⚠️ Le piège a explosé et s'est totalement déchargé. Le coffre est désormais inoffensif et NE SE DÉCLENCHERA PLUS à l'ouverture.`
      ]);
      setParty([...party]);
      checkPartyWipeout();
    } else {
      setLog(prev => [
        ...prev,
        `${hero.name} n'arrive pas à crocheter le verrou, mais ne déclenche pas le piège.`
      ]);
    }
  };

  const handleOpen = () => {
    // Per rules: Trap ONLY triggers on opening if it has NOT been disarmed AND has NOT already exploded!
    if (!chest.disarmed && !chest.exploded && chest.trapType !== 'TRAPLESS') {
      chest.exploded = true;
      sounds.playBump();
      const trapLogs = applyTrapEffects(chest.trapType, party, selectedHeroIdx, dungeonLevel);
      setLog(prev => [
        ...prev,
        `💥 Vous forcez le couvercle sans désarmer... Le piège (${TRAP_NAMES[chest.trapType]}) explose !`,
        ...trapLogs
      ]);
      setParty([...party]);
      if (checkPartyWipeout()) return;
    } else if (chest.exploded) {
      setLog(prev => [
        ...prev,
        `🔓 Le piège ayant déjà sauté lors de la tentative précédente, vous ouvrez les ferrures du coffre neutralisé en toute sécurité.`
      ]);
    } else if (chest.disarmed) {
      setLog(prev => [
        ...prev,
        `🔓 Le piège ayant été désamorcé, le coffre s'ouvre sans encombre.`
      ]);
    } else {
      setLog(prev => [
        ...prev,
        `🔓 Le coffre ne comportait aucun piège et s'ouvre facilement.`
      ]);
    }

    // Distribute gold equally
    const survivors = party.filter(h => h.status === 'OK' && h.hpLeft > 0);
    if (survivors.length > 0) {
      sounds.playGold();
      const share = Math.floor(chest.goldFound / survivors.length);
      survivors.forEach(h => { h.gold += share; });
      setLog(prev => [
        ...prev,
        `💰 Butin : ${chest.goldFound} Pièces d'Or partagées (${share} PO par survivant).`
      ]);
    }

    // Distribute Item
    if (chest.itemFound) {
      const recipient = party.find(h => h.status === 'OK' && h.hpLeft > 0 && h.possessions.length < 8);
      if (recipient) {
        recipient.possessions.push({
          equipped: false,
          cursed: chest.itemFound.cursed,
          identified: false,
          itemIndex: chest.itemFound.id
        });
        setLog(prev => [
          ...prev,
          `🎁 Objet trouvé : ${chest.itemFound?.nameUnknown || chest.itemFound?.name} placé dans le sac de ${recipient.name} !`
        ]);
      } else {
        setLog(prev => [...prev, `Les sacs des survivants sont pleins, l'objet trouvé est abandonné.`]);
      }
    }

    setOpened(true);
    setParty([...party]);
  };

  const handleLeave = () => {
    sounds.playFootstep();
    setLog(prev => [
      ...prev,
      `🚪 Vous choisissez de laisser le coffre sur place sans l'ouvrir (Option Pascal L)EAVE). L'escouade s'éloigne prudemment.`
    ]);
    setTimeout(() => {
      onFinishChest(false, false);
    }, 650);
  };

  // Authentic Wizardry 1 keyboard shortcuts: O)pen, C)alfo, L)eave, I)nspect, D)isarm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (opened) {
        if (e.key === 'Enter' || e.key === ' ' || e.key.toUpperCase() === 'C') {
          e.preventDefault();
          onFinishChest(chest.trapType === 'ALARM', true);
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'L') {
        e.preventDefault();
        handleLeave();
      } else if (key === 'O') {
        e.preventDefault();
        handleOpen();
      } else if (key === 'I') {
        if (!chest.exploded && !chest.disarmed) {
          e.preventDefault();
          handleInspect();
        }
      } else if (key === 'C') {
        if (!chest.exploded && !chest.disarmed) {
          e.preventDefault();
          handleCalfo();
        }
      } else if (key === 'D') {
        if (!chest.exploded && !chest.disarmed) {
          e.preventDefault();
          handleDisarm();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opened, hero, selectedDisarmTrap, chest, party, dungeonLevel, selectedHeroIdx]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 select-none overflow-y-auto max-w-3xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/80 border border-amber-600/40 rounded-xl text-amber-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-serif">Coffre aux Trésors Découvert</h2>
            <p className="text-xs text-slate-400">Inspectez, désamorcez ou forcez le coffre avec précaution.</p>
          </div>
        </div>

        {/* Dynamic trap status badge */}
        <div className="text-right">
          {chest.disarmed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-600/50 rounded-full text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Désamorcé (Inoffensif)
            </span>
          ) : chest.exploded ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 border border-amber-600/50 rounded-full text-amber-400 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Piège Déclenché (Neutralisé)
            </span>
          ) : chest.calfoRevealed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950/80 border border-purple-600/50 rounded-full text-purple-300 text-xs font-bold">
              <KeyRound className="w-3.5 h-3.5" />
              Calfo : {TRAP_NAMES[chest.trapType]}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-400 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Piège Armé (Non désamorcé)
            </span>
          )}
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
              {party.map((h, idx) => {
                const isAlive = h.status === 'OK' && h.hpLeft > 0;
                return (
                  <button
                    key={h.id}
                    onClick={() => { setSelectedHeroIdx(idx); sounds.playTurn(); }}
                    disabled={!isAlive}
                    className={`p-2 rounded-lg text-xs font-semibold border transition ${
                      selectedHeroIdx === idx 
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300' 
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white'
                    } disabled:opacity-30 disabled:border-slate-800`}
                  >
                    <div>{h.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {isAlive ? `${h.hpLeft} PV` : h.status}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions panel */}
        {!opened ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={handleInspect}
                disabled={chest.exploded || chest.disarmed}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition disabled:opacity-40 disabled:hover:bg-slate-800"
                title={chest.exploded ? "Le piège a déjà explosé" : "Examiner la serrure pour identifier le piège (Touche I)"}
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span>(I) Inspecter</span>
              </button>

              <button
                onClick={handleCalfo}
                disabled={chest.exploded || chest.disarmed}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition disabled:opacity-40 disabled:hover:bg-slate-800"
                title={chest.exploded ? "Le piège a déjà explosé" : "Incanter CALFO pour révéler le piège à 100% (Touche C)"}
              >
                <KeyRound className="w-4 h-4 text-purple-400" />
                <span>(C) Sort CALFO</span>
              </button>

              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-xl px-2 py-1">
                <select
                  value={selectedDisarmTrap}
                  onChange={e => setSelectedDisarmTrap(e.target.value as TTrapType)}
                  disabled={chest.exploded || chest.disarmed}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white flex-1 focus:outline-none disabled:opacity-40"
                >
                  {Object.entries(TRAP_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
                <button
                  onClick={handleDisarm}
                  disabled={chest.exploded || chest.disarmed}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white rounded-lg text-xs font-bold transition shrink-0 disabled:opacity-40"
                  title="Tenter de désamorcer le piège (Touche D)"
                >
                  (D) Désarmer
                </button>
              </div>

              {/* Pascal L)EAVE Option: Leave chest undisturbed */}
              <button
                onClick={handleLeave}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition shadow-sm"
                title="Ne pas ouvrir le coffre et reprendre la route sans déclencher de piège (Option L originelle de Wizardry)"
              >
                <Footprints className="w-4 h-4 text-slate-400" />
                <span>(L) Laisser le coffre</span>
              </button>
            </div>

            {/* Open chest button - prominently styled and shows safe state when exploded/disarmed */}
            <button
              onClick={handleOpen}
              className={`w-full p-4 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg ${
                chest.disarmed
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 ring-1 ring-emerald-400/50'
                  : chest.exploded
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40 ring-1 ring-amber-400/50 animate-pulse'
                  : 'bg-amber-700 hover:bg-amber-600 text-amber-100 shadow-amber-950/30'
              }`}
              title="Ouvrir le coffre et piller le trésor (Touche O)"
            >
              <Unlock className="w-4 h-4" />
              <span>
                {chest.disarmed
                  ? '(O) Ouvrir le coffre sécurisé et collecter le butin'
                  : chest.exploded
                  ? '(O) Ouvrir le coffre neutralisé (aucun danger restant)'
                  : '(O) Ouvrir le coffre et piller le trésor'}
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onFinishChest(chest.trapType === 'ALARM', true)}
            className="w-full p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Reprendre l'exploration du Labyrinthe (Entrée / Espace)</span>
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

