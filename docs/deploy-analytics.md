# AI Workspace Analytics

The open-source AI Workspace project provides support for the following analytics services:

- **Google Analytics 4**: manual setup required
- **PostHog Analytics**: manual setup required
- **Vercel Analytics**: automatic when deployed to Vercel

The following is a quick overview of the Analytics options for the deployers of this open-source project.
AI Workspace can be deployed in various ways (custom builds, Docker, Vercel, Cloudflare, etc.),
and this guide is for its customization.

## Service Configuration

### Google Analytics 4

- Why: user engagement and retention, performance insights, personalization, content optimization
- What: <https://support.google.com/analytics/answer/11593727>

Google Analytics 4 (GA4) is a powerful tool for understanding user behavior and engagement.
This can help optimize AI Workspace, understanding which features are needed/users and which aren't.

To enable Google Analytics 4, you need to set the `NEXT_PUBLIC_GA4_MEASUREMENT_ID` environment variable
before starting the local build or the docker build (i.e. at build time), at which point the
server/container will be able to report analytics to your Google Analytics 4 property.

Note that this value is **baked into the client bundle at build time**, not read at container start:
passing `-e NEXT_PUBLIC_GA4_MEASUREMENT_ID=...` to `docker run` has no effect. To point an image at
your own property - or at none - rebuild from source with the variable set (or unset).

**Prebuilt images** from this repo's workflow (`.github/workflows/docker-image.yml`) bake
`NEXT_PUBLIC_GA4_MEASUREMENT_ID` from the repository secret `GA4_MEASUREMENT_ID`. With the secret
unset, the images report nothing. Build from source to choose your own property.

### PostHog Analytics

- Why: feature usage tracking, user journeys, conversion optimization, product analytics
- What: page views, page leave events, user interactions, and deployment context

PostHog provides comprehensive product analytics with privacy controls. It helps understand how users interact with AI Workspace's features, identify opportunities for improvement, and optimize the user experience.

To enable PostHog, set the `NEXT_PUBLIC_POSTHOG_KEY` environment variable at build time. The instance defaults to PostHog US cloud; set `NEXT_PUBLIC_POSTHOG_HOST` for EU cloud (`https://eu.i.posthog.com`) or a self-hosted PostHog. Error tracking with source maps additionally needs `POSTHOG_API_KEY` and `POSTHOG_ENV_ID` at build time. PostHog is configured with tracking optimization and privacy in mind:

- Uses a proxy endpoint (`/a/ph`) to avoid ad blockers
- Respects user opt-out preferences via local storage
- Tracks only essential information without PII
- Adds deployment context for better segmentation

The implementation follows PostHog's best practices for Next.js applications and includes manual page view tracking for proper single-page application support.

### Vercel Analytics

- Why: understand coarse traction, and identify deployment issues - all without tracking individual users
- What: top pages, top referrers, country of origin, operating system, browser, and page speed metrics

Vercel Analytics and Speed Insights are local API endpoints deployed to your domain, so everything stays within your
domain. Furthermore, the Vercel Analytics service is privacy-friendly, and does not track individual users.

This service is avaialble to system administrators when deploying to Vercel. It is automatically enabled when deploying to Vercel.
The code that activates Vercel Analytics is located in the `pages/_app.tsx` file:

```tsx
const MyApp = ({ Component, emotionCache, pageProps }: MyAppProps) => <>
  ...
  {Is.Deployment.VercelFromFrontend && <VercelAnalytics debug={false} />}
  ...
</>;
```

When AI Workspace is built on Vercel, `next.config.ts` sets `NEXT_PUBLIC_DEPLOYMENT_TYPE` to `vercel-<VERCEL_ENV>`, so
`Is.Deployment.VercelFromFrontend` (`src/common/util/pwaUtils.ts`) is true, and analytics will be sent by default to the Vercel Analytics service which is deployed by Vercel IF configured from the
Vercel project dashboard.

In summary: to turn it on: activate the `Analytics` service in the Vercel project dashboard.

## Configurations

| Scope | Default | Description / Instructions |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Your **Source** builds of AI Workspace | None | **Google Analytics**: set environment variable at build time · **PostHog**: set environment variable at build time · **Vercel**: enable Vercel Analytics from the dashboard |
| Your **Docker** builds of AI Workspace | None | (**Vercel**: n/a) · **Google Analytics**: set environment variable at `docker build` time · **PostHog**: set environment variable at `docker build` time. |
| [prebuilt Docker packages](https://github.com/jrmatherly/ai-workspace/pkgs/container/ai-workspace) | Google Analytics if the `GA4_MEASUREMENT_ID` secret is set; PostHog if the `POSTHOG_KEY` secret is set | **Vercel**: n/a · **Google Analytics**: baked at build time from the repository secret · **PostHog**: baked from the `POSTHOG_KEY` secret and the `POSTHOG_HOST` variable; rebuild to change or remove |

Note: this information is updated as of August 26, 2026 and can change at any time.
