import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  Calendar,
  Crosshair,
  Gamepad2,
  Headphones,
  Home,
  Map as MapIcon,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  ShieldCheck,
  Trophy,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { ClanOperationsView } from './components/ClanOperationsView';
import { CoFounderRecord } from './components/CoFounderAccessPanel';
import {
  AccessibilitySettings,
  EventsView,
  NotificationPreferences,
  RecruitmentView,
  SavedView,
  SettingsView,
  StatisticsView,
} from './components/CommandCenterViews';
import {
  EquipmentCenterView,
  GamingNewsView,
  NotificationsCenterView,
  StrategyLibraryView,
} from './components/DirectiveViews';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  GameDirectoryView,
  RecentlyViewedItem,
  UserGamingPreferences,
} from './components/GameDirectoryView';
import { Header } from './components/Header';
import { Mw4PilotHubView, Mw4SubSection } from './components/Mw4PilotHubView';
import { OpsRegistryView } from './components/OpsRegistryView';
import { GAME_CATALOG, getGameBySlug } from './data/gameCatalog';
import { INITIAL_CLUB_STATE } from './data/mw4CdlData';
import { SavedPlaybook } from './data/sndMaps';
import {
  BOOTSTRAPPED_COFOUNDER_EMAIL,
  CLUB_DOC_ID,
  OperationType,
  PRIMARY_FOUNDER_EMAIL,
  auth,
  db,
  emailToSafeId,
  handleFirestoreError,
  signInWithGoogle,
  signOutAccount,
} from './lib/firebase';
import {
  AggregateFunnelMetrics,
  applyRouteSeo,
  getAggregateFunnelMetrics,
  recordAggregateEvent,
} from './lib/seo';
import { AppTab, ClubState, InterfaceMode, Mw4MapId } from './types';

const STORAGE_PLAYS_KEY = 'rule_one_mw4_snd_playbooks_v1';
const STORAGE_PREFS_KEY = 'rule_one_user_gaming_prefs_v4';
const STORAGE_RECENT_KEY = 'rule_one_recently_viewed_v1';
const STORAGE_EVENTS_KEY = 'rule_one_saved_events_v1';
const STORAGE_A11Y_KEY = 'rule_one_accessibility_v1';
const STORAGE_NOTIF_KEY = 'rule_one_notifications_v1';
const STORAGE_MODE_KEY = 'rule_one_interface_mode_v1';

const DEFAULT_PREFERENCES: UserGamingPreferences = {
  favoriteGameSlugs: ['modern-warfare-4', 'counter-strike-2', 'valorant'],
  platforms: ['PC', 'PS5'],
  experience: 'Competitive',
  preferredModes: ['Search & Destroy', 'Ranked Play'],
};

const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  largeText: false,
  highContrast: false,
  reducedMotion: false,
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  patchAlertsOptIn: false,
  weeklyClanSummaryOptIn: false,
  scrimRemindersOptIn: false,
};

const DEFAULT_COFOUNDERS: CoFounderRecord[] = [
  {
    id: emailToSafeId(BOOTSTRAPPED_COFOUNDER_EMAIL),
    email: BOOTSTRAPPED_COFOUNDER_EMAIL,
    displayName: 'FPSxFUBARxGSG',
    role: 'cofounder',
    addedByEmail: PRIMARY_FOUNDER_EMAIL,
  },
];

type SidebarWindowId =
  | 'home'
  | 'games'
  | 'meta_lab'
  | 'maps'
  | 'strategies'
  | 'ranked'
  | 'clan_hq'
  | 'recruitment'
  | 'tournaments'
  | 'statistics'
  | 'news'
  | 'equipment'
  | 'saved'
  | 'notifications'
  | 'settings';

const SIDEBAR_ITEMS: {
  id: SidebarWindowId;
  label: string;
  path: string;
  icon: typeof Home;
}[] = [
  { id: 'home', label: 'Home', path: '/', icon: Home },
  { id: 'games', label: 'Games', path: '/games', icon: Gamepad2 },
  { id: 'meta_lab', label: 'Meta Lab', path: '/meta', icon: Crosshair },
  { id: 'maps', label: 'Tactical Maps', path: '/maps', icon: MapIcon },
  { id: 'strategies', label: 'Strategy Library', path: '/strategies', icon: BookOpen },
  { id: 'ranked', label: 'Ranked Center', path: '/ranked', icon: Trophy },
  { id: 'clan_hq', label: 'Clan HQ', path: '/clans/rule-one', icon: Shield },
  { id: 'recruitment', label: 'Recruitment', path: '/recruitment', icon: Users },
  { id: 'tournaments', label: 'Tournaments', path: '/tournaments', icon: Calendar },
  { id: 'statistics', label: 'Player Statistics', path: '/statistics', icon: BarChart3 },
  { id: 'news', label: 'Gaming News', path: '/news', icon: Newspaper },
  { id: 'equipment', label: 'Equipment', path: '/equipment', icon: Headphones },
  { id: 'saved', label: 'Saved Content', path: '/saved', icon: Bookmark },
  { id: 'notifications', label: 'Notifications', path: '/notifications', icon: Bell },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];

function nowStamp(): string {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatTimestamp(ts: unknown): string {
  if (ts instanceof Timestamp) {
    return ts.toDate().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  return nowStamp();
}

function timestampToMillis(ts: unknown): number {
  if (ts instanceof Timestamp) {
    return ts.toMillis();
  }
  return 0;
}

function sanitizeDocId(raw: string, fallbackPrefix: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned.length > 0 ? cleaned : `${fallbackPrefix}_${Date.now()}`;
}

function loadInitialPlaybooks(): SavedPlaybook[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_PLAYS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadInitialPreferences(): UserGamingPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<UserGamingPreferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      favoriteGameSlugs:
        Array.isArray(parsed.favoriteGameSlugs) && parsed.favoriteGameSlugs.length > 0
          ? parsed.favoriteGameSlugs
          : DEFAULT_PREFERENCES.favoriteGameSlugs,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function loadInitialRecent(): RecentlyViewedItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadInitialSavedEvents(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_EVENTS_KEY);
    if (!raw) return ['cdl-2027-kickoff'];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return ['cdl-2027-kickoff'];
  }
}

function loadInitialAccessibility(): AccessibilitySettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_A11Y_KEY);
    if (!raw) return DEFAULT_ACCESSIBILITY;
    return { ...DEFAULT_ACCESSIBILITY, ...(JSON.parse(raw) as Partial<AccessibilitySettings>) };
  } catch {
    return DEFAULT_ACCESSIBILITY;
  }
}

function loadInitialNotifications(): NotificationPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_NOTIF_KEY);
    if (!raw) return DEFAULT_NOTIFICATIONS;
    return { ...DEFAULT_NOTIFICATIONS, ...(JSON.parse(raw) as Partial<NotificationPreferences>) };
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

function loadInitialInterfaceMode(): InterfaceMode {
  try {
    const raw = window.localStorage.getItem(STORAGE_MODE_KEY);
    return raw === 'professional' ? 'professional' : 'standard';
  } catch {
    return 'standard';
  }
}

interface ParsedRoute {
  tab: AppTab;
  path: string;
  gameSlug?: string;
  mw4SubSection?: Mw4SubSection;
  mapSlug?: string;
  buildSlug?: string;
  patchSlug?: string;
  clanSlug?: string;
  playerSlug?: string;
}

function parseAppRoute(pathname: string): ParsedRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const parts = clean.split('/').filter(Boolean);

  if (parts.length === 0) {
    return { tab: 'games', path: '/' };
  }

  if (parts[0] === 'ops' || parts[0] === 'admin') {
    return { tab: 'ops', path: parts[0] === 'admin' ? '/admin' : '/ops' };
  }

  if (parts[0] === 'developers') {
    return { tab: 'developers', path: '/developers' };
  }

  if (parts[0] === 'statistics') {
    return { tab: 'statistics', path: '/statistics' };
  }

  if (parts[0] === 'strategies') {
    return { tab: 'strategies', path: '/strategies' };
  }

  if (parts[0] === 'news') {
    return { tab: 'news', path: '/news' };
  }

  if (parts[0] === 'equipment') {
    return { tab: 'equipment', path: '/equipment' };
  }

  if (parts[0] === 'notifications') {
    return { tab: 'notifications', path: '/notifications' };
  }

  if (parts[0] === 'recruitment') {
    return { tab: 'recruitment', path: '/recruitment' };
  }

  if (parts[0] === 'events' || parts[0] === 'tournaments') {
    return { tab: 'events', path: parts[0] === 'tournaments' ? '/tournaments' : '/events' };
  }

  if (parts[0] === 'saved') {
    return { tab: 'saved', path: '/saved' };
  }

  if (parts[0] === 'settings') {
    return { tab: 'settings', path: '/settings' };
  }

  if (parts[0] === 'meta') {
    return {
      tab: 'mw4_pilot',
      path: '/meta',
      gameSlug: 'modern-warfare-4',
      mw4SubSection: 'builds',
      buildSlug: 'm4-vel46-hypothesis',
    };
  }

  if (parts[0] === 'maps') {
    return {
      tab: 'mw4_pilot',
      path: '/maps',
      gameSlug: 'modern-warfare-4',
      mw4SubSection: 'maps',
      mapSlug: 'coal',
    };
  }

  if (parts[0] === 'ranked') {
    return {
      tab: 'mw4_pilot',
      path: '/ranked',
      gameSlug: 'modern-warfare-4',
      mw4SubSection: 'ranked',
    };
  }

  if (parts[0] === 'clans') {
    return { tab: 'clan_hq', path: clean, clanSlug: parts[1] || 'rule-one' };
  }

  if (parts[0] === 'players') {
    return { tab: 'clan_hq', path: clean, playerSlug: parts[1] || 'jason-vaughn' };
  }

  if (parts[0] === 'games') {
    if (parts.length === 1) {
      return { tab: 'catalog', path: '/games' };
    }
    const slug = parts[1] || 'modern-warfare-4';
    if (slug === 'modern-warfare-4' || slug === 'call-of-duty') {
      const sub = parts[2];
      if (sub === 'builds') {
        return {
          tab: 'mw4_pilot',
          path: clean,
          gameSlug: 'modern-warfare-4',
          mw4SubSection: 'builds',
          buildSlug: parts[3] || 'm4-vel46-hypothesis',
        };
      }
      if (sub === 'patches') {
        return {
          tab: 'mw4_pilot',
          path: clean,
          gameSlug: 'modern-warfare-4',
          mw4SubSection: 'patches',
          patchSlug: parts[3] || 'season-1-launch',
        };
      }
      if (sub === 'ranked') {
        return {
          tab: 'mw4_pilot',
          path: clean,
          gameSlug: 'modern-warfare-4',
          mw4SubSection: 'ranked',
        };
      }
      return {
        tab: 'mw4_pilot',
        path: clean,
        gameSlug: 'modern-warfare-4',
        mw4SubSection: 'maps',
        mapSlug: parts[3] || 'coal',
      };
    }

    return {
      tab: 'games',
      path: clean,
      gameSlug: slug,
    };
  }

  return { tab: 'games', path: '/' };
}

function getActiveSidebarId(route: ParsedRoute): SidebarWindowId {
  if (route.tab === 'catalog' || (route.tab === 'games' && Boolean(route.gameSlug))) return 'games';
  if (route.tab === 'mw4_pilot') {
    if (route.mw4SubSection === 'builds' || route.mw4SubSection === 'patches') return 'meta_lab';
    if (route.mw4SubSection === 'ranked') return 'ranked';
    return 'maps';
  }
  if (route.tab === 'strategies') return 'strategies';
  if (route.tab === 'clan_hq') return 'clan_hq';
  if (route.tab === 'recruitment') return 'recruitment';
  if (route.tab === 'events') return 'tournaments';
  if (route.tab === 'statistics' || route.tab === 'developers') return 'statistics';
  if (route.tab === 'news') return 'news';
  if (route.tab === 'equipment') return 'equipment';
  if (route.tab === 'saved') return 'saved';
  if (route.tab === 'notifications') return 'notifications';
  if (route.tab === 'settings' || route.tab === 'ops') return 'settings';
  return 'home';
}

function RuleOneApp() {
  const [routePath, setRoutePath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [interfaceMode, setInterfaceMode] = useState<InterfaceMode>(loadInitialInterfaceMode);
  const [preferences, setPreferences] = useState<UserGamingPreferences>(loadInitialPreferences);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(loadInitialRecent);
  const [savedPlaybooks, setSavedPlaybooks] = useState<SavedPlaybook[]>(loadInitialPlaybooks);
  const [savedEventIds, setSavedEventIds] = useState<string[]>(loadInitialSavedEvents);
  const [accessibility, setAccessibility] =
    useState<AccessibilitySettings>(loadInitialAccessibility);
  const [notifications, setNotifications] =
    useState<NotificationPreferences>(loadInitialNotifications);
  const [useSvgFallbackMode, setUseSvgFallbackMode] = useState<boolean>(false);
  const [funnelMetrics, setFunnelMetrics] = useState<AggregateFunnelMetrics>(
    getAggregateFunnelMetrics
  );

  // Preserved local club state for MapControlView compatibility (zero gambling UI exposed)
  const [clubState] = useState<ClubState>(INITIAL_CLUB_STATE);

  // Firebase Auth & Co-Founder RBAC State (Preserved live cloud sync for playbooks & co-founders)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState<boolean>(false);
  const [cloudSynced, setCloudSynced] = useState<boolean>(false);
  const [cofounders, setCofounders] = useState<CoFounderRecord[]>(DEFAULT_COFOUNDERS);
  const [cofounderEmails, setCofounderEmails] = useState<string[]>([
    BOOTSTRAPPED_COFOUNDER_EMAIL,
  ]);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const parsedRoute = useMemo(() => parseAppRoute(routePath), [routePath]);
  const activeSidebarId = useMemo(() => getActiveSidebarId(parsedRoute), [parsedRoute]);

  // Listen to browser back/forward navigation & Escape key for mobile drawer
  useEffect(() => {
    const onPopState = () => {
      setRoutePath(window.location.pathname || '/');
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Apply accessibility settings onto root html element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('r1-large-text', accessibility.largeText);
    root.classList.toggle('r1-high-contrast', accessibility.highContrast);
    root.classList.toggle('r1-reduced-motion', accessibility.reducedMotion);
    try {
      window.localStorage.setItem(STORAGE_A11Y_KEY, JSON.stringify(accessibility));
    } catch {
      // Ignore storage restrictions
    }
  }, [accessibility]);

  // Persist user preferences, recently viewed, saved events, notifications, and local playbooks
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(preferences));
    } catch {
      // Ignore storage restrictions
    }
  }, [preferences]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(recentlyViewed));
    } catch {
      // Ignore storage restrictions
    }
  }, [recentlyViewed]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_PLAYS_KEY, JSON.stringify(savedPlaybooks));
    } catch {
      // Ignore storage restrictions
    }
  }, [savedPlaybooks]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(savedEventIds));
    } catch {
      // Ignore storage restrictions
    }
  }, [savedEventIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(notifications));
    } catch {
      // Ignore storage restrictions
    }
  }, [notifications]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_MODE_KEY, interfaceMode);
    } catch {
      // Ignore storage restrictions
    }
  }, [interfaceMode]);

  // Apply dynamic route-level SEO, canonical, robots noindex gates, and JSON-LD
  useEffect(() => {
    const mw4 = getGameBySlug('modern-warfare-4');

    if (parsedRoute.tab === 'developers' || parsedRoute.tab === 'statistics') {
      applyRouteSeo({
        title: 'Statistics & Developer APIs — Rule One',
        description:
          'Official game developer portals, live public API testing (Chess.com & Riot Data Dragon), MW4 4-track pipeline, and self-reported match logging.',
        path: parsedRoute.path,
        indexable: true,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Statistics & APIs', path: parsedRoute.path },
        ],
      });
      return;
    }

    if (parsedRoute.tab === 'recruitment') {
      applyRouteSeo({
        title: 'Recruitment — Find Clans & Teammates — Rule One',
        description:
          'Browse competitive clan listings, opt-in public player profiles, and draft tryout applications on Rule One.',
        path: '/recruitment',
        indexable: true,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Recruitment', path: '/recruitment' },
        ],
      });
      return;
    }

    if (parsedRoute.tab === 'events') {
      applyRouteSeo({
        title: 'Events & Tournament Directory — Rule One',
        description:
          'Track official competitive esports circuits including CDL, VCT, CS2 Majors, LoL Esports, and Chess.com Titled Tuesday.',
        path: '/events',
        indexable: true,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Events', path: '/events' },
        ],
      });
      return;
    }

    if (parsedRoute.tab === 'saved') {
      applyRouteSeo({
        title: 'Saved Library — Rule One',
        description: 'Pinned games, saved tactical S&D playbooks, builds, and bookmarked events.',
        path: '/saved',
        indexable: false,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Saved', path: '/saved' },
        ],
      });
      return;
    }

    if (parsedRoute.tab === 'settings') {
      applyRouteSeo({
        title: 'Settings & Accessibility — Rule One',
        description:
          'Accessibility controls, local privacy and data deletion, opt-in notifications, and billing transparency.',
        path: '/settings',
        indexable: false,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Settings', path: '/settings' },
        ],
      });
      return;
    }

    if (parsedRoute.tab === 'strategies') {
      applyRouteSeo({
        title: 'Strategy Library & Competitive Playbooks — Rule One',
        description:
          'Filterable competitive strategy templates (Hardpoint setups, rotations, retakes, S&D plans, and Bo5 map veto prep) and saved clan playbooks.',
        path: '/strategies',
        indexable: true,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Strategy Library', path: '/strategies' },
        ],
      });
      return;
    }

    if (parsedRoute.tab === 'news') {
      applyRouteSeo({
        title: 'Gaming News & Verified Patch Intel — Rule One',
        description:
          'Official publisher patch updates, CDL kickoff watches, LoL Esports Open Access, CS2 VRS, and VALORANT API announcements.',
        path: '/news',
        indexable: true,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Gaming News', path: '/news' },
        ],
      });
      return;
    }

    if (parsedRoute.tab === 'equipment') {
      applyRouteSeo({
        title: 'Equipment & Competitive Gear Guide — Rule One',
        description:
          'Objective competitive gear criteria for monitors, controllers, mice, keyboards, headsets, capture cards, and wired networking.',
        path: '/equipment',
        indexable: true,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Equipment', path: '/equipment' },
        ],
      });
      return;
    }

    if (parsedRoute.tab === 'notifications') {
      applyRouteSeo({
        title: 'Notifications Center — Rule One',
        description: 'Opt-in competitive patch diffs, tournament reminders, and workspace status.',
        path: '/notifications',
        indexable: false,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Notifications', path: '/notifications' },
        ],
      });
      return;
    }

    if (parsedRoute.tab === 'ops') {
      applyRouteSeo({
        title: 'Rule One — Owner Administration Dashboard & Transparency Console',
        description:
          'Measured local telemetry, source provenance registry, asset rights manifest, disabled partner adapters, and correction log.',
        path: parsedRoute.path,
        indexable: false,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Admin & Rights', path: parsedRoute.path },
        ],
      });
      return;
    }

    if (parsedRoute.playerSlug) {
      applyRouteSeo({
        title: `${parsedRoute.playerSlug} — Rule One Public Player Profile`,
        description:
          'Opt-in public competitive player profile on Rule One with explicit field allowlist and self-reported stat transparency.',
        path: parsedRoute.path,
        indexable: true,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Clan HQ', path: '/clans/rule-one' },
          { name: parsedRoute.playerSlug, path: parsedRoute.path },
        ],
      });
      return;
    }

    if (parsedRoute.clanSlug) {
      applyRouteSeo({
        title: 'Rule One Clan HQ — Competitive Roster, Scrims & Veto Operations',
        description:
          'Competitive Clan HQ for Call of Duty: Modern Warfare 4 with role-scoped access, mutual scrim scheduling, VOD logs, and map veto planning.',
        path: parsedRoute.path,
        indexable: true,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Clan HQ', path: parsedRoute.path },
        ],
      });
      return;
    }

    if (parsedRoute.tab === 'mw4_pilot') {
      const subLabel =
        parsedRoute.mw4SubSection === 'builds'
          ? 'Meta Lab & Build Validator'
          : parsedRoute.mw4SubSection === 'patches'
          ? 'Patch Diffs & Review Queue'
          : parsedRoute.mw4SubSection === 'ranked'
          ? 'Ranked & CDL Ruleset Status'
          : 'Tactical S&D Map Control';
      applyRouteSeo({
        title: `MW4 ${subLabel} — Rule One Competitive Hub`,
        description:
          'Call of Duty: Modern Warfare 4 (2026) tactical S&D map control, 12 launch 6v6 maps, weapon build validator, and official patch diffs.',
        path: parsedRoute.path,
        indexable: true,
        ogImage: mw4?.imageUrl,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Modern Warfare 4', path: '/games/modern-warfare-4' },
          { name: subLabel, path: parsedRoute.path },
        ],
        article: {
          headline: `Call of Duty: Modern Warfare 4 — ${subLabel}`,
          dateModified: '2026-11-27',
          authorName: 'Rule One Editorial Desk',
        },
      });
      return;
    }

    if (parsedRoute.tab === 'catalog') {
      applyRouteSeo({
        title: `All ${GAME_CATALOG.length} Developer-Connected Games — Rule One`,
        description: `Browse all ${GAME_CATALOG.length} developer-API connected competitive esports games tracked on Rule One and pin your favorites.`,
        path: '/games',
        indexable: true,
        ogImage: mw4?.imageUrl,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Games', path: '/games' },
        ],
      });
      return;
    }

    if (parsedRoute.gameSlug) {
      const game = getGameBySlug(parsedRoute.gameSlug);
      if (game) {
        applyRouteSeo({
          title: `${game.name} Competitive Hub — Rule One`,
          description: `${game.name} (${game.category}, ${game.publisher}) competitive adapter hub on Rule One.`,
          path: `/games/${game.slug}`,
          indexable: game.indexable,
          ogImage: game.imageUrl,
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Games', path: '/games' },
            { name: game.name, path: `/games/${game.slug}` },
          ],
        });
        return;
      }
    }

    applyRouteSeo({
      title: 'Rule One — Competitive Command Center & Developer-Connected Esports Hub',
      description:
        'Personalized competitive gaming command center featuring Call of Duty: Modern Warfare 4 tactical maps, build validation, Clan HQ, and 21 developer-connected games.',
      path: '/',
      indexable: true,
      ogImage: mw4?.imageUrl,
      breadcrumbs: [{ name: 'Home', path: '/' }],
    });
  }, [parsedRoute]);

  const navigatePath = useCallback((nextPath: string, label?: string) => {
    const clean = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
    if (window.location.pathname !== clean) {
      window.history.pushState({}, '', clean);
    }
    setRoutePath(clean);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setFunnelMetrics(
      recordAggregateEvent(
        clean.includes('/maps') ? 'activatedTacticalSessions' : 'hubViews'
      )
    );

    if (label && clean !== '/') {
      setRecentlyViewed((prev) => [
        { path: clean, label, viewedAt: nowStamp() },
        ...prev.filter((item) => item.path !== clean).slice(0, 5),
      ]);
    }
  }, []);

  const handleSelectHeaderTab = useCallback(
    (tab: AppTab) => {
      if (tab === 'games') navigatePath('/', 'Home');
      else if (tab === 'catalog') navigatePath('/games', 'Games');
      else if (tab === 'developers') navigatePath('/developers', 'Developer Connect');
      else if (tab === 'mw4_pilot') navigatePath('/maps', 'Tactical Maps');
      else if (tab === 'strategies') navigatePath('/strategies', 'Strategy Library');
      else if (tab === 'clan_hq') navigatePath('/clans/rule-one', 'Clan HQ');
      else if (tab === 'recruitment') navigatePath('/recruitment', 'Recruitment');
      else if (tab === 'events') navigatePath('/tournaments', 'Tournaments');
      else if (tab === 'statistics') navigatePath('/statistics', 'Player Statistics');
      else if (tab === 'news') navigatePath('/news', 'Gaming News');
      else if (tab === 'equipment') navigatePath('/equipment', 'Equipment');
      else if (tab === 'saved') navigatePath('/saved', 'Saved Content');
      else if (tab === 'notifications') navigatePath('/notifications', 'Notifications');
      else if (tab === 'settings') navigatePath('/settings', 'Settings');
      else if (tab === 'ops') navigatePath('/admin', 'Admin Dashboard');
    },
    [navigatePath]
  );

  const handleToggleFavoriteGame = useCallback((slug: string) => {
    setPreferences((prev) => {
      const exists = prev.favoriteGameSlugs.includes(slug);
      const next = exists
        ? prev.favoriteGameSlugs.filter((s) => s !== slug)
        : [slug, ...prev.favoriteGameSlugs];
      return {
        ...prev,
        favoriteGameSlugs: next.length > 0 ? next : ['modern-warfare-4'],
      };
    });
  }, []);

  const handleToggleSaveEvent = useCallback((id: string) => {
    setSavedEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev]
    );
  }, []);

  const handleClearLocalData = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_PREFS_KEY);
      window.localStorage.removeItem(STORAGE_RECENT_KEY);
      window.localStorage.removeItem(STORAGE_EVENTS_KEY);
      window.localStorage.removeItem(STORAGE_A11Y_KEY);
      window.localStorage.removeItem(STORAGE_NOTIF_KEY);
      window.localStorage.removeItem('rule_one_recruitment_apps_v1');
      window.localStorage.removeItem('rule_one_self_reported_matches_v1');
    } catch {
      // Ignore storage errors
    }
    setPreferences(DEFAULT_PREFERENCES);
    setRecentlyViewed([]);
    setSavedEventIds([]);
    setAccessibility(DEFAULT_ACCESSIBILITY);
    setNotifications(DEFAULT_NOTIFICATIONS);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubAuth();
  }, []);

  // Bootstrap `/clubs/rule_one` & attach real-time Firestore listeners for Co-Founders & Playbooks
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser || !currentUser.email || !currentUser.emailVerified) {
      setIsAuthorizedAdmin(false);
      setCloudSynced(false);
      setCofounders(DEFAULT_COFOUNDERS);
      setCofounderEmails([BOOTSTRAPPED_COFOUNDER_EMAIL]);
      return;
    }

    const userEmail = currentUser.email.toLowerCase();
    const clubPath = `clubs/${CLUB_DOC_ID}`;
    const clubRef = doc(db, 'clubs', CLUB_DOC_ID);
    let cancelled = false;
    const unsubscribers: Array<() => void> = [];

    const connectWorkspace = async () => {
      try {
        let clubSnap = await getDoc(clubRef);
        if (cancelled) return;

        if (!clubSnap.exists()) {
          const canBootstrap =
            userEmail === PRIMARY_FOUNDER_EMAIL ||
            userEmail === BOOTSTRAPPED_COFOUNDER_EMAIL;
          if (!canBootstrap) {
            setIsAuthorizedAdmin(false);
            setCloudSynced(false);
            return;
          }

          try {
            await setDoc(clubRef, {
              name: 'Rule One',
              ownerUid: currentUser.uid,
              ownerEmail: PRIMARY_FOUNDER_EMAIL,
              cofounderEmails: [BOOTSTRAPPED_COFOUNDER_EMAIL],
              treasury: INITIAL_CLUB_STATE.treasury,
              offshoreReserve: INITIAL_CLUB_STATE.offshoreReserve,
              wins: INITIAL_CLUB_STATE.wins,
              losses: INITIAL_CLUB_STATE.losses,
              streak: INITIAL_CLUB_STATE.streak,
              bestStreak: INITIAL_CLUB_STATE.bestStreak,
              activeLoadoutId: INITIAL_CLUB_STATE.activeLoadoutId,
              ownedRigIds: INITIAL_CLUB_STATE.ownedRigIds,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (createErr) {
            handleFirestoreError(createErr, OperationType.CREATE, clubPath);
          }

          const cofounderId = emailToSafeId(BOOTSTRAPPED_COFOUNDER_EMAIL);
          const cofounderPath = `clubs/${CLUB_DOC_ID}/cofounders/${cofounderId}`;
          try {
            await setDoc(doc(db, 'clubs', CLUB_DOC_ID, 'cofounders', cofounderId), {
              clubId: CLUB_DOC_ID,
              email: BOOTSTRAPPED_COFOUNDER_EMAIL,
              displayName: 'FPSxFUBARxGSG',
              role: 'cofounder',
              addedByUid: currentUser.uid,
              addedByEmail: userEmail,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (seedErr) {
            handleFirestoreError(seedErr, OperationType.CREATE, cofounderPath);
          }

          clubSnap = await getDoc(clubRef);
          if (cancelled) return;
        }

        const clubData = clubSnap.data();
        const emails: string[] = Array.isArray(clubData?.cofounderEmails)
          ? clubData.cofounderEmails.filter((e): e is string => typeof e === 'string')
          : [];

        const authorized =
          userEmail === PRIMARY_FOUNDER_EMAIL ||
          clubData?.ownerEmail === userEmail ||
          emails.includes(userEmail);

        if (!authorized) {
          setIsAuthorizedAdmin(false);
          setCloudSynced(false);
          return;
        }

        setIsAuthorizedAdmin(true);
        setCloudSynced(true);

        unsubscribers.push(
          onSnapshot(
            clubRef,
            (snap) => {
              const data = snap.data();
              if (!data) return;
              const nextEmails = Array.isArray(data.cofounderEmails)
                ? data.cofounderEmails.filter((e): e is string => typeof e === 'string')
                : [];
              setCofounderEmails(nextEmails);
              setIsAuthorizedAdmin(
                userEmail === PRIMARY_FOUNDER_EMAIL ||
                  data.ownerEmail === userEmail ||
                  nextEmails.includes(userEmail)
              );
            },
            (err) => {
              try {
                handleFirestoreError(err, OperationType.GET, clubPath);
              } catch (handled) {
                setFatalError(handled instanceof Error ? handled : new Error(String(handled)));
              }
            }
          )
        );

        const cofoundersPath = `clubs/${CLUB_DOC_ID}/cofounders`;
        unsubscribers.push(
          onSnapshot(
            query(
              collection(db, 'clubs', CLUB_DOC_ID, 'cofounders'),
              where('clubId', '==', CLUB_DOC_ID)
            ),
            (snap) => {
              const rows: CoFounderRecord[] = snap.docs
                .map((d) => {
                  const data = d.data();
                  return {
                    id: d.id,
                    email: typeof data.email === 'string' ? data.email : '',
                    displayName:
                      typeof data.displayName === 'string' ? data.displayName : 'Co-Founder',
                    role: data.role === 'admin' ? ('admin' as const) : ('cofounder' as const),
                    addedByEmail:
                      typeof data.addedByEmail === 'string'
                        ? data.addedByEmail
                        : PRIMARY_FOUNDER_EMAIL,
                    _sort: timestampToMillis(data.createdAt),
                  };
                })
                .filter((r) => r.email.length > 0)
                .sort((a, b) => a._sort - b._sort)
                .map(({ _sort: _ignored, ...rest }) => rest);

              setCofounders(rows);
            },
            (err) => {
              try {
                handleFirestoreError(err, OperationType.LIST, cofoundersPath);
              } catch (handled) {
                setFatalError(handled instanceof Error ? handled : new Error(String(handled)));
              }
            }
          )
        );

        const playbooksPath = `clubs/${CLUB_DOC_ID}/playbooks`;
        unsubscribers.push(
          onSnapshot(
            query(
              collection(db, 'clubs', CLUB_DOC_ID, 'playbooks'),
              where('clubId', '==', CLUB_DOC_ID)
            ),
            (snap) => {
              const plays: SavedPlaybook[] = snap.docs
                .map((d) => {
                  const data = d.data();
                  return {
                    id: d.id,
                    mapId: data.mapId as Mw4MapId,
                    side: data.side === 'defense' ? ('defense' as const) : ('offense' as const),
                    name: typeof data.name === 'string' ? data.name : 'Untitled Play',
                    createdAt: formatTimestamp(data.createdAt),
                    operators: Array.isArray(data.operators) ? data.operators : [],
                    utilities: Array.isArray(data.utilities) ? data.utilities : [],
                    routes: Array.isArray(data.routes) ? data.routes : [],
                    _sort: timestampToMillis(data.createdAt),
                  };
                })
                .sort((a, b) => b._sort - a._sort)
                .map(({ _sort: _ignored, ...rest }) => rest);

              setSavedPlaybooks(plays);
            },
            (err) => {
              try {
                handleFirestoreError(err, OperationType.LIST, playbooksPath);
              } catch (handled) {
                setFatalError(handled instanceof Error ? handled : new Error(String(handled)));
              }
            }
          )
        );
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('permission-denied') || message.includes('Missing or insufficient')) {
          setIsAuthorizedAdmin(false);
          setCloudSynced(false);
          return;
        }
        try {
          handleFirestoreError(err, OperationType.GET, clubPath);
        } catch (handled) {
          setFatalError(handled instanceof Error ? handled : new Error(String(handled)));
        }
      }
    };

    void connectWorkspace();
    return () => {
      cancelled = true;
      unsubscribers.forEach((fn) => fn());
    };
  }, [authLoading, currentUser]);

  const handleAddCoFounder = useCallback(
    async (email: string, displayName: string, role: 'cofounder' | 'admin') => {
      if (!currentUser || !currentUser.email || !isAuthorizedAdmin || !cloudSynced) {
        throw new Error('Sign in with an authorized Founder or Co-Founder account first.');
      }
      const cleanedEmail = email.trim().toLowerCase();
      const cleanedName = displayName.trim().slice(0, 80);
      const cofounderId = emailToSafeId(cleanedEmail);
      const nextEmails = Array.from(new Set([...cofounderEmails, cleanedEmail])).slice(0, 15);
      const batchPath = `clubs/${CLUB_DOC_ID}/cofounders/${cofounderId}`;

      try {
        const batch = writeBatch(db);
        batch.update(doc(db, 'clubs', CLUB_DOC_ID), {
          cofounderEmails: nextEmails,
          updatedAt: serverTimestamp(),
        });
        batch.set(doc(db, 'clubs', CLUB_DOC_ID, 'cofounders', cofounderId), {
          clubId: CLUB_DOC_ID,
          email: cleanedEmail,
          displayName: cleanedName,
          role,
          addedByUid: currentUser.uid,
          addedByEmail: currentUser.email.toLowerCase(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, batchPath);
      }
    },
    [currentUser, isAuthorizedAdmin, cloudSynced, cofounderEmails]
  );

  const handleRemoveCoFounder = useCallback(
    async (member: CoFounderRecord) => {
      if (!currentUser || !isAuthorizedAdmin || !cloudSynced) {
        throw new Error('Sign in with an authorized Founder or Co-Founder account first.');
      }
      if (member.email.toLowerCase() === PRIMARY_FOUNDER_EMAIL) {
        throw new Error('Primary Founder access cannot be revoked.');
      }
      const nextEmails = cofounderEmails.filter(
        (e) => e.toLowerCase() !== member.email.toLowerCase()
      );
      const targetPath = `clubs/${CLUB_DOC_ID}/cofounders/${member.id}`;

      try {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'clubs', CLUB_DOC_ID, 'cofounders', member.id));
        batch.update(doc(db, 'clubs', CLUB_DOC_ID), {
          cofounderEmails: nextEmails,
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, targetPath);
      }
    },
    [currentUser, isAuthorizedAdmin, cloudSynced, cofounderEmails]
  );

  const handleSavePlaybook = useCallback(
    (play: SavedPlaybook) => {
      const safeId = sanitizeDocId(play.id, 'play');
      const normalizedPlay: SavedPlaybook = { ...play, id: safeId };
      setSavedPlaybooks((prev) => [normalizedPlay, ...prev.filter((p) => p.id !== safeId)]);

      if (cloudSynced && isAuthorizedAdmin && currentUser && currentUser.email) {
        const playPath = `clubs/${CLUB_DOC_ID}/playbooks/${safeId}`;
        void setDoc(doc(db, 'clubs', CLUB_DOC_ID, 'playbooks', safeId), {
          clubId: CLUB_DOC_ID,
          mapId: normalizedPlay.mapId,
          side: normalizedPlay.side,
          name: normalizedPlay.name.trim().slice(0, 80) || 'Custom S&D Play',
          createdByUid: currentUser.uid,
          createdByEmail: currentUser.email.toLowerCase(),
          operators: normalizedPlay.operators.slice(0, 4),
          utilities: normalizedPlay.utilities.slice(0, 20),
          routes: normalizedPlay.routes.slice(0, 20),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }).catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, playPath);
        });
      }
    },
    [cloudSynced, isAuthorizedAdmin, currentUser]
  );

  const handleDeletePlaybook = useCallback(
    (id: string) => {
      setSavedPlaybooks((prev) => prev.filter((p) => p.id !== id));

      if (cloudSynced && isAuthorizedAdmin && currentUser) {
        const safeId = sanitizeDocId(id, 'play');
        const playPath = `clubs/${CLUB_DOC_ID}/playbooks/${safeId}`;
        void deleteDoc(doc(db, 'clubs', CLUB_DOC_ID, 'playbooks', safeId)).catch((err) => {
          handleFirestoreError(err, OperationType.DELETE, playPath);
        });
      }
    },
    [cloudSynced, isAuthorizedAdmin, currentUser]
  );

  if (fatalError) {
    throw fatalError;
  }

  const selectedCandidateGame =
    parsedRoute.tab === 'games' && parsedRoute.gameSlug
      ? getGameBySlug(parsedRoute.gameSlug) || null
      : null;

  const isProfileActive = parsedRoute.tab === 'clan_hq' && Boolean(parsedRoute.playerSlug);
  const isClanActive = parsedRoute.tab === 'clan_hq' && !parsedRoute.playerSlug;
  const isMetaActive =
    parsedRoute.tab === 'mw4_pilot' &&
    (parsedRoute.mw4SubSection === 'builds' || parsedRoute.mw4SubSection === 'patches');

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F5F5] flex flex-col">
      <Header
        activeTab={parsedRoute.tab}
        interfaceMode={interfaceMode}
        onToggleInterfaceMode={() =>
          setInterfaceMode((prev) => (prev === 'standard' ? 'professional' : 'standard'))
        }
        onSelectTab={handleSelectHeaderTab}
        onQuickMapBoard={() => navigatePath('/developers', 'Developer Connect')}
        onNavigatePath={navigatePath}
        mobileSidebarOpen={mobileSidebarOpen}
        onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      />

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 top-[72px] z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Persistent Collapsible Desktop Left Sidebar + Mobile Slide-Out Drawer (15 Windows) */}
      <aside
        aria-label="Main navigation"
        className={`fixed top-[72px] left-0 bottom-0 z-30 bg-[#14161D] border-r border-[#2A303E] overflow-y-auto p-3 flex flex-col gap-1 transition-all duration-200 ${
          sidebarCollapsed ? 'w-[232px] md:w-[72px]' : 'w-[232px]'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="hidden md:flex items-center justify-between px-1 pb-2 mb-1 border-b border-[#252A36]">
          {!sidebarCollapsed && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A7AFBD]">
              Command Nav
            </span>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="min-h-[34px] min-w-[34px] mx-auto md:mx-0 flex items-center justify-center rounded-lg text-[#A7AFBD] hover:text-[#D6B477] hover:bg-[#1C1F27] transition-colors"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeSidebarId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigatePath(item.path, item.label)}
              aria-current={active ? 'page' : undefined}
              title={sidebarCollapsed ? item.label : undefined}
              className={`min-h-[40px] w-full px-3 py-2 rounded-[10px] border text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                sidebarCollapsed ? 'md:justify-center md:px-0' : ''
              } ${
                active
                  ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                  : 'bg-[#1C1F27] text-[#F5F5F5] border-[#2D3342] hover:border-[#D6B477]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${active ? 'text-[#FFE0A1]' : 'text-[#D6B477]'}`}
                aria-hidden="true"
              />
              <span className={`truncate ${sidebarCollapsed ? 'md:hidden' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        <div className="mt-auto pt-2.5 border-t border-[#252A36]">
          <button
            type="button"
            onClick={() => navigatePath('/admin', 'Admin Dashboard')}
            title={sidebarCollapsed ? 'Owner Admin & Rights' : undefined}
            className={`min-h-[40px] w-full px-3 py-2 rounded-lg text-left text-xs text-[#A7AFBD] hover:text-[#D6B477] hover:bg-[#1C1F27] transition-colors flex items-center gap-2.5 ${
              sidebarCollapsed ? 'md:justify-center md:px-0' : ''
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#D6B477] shrink-0" aria-hidden="true" />
            <span className={`truncate ${sidebarCollapsed ? 'md:hidden' : ''}`}>
              Admin &amp; Rights Ledger
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div
        className={`flex-1 flex flex-col pb-20 md:pb-6 transition-all duration-200 ${
          sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[232px]'
        }`}
      >
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          {(parsedRoute.tab === 'games' || parsedRoute.tab === 'catalog') && (
            <GameDirectoryView
              mode={
                parsedRoute.tab === 'catalog'
                  ? 'catalog'
                  : selectedCandidateGame
                  ? 'detail'
                  : 'home'
              }
              interfaceMode={interfaceMode}
              selectedGame={selectedCandidateGame}
              preferences={preferences}
              recentlyViewed={recentlyViewed}
              useSvgFallbackMode={useSvgFallbackMode}
              onUpdatePreferences={setPreferences}
              onToggleFavoriteGame={handleToggleFavoriteGame}
              onNavigatePath={navigatePath}
            />
          )}

          {parsedRoute.tab === 'strategies' && (
            <StrategyLibraryView
              interfaceMode={interfaceMode}
              savedPlaybooks={savedPlaybooks}
              onSavePlaybook={handleSavePlaybook}
              onDeletePlaybook={handleDeletePlaybook}
              onNavigatePath={navigatePath}
            />
          )}

          {parsedRoute.tab === 'news' && (
            <GamingNewsView interfaceMode={interfaceMode} onNavigatePath={navigatePath} />
          )}

          {parsedRoute.tab === 'equipment' && (
            <EquipmentCenterView interfaceMode={interfaceMode} />
          )}

          {parsedRoute.tab === 'notifications' && (
            <NotificationsCenterView
              notifications={notifications}
              savedEventIds={savedEventIds}
              savedPlaybooksCount={savedPlaybooks.length}
              onNavigatePath={navigatePath}
            />
          )}

          {(parsedRoute.tab === 'statistics' || parsedRoute.tab === 'developers') && (
            <StatisticsView
              key={parsedRoute.tab}
              initialSubTab="connections"
              savedPlaybooks={savedPlaybooks}
              onNavigatePath={navigatePath}
            />
          )}

          {parsedRoute.tab === 'recruitment' && (
            <RecruitmentView onNavigatePath={navigatePath} />
          )}

          {parsedRoute.tab === 'events' && (
            <EventsView
              savedEventIds={savedEventIds}
              onToggleSaveEvent={handleToggleSaveEvent}
              onNavigatePath={navigatePath}
            />
          )}

          {parsedRoute.tab === 'saved' && (
            <SavedView
              favoriteGameSlugs={preferences.favoriteGameSlugs}
              savedPlaybooks={savedPlaybooks}
              savedEventIds={savedEventIds}
              onToggleFavoriteGame={handleToggleFavoriteGame}
              onDeletePlaybook={handleDeletePlaybook}
              onToggleSaveEvent={handleToggleSaveEvent}
              onNavigatePath={navigatePath}
            />
          )}

          {parsedRoute.tab === 'settings' && (
            <SettingsView
              currentUserEmail={currentUser?.email ?? null}
              currentUserName={currentUser?.displayName ?? null}
              accessibility={accessibility}
              notifications={notifications}
              useSvgFallbackMode={useSvgFallbackMode}
              onUpdateAccessibility={setAccessibility}
              onUpdateNotifications={setNotifications}
              onToggleSvgFallbackMode={() => setUseSvgFallbackMode((prev) => !prev)}
              onClearLocalData={handleClearLocalData}
              onNavigatePath={navigatePath}
            />
          )}

          {parsedRoute.tab === 'mw4_pilot' && (
            <Mw4PilotHubView
              subSection={parsedRoute.mw4SubSection || 'maps'}
              activeMapSlug={parsedRoute.mapSlug}
              activeBuildSlug={parsedRoute.buildSlug}
              activePatchSlug={parsedRoute.patchSlug}
              interfaceMode={interfaceMode}
              clubState={clubState}
              totalEdgeBonus={0}
              savedPlaybooks={savedPlaybooks}
              onSavePlaybook={handleSavePlaybook}
              onDeletePlaybook={handleDeletePlaybook}
              onNavigatePath={navigatePath}
            />
          )}

          {parsedRoute.tab === 'clan_hq' && (
            <ClanOperationsView
              mode={parsedRoute.playerSlug ? 'player' : 'clan'}
              slug={parsedRoute.playerSlug || parsedRoute.clanSlug || 'rule-one'}
              currentUserEmail={currentUser?.email ?? null}
              currentUserName={currentUser?.displayName ?? null}
              isAuthorizedAdmin={isAuthorizedAdmin}
              authLoading={authLoading}
              cloudSynced={cloudSynced}
              cofounders={cofounders}
              onSignIn={signInWithGoogle}
              onSignOut={signOutAccount}
              onAddCoFounder={handleAddCoFounder}
              onRemoveCoFounder={handleRemoveCoFounder}
              onRecordInviteCopy={() =>
                setFunnelMetrics(recordAggregateEvent('inviteLinksCopied'))
              }
              onNavigatePath={navigatePath}
            />
          )}

          {parsedRoute.tab === 'ops' && (
            <OpsRegistryView
              useSvgFallbackMode={useSvgFallbackMode}
              onToggleSvgFallbackMode={() => setUseSvgFallbackMode((prev) => !prev)}
              funnelMetrics={funnelMetrics}
              onRecordCorrection={() =>
                setFunnelMetrics(recordAggregateEvent('correctionsSubmitted'))
              }
              onNavigatePath={navigatePath}
            />
          )}
        </main>

        <footer className="border-t border-[#252C38] mt-8">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#B5BECD]">
            <p>
              Rule One &middot; {GAME_CATALOG.length} Developer-Connected Games &middot; No billing
              or unauthorized telemetry enabled
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => navigatePath('/games', 'Games')}
                className="min-h-[36px] hover:text-[#E1C184] transition-colors"
              >
                Games
              </button>
              <button
                type="button"
                onClick={() => navigatePath('/developers', 'Developer Connect')}
                className="min-h-[36px] hover:text-[#E1C184] transition-colors"
              >
                Developer APIs
              </button>
              <button
                type="button"
                onClick={() => navigatePath('/settings', 'Settings')}
                className="min-h-[36px] hover:text-[#E1C184] transition-colors"
              >
                Settings
              </button>
              <button
                type="button"
                onClick={() => navigatePath('/ops', 'Intel & Rights')}
                className="min-h-[36px] hover:text-[#E1C184] transition-colors"
              >
                Intel &amp; Rights
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar (Exact 5 Addendum Tabs: Home / Games / Meta / Clans / Profile) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#11151E]/95 backdrop-blur-md border-t border-[#2A3140]"
      >
        <div className="px-2 h-16 grid grid-cols-5 items-center">
          <button
            type="button"
            onClick={() => navigatePath('/', 'Home')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
              parsedRoute.tab === 'games' && !selectedCandidateGame
                ? 'text-[#E1C184]'
                : 'text-[#B5BECD] hover:text-[#F3F4F7]'
            }`}
          >
            <Home className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[11px] font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => navigatePath('/games', 'Games')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
              parsedRoute.tab === 'catalog' || Boolean(selectedCandidateGame)
                ? 'text-[#E1C184]'
                : 'text-[#B5BECD] hover:text-[#F3F4F7]'
            }`}
          >
            <Gamepad2 className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[11px] font-medium">Games</span>
          </button>

          <button
            type="button"
            onClick={() => navigatePath('/meta', 'Meta Lab')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
              isMetaActive ? 'text-[#E1C184]' : 'text-[#B5BECD] hover:text-[#F3F4F7]'
            }`}
          >
            <Crosshair className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[11px] font-medium">Meta</span>
          </button>

          <button
            type="button"
            onClick={() => navigatePath('/clans/rule-one', 'Clan HQ')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
              isClanActive ? 'text-[#E1C184]' : 'text-[#B5BECD] hover:text-[#F3F4F7]'
            }`}
          >
            <Shield className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[11px] font-medium">Clans</span>
          </button>

          <button
            type="button"
            onClick={() => navigatePath('/players/jason-vaughn', 'Profile')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
              isProfileActive ? 'text-[#E1C184]' : 'text-[#B5BECD] hover:text-[#F3F4F7]'
            }`}
          >
            <UserIcon className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[11px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <RuleOneApp />
    </ErrorBoundary>
  );
}
