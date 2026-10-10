/**
 * PostHog hosts, derived from one env var. Safe to import from the client, the server and next.config.ts.
 *
 * NEXT_PUBLIC_POSTHOG_HOST: ingest host, default PostHog US cloud. EU cloud: https://eu.i.posthog.com.
 * A self-hosted instance serves assets and UI from the same origin, so both derive to the ingest host.
 */
const DEFAULT_INGEST_HOST = 'https://us.i.posthog.com';

export const POSTHOG_INGEST_HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_INGEST_HOST).replace(/\/$/, '');

// cloud: us.i.posthog.com -> us-assets.i.posthog.com; self-hosted: same host
export const POSTHOG_ASSETS_HOST = POSTHOG_INGEST_HOST.replace(/^(https:\/\/[a-z]+)\.i\.posthog\.com$/, '$1-assets.i.posthog.com');

// cloud: us.i.posthog.com -> us.posthog.com (the app UI, for toolbar links); self-hosted: same host
export const POSTHOG_UI_HOST = POSTHOG_INGEST_HOST.replace(/^(https:\/\/[a-z]+)\.i\.posthog\.com$/, '$1.posthog.com');
