export type LogoMarkId = 'core' | 'weave' | 'monolith';
export type LogoAccentId = 'teal' | 'amber' | 'violet' | 'coral';

export const LOGO_ACCENTS: Record<LogoAccentId, { label: string; hex: string }> = {
  teal: { label: 'Signal teal', hex: '#2FE3C4' },
  amber: { label: 'Amber', hex: '#FFB13D' },
  violet: { label: 'Violet', hex: '#9B8CFF' },
  coral: { label: 'Coral', hex: '#FF6B57' },
};

export const LOGO_MARKS: Record<LogoMarkId, { label: string }> = {
  core: { label: 'Core A' },
  weave: { label: 'Weave' },
  monolith: { label: 'Monolith' },
};

export const DEFAULT_LOGO = { mark: 'core', accent: 'teal' } as const satisfies { mark: LogoMarkId; accent: LogoAccentId };
