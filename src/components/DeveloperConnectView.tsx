import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  FileUp,
  Layers,
  MessageSquare,
  Plug,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  DEVELOPER_ECOSYSTEMS,
  DeveloperApiAccessModel,
  GAME_CATALOG,
} from '../data/gameCatalog';

interface DeveloperConnectViewProps {
  onNavigatePath: (path: string, label?: string) => void;
}

interface ChessPlayerResult {
  username: string;
  name?: string;
  title?: string;
  followers?: number;
  status?: string;
  url?: string;
  rapid?: number;
  blitz?: number;
  bullet?: number;
}

interface RiotPatchResult {
  latestVersion: string;
  recentVersions: string[];
  championCount: number;
  sampleChampions: { id: string; name: string; title: string }[];
}

interface ParsedMw4ExportSummary {
  fileName: string;
  matchCount: number;
  totalKills: number;
  totalDeaths: number;
  kdRatio: string;
  winRate: string;
  topMaps: { map: string; matches: number }[];
}

const MW4_PIPELINE_TRACKS = [
  {
    id: 'overwolf',
    step: 'Track 1 · PC Live Telemetry',
    title: 'Overwolf Official Game Events SDK',
    status: 'Sanctioned · Ricochet-Safe',
    summary:
      'Activision does not offer an open public REST API key. For live PC match events (match start/end, map, mode, kills, deaths, roster), Overwolf maintains the sanctioned client-side Game Events SDK for Call of Duty HQ titles.',
    endpointLabel: 'dev.overwolf.com · Call of Duty Game Events',
    url: 'https://dev.overwolf.com/ow-native/guides/supported-games/call-of-duty-modern-warfare-3',
    cta: 'Open Overwolf Docs',
  },
  {
    id: 'activision-sar',
    step: 'Track 2 · Official Player History',
    title: 'Activision Privacy Data Export (GDPR / CCPA SAR)',
    status: '100% Player-Consented',
    summary:
      'Players can request their official match history export directly from Activision (CSV/JSON with maps, modes, weapons, K/D, and skill telemetry) and import it privately in Rule One below — zero scraping and zero account passwords.',
    endpointLabel: 'support.activision.com/privacy-portal',
    url: 'https://support.activision.com/privacy-portal',
    cta: 'Request Official Export',
  },
  {
    id: 'steamworks',
    step: 'Track 3 · Identity & Patch Feed',
    title: 'Valve Steamworks Web API (COD HQ AppID 1938090)',
    status: 'Self-Serve Key',
    summary:
      'Use official Steamworks endpoints for Steam OpenID player verification, official Call of Duty patch/announcement feeds (ISteamNews/GetNewsForApp), and PC concurrency snapshots (ISteamUserStats/GetNumberOfCurrentPlayers).',
    endpointLabel: 'partner.steamgames.com · AppID 1938090',
    url: 'https://steamcommunity.com/dev/apikey',
    cta: 'Get Steam Web API Key',
  },
  {
    id: 'cdl-partner',
    step: 'Track 4 · Commercial Pro Esports',
    title: 'Activision & Call of Duty League (CDL) Partnership',
    status: 'Partner Application',
    summary:
      'Direct server-to-server MW4/CDL broadcast and ranked telemetry requires an authorized publisher partnership (never reverse-engineered SSO cookie scraping). Use the outreach builder below to submit a compliant partner pitch.',
    endpointLabel: 'callofdutyleague.com · Partner Track',
    url: 'https://www.callofdutyleague.com',
    cta: 'Visit CDL Portal',
  },
] as const;

const OUTREACH_TARGETS = [
  {
    id: 'activision_mw4',
    label: 'Activision / CDL — Call of Duty: Modern Warfare 4 (2026)',
    provider: 'Activision / Call of Duty League',
    portalUrl: 'https://support.activision.com/articles/managing-your-activision-profile',
    gamesList: 'Call of Duty: Modern Warfare 4 (2026)',
    isClosedPublisher: true,
  },
  ...DEVELOPER_ECOSYSTEMS.filter((e) => e.ecosystemId !== 'activision_mw4').map((eco) => ({
    id: eco.ecosystemId,
    label: `${eco.provider} (${eco.games.map((g) => g.shortTitle).join(', ')})`,
    provider: eco.provider,
    portalUrl: eco.portalUrl,
    gamesList: eco.games.map((g) => g.name).join(', '),
    isClosedPublisher: false,
  })),
];

function parseActivisionExportText(fileName: string, text: string): ParsedMw4ExportSummary {
  const trimmed = text.trim();
  let rows: Record<string, string | number>[] = [];

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      rows = parsed.filter((r): r is Record<string, string | number> => Boolean(r && typeof r === 'object'));
    } else if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      const nested = obj.matches || obj.multiplayer || obj.data;
      if (Array.isArray(nested)) {
        rows = nested.filter((r): r is Record<string, string | number> => Boolean(r && typeof r === 'object'));
      }
    }
  } else {
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length >= 2) {
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string | number> = {};
        headers.forEach((h, idx) => {
          row[h] = cols[idx] ?? '';
        });
        rows.push(row);
      }
    }
  }

  if (rows.length === 0) {
    throw new Error(
      'No match rows detected. Upload a CSV or JSON match export from Activision (columns like map, kills, deaths, result).'
    );
  }

  let totalKills = 0;
  let totalDeaths = 0;
  let wins = 0;
  const mapCounts = new Map<string, number>();

  for (const r of rows) {
    const lowerMap: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(r)) {
      lowerMap[k.toLowerCase()] = v;
    }
    const kills = Number(lowerMap.kills ?? lowerMap.eliminations ?? 0) || 0;
    const deaths = Number(lowerMap.deaths ?? 0) || 0;
    totalKills += kills;
    totalDeaths += deaths;

    const outcome = String(lowerMap.result ?? lowerMap.match_outcome ?? lowerMap.outcome ?? '').toLowerCase();
    if (outcome.includes('win') || outcome === 'w' || outcome === 'victory') {
      wins += 1;
    }

    const mapName = String(lowerMap.map ?? lowerMap.map_name ?? 'Unknown Map').trim() || 'Unknown Map';
    mapCounts.set(mapName, (mapCounts.get(mapName) || 0) + 1);
  }

  const kd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);
  const winRate = `${Math.round((wins / rows.length) * 100)}%`;
  const topMaps = Array.from(mapCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([map, matches]) => ({ map, matches }));

  return {
    fileName,
    matchCount: rows.length,
    totalKills,
    totalDeaths,
    kdRatio: kd,
    winRate,
    topMaps,
  };
}

export function DeveloperConnectView({ onNavigatePath }: DeveloperConnectViewProps) {
  const [accessFilter, setAccessFilter] = useState<'All' | DeveloperApiAccessModel>('All');
  const [liveTab, setLiveTab] = useState<'mw4_export' | 'chess' | 'riot'>('mw4_export');

  // MW4 Activision Official Export Importer state
  const [mw4ExportSummary, setMw4ExportSummary] = useState<ParsedMw4ExportSummary | null>(null);
  const [mw4ExportError, setMw4ExportError] = useState<string | null>(null);

  // Chess.com live official PubAPI state
  const [chessUsername, setChessUsername] = useState('hikaru');
  const [chessLoading, setChessLoading] = useState(false);
  const [chessError, setChessError] = useState<string | null>(null);
  const [chessResult, setChessResult] = useState<ChessPlayerResult | null>(null);

  // Riot Data Dragon live official API state
  const [riotLoading, setRiotLoading] = useState(false);
  const [riotError, setRiotError] = useState<string | null>(null);
  const [riotResult, setRiotResult] = useState<RiotPatchResult | null>(null);

  // Outreach / API Application Generator state
  const [selectedOutreachId, setSelectedOutreachId] = useState(OUTREACH_TARGETS[0].id);
  const [contactEmail, setContactEmail] = useState('jason.vaughn202@gmail.com');
  const [appUrl, setAppUrl] = useState('https://ruleone.gg');
  const [copiedPitch, setCopiedPitch] = useState(false);

  const filteredEcosystems = useMemo(() => {
    if (accessFilter === 'All') return DEVELOPER_ECOSYSTEMS;
    return DEVELOPER_ECOSYSTEMS.filter((e) => e.accessModel === accessFilter);
  }, [accessFilter]);

  const handleMw4FileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMw4ExportError(null);
    try {
      const content = await file.text();
      const summary = parseActivisionExportText(file.name, content);
      setMw4ExportSummary(summary);
    } catch (err) {
      setMw4ExportSummary(null);
      setMw4ExportError(err instanceof Error ? err.message : 'Unable to parse export file.');
    }
  };

  const fetchChessLive = async (usernameOverride?: string) => {
    const handle = (usernameOverride ?? chessUsername).trim().toLowerCase();
    if (!handle) return;
    if (usernameOverride) setChessUsername(usernameOverride);
    setChessLoading(true);
    setChessError(null);
    try {
      const [profileRes, statsRes] = await Promise.all([
        fetch(`https://api.chess.com/pub/player/${encodeURIComponent(handle)}`),
        fetch(`https://api.chess.com/pub/player/${encodeURIComponent(handle)}/stats`),
      ]);
      if (!profileRes.ok) {
        throw new Error(`Player "${handle}" not found on Chess.com PubAPI.`);
      }
      const profile = (await profileRes.json()) as Record<string, unknown>;
      const stats = statsRes.ok
        ? ((await statsRes.json()) as Record<string, { last?: { rating?: number } }>)
        : {};
      setChessResult({
        username: String(profile.username || handle),
        name: typeof profile.name === 'string' ? profile.name : undefined,
        title: typeof profile.title === 'string' ? profile.title : undefined,
        followers: typeof profile.followers === 'number' ? profile.followers : undefined,
        status: typeof profile.status === 'string' ? profile.status : undefined,
        url: typeof profile.url === 'string' ? profile.url : undefined,
        rapid: stats.chess_rapid?.last?.rating,
        blitz: stats.chess_blitz?.last?.rating,
        bullet: stats.chess_bullet?.last?.rating,
      });
    } catch (err) {
      setChessResult(null);
      setChessError(err instanceof Error ? err.message : 'Unable to reach Chess.com API.');
    } finally {
      setChessLoading(false);
    }
  };

  const fetchRiotLive = async () => {
    setRiotLoading(true);
    setRiotError(null);
    try {
      const verRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
      if (!verRes.ok) throw new Error('Unable to fetch Riot Data Dragon versions.');
      const versions = (await verRes.json()) as string[];
      const latest = versions[0];
      const champRes = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${encodeURIComponent(latest)}/data/en_US/champion.json`
      );
      if (!champRes.ok) throw new Error('Unable to fetch Riot champion manifest.');
      const champJson = (await champRes.json()) as {
        data: Record<string, { id: string; name: string; title: string }>;
      };
      const allChamps = Object.values(champJson.data);
      setRiotResult({
        latestVersion: latest,
        recentVersions: versions.slice(0, 5),
        championCount: allChamps.length,
        sampleChampions: allChamps.slice(0, 6).map((c) => ({
          id: c.id,
          name: c.name,
          title: c.title,
        })),
      });
    } catch (err) {
      setRiotResult(null);
      setRiotError(err instanceof Error ? err.message : 'Unable to reach Riot Data Dragon.');
    } finally {
      setRiotLoading(false);
    }
  };

  const selectedTarget =
    OUTREACH_TARGETS.find((t) => t.id === selectedOutreachId) || OUTREACH_TARGETS[0];

  const generatedPitch = useMemo(() => {
    const cleanEmail = contactEmail.trim() || 'founder@ruleone.gg';
    const cleanUrl = appUrl.trim() || 'https://ruleone.gg';
    return [
      `Subject: Rule One — Official Developer API / Data Partnership Request (${selectedTarget.provider})`,
      '',
      `Hello ${selectedTarget.provider} Developer Relations Team,`,
      '',
      `We are building Rule One (${cleanUrl}), a competitive esports intelligence, strategy, and clan operations platform focused on helping players improve and organize teams.`,
      '',
      `Target Title(s): ${selectedTarget.gamesList}`,
      selectedTarget.isClosedPublisher
        ? `Access Requested: Authorized Partner / Official Esports Data Program review (we do not scrape or use unofficial SSO cookie endpoints).`
        : `Access Requested: Official Production Developer API access in full compliance with ${selectedTarget.provider} Developer Terms.`,
      '',
      `Compliance & Technical Architecture:`,
      `- Zero gambling, wagering, or real-money betting features.`,
      `- Explicit player opt-in / OAuth sign-in before displaying personal match history.`,
      `- Server-side API key storage only with strict response caching and rate-limit compliance.`,
      `- Core guides, builds, and stats remain genuinely useful on our free tier.`,
      '',
      `We would welcome guidance on the right review track or partner contact for ${selectedTarget.provider}.`,
      '',
      `Best regards,`,
      `Rule One Founding Team`,
      `Contact: ${cleanEmail}`,
    ].join('\n');
  }, [selectedTarget, contactEmail, appUrl]);

  const handleCopyPitch = async () => {
    try {
      await navigator.clipboard.writeText(generatedPitch);
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    } catch {
      // Ignore clipboard sandbox restrictions
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-10">
      {/* Page Title */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#C9A86A]">
          {GAME_CATALOG.length} Connected Games · {DEVELOPER_ECOSYSTEMS.length} Official Developer Pipelines
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#F3F1EC]">
          Connect with Game Developers
        </h1>
        <p className="text-sm text-[#8C8982] max-w-2xl">
          Every game in Rule One connects through a verified developer API or sanctioned telemetry
          pipeline — including our 4-track architecture for Call of Duty: Modern Warfare 4 (2026).
        </p>
      </div>

      {/* 1. CALL OF DUTY: MODERN WARFARE 4 (2026) — DEEP-SEARCHED DEVELOPER PIPELINE */}
      <section className="bg-[#14161B] border border-[#C9A86A]/35 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#C9A86A] inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              Deep-Searched Developer Pipeline · Call of Duty: Modern Warfare 4 (2026)
            </p>
            <h2 className="font-display text-xl font-semibold text-[#F3F1EC]">
              How Rule One Connects Official MW4 (2026) Data
            </h2>
            <p className="text-xs sm:text-sm text-[#8C8982] max-w-2xl leading-relaxed">
              Activision does not publish a self-serve public REST API key (and reverse-engineered
              SSO cookie scraping breaks under Ricochet &amp; violates ToS). Instead, Rule One uses
              these 4 legitimate, developer-sanctioned channels:
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigatePath('/games/modern-warfare-4', 'Modern Warfare 4')}
            className="px-4 py-2 text-xs font-medium text-[#0B0C0F] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            Open MW4 Hub →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MW4_PIPELINE_TRACKS.map((track) => (
            <div
              key={track.id}
              className="bg-[#0E1015] border border-[#222630] rounded-xl p-4 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-medium text-[#C9A86A]">{track.step}</span>
                  <span className="font-mono text-[#8C8982]">{track.status}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#F3F1EC]">{track.title}</h3>
                <p className="text-xs text-[#A8A59E] leading-relaxed">{track.summary}</p>
              </div>
              <div className="pt-2.5 border-t border-[#1C2029] flex items-center justify-between gap-2 text-xs">
                <span className="font-mono text-[10px] text-[#7D7B75] truncate">
                  {track.endpointLabel}
                </span>
                <a
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#C9A86A] hover:underline shrink-0 font-medium"
                >
                  {track.cta}
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. LIVE DEVELOPER DATA CONNECTOR (Zero Key Required — Works Right Now) */}
      <section className="bg-[#14161B] border border-[#222630] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A86A]" aria-hidden="true" />
              Live Developer Data Tools (Ready Now)
            </h2>
            <p className="text-xs text-[#8C8982]">
              Import your official Activision MW4 export or pull live public data from Chess.com &amp; Riot.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#0E1015] border border-[#222630] rounded-xl p-1">
            <button
              type="button"
              onClick={() => setLiveTab('mw4_export')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                liveTab === 'mw4_export'
                  ? 'bg-[#1F232F] text-[#F3F1EC]'
                  : 'text-[#8C8982] hover:text-[#F3F1EC]'
              }`}
            >
              MW4 Official Export
            </button>
            <button
              type="button"
              onClick={() => setLiveTab('chess')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                liveTab === 'chess'
                  ? 'bg-[#1F232F] text-[#F3F1EC]'
                  : 'text-[#8C8982] hover:text-[#F3F1EC]'
              }`}
            >
              Chess.com PubAPI
            </button>
            <button
              type="button"
              onClick={() => setLiveTab('riot')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                liveTab === 'riot'
                  ? 'bg-[#1F232F] text-[#F3F1EC]'
                  : 'text-[#8C8982] hover:text-[#F3F1EC]'
              }`}
            >
              Riot Data Dragon
            </button>
          </div>
        </div>

        {liveTab === 'mw4_export' && (
          <div className="space-y-4">
            <div className="bg-[#0E1015] border border-dashed border-[#2B303D] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#F3F1EC] inline-flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-[#C9A86A]" aria-hidden="true" />
                  Import Official Activision Match Export (CSV or JSON)
                </p>
                <p className="text-xs text-[#8C8982] leading-relaxed">
                  Download your personal Call of Duty match history from{' '}
                  <a
                    href="https://support.activision.com/privacy-portal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C9A86A] hover:underline"
                  >
                    support.activision.com/privacy-portal
                  </a>{' '}
                  and select it here. Parsed 100% locally in your browser — never uploaded.
                </p>
              </div>
              <label className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-[#0B0C0F] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-xl cursor-pointer transition-colors whitespace-nowrap shrink-0">
                Select CSV / JSON File
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={(e) => void handleMw4FileUpload(e)}
                  className="sr-only"
                />
              </label>
            </div>

            {mw4ExportError && <p className="text-xs text-[#F87171]">{mw4ExportError}</p>}

            {mw4ExportSummary && (
              <div className="bg-[#0E1015] border border-[#222630] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#F3F1EC] font-medium">{mw4ExportSummary.fileName}</span>
                  <span className="font-mono text-[#4ADE80]">Parsed Locally</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[11px] text-[#7D7B75]">Matches</p>
                    <p className="font-mono text-lg font-semibold text-[#F3F1EC]">
                      {mw4ExportSummary.matchCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#7D7B75]">K/D Ratio</p>
                    <p className="font-mono text-lg font-semibold text-[#C9A86A]">
                      {mw4ExportSummary.kdRatio}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#7D7B75]">Win Rate</p>
                    <p className="font-mono text-lg font-semibold text-[#F3F1EC]">
                      {mw4ExportSummary.winRate}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#7D7B75]">Top Map</p>
                    <p className="text-sm font-semibold text-[#F3F1EC] truncate mt-1">
                      {mw4ExportSummary.topMaps[0]?.map || '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {liveTab === 'chess' && (
          <div className="space-y-4">
            <form
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                void fetchChessLive();
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-[#7D7B75] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={chessUsername}
                  onChange={(e) => setChessUsername(e.target.value)}
                  placeholder="Enter Chess.com username (e.g. hikaru)"
                  aria-label="Chess.com username"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0E1015] border border-[#242833] rounded-xl text-[#F3F1EC] placeholder:text-[#7D7B75] focus:border-[#C9A86A] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={chessLoading}
                className="px-5 py-2.5 text-sm font-medium text-[#0B0C0F] bg-[#C9A86A] hover:bg-[#D7B97E] disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap"
              >
                {chessLoading ? 'Fetching...' : 'Fetch Live Profile'}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8C8982]">
              <span>Try:</span>
              {['hikaru', 'magnuscarlsen', 'gothamchess'].map((handle) => (
                <button
                  key={handle}
                  type="button"
                  onClick={() => void fetchChessLive(handle)}
                  className="px-2.5 py-1 bg-[#0E1015] hover:bg-[#1B1E26] border border-[#242833] rounded-lg text-[#D6D3CB] transition-colors"
                >
                  {handle}
                </button>
              ))}
            </div>

            {chessError && <p className="text-xs text-[#F87171]">{chessError}</p>}

            {chessResult && (
              <div className="bg-[#0E1015] border border-[#222630] rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[11px] text-[#7D7B75]">Player</p>
                  <p className="text-sm font-semibold text-[#F3F1EC] mt-0.5 truncate">
                    {chessResult.title ? `${chessResult.title} ` : ''}
                    {chessResult.name || chessResult.username}
                  </p>
                  <p className="text-[11px] text-[#8C8982]">@{chessResult.username}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#7D7B75]">Blitz Rating</p>
                  <p className="font-mono text-lg font-semibold text-[#C9A86A] tabular-nums mt-0.5">
                    {chessResult.blitz ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#7D7B75]">Rapid Rating</p>
                  <p className="font-mono text-lg font-semibold text-[#F3F1EC] tabular-nums mt-0.5">
                    {chessResult.rapid ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#7D7B75]">Bullet Rating</p>
                  <p className="font-mono text-lg font-semibold text-[#F3F1EC] tabular-nums mt-0.5">
                    {chessResult.bullet ?? '—'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {liveTab === 'riot' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#A8A59E]">
                Connects directly to Riot Games&apos; official CDN (
                <span className="font-mono text-[#D6D3CB]">ddragon.leagueoflegends.com</span>) for
                the live League of Legends patch and champion roster.
              </p>
              <button
                type="button"
                onClick={() => void fetchRiotLive()}
                disabled={riotLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0B0C0F] bg-[#C9A86A] hover:bg-[#D7B97E] disabled:opacity-60 rounded-xl transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${riotLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                {riotLoading ? 'Syncing...' : 'Sync Live Riot Patch'}
              </button>
            </div>

            {riotError && <p className="text-xs text-[#F87171]">{riotError}</p>}

            {riotResult && (
              <div className="bg-[#0E1015] border border-[#222630] rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[#8C8982]">
                    Live LoL Patch:{' '}
                    <strong className="font-mono text-[#C9A86A]">{riotResult.latestVersion}</strong>
                  </span>
                  <span className="text-[#8C8982]">
                    Total Champions Synced:{' '}
                    <strong className="font-mono text-[#F3F1EC]">{riotResult.championCount}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {riotResult.sampleChampions.map((c) => (
                    <div
                      key={c.id}
                      className="px-3 py-2 bg-[#14161B] border border-[#222630] rounded-lg"
                    >
                      <p className="text-xs font-semibold text-[#F3F1EC]">{c.name}</p>
                      <p className="text-[11px] text-[#7D7B75] truncate">{c.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. OFFICIAL DEVELOPER PORTALS DIRECTORY */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
            <Plug className="w-4 h-4 text-[#C9A86A]" aria-hidden="true" />
            All {DEVELOPER_ECOSYSTEMS.length} Official Developer Portals
          </h2>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                'All',
                'Partner + Telemetry SDK',
                'Public (No Key)',
                'Self-Serve Key',
                'OAuth 2.0 + Review',
              ] as const
            ).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setAccessFilter(filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  accessFilter === filter
                    ? 'bg-[#1D202A] text-[#F3F1EC]'
                    : 'text-[#8C8982] hover:text-[#F3F1EC] bg-[#14161B]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEcosystems.map((eco) => (
            <article
              key={eco.ecosystemId}
              className="bg-[#14161B] border border-[#222630] rounded-2xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-[#F3F1EC]">{eco.provider}</h3>
                    <p className="text-xs text-[#8C8982]">{eco.apiName}</p>
                  </div>
                  <span className="text-[11px] font-mono text-[#C9A86A] shrink-0">
                    {eco.accessModel}
                  </span>
                </div>

                {/* Clickable Games Covered */}
                <div className="flex flex-wrap gap-1.5">
                  {eco.games.map((g) => (
                    <button
                      key={g.slug}
                      type="button"
                      onClick={() =>
                        onNavigatePath(
                          g.priority === 'pilot' ? '/games/modern-warfare-4' : `/games/${g.slug}`,
                          g.shortTitle
                        )
                      }
                      className="px-2.5 py-1 text-xs font-medium bg-[#0E1015] hover:bg-[#1B1E26] border border-[#242833] hover:border-[#C9A86A]/50 rounded-lg text-[#F3F1EC] transition-colors"
                    >
                      {g.shortTitle}
                    </button>
                  ))}
                </div>

                {/* Data Available */}
                <p className="text-xs text-[#A8A59E] leading-relaxed">
                  <span className="text-[#7D7B75]">Data: </span>
                  {eco.dataScopes.slice(0, 4).join(' · ')}
                </p>

                {/* Step-by-step connection instructions */}
                <ol className="space-y-1.5 text-xs text-[#8C8982] list-decimal list-inside">
                  {eco.contactSteps.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-3 border-t border-[#1F232C] flex flex-wrap items-center gap-3 text-xs">
                <a
                  href={eco.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-[#C9A86A] hover:underline"
                >
                  Developer Portal
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
                <a
                  href={eco.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#D6D3CB] hover:text-[#F3F1EC]"
                >
                  API Docs
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
                <a
                  href={eco.communityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#8C8982] hover:text-[#F3F1EC]"
                >
                  <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                  {eco.communityLabel}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. DEVELOPER APPLICATION & PARTNERSHIP OUTREACH BUILDER */}
      <section className="bg-[#14161B] border border-[#222630] rounded-2xl p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
            <Send className="w-4 h-4 text-[#C9A86A]" aria-hidden="true" />
            Developer API Application &amp; Partner Outreach
          </h2>
          <p className="text-xs text-[#8C8982]">
            Pre-filled for Activision / MW4 (2026) or any developer above — copy and send to apply
            for production API keys or official esports partner access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label htmlFor="dev-target" className="text-xs text-[#8C8982]">
              Publisher / Developer
            </label>
            <select
              id="dev-target"
              value={selectedOutreachId}
              onChange={(e) => setSelectedOutreachId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#0E1015] border border-[#242833] rounded-xl text-[#F3F1EC] focus:border-[#C9A86A] focus:outline-none"
            >
              {OUTREACH_TARGETS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="dev-email" className="text-xs text-[#8C8982]">
              Your Contact Email
            </label>
            <input
              id="dev-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#0E1015] border border-[#242833] rounded-xl text-[#F3F1EC] focus:border-[#C9A86A] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="dev-url" className="text-xs text-[#8C8982]">
              App Website / Domain
            </label>
            <input
              id="dev-url"
              type="text"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#0E1015] border border-[#242833] rounded-xl text-[#F3F1EC] focus:border-[#C9A86A] focus:outline-none"
            />
          </div>
        </div>

        <pre className="p-4 bg-[#0E1015] border border-[#222630] rounded-xl text-xs text-[#D6D3CB] whitespace-pre-wrap font-sans leading-relaxed">
          {generatedPitch}
        </pre>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs text-[#8C8982]">
            <ShieldCheck className="w-4 h-4 text-[#C9A86A]" aria-hidden="true" />
            Store approved API keys in server environment variables — never paste secrets into the browser.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => void handleCopyPitch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0B0C0F] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-xl transition-colors"
            >
              {copiedPitch ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  Copy Application Text
                </>
              )}
            </button>
            <a
              href={selectedTarget.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#F3F1EC] bg-[#1B1E26] hover:bg-[#232733] border border-[#2A2E3A] rounded-xl transition-colors"
            >
              Open {selectedTarget.provider} Portal
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
