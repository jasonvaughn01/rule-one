import React, { useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Crosshair,
  Flame,
  Move,
  Play,
  RotateCcw,
  Shield,
  Trash2,
  TrendingUp,
  Wind,
} from 'lucide-react';
import {
  MW4_SND_MAPS,
  OperatorToken,
  ProPlaybook,
  RoundSide,
  RouteArrow,
  SavedPlaybook,
  UtilityMarker,
} from '../data/sndMaps';
import { CDL_2027_TEAMS, formatCurrency } from '../data/mw4CdlData';
import { AppTab, ClubState, Mw4MapId } from '../types';

type ToolMode = 'move' | 'smoke' | 'nade' | 'trophy' | 'route';

interface RoundSimOutcome {
  won: boolean;
  headline: string;
  details: string[];
  finalControlPct: number;
  bombStatus: string;
}

interface MapControlViewProps {
  clubState: ClubState;
  totalEdgeBonus: number;
  savedPlaybooks: SavedPlaybook[];
  onSavePlaybook: (play: SavedPlaybook) => void;
  onDeletePlaybook: (id: string) => void;
  onNavigate: (tab: AppTab) => void;
  onLaunchMapScrim: (mapId: Mw4MapId, teamId: string) => void;
}

const SVG_W = 1000;
const SVG_H = 620;

function computeConePath(x: number, y: number, deg: number, length = 130, spread = 24): string {
  const rad1 = ((deg - spread) * Math.PI) / 180;
  const rad2 = ((deg + spread) * Math.PI) / 180;
  const x1 = x + Math.cos(rad1) * length;
  const y1 = y + Math.sin(rad1) * length;
  const x2 = x + Math.cos(rad2) * length;
  const y2 = y + Math.sin(rad2) * length;
  return `M ${x} ${y} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

export function MapControlView({
  clubState,
  totalEdgeBonus,
  savedPlaybooks,
  onSavePlaybook,
  onDeletePlaybook,
  onNavigate,
  onLaunchMapScrim,
}: MapControlViewProps) {
  const [mapId, setMapId] = useState<Mw4MapId>('coal');
  const [side, setSide] = useState<RoundSide>('offense');
  const [tool, setTool] = useState<ToolMode>('move');

  const currentMap = useMemo(
    () => MW4_SND_MAPS.find((m) => m.id === mapId) || MW4_SND_MAPS[0],
    [mapId]
  );

  const availablePlaybooks = useMemo(
    () => currentMap.playbooks.filter((p) => p.side === side),
    [currentMap, side]
  );

  const initialPlaybook = availablePlaybooks[0] || currentMap.playbooks[0];

  const [activePlaybookId, setActivePlaybookId] = useState<string>(initialPlaybook.id);
  const [operators, setOperators] = useState<OperatorToken[]>(initialPlaybook.operators);
  const [utilities, setUtilities] = useState<UtilityMarker[]>(initialPlaybook.utilities);
  const [routes, setRoutes] = useState<RouteArrow[]>(initialPlaybook.routes);
  const [selectedOpId, setSelectedOpId] = useState<string>('op-1');
  const [routeDraftStart, setRouteDraftStart] = useState<{ x: number; y: number } | null>(null);
  const [saveName, setSaveName] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<RoundSimOutcome | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const loadPlaybook = (playbook: ProPlaybook) => {
    setActivePlaybookId(playbook.id);
    setOperators(playbook.operators.map((op) => ({ ...op })));
    setUtilities(playbook.utilities.map((u) => ({ ...u })));
    setRoutes(playbook.routes.map((r) => ({ ...r })));
    setRouteDraftStart(null);
    setSimResult(null);
  };

  const handleMapChange = (nextMapId: Mw4MapId) => {
    setMapId(nextMapId);
    const nextMap = MW4_SND_MAPS.find((m) => m.id === nextMapId) || MW4_SND_MAPS[0];
    const matching = nextMap.playbooks.find((p) => p.side === side) || nextMap.playbooks[0];
    setSide(matching.side);
    loadPlaybook(matching);
  };

  const handleSideChange = (nextSide: RoundSide) => {
    setSide(nextSide);
    const matching = currentMap.playbooks.find((p) => p.side === nextSide);
    if (matching) {
      loadPlaybook(matching);
    }
  };

  const tacticalAnalysis = useMemo(() => {
    const laneScores: Record<'A-Lane' | 'Mid' | 'B-Lane', number> = {
      'A-Lane': 0,
      Mid: 0,
      'B-Lane': 0,
    };

    currentMap.zones.forEach((zone) => {
      operators.forEach((op) => {
        const dist = Math.hypot(op.x - zone.x, op.y - zone.y);
        if (dist <= zone.radius * 1.45) {
          const weight = Math.max(0.25, 1 - dist / (zone.radius * 1.6));
          laneScores[zone.lane] += weight * 38;
        }
      });
      utilities.forEach((u) => {
        const dist = Math.hypot(u.x - zone.x, u.y - zone.y);
        if (dist <= zone.radius * 1.2) {
          laneScores[zone.lane] += u.kind === 'smoke' ? 14 : u.kind === 'trophy' ? 12 : 10;
        }
      });
    });

    const normalizeLane = (raw: number) => {
      const pct = Math.min(96, Math.round(raw));
      const status: 'Secured' | 'Contested' | 'Exposed' =
        pct >= 58 ? 'Secured' : pct >= 28 ? 'Contested' : 'Exposed';
      return { pct, status };
    };

    const aLane = normalizeLane(laneScores['A-Lane']);
    const midLane = normalizeLane(laneScores.Mid);
    const bLane = normalizeLane(laneScores['B-Lane']);

    let tradePairs = 0;
    for (let i = 0; i < operators.length; i++) {
      for (let j = i + 1; j < operators.length; j++) {
        const d = Math.hypot(operators[i].x - operators[j].x, operators[i].y - operators[j].y);
        if (d >= 55 && d <= 250) tradePairs += 1;
      }
    }
    const tradeDiscipline = Math.min(100, 42 + tradePairs * 14);

    const siteA = currentMap.sites[0];
    const siteB = currentMap.sites[1];
    const nearA = operators.filter((o) => Math.hypot(o.x - siteA.x, o.y - siteA.y) < 230).length;
    const nearB = operators.filter((o) => Math.hypot(o.x - siteB.x, o.y - siteB.y) < 230).length;

    const smokeCount = utilities.filter((u) => u.kind === 'smoke').length;
    const gaSmokeWarning = smokeCount > 1;

    const utilityBonus = Math.min(12, utilities.length * 3.5);
    const routeBonus = Math.min(8, routes.length * 3);
    const overallControl = Math.min(
      95,
      Math.max(
        22,
        Math.round(
          (aLane.pct * 0.3 + midLane.pct * 0.4 + bLane.pct * 0.3) * 0.72 +
            tradeDiscipline * 0.18 +
            utilityBonus +
            routeBonus +
            totalEdgeBonus * 0.6
        )
      )
    );

    const winOdds = Math.min(86, Math.max(24, Math.round(overallControl * 0.78 + 12)));

    return {
      aLane,
      midLane,
      bLane,
      tradeDiscipline,
      nearA,
      nearB,
      smokeCount,
      gaSmokeWarning,
      overallControl,
      winOdds,
    };
  }, [currentMap, operators, utilities, routes, totalEdgeBonus]);

  const activePlaybook = useMemo(
    () => currentMap.playbooks.find((p) => p.id === activePlaybookId) || initialPlaybook,
    [currentMap, activePlaybookId, initialPlaybook]
  );

  const selectedOp = operators.find((op) => op.id === selectedOpId) || operators[0];

  const getSvgCoords = (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * SVG_W);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * SVG_H);
    return {
      x: Math.max(30, Math.min(SVG_W - 30, x)),
      y: Math.max(30, Math.min(SVG_H - 30, y)),
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const pt = getSvgCoords(e);
    if (!pt) return;

    if (tool === 'move') {
      setOperators((prev) =>
        prev.map((op) => {
          if (op.id !== selectedOpId) return op;
          const dx = pt.x - op.x;
          const dy = pt.y - op.y;
          const nextDeg =
            Math.hypot(dx, dy) > 15 ? Math.round((Math.atan2(dy, dx) * 180) / Math.PI) : op.aimDeg;
          return { ...op, x: pt.x, y: pt.y, aimDeg: nextDeg };
        })
      );
      setSimResult(null);
      return;
    }

    if (tool === 'smoke' || tool === 'nade' || tool === 'trophy') {
      const marker: UtilityMarker = {
        id: `u-${Date.now()}`,
        kind: tool,
        x: pt.x,
        y: pt.y,
      };
      setUtilities((prev) => [...prev, marker]);
      setSimResult(null);
      return;
    }

    if (tool === 'route') {
      if (!routeDraftStart) {
        setRouteDraftStart(pt);
      } else {
        const nextRoute: RouteArrow = {
          id: `r-${Date.now()}`,
          fromX: routeDraftStart.x,
          fromY: routeDraftStart.y,
          toX: pt.x,
          toY: pt.y,
        };
        setRoutes((prev) => [...prev, nextRoute]);
        setRouteDraftStart(null);
        setSimResult(null);
      }
    }
  };

  const handleRotateSelected = (deltaDeg: number) => {
    setOperators((prev) =>
      prev.map((op) =>
        op.id === selectedOpId ? { ...op, aimDeg: (op.aimDeg + deltaDeg + 360) % 360 } : op
      )
    );
  };

  const handleSimulateRound = () => {
    setIsSimulating(true);
    setSimResult(null);

    window.setTimeout(() => {
      const roll = Math.random() * 100;
      const won = roll < tacticalAnalysis.winOdds;
      const siteFocus =
        tacticalAnalysis.nearA >= tacticalAnalysis.nearB
          ? currentMap.sites[0].name
          : currentMap.sites[1].name;

      const hasSmoke = utilities.some((u) => u.kind === 'smoke');
      const hasTrophy = utilities.some((u) => u.kind === 'trophy');

      const details: string[] = [];
      if (tacticalAnalysis.midLane.status === 'Secured') {
        details.push(
          `Mid control locked (${tacticalAnalysis.midLane.pct}%) — opponent rotations pinched before bomb tap.`
        );
      } else {
        details.push(
          `Mid remained ${tacticalAnalysis.midLane.status.toLowerCase()} (${tacticalAnalysis.midLane.pct}%) — opposing HAN 86 retained fast rotation lines.`
        );
      }

      if (hasSmoke) {
        details.push('CDL-legal smoke obscured the primary AR crossfire during the 1:25 timing window.');
      } else {
        details.push('No smoke placed — ISO Nightshade / VEL-46 entries forced into dry crossfire.');
      }

      if (tacticalAnalysis.tradeDiscipline >= 70) {
        details.push(
          `4v4 trade spacing rated ${tacticalAnalysis.tradeDiscipline}% — instant refrags secured man-advantage.`
        );
      } else {
        details.push(
          `Spread formation (${tacticalAnalysis.tradeDiscipline}% trade spacing) risked isolated 1v1 duels.`
        );
      }

      if (hasTrophy) {
        details.push('Trophy System neutralized opposing Frag/Semtex utility on bomb control.');
      }

      const bombStatus =
        side === 'offense'
          ? won
            ? `Bomb Planted & Detonated (${siteFocus})`
            : `Plant Denied / Defused (${siteFocus})`
          : won
            ? `Site Held · Bomb Defused (${siteFocus})`
            : `Site Breached · Post-Plant Lost (${siteFocus})`;

      setSimResult({
        won,
        headline: won
          ? `Round Won · ${currentMap.name} (${side === 'offense' ? 'Offense' : 'Defense'})`
          : `Round Lost · ${currentMap.name} (${side === 'offense' ? 'Offense' : 'Defense'})`,
        details,
        finalControlPct: tacticalAnalysis.overallControl,
        bombStatus,
      });
      setIsSimulating(false);
    }, 520);
  };

  const handleSaveCustomPlay = () => {
    const trimmed = saveName.trim();
    if (!trimmed) {
      setSaveMessage('Enter a playbook name first.');
      return;
    }
    const newPlay: SavedPlaybook = {
      id: `custom-${Date.now()}`,
      mapId,
      side,
      name: trimmed,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      operators: operators.map((o) => ({ ...o })),
      utilities: utilities.map((u) => ({ ...u })),
      routes: routes.map((r) => ({ ...r })),
    };
    onSavePlaybook(newPlay);
    setSaveName('');
    setSaveMessage(`Saved "${trimmed}" to your MW4 Playbook Vault.`);
  };

  const mapSavedPlays = savedPlaybooks.filter((p) => p.mapId === mapId && p.side === side);
  const featuredTeam =
    CDL_2027_TEAMS.find((t) => t.signatureMap === mapId) || CDL_2027_TEAMS[0];

  return (
    <div className="space-y-8">
      {/* Header Context Strip: Strictly MW4 2026 CDL v1.0 */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#22252E]">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#C9A86A]">
            Call of Duty: Modern Warfare 4 (2026) · CDL Competitive Settings v1.0 · 6-Map S&amp;D Pool
          </p>
          <h1 className="font-display text-3xl lg:text-4xl font-semibold text-[#F3F1EC] text-balance">
            MW4 Search &amp; Destroy Strategic Map Control
          </h1>
          <p className="text-sm text-[#A8A59E] max-w-2xl">
            Official 2026–2027 CDL S&amp;D rotation covering Coal, Lotus, Munition, Reactor U92,
            Rooftops, and Silkworm. Position your 4v4 HAN 86 / ISO Nightshade / VEL-46 roster and
            test CDL v1.0 utility executes before Kickoff Classic scrims.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 shrink-0">
          <div>
            <p className="text-xs text-[#8C8982]">Private Scrim Treasury</p>
            <p className="font-mono text-xl font-semibold text-[#F3F1EC] tabular-nums">
              {formatCurrency(clubState.treasury)}
            </p>
          </div>
          <div className="h-8 w-px bg-[#22252E] hidden sm:block" aria-hidden="true" />
          <div>
            <p className="text-xs text-[#8C8982]">MW4 S&amp;D Record</p>
            <p className="font-mono text-xl font-semibold text-[#C9A86A] tabular-nums">
              {clubState.wins}W – {clubState.losses}L
            </p>
          </div>
          <button
            type="button"
            onClick={() => onLaunchMapScrim(mapId, featuredTeam.id)}
            className="px-4 py-2.5 text-xs font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            Scrim {currentMap.name} vs. {featuredTeam.shortTag}
          </button>
        </div>
      </section>

      {/* Official 6-Map MW4 CDL Pool Selector + Side Toggle */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Select Modern Warfare 4 CDL S&D Map"
          className="flex flex-wrap items-center gap-1 p-1 bg-[#111319] border border-[#22252E] rounded-lg"
        >
          {MW4_SND_MAPS.map((m) => {
            const active = m.id === mapId;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleMapChange(m.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#222632] text-[#F3F1EC]'
                    : 'text-[#9C9A94] hover:text-[#F3F1EC]'
                }`}
              >
                {m.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#111319] border border-[#22252E] rounded-lg">
            <button
              type="button"
              onClick={() => handleSideChange('offense')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                side === 'offense'
                  ? 'bg-[#C9A86A] text-[#090A0D]'
                  : 'text-[#9C9A94] hover:text-[#F3F1EC]'
              }`}
            >
              Offense (Plant)
            </button>
            <button
              type="button"
              onClick={() => handleSideChange('defense')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                side === 'defense'
                  ? 'bg-[#C9A86A] text-[#090A0D]'
                  : 'text-[#9C9A94] hover:text-[#F3F1EC]'
              }`}
            >
              Defense (Hold)
            </button>
          </div>

          <button
            type="button"
            onClick={handleSimulateRound}
            disabled={isSimulating}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            {isSimulating ? 'Simulating Round...' : 'Simulate Round'}
          </button>
        </div>
      </section>

      {/* Main Tactical Workspace: Left Blueprint (8) + Right Command Panel (4) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {/* Map Tools Ribbon (CDL v1.0 Legal Utility Only) */}
          <div className="bg-[#111319] border border-[#22252E] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'move', label: 'Position Squad', icon: Move },
                  { id: 'smoke', label: 'Smoke (GA: 1)', icon: Wind },
                  { id: 'nade', label: 'Frag / Stun', icon: Flame },
                  { id: 'trophy', label: 'Trophy System', icon: Shield },
                  { id: 'route', label: 'Draw Route', icon: TrendingUp },
                ] as const
              ).map(({ id, label, icon: Icon }) => {
                const active = tool === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setTool(id);
                      setRouteDraftStart(null);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#C9A86A] text-[#090A0D]'
                        : 'bg-[#171A22] text-[#A8A59E] hover:text-[#F3F1EC] border border-[#252934]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setUtilities([]);
                  setRoutes([]);
                  setRouteDraftStart(null);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A8A59E] hover:text-[#F3F1EC] border border-[#252934] rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                Clear Utility
              </button>
              <button
                type="button"
                onClick={() => loadPlaybook(activePlaybook)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A8A59E] hover:text-[#F3F1EC] border border-[#252934] rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          {/* SVG Blueprint Canvas */}
          <div className="bg-[#0D0F14] border border-[#22252E] rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#22252E] flex flex-wrap items-center justify-between gap-2 text-xs text-[#9C9A94]">
              <span>
                <span className="text-[#F3F1EC] font-medium">{currentMap.name}</span> ·{' '}
                {currentMap.poolNote} · {currentMap.setting}
              </span>
              <span className="text-[#C9A86A]">
                {tool === 'move'
                  ? `Active: ${selectedOp.code} (${selectedOp.role}) — Click map to reposition`
                  : tool === 'route'
                    ? routeDraftStart
                      ? 'Click destination point to complete route arrow'
                      : 'Click start point on map for push/pinch arrow'
                    : `Click anywhere on map to deploy ${tool}`}
              </span>
            </div>

            <div className="relative w-full aspect-[1000/620] select-none">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                onClick={handleCanvasClick}
                className="w-full h-full block cursor-crosshair"
                role="application"
                aria-label={`${currentMap.name} Modern Warfare 4 CDL Search and Destroy tactical board`}
              >
                <defs>
                  <pattern id="mw4-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path
                      d="M 50 0 L 0 0 0 50"
                      fill="none"
                      stroke="#181C25"
                      strokeWidth="1"
                    />
                  </pattern>
                  <marker
                    id="mw4-arrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#C9A86A" />
                  </marker>
                </defs>

                <rect width={SVG_W} height={SVG_H} fill="#0B0D12" />
                <rect width={SVG_W} height={SVG_H} fill="url(#mw4-grid)" />
                <rect
                  x="24"
                  y="24"
                  width={SVG_W - 48}
                  height={SVG_H - 48}
                  fill="none"
                  stroke="#272B36"
                  strokeWidth="1.5"
                />

                {/* Lane Control Zones */}
                {currentMap.zones.map((z) => {
                  const laneData =
                    z.lane === 'A-Lane'
                      ? tacticalAnalysis.aLane
                      : z.lane === 'Mid'
                        ? tacticalAnalysis.midLane
                        : tacticalAnalysis.bLane;
                  const fill =
                    laneData.status === 'Secured'
                      ? 'rgba(74, 222, 128, 0.08)'
                      : laneData.status === 'Contested'
                        ? 'rgba(201, 168, 106, 0.08)'
                        : 'rgba(248, 113, 113, 0.06)';
                  const stroke =
                    laneData.status === 'Secured'
                      ? 'rgba(74, 222, 128, 0.25)'
                      : laneData.status === 'Contested'
                        ? 'rgba(201, 168, 106, 0.24)'
                        : 'rgba(248, 113, 113, 0.18)';

                  return (
                    <circle
                      key={z.id}
                      cx={z.x}
                      cy={z.y}
                      r={z.radius}
                      fill={fill}
                      stroke={stroke}
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Architectural Map Structures & Callouts */}
                {currentMap.buildings.map((b) => (
                  <g key={b.id}>
                    <rect
                      x={b.x}
                      y={b.y}
                      width={b.w}
                      height={b.h}
                      rx="4"
                      fill="#161A23"
                      stroke="#2D3240"
                      strokeWidth="1.5"
                    />
                    <text
                      x={b.labelX ?? b.x + b.w / 2}
                      y={b.labelY ?? b.y + b.h / 2 + 4}
                      textAnchor="middle"
                      fill="#8B8F9A"
                      fontSize="12"
                      fontFamily="DM Sans, sans-serif"
                      fontWeight="500"
                    >
                      {b.label}
                    </text>
                  </g>
                ))}

                {/* Spawns */}
                <g>
                  <circle
                    cx={currentMap.offenseSpawn.x}
                    cy={currentMap.offenseSpawn.y}
                    r="16"
                    fill="#161A23"
                    stroke="#C9A86A"
                    strokeWidth="1.5"
                  />
                  <text
                    x={currentMap.offenseSpawn.x}
                    y={currentMap.offenseSpawn.y + 4}
                    textAnchor="middle"
                    fill="#C9A86A"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                  >
                    OFF
                  </text>
                  <text
                    x={currentMap.offenseSpawn.x + 24}
                    y={currentMap.offenseSpawn.y + 4}
                    fill="#8C8982"
                    fontSize="11"
                    fontFamily="DM Sans, sans-serif"
                  >
                    {currentMap.offenseSpawn.label}
                  </text>
                </g>

                <g>
                  <circle
                    cx={currentMap.defenseSpawn.x}
                    cy={currentMap.defenseSpawn.y}
                    r="16"
                    fill="#161A23"
                    stroke="#6E85A8"
                    strokeWidth="1.5"
                  />
                  <text
                    x={currentMap.defenseSpawn.x}
                    y={currentMap.defenseSpawn.y + 4}
                    textAnchor="middle"
                    fill="#9EB8DE"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                  >
                    DEF
                  </text>
                  <text
                    x={currentMap.defenseSpawn.x - 24}
                    y={currentMap.defenseSpawn.y + 4}
                    textAnchor="end"
                    fill="#8C8982"
                    fontSize="11"
                    fontFamily="DM Sans, sans-serif"
                  >
                    {currentMap.defenseSpawn.label}
                  </text>
                </g>

                {/* Bomb Sites */}
                {currentMap.sites.map((site) => (
                  <g key={site.id}>
                    <rect
                      x={site.x - 20}
                      y={site.y - 20}
                      width="40"
                      height="40"
                      rx="6"
                      fill="#1B1612"
                      stroke="#C9A86A"
                      strokeWidth="2"
                    />
                    <text
                      x={site.x}
                      y={site.y + 5}
                      textAnchor="middle"
                      fill="#C9A86A"
                      fontSize="16"
                      fontFamily="Outfit, sans-serif"
                      fontWeight="700"
                    >
                      {site.id}
                    </text>
                    <text
                      x={site.x}
                      y={site.y + 34}
                      textAnchor="middle"
                      fill="#D6D3CB"
                      fontSize="11"
                      fontFamily="DM Sans, sans-serif"
                      fontWeight="500"
                    >
                      {site.name}
                    </text>
                  </g>
                ))}

                {/* Push / Pinch Route Arrows */}
                {routes.map((r) => (
                  <line
                    key={r.id}
                    x1={r.fromX}
                    y1={r.fromY}
                    x2={r.toX}
                    y2={r.toY}
                    stroke="#C9A86A"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    markerEnd="url(#mw4-arrow)"
                  />
                ))}

                {routeDraftStart && (
                  <circle cx={routeDraftStart.x} cy={routeDraftStart.y} r="6" fill="#C9A86A" />
                )}

                {/* Deployed CDL Legal Utility */}
                {utilities.map((u) => {
                  if (u.kind === 'smoke') {
                    return (
                      <g key={u.id}>
                        <circle
                          cx={u.x}
                          cy={u.y}
                          r="40"
                          fill="rgba(214, 219, 230, 0.22)"
                          stroke="rgba(226, 232, 240, 0.55)"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={u.x}
                          y={u.y + 4}
                          textAnchor="middle"
                          fill="#F3F1EC"
                          fontSize="10"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          SMOKE
                        </text>
                      </g>
                    );
                  }
                  if (u.kind === 'nade') {
                    return (
                      <g key={u.id}>
                        <circle
                          cx={u.x}
                          cy={u.y}
                          r="24"
                          fill="rgba(239, 68, 68, 0.16)"
                          stroke="rgba(248, 113, 113, 0.75)"
                          strokeWidth="1.5"
                        />
                        <text
                          x={u.x}
                          y={u.y + 4}
                          textAnchor="middle"
                          fill="#FCA5A5"
                          fontSize="10"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          NADE
                        </text>
                      </g>
                    );
                  }
                  return (
                    <g key={u.id}>
                      <circle
                        cx={u.x}
                        cy={u.y}
                        r="18"
                        fill="rgba(74, 222, 128, 0.14)"
                        stroke="rgba(74, 222, 128, 0.75)"
                        strokeWidth="1.5"
                      />
                      <text
                        x={u.x}
                        y={u.y + 3.5}
                        textAnchor="middle"
                        fill="#86EFAC"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        TRPY
                      </text>
                    </g>
                  );
                })}

                {/* 4v4 MW4 Squad Tokens */}
                {operators.map((op) => {
                  const isSelected = op.id === selectedOpId;
                  return (
                    <g
                      key={op.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSelectedOpId(op.id);
                        setTool('move');
                      }}
                      className="cursor-pointer"
                    >
                      <path
                        d={computeConePath(op.x, op.y, op.aimDeg)}
                        fill={
                          isSelected
                            ? 'rgba(201, 168, 106, 0.22)'
                            : 'rgba(201, 168, 106, 0.10)'
                        }
                      />
                      <circle
                        cx={op.x}
                        cy={op.y}
                        r={isSelected ? '19' : '16'}
                        fill={isSelected ? '#C9A86A' : '#1A1F2B'}
                        stroke={isSelected ? '#F3F1EC' : '#C9A86A'}
                        strokeWidth="2"
                      />
                      <text
                        x={op.x}
                        y={op.y + 4}
                        textAnchor="middle"
                        fill={isSelected ? '#090A0D' : '#F3F1EC'}
                        fontSize="10"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="700"
                      >
                        {op.code}
                      </text>
                      <text
                        x={op.x}
                        y={op.y + 31}
                        textAnchor="middle"
                        fill="#E4E1DA"
                        fontSize="10"
                        fontFamily="DM Sans, sans-serif"
                        fontWeight="500"
                      >
                        {op.role}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Operator Selector & Sightline Controls */}
            <div className="px-4 py-3 border-t border-[#22252E] bg-[#111319] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {operators.map((op) => {
                  const active = op.id === selectedOpId;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setSelectedOpId(op.id);
                        setTool('move');
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'border-[#C9A86A] bg-[#C9A86A]/15 text-[#F3F1EC]'
                          : 'border-[#252934] bg-[#171A22] text-[#A8A59E] hover:text-[#F3F1EC]'
                      }`}
                    >
                      <span className="font-mono text-[#C9A86A] mr-1.5">{op.code}</span>
                      {op.role}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-xs text-[#9C9A94]">
                <Crosshair className="w-3.5 h-3.5 text-[#C9A86A]" aria-hidden="true" />
                <span>Angle ({selectedOp.code}):</span>
                <button
                  type="button"
                  onClick={() => handleRotateSelected(-30)}
                  className="px-2 py-1 rounded border border-[#2B2F3A] bg-[#171A22] text-[#F3F1EC] hover:border-[#C9A86A]"
                >
                  -30°
                </button>
                <button
                  type="button"
                  onClick={() => handleRotateSelected(30)}
                  className="px-2 py-1 rounded border border-[#2B2F3A] bg-[#171A22] text-[#F3F1EC] hover:border-[#C9A86A]"
                >
                  +30°
                </button>
              </div>
            </div>
          </div>

          {tacticalAnalysis.gaSmokeWarning && (
            <p className="text-xs text-[#F59E0B] bg-[#111319] border border-[#22252E] rounded-md px-4 py-2.5">
              CDL Pro GA Notice: {tacticalAnalysis.smokeCount} Smokes deployed. Standard MW4 S&amp;D
              pro Gentleman&apos;s Agreement limits squads to 1 Smoke Grenade per round.
            </p>
          )}

          {simResult && (
            <div className="bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p
                    className={`text-xs font-medium ${
                      simResult.won ? 'text-[#4ADE80]' : 'text-[#F87171]'
                    }`}
                  >
                    {simResult.won ? 'Round Won' : 'Round Lost'} · {simResult.bombStatus}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[#F3F1EC] mt-0.5">
                    {simResult.headline}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#8C8982]">Map Control Score</p>
                  <p className="font-mono text-2xl font-semibold text-[#C9A86A] tabular-nums">
                    {simResult.finalControlPct}%
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#22252E] space-y-1.5">
                {simResult.details.map((line, idx) => (
                  <p key={idx} className="text-sm text-[#B8B5AE]">
                    {idx + 1}. {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Command Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Map Control Telemetry */}
          <div className="bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-5">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
                  Map Control Readout
                </h2>
                <p className="text-xs text-[#8C8982] mt-0.5">{currentMap.brief}</p>
              </div>
              <span className="font-mono text-2xl font-semibold text-[#C9A86A] tabular-nums shrink-0">
                {tacticalAnalysis.overallControl}%
              </span>
            </div>

            <div className="space-y-3 pt-3 border-t border-[#22252E]">
              {(
                [
                  { label: 'A-Lane Control', data: tacticalAnalysis.aLane },
                  { label: 'Mid-Map Control', data: tacticalAnalysis.midLane },
                  { label: 'B-Lane Control', data: tacticalAnalysis.bLane },
                ] as const
              ).map((lane) => (
                <div key={lane.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#D6D3CB]">{lane.label}</span>
                    <span className="font-mono tabular-nums">
                      <span
                        className={
                          lane.data.status === 'Secured'
                            ? 'text-[#4ADE80]'
                            : lane.data.status === 'Contested'
                              ? 'text-[#C9A86A]'
                              : 'text-[#F87171]'
                        }
                      >
                        {lane.data.status}
                      </span>{' '}
                      <span className="text-[#8C8982]">· {lane.data.pct}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#1B1F2A] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        lane.data.status === 'Secured'
                          ? 'bg-[#4ADE80]'
                          : lane.data.status === 'Contested'
                            ? 'bg-[#C9A86A]'
                            : 'bg-[#F87171]'
                      }`}
                      style={{ width: `${lane.data.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#22252E]">
              <div>
                <p className="text-xs text-[#8C8982]">Trade Discipline</p>
                <p className="font-mono text-lg font-semibold text-[#F3F1EC] tabular-nums mt-0.5">
                  {tacticalAnalysis.tradeDiscipline}%
                </p>
              </div>
              <div>
                <p className="text-xs text-[#8C8982]">Projected Win Odds</p>
                <p className="font-mono text-lg font-semibold text-[#4ADE80] tabular-nums mt-0.5">
                  {tacticalAnalysis.winOdds}%
                </p>
              </div>
            </div>
          </div>

          {/* CDL Playbooks + 1:45 IGL Timing Script */}
          <div className="bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
                MW4 CDL S&amp;D Playbooks
              </h2>
              <p className="text-xs text-[#8C8982] mt-0.5">
                {currentMap.name} · {side === 'offense' ? 'Offense Executes' : 'Defense Holds'}
              </p>
            </div>

            <div className="space-y-2">
              {availablePlaybooks.map((play) => {
                const active = play.id === activePlaybookId;
                return (
                  <button
                    key={play.id}
                    type="button"
                    onClick={() => loadPlaybook(play)}
                    className={`w-full text-left p-3.5 rounded-md border transition-colors ${
                      active
                        ? 'border-[#C9A86A] bg-[#181A20]'
                        : 'border-[#232732] bg-[#14171F] hover:border-[#343A4A]'
                    }`}
                  >
                    <p className="text-sm font-medium text-[#F3F1EC]">{play.name}</p>
                    <p className="text-xs text-[#9C9A94] mt-1 leading-relaxed">{play.summary}</p>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#22252E] space-y-3">
              <p className="text-xs font-medium text-[#C9A86A]">IGL Timing Script (1:45 Clock)</p>
              <div className="space-y-2.5">
                {activePlaybook.timingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <span className="font-mono font-semibold text-[#F3F1EC] tabular-nums shrink-0 w-10">
                      {step.clock}
                    </span>
                    <p className="text-[#A8A59E] leading-relaxed">{step.callout}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Custom Strat */}
          <div className="bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-[#F3F1EC]">
                Saved {currentMap.name} Strats
              </h2>
              <span className="text-xs text-[#8C8982] font-mono tabular-nums">
                {mapSavedPlays.length} Saved
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={saveName}
                onChange={(e) => {
                  setSaveName(e.target.value);
                  setSaveMessage(null);
                }}
                placeholder="Name custom setup..."
                aria-label="Custom MW4 playbook name"
                className="flex-1 min-w-0 px-3 py-2 text-xs bg-[#0E1016] border border-[#252934] rounded-md text-[#F3F1EC] placeholder:text-[#6E6C66] focus:border-[#C9A86A] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveCustomPlay}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                Save
              </button>
            </div>

            {saveMessage && <p className="text-xs text-[#C9A86A]">{saveMessage}</p>}

            {mapSavedPlays.length > 0 && (
              <div className="divide-y divide-[#1D2028] border-t border-[#22252E]">
                {mapSavedPlays.map((sp) => (
                  <div
                    key={sp.id}
                    className="py-2.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOperators(sp.operators.map((o) => ({ ...o })));
                        setUtilities(sp.utilities.map((u) => ({ ...u })));
                        setRoutes(sp.routes.map((r) => ({ ...r })));
                        setSimResult(null);
                      }}
                      className="text-left text-[#F3F1EC] hover:text-[#C9A86A] font-medium truncate"
                    >
                      {sp.name}{' '}
                      <span className="text-[#8C8982] font-normal">· {sp.createdAt}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePlaybook(sp.id)}
                      aria-label={`Delete ${sp.name}`}
                      className="text-[#8C8982] hover:text-[#F87171] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-[#22252E] flex items-center justify-between text-xs">
              <span className="text-[#8C8982]">Verify CDL v1.0 bans?</span>
              <button
                type="button"
                onClick={() => onNavigate('cdl_intel')}
                className="text-[#C9A86A] hover:text-[#E2C68F] font-medium"
              >
                View CDL v1.0 Intel →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
