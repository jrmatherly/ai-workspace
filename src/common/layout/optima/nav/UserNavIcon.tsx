import * as React from 'react';

import { Avatar, Chip, Dropdown, ListDivider, ListItem, ListItemDecorator, Menu, MenuButton, MenuItem, Tooltip, Typography } from '@mui/joy';
import LogoutIcon from '@mui/icons-material/Logout';

import { authSignOutFromMenu, useAuthUser } from '~/common/auth/auth.client';

import { DesktopNavIcon, navItemClasses } from './DesktopNavIcon';


function initialsOf(name: string, email: string): string {
  const words = (name || email).trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('') || '?';
}

/** Account menu. Renders nothing unless signed in (auth off included). */
export function UserNavIcon(): React.ReactNode {
  const auth = useAuthUser();
  if (auth.kind !== 'user') return null;
  const { name, email, image, role } = auth.user;
  return (
    <Dropdown>
      <Tooltip disableInteractive enterDelay={600} title={name || email}>
        <MenuButton slots={{ root: DesktopNavIcon }} slotProps={{ root: { className: navItemClasses.typeLinkOrModal } }}>
          <Avatar size='sm' src={image ?? undefined}>{initialsOf(name, email)}</Avatar>
        </MenuButton>
      </Tooltip>
      <Menu variant='outlined' placement='right-end' sx={{ minWidth: 240 }}>
        <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
          <Typography level='title-sm'>{name || email}</Typography>
          <Typography level='body-xs'>{email}</Typography>
          <Chip size='sm' variant='soft' color={role === 'admin' ? 'primary' : 'neutral'}>{role}</Chip>
        </ListItem>
        <ListDivider />
        <MenuItem onClick={authSignOutFromMenu}>
          <ListItemDecorator><LogoutIcon /></ListItemDecorator>
          Sign out
        </MenuItem>
      </Menu>
    </Dropdown>
  );
}
