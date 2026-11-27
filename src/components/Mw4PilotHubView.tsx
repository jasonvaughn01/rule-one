import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileWarning,
  Layers,
  Map as MapIcon,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import {
  EVIDENCE_CLASSIFICATION_LEGEND,
  MW4_CANDIDATE_WEAPONS,
  MW4_EVALUATED_BUILDS,
  MW4_MAP_ENUMERATION,
  MW4_PATCH_DIFFS,
  MW4_SUPPORTING_MAP_SOURCES,
} from '../data/intelligencePipeline';
import { SavedPlaybook } from '../data/sndMaps';
import { Mw4BuildDraft, validateMw4Build } from '../lib/validators';
import { ClubState, InterfaceMode, Mw4MapId } from '../types';
import { MapControlView } from './MapControlView';

export type Mw4SubSection = 'maps' | 'builds' | 'patches' | 'ranked';

interface Mw4PilotHubViewProps {
  subSection: Mw4SubSection;
  activeMapSlug?: string;
  activeBuildSlug?: string;
  activePatchSlug?: string;
  interfaceMode?: InterfaceMode;
  clubState: ClubState;
  totalEdgeBonus: number;
  savedPlaybooks: SavedPlaybook[];
  onSavePlaybook: (play: SavedPlaybook) => void;
  onDeletePlaybook: (id: string) => void;
  onNavigatePath: (path: string, label?: string) => void;
}

const BUILD_WEAPONS = [
  'M4 Base Frame (AR)',
  'HAN 86 (AR)',
  'VEL-46 (SMG)',
  'ISO Nightshade (SMG)',
  'Astaroth .57 (Sniper)',
  'Signal 50 (Sniper)',
];

const BUILD_ATTACHMENTS = [
  'Compensator Muzzle',
  'Long Recoil Barrel',
  'Angled Grip Underbarrel',
  'Stippled Rear Grip',
  'Lightweight Stock',
  'Low-Profile Reflex Optic',
  'APEX M16 Burst Conversion',
  'Tactical ADS Laser',
  'Bruen THRM-60 Thermal Optic',
];

const BUILD_TACTICALS = ['Stun Grenade', 'Smoke Grenade', 'Flash Grenade', 'Snapshot Grenade'];
const BUILD_LETHALS = ['Frag Grenade', 'Semtex', 'Drill Charge'];
const BUILD_FIELD = ['Trophy System', 'Dead Silence', 'Portable Radar'];

export function Mw4PilotHubView({
  subSection,
  activeMapSlug,
  activeBuildSlug,
  activePatchSlug,
  interfaceMode = 'standard',
  clubState,
  totalEdgeBonus,
  savedPlaybooks,
  onSavePlaybook,
  onDeletePlaybook,
  onNavigatePath,
}: Mw4PilotHubViewProps) {
  // Interactive Build Creator & Saved Builds state
  const initialBuild =
    MW4_EVALUATED_BUILDS.find((b) => b.slug === activeBuildSlug)?.build ||
    MW4_EVALUATED_BUILDS[0].build;

  const [draftBuild, setDraftBuild] = useState<Mw4BuildDraft>(initialBuild);
  const [compareLeftSlug, setCompareLeftSlug] = useState<string>(MW4_EVALUATED_BUILDS[0].slug);
  const [compareRightSlug, setCompareRightSlug] = useState<string>(MW4_EVALUATED_BUILDS[2].slug);
  const [savedBuilds, setSavedBuilds] = useState<Mw4BuildDraft[]>(() =>
    MW4_EVALUATED_BUILDS.map((b) => b.build)
  );
  const [flaggedPatchItems, setFlaggedPatchItems] = useState<string[]>([
    'APEX M16 Burst Conversion',
  ]);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, 'draft_review' | 'approved' | 'blocked'>>({
    'rt-1': 'blocked',
    'rt-2': 'draft_review',
    'rt-3': 'draft_review',
    'rt-4': 'approved',
  });

  const validation = useMemo(
    () => validateMw4Build(draftBuild, flaggedPatchItems, false),
    [draftBuild, flaggedPatchItems]
  );

  const toggleAttachment = (att: string) => {
    setDraftBuild((prev) => {
      const exists = prev.attachments.includes(att);
      if (exists) {
        return { ...prev, attachments: prev.attachments.filter((a) => a !== att) };
      }
      if (prev.attachments.length >= 6) return prev;
      return { ...prev, attachments: [...prev.attachments, att] };
    });
  };

  const handleSaveBuild = () => {
    const entry: Mw4BuildDraft = {
      ...draftBuild,
      id: `custom-${Date.now()}`,
      name: draftBuild.name.trim() || `${draftBuild.primaryWeapon} Custom`,
    };
    setSavedBuilds((prev) => [entry, ...prev]);
  };

  const simulatePatchFlag = (itemName: string) => {
    setFlaggedPatchItems((prev) =>
      prev.includes(itemName) ? prev.filter((i) => i !== itemName) : [...prev, itemName]
    );
  };

  const launch6v6Count = MW4_MAP_ENUMERATION.filter((m) => m.modePool === 'Core 6v6 Launch').length;
  const interactiveCount = MW4_MAP_ENUMERATION.filter((m) => m.hasInteractiveCanvas).length;

  return (
    <div className="space-y-8">
      {/* Breadcrumb + Back Navigation */}
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
          <span className="text-[#F3F1EC]">Call of Duty: Modern Warfare 4 (2026)</span>
          <span>/</span>
          <span className="capitalize text-[#C9A86A]">{subSection}</span>
        </div>

        <span className="font-mono text-[#4ADE80]">
          Official Launch Facts Verified · 2026-11-27
        </span>
      </div>

      {/* Sub-Navigation Bar for MW4 Pilot Vertical */}
      <div className="bg-[#111319] border border-[#22252E] rounded-lg p-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              {
                id: 'maps',
                label: 'Maps & Interactive S&D Canvas',
                path: `/games/modern-warfare-4/maps/${activeMapSlug || 'coal'}`,
                icon: MapIcon,
              },
              {
                id: 'builds',
                label: 'Weapon Builds & Validator',
                path: `/games/modern-warfare-4/builds/${activeBuildSlug || 'm4-vel46-hypothesis'}`,
                icon: Wrench,
              },
              {
                id: 'patches',
                label: 'Patch Diffs & Review Queue',
                path: `/games/modern-warfare-4/patches/${activePatchSlug || 'season-1-launch'}`,
                icon: Layers,
              },
              {
                id: 'ranked',
                label: 'Ranked & CDL Ruleset Status',
                path: '/games/modern-warfare-4/ranked',
                icon: ShieldAlert,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = subSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigatePath(tab.path, `MW4 · ${tab.label}`)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors ${
                  active
                    ? 'bg-[#C9A86A] text-[#090A0D] font-semibold'
                    : 'text-[#9C9A94] hover:text-[#F3F1EC] hover:bg-[#181B23]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigatePath('/developers', 'MW4 Developer Pipeline')}
            className="px-3 py-1.5 text-xs font-medium text-[#C9A86A] hover:underline transition-colors"
          >
            MW4 Developer Pipeline →
          </button>
          <button
            type="button"
            onClick={() => onNavigatePath('/ops', 'Report Correction')}
            className="px-3 py-1.5 text-xs text-[#9C9A94] hover:text-[#C9A86A] transition-colors"
          >
            Report Correction →
          </button>
        </div>
      </div>

      {/* SECTION 1: MAPS & PRESERVED INTERACTIVE S&D CANVAS */}
      {subSection === 'maps' && (
        <div className="space-y-8">
          <div className="bg-[#14161D] border border-[#2A303E] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[#A7AFBD] leading-relaxed">
                <strong className="text-[#F5F5F5]">Official MW4 Tac-Map Imagery Active:</strong>{' '}
                Tactical board below displays official Call of Duty: Modern Warfare 4 top-down
                Tac-Maps from callofduty.com with interactive 4v4 squad, utility, and route
                overlays (zero real-time opponent telemetry).
              </p>
            </div>
            <span className="font-mono text-[#D6B477] shrink-0">
              Coverage: {interactiveCount}/{launch6v6Count} Core 6v6 Canvases
            </span>
          </div>

          {/* Preserved MapControlView with real MW4 Tac-Map backgrounds and full tactical editing */}
          <MapControlView
            initialMapId={
              activeMapSlug === 'coal' ||
              activeMapSlug === 'lotus' ||
              activeMapSlug === 'munition' ||
              activeMapSlug === 'reactor_u92' ||
              activeMapSlug === 'rooftops' ||
              activeMapSlug === 'silkworm'
                ? activeMapSlug
                : undefined
            }
            clubState={clubState}
            totalEdgeBonus={totalEdgeBonus}
            savedPlaybooks={savedPlaybooks}
            onSavePlaybook={onSavePlaybook}
            onDeletePlaybook={onDeletePlaybook}
            onNavigate={() => onNavigatePath('/clans/rule-one', 'Rule One Clan HQ')}
            onLaunchMapScrim={(mapId: Mw4MapId) =>
              onNavigatePath(`/clans/rule-one`, `Schedule Scrim · ${mapId}`)
            }
          />

          {/* Official MW4 Complete Map Enumeration Table (Reconciling 6v6, Ground War & Gunfight) */}
          <section className="bg-[#111319] border border-[#22252E] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#22252E] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
                  MW4 (2026) Official Map Completeness Matrix
                </h2>
                <p className="text-xs text-[#8C8982] mt-0.5">
                  Separate reconciliation of Core 6v6 launch maps, post-launch Shipment, Ground War
                  32v32, and Gunfight / Kill Block pools
                </p>
              </div>
              <span className="font-mono text-xs text-[#4ADE80]">
                12 Launch 6v6 Verified · Oct 23, 2026
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#22252E] text-[#8C8982]">
                    <th className="py-3 px-6 font-medium">Map / Pool</th>
                    <th className="py-3 px-4 font-medium">Mode Pool</th>
                    <th className="py-3 px-4 font-medium">Evidence</th>
                    <th className="py-3 px-4 font-medium">Geometry Status</th>
                    <th className="py-3 px-6 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D2028]">
                  {MW4_MAP_ENUMERATION.map((m) => (
                    <tr key={m.id} className="hover:bg-[#161922] transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[#F5F5F5]">{m.name}</p>
                          {m.candidateModes && (
                            <span className="font-mono text-[11px] text-[#D6B477]">
                              ({m.candidateModes.join(' / ')})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#A7AFBD] mt-0.5">{m.officialReleaseNote}</p>
                        {m.cdlCandidateStatus && (
                          <p
                            className={`text-[11px] mt-0.5 ${
                              m.cdlCandidateStatus.startsWith('Candidate')
                                ? 'text-[#F59E0B]'
                                : 'text-[#8C8982]'
                            }`}
                          >
                            {m.cdlCandidateStatus}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#D6D3CB] whitespace-nowrap">{m.modePool}</td>
                      <td className="py-3 px-4 font-mono text-[#4ADE80] whitespace-nowrap">
                        {m.evidenceClass}
                      </td>
                      <td className="py-3 px-4 text-[#A7AFBD]">{m.geometryStatus}</td>
                      <td className="py-3 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          {m.officialGuideUrl && (
                            <a
                              href={m.officialGuideUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#A7AFBD] hover:text-[#F5F5F5]"
                            >
                              CoD Guide
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                          )}
                          {m.canvasMapId ? (
                            <button
                              type="button"
                              onClick={() =>
                                onNavigatePath(
                                  `/games/modern-warfare-4/maps/${m.canvasMapId}`,
                                  `${m.name} Tactical Map`
                                )
                              }
                              className="text-[#D6B477] font-medium hover:underline"
                            >
                              Open Canvas
                            </button>
                          ) : (
                            <span className="font-mono text-[#7D7B75]">Queued</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-[#22252E] bg-[#14161D] flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[#A7AFBD]">
                8 Candidate CDL Maps (Coal, Lithium, Lotus, Munition, Reactor U92, Rooftops,
                Sentry, Silkworm) &mdash; revalidate before Dec 4 lock:
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {MW4_SUPPORTING_MAP_SOURCES.map((src) => (
                  <a
                    key={src.url}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#D6B477] hover:underline whitespace-nowrap"
                  >
                    {src.label}
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SECTION 2: WEAPON BUILD CREATOR, MODE SEPARATION & PATCH INVALIDATION */}
      {subSection === 'builds' && (
        <div className="space-y-8">
          <div className="bg-[#14171F] border border-[#2B2F3A] rounded-lg p-4 text-xs text-[#D6D3CB] space-y-1.5">
            <p className="font-semibold text-[#F59E0B]">
              Hypothesis &amp; Mode-Separation Policy
            </p>
            <p className="leading-relaxed">
              Public Meta, Pro CDL Restrictions, and Ranked Play Restrictions are never equated.
              The predicted <strong>M4 / VEL-46 Ranked pairing is a hypothesis only</strong> until
              Activision publishes official MW4 Ranked Play rules and exact in-game attachment names
              are verified via documented testing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive Build Creator */}
            <div className="lg:col-span-7 bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#22252E]">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
                    MW4 Build Creator &amp; Compatibility Validator
                  </h2>
                  <p className="text-xs text-[#8C8982]">
                    Validates 5-slot Gunsmith cap, competitive bans, and live Patch Diff flags
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveBuild}
                  className="px-4 py-2 text-xs font-semibold text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-md transition-colors"
                >
                  Save Build to Workspace
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="mw4-build-name" className="block text-xs text-[#9C9A94]">
                    Build Label
                  </label>
                  <input
                    id="mw4-build-name"
                    type="text"
                    value={draftBuild.name}
                    onChange={(e) => setDraftBuild((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded-md text-[#F3F1EC] focus:border-[#C9A86A] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="mw4-build-primary" className="block text-xs text-[#9C9A94]">
                    Primary Weapon
                  </label>
                  <select
                    id="mw4-build-primary"
                    value={draftBuild.primaryWeapon}
                    onChange={(e) => setDraftBuild((p) => ({ ...p, primaryWeapon: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded-md text-[#F3F1EC] focus:border-[#C9A86A] focus:outline-none"
                  >
                    {BUILD_WEAPONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-[#9C9A94]">
                  Attachments ({draftBuild.attachments.length}/5 Standard Gunsmith Slots)
                </p>
                <div className="flex flex-wrap gap-2">
                  {BUILD_ATTACHMENTS.map((att) => {
                    const selected = draftBuild.attachments.includes(att);
                    const isRestricted =
                      att.includes('APEX') || att.includes('Laser') || att.includes('Thermal');
                    return (
                      <button
                        key={att}
                        type="button"
                        onClick={() => toggleAttachment(att)}
                        className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                          selected
                            ? isRestricted
                              ? 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]'
                              : 'bg-[#C9A86A]/15 text-[#C9A86A] border-[#C9A86A]'
                            : 'bg-[#0D0F14] text-[#A8A59E] border-[#252934] hover:text-[#F3F1EC]'
                        }`}
                      >
                        {att}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="mw4-tac" className="block text-xs text-[#9C9A94]">
                    Tactical
                  </label>
                  <select
                    id="mw4-tac"
                    value={draftBuild.tactical}
                    onChange={(e) => setDraftBuild((p) => ({ ...p, tactical: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded-md text-[#F3F1EC]"
                  >
                    {BUILD_TACTICALS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="mw4-lethal" className="block text-xs text-[#9C9A94]">
                    Lethal
                  </label>
                  <select
                    id="mw4-lethal"
                    value={draftBuild.lethal}
                    onChange={(e) => setDraftBuild((p) => ({ ...p, lethal: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded-md text-[#F3F1EC]"
                  >
                    {BUILD_LETHALS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="mw4-field" className="block text-xs text-[#9C9A94]">
                    Field Upgrade
                  </label>
                  <select
                    id="mw4-field"
                    value={draftBuild.fieldUpgrade}
                    onChange={(e) => setDraftBuild((p) => ({ ...p, fieldUpgrade: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded-md text-[#F3F1EC]"
                  >
                    {BUILD_FIELD.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3-Column Mode Comparison Output */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#22252E]">
                <div className="p-3.5 bg-[#0D0F14] border border-[#22252E] rounded-md">
                  <p className="text-[11px] text-[#8C8982]">Public Multiplayer</p>
                  <p
                    className={`font-mono text-xs font-semibold mt-1 ${
                      validation.publicLegal ? 'text-[#4ADE80]' : 'text-[#F87171]'
                    }`}
                  >
                    {validation.publicLegal ? 'Slot-Compatible' : 'Exceeds 5 Slots'}
                  </p>
                </div>
                <div className="p-3.5 bg-[#0D0F14] border border-[#22252E] rounded-md">
                  <p className="text-[11px] text-[#8C8982]">Pro CDL Check (Legacy Draft)</p>
                  <p
                    className={`font-mono text-xs font-semibold mt-1 ${
                      validation.cdlV1Legal ? 'text-[#C9A86A]' : 'text-[#F87171]'
                    }`}
                  >
                    {validation.cdlV1Legal ? 'Passes Draft Restrictions' : 'Restricted Item Found'}
                  </p>
                </div>
                <div className="p-3.5 bg-[#0D0F14] border border-[#22252E] rounded-md">
                  <p className="text-[11px] text-[#8C8982]">MW4 Ranked Play</p>
                  <p className="font-mono text-xs font-semibold text-[#F59E0B] mt-1">
                    Unknown — Official Rules Pending
                  </p>
                </div>
              </div>

              {validation.warnings.length > 0 && (
                <div className="p-3.5 bg-[#F87171]/10 border border-[#F87171]/30 rounded-md space-y-1">
                  {validation.warnings.map((w) => (
                    <p key={w} className="text-xs text-[#F87171]">
                      • {w}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Builds + Patch Diff Outdated Flagging */}
            <div className="lg:col-span-5 bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-5">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
                  Saved Builds &amp; Patch Invalidation
                </h2>
                <p className="text-xs text-[#8C8982] mt-0.5">
                  Test how a patch balance flag automatically marks impacted saved builds outdated
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['M4 Base Frame', 'VEL-46', 'APEX M16 Burst Conversion'].map((item) => {
                  const flagged = flaggedPatchItems.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => simulatePatchFlag(item)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
                        flagged
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]'
                          : 'bg-[#0D0F14] text-[#8C8982] border-[#252934] hover:text-[#F3F1EC]'
                      }`}
                    >
                      {flagged ? `Flagged in Patch: ${item}` : `Flag "${item}" in Patch Diff`}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {savedBuilds.map((sb) => {
                  const res = validateMw4Build(sb, flaggedPatchItems, false);
                  return (
                    <div
                      key={sb.id}
                      className="p-4 bg-[#0D0F14] border border-[#22252E] rounded-md space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setDraftBuild(sb)}
                          className="text-sm font-semibold text-[#F3F1EC] hover:text-[#C9A86A] text-left"
                        >
                          {sb.name}
                        </button>
                        <span
                          className={`font-mono text-[11px] shrink-0 ${
                            res.outdatedByPatch ? 'text-[#F59E0B]' : 'text-[#4ADE80]'
                          }`}
                        >
                          {res.outdatedByPatch ? 'Outdated by Patch' : 'Current Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-[#A8A59E]">
                        {sb.primaryWeapon} · {sb.attachments.length} attachments · {sb.fieldUpgrade}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side-by-Side Build Comparison */}
          <section className="bg-[#14161D] border border-[#2A303E] rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#F5F5F5]">
                  Side-by-Side Build Comparison
                </h2>
                <p className="text-xs text-[#A7AFBD]">
                  Compare role fit, attachment slots, and evidence status without fabricated TTK or
                  win-rate claims.
                </p>
              </div>
              <span className="font-mono text-xs text-[#D6B477]">
                {interfaceMode === 'professional' ? 'Pro Mode: Full Breakdown' : 'Standard Mode'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: 'Build A',
                  slug: compareLeftSlug,
                  onChange: setCompareLeftSlug,
                },
                {
                  label: 'Build B',
                  slug: compareRightSlug,
                  onChange: setCompareRightSlug,
                },
              ].map((slot) => {
                const chosen =
                  MW4_EVALUATED_BUILDS.find((b) => b.slug === slot.slug) ||
                  MW4_EVALUATED_BUILDS[0];
                return (
                  <div
                    key={slot.label}
                    className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-[#D6B477]">{slot.label}</span>
                      <select
                        aria-label={`Select ${slot.label}`}
                        value={slot.slug}
                        onChange={(e) => slot.onChange(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-[#0B0D12] border border-[#353D4B] rounded text-[#F5F5F5]"
                      >
                        {MW4_EVALUATED_BUILDS.map((eb) => (
                          <option key={eb.slug} value={eb.slug}>
                            {eb.build.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="text-[#F5F5F5] font-semibold">
                        {chosen.build.primaryWeapon} &middot; {chosen.role}
                      </p>
                      <p className="text-[#A7AFBD]">{chosen.tradeoffs}</p>
                      <p className="font-mono text-[#F59E0B]">
                        Evidence: {chosen.evidenceClass.replace('_', ' ')} &middot;{' '}
                        {chosen.build.attachments.length} attachments
                      </p>
                      <p className="text-[#A7AFBD]">
                        Utility: {chosen.build.tactical} / {chosen.build.lethal} /{' '}
                        {chosen.build.fieldUpgrade}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Explainable Meta Prediction Engine — 5 Candidate MW4 Weapons */}
          <section className="bg-[#14161D] border border-[#2A303E] rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#252A36]">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#F5F5F5]">
                  Explainable Meta Prediction Engine &mdash; 5 Discussed MW4 Candidates
                </h2>
                <p className="text-xs text-[#A7AFBD] mt-0.5">
                  All 5 weapons below are tracked as unverified candidates until official MW4
                  weapon stats &amp; CDL Dec 4 rules lock. Factors explain why a weapon is watched —
                  never presented as confirmed facts.
                </p>
              </div>
              <span className="font-mono text-xs text-[#F59E0B]">Predicted · Unverified</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MW4_CANDIDATE_WEAPONS.map((w) => (
                <article
                  key={w.id}
                  className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-display text-base font-semibold text-[#F5F5F5]">
                      {w.name}
                    </span>
                    <span className="font-mono text-[#D6B477]">{w.weaponClass}</span>
                  </div>
                  <p className="text-[11px] font-mono text-[#F59E0B]">{w.verificationStatus}</p>
                  <p className="text-xs text-[#F5F5F5]">Role Fit: {w.intendedRole}</p>

                  {interfaceMode === 'professional' ? (
                    <dl className="space-y-1.5 text-xs text-[#A7AFBD] pt-2 border-t border-[#2A303E]">
                      <div>
                        <dt className="text-[#F5F5F5] font-medium">Recoil Consistency</dt>
                        <dd>{w.predictionFactors.recoilConsistency}</dd>
                      </div>
                      <div>
                        <dt className="text-[#F5F5F5] font-medium">Handling &amp; Mobility</dt>
                        <dd>{w.predictionFactors.handlingAndMobility}</dd>
                      </div>
                      <div>
                        <dt className="text-[#F5F5F5] font-medium">Effective Range</dt>
                        <dd>{w.predictionFactors.effectiveRange}</dd>
                      </div>
                      <div>
                        <dt className="text-[#F5F5F5] font-medium">Restriction Risk</dt>
                        <dd>{w.predictionFactors.competitiveRestrictions}</dd>
                      </div>
                      <div>
                        <dt className="text-[#D6B477] font-medium">Counterplay</dt>
                        <dd>{w.counterplayNote}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-xs text-[#A7AFBD] pt-2 border-t border-[#2A303E]">
                      {w.predictionFactors.roleFit} {w.counterplayNote}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* Evaluated Build Provenance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MW4_EVALUATED_BUILDS.map((eb) => (
              <div
                key={eb.slug}
                className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="text-[#D6B477] uppercase">{eb.evidenceClass.replace('_', ' ')}</span>
                  <span className="text-[#A7AFBD]">{eb.build.patchVersion}</span>
                </div>
                <h3 className="font-display text-base font-semibold text-[#F5F5F5]">
                  {eb.build.name}
                </h3>
                <p className="text-xs text-[#A7AFBD]">{eb.tradeoffs}</p>
                {eb.hypothesisNotice && (
                  <p className="text-[11px] text-[#F59E0B] bg-[#14161D] border border-[#2A303E] rounded p-2.5">
                    {eb.hypothesisNotice}
                  </p>
                )}
                <p className="text-[11px] text-[#8C8982]">{eb.measurementNote}</p>
              </div>
            ))}
          </div>

          {/* 8-Class Evidence Classification Legend (Section 7) */}
          <section className="bg-[#14161D] border border-[#2A303E] rounded-xl p-5 space-y-3">
            <h2 className="font-display text-base font-semibold text-[#F5F5F5]">
              Rule One Evidence Classification Standards
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EVIDENCE_CLASSIFICATION_LEGEND.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-3 space-y-1"
                >
                  <p
                    className={`font-mono text-xs font-semibold ${
                      ev.tone === 'green'
                        ? 'text-[#4ADE80]'
                        : ev.tone === 'gold'
                        ? 'text-[#D6B477]'
                        : ev.tone === 'amber'
                        ? 'text-[#F59E0B]'
                        : ev.tone === 'red'
                        ? 'text-[#F87171]'
                        : 'text-[#A7AFBD]'
                    }`}
                  >
                    {ev.label}
                  </p>
                  <p className="text-[11px] text-[#A7AFBD] leading-relaxed">{ev.meaning}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* SECTION 3: PATCH DIFFS & EDITOR REVIEW QUEUE */}
      {subSection === 'patches' && (
        <div className="space-y-6">
          {MW4_PATCH_DIFFS.map((patch) => (
            <section
              key={patch.id}
              className="bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#22252E]">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-[#C9A86A]">
                    {patch.releaseDate} · Evidence: {patch.evidenceClass.toUpperCase()}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[#F3F1EC]">
                    {patch.patchName}
                  </h2>
                  <p className="text-xs text-[#A8A59E] max-w-3xl">{patch.summary}</p>
                </div>
                <a
                  href={patch.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#C9A86A] hover:underline"
                >
                  Official Source →
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#0D0F14] border border-[#22252E] rounded-md space-y-1.5">
                  <p className="font-medium text-[#F3F1EC]">Impacted Maps</p>
                  <p className="text-[#A8A59E]">{patch.impactedMaps.join(', ')}</p>
                </div>
                <div className="p-4 bg-[#0D0F14] border border-[#22252E] rounded-md space-y-1.5">
                  <p className="font-medium text-[#F3F1EC]">Impacted Rules &amp; Competitive Notes</p>
                  <ul className="space-y-1 text-[#A8A59E]">
                    {patch.impactedRules.map((r) => (
                      <li key={r}>• {r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-[#9C9A94]">
                  Editorial Draft Review Queue (No Auto-Invented Replacements)
                </p>
                <div className="divide-y divide-[#1D2028] border border-[#22252E] rounded-md bg-[#0D0F14]">
                  {patch.reviewTasks.map((task) => {
                    const currentStatus = taskStatuses[task.id] || task.status;
                    return (
                      <div
                        key={task.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-[#F3F1EC]">{task.target}</p>
                          <p className="text-[11px] text-[#8C8982]">{task.note}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`font-mono text-[11px] ${
                              currentStatus === 'approved'
                                ? 'text-[#4ADE80]'
                                : currentStatus === 'blocked'
                                ? 'text-[#F87171]'
                                : 'text-[#F59E0B]'
                            }`}
                          >
                            {currentStatus.replace('_', ' ')}
                          </span>
                          {currentStatus !== 'blocked' && (
                            <button
                              type="button"
                              onClick={() =>
                                setTaskStatuses((prev) => ({
                                  ...prev,
                                  [task.id]:
                                    currentStatus === 'approved' ? 'draft_review' : 'approved',
                                }))
                              }
                              className="px-2.5 py-1 text-[11px] bg-[#181B23] hover:bg-[#222632] border border-[#2B2F3A] text-[#F3F1EC] rounded"
                            >
                              {currentStatus === 'approved' ? 'Reopen Draft' : 'Mark Reviewed'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* SECTION 4: RANKED & CDL RULESET STATUS */}
      {subSection === 'ranked' && (
        <div className="space-y-6">
          <section className="bg-[#111319] border border-[#22252E] rounded-lg p-6 lg:p-8 space-y-5">
            <div className="flex items-start gap-3 pb-4 border-b border-[#22252E]">
              <FileWarning className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold text-[#F3F1EC]">
                  MW4 Ranked Play &amp; 2027 CDL Ruleset Verification
                </h1>
                <p className="text-xs text-[#F59E0B]">
                  Ranked-Legal Claims Disabled: Official Activision MW4 Ranked Play restriction
                  list has not been finalized yet. Legacy CDL v1.0 tables remain quarantined.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-[#0D0F14] border border-[#22252E] rounded-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#4ADE80]">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  VERIFIED OFFICIAL FACTS (Checked 2026-11-27)
                </div>
                <ul className="space-y-2 text-xs text-[#D6D3CB]">
                  <li>• Worldwide Launch: October 23, 2026 (Infinity Ward / Activision)</li>
                  <li>• 2027 Call of Duty League Kickoff: December 4, 2026</li>
                  <li>• Ranked Structure: 8 Skill Divisions (Bronze through Top 250)</li>
                  <li>• Competitive Modes: Hardpoint, Search &amp; Destroy, Control</li>
                  <li>• Launch Arsenal: 33 base weapons + Apex Attachments framework</li>
                </ul>
              </div>

              <div className="p-5 bg-[#0D0F14] border border-[#22252E] rounded-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  QUARANTINED / PENDING OFFICIAL LOCK
                </div>
                <ul className="space-y-2 text-xs text-[#A8A59E]">
                  <li>• Exact Ranked Play banned weapon &amp; Apex Attachment roster</li>
                  <li>• Final official 2027 CDL S&amp;D map pool (6 of 12 launch 6v6 maps currently schematized)</li>
                  <li>• Predicted M4 / VEL-46 Ranked meta pairing (tracked strictly as hypothesis)</li>
                  <li>• Live Ranked telemetry / leaderboards (blocked until Activision partner API approval)</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
