import type { SiteDocSlug } from '~/common/gen/com.site.docs.slug';

import { BaseProduct } from '~/common/app.release';


// slugs are upstream's website docs; a slug without a local file resolves to null and callers hide the link
const DOCS_SLUG_TO_FILE: Partial<Record<SiteDocSlug, string>> = {
  'connect-azure': 'config-azure-openai.md',
  'connect-lmstudio': 'config-local-lmstudio.md',
  'connect-localai': 'config-local-localai.md',
  'connect-nvidia-nim': 'config-nvidianim.md',
  'connect-ollama': 'config-local-ollama.md',
  'connect-openrouter': 'config-openrouter.md',
  'feature-voice': 'help-feature-microphone.md',
  'account-backup': 'help-data-ownership.md',
  'privacy-data-flow': 'help-data-ownership.md',
  'self-host': 'installation.md',
  'self-host-configuration': 'environment-variables.md',
  'self-host-optional-services': 'config-feature-browse.md',
};

/**
 * Application Identity (Brand)
 *
 * Also note that the 'Brand' is used in the following places:
 *  - README.md               all over
 *  - package.json            app-slug and version
 *  - [public/manifest.json]  name, short_name, description, theme_color, background_color
 */
export const Brand = {
  Title: {
    Base: 'Big-AGI',
    Common: (process.env.NODE_ENV === 'development' ? '[DEV] ' : '') + 'Big-AGI',
  },
  Meta: {
    Description: 'Launch the open-source AI workspace for experts. BYO API keys. Compare and tune models, use personas, voice and vision - your data stays local.',
    SiteName: 'Big-AGI | The Expert\'s AI Workspace',
    ThemeColor: '#32383E',
  },
  URIs: {
    Home: BaseProduct.ProductURL,
    CardImage: '/icons/card-dark-1200.png', // same-origin; _document.tsx prefixes NEXT_PUBLIC_SITE_URL
    OpenRepo: BaseProduct.OpenSourceRepo,
    // the hosted privacy page was upstream's; the data-handling guide is the nearest local text
    PrivacyPolicy: BaseProduct.DocsBaseSite + 'help-data-ownership.md',
  },
  Docs: {
    Public: (docPage: SiteDocSlug): string | null => DOCS_SLUG_TO_FILE[docPage] ? BaseProduct.DocsBaseSite + DOCS_SLUG_TO_FILE[docPage] : null,
  },
} as const;
