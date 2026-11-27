import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { CdlIntelView } from './components/CdlIntelView';
import { CoFounderRecord } from './components/CoFounderAccessPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { MapControlView } from './components/MapControlView';
import { MatchDeskView } from './components/MatchDeskView';
import { VaultRigView } from './components/VaultRigView';
import {
  CDL_2027_TEAMS,
  INITIAL_CLUB_STATE,
  MW4_LOADOUT_PRESETS,
  RIG_UPGRADES,
  formatCurrency,
} from './data/mw4CdlData';
import { MW4_SND_MAPS, SavedPlaybook } from './data/sndMaps';
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
import { AppTab, CdlTeam, ClubState, LedgerEntry, Mw4MapId, RigUpgrade } from './types';

const STORAGE_CLUB_KEY = 'rule_one_mw4_cdl_state_v1';
const STORAGE_PLAYS_KEY = 'rule_one_mw4_snd_playbooks_v1';

const DEFAULT_COFOUNDERS: CoFounderRecord[] = [
  {
    id: emailToSafeId(BOOTSTRAPPED_COFOUNDER_EMAIL),
    email: BOOTSTRAPPED_COFOUNDER_EMAIL,
    displayName: 'FPSxFUBARxGSG',
    role: 'cofounder',
    addedByEmail: PRIMARY_FOUNDER_EMAIL,
  },
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

function loadInitialClubState(): ClubState {
  try {
    const raw = window.localStorage.getItem(STORAGE_CLUB_KEY);
    if (!raw) return INITIAL_CLUB_STATE;
    const parsed = JSON.parse(raw) as Partial<ClubState>;
    if (typeof parsed.treasury !== 'number' || !Array.isArray(parsed.ledger)) {
      return INITIAL_CLUB_STATE;
    }
    return {
      ...INITIAL_CLUB_STATE,
      ...parsed,
    };
  } catch {
    return INITIAL_CLUB_STATE;
  }
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

function RuleOneApp() {
  const [activeTab, setActiveTab] = useState<AppTab>('map_control');
  const [clubState, setClubState] = useState<ClubState>(loadInitialClubState);
  const [savedPlaybooks, setSavedPlaybooks] = useState<SavedPlaybook[]>(loadInitialPlaybooks);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(CDL_2027_TEAMS[0].id);
  const [selectedMapId, setSelectedMapId] = useState<Mw4MapId>('coal');

  // Firebase Auth & Co-Founder RBAC State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState<boolean>(false);
  const [cloudSynced, setCloudSynced] = useState<boolean>(false);
  const [cofounders, setCofounders] = useState<CoFounderRecord[]>(DEFAULT_COFOUNDERS);
  const [cofounderEmails, setCofounderEmails] = useState<string[]>([
    BOOTSTRAPPED_COFOUNDER_EMAIL,
  ]);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const clubStateRef = useRef<ClubState>(clubState);
  clubStateRef.current = clubState;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_CLUB_KEY, JSON.stringify(clubState));
    } catch {
      // Ignore restricted storage environments
    }
  }, [clubState]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_PLAYS_KEY, JSON.stringify(savedPlaybooks));
    } catch {
      // Ignore restricted storage environments
    }
  }, [savedPlaybooks]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubAuth();
  }, []);

  // Bootstrap `/clubs/rule_one` & attach real-time Firestore listeners for authorized Founders/Co-Founders
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

          // Create canonical `/clubs/rule_one` workspace document first
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

          // Seed bootstrapped Co-Founder record for FPSxFUBARxGSG@gmail.com
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

        // 1. Live Club Workspace listener
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

              const stillAuthorized =
                userEmail === PRIMARY_FOUNDER_EMAIL ||
                data.ownerEmail === userEmail ||
                nextEmails.includes(userEmail);
              setIsAuthorizedAdmin(stillAuthorized);

              setClubState((prev) => ({
                ...prev,
                treasury: typeof data.treasury === 'number' ? data.treasury : prev.treasury,
                offshoreReserve:
                  typeof data.offshoreReserve === 'number'
                    ? data.offshoreReserve
                    : prev.offshoreReserve,
                wins: typeof data.wins === 'number' ? data.wins : prev.wins,
                losses: typeof data.losses === 'number' ? data.losses : prev.losses,
                streak: typeof data.streak === 'number' ? data.streak : prev.streak,
                bestStreak:
                  typeof data.bestStreak === 'number' ? data.bestStreak : prev.bestStreak,
                activeLoadoutId:
                  typeof data.activeLoadoutId === 'string'
                    ? data.activeLoadoutId
                    : prev.activeLoadoutId,
                ownedRigIds: Array.isArray(data.ownedRigIds)
                  ? data.ownedRigIds.filter((id): id is string => typeof id === 'string')
                  : prev.ownedRigIds,
              }));
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

        // 2. Live Co-Founders Roster listener
        const cofoundersPath = `clubs/${CLUB_DOC_ID}/cofounders`;
        const cofoundersQuery = query(
          collection(db, 'clubs', CLUB_DOC_ID, 'cofounders'),
          where('clubId', '==', CLUB_DOC_ID)
        );
        unsubscribers.push(
          onSnapshot(
            cofoundersQuery,
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

        // 3. Live Shared MW4 S&D Playbooks listener
        const playbooksPath = `clubs/${CLUB_DOC_ID}/playbooks`;
        const playbooksQuery = query(
          collection(db, 'clubs', CLUB_DOC_ID, 'playbooks'),
          where('clubId', '==', CLUB_DOC_ID)
        );
        unsubscribers.push(
          onSnapshot(
            playbooksQuery,
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

        // 4. Live Shared Private Accounting Ledger listener
        const ledgerPath = `clubs/${CLUB_DOC_ID}/ledger`;
        const ledgerQuery = query(
          collection(db, 'clubs', CLUB_DOC_ID, 'ledger'),
          where('clubId', '==', CLUB_DOC_ID)
        );
        unsubscribers.push(
          onSnapshot(
            ledgerQuery,
            (snap) => {
              if (snap.empty) return;
              const entries: LedgerEntry[] = snap.docs
                .map((d) => {
                  const data = d.data();
                  const entry: LedgerEntry & { _sort: number } = {
                    id: d.id,
                    timestamp: formatTimestamp(data.createdAt),
                    type: data.type as LedgerEntry['type'],
                    title: typeof data.title === 'string' ? data.title : 'Ledger Entry',
                    subtitle: typeof data.subtitle === 'string' ? data.subtitle : '',
                    amount: typeof data.amount === 'number' ? data.amount : 0,
                    _sort: timestampToMillis(data.createdAt),
                  };
                  if (typeof data.scoreline === 'string' && data.scoreline.length > 0) {
                    entry.scoreline = data.scoreline;
                  }
                  return entry;
                })
                .sort((a, b) => b._sort - a._sort)
                .map(({ _sort: _ignored, ...rest }) => rest);

              setClubState((prev) => ({
                ...prev,
                ledger: entries,
              }));
            },
            (err) => {
              try {
                handleFirestoreError(err, OperationType.LIST, ledgerPath);
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
          // Signed-in Google user is not on the authorized Founder/Co-Founder list
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

  // Helper: push Action 2 metrics update to `/clubs/rule_one` when cloud synced
  const syncClubMetrics = useCallback(
    async (metrics: {
      treasury: number;
      offshoreReserve: number;
      wins: number;
      losses: number;
      streak: number;
      bestStreak: number;
      activeLoadoutId: string;
      ownedRigIds: string[];
    }) => {
      if (!cloudSynced || !isAuthorizedAdmin || !currentUser) return;
      const clubPath = `clubs/${CLUB_DOC_ID}`;
      try {
        await updateDoc(doc(db, 'clubs', CLUB_DOC_ID), {
          treasury: Math.max(0, Math.min(1000000000, metrics.treasury)),
          offshoreReserve: Math.max(0, Math.min(1000000000, metrics.offshoreReserve)),
          wins: Math.max(0, Math.min(100000, metrics.wins)),
          losses: Math.max(0, Math.min(100000, metrics.losses)),
          streak: Math.max(0, Math.min(10000, metrics.streak)),
          bestStreak: Math.max(0, Math.min(10000, metrics.bestStreak)),
          activeLoadoutId: sanitizeDocId(metrics.activeLoadoutId, 'loadout').slice(0, 64),
          ownedRigIds: metrics.ownedRigIds.slice(0, 10),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, clubPath);
      }
    },
    [cloudSynced, isAuthorizedAdmin, currentUser]
  );

  // Helper: write a ledger entry to `/clubs/rule_one/ledger/{entryId}` when cloud synced
  const writeCloudLedger = useCallback(
    async (entry: LedgerEntry) => {
      if (!cloudSynced || !isAuthorizedAdmin || !currentUser) return;
      const safeId = sanitizeDocId(entry.id, 'led');
      const entryPath = `clubs/${CLUB_DOC_ID}/ledger/${safeId}`;
      const payload: Record<string, unknown> = {
        clubId: CLUB_DOC_ID,
        type: entry.type,
        title: entry.title.slice(0, 120),
        subtitle: entry.subtitle.slice(0, 160),
        amount: Math.max(-100000000, Math.min(100000000, entry.amount)),
        createdByUid: currentUser.uid,
        createdAt: serverTimestamp(),
      };
      if (entry.scoreline && entry.scoreline.trim().length > 0) {
        payload.scoreline = entry.scoreline.trim().slice(0, 24);
      }
      try {
        await setDoc(doc(db, 'clubs', CLUB_DOC_ID, 'ledger', safeId), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, entryPath);
      }
    },
    [cloudSynced, isAuthorizedAdmin, currentUser]
  );

  // Co-Founder RBAC handlers
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

  const totalEdgeBonus = useMemo(() => {
    const rigBonus = RIG_UPGRADES.filter((r) => clubState.ownedRigIds.includes(r.id)).reduce(
      (sum, r) => sum + r.edgeBonus,
      0
    );
    const loadout =
      MW4_LOADOUT_PRESETS.find((l) => l.id === clubState.activeLoadoutId) ||
      MW4_LOADOUT_PRESETS[0];
    return Number((rigBonus + loadout.edgeBonus).toFixed(1));
  }, [clubState.ownedRigIds, clubState.activeLoadoutId]);

  const handleLaunchMapScrim = useCallback((mapId: Mw4MapId, teamId: string) => {
    setSelectedMapId(mapId);
    setSelectedTeamId(teamId);
    setActiveTab('match_desk');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleChallengeTeam = useCallback((team: CdlTeam, mapId: Mw4MapId) => {
    setSelectedTeamId(team.id);
    setSelectedMapId(mapId);
    setActiveTab('match_desk');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBookScrim = useCallback(
    (team: CdlTeam, slotLabel: string): boolean => {
      const current = clubStateRef.current;
      if (current.treasury < team.scrimRetainer) return false;
      const sigMap =
        MW4_SND_MAPS.find((m) => m.id === team.signatureMap)?.name || 'Coal';
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        timestamp: nowStamp(),
        type: 'scrim_booking',
        title: `Booked 2-Hr MW4 S&D Scrim Block vs. ${team.name}`,
        subtitle: `${sigMap} · ${slotLabel}`,
        amount: -team.scrimRetainer,
      };
      const nextTreasury = current.treasury - team.scrimRetainer;

      setClubState((prev) => ({
        ...prev,
        treasury: nextTreasury,
        bookings: [
          {
            id: `bk-${Date.now()}`,
            teamId: team.id,
            teamName: team.name,
            mapName: sigMap,
            slotLabel,
            retainerPaid: team.scrimRetainer,
            status: 'Confirmed',
          },
          ...prev.bookings,
        ],
        ledger: [ledgerEntry, ...prev.ledger],
      }));

      void syncClubMetrics({
        treasury: nextTreasury,
        offshoreReserve: current.offshoreReserve,
        wins: current.wins,
        losses: current.losses,
        streak: current.streak,
        bestStreak: current.bestStreak,
        activeLoadoutId: current.activeLoadoutId,
        ownedRigIds: current.ownedRigIds,
      });
      void writeCloudLedger(ledgerEntry);
      return true;
    },
    [syncClubMetrics, writeCloudLedger]
  );

  const handleSettleMatch = useCallback(
    ({
      team,
      mapName,
      stake,
      won,
      netDelta,
      scoreline,
    }: {
      team: CdlTeam;
      mapName: string;
      stake: number;
      won: boolean;
      netDelta: number;
      scoreline: string;
    }) => {
      const current = clubStateRef.current;
      const nextStreak = won ? current.streak + 1 : 0;
      const nextTreasury = Math.max(0, current.treasury + netDelta);
      const nextWins = won ? current.wins + 1 : current.wins;
      const nextLosses = won ? current.losses : current.losses + 1;
      const nextBestStreak = Math.max(current.bestStreak, nextStreak);
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        timestamp: nowStamp(),
        type: won ? 'match_win' : 'match_loss',
        title: `S&D ${won ? 'Victory' : 'Defeat'} vs. ${team.name} (${mapName})`,
        subtitle: `MW4 CDL v1.0 · ${formatCurrency(stake)} Private Stake`,
        amount: netDelta,
        scoreline,
      };

      setClubState((prev) => ({
        ...prev,
        treasury: nextTreasury,
        wins: nextWins,
        losses: nextLosses,
        streak: nextStreak,
        bestStreak: nextBestStreak,
        ledger: [ledgerEntry, ...prev.ledger],
      }));

      void syncClubMetrics({
        treasury: nextTreasury,
        offshoreReserve: current.offshoreReserve,
        wins: nextWins,
        losses: nextLosses,
        streak: nextStreak,
        bestStreak: nextBestStreak,
        activeLoadoutId: current.activeLoadoutId,
        ownedRigIds: current.ownedRigIds,
      });
      void writeCloudLedger(ledgerEntry);
    },
    [syncClubMetrics, writeCloudLedger]
  );

  const handleAcquireRig = useCallback(
    (upgrade: RigUpgrade): boolean => {
      const current = clubStateRef.current;
      if (current.ownedRigIds.includes(upgrade.id)) return true;
      if (current.treasury < upgrade.price) return false;
      const nextTreasury = current.treasury - upgrade.price;
      const nextOwned = [...current.ownedRigIds, upgrade.id];
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        timestamp: nowStamp(),
        type: 'rig_purchase',
        title: `Acquired ${upgrade.name}`,
        subtitle: `${upgrade.category} · +${upgrade.edgeBonus.toFixed(1)}% S&D Edge`,
        amount: -upgrade.price,
      };

      setClubState((prev) => ({
        ...prev,
        treasury: nextTreasury,
        ownedRigIds: nextOwned,
        ledger: [ledgerEntry, ...prev.ledger],
      }));

      void syncClubMetrics({
        treasury: nextTreasury,
        offshoreReserve: current.offshoreReserve,
        wins: current.wins,
        losses: current.losses,
        streak: current.streak,
        bestStreak: current.bestStreak,
        activeLoadoutId: current.activeLoadoutId,
        ownedRigIds: nextOwned,
      });
      void writeCloudLedger(ledgerEntry);
      return true;
    },
    [syncClubMetrics, writeCloudLedger]
  );

  const handleSelectLoadout = useCallback(
    (loadoutId: string) => {
      const current = clubStateRef.current;
      setClubState((prev) => ({ ...prev, activeLoadoutId: loadoutId }));
      void syncClubMetrics({
        treasury: current.treasury,
        offshoreReserve: current.offshoreReserve,
        wins: current.wins,
        losses: current.losses,
        streak: current.streak,
        bestStreak: current.bestStreak,
        activeLoadoutId: loadoutId,
        ownedRigIds: current.ownedRigIds,
      });
    },
    [syncClubMetrics]
  );

  const handleWireFunds = useCallback(
    (amount: number) => {
      const current = clubStateRef.current;
      const nextTreasury = current.treasury + amount;
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        timestamp: nowStamp(),
        type: 'treasury_wire',
        title: 'Private Dividend Wire Received',
        subtitle: 'Rule One Liquidity Desk · Instant Settlement',
        amount,
      };

      setClubState((prev) => ({
        ...prev,
        treasury: nextTreasury,
        ledger: [ledgerEntry, ...prev.ledger],
      }));

      void syncClubMetrics({
        treasury: nextTreasury,
        offshoreReserve: current.offshoreReserve,
        wins: current.wins,
        losses: current.losses,
        streak: current.streak,
        bestStreak: current.bestStreak,
        activeLoadoutId: current.activeLoadoutId,
        ownedRigIds: current.ownedRigIds,
      });
      void writeCloudLedger(ledgerEntry);
    },
    [syncClubMetrics, writeCloudLedger]
  );

  const handleTransferReserve = useCallback(
    (amount: number): boolean => {
      const current = clubStateRef.current;
      if (current.treasury < amount) return false;
      const nextTreasury = current.treasury - amount;
      const nextReserve = current.offshoreReserve + amount;
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        timestamp: nowStamp(),
        type: 'treasury_withdraw',
        title: 'Transferred S&D Winnings to Offshore Reserve',
        subtitle: 'Private Vault Custody',
        amount: -amount,
      };

      setClubState((prev) => ({
        ...prev,
        treasury: nextTreasury,
        offshoreReserve: nextReserve,
        ledger: [ledgerEntry, ...prev.ledger],
      }));

      void syncClubMetrics({
        treasury: nextTreasury,
        offshoreReserve: nextReserve,
        wins: current.wins,
        losses: current.losses,
        streak: current.streak,
        bestStreak: current.bestStreak,
        activeLoadoutId: current.activeLoadoutId,
        ownedRigIds: current.ownedRigIds,
      });
      void writeCloudLedger(ledgerEntry);
      return true;
    },
    [syncClubMetrics, writeCloudLedger]
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

  const handleResetCareer = useCallback(() => {
    setClubState(INITIAL_CLUB_STATE);
    if (!cloudSynced) {
      setSavedPlaybooks([]);
    }
    void syncClubMetrics({
      treasury: INITIAL_CLUB_STATE.treasury,
      offshoreReserve: INITIAL_CLUB_STATE.offshoreReserve,
      wins: INITIAL_CLUB_STATE.wins,
      losses: INITIAL_CLUB_STATE.losses,
      streak: INITIAL_CLUB_STATE.streak,
      bestStreak: INITIAL_CLUB_STATE.bestStreak,
      activeLoadoutId: INITIAL_CLUB_STATE.activeLoadoutId,
      ownedRigIds: INITIAL_CLUB_STATE.ownedRigIds,
    });
  }, [cloudSynced, syncClubMetrics]);

  if (fatalError) {
    throw fatalError;
  }

  return (
    <div className="min-h-screen bg-[#090A0D] text-[#F3F1EC] flex flex-col">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onQuickScrim={() => setActiveTab('match_desk')}
      />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-8 lg:py-10">
        {activeTab === 'map_control' && (
          <MapControlView
            clubState={clubState}
            totalEdgeBonus={totalEdgeBonus}
            savedPlaybooks={savedPlaybooks}
            onSavePlaybook={handleSavePlaybook}
            onDeletePlaybook={handleDeletePlaybook}
            onNavigate={setActiveTab}
            onLaunchMapScrim={handleLaunchMapScrim}
          />
        )}

        {activeTab === 'match_desk' && (
          <MatchDeskView
            treasury={clubState.treasury}
            totalEdgeBonus={totalEdgeBonus}
            selectedTeamId={selectedTeamId}
            selectedMapId={selectedMapId}
            onSelectTeamId={setSelectedTeamId}
            onSelectMapId={setSelectedMapId}
            onSettleMatch={handleSettleMatch}
          />
        )}

        {activeTab === 'cdl_intel' && (
          <CdlIntelView
            treasury={clubState.treasury}
            onChallengeTeam={handleChallengeTeam}
            onBookScrim={handleBookScrim}
          />
        )}

        {activeTab === 'vault' && (
          <VaultRigView
            clubState={clubState}
            totalEdgeBonus={totalEdgeBonus}
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
            onAcquireRig={handleAcquireRig}
            onSelectLoadout={handleSelectLoadout}
            onWireFunds={handleWireFunds}
            onTransferReserve={handleTransferReserve}
            onResetCareer={handleResetCareer}
          />
        )}
      </main>

      <footer className="border-t border-[#22252E] mt-12">
        <div className="max-w-[1360px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7D7B75]">
          <p>Rule One · Call of Duty: Modern Warfare 4 (2026) CDL S&amp;D Map Control</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('map_control')}
              className="hover:text-[#F3F1EC] transition-colors"
            >
              S&amp;D Map Control
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('match_desk')}
              className="hover:text-[#F3F1EC] transition-colors"
            >
              CDL Match Desk
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cdl_intel')}
              className="hover:text-[#F3F1EC] transition-colors"
            >
              CDL v1.0 Intel
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vault')}
              className="hover:text-[#F3F1EC] transition-colors"
            >
              Loadout &amp; Vault
            </button>
          </div>
        </div>
      </footer>
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
