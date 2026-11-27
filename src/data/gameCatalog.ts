import verifiedImages from './verifiedGameImages.json';

export type GameCategory =
  | 'Tactical FPS'
  | 'Battle royale'
  | 'MOBA'
  | 'Sports and racing'
  | 'Strategy and other';

export type GameAdapterType =
  | 'fps'
  | 'battle_royale'
  | 'moba'
  | 'sports_racing'
  | 'rts_strategy';

export type DeveloperApiAccessModel =
  | 'Public (No Key)'
  | 'Self-Serve Key'
  | 'OAuth 2.0 + Review'
  | 'Partner + Telemetry SDK';

export interface DeveloperApiInfo {
  ecosystemId: string;
  provider: string;
  apiName: string;
  portalUrl: string;
  docsUrl: string;
  communityUrl: string;
  communityLabel: string;
  accessModel: DeveloperApiAccessModel;
  liveDemoSupported: boolean;
  dataScopes: string[];
  contactSteps: string[];
}

export interface GameSchemaModule {
  id: string;
  label: string;
  description: string;
  status: 'Active (Pilot)' | 'Adapter Ready (Evidence Pending)';
}

export interface GameCatalogEntry {
  slug: string;
  name: string;
  shortTitle: string;
  category: GameCategory;
  adapterType: GameAdapterType;
  priority: 'pilot' | 'candidate';
  publisher: string;
  officialUrl: string;
  platforms: string[];
  aliases: string[];
  developerApi: DeveloperApiInfo;
  imageUrl: string;
  posterUrl: string;
  imageSource: string;
  imageFit: 'cover' | 'contain';
  posterFit: 'cover' | 'contain';
  steamAppId?: number;
  artStatus: 'permission_pending_editorial_preview' | 'original_svg_only';
  artBrief: string;
  altText: string;
  rightsOwner: string;
  permissionScope: string;
  verificationStatus: string;
  verifiedCheckedDate: string;
  indexable: boolean;
  schemaModules: GameSchemaModule[];
}

type VerifiedMap = Record<
  string,
  { imageUrl: string; posterUrl?: string; imageSource: string; steamAppId?: number }
>;

const VERIFIED_IMAGE_MAP = verifiedImages as VerifiedMap;

const CONTAIN_FIT_GAMES = new Set([
  'VALORANT',
  'World of Warcraft',
  'osu!',
]);

const POSTER_CONTAIN_GAMES = new Set([
  'World of Warcraft',
  'osu!',
]);

const SHORT_TITLES: Record<string, string> = {
  'Call of Duty: Modern Warfare 4': 'Modern Warfare 4',
  'VALORANT': 'Valorant',
  'PUBG: BATTLEGROUNDS': 'PUBG',
};

const DEVELOPER_APIS: Record<string, DeveloperApiInfo> = {
  activision_mw4: {
    ecosystemId: 'activision_mw4',
    provider: 'Activision · Overwolf · Steamworks',
    apiName: 'MW4 (2026) Multi-Channel Developer Pipeline',
    portalUrl: 'https://dev.overwolf.com/ow-native/guides/supported-games/call-of-duty-modern-warfare-3',
    docsUrl: 'https://support.activision.com/privacy-portal',
    communityUrl: 'https://www.callofdutyleague.com',
    communityLabel: 'Call of Duty League',
    accessModel: 'Partner + Telemetry SDK',
    liveDemoSupported: true,
    dataScopes: [
      'Overwolf PC Live Match Events (Ricochet-Safe)',
      'Official Activision SAR Match History Export (CSV/JSON)',
      'Steamworks Web API News & Concurrency (AppID 1938090)',
      'CDL / Activision Commercial Partner Track',
    ],
    contactSteps: [
      'PC Real-Time Telemetry: Register on Overwolf Developers (dev.overwolf.com) for sanctioned Call of Duty client-side match/kill/map events.',
      'Full Career History: Have players request their official match export from support.activision.com/privacy-portal and import it locally into Rule One.',
      'Patch & Identity Layer: Connect Steamworks Web API (AppID 1938090) for patch news & Steam OpenID, and submit a formal partner inquiry for CDL feeds.',
    ],
  },
  riot_val: {
    ecosystemId: 'riot',
    provider: 'Riot Games',
    apiName: 'Riot Games Developer API (VALORANT)',
    portalUrl: 'https://developer.riotgames.com/',
    docsUrl: 'https://developer.riotgames.com/docs/valorant',
    communityUrl: 'https://discord.gg/riotgamesdevrel',
    communityLabel: 'Riot DevRel Discord',
    accessModel: 'OAuth 2.0 + Review',
    liveDemoSupported: false,
    dataScopes: ['Account-V1 (Riot ID)', 'Ranked Leaderboards', 'Match History (RSO Opt-In)', 'Content & Agents'],
    contactSteps: [
      'Register your Rule One app on developer.riotgames.com and request a Production API Key.',
      'Enable Riot Sign-On (RSO) so players explicitly opt in before viewing VALORANT match history.',
      'Join the official Riot DevRel Discord to ask policy questions and track production review.',
    ],
  },
  riot_lol: {
    ecosystemId: 'riot',
    provider: 'Riot Games',
    apiName: 'Riot Games Developer API + Data Dragon',
    portalUrl: 'https://developer.riotgames.com/',
    docsUrl: 'https://developer.riotgames.com/docs/lol',
    communityUrl: 'https://discord.gg/riotgamesdevrel',
    communityLabel: 'Riot DevRel Discord',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: true,
    dataScopes: ['Live Patch & Champion Data (Data Dragon)', 'Match-V5 History', 'Ranked Leagues', 'Spectator / Mastery'],
    contactSteps: [
      'Use Riot Data Dragon immediately with zero key for live patch versions, champions, and items.',
      'Sign in at developer.riotgames.com to generate a dev key and register Rule One for production quotas.',
      'Connect with Riot Developer Relations via the official Riot DevRel Discord.',
    ],
  },
  riot_tft: {
    ecosystemId: 'riot',
    provider: 'Riot Games',
    apiName: 'Riot Games Developer API (TFT)',
    portalUrl: 'https://developer.riotgames.com/',
    docsUrl: 'https://developer.riotgames.com/docs/tft',
    communityUrl: 'https://discord.gg/riotgamesdevrel',
    communityLabel: 'Riot DevRel Discord',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: false,
    dataScopes: ['TFT Ranked Tiers', 'Match-V1 Placements', 'Augments & Traits', 'Set Static Data'],
    contactSteps: [
      'Register Rule One on the Riot Developer Portal and select Teamfight Tactics endpoints.',
      'Keep your API key in server-side environment variables and cache match lookups.',
      'Use Riot DevRel Discord for schema updates across new TFT sets.',
    ],
  },
  valve_steam: {
    ecosystemId: 'valve',
    provider: 'Valve (Steamworks)',
    apiName: 'Steamworks Web API & Game State Integration',
    portalUrl: 'https://steamcommunity.com/dev/apikey',
    docsUrl: 'https://partner.steamgames.com/doc/webapi_overview',
    communityUrl: 'https://partner.steamgames.com/doc/home',
    communityLabel: 'Steamworks Partner Docs',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: false,
    dataScopes: ['Steam Profiles & OpenID Login', 'CS2 Match Sharing Codes', 'Dota 2 Match History', 'Global Stats & Inventories'],
    contactSteps: [
      'Generate a Steam Web API key at steamcommunity.com/dev/apikey under your domain.',
      'Use Steam OpenID sign-in so players securely link their SteamID64 to Rule One.',
      'For CS2 match stats, collect the player’s official Match Authentication Code alongside Steam Web API.',
    ],
  },
  bungie: {
    ecosystemId: 'bungie',
    provider: 'Bungie',
    apiName: 'Bungie.net Official API',
    portalUrl: 'https://www.bungie.net/en/Application',
    docsUrl: 'https://bungie-net.github.io/multi/index.html',
    communityUrl: 'https://github.com/Bungie-net/api/issues',
    communityLabel: 'Bungie API GitHub',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: false,
    dataScopes: ['Crucible & Trials Stats', 'Weapon Loadouts & Perks', 'Clan Rosters & Weekly Progress', 'Full Item Manifest'],
    contactSteps: [
      'Create a Bungie.net Developer Application at bungie.net/en/Application to get an X-API-Key immediately.',
      'Configure OAuth 2.0 redirect URLs for authenticated loadout & inventory actions.',
      'Report API issues or coordinate with Bungie engineers on the official Bungie-net/api GitHub.',
    ],
  },
  krafton_pubg: {
    ecosystemId: 'krafton',
    provider: 'KRAFTON',
    apiName: 'PUBG Official Developer API',
    portalUrl: 'https://developer.pubg.com/',
    docsUrl: 'https://documentation.pubg.com/en/introduction.html',
    communityUrl: 'https://documentation.pubg.com/en/support.html',
    communityLabel: 'PUBG API Support',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: false,
    dataScopes: ['Ranked & Season Stats', 'Match Telemetry JSON', 'Leaderboards', 'Weapon & Survival Mastery'],
    contactSteps: [
      'Sign up at developer.pubg.com to receive a free self-serve API key (10 RPM default).',
      'Submit a rate-limit increase form on the portal once Rule One launches to live players.',
      'Use PUBG API Support channels for telemetry schema questions and commercial approval.',
    ],
  },
  blizzard: {
    ecosystemId: 'blizzard',
    provider: 'Blizzard Entertainment',
    apiName: 'Battle.net Developer API',
    portalUrl: 'https://develop.battle.net/',
    docsUrl: 'https://develop.battle.net/documentation',
    communityUrl: 'https://us.forums.blizzard.com/en/blizzard/c/api-discussion/11',
    communityLabel: 'Blizzard API Forums',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: false,
    dataScopes: ['OAuth BattleTag Login', 'WoW PvP / Mythic+ / Armory', 'StarCraft II Ladders', 'Hearthstone Cards & Metadata'],
    contactSteps: [
      'Create a client ID & secret at develop.battle.net/access/clients.',
      'Exchange OAuth client credentials on your backend for Game Data & Profile API tokens.',
      'Connect with Blizzard API engineers and devs on the official Blizzard API Discussion Forum.',
    ],
  },
  supercell_cr: {
    ecosystemId: 'supercell',
    provider: 'Supercell',
    apiName: 'Clash Royale Official API',
    portalUrl: 'https://developer.clashroyale.com/',
    docsUrl: 'https://developer.clashroyale.com/#/documentation',
    communityUrl: 'https://developer.clashroyale.com/#/getting-started',
    communityLabel: 'Supercell Dev Guide',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: false,
    dataScopes: ['Player Battle Logs', 'Clan Wars & Rosters', 'Global Leaderboards', 'Card & Tournament Data'],
    contactSteps: [
      'Register an account on developer.clashroyale.com.',
      'Create an API key bound to your backend server’s static egress IP address.',
      'Call the REST endpoints from your backend proxy with Bearer token authentication.',
    ],
  },
  supercell_bs: {
    ecosystemId: 'supercell',
    provider: 'Supercell',
    apiName: 'Brawl Stars Official API',
    portalUrl: 'https://developer.brawlstars.com/',
    docsUrl: 'https://developer.brawlstars.com/#/documentation',
    communityUrl: 'https://developer.brawlstars.com/#/getting-started',
    communityLabel: 'Supercell Dev Guide',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: false,
    dataScopes: ['Brawler Trophies & Power', 'Club Members & Rankings', 'Battle Logs', 'Event Rotation'],
    contactSteps: [
      'Create a developer account at developer.brawlstars.com.',
      'Whitelist your server’s outbound IP when creating your API key.',
      'Query player tags and club rosters via server-side HTTPS requests.',
    ],
  },
  supercell_coc: {
    ecosystemId: 'supercell',
    provider: 'Supercell',
    apiName: 'Clash of Clans Official API',
    portalUrl: 'https://developer.clashofclans.com/',
    docsUrl: 'https://developer.clashofclans.com/#/documentation',
    communityUrl: 'https://developer.clashofclans.com/#/getting-started',
    communityLabel: 'Supercell Dev Guide',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: false,
    dataScopes: ['Clan War Logs & Leagues', 'Player Profiles & Heroes', 'Capital Raids', 'Global Rankings'],
    contactSteps: [
      'Create a developer account at developer.clashofclans.com.',
      'Generate an IP-whitelisted Bearer token for your backend server.',
      'Sync clan wars and member trophies on a cached schedule.',
    ],
  },
  chess: {
    ecosystemId: 'chess',
    provider: 'Chess.com',
    apiName: 'Chess.com Published Data API (PubAPI)',
    portalUrl: 'https://www.chess.com/news/view/published-data-api',
    docsUrl: 'https://www.chess.com/news/view/published-data-api',
    communityUrl: 'https://www.chess.com/club/chess-com-developer-community',
    communityLabel: 'Chess.com Dev Club',
    accessModel: 'Public (No Key)',
    liveDemoSupported: true,
    dataScopes: ['Player Profiles & Titles', 'Rapid / Blitz / Bullet Ratings', 'Game Archives (PGN)', 'Clubs & Tournaments'],
    contactSteps: [
      'Start fetching immediately from https://api.chess.com/pub/ with zero API key needed.',
      'Include a descriptive User-Agent header with your contact email on backend requests.',
      'Join the official Chess.com Developer Community Club for announcements and support.',
    ],
  },
  osu: {
    ecosystemId: 'osu',
    provider: 'ppy (osu!)',
    apiName: 'osu! Official API v2',
    portalUrl: 'https://osu.ppy.sh/home/account/edit#oauth',
    docsUrl: 'https://osu.ppy.sh/docs/index.html',
    communityUrl: 'https://github.com/ppy/osu-web/discussions',
    communityLabel: 'osu! GitHub Discussions',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: false,
    dataScopes: ['Player PP & Global Rank', 'Beatmaps & Leaderboards', 'Recent Scores', 'Multiplayer Matches'],
    contactSteps: [
      'Open your osu! account settings under OAuth and register a new application.',
      'Use OAuth 2.0 Client Credentials for public stats or Authorization Code for user actions.',
      'Engage directly with the osu! dev team on GitHub Discussions (ppy/osu-web).',
    ],
  },
  wargaming: {
    ecosystemId: 'wargaming',
    provider: 'Wargaming',
    apiName: 'Wargaming Developer Room API',
    portalUrl: 'https://developers.wargaming.net/',
    docsUrl: 'https://developers.wargaming.net/reference/all/wot/account/list/',
    communityUrl: 'https://developers.wargaming.net/support/',
    communityLabel: 'Wargaming Dev Support',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: false,
    dataScopes: ['Tank Encyclopedia & Specs', 'Player Ratings & Battles', 'Clan Strongholds', 'Global Map Fronts'],
    contactSteps: [
      'Register an application at developers.wargaming.net to receive an application_id immediately.',
      'Use Wargaming OpenID for players who want to sync private garage stats.',
      'Reach Wargaming Developer Support directly from the Developer Room portal.',
    ],
  },
  iracing: {
    ecosystemId: 'iracing',
    provider: 'iRacing',
    apiName: 'iRacing Official Data API',
    portalUrl: 'https://members-ng.iracing.com/data/doc',
    docsUrl: 'https://forums.iracing.com/categories/data-api',
    communityUrl: 'https://forums.iracing.com/categories/data-api',
    communityLabel: 'iRacing Data API Forum',
    accessModel: 'OAuth 2.0 + Review',
    liveDemoSupported: false,
    dataScopes: ['iRating & Safety Rating', 'Series Standings', 'Session Lap Telemetry', 'League Rosters'],
    contactSteps: [
      'Use an active iRacing member account to explore endpoints at members-ng.iracing.com/data/doc.',
      'Request an OAuth client for third-party web apps through iRacing’s official Data API forum.',
      'Cache S3-signed response links per iRacing rate-limit guidelines.',
    ],
  },
  nadeo_tm: {
    ecosystemId: 'nadeo',
    provider: 'Ubisoft Nadeo',
    apiName: 'Trackmania / Nadeo Live Services API',
    portalUrl: 'https://api.trackmania.com/',
    docsUrl: 'https://webservices.openplanet.dev/',
    communityUrl: 'https://openplanet.dev/link/discord',
    communityLabel: 'Trackmania Dev Community',
    accessModel: 'OAuth 2.0 + Review',
    liveDemoSupported: false,
    dataScopes: ['Track of the Day & Campaigns', 'World Record Leaderboards', 'Club Competitions', 'Matchmaking Rank'],
    contactSteps: [
      'Register an OAuth application on api.trackmania.com for player identity & club scopes.',
      'Follow Nadeo’s documented User-Agent and rate-limit rules on webservices.openplanet.dev.',
      'Connect with Nadeo engineers and API builders via the Openplanet Discord.',
    ],
  },
  roblox: {
    ecosystemId: 'roblox',
    provider: 'Roblox Corporation',
    apiName: 'Roblox Open Cloud API',
    portalUrl: 'https://create.roblox.com/dashboard/credentials',
    docsUrl: 'https://create.roblox.com/docs/cloud',
    communityUrl: 'https://devforum.roblox.com/',
    communityLabel: 'Roblox DevForum',
    accessModel: 'Self-Serve Key',
    liveDemoSupported: false,
    dataScopes: ['OAuth 2.0 User Identity', 'Group & Clan Roles', 'Ordered DataStores / Leaderboards', 'Universe Analytics'],
    contactSteps: [
      'Create an OAuth 2.0 app or Open Cloud API key in Roblox Creator Dashboard.',
      'Request scoped permissions (user profile, groups, experience leaderboards).',
      'Connect with Roblox platform engineers on the official Roblox DevForum.',
    ],
  },
};

const ADAPTER_MODULES: Record<GameAdapterType, (isPilot: boolean) => GameSchemaModule[]> = {
  fps: (isPilot) => [
    {
      id: 'maps',
      label: 'Tactical Map Callouts & Sightlines',
      description: 'Official map pools, bomb-site control lanes, and spawn timing markers.',
      status: isPilot ? 'Active (Pilot)' : 'Adapter Ready (Evidence Pending)',
    },
    {
      id: 'loadouts',
      label: 'Weapons, Utility & Economy Meta',
      description: 'Patch-versioned loadout specs and competitive utility setups.',
      status: isPilot ? 'Active (Pilot)' : 'Adapter Ready (Evidence Pending)',
    },
    {
      id: 'ranked',
      label: 'Ranked & Esports Ruleset Tracker',
      description: 'Verified competitive pool rotations, rank tiers, and patch history.',
      status: isPilot ? 'Active (Pilot)' : 'Adapter Ready (Evidence Pending)',
    },
  ],
  battle_royale: () => [
    {
      id: 'drop_maps',
      label: 'Drop Maps & Circle Rotations',
      description: 'High-tier loot zones, vehicle spawns, and end-game positioning.',
      status: 'Adapter Ready (Evidence Pending)',
    },
    {
      id: 'telemetry',
      label: 'Match Telemetry & Weapon Mastery',
      description: 'Synced directly from official developer telemetry JSON logs.',
      status: 'Adapter Ready (Evidence Pending)',
    },
    {
      id: 'ranked_scoring',
      label: 'Ranked Scoring & Leaderboards',
      description: 'Placement point tables, kill caps, and regional ranked ladders.',
      status: 'Adapter Ready (Evidence Pending)',
    },
  ],
  moba: () => [
    {
      id: 'champions',
      label: 'Champions / Heroes & Lane Matchups',
      description: 'Live patch champion data, power spikes, and lane counter pairings.',
      status: 'Adapter Ready (Evidence Pending)',
    },
    {
      id: 'items_runes',
      label: 'Items, Runes & Skill Orders',
      description: 'Patch-versioned item spikes synced with official static data feeds.',
      status: 'Adapter Ready (Evidence Pending)',
    },
    {
      id: 'drafts',
      label: 'Pick / Ban Draft Boards',
      description: 'Blue/Red side draft priority, flex picks, and objective timers.',
      status: 'Adapter Ready (Evidence Pending)',
    },
  ],
  sports_racing: () => [
    {
      id: 'telemetry',
      label: 'Lap Telemetry & Track Records',
      description: 'Official developer session results, qualifying splits, and series standings.',
      status: 'Adapter Ready (Evidence Pending)',
    },
    {
      id: 'tracks',
      label: 'Track Guides & Braking References',
      description: 'Apex lines, tire degradation windows, and setup notes.',
      status: 'Adapter Ready (Evidence Pending)',
    },
    {
      id: 'tournaments',
      label: 'Leagues, Clubs & Ranked Seasons',
      description: 'Synced league calendars, iRating / rank divisions, and club cups.',
      status: 'Adapter Ready (Evidence Pending)',
    },
  ],
  rts_strategy: () => [
    {
      id: 'ladders',
      label: 'Official Ladders & Rating History',
      description: 'Verified MMR, ELO, PP, or clan war standings from publisher APIs.',
      status: 'Adapter Ready (Evidence Pending)',
    },
    {
      id: 'decks_factions',
      label: 'Decks, Openings & Build Orders',
      description: 'Patch-tracked meta archetypes, timings, and matchup counters.',
      status: 'Adapter Ready (Evidence Pending)',
    },
    {
      id: 'clans',
      label: 'Clan & Club Rosters',
      description: 'Synced clan war logs, club leaderboards, and match archives.',
      status: 'Adapter Ready (Evidence Pending)',
    },
  ],
};

interface RawGameRow {
  slug: string;
  name: string;
  category: GameCategory;
  adapterType: GameAdapterType;
  priority: 'pilot' | 'candidate';
  publisher: string;
  officialUrl: string;
  platforms: string[];
  aliases: string[];
  apiKey: keyof typeof DEVELOPER_APIS;
}

// Strictly curated: ONLY games with verified official developer data APIs or sanctioned telemetry pipelines (21 titles)
const RAW_GAMES: RawGameRow[] = [
  // Tactical FPS (5)
  {
    slug: 'modern-warfare-4',
    name: 'Call of Duty: Modern Warfare 4',
    category: 'Tactical FPS',
    adapterType: 'fps',
    priority: 'pilot',
    publisher: 'Activision (Infinity Ward)',
    officialUrl: 'https://www.callofduty.com',
    platforms: ['PS5', 'Xbox Series X|S', 'PC (Steam/Battle.net)', 'Nintendo Switch 2'],
    aliases: ['mw4', 'cod', 'cod 4', 'cod4', 'cod mw4', 'modern warfare', 'modern warfare 4', '2026', 'cdl', 'snd', 's&d'],
    apiKey: 'activision_mw4',
  },
  {
    slug: 'counter-strike-2',
    name: 'Counter-Strike 2',
    category: 'Tactical FPS',
    adapterType: 'fps',
    priority: 'candidate',
    publisher: 'Valve',
    officialUrl: 'https://www.counter-strike.net',
    platforms: ['PC (Steam)'],
    aliases: ['cs2', 'csgo', 'cs', 'counter strike', 'counterstrike', 'valve', 'steam'],
    apiKey: 'valve_steam',
  },
  {
    slug: 'valorant',
    name: 'VALORANT',
    category: 'Tactical FPS',
    adapterType: 'fps',
    priority: 'candidate',
    publisher: 'Riot Games',
    officialUrl: 'https://playvalorant.com',
    platforms: ['PC', 'PS5', 'Xbox Series X|S'],
    aliases: ['val', 'valo', 'valorent', 'vct', 'riot fps'],
    apiKey: 'riot_val',
  },
  {
    slug: 'destiny-2',
    name: 'Destiny 2',
    category: 'Tactical FPS',
    adapterType: 'fps',
    priority: 'candidate',
    publisher: 'Bungie',
    officialUrl: 'https://www.bungie.net',
    platforms: ['PC', 'PS5', 'Xbox Series X|S'],
    aliases: ['d2', 'destiny', 'trials', 'bungie'],
    apiKey: 'bungie',
  },
  {
    slug: 'team-fortress-2',
    name: 'Team Fortress 2',
    category: 'Tactical FPS',
    adapterType: 'fps',
    priority: 'candidate',
    publisher: 'Valve',
    officialUrl: 'https://www.teamfortress.com',
    platforms: ['PC (Steam)'],
    aliases: ['tf2', 'team fortress'],
    apiKey: 'valve_steam',
  },

  // Battle royale (1)
  {
    slug: 'pubg-battlegrounds',
    name: 'PUBG: BATTLEGROUNDS',
    category: 'Battle royale',
    adapterType: 'battle_royale',
    priority: 'candidate',
    publisher: 'KRAFTON',
    officialUrl: 'https://pubg.com',
    platforms: ['PC', 'PS5', 'Xbox Series X|S'],
    aliases: ['pubg', 'battlegrounds', 'pgc', 'krafton'],
    apiKey: 'krafton_pubg',
  },

  // MOBA (2)
  {
    slug: 'league-of-legends',
    name: 'League of Legends',
    category: 'MOBA',
    adapterType: 'moba',
    priority: 'candidate',
    publisher: 'Riot Games',
    officialUrl: 'https://www.leagueoflegends.com',
    platforms: ['PC', 'macOS'],
    aliases: ['lol', 'league', 'lck', 'lcs', 'lec', 'worlds', 'riot'],
    apiKey: 'riot_lol',
  },
  {
    slug: 'dota-2',
    name: 'Dota 2',
    category: 'MOBA',
    adapterType: 'moba',
    priority: 'candidate',
    publisher: 'Valve',
    officialUrl: 'https://www.dota2.com',
    platforms: ['PC (Steam)'],
    aliases: ['dota', 'ti', 'international', 'valve'],
    apiKey: 'valve_steam',
  },

  // Sports and racing (2)
  {
    slug: 'iracing',
    name: 'iRacing',
    category: 'Sports and racing',
    adapterType: 'sports_racing',
    priority: 'candidate',
    publisher: 'iRacing.com Motorsport Simulations',
    officialUrl: 'https://www.iracing.com',
    platforms: ['PC'],
    aliases: ['sim racing', 'ir', 'irating'],
    apiKey: 'iracing',
  },
  {
    slug: 'trackmania',
    name: 'Trackmania',
    category: 'Sports and racing',
    adapterType: 'sports_racing',
    priority: 'candidate',
    publisher: 'Ubisoft (Nadeo)',
    officialUrl: 'https://www.trackmania.com',
    platforms: ['PC', 'PS5', 'Xbox Series X|S'],
    aliases: ['tm', 'tmwt', 'nadeo'],
    apiKey: 'nadeo_tm',
  },

  // Strategy and other (11)
  {
    slug: 'chess-com',
    name: 'Chess.com',
    category: 'Strategy and other',
    adapterType: 'rts_strategy',
    priority: 'candidate',
    publisher: 'Chess.com, LLC',
    officialUrl: 'https://www.chess.com',
    platforms: ['Web', 'iOS', 'Android'],
    aliases: ['chess', 'titled tuesday', 'cct', 'elo'],
    apiKey: 'chess',
  },
  {
    slug: 'teamfight-tactics',
    name: 'Teamfight Tactics',
    category: 'Strategy and other',
    adapterType: 'rts_strategy',
    priority: 'candidate',
    publisher: 'Riot Games',
    officialUrl: 'https://teamfighttactics.leagueoflegends.com',
    platforms: ['PC', 'macOS', 'iOS', 'Android'],
    aliases: ['tft', 'autobattler'],
    apiKey: 'riot_tft',
  },
  {
    slug: 'world-of-warcraft',
    name: 'World of Warcraft',
    category: 'Strategy and other',
    adapterType: 'rts_strategy',
    priority: 'candidate',
    publisher: 'Blizzard Entertainment',
    officialUrl: 'https://worldofwarcraft.blizzard.com',
    platforms: ['PC', 'macOS'],
    aliases: ['wow', 'awc', 'mdi', 'rwf', 'blizzard'],
    apiKey: 'blizzard',
  },
  {
    slug: 'starcraft-ii',
    name: 'StarCraft II',
    category: 'Strategy and other',
    adapterType: 'rts_strategy',
    priority: 'candidate',
    publisher: 'Blizzard Entertainment',
    officialUrl: 'https://starcraft2.blizzard.com',
    platforms: ['PC', 'macOS'],
    aliases: ['sc2', 'starcraft', 'gsl', 'rts'],
    apiKey: 'blizzard',
  },
  {
    slug: 'hearthstone',
    name: 'Hearthstone',
    category: 'Strategy and other',
    adapterType: 'rts_strategy',
    priority: 'candidate',
    publisher: 'Blizzard Entertainment',
    officialUrl: 'https://hearthstone.blizzard.com',
    platforms: ['PC', 'macOS', 'iOS', 'Android'],
    aliases: ['hs', 'card game'],
    apiKey: 'blizzard',
  },
  {
    slug: 'clash-royale',
    name: 'Clash Royale',
    category: 'Strategy and other',
    adapterType: 'rts_strategy',
    priority: 'candidate',
    publisher: 'Supercell',
    officialUrl: 'https://supercell.com/en/games/clashroyale/',
    platforms: ['iOS', 'Android'],
    aliases: ['cr', 'crl', 'supercell'],
    apiKey: 'supercell_cr',
  },
  {
    slug: 'brawl-stars',
    name: 'Brawl Stars',
    category: 'Strategy and other',
    adapterType: 'rts_strategy',
    priority: 'candidate',
    publisher: 'Supercell',
    officialUrl: 'https://supercell.com/en/games/brawlstars/',
    platforms: ['iOS', 'Android'],
    aliases: ['bs', 'bsc', 'supercell'],
    apiKey: 'supercell_bs',
  },
  {
    slug: 'clash-of-clans',
    name: 'Clash of Clans',
    category: 'Strategy and other',
    adapterType: 'rts_strategy',
    priority: 'candidate',
    publisher: 'Supercell',
    officialUrl: 'https://supercell.com/en/games/clashofclans/',
    platforms: ['iOS', 'Android'],
    aliases: ['coc', 'clash', 'supercell'],
    apiKey: 'supercell_coc',
  },
  {
    slug: 'osu',
    name: 'osu!',
    category: 'Strategy and other',
    adapterType: 'rts_strategy',
    priority: 'candidate',
    publisher: 'ppy Pty Ltd (Dean Herbert)',
    officialUrl: 'https://osu.ppy.sh',
    platforms: ['PC', 'macOS', 'Linux', 'Mobile'],
    aliases: ['owc', 'rhythm', 'ppy'],
    apiKey: 'osu',
  },
  {
    slug: 'world-of-tanks',
    name: 'World of Tanks',
    category: 'Strategy and other',
    adapterType: 'rts_strategy',
    priority: 'candidate',
    publisher: 'Wargaming',
    officialUrl: 'https://worldoftanks.com',
    platforms: ['PC', 'Console'],
    aliases: ['wot', 'wargaming'],
    apiKey: 'wargaming',
  },
  {
    slug: 'roblox',
    name: 'Roblox',
    category: 'Strategy and other',
    adapterType: 'rts_strategy',
    priority: 'candidate',
    publisher: 'Roblox Corporation',
    officialUrl: 'https://www.roblox.com',
    platforms: ['PC', 'PS5', 'Xbox', 'Mobile'],
    aliases: ['rblx', 'open cloud'],
    apiKey: 'roblox',
  },
];

export const GAME_CATEGORIES: GameCategory[] = [
  'Tactical FPS',
  'Battle royale',
  'MOBA',
  'Sports and racing',
  'Strategy and other',
];

export const GAME_CATALOG: GameCatalogEntry[] = RAW_GAMES.map((row) => {
  const verified = VERIFIED_IMAGE_MAP[row.name];
  const isPilot = row.priority === 'pilot';
  const developerApi = DEVELOPER_APIS[row.apiKey];
  return {
    slug: row.slug,
    name: row.name,
    shortTitle: SHORT_TITLES[row.name] || row.name,
    category: row.category,
    adapterType: row.adapterType,
    priority: row.priority,
    publisher: row.publisher,
    officialUrl: row.officialUrl,
    platforms: row.platforms,
    aliases: row.aliases,
    developerApi,
    imageUrl: verified?.imageUrl || '',
    posterUrl: verified?.posterUrl || verified?.imageUrl || '',
    imageSource: verified?.imageSource || 'Local SVG Fallback',
    imageFit: CONTAIN_FIT_GAMES.has(row.name) ? 'contain' : 'cover',
    posterFit: POSTER_CONTAIN_GAMES.has(row.name) ? 'contain' : 'cover',
    steamAppId: verified?.steamAppId,
    artStatus: 'permission_pending_editorial_preview',
    artBrief: `Original abstract ${row.category} esports visual, black and gold, no publisher logos or imitated characters; title typography separate`,
    altText: `${row.name} official storefront visual (${row.publisher})`,
    rightsOwner: row.publisher,
    permissionScope:
      'Editorial catalog preview via public storefront CDN; commercial redistribution permission pending publisher approval.',
    verificationStatus: `Official developer API verified (${developerApi.apiName}) — ${developerApi.accessModel}`,
    verifiedCheckedDate: '2026-11-27',
    indexable: true,
    schemaModules: ADAPTER_MODULES[row.adapterType](isPilot),
  };
});

export interface DeveloperEcosystemSummary {
  ecosystemId: string;
  provider: string;
  apiName: string;
  portalUrl: string;
  docsUrl: string;
  communityUrl: string;
  communityLabel: string;
  accessModel: DeveloperApiAccessModel;
  liveDemoSupported: boolean;
  dataScopes: string[];
  contactSteps: string[];
  games: GameCatalogEntry[];
}

export const DEVELOPER_ECOSYSTEMS: DeveloperEcosystemSummary[] = (() => {
  const map = new Map<string, DeveloperEcosystemSummary>();
  for (const game of GAME_CATALOG) {
    const api = game.developerApi;
    const existing = map.get(api.ecosystemId);
    if (existing) {
      existing.games.push(game);
      if (api.liveDemoSupported) existing.liveDemoSupported = true;
      for (const scope of api.dataScopes) {
        if (!existing.dataScopes.includes(scope)) {
          existing.dataScopes.push(scope);
        }
      }
    } else {
      map.set(api.ecosystemId, {
        ecosystemId: api.ecosystemId,
        provider: api.provider,
        apiName: api.apiName,
        portalUrl: api.portalUrl,
        docsUrl: api.docsUrl,
        communityUrl: api.communityUrl,
        communityLabel: api.communityLabel,
        accessModel: api.accessModel,
        liveDemoSupported: api.liveDemoSupported,
        dataScopes: [...api.dataScopes],
        contactSteps: [...api.contactSteps],
        games: [game],
      });
    }
  }
  return Array.from(map.values());
})();

export function getGameBySlug(slug: string): GameCatalogEntry | undefined {
  return GAME_CATALOG.find((g) => g.slug === slug);
}
