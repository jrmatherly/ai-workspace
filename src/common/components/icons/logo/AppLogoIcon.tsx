import * as React from 'react';

import { SvgIcon, SvgIconProps } from '@mui/joy';

import { Brand } from '~/common/app.config';

import { DEFAULT_LOGO, LOGO_ACCENTS, LogoAccentId, LogoMarkId } from './logo.registry';


type MarkColors = { fg: string; accent: string; knock?: string; uid: string };

const WEAVE_A = 'M3 8 C7.5 8 8.5 16 12 16 C15.5 16 16.5 8 21 8';
const WEAVE_B = 'M3 16 C7.5 16 8.5 8 12 8 C15.5 8 16.5 16 21 16';

function weaveOverPass(clipId: string, d: string, stroke: string, knock?: string) {
  return (
    <g clipPath={`url(#${clipId})`} fill='none' strokeLinecap='round'>
      {knock && <path d={d} stroke={knock} strokeWidth={5.6} />}
      <path d={d} stroke={stroke} strokeWidth={3} />
    </g>
  );
}

const MARK_RENDERERS: Record<LogoMarkId, (c: MarkColors) => React.ReactNode> = {
  core: ({ fg, accent }) => <>
    <path d='M4.5 19.5 L12 4.5 L19.5 19.5' fill='none' stroke={fg} strokeWidth={3.8} strokeLinecap='round' strokeLinejoin='round' />
    <rect x={9.9} y={12.6} width={4.2} height={4.2} rx={1.1} fill={accent} />
  </>,

  weave: ({ fg, accent, knock, uid }) => <>
    <defs>
      <clipPath id={`${uid}-w1`}><circle cx={7.4} cy={12} r={3.4} /></clipPath>
      <clipPath id={`${uid}-w2`}><circle cx={16.6} cy={12} r={3.4} /></clipPath>
    </defs>
    <path d={WEAVE_A} fill='none' stroke={fg} strokeWidth={3} strokeLinecap='round' />
    <path d={WEAVE_B} fill='none' stroke={accent} strokeWidth={3} strokeLinecap='round' />
    {weaveOverPass(`${uid}-w1`, 'M3 8 C7.5 8 8.5 16 12 16', fg, knock)}
    {weaveOverPass(`${uid}-w2`, 'M12 8 C15.5 8 16.5 16 21 16', accent, knock)}
  </>,

  monolith: ({ fg, accent, uid }) => <>
    <defs>
      <clipPath id={`${uid}-up`}><polygon points='0,0 24,0 24,8.6 0,13.4' /></clipPath>
      <clipPath id={`${uid}-lo`}><polygon points='0,15.4 24,10.6 24,24 0,24' /></clipPath>
    </defs>
    <rect x={7.8} y={2.5} width={8.4} height={19} rx={4.2} fill={fg} clipPath={`url(#${uid}-up)`} />
    <rect x={7.8} y={2.5} width={8.4} height={19} rx={4.2} fill={accent} clipPath={`url(#${uid}-lo)`} />
  </>,
};


export function AppLogoIcon(props: {
  mark?: LogoMarkId;
  accent?: LogoAccentId;
  tile?: 'squircle' | 'circle' | 'none';
  tileColor?: string;
  fg?: string;
} & SvgIconProps) {
  const {
    mark = DEFAULT_LOGO.mark,
    accent = DEFAULT_LOGO.accent,
    tile = 'squircle',
    tileColor = '#000000',
    fg = '#FFFFFF',
    ...rest
  } = props;

  // React 18 useId returns ':r0:'-style ids; strip the colons so url(#id) references need no escaping
  const uid = 'logo' + React.useId().replace(/:/g, '');

  return (
    <SvgIcon viewBox='0 0 24 24' titleAccess={Brand.Title.Base} {...rest}>
      {tile === 'squircle' && <rect width={24} height={24} rx={5.3} fill={tileColor} />}
      {tile === 'circle' && <circle cx={12} cy={12} r={12} fill={tileColor} />}
      {MARK_RENDERERS[mark]({ fg, accent: LOGO_ACCENTS[accent].hex, knock: tile === 'none' ? undefined : tileColor, uid })}
    </SvgIcon>
  );
}
