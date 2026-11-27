import { useEffect, useMemo, useRef, useState } from 'react';
import { FastForward, Pause, Play, RotateCcw, Zap } from 'lucide-react';
import {
  CDL_2027_TEAMS,
  STAKE_TIERS,
  TACTICAL_STANCES,
  formatCurrency,
  generateMw4RoundCommentary,
} from '../data/mw4CdlData';
import { MW4_SND_MAPS } from '../data/sndMaps';
import { CdlTeam, MatchEvent, Mw4MapId, TacticalStance } from '../types';

interface MatchDeskViewProps {
  treasury: number;
  totalEdgeBonus: number;
  selectedTeamId: string;
  selectedMapId: Mw4MapId;
  onSelectTeamId: (teamId: string) => void;
  onSelectMapId: (mapId: Mw4MapId) => void;
  onSettleMatch: (payload: {
    team: CdlTeam;
    mapName: string;
    stake: number;
    won: boolean;
    netDelta: number;
    scoreline: string;
  }) => void;
}

type MatchPhase = 'setup' | 'live' | 'finished';

export function MatchDeskView({
  treasury,
  totalEdgeBonus,
  selectedTeamId,
  selectedMapId,
  onSelectTeamId,
  onSelectMapId,
  onSettleMatch,
}: MatchDeskViewProps) {
  const team = useMemo(
    () => CDL_2027_TEAMS.find((t) => t.id === selectedTeamId) || CDL_2027_TEAMS[0],
    [selectedTeamId]
  );

  const mapConfig = useMemo(
    () => MW4_SND_MAPS.find((m) => m.id === selectedMapId) || MW4_SND_MAPS[0],
    [selectedMapId]
  );

  const [stake, setStake] = useState<number>(Math.max(team.minStake, 100000));
  const [stance, setStance] = useState<TacticalStance>('default_split');
  const [phase, setPhase] = useState<MatchPhase>('setup');

  // First-to-6 S&D round state
  const [playerRounds, setPlayerRounds] = useState(0);
  const [oppRounds, setOppRounds] = useState(0);
  const [momentum, setMomentum] = useState(50);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [timeoutUsed, setTimeoutUsed] = useState(false);
  const [timeoutRoundsLeft, setTimeoutRoundsLeft] = useState(0);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [settledOutcome, setSettledOutcome] = useState<{
    won: boolean;
    netDelta: number;
    scoreline: string;
  } | null>(null);

  useEffect(() => {
    if (phase === 'setup' && stake < team.minStake) {
      setStake(team.minStake);
    }
  }, [team.minStake, phase, stake]);

  const stanceRef = useRef(stance);
  stanceRef.current = stance;
  const timeoutRef = useRef(timeoutRoundsLeft);
  timeoutRef.current = timeoutRoundsLeft;

  const winProbability = useMemo(() => {
    const mapPenalty = team.signatureMap === selectedMapId ? -3 : 0;
    const base = 47 + (95 - team.rating) * 1.8 + totalEdgeBonus + mapPenalty;
    return Math.max(30, Math.min(79, Math.round(base)));
  }, [team.rating, team.signatureMap, selectedMapId, totalEdgeBonus]);

  const projectedNetProfit = Math.round(stake * (team.payoutMultiplier - 1));
  const canAffordStake = treasury >= stake && stake >= team.minStake;

  const startMatch = () => {
    if (!canAffordStake) return;
    setPhase('live');
    setPlayerRounds(0);
    setOppRounds(0);
    setMomentum(52);
    setPaused(false);
    setTimeoutUsed(false);
    setTimeoutRoundsLeft(0);
    setSettledOutcome(null);
    setEvents([
      {
        id: `ev-init-${Date.now()}`,
        roundLabel: 'R1',
        text: `MW4 CDL v1.0 Search & Destroy live on ${mapConfig.name} vs. ${team.name} (${team.roster.join(', ')}) for ${formatCurrency(stake)}.`,
        highlight: 'neutral',
      },
    ]);
  };

  const resetToSetup = () => {
    setPhase('setup');
    setPaused(false);
    setSettledOutcome(null);
    setEvents([]);
  };

  const callTacticalTimeout = () => {
    if (timeoutUsed || phase !== 'live') return;
    setTimeoutUsed(true);
    setTimeoutRoundsLeft(3);
    const roundNum = playerRounds + oppRounds + 1;
    setEvents((prev) => [
      {
        id: `ev-to-${Date.now()}`,
        roundLabel: `R${roundNum}`,
        text: `IGL Tactical Timeout called — switching ${mapConfig.name} opening smoke & Dead Silence route (+14% round win odds for 3 rounds).`,
        highlight: 'player',
      },
      ...prev,
    ]);
  };

  useEffect(() => {
    if (phase !== 'live' || paused) return;

    const tickMs = speed === 2 ? 600 : 1150;
    const timer = window.setInterval(() => {
      const activeStance =
        TACTICAL_STANCES.find((s) => s.id === stanceRef.current) || TACTICAL_STANCES[0];
      const hasTimeout = timeoutRef.current > 0;
      if (hasTimeout) {
        setTimeoutRoundsLeft((c) => Math.max(0, c - 1));
      }

      const playerAdvantage =
        (winProbability - 50) / 100 +
        (activeStance.attackMod - 1) * 0.14 +
        (activeStance.defenseMod - 1) * 0.08 +
        (hasTimeout ? 0.14 : 0);

      const roundChance = Math.max(0.22, Math.min(0.84, 0.5 + playerAdvantage));
      const wonRound = Math.random() < roundChance;

      setMomentum((m) =>
        Math.max(18, Math.min(86, Math.round(m + (wonRound ? 7 : -7) * activeStance.variance)))
      );

      setPlayerRounds((prevP) => {
        setOppRounds((prevO) => {
          if (prevP >= 6 || prevO >= 6) return prevO;
          const nextP = wonRound ? prevP + 1 : prevP;
          const nextO = wonRound ? prevO : prevO + 1;
          const roundNum = prevP + prevO + 1;

          setEvents((ev) => [
            {
              id: `ev-r-${roundNum}-${Date.now()}`,
              roundLabel: `R${roundNum}`,
              text: generateMw4RoundCommentary(selectedMapId, wonRound, team.name),
              highlight: wonRound ? 'player' : 'opponent',
            },
            ...ev,
          ]);

          if (nextP >= 6 || nextO >= 6) {
            const won = nextP > nextO;
            const netDelta = won ? projectedNetProfit : -stake;
            const scoreline = `${nextP} – ${nextO}`;
            setPhase('finished');
            setSettledOutcome({ won, netDelta, scoreline });
            onSettleMatch({
              team,
              mapName: mapConfig.name,
              stake,
              won,
              netDelta,
              scoreline,
            });
          }

          return nextO;
        });
        return prevP >= 6 ? prevP : wonRound ? prevP + 1 : prevP;
      });
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [
    phase,
    paused,
    speed,
    winProbability,
    selectedMapId,
    team,
    mapConfig.name,
    stake,
    projectedNetProfit,
    onSettleMatch,
  ]);

  const currentRoundNum = Math.min(11, playerRounds + oppRounds + 1);
  const sideLabel =
    phase === 'finished'
      ? 'Final Map Score'
      : currentRoundNum === 11
        ? 'Round 11 · Sudden Death'
        : currentRoundNum % 2 === 1
          ? `Round ${currentRoundNum} · Offense (Plant)`
          : `Round ${currentRoundNum} · Defense (Hold)`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#22252E]">
        <div>
          <p className="text-xs font-medium text-[#C9A86A]">
            Modern Warfare 4 · CDL Competitive Settings v1.0 · First to 6 S&amp;D
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#F3F1EC] mt-1">
            CDL 2027 Private S&amp;D Match Desk
          </h1>
          <p className="text-sm text-[#A8A59E] mt-2 max-w-2xl">
            Run private high-stakes Search &amp; Destroy maps against all 12 official 2027 CDL
            franchises across the 6-map MW4 rotation. Switch calls round-by-round and settle
            straight to your gaming treasury.
          </p>
        </div>
        <div className="text-left md:text-right shrink-0">
          <p className="text-xs text-[#8C8982]">Available Treasury</p>
          <p className="font-mono text-xl font-semibold text-[#F3F1EC] tabular-nums">
            {formatCurrency(treasury)}
          </p>
        </div>
      </div>

      {phase === 'setup' ? (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Setup Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 01. Map Selection */}
            <div className="bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
                  01. Official MW4 CDL S&amp;D Map
                </h2>
                <span className="text-xs text-[#8C8982]">CDL v1.0 Pool (6 Maps)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {MW4_SND_MAPS.map((m) => {
                  const active = m.id === selectedMapId;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onSelectMapId(m.id)}
                      className={`p-3 rounded-md border text-left transition-colors ${
                        active
                          ? 'border-[#C9A86A] bg-[#181B23]'
                          : 'border-[#232732] bg-[#14171F] hover:border-[#343A4A]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#F3F1EC]">{m.name}</p>
                      <p className="text-[11px] text-[#8C8982] mt-0.5 truncate">{m.poolNote}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 02. Franchise Selection */}
            <div className="bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
                  02. Select CDL 2027 Franchise
                </h2>
                <span className="text-xs text-[#8C8982]">12 Official Rosters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {CDL_2027_TEAMS.map((candidate) => {
                  const active = candidate.id === team.id;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => onSelectTeamId(candidate.id)}
                      className={`p-3.5 rounded-md border text-left transition-colors ${
                        active
                          ? 'border-[#C9A86A] bg-[#181B23]'
                          : 'border-[#232732] bg-[#14171F] hover:border-[#343A4A]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#F3F1EC] truncate">
                          {candidate.name}
                        </p>
                        <span className="font-mono text-xs text-[#C9A86A] tabular-nums shrink-0">
                          {candidate.payoutMultiplier.toFixed(2)}x
                        </span>
                      </div>
                      <p className="text-xs text-[#9C9A94] truncate mt-0.5">
                        {candidate.roster.join(' · ')}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 03. Stake & Opening Call */}
            <div className="bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
                    03. Private Lobby Stake &amp; Opening Call
                  </h2>
                  <span className="text-xs font-mono text-[#8C8982] tabular-nums">
                    Floor {formatCurrency(team.minStake)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STAKE_TIERS.map((tier) => {
                    const disabled = tier < team.minStake || tier > treasury;
                    const active = stake === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        disabled={disabled}
                        onClick={() => setStake(tier)}
                        className={`px-3.5 py-2 text-xs font-mono font-medium rounded-md border transition-colors tabular-nums whitespace-nowrap shrink-0 ${
                          active
                            ? 'border-[#C9A86A] bg-[#C9A86A] text-[#090A0D]'
                            : 'border-[#272B36] bg-[#161922] text-[#F3F1EC] hover:border-[#C9A86A]/60 disabled:opacity-35 disabled:cursor-not-allowed'
                        }`}
                      >
                        {formatCurrency(tier)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#22252E]">
                {TACTICAL_STANCES.map((s) => {
                  const active = stance === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStance(s.id)}
                      className={`p-3 rounded-md border text-left transition-colors ${
                        active
                          ? 'border-[#C9A86A] bg-[#181B23]'
                          : 'border-[#232732] bg-[#14171F] hover:border-[#343A4A]'
                      }`}
                    >
                      <p className="text-xs font-semibold text-[#F3F1EC]">{s.label}</p>
                      <p className="text-[11px] text-[#9C9A94] mt-0.5 leading-relaxed">
                        {s.shortNote}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Pre-Match Brief (5 cols) */}
          <div className="lg:col-span-5 bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-6">
            <div className="pb-5 border-b border-[#22252E] space-y-1.5">
              <p className="text-xs text-[#C9A86A]">
                MW4 CDL v1.0 · {mapConfig.name} · Search &amp; Destroy (FT6)
              </p>
              <h2 className="font-display text-2xl font-semibold text-[#F3F1EC]">
                Rule One vs. {team.name}
              </h2>
              <p className="text-xs text-[#9C9A94]">
                Opposing Lineup: {team.roster.join(' · ')}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9C9A94]">Lobby Wager</span>
                <span className="font-mono font-semibold text-[#F3F1EC] tabular-nums">
                  {formatCurrency(stake)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9C9A94]">Franchise Payout</span>
                <span className="font-mono font-semibold text-[#C9A86A] tabular-nums">
                  {team.payoutMultiplier.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9C9A94]">Projected Net Profit</span>
                <span className="font-mono font-semibold text-[#4ADE80] tabular-nums">
                  +{formatCurrency(projectedNetProfit)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#22252E]">
                <span className="text-[#9C9A94]">MW4 Loadout + Rig Edge</span>
                <span className="font-mono font-semibold text-[#C9A86A] tabular-nums">
                  +{totalEdgeBonus.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9C9A94]">Estimated Map Win Odds</span>
                <span className="font-mono font-semibold text-[#F3F1EC] tabular-nums">
                  {winProbability}%
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!canAffordStake}
              onClick={startMatch}
              className="w-full py-3 px-5 text-sm font-semibold text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {canAffordStake
                ? `Launch ${mapConfig.name} S&D · Stake ${formatCurrency(stake)}`
                : 'Insufficient Treasury for Stake'}
            </button>

            <p className="text-xs text-[#8C8982] leading-relaxed">
              Scouting report ({team.shortTag}): {team.playstyle}
              {team.signatureMap === selectedMapId
                ? ` Note: ${mapConfig.name} is ${team.name}'s signature S&D map (-3% map modifier).`
                : ''}
            </p>
          </div>
        </section>
      ) : (
        /* Live First-to-6 S&D Broadcast Desk */
        <section className="space-y-6">
          <div className="bg-[#111319] border border-[#22252E] rounded-lg p-6 lg:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#22252E]">
              <div>
                <p className="text-xs text-[#C9A86A]">
                  MW4 CDL v1.0 · {mapConfig.name} · Stake {formatCurrency(stake)}
                </p>
                <p className="text-xs text-[#8C8982] mt-0.5">{sideLabel}</p>
              </div>

              <div className="flex items-center gap-2">
                {phase === 'live' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPaused((p) => !p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F3F1EC] bg-[#181B23] hover:bg-[#222632] border border-[#2B2F3A] rounded-md transition-colors whitespace-nowrap"
                    >
                      {paused ? (
                        <>
                          <Play className="w-3.5 h-3.5" aria-hidden="true" /> Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-3.5 h-3.5" aria-hidden="true" /> Pause
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                        speed === 2
                          ? 'border-[#C9A86A] bg-[#C9A86A]/15 text-[#C9A86A]'
                          : 'border-[#2B2F3A] bg-[#181B23] text-[#F3F1EC]'
                      }`}
                    >
                      <FastForward className="w-3.5 h-3.5" aria-hidden="true" />
                      {speed}x Pace
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={resetToSetup}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#A8A59E] hover:text-[#F3F1EC] border border-[#2B2F3A] rounded-md transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Lobby Setup
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4 py-2">
              <div>
                <p className="text-xs text-[#8C8982]">Suite 74A · Veteran IGL</p>
                <p className="font-display text-xl sm:text-2xl font-semibold text-[#F3F1EC] mt-0.5">
                  Rule One Squad
                </p>
              </div>

              <div className="text-center">
                <p className="font-mono text-xs text-[#C9A86A] tabular-nums mb-1">
                  {mapConfig.name} · First to 6
                </p>
                <p className="font-mono text-4xl sm:text-5xl font-bold text-[#F3F1EC] tabular-nums">
                  {playerRounds} – {oppRounds}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-[#8C8982]">CDL 2027 · {team.shortTag}</p>
                <p className="font-display text-xl sm:text-2xl font-semibold text-[#F3F1EC] mt-0.5">
                  {team.name}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono tabular-nums text-[#9C9A94]">
                <span>Rule One Map Momentum · {momentum}%</span>
                <span>
                  {100 - momentum}% · {team.shortTag}
                </span>
              </div>
              <div className="h-2 bg-[#1B1F2A] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#C9A86A] transition-all duration-300"
                  style={{ width: `${momentum}%` }}
                />
              </div>
            </div>

            {phase === 'finished' && settledOutcome && (
              <div className="pt-5 border-t border-[#22252E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p
                    className={`text-xs font-medium ${
                      settledOutcome.won ? 'text-[#4ADE80]' : 'text-[#F87171]'
                    }`}
                  >
                    {settledOutcome.won ? 'Map Victory Settled' : 'Map Defeat Settled'} ·{' '}
                    {mapConfig.name} ({settledOutcome.scoreline})
                  </p>
                  <p className="font-mono text-2xl font-semibold text-[#F3F1EC] tabular-nums mt-0.5">
                    {formatCurrency(settledOutcome.netDelta, true)} to Treasury
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={resetToSetup}
                    className="px-4 py-2 text-xs font-medium text-[#F3F1EC] bg-[#181B23] hover:bg-[#222632] border border-[#2B2F3A] rounded-md transition-colors whitespace-nowrap"
                  >
                    Change Map / Team
                  </button>
                  <button
                    type="button"
                    disabled={!canAffordStake}
                    onClick={startMatch}
                    className="px-4 py-2 text-xs font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] disabled:opacity-40 rounded-md transition-colors whitespace-nowrap"
                  >
                    Run Map Back
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-[#F3F1EC]">
                  Mid-Match IGL Calls
                </h2>
                <button
                  type="button"
                  disabled={timeoutUsed || phase !== 'live'}
                  onClick={callTacticalTimeout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                  {timeoutUsed ? 'Timeout Used' : 'Call IGL Timeout'}
                </button>
              </div>

              <div className="space-y-2">
                {TACTICAL_STANCES.map((s) => {
                  const active = stance === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={phase !== 'live'}
                      onClick={() => setStance(s.id)}
                      className={`w-full p-3 rounded-md border text-left transition-colors ${
                        active
                          ? 'border-[#C9A86A] bg-[#181B23]'
                          : 'border-[#232732] bg-[#14171F] hover:border-[#343A4A]'
                      }`}
                    >
                      <p className="text-xs font-semibold text-[#F3F1EC]">{s.label}</p>
                      <p className="text-xs text-[#8C8982] mt-0.5">{s.shortNote}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#111319] border border-[#22252E] rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-[#22252E] flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-[#F3F1EC]">
                  Round-by-Round S&amp;D Feed ({mapConfig.name})
                </h2>
                <span className="text-xs font-mono text-[#8C8982] tabular-nums">
                  {events.length} Logged
                </span>
              </div>

              <div className="divide-y divide-[#1D2028] max-h-[380px] overflow-y-auto">
                {events.map((ev) => (
                  <div key={ev.id} className="px-6 py-3.5 flex items-start gap-4">
                    <span className="font-mono text-xs text-[#C9A86A] tabular-nums w-10 shrink-0 pt-0.5">
                      {ev.roundLabel}
                    </span>
                    <p
                      className={`text-sm leading-relaxed ${
                        ev.highlight === 'player'
                          ? 'text-[#4ADE80]'
                          : ev.highlight === 'opponent'
                            ? 'text-[#FCA5A5]'
                            : 'text-[#B8B5AE]'
                      }`}
                    >
                      {ev.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
