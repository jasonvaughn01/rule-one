import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  CDL_2027_SCHEDULE,
  CDL_2027_TEAMS,
  CDL_V1_RULESET,
  MW4_RELEASE_FACTS,
  formatCurrency,
} from '../data/mw4CdlData';
import { MW4_SND_MAPS } from '../data/sndMaps';
import { CdlTeam, Mw4MapId } from '../types';

interface CdlIntelViewProps {
  treasury: number;
  onChallengeTeam: (team: CdlTeam, mapId: Mw4MapId) => void;
  onBookScrim: (team: CdlTeam, slotLabel: string) => boolean;
}

const SCRIM_SLOTS = ['Tonight · 22:30 EST', 'Tomorrow · 20:00 EST', 'Pre-Kickoff Block · Sat'];

export function CdlIntelView({
  treasury,
  onChallengeTeam,
  onBookScrim,
}: CdlIntelViewProps) {
  const [ruleFilter, setRuleFilter] = useState<'All' | 'Banned (CDL v1.0)' | 'Meta Legal'>('All');
  const [ruleQuery, setRuleQuery] = useState('');
  const [bookingTeamId, setBookingTeamId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState(SCRIM_SLOTS[0]);
  const [bookingFeedback, setBookingFeedback] = useState<{
    teamId: string;
    message: string;
    ok: boolean;
  } | null>(null);

  const filteredRules = useMemo(() => {
    const q = ruleQuery.trim().toLowerCase();
    return CDL_V1_RULESET.filter((item) => {
      if (ruleFilter !== 'All' && item.status !== ruleFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q)
      );
    });
  }, [ruleFilter, ruleQuery]);

  const handleConfirmScrim = (team: CdlTeam) => {
    const ok = onBookScrim(team, selectedSlot);
    if (ok) {
      setBookingFeedback({
        teamId: team.id,
        message: `Booked 2-Hr S&D Scrim (${selectedSlot}) — ${formatCurrency(team.scrimRetainer)} settled.`,
        ok: true,
      });
      setBookingTeamId(null);
    } else {
      setBookingFeedback({
        teamId: team.id,
        message: 'Insufficient liquid treasury for this scrim retainer.',
        ok: false,
      });
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="pb-6 border-b border-[#22252E] space-y-2">
        <p className="text-xs font-medium text-[#C9A86A]">
          Verified Release &amp; Competitive Intelligence · Call of Duty: Modern Warfare 4
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#F3F1EC] text-balance">
          MW4 (2026) &amp; CDL 2027 Season Release Dossier
        </h1>
        <p className="text-sm text-[#A8A59E] max-w-3xl">
          Official Infinity Ward Modern Warfare 4 launch timeline, CDL Competitive Settings v1.0
          bans and weapon meta, the 6-map Search &amp; Destroy pool, and all 12 franchises heading
          into the December 4–13, 2026 Kickoff Classic.
        </p>
      </section>

      {/* 4-Column Release Milestone Strip */}
      <section
        aria-label="Modern Warfare 4 release overview"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#22252E] rounded-lg bg-[#111319] divide-y sm:divide-y-0 sm:divide-x divide-[#22252E]"
      >
        {MW4_RELEASE_FACTS.map((fact) => (
          <div key={fact.label} className="p-6">
            <p className="text-xs text-[#8C8982]">{fact.label}</p>
            <p className="mt-2 font-mono text-xl font-semibold text-[#F3F1EC] tabular-nums">
              {fact.value}
            </p>
            <p className="mt-1.5 text-xs text-[#9C9A94] leading-relaxed">{fact.detail}</p>
          </div>
        ))}
      </section>

      {/* CDL Competitive Settings v1.0 Ruleset & Ban Lookup */}
      <section className="bg-[#111319] border border-[#22252E] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-[#22252E] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
              CDL Competitive Settings v1.0 — Weapon, APEX &amp; Equipment Matrix
            </h2>
            <p className="text-xs text-[#8C8982] mt-0.5">
              Official MW4 competitive restrictions across Hardpoint, Hijack, and Search &amp; Destroy
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#0D0F14] border border-[#22252E] rounded-md">
              {(['All', 'Meta Legal', 'Banned (CDL v1.0)'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRuleFilter(tab)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    ruleFilter === tab
                      ? 'bg-[#222632] text-[#F3F1EC]'
                      : 'text-[#8C8982] hover:text-[#F3F1EC]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search
                className="w-3.5 h-3.5 text-[#7D7B75] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={ruleQuery}
                onChange={(e) => setRuleQuery(e.target.value)}
                placeholder="Search HAN 86, APEX, Laser..."
                aria-label="Search CDL v1.0 ruleset"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0D0F14] border border-[#22252E] rounded-md text-[#F3F1EC] placeholder:text-[#6E6C66] focus:border-[#C9A86A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#22252E] text-xs text-[#8C8982]">
                <th className="py-3 px-6 font-medium">Item / Class</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">CDL v1.0 Status</th>
                <th className="py-3 px-6 font-medium">Competitive Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2028]">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#161922] transition-colors">
                  <td className="py-3.5 px-6 text-sm font-medium text-[#F3F1EC] whitespace-nowrap">
                    {rule.name}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#9C9A94] whitespace-nowrap">
                    {rule.category}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono font-medium whitespace-nowrap">
                    <span
                      className={
                        rule.status === 'Meta Legal' ? 'text-[#4ADE80]' : 'text-[#F87171]'
                      }
                    >
                      {rule.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-[#A8A59E]">{rule.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Official 2026–2027 CDL Season Schedule */}
      <section className="bg-[#111319] border border-[#22252E] rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-[#22252E]">
          <h2 className="font-display text-lg font-semibold text-[#F3F1EC]">
            2026–2027 CDL Season Roadmap (Modern Warfare 4)
          </h2>
          <p className="text-xs text-[#8C8982] mt-0.5">
            From October 23 launch through July 8–11, 2027 Championship Weekend hosted by OpTic Texas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#22252E] text-xs text-[#8C8982]">
                <th className="py-3 px-6 font-medium">Event</th>
                <th className="py-3 px-4 font-medium">Dates</th>
                <th className="py-3 px-4 font-medium">Location</th>
                <th className="py-3 px-6 font-medium">Format</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2028]">
              {CDL_2027_SCHEDULE.map((item) => (
                <tr key={item.id} className="hover:bg-[#161922] transition-colors">
                  <td className="py-3.5 px-6 text-sm font-medium text-[#F3F1EC] whitespace-nowrap">
                    {item.event}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-[#C9A86A] tabular-nums whitespace-nowrap">
                    {item.dates}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#A8A59E] whitespace-nowrap">
                    {item.location}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-[#9C9A94]">{item.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 12 Official CDL 2027 Franchises & Private Scrim Booking */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#F3F1EC]">
              Official 2027 CDL Franchises (12 Teams)
            </h2>
            <p className="text-xs text-[#8C8982] mt-1">
              Including expansion franchise M80 Boston · Launch a direct MW4 S&amp;D scrim or book a
              private 2-hour map-control block
            </p>
          </div>
          <span className="text-xs font-mono text-[#9C9A94] tabular-nums">
            Liquid Treasury: {formatCurrency(treasury)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CDL_2027_TEAMS.map((team) => {
            const sigMap =
              MW4_SND_MAPS.find((m) => m.id === team.signatureMap)?.name || 'Coal';
            const isBooking = bookingTeamId === team.id;
            const fb = bookingFeedback?.teamId === team.id ? bookingFeedback : null;
            const canAfford = treasury >= team.scrimRetainer;

            return (
              <article
                key={team.id}
                className="bg-[#111319] border border-[#22252E] rounded-lg p-5 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-mono text-[#C9A86A]">
                      {team.shortTag} · {team.city}
                    </p>
                    <span className="text-xs font-mono text-[#8C8982] tabular-nums">
                      {team.rating} OVR · {team.sndWinRate}% S&amp;D
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#F3F1EC]">
                    {team.name}
                  </h3>
                  <p className="text-xs text-[#D6D3CB] font-mono">
                    {team.roster.join(' · ')}
                  </p>
                  <p className="text-xs text-[#9C9A94] leading-relaxed">{team.playstyle}</p>
                  <p className="text-xs text-[#8C8982] pt-2 border-t border-[#1D2028]">
                    Signature S&amp;D Map:{' '}
                    <span className="text-[#F3F1EC] font-medium">{sigMap}</span> · Retainer{' '}
                    <span className="font-mono text-[#F3F1EC] tabular-nums">
                      {formatCurrency(team.scrimRetainer)}
                    </span>
                  </p>
                </div>

                <div className="pt-3 border-t border-[#22252E] space-y-2.5">
                  {fb && (
                    <p
                      className={`text-xs font-medium ${
                        fb.ok ? 'text-[#4ADE80]' : 'text-[#F87171]'
                      }`}
                    >
                      {fb.message}
                    </p>
                  )}

                  {isBooking ? (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {SCRIM_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-2.5 py-1 text-[11px] rounded border transition-colors ${
                              selectedSlot === slot
                                ? 'border-[#C9A86A] bg-[#C9A86A]/15 text-[#F3F1EC]'
                                : 'border-[#272B36] text-[#9C9A94]'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => handleConfirmScrim(team)}
                          className="flex-1 py-2 text-xs font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] disabled:opacity-40 rounded-md"
                        >
                          Confirm {formatCurrency(team.scrimRetainer)}
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingTeamId(null)}
                          className="px-3 py-2 text-xs text-[#9C9A94] hover:text-[#F3F1EC]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onChallengeTeam(team, team.signatureMap)}
                        className="flex-1 py-2 px-3 text-xs font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-md transition-colors whitespace-nowrap"
                      >
                        Scrim on {sigMap}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingTeamId(team.id);
                          setBookingFeedback(null);
                        }}
                        className="py-2 px-3 text-xs font-medium text-[#F3F1EC] bg-[#181B23] hover:bg-[#222632] border border-[#2B2F3A] rounded-md transition-colors whitespace-nowrap"
                      >
                        Book Block
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
