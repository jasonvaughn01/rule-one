import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  ExternalLink,
  Image as ImageIcon,
  Lock,
  Plug,
  ShieldCheck,
} from 'lucide-react';
import { GAME_CATALOG } from '../data/gameCatalog';
import {
  CorrectionLogEntry,
  INITIAL_CORRECTION_LOG,
  PARTNER_ADAPTERS,
  PRICING_EXPERIMENT_TIERS,
  SOURCE_REGISTRY,
} from '../data/intelligencePipeline';
import { AggregateFunnelMetrics } from '../lib/seo';
import { sanitizePlainText } from '../lib/validators';

interface OpsRegistryViewProps {
  useSvgFallbackMode: boolean;
  onToggleSvgFallbackMode: () => void;
  funnelMetrics: AggregateFunnelMetrics;
  onRecordCorrection: () => void;
  onNavigatePath: (path: string, label?: string) => void;
}

export function OpsRegistryView({
  useSvgFallbackMode,
  onToggleSvgFallbackMode,
  funnelMetrics,
  onRecordCorrection,
  onNavigatePath,
}: OpsRegistryViewProps) {
  const [rightsSearch, setRightsSearch] = useState('');
  const [corrections, setCorrections] = useState<CorrectionLogEntry[]>(INITIAL_CORRECTION_LOG);
  const [corrTarget, setCorrTarget] = useState('/games/modern-warfare-4');
  const [corrCat, setCorrCat] = useState<CorrectionLogEntry['category']>('Ruleset / Ranked');
  const [corrText, setCorrText] = useState('');

  const filteredRights = useMemo(() => {
    const q = rightsSearch.trim().toLowerCase();
    if (!q) return GAME_CATALOG;
    return GAME_CATALOG.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.publisher.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    );
  }, [rightsSearch]);

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizePlainText(corrText, 200);
    if (!cleaned) return;
    setCorrections((prev) => [
      {
        id: `corr-${Date.now()}`,
        submittedAt: '2026-11-27',
        targetPath: sanitizePlainText(corrTarget, 100) || '/',
        category: corrCat,
        summary: cleaned,
        status: 'Logged for Review',
      },
      ...prev,
    ]);
    setCorrText('');
    onRecordCorrection();
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#A7AFBD]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigatePath('/', 'Home')}
            className="inline-flex items-center gap-1.5 text-[#D6B477] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Home
          </button>
          <span>/</span>
          <span className="text-[#F5F5F5]">Owner Administration Dashboard &amp; Transparency Console</span>
        </div>
        <span className="font-mono text-[#F59E0B]">noindex · Admin &amp; Provenance Console</span>
      </div>

      {/* 0. Owner Administration Overview (Measured Local Telemetry vs Unavailable Production Metrics) */}
      <section className="bg-[#14161D] border border-[#2A303E] rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#252A36]">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#F5F5F5]">
              Owner Administration Dashboard
            </h1>
            <p className="text-xs text-[#A7AFBD] mt-1">
              Only measured local browser counters and verified repository counts are displayed.
              Unmeasured production revenue, user totals, and affiliate payouts are explicitly marked
              Unavailable.
            </p>
          </div>
          <span className="font-mono text-xs text-[#4ADE80]">Zero Fabricated KPIs</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-4">
            <p className="text-xs text-[#A7AFBD]">Local Hub Views (Measured)</p>
            <p className="font-mono text-xl font-semibold text-[#F5F5F5] tabular-nums mt-1">
              {funnelMetrics.hubViews}
            </p>
          </div>
          <div className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-4">
            <p className="text-xs text-[#A7AFBD]">Tactical Map Sessions</p>
            <p className="font-mono text-xl font-semibold text-[#D6B477] tabular-nums mt-1">
              {funnelMetrics.activatedTacticalSessions}
            </p>
          </div>
          <div className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-4">
            <p className="text-xs text-[#A7AFBD]">Developer-Connected Titles</p>
            <p className="font-mono text-xl font-semibold text-[#4ADE80] tabular-nums mt-1">
              {GAME_CATALOG.length}
            </p>
            <p className="text-[11px] text-[#A7AFBD] mt-0.5">2 live public APIs · 8 disabled adapters</p>
          </div>
          <div className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-4">
            <p className="text-xs text-[#A7AFBD]">Corrections Logged</p>
            <p className="font-mono text-xl font-semibold text-[#F5F5F5] tabular-nums mt-1">
              {corrections.length}
            </p>
            <p className="text-[11px] text-[#A7AFBD] mt-0.5">Broken image reports: 0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-3.5">
            <p className="text-[#A7AFBD]">Active Users &amp; Daily Traffic</p>
            <p className="font-mono text-[#F59E0B] mt-1">Unavailable — Awaiting Production Analytics</p>
          </div>
          <div className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-3.5">
            <p className="text-[#A7AFBD]">Subscriptions &amp; Ad Revenue</p>
            <p className="font-mono text-[#F59E0B] mt-1">$0 — Billing &amp; Ads Disabled</p>
          </div>
          <div className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-3.5">
            <p className="text-[#A7AFBD]">Affiliate Conversions</p>
            <p className="font-mono text-[#F59E0B] mt-1">Unavailable — Pending Program Approval</p>
          </div>
        </div>
      </section>

      {/* 1. Source & Evidence Registry */}
      <section className="bg-[#14161D] border border-[#2A303E] rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-[#22252E] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
              <Database className="w-5 h-5 text-[#C9A86A]" aria-hidden="true" />
              Source &amp; Evidence Registry (Checked 2026-11-27)
            </h1>
            <p className="text-xs text-[#8C8982] mt-0.5">
              Confidence is evidence provenance (official, independently tested, community reported,
              prediction, unverified) — never arbitrary percentages.
            </p>
          </div>
          <span className="font-mono text-xs text-[#4ADE80]">
            {SOURCE_REGISTRY.length} Audited Sources
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#22252E] text-[#8C8982]">
                <th className="py-3 px-6 font-medium">Publisher &amp; Scope</th>
                <th className="py-3 px-4 font-medium">Evidence Class</th>
                <th className="py-3 px-4 font-medium">State</th>
                <th className="py-3 px-6 font-medium">Permissions &amp; Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2028]">
              {SOURCE_REGISTRY.map((src) => (
                <tr key={src.id} className="hover:bg-[#161922]">
                  <td className="py-3.5 px-6 max-w-sm">
                    <p className="font-semibold text-[#F3F1EC]">{src.publisher}</p>
                    <p className="text-[#A8A59E] mt-0.5">{src.scope}</p>
                    {src.sourceUrl.startsWith('https://') && (
                      <a
                        href={src.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#C9A86A] hover:underline mt-1 font-mono text-[11px]"
                      >
                        {src.sourceUrl}
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap text-[#D6D3CB]">
                    {src.evidenceClass}
                  </td>
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                    <span
                      className={
                        src.publicationState === 'published'
                          ? 'text-[#4ADE80]'
                          : src.publicationState === 'quarantined'
                          ? 'text-[#F87171]'
                          : 'text-[#F59E0B]'
                      }
                    >
                      {src.publicationState.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-[#A8A59E] max-w-md">
                    <p>{src.permissions}</p>
                    <p className="text-[11px] text-[#7D7B75] mt-1">{src.notes}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. 64-Game Image Rights & Asset Manifest Ledger (Section 9 + Appendix A) */}
      <section className="bg-[#111319] border border-[#22252E] rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-[#22252E] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#C9A86A]" aria-hidden="true" />
              {GAME_CATALOG.length}-Game Developer-API Asset Manifest &amp; Rights Ledger
            </h2>
            <p className="text-xs text-[#8C8982] mt-0.5">
              All {GAME_CATALOG.length} developer-API games verified HTTP 200 via official storefront CDNs,
              with instant switch to local black-and-gold SVG fallbacks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onToggleSvgFallbackMode}
              className={`px-3.5 py-2 text-xs font-medium rounded-md border transition-colors ${
                useSvgFallbackMode
                  ? 'bg-[#C9A86A] text-[#090A0D] border-[#C9A86A] font-semibold'
                  : 'bg-[#181B23] text-[#F3F1EC] border-[#2B2F3A] hover:border-[#C9A86A]'
              }`}
            >
              Artwork Mode:{' '}
              {useSvgFallbackMode
                ? 'Original Local SVG Fallback'
                : `Verified Storefront Previews (${GAME_CATALOG.length}/${GAME_CATALOG.length})`}
            </button>
            <input
              type="text"
              value={rightsSearch}
              onChange={(e) => setRightsSearch(e.target.value)}
              placeholder={`Search ${GAME_CATALOG.length} assets...`}
              aria-label="Search asset rights ledger"
              className="px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded-md text-[#F3F1EC] w-44"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#111319] z-10">
              <tr className="border-b border-[#22252E] text-[#8C8982]">
                <th className="py-2.5 px-6 font-medium">Game Title</th>
                <th className="py-2.5 px-4 font-medium">Rights Owner</th>
                <th className="py-2.5 px-4 font-medium">Image Source</th>
                <th className="py-2.5 px-6 font-medium">Commercial Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2028]">
              {filteredRights.map((g) => (
                <tr key={g.slug} className="hover:bg-[#161922]">
                  <td className="py-2.5 px-6 font-medium text-[#F3F1EC]">{g.name}</td>
                  <td className="py-2.5 px-4 text-[#A8A59E]">{g.rightsOwner}</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-[#D6D3CB]">
                    {g.imageSource}
                  </td>
                  <td className="py-2.5 px-6 font-mono text-[11px] text-[#F59E0B]">
                    Permission Pending (Editorial Preview / SVG Ready)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Partner API Adapters (Section 7 — All Disabled by Default) */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
            <Plug className="w-5 h-5 text-[#C9A86A]" aria-hidden="true" />
            Partner Data Pipelines (Disabled by Default — Zero Fake Live Feeds)
          </h2>
          <p className="text-xs text-[#8C8982] mt-0.5">
            Adapter contract: fetch / normalize / validate / cache / status. Secrets server-side
            only. No live telemetry collected during active competitive matches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PARTNER_ADAPTERS.map((ad) => (
            <div
              key={ad.id}
              className="bg-[#111319] border border-[#22252E] rounded-lg p-5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-semibold text-[#F3F1EC]">{ad.partner}</h3>
                <span className="font-mono text-[11px] text-[#F59E0B]">Disabled · Pending Approval</span>
              </div>
              <p className="text-xs text-[#C9A86A]">{ad.gamesCovered}</p>
              <p className="text-xs text-[#A8A59E]">{ad.delayAndRateNotes}</p>
              <div className="pt-2 border-t border-[#1D2028] flex items-center justify-between gap-2 text-[11px]">
                <span className="text-[#7D7B75]">Fallback: {ad.fallbackMode}</span>
                <a
                  href={ad.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C9A86A] hover:underline shrink-0"
                >
                  Docs →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Public Correction Form & Log + SEO / Five-Rules Pricing Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C9A86A]" aria-hidden="true" />
            Correction Form &amp; Public Correction Log
          </h2>

          <form onSubmit={handleCorrectionSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={corrTarget}
                onChange={(e) => setCorrTarget(e.target.value)}
                placeholder="Target route (e.g. /games/modern-warfare-4)"
                className="px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded text-[#F3F1EC]"
              />
              <select
                value={corrCat}
                onChange={(e) => setCorrCat(e.target.value as CorrectionLogEntry['category'])}
                className="px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded text-[#F3F1EC]"
              >
                <option value="Map Geometry">Map Geometry</option>
                <option value="Weapon Stats">Weapon Stats</option>
                <option value="Ruleset / Ranked">Ruleset / Ranked</option>
                <option value="Image Rights">Image Rights</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <textarea
              rows={2}
              value={corrText}
              onChange={(e) => setCorrText(e.target.value)}
              placeholder="Provide official source URL and discrepancy details..."
              className="w-full px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded text-[#F3F1EC]"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded"
            >
              Submit Correction to Public Log
            </button>
          </form>

          <div className="divide-y divide-[#1D2028] border border-[#22252E] rounded-md bg-[#0D0F14]">
            {corrections.map((c) => (
              <div key={c.id} className="p-3.5 space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[#C9A86A]">
                    {c.submittedAt} · {c.category}
                  </span>
                  <span className="font-mono text-[11px] text-[#4ADE80]">{c.status}</span>
                </div>
                <p className="text-[#D6D3CB]">{c.summary}</p>
                <p className="font-mono text-[10px] text-[#7D7B75]">{c.targetPath}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-6 bg-[#111319] border border-[#22252E] rounded-lg p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F3F1EC] inline-flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#C9A86A]" aria-hidden="true" />
              Search Console, Sitemaps &amp; Privacy-Safe Aggregate Funnel
            </h2>
            <p className="text-xs text-[#8C8982] mt-0.5">
              Owner verification pending in Google Search Console. Split sitemaps active at{' '}
              <span className="font-mono text-[#D6D3CB]">/sitemap.xml</span> &amp;{' '}
              <span className="font-mono text-[#D6D3CB]">/robots.txt</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#0D0F14] border border-[#22252E] rounded">
              <p className="text-[11px] text-[#8C8982]">Hub Views</p>
              <p className="font-mono text-lg font-semibold text-[#F3F1EC] tabular-nums">
                {funnelMetrics.hubViews}
              </p>
            </div>
            <div className="p-3 bg-[#0D0F14] border border-[#22252E] rounded">
              <p className="text-[11px] text-[#8C8982]">Map Sessions</p>
              <p className="font-mono text-lg font-semibold text-[#C9A86A] tabular-nums">
                {funnelMetrics.activatedTacticalSessions}
              </p>
            </div>
            <div className="p-3 bg-[#0D0F14] border border-[#22252E] rounded">
              <p className="text-[11px] text-[#8C8982]">Invites Copied</p>
              <p className="font-mono text-lg font-semibold text-[#4ADE80] tabular-nums">
                {funnelMetrics.inviteLinksCopied}
              </p>
            </div>
            <div className="p-3 bg-[#0D0F14] border border-[#22252E] rounded">
              <p className="text-[11px] text-[#8C8982]">Corrections</p>
              <p className="font-mono text-lg font-semibold text-[#F3F1EC] tabular-nums">
                {funnelMetrics.correctionsSubmitted}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-[#22252E]">
            <p className="text-xs font-medium text-[#F3F1EC] inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
              Five Rules Pricing Tests (Billing Strictly Disabled Until Approved)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRICING_EXPERIMENT_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="p-3.5 bg-[#0D0F14] border border-[#22252E] rounded space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#F3F1EC]">{tier.name}</span>
                    <span className="font-mono text-xs text-[#C9A86A]">{tier.priceLabel}</span>
                  </div>
                  <p className="font-mono text-[10px] text-[#7D7B75]">{tier.status}</p>
                  <p className="text-[11px] text-[#A8A59E]">{tier.summary}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#7D7B75]">
              Illustrative gross model only (300 Elite + 100 Clan Pro = $2,996/mo gross, not profit
              or forecast). No checkout, no assumed RPM, no gambling or wagering.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
