import * as React from 'react';

import type { ColorPaletteProp, TypographySystem } from '@mui/joy/styles/types';
import type { SiteDocSlug } from '~/common/gen/com.site.docs.slug';

import { Brand } from '~/common/app.config';
import { ExternalLink } from '~/common/components/ExternalLink';


export function ExternalDocsLink(props: {
  docPage: SiteDocSlug;
  color?: ColorPaletteProp,
  level?: keyof TypographySystem | 'inherit',
  highlight?: boolean;
  children: React.ReactNode,
}) {
  const href = Brand.Docs.Public(props.docPage);
  if (!href) return props.children;
  return (
    <ExternalLink
      href={href}
      color={props.color}
      level={props.level}
      highlight={props.highlight}
      icon='public-docs'
    >
      {props.children}
    </ExternalLink>
  );
}