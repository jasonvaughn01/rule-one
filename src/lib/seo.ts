export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface RouteSeoConfig {
  title: string;
  description: string;
  path: string;
  indexable: boolean;
  ogImage?: string;
  breadcrumbs: BreadcrumbItem[];
  article?: {
    headline: string;
    dateModified: string;
    authorName: string;
  };
}

const DYNAMIC_JSONLD_ID = 'rule-one-route-jsonld';

function upsertMeta(selector: string, attrs: Record<string, string>, content: string) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function applyRouteSeo(config: RouteSeoConfig): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const origin = window.location.origin;
  const canonicalUrl = `${origin}${config.path}`;

  document.title = config.title;
  upsertCanonical(canonicalUrl);

  upsertMeta('meta[name="description"]', { name: 'description' }, config.description);
  upsertMeta(
    'meta[name="robots"]',
    { name: 'robots' },
    config.indexable ? 'index,follow' : 'noindex,nofollow'
  );
  upsertMeta('meta[property="og:title"]', { property: 'og:title' }, config.title);
  upsertMeta(
    'meta[property="og:description"]',
    { property: 'og:description' },
    config.description
  );
  upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
  upsertMeta('meta[property="og:type"]', { property: 'og:type' }, config.article ? 'article' : 'website');
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, config.title);
  upsertMeta(
    'meta[name="twitter:description"]',
    { name: 'twitter:description' },
    config.description
  );
  if (config.ogImage) {
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, config.ogImage);
  }

  const graph: Record<string, unknown>[] = [];

  if (config.breadcrumbs.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: config.breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: `${origin}${crumb.path}`,
      })),
    });
  }

  if (config.article) {
    graph.push({
      '@type': 'Article',
      headline: config.article.headline,
      dateModified: config.article.dateModified,
      author: {
        '@type': 'Organization',
        name: config.article.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Rule One',
      },
      mainEntityOfPage: canonicalUrl,
    });
  }

  let script = document.getElementById(DYNAMIC_JSONLD_ID) as HTMLScriptElement | null;
  if (graph.length === 0) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = DYNAMIC_JSONLD_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
}

// Privacy-safe local aggregate metrics (zero PII, zero external tracking pixels)
const FUNNEL_STORAGE_KEY = 'rule_one_privacy_safe_funnel_v1';

export interface AggregateFunnelMetrics {
  organicLandings: number;
  hubViews: number;
  activatedTacticalSessions: number;
  inviteLinksCopied: number;
  correctionsSubmitted: number;
}

const DEFAULT_METRICS: AggregateFunnelMetrics = {
  organicLandings: 0,
  hubViews: 0,
  activatedTacticalSessions: 0,
  inviteLinksCopied: 0,
  correctionsSubmitted: 0,
};

export function getAggregateFunnelMetrics(): AggregateFunnelMetrics {
  try {
    const raw = window.localStorage.getItem(FUNNEL_STORAGE_KEY);
    if (!raw) return DEFAULT_METRICS;
    return { ...DEFAULT_METRICS, ...(JSON.parse(raw) as Partial<AggregateFunnelMetrics>) };
  } catch {
    return DEFAULT_METRICS;
  }
}

export function recordAggregateEvent(key: keyof AggregateFunnelMetrics): AggregateFunnelMetrics {
  const current = getAggregateFunnelMetrics();
  const next: AggregateFunnelMetrics = {
    ...current,
    [key]: current[key] + 1,
  };
  try {
    window.localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage restrictions
  }
  return next;
}
