import * as React from 'react';
import { StaticImageData } from 'next/image';

import { SvgIconProps, Typography } from '@mui/joy';

import { Brand } from '~/common/app.config';
import { BaseProduct, Release } from '~/common/app.release';
import { ExternalLink } from '~/common/components/ExternalLink';


interface NewsItem {
  versionCode: string;
  versionName?: string;
  versionMoji?: string;
  versionDate?: Date;
  versionCoverImage?: StaticImageData;
  text?: string | React.JSX.Element;
  items?: {
    text: React.ReactNode;
    dev?: boolean;
    icon?: React.FC<SvgIconProps>;
    noBullet?: boolean;
  }[];
}


const _frontendBuild = Release.buildInfo('frontend');
const _frontendPkgVersion = _frontendBuild.pkgVersion ?? 'open/main';
export const newsFrontendTimestamp = _frontendBuild.timestamp;

export const DevNewsItem: NewsItem = {
  versionCode: 'DEV',
  versionName: 'Development Build',
  versionDate: undefined,
  items: [
    { text: <>You&apos;re running an unsupported <B>developer build</B> of AI Workspace {_frontendPkgVersion}</> },
    { text: <>Please report screenshots of breakages and console error messages</> },
    { text: <ExternalLink href={BaseProduct.NewsSite}>Latest releases</ExternalLink> },
  ],
} as const;

// news and feature surfaces
export const NewsItems: NewsItem[] = [
  {
    versionCode: '2.1.1',
    versionName: 'AI Workspace',
    versionDate: new Date('2026-10-10T00:00:00Z'),
    items: [
      { text: <>Derived from the big-AGI 2.1.1 codebase (2026-10-07) and re-pointed to this repository</> },
      { text: <>Self-hosted and local-first: no hosted services, no telemetry unless you configure it</> },
      { text: <>Release notes continue on <B href={BaseProduct.NewsSite}>GitHub Releases</B></> },
    ],
  },
] as const;


function B(props: {
  // one-of
  href?: string,
  code?: string,

  wow?: boolean,
  children: React.ReactNode
}) {
  const href = props.code ? `${Brand.URIs.OpenRepo}/blob/main/${props.code}` : props.href;
  const boldText = (
    <Typography component='span' color={!!href ? 'primary' : 'neutral'} sx={{ fontWeight: 'lg' }}>
      {props.children}
    </Typography>
  );
  if (!href)
    return boldText;
  return (
    <ExternalLink href={href} highlight={props.wow}>
      {boldText}
    </ExternalLink>
  );
}
