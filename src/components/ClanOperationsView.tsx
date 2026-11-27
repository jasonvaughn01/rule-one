import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Flag,
  Link2,
  Shield,
  Users,
  Video,
} from 'lucide-react';
import { MW4_MAP_ENUMERATION } from '../data/intelligencePipeline';
import { SHARED_APP_URL } from '../lib/firebase';
import { ClanRole, sanitizePlainText } from '../lib/validators';
import { CoFounderAccessPanel, CoFounderRecord } from './CoFounderAccessPanel';

interface ClanOperationsViewProps {
  mode: 'clan' | 'player';
  slug: string;
  currentUserEmail: string | null;
  currentUserName: string | null;
  isAuthorizedAdmin: boolean;
  authLoading: boolean;
  cloudSynced: boolean;
  cofounders: CoFounderRecord[];
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onAddCoFounder: (
    email: string,
    displayName: string,
    role: 'cofounder' | 'admin'
  ) => Promise<void>;
  onRemoveCoFounder: (member: CoFounderRecord) => Promise<void>;
  onRecordInviteCopy: () => void;
  onNavigatePath: (path: string, label?: string) => void;
}

interface RosterMember {
  id: string;
  handle: string;
  role: ClanRole;
  primaryRole: string;
  timezone: string;
  availability: string;
  attendancePct: number;
  profileSlug: string;
}

interface ScrimProposal {
  id: string;
  opponent: string;
  mapPool: string;
  scheduledFor: string;
  timezone: string;
  status: 'Proposed (Awaiting Mutual Accept)' | 'Mutually Accepted' | 'Cancelled';
}

interface VodMatchLog {
  id: string;
  date: string;
  opponent: string;
  mapName: string;
  result: string;
  evidenceType: 'Self-Reported' | 'Evidence-Backed (VOD Linked)';
  vodUrl: string;
  timestamps: string;
  takeaway: string;
}

interface InviteToken {
  id: string;
  code: string;
  role: ClanRole;
  expiresAt: string;
  revoked: boolean;
}

const INITIAL_ROSTER: RosterMember[] = [
  {
    id: 'm-1',
    handle: 'Jason Vaughn',
    role: 'owner',
    primaryRole: 'IGL / Flex AR',
    timezone: 'America/Los_Angeles (PST)',
    availability: 'Mon–Thu 19:00–22:30 PST',
    attendancePct: 96,
    profileSlug: 'jason-vaughn',
  },
  {
    id: 'm-2',
    handle: 'FPSxFUBARxGSG',
    role: 'admin',
    primaryRole: 'Entry SMG / Co-Founder',
    timezone: 'America/New_York (EST)',
    availability: 'Daily 20:00–23:30 EST',
    attendancePct: 94,
    profileSlug: 'fpsxfubarxgsg',
  },
  {
    id: 'm-3',
    handle: 'Vanguard_Demo_AR',
    role: 'captain',
    primaryRole: 'Main AR Anchor (Starter Fixture)',
    timezone: 'America/Chicago (CST)',
    availability: 'Tue–Fri 19:30–22:30 CST',
    attendancePct: 88,
    profileSlug: 'jason-vaughn',
  },
  {
    id: 'm-4',
    handle: 'Vanguard_Demo_Sub',
    role: 'member',
    primaryRole: 'Roamer SMG (Starter Fixture)',
    timezone: 'America/Los_Angeles (PST)',
    availability: 'Wed–Sun 18:30–21:30 PST',
    attendancePct: 82,
    profileSlug: 'fpsxfubarxgsg',
  },
];

const INITIAL_SCRIMS: ScrimProposal[] = [
  {
    id: 'sc-1',
    opponent: 'Apex North (Starter Local Fixture)',
    mapPool: 'Coal · Silkworm · Lotus (MW4 S&D)',
    scheduledFor: '2026-11-29 20:00',
    timezone: 'America/New_York (EST)',
    status: 'Mutually Accepted',
  },
  {
    id: 'sc-2',
    opponent: 'Obsidian Four (Starter Local Fixture)',
    mapPool: 'Munition · Rooftops · Reactor U92',
    scheduledFor: '2026-12-01 21:00',
    timezone: 'America/Los_Angeles (PST)',
    status: 'Proposed (Awaiting Mutual Accept)',
  },
];

const INITIAL_VODS: VodMatchLog[] = [
  {
    id: 'vod-1',
    date: '2026-11-25',
    opponent: 'Starter Local Scrim Fixture A',
    mapName: 'Coal (S&D)',
    result: '6 – 4 Win',
    evidenceType: 'Evidence-Backed (VOD Linked)',
    vodUrl: 'https://www.youtube.com',
    timestamps: '02:14 Catwalk opening pick · 08:40 2v2 B-Pit retake',
    takeaway: 'Tighten late-round Dead Silence flank check on lower tunnel.',
  },
  {
    id: 'vod-2',
    date: '2026-11-24',
    opponent: 'Starter Local Scrim Fixture B',
    mapName: 'Silkworm (S&D)',
    result: '5 – 6 Loss',
    evidenceType: 'Self-Reported',
    vodUrl: '',
    timestamps: 'Manual log — no VOD attached',
    takeaway: 'Need earlier smoke denial across Convenience Store window.',
  },
];

const PUBLIC_PLAYERS: Record<
  string,
  {
    handle: string;
    clan: string;
    role: string;
    primaryGame: string;
    region: string;
    bio: string;
    selfReportedStats: { label: string; value: string }[];
  }
> = {
  'jason-vaughn': {
    handle: 'Jason Vaughn',
    clan: 'Rule One',
    role: 'Primary Founder · IGL / Flex AR',
    primaryGame: 'Call of Duty: Modern Warfare 4',
    region: 'North America (West)',
    bio: 'Competitive Call of Duty Search & Destroy veteran focused on disciplined map control, trade spacing, and structured clan prep.',
    selfReportedStats: [
      { label: 'Preferred Mode', value: 'S&D (4v4)' },
      { label: 'Self-Reported Scrim Maps', value: '21 Logged' },
      { label: 'Verified Publisher Telemetry', value: 'Pending API' },
    ],
  },
  fpsxfubarxgsg: {
    handle: 'FPSxFUBARxGSG',
    clan: 'Rule One',
    role: 'Co-Founder · Entry SMG / Tactical Lead',
    primaryGame: 'Call of Duty: Modern Warfare 4',
    region: 'North America',
    bio: 'Rule One Co-Founder coordinating opening routes, entry timing, and clan playbook curation across MW4 launch maps.',
    selfReportedStats: [
      { label: 'Preferred Mode', value: 'S&D / Ranked' },
      { label: 'Role Specialty', value: 'Entry / Pinch' },
      { label: 'Verified Publisher Telemetry', value: 'Pending API' },
    ],
  },
};

export function ClanOperationsView({
  mode,
  slug,
  currentUserEmail,
  currentUserName,
  isAuthorizedAdmin,
  authLoading,
  cloudSynced,
  cofounders,
  onSignIn,
  onSignOut,
  onAddCoFounder,
  onRemoveCoFounder,
  onRecordInviteCopy,
  onNavigatePath,
}: ClanOperationsViewProps) {
  const [roster, setRoster] = useState<RosterMember[]>(INITIAL_ROSTER);
  const [scrims, setScrims] = useState<ScrimProposal[]>(INITIAL_SCRIMS);
  const [vods, setVods] = useState<VodMatchLog[]>(INITIAL_VODS);
  const [invites, setInvites] = useState<InviteToken[]>([
    {
      id: 'inv-1',
      code: 'R1-MW4-7DAY-A92F',
      role: 'member',
      expiresAt: '2026-12-04 23:59 UTC',
      revoked: false,
    },
  ]);

  // Veto planner state across the 12 official MW4 6v6 maps
  const coreMaps = MW4_MAP_ENUMERATION.filter((m) => m.modePool === 'Core 6v6 Launch');
  const [vetoStates, setVetoStates] = useState<Record<string, 'neutral' | 'ban' | 'pick'>>({
    coal: 'pick',
    silkworm: 'pick',
    nautical: 'ban',
  });

  // Form states
  const [publicOptIn, setPublicOptIn] = useState(true);
  const [copiedRecruit, setCopiedRecruit] = useState(false);
  const [newOpponent, setNewOpponent] = useState('');
  const [newSlot, setNewSlot] = useState('2026-12-03 20:30');
  const [newTz, setNewTz] = useState('America/New_York (EST)');
  const [newVodMap, setNewVodMap] = useState('Coal');
  const [newVodResult, setNewVodResult] = useState('6 – 4 Win');
  const [newVodUrl, setNewVodUrl] = useState('');
  const [newVodStamp, setNewVodStamp] = useState('');
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const recruitUrl = `${SHARED_APP_URL}/clans/rule-one?ref=rule-one-hq`;

  const handleCopyRecruit = async () => {
    try {
      await navigator.clipboard.writeText(recruitUrl);
    } catch {
      // Clipboard fallback ignored
    }
    setCopiedRecruit(true);
    onRecordInviteCopy();
    window.setTimeout(() => setCopiedRecruit(false), 2000);
  };

  // Public Player Profile view (/players/:slug)
  if (mode === 'player') {
    const profile = PUBLIC_PLAYERS[slug] || PUBLIC_PLAYERS['jason-vaughn'];
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-xs text-[#8C8982]">
          <button
            type="button"
            onClick={() => onNavigatePath('/clans/rule-one', 'Rule One Clan HQ')}
            className="inline-flex items-center gap-1.5 text-[#C9A86A] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back to Clan HQ
          </button>
          <span>/</span>
          <span className="text-[#F3F1EC]">Public Player Profile</span>
        </div>

        <section className="bg-[#111319] border border-[#22252E] rounded-lg p-7 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#22252E]">
            <div className="space-y-1.5">
              <p className="font-mono text-xs text-[#C9A86A]">
                Opt-In Public Card · Explicit Field Allowlist (No Public Email or Private Data)
              </p>
              <h1 className="font-display text-3xl font-semibold text-[#F3F1EC]">
                {profile.handle}
              </h1>
              <p className="text-sm text-[#A8A59E]">
                {profile.role} · {profile.primaryGame} · {profile.region}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigatePath('/clans/rule-one', 'Rule One Clan HQ')}
              className="px-4 py-2 text-xs font-semibold text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-md transition-colors shrink-0"
            >
              View {profile.clan} HQ
            </button>
          </div>

          <p className="text-sm text-[#D6D3CB] leading-relaxed max-w-3xl">{profile.bio}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {profile.selfReportedStats.map((st) => (
              <div
                key={st.label}
                className="p-4 bg-[#0D0F14] border border-[#22252E] rounded-md"
              >
                <p className="text-xs text-[#8C8982]">{st.label}</p>
                <p className="font-mono text-base font-semibold text-[#F3F1EC] mt-1">{st.value}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#7D7B75]">
            Privacy &amp; Safety Guardrail: No direct messages enabled; manual stats are explicitly
            labeled self-reported until authorized publisher APIs are approved.
          </p>
        </section>
      </div>
    );
  }

  const handleProposeScrim = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizePlainText(newOpponent, 80);
    if (!cleaned) return;
    setScrims((prev) => [
      {
        id: `sc-${Date.now()}`,
        opponent: cleaned,
        mapPool: 'MW4 S&D Custom Series',
        scheduledFor: sanitizePlainText(newSlot, 40),
        timezone: newTz,
        status: 'Proposed (Awaiting Mutual Accept)',
      },
      ...prev,
    ]);
    setNewOpponent('');
  };

  const handleLogVod = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = newVodUrl.trim();
    const hasEvidence = cleanUrl.startsWith('https://');
    setVods((prev) => [
      {
        id: `vod-${Date.now()}`,
        date: '2026-11-27',
        opponent: 'Logged Practice Match',
        mapName: sanitizePlainText(newVodMap, 40),
        result: sanitizePlainText(newVodResult, 30),
        evidenceType: hasEvidence ? 'Evidence-Backed (VOD Linked)' : 'Self-Reported',
        vodUrl: hasEvidence ? cleanUrl : '',
        timestamps: sanitizePlainText(newVodStamp, 140) || 'No timestamp markers added',
        takeaway: 'Logged in Clan HQ for post-match review.',
      },
      ...prev,
    ]);
    setNewVodUrl('');
    setNewVodStamp('');
  };

  const handleCreateInvite = (role: ClanRole) => {
    const code = `R1-${role.toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setInvites((prev) => [
      {
        id: `inv-${Date.now()}`,
        code,
        role,
        expiresAt: 'Expires in 7 days (2026-12-04)',
        revoked: false,
      },
      ...prev,
    ]);
  };

  const cycleVeto = (mapId: string) => {
    setVetoStates((prev) => {
      const cur = prev[mapId] || 'neutral';
      const next = cur === 'neutral' ? 'ban' : cur === 'ban' ? 'pick' : 'neutral';
      return { ...prev, [mapId]: next };
    });
  };

  return (
    <div className="space-y-10">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8C8982]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigatePath('/', 'Game Hubs')}
            className="inline-flex items-center gap-1.5 text-[#C9A86A] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Game Hubs
          </button>
          <span>/</span>
          <span className="text-[#F3F1EC]">Clan HQ · {slug}</span>
        </div>
        <span className="font-mono text-[#F59E0B]">
          {cloudSynced
            ? 'Cloud Playbooks & Admin RBAC Synced · Starter Scrim Fixtures Local'
            : 'Local Starter Demo Mode (Local Storage is Not Shared Secure Persistence)'}
        </span>
      </div>

      {/* Co-Founder & Admin Google Auth / Firebase RBAC Panel */}
      <CoFounderAccessPanel
        currentUserEmail={currentUserEmail}
        currentUserName={currentUserName}
        isAuthorizedAdmin={isAuthorizedAdmin}
        authLoading={authLoading}
        cloudSynced={cloudSynced}
        cofounders={cofounders}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onAddCoFounder={onAddCoFounder}
        onRemoveCoFounder={onRemoveCoFounder}
      />

      {/* Opt-In Public Clan HQ Card & Recruitment Referral Link */}
      <section className="bg-[#111319] border border-[#22252E] rounded-lg p-6 lg:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#22252E]">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#C9A86A]">
              Opt-In Public Clan HQ · Explicit Field Allowlist
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#F3F1EC]">
              Rule One Competitive Division
            </h1>
            <p className="text-xs text-[#A8A59E]">
              Primary Title: Call of Duty: Modern Warfare 4 (2026) · No public emails, no direct
              messages, and no private team telemetry exposed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPublicOptIn((p) => !p)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md border transition-colors ${
                publicOptIn
                  ? 'border-[#4ADE80]/40 bg-[#4ADE80]/10 text-[#4ADE80]'
                  : 'border-[#2B2F3A] bg-[#181B23] text-[#9C9A94]'
              }`}
            >
              Public Directory: {publicOptIn ? 'Opted In' : 'Private Only'}
            </button>

            <button
              type="button"
              onClick={() => void handleCopyRecruit()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-md transition-colors"
            >
              {copiedRecruit ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Recruit Link Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  Copy Referral Invite
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-[#0D0F14] border border-[#22252E] rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Link2 className="w-4 h-4 text-[#C9A86A] shrink-0" aria-hidden="true" />
            <span className="font-mono text-[#D6D3CB] truncate">{recruitUrl}</span>
          </div>
          <span className="text-[#8C8982] shrink-0">Referral attribution: ?ref=rule-one-hq</span>
        </div>

        {/* Private Roster, Roles & Invitations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <h2 className="font-display text-lg font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C9A86A]" aria-hidden="true" />
              Roster, Roles &amp; Availability
            </h2>
            <div className="overflow-x-auto border border-[#22252E] rounded-md bg-[#0D0F14]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#22252E] text-[#8C8982]">
                    <th className="py-2.5 px-4 font-medium">Player</th>
                    <th className="py-2.5 px-3 font-medium">Clan Role</th>
                    <th className="py-2.5 px-3 font-medium">Availability</th>
                    <th className="py-2.5 px-4 font-medium text-right">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B1E26]">
                  {roster.map((m) => (
                    <tr key={m.id}>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() =>
                            onNavigatePath(`/players/${m.profileSlug}`, `${m.handle} Profile`)
                          }
                          className="font-medium text-[#F3F1EC] hover:text-[#C9A86A]"
                        >
                          {m.handle}
                        </button>
                        <p className="text-[11px] text-[#8C8982]">{m.primaryRole}</p>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          aria-label={`Role for ${m.handle}`}
                          value={m.role}
                          disabled={m.role === 'owner'}
                          onChange={(e) => {
                            const nextRole = e.target.value as ClanRole;
                            setRoster((prev) =>
                              prev.map((row) =>
                                row.id === m.id ? { ...row, role: nextRole } : row
                              )
                            );
                          }}
                          className="bg-[#14171F] border border-[#252934] rounded px-2 py-1 text-xs text-[#F3F1EC] disabled:opacity-60"
                        >
                          <option value="owner">owner</option>
                          <option value="admin">admin</option>
                          <option value="captain">captain</option>
                          <option value="member">member</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-[#A8A59E]">
                        <p>{m.availability}</p>
                        <p className="text-[10px] text-[#7D7B75]">{m.timezone}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-[#4ADE80] tabular-nums">
                        {m.attendancePct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <h2 className="font-display text-lg font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C9A86A]" aria-hidden="true" />
              Expiring Invites &amp; Revocation
            </h2>
            <div className="bg-[#0D0F14] border border-[#22252E] rounded-md p-4 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCreateInvite('member')}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded"
                >
                  + Member Invite
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateInvite('captain')}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-[#F3F1EC] bg-[#181B23] hover:bg-[#222632] border border-[#2B2F3A] rounded"
                >
                  + Captain Invite
                </button>
              </div>
              <div className="divide-y divide-[#1B1E26]">
                {invites.map((inv) => (
                  <div key={inv.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <p
                        className={`font-mono font-medium truncate ${
                          inv.revoked ? 'line-through text-[#7D7B75]' : 'text-[#F3F1EC]'
                        }`}
                      >
                        {inv.code} ({inv.role})
                      </p>
                      <p className="text-[10px] text-[#8C8982]">{inv.expiresAt}</p>
                    </div>
                    {!inv.revoked && (
                      <button
                        type="button"
                        onClick={() =>
                          setInvites((prev) =>
                            prev.map((x) => (x.id === inv.id ? { ...x, revoked: true } : x))
                          )
                        }
                        className="text-[11px] text-[#F87171] hover:underline shrink-0"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mutual-Acceptance Scrim Scheduler & VOD Timestamped Match Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C9A86A]" aria-hidden="true" />
              Mutual-Acceptance Scrim Scheduler
            </h2>
            <p className="text-xs text-[#8C8982] mt-0.5">
              Zero wagering — timezone-aware practice scheduling with mutual confirmation &amp;
              cancellation
            </p>
          </div>

          <form onSubmit={handleProposeScrim} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="text"
              value={newOpponent}
              onChange={(e) => setNewOpponent(e.target.value)}
              placeholder="Opponent clan name"
              aria-label="Opponent clan name"
              className="sm:col-span-5 px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded text-[#F3F1EC]"
            />
            <input
              type="text"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              aria-label="Scrim date and time"
              className="sm:col-span-4 px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded text-[#F3F1EC]"
            />
            <select
              value={newTz}
              onChange={(e) => setNewTz(e.target.value)}
              aria-label="Timezone"
              className="sm:col-span-3 px-2 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded text-[#F3F1EC]"
            >
              <option value="America/New_York (EST)">EST</option>
              <option value="America/Chicago (CST)">CST</option>
              <option value="America/Los_Angeles (PST)">PST</option>
              <option value="Europe/London (GMT)">GMT</option>
            </select>
            <button
              type="submit"
              className="sm:col-span-12 px-4 py-2 text-xs font-semibold text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded"
            >
              Propose Practice Scrim Block
            </button>
          </form>

          <div className="space-y-2.5">
            {scrims.map((sc) => (
              <div
                key={sc.id}
                className="p-4 bg-[#0D0F14] border border-[#22252E] rounded-md space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[#F3F1EC]">{sc.opponent}</p>
                  <span
                    className={`font-mono text-[11px] ${
                      sc.status === 'Mutually Accepted'
                        ? 'text-[#4ADE80]'
                        : sc.status === 'Cancelled'
                        ? 'text-[#F87171]'
                        : 'text-[#F59E0B]'
                    }`}
                  >
                    {sc.status}
                  </span>
                </div>
                <p className="text-xs text-[#8C8982]">
                  {sc.mapPool} · {sc.scheduledFor} ({sc.timezone})
                </p>
                {sc.status !== 'Cancelled' && (
                  <div className="flex gap-3 pt-1 text-xs">
                    {sc.status !== 'Mutually Accepted' && (
                      <button
                        type="button"
                        onClick={() =>
                          setScrims((prev) =>
                            prev.map((x) =>
                              x.id === sc.id ? { ...x, status: 'Mutually Accepted' } : x
                            )
                          )
                        }
                        className="text-[#4ADE80] hover:underline"
                      >
                        Confirm Mutual Acceptance
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setScrims((prev) =>
                          prev.map((x) => (x.id === sc.id ? { ...x, status: 'Cancelled' } : x))
                        )
                      }
                      className="text-[#F87171] hover:underline"
                    >
                      Cancel Slot
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-6 bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
              <Video className="w-4 h-4 text-[#C9A86A]" aria-hidden="true" />
              VOD Timestamped Match Logs
            </h2>
            <p className="text-xs text-[#8C8982] mt-0.5">
              Differentiates Self-Reported manual results from Evidence-Backed VOD links
            </p>
          </div>

          <form onSubmit={handleLogVod} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={newVodMap}
              onChange={(e) => setNewVodMap(e.target.value)}
              placeholder="Map name (e.g. Coal)"
              className="px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded text-[#F3F1EC]"
            />
            <input
              type="text"
              value={newVodResult}
              onChange={(e) => setNewVodResult(e.target.value)}
              placeholder="Result (e.g. 6 – 4 Win)"
              className="px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded text-[#F3F1EC]"
            />
            <input
              type="url"
              value={newVodUrl}
              onChange={(e) => setNewVodUrl(e.target.value)}
              placeholder="Optional https:// VOD URL (YouTube/Twitch)"
              className="px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded text-[#F3F1EC]"
            />
            <input
              type="text"
              value={newVodStamp}
              onChange={(e) => setNewVodStamp(e.target.value)}
              placeholder="Key timestamps (e.g. 04:10 B-split)"
              className="px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded text-[#F3F1EC]"
            />
            <button
              type="submit"
              className="sm:col-span-2 px-4 py-2 text-xs font-medium text-[#F3F1EC] bg-[#181B23] hover:bg-[#222632] border border-[#2B2F3A] rounded"
            >
              Add Match Review Entry
            </button>
          </form>

          <div className="space-y-2.5">
            {vods.map((v) => (
              <div
                key={v.id}
                className="p-4 bg-[#0D0F14] border border-[#22252E] rounded-md space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#F3F1EC]">
                    {v.mapName} · {v.result}
                  </span>
                  <span
                    className={`font-mono text-[11px] ${
                      v.evidenceType.includes('Evidence-Backed')
                        ? 'text-[#4ADE80]'
                        : 'text-[#F59E0B]'
                    }`}
                  >
                    {v.evidenceType}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#C9A86A]">{v.timestamps}</p>
                <p className="text-xs text-[#8C8982]">{v.takeaway}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Interactive 12-Map MW4 Veto Planner & Moderation Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
                MW4 Core 6v6 Map Veto Planner
              </h2>
              <p className="text-xs text-[#8C8982]">
                Click any of the 12 verified launch 6v6 maps to cycle Neutral → Ban → Pick
              </p>
            </div>
            <span className="font-mono text-xs text-[#C9A86A]">
              Picks: {Object.values(vetoStates).filter((s) => s === 'pick').length} · Bans:{' '}
              {Object.values(vetoStates).filter((s) => s === 'ban').length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {coreMaps.map((m) => {
              const st = vetoStates[m.id] || 'neutral';
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => cycleVeto(m.id)}
                  className={`p-3 rounded-md border text-left transition-colors ${
                    st === 'pick'
                      ? 'bg-[#4ADE80]/10 border-[#4ADE80] text-[#F3F1EC]'
                      : st === 'ban'
                      ? 'bg-[#F87171]/10 border-[#F87171] text-[#A8A59E] line-through'
                      : 'bg-[#0D0F14] border-[#252934] text-[#D6D3CB] hover:border-[#C9A86A]'
                  }`}
                >
                  <p className="text-xs font-semibold">{m.name}</p>
                  <p className="font-mono text-[10px] mt-0.5 uppercase">
                    {st === 'neutral' ? 'Open' : st}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-4 bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#C9A86A]" aria-hidden="true" />
            Moderation &amp; Safety Report
          </h2>
          <p className="text-xs text-[#8C8982]">
            Report misconduct, age-safety concerns, or unauthorized data exposure. Direct messaging
            is disabled by design.
          </p>
          <textarea
            rows={3}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Describe issue for moderator review..."
            className="w-full px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded text-[#F3F1EC]"
          />
          <button
            type="button"
            onClick={() => {
              if (!reportText.trim()) return;
              setReportText('');
              setReportSubmitted(true);
            }}
            className="w-full px-4 py-2 text-xs font-medium text-[#F3F1EC] bg-[#181B23] hover:bg-[#222632] border border-[#2B2F3A] rounded"
          >
            Submit Moderation Report
          </button>
          {reportSubmitted && (
            <p className="text-xs text-[#4ADE80]">
              Report logged locally for moderator queue. Zero private emails exposed.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
