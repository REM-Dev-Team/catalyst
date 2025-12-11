'use client';

import { TextInput, Style, Select } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';
import { useState } from 'react';

import { runtime } from '~/lib/makeswift/runtime';
import { Button } from '~/vibes/soul/primitives/button';

interface YouTubePlaylistSwitcherProps {
  className?: string;
  componentId: string;
  playlist1Id?: string;
  playlist1Label?: string;
  playlist2Id?: string;
  playlist2Label?: string;
  playlist3Id?: string;
  playlist3Label?: string;
  link4Url?: string;
  link4Label?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'large' | 'medium' | 'small' | 'x-small';
  shape?: 'pill' | 'rounded' | 'square' | 'circle';
  gap?: 'none' | 'small' | 'medium' | 'large' | 'x-large';
}

function YouTubePlaylistSwitcher({
  className,
  componentId,
  playlist1Id,
  playlist1Label = 'Playlist 1',
  playlist2Id,
  playlist2Label = 'Playlist 2',
  playlist3Id,
  playlist3Label = 'Playlist 3',
  link4Url,
  link4Label = 'See All',
  variant = 'tertiary',
  size = 'medium',
  shape = 'rounded',
  gap = 'medium',
}: YouTubePlaylistSwitcherProps) {
  const playlists = [
    { id: playlist1Id, label: playlist1Label },
    { id: playlist2Id, label: playlist2Label },
    { id: playlist3Id, label: playlist3Label },
  ].filter((p) => p.id);

  const hasLink = link4Url && link4Label;

  const [activePlaylist, setActivePlaylist] = useState<string | undefined>(playlist1Id);

  const dispatchSwitch = (playlistId?: string) => {
    if (!componentId) {
      console.warn('YouTube Playlist Switcher: componentId is required to communicate with the carousel');
      return;
    }
    setActivePlaylist(playlistId);
    const eventName = `yt-playlist-switch:${componentId}`;
    window.dispatchEvent(new CustomEvent(eventName, { detail: { playlistId } }));
  };

  if (playlists.length === 0 && !hasLink) {
    return (
      <div className={clsx('text-sm text-gray-500', className)}>
        Configure at least one playlist ID or link to display buttons
      </div>
    );
  }

  const gapClasses = {
    none: 'gap-0',
    small: 'gap-1',
    medium: 'gap-2',
    large: 'gap-4',
    'x-large': 'gap-8',
  };

  const gapStyles = {
    none: { gap: '0px' },
    small: { gap: '4px' },
    medium: { gap: '8px' },
    large: { gap: '16px' },
    'x-large': { gap: '32px' },
  };

  // Map theme CSS variables to what Button component expects
  // Theme generates --button-*-foreground, but Button expects --button-*-text
  const getButtonStyle = (buttonVariant: typeof variant): Record<string, string> => {
    const variantMap: Record<string, Record<string, string>> = {
      primary: {
        '--button-primary-text': 'var(--button-primary-foreground)',
      },
      secondary: {
        '--button-secondary-text': 'var(--button-secondary-foreground)',
      },
      tertiary: {
        '--button-tertiary-text': 'var(--button-tertiary-foreground)',
      },
      ghost: {
        '--button-ghost-text': 'var(--button-ghost-foreground)',
      },
    };
    return variantMap[buttonVariant || 'primary'] || variantMap.primary;
  };

  return (
    <div 
      className={clsx('flex flex-wrap', gapClasses[gap], className)}
      style={gapStyles[gap]}
    >
      {playlists.map((p) => {
        const isActive = activePlaylist === p.id;
        const isGhost = variant === 'ghost';
        
        return (
          <Button
            key={p.id}
            onClick={() => dispatchSwitch(p.id)}
            variant={variant}
            size={size}
            shape={shape}
            style={getButtonStyle(variant)}
            className={clsx(
              'whitespace-nowrap',
              isGhost && !isActive && 'text-white border-white hover:text-black'
            )}
          >
            {p.label}
          </Button>
        );
      })}
      
      {hasLink && (
        <Button
          asChild
          variant={variant}
          size={size}
          shape={shape}
          style={getButtonStyle(variant)}
          className={clsx(
            'whitespace-nowrap',
            variant === 'ghost' ? 'text-white border-white hover:text-black' : ''
          )}
        >
          <a href={link4Url} target="_blank" rel="noopener noreferrer">
            {link4Label}
          </a>
        </Button>
      )}
    </div>
  );
}

runtime.registerComponent(
  YouTubePlaylistSwitcher,
  {
    type: 'youtube-playlist-switcher',
    label: 'Content / YouTube Playlist Switcher',
    props: {
      className: Style(),
      componentId: TextInput({ label: 'Shared Component ID', defaultValue: '' }),
      playlist1Id: TextInput({ label: 'Playlist 1 ID', defaultValue: '' }),
      playlist1Label: TextInput({ label: 'Playlist 1 Label', defaultValue: 'Playlist 1' }),
      playlist2Id: TextInput({ label: 'Playlist 2 ID', defaultValue: '' }),
      playlist2Label: TextInput({ label: 'Playlist 2 Label', defaultValue: 'Playlist 2' }),
      playlist3Id: TextInput({ label: 'Playlist 3 ID', defaultValue: '' }),
      playlist3Label: TextInput({ label: 'Playlist 3 Label', defaultValue: 'Playlist 3' }),
      link4Url: TextInput({ label: 'Link 4 URL', defaultValue: '' }),
      link4Label: TextInput({ label: 'Link 4 Label', defaultValue: 'See All' }),
      variant: Select({
        label: 'Button Style',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'tertiary', label: 'Tertiary' },
          { value: 'ghost', label: 'Ghost' },
        ],
        defaultValue: 'tertiary',
      }),
      size: Select({
        label: 'Button Size',
        options: [
          { value: 'x-small', label: 'X-small' },
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
        defaultValue: 'medium',
      }),
      shape: Select({
        label: 'Button Shape',
        options: [
          { value: 'pill', label: 'Pill' },
          { value: 'rounded', label: 'Rounded' },
          { value: 'square', label: 'Rectangle' },
          { value: 'circle', label: 'Circle' },
        ],
        defaultValue: 'rounded',
      }),
      gap: Select({
        label: 'Button Spacing',
        options: [
          { value: 'none', label: 'None' },
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
          { value: 'x-large', label: 'X-Large' },
        ],
        defaultValue: 'medium',
      }),
    },
  },
);


