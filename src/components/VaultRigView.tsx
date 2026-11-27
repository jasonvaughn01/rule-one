import { useMemo, useState } from 'react';
import { Check, Download, RotateCcw } from 'lucide-react';
import {
  HERO_PENTHOUSE_IMAGE,
  MW4_LOADOUT_PRESETS,
  RIG_UPGRADES,
  VAULT_CONTROLLER_IMAGE,
  formatCurrency,
} from '../data/mw4CdlData';
import { ClubState, LedgerEntry, RigUpgrade } from '../types';
import { CoFounderAccessPanel, CoFounderRecord } from './CoFounderAccessPanel';
import { ResilientImage } from './ResilientImage';

interface VaultRigViewProps {
  clubState: ClubState;
  totalEdgeBonus: number;
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
  onAcquireRig: (upgrade: RigUpgrade) => boolean;
  onSelectLoadout: (loadoutId: string) => void;
  onWireFunds: (amount: number) => void;
  onTransferReserve: (amount: number) => boolean;
  onResetCareer: () => void;
}

const VALIDATOR_OPTIONS = {
  primaries: [
    { label: 'HAN 86 (AR)', legal: true, reason: 'CDL v1.0 Legal · Premier MW4 Main AR' },
    { label: 'M4 Base Frame (AR)', legal: true, reason: 'CDL v1.0 Legal · Hybrid Flex AR' },
    { label: 'VEL-46 (SMG)', legal: true, reason: 'CDL v1.0 Legal · Meta Entry SMG' },
    { label: 'ISO Nightshade (SMG)', legal: true, reason: 'CDL v1.0 Legal · Close-Quarters SMG' },
    {
      label: 'Astaroth .57 (Sniper)',
      legal: false,
      reason: 'BANNED under CDL Competitive Settings v1.0',
    },
    {
      label: 'Signal 50 (Sniper)',
      legal: false,
      reason: 'BANNED under CDL Competitive Settings v1.0',
    },
  ],
  attachments: [
    { label: 'Compensator + Recoil Barrel', legal: true, reason: 'CDL v1.0 Legal' },
    {
      label: 'APEX M16 Burst Conversion',
      legal: false,
      reason: 'BANNED · All MW4 APEX attachments are restricted in CDL v1.0',
    },
    {
      label: 'Tactical ADS Laser',
      legal: false,
      reason: 'BANNED · All Lasers are restricted in CDL v1.0',
    },
    {
      label: 'Bruen THRM-60 Thermal Optic',
      legal: false,
      reason: 'BANNED · Thermal & Night View optics prohibited in CDL v1.0',
    },
  ],
  equipment: [
    { label: 'Stun + Frag / Trophy System', legal: true, reason: 'CDL v1.0 Legal S&D Kit' },
    { label: 'Smoke (1/Squad) + Semtex / Dead Silence', legal: true, reason: 'CDL v1.0 Legal S&D Kit' },
    {
      label: 'Flash / Snapshot + Drill Charge',
      legal: false,
      reason: 'BANNED · Flash, Snapshot, Drill Charge, C4, and Mines are prohibited',
    },
    {
      label: 'Portable Radar / DDOS',
      legal: false,
      reason: 'BANNED · Restricted Field Upgrades under CDL v1.0',
    },
  ],
};

export function VaultRigView({
  clubState,
  totalEdgeBonus,
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
  onAcquireRig,
  onSelectLoadout,
  onWireFunds,
  onTransferReserve,
  onResetCareer,
}: VaultRigViewProps) {
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'matches' | 'club'>('all');
  const [rigFeedback, setRigFeedback] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Interactive MW4 CDL v1.0 Loadout Compliance Checker
  const [testPrimaryIdx, setTestPrimaryIdx] = useState(0);
  const [testAttachIdx, setTestAttachIdx] = useState(0);
  const [testEquipIdx, setTestEquipIdx] = useState(0);

  const selectedPrimary = VALIDATOR_OPTIONS.primaries[testPrimaryIdx];
  const selectedAttach = VALIDATOR_OPTIONS.attachments[testAttachIdx];
  const selectedEquip = VALIDATOR_OPTIONS.equipment[testEquipIdx];
  const isBuildCompliant = selectedPrimary.legal && selectedAttach.legal && selectedEquip.legal;

  const filteredLedger = useMemo(() => {
    return clubState.ledger.filter((entry) => {
      if (ledgerFilter === 'matches') {
        return entry.type === 'match_win' || entry.type === 'match_loss';
      }
      if (ledgerFilter === 'club') {
        return entry.type !== 'match_win' && entry.type !== 'match_loss';
      }
      return true;
    });
  }, [clubState.ledger, ledgerFilter]);

  const handleBuyRig = (upgrade: RigUpgrade) => {
    const ok = onAcquireRig(upgrade);
    if (ok) {
      setRigFeedback(`Installed ${upgrade.name} (+${upgrade.edgeBonus.toFixed(1)}% S&D edge).`);
    } else {
      setRigFeedback(`Insufficient liquid treasury for ${upgrade.name}. Wire dividend funds first.`);
    }
  };

  const handleDownloadCsv = () => {
    const header = ['Timestamp', 'Type', 'Title', 'Details', 'Scoreline', 'AmountUSD'];
    const rows = clubState.ledger.map((e: LedgerEntry) => [
      e.timestamp,
      e.type,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.subtitle.replace(/"/g, '""')}"`,
      e.scoreline || '',
      String(e.amount),
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rule-one-mw4-cdl-ledger.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      {/* Founder & Co-Founder Live Cloud Access Panel */}
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

      {/* Top Penthouse Suite & Treasury Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-[#111319] border border-[#22252E] rounded-lg p-8 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-[#C9A86A]">
              Suite 74A · Modern Warfare 4 (2026) Pro Loadouts &amp; Treasury
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#F3F1EC] text-balance">
              MW4 CDL v1.0 Loadout Lab &amp; Private Vault
            </h1>
            <p className="text-sm text-[#A8A59E] leading-relaxed">
              Lock in CDL Competitive Settings v1.0 legal classes built around the HAN 86, M4,
              VEL-46, ISO Nightshade, and Sang 9mm, validate attachments against APEX and Laser
              bans, and fund private six-figure S&amp;D scrim blocks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#22252E]">
            <div>
              <p className="text-xs text-[#8C8982]">Liquid Scrim Treasury</p>
              <p className="font-mono text-2xl font-semibold text-[#F3F1EC] tabular-nums mt-1">
                {formatCurrency(clubState.treasury)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8C8982]">Offshore Reserve</p>
              <p className="font-mono text-2xl font-semibold text-[#A8A59E] tabular-nums mt-1">
                {formatCurrency(clubState.offshoreReserve)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8C8982]">Active S&amp;D Edge</p>
              <p className="font-mono text-2xl font-semibold text-[#C9A86A] tabular-nums mt-1">
                +{totalEdgeBonus.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onWireFunds(1000000)}
              className="px-4 py-2 text-xs font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-md transition-colors whitespace-nowrap"
            >
              Wire +$1,000,000 Dividend
            </button>
            <button
              type="button"
              disabled={clubState.treasury < 500000}
              onClick={() => onTransferReserve(500000)}
              className="px-4 py-2 text-xs font-medium text-[#F3F1EC] bg-[#181B23] hover:bg-[#222632] disabled:opacity-40 border border-[#2B2F3A] rounded-md transition-colors whitespace-nowrap"
            >
              Bank $500,000 to Reserve
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-rows-2 gap-4">
          <div className="relative rounded-lg overflow-hidden border border-[#22252E] min-h-[160px]">
            <ResilientImage
              src={VAULT_CONTROLLER_IMAGE}
              alt="Bespoke carbon-fiber and champagne gold Modern Warfare 4 pro controller"
              fallbackLabel="Carbon-Gold MW4 Pro Controller"
              className="w-full h-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#090A0D]/85 via-transparent to-transparent"
            />
            <p className="absolute bottom-3 left-4 text-xs font-medium text-[#F3F1EC]">
              MW4 Tuning · 0.2ms Optical Triggers &amp; Hall-Effect Sticks
            </p>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-[#22252E] min-h-[160px]">
            <ResilientImage
              src={HERO_PENTHOUSE_IMAGE}
              alt="Private penthouse gaming lounge overlooking city skyline"
              fallbackLabel="Penthouse Suite 74A CDL Node"
              className="w-full h-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#090A0D]/85 via-transparent to-transparent"
            />
            <p className="absolute bottom-3 left-4 text-xs font-medium text-[#F3F1EC]">
              Suite 74A · Dedicated Dark Fiber CDL Node
            </p>
          </div>
        </div>
      </section>

      {/* Active MW4 CDL v1.0 Meta Loadout Selector */}
      <section className="bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-5">
        <div className="pb-4 border-b border-[#22252E]">
          <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
            Official MW4 CDL v1.0 Active S&amp;D Loadout
          </h2>
          <p className="text-xs text-[#8C8982] mt-0.5">
            Select your primary class preset for Map Control simulations and CDL Match Desk scrims
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MW4_LOADOUT_PRESETS.map((preset) => {
            const active = clubState.activeLoadoutId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectLoadout(preset.id)}
                className={`p-5 rounded-md border text-left transition-colors flex flex-col justify-between gap-4 ${
                  active
                    ? 'border-[#C9A86A] bg-[#181B23]'
                    : 'border-[#232732] bg-[#14171F] hover:border-[#343A4A]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#C9A86A]">{preset.role}</span>
                    <span className="font-mono text-xs text-[#4ADE80] tabular-nums shrink-0">
                      +{preset.edgeBonus.toFixed(1)}%
                    </span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-[#F3F1EC]">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-[#D6D3CB]">{preset.primary}</p>
                  <p className="text-xs text-[#8C8982]">
                    {preset.secondary} · {preset.tactical} · {preset.lethal} ·{' '}
                    {preset.fieldUpgrade}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#22252E] flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[#9C9A94] truncate">
                    {preset.tuning}
                  </span>
                  {active && (
                    <span className="inline-flex items-center gap-1 text-[#C9A86A] font-medium shrink-0 ml-2">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" /> Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive CDL v1.0 Loadout Compliance Validator */}
      <section className="bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#22252E]">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
              CDL Competitive Settings v1.0 — Class Compliance Checker
            </h2>
            <p className="text-xs text-[#8C8982] mt-0.5">
              Test MW4 weapons, APEX conversions, optics, and equipment against official v1.0 rules
            </p>
          </div>
          <span
            className={`font-mono text-xs font-semibold ${
              isBuildCompliant ? 'text-[#4ADE80]' : 'text-[#F87171]'
            }`}
          >
            {isBuildCompliant ? 'Status: CDL v1.0 Compliant' : 'Status: Restricted Item Detected'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="mw4-primary-sel" className="block text-xs text-[#9C9A94]">
              Primary Weapon
            </label>
            <select
              id="mw4-primary-sel"
              value={testPrimaryIdx}
              onChange={(e) => setTestPrimaryIdx(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-[#0E1016] border border-[#252934] rounded-md text-[#F3F1EC] focus:border-[#C9A86A] focus:outline-none"
            >
              {VALIDATOR_OPTIONS.primaries.map((p, idx) => (
                <option key={p.label} value={idx}>
                  {p.label}
                </option>
              ))}
            </select>
            <p
              className={`text-xs ${
                selectedPrimary.legal ? 'text-[#4ADE80]' : 'text-[#F87171]'
              }`}
            >
              {selectedPrimary.reason}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="mw4-attach-sel" className="block text-xs text-[#9C9A94]">
              Attachment / Optic Slot
            </label>
            <select
              id="mw4-attach-sel"
              value={testAttachIdx}
              onChange={(e) => setTestAttachIdx(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-[#0E1016] border border-[#252934] rounded-md text-[#F3F1EC] focus:border-[#C9A86A] focus:outline-none"
            >
              {VALIDATOR_OPTIONS.attachments.map((a, idx) => (
                <option key={a.label} value={idx}>
                  {a.label}
                </option>
              ))}
            </select>
            <p
              className={`text-xs ${
                selectedAttach.legal ? 'text-[#4ADE80]' : 'text-[#F87171]'
              }`}
            >
              {selectedAttach.reason}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="mw4-equip-sel" className="block text-xs text-[#9C9A94]">
              Equipment &amp; Field Upgrade
            </label>
            <select
              id="mw4-equip-sel"
              value={testEquipIdx}
              onChange={(e) => setTestEquipIdx(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-[#0E1016] border border-[#252934] rounded-md text-[#F3F1EC] focus:border-[#C9A86A] focus:outline-none"
            >
              {VALIDATOR_OPTIONS.equipment.map((eq, idx) => (
                <option key={eq.label} value={idx}>
                  {eq.label}
                </option>
              ))}
            </select>
            <p
              className={`text-xs ${
                selectedEquip.legal ? 'text-[#4ADE80]' : 'text-[#F87171]'
              }`}
            >
              {selectedEquip.reason}
            </p>
          </div>
        </div>
      </section>

      {/* Penthouse Hardware & Infrastructure Upgrades */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#F3F1EC]">
              Penthouse Suite 74A — MW4 Competitive Rig
            </h2>
            <p className="text-xs text-[#8C8982] mt-1">
              Commission permanent hardware and coaching upgrades for MW4 S&amp;D lobbies
            </p>
          </div>
          {rigFeedback && <p className="text-xs font-medium text-[#C9A86A]">{rigFeedback}</p>}
        </div>

        <div className="bg-[#111319] border border-[#22252E] rounded-lg divide-y divide-[#22252E]">
          {RIG_UPGRADES.map((item) => {
            const owned = clubState.ownedRigIds.includes(item.id);
            const canAfford = clubState.treasury >= item.price;
            return (
              <div
                key={item.id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <p className="text-xs text-[#C9A86A]">
                    {item.category} · +{item.edgeBonus.toFixed(1)}% S&amp;D Edge
                  </p>
                  <h3 className="font-display text-base font-semibold text-[#F3F1EC]">
                    {item.name}
                  </h3>
                  <p className="text-xs font-mono text-[#9C9A94]">{item.specSummary}</p>
                  <p className="text-sm text-[#A8A59E] pt-1">{item.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-sm font-semibold text-[#F3F1EC] tabular-nums">
                    {formatCurrency(item.price)}
                  </span>
                  {owned ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#4ADE80] border border-[#4ADE80]/30 bg-[#4ADE80]/10 rounded-md whitespace-nowrap">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      Installed
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleBuyRig(item)}
                      className="px-4 py-2 text-xs font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors whitespace-nowrap"
                    >
                      Acquire Upgrade
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Private Accounting Ledger */}
      <section className="bg-[#111319] border border-[#22252E] rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-[#22252E] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
              MW4 S&amp;D Private Accounting Ledger
            </h2>
            <div className="flex items-center gap-1 p-1 bg-[#0E1016] border border-[#22252E] rounded-md">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'matches', label: 'S&D Scrims' },
                  { id: 'club', label: 'Treasury & Rig' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLedgerFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    ledgerFilter === tab.id
                      ? 'bg-[#222632] text-[#F3F1EC]'
                      : 'text-[#8C8982] hover:text-[#F3F1EC]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#F3F1EC] bg-[#181B23] hover:bg-[#222632] border border-[#2B2F3A] rounded-md transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Download CSV
            </button>

            {confirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetCareer();
                    setConfirmReset(false);
                  }}
                  className="px-3 py-2 text-xs font-medium text-[#090A0D] bg-[#F87171] hover:bg-[#FCA5A5] rounded-md transition-colors whitespace-nowrap"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-2 text-xs text-[#9C9A94] hover:text-[#F3F1EC]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-[#9C9A94] hover:text-[#F3F1EC] border border-[#252934] rounded-md transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#22252E] text-xs text-[#8C8982]">
                <th className="py-3 px-6 font-medium">Transaction</th>
                <th className="py-3 px-4 font-medium">Map Score</th>
                <th className="py-3 px-6 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2028]">
              {filteredLedger.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#161922] transition-colors">
                  <td className="py-3.5 px-6">
                    <p className="text-sm font-medium text-[#F3F1EC]">{entry.title}</p>
                    <p className="text-xs text-[#8C8982] mt-0.5">
                      {entry.subtitle} · {entry.timestamp}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-[#A8A59E] tabular-nums whitespace-nowrap">
                    {entry.scoreline || '—'}
                  </td>
                  <td
                    className={`py-3.5 px-6 font-mono text-sm font-medium text-right tabular-nums whitespace-nowrap ${
                      entry.amount >= 0 ? 'text-[#4ADE80]' : 'text-[#F3F1EC]'
                    }`}
                  >
                    {formatCurrency(entry.amount, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
