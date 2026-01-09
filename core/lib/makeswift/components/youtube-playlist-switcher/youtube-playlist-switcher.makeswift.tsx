'use client';

// The following function has parameters that are used but ESLint doesn't recognize the usage pattern
import { Select, Style, TextInput } from '@makeswift/runtime/controls';
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

function YouTubePlaylistSwitcher(props: YouTubePlaylistSwitcherProps) {
  // Destructure only the props we need - access playlist props directly to avoid ESLint false positives
  const {
    className,
    componentId,
    link4Url,
    link4Label = 'See All',
    variant = 'tertiary',
    size = 'medium',
    shape = 'rounded',
    gap = 'medium',
  } = props;
  
  // Create playlists array - access playlist props directly so ESLint recognizes usage
  interface PlaylistItem {
    id: string;
    label: string;
  }
  const playlists: PlaylistItem[] = [];
  if (props.playlist1Id) {
    const label1 = props.playlist1Label || 'Playlist 1';
    playlists.push({ id: props.playlist1Id, label: label1 });
  }
  if (props.playlist2Id) {
    const label2 = props.playlist2Label || 'Playlist 2';
    playlists.push({ id: props.playlist2Id, label: label2 });
  }
  if (props.playlist3Id) {
    const label3 = props.playlist3Label || 'Playlist 3';
    playlists.push({ id: props.playlist3Id, label: label3 });
  }

  const hasLink = link4Url && link4Label;

  const [activePlaylist, setActivePlaylist] = useState<string | undefined>(props.playlist1Id);

  const dispatchSwitch = (playlistId?: string) => {
    if (!componentId) {
      console.warn(
        'YouTube Playlist Switcher: componentId is required to communicate with the carousel',
      );
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

  const getGapClass = (gapValue: typeof gap): string => {
    switch (gapValue) {
      case 'none':
        return 'gap-0';
      case 'small':
        return 'gap-1';
      case 'medium':
        return 'gap-2';
      case 'large':
        return 'gap-4';
      case 'x-large':
        return 'gap-8';
      default:
        return 'gap-2';
    }
  };

  const getGapStyle = (gapValue: typeof gap): { gap: string } => {
    switch (gapValue) {
      case 'none':
        return { gap: '0px' };
      case 'small':
        return { gap: '4px' };
      case 'medium':
        return { gap: '8px' };
      case 'large':
        return { gap: '16px' };
      case 'x-large':
        return { gap: '32px' };
      default:
        return { gap: '8px' };
    }
  };

  // Map theme CSS variables to what Button component expects
  // Theme generates --button-*-foreground, but Button expects --button-*-text
  const getButtonStyle = (buttonVariant: typeof variant): Record<string, string> => {
    switch (buttonVariant) {
      case 'primary':
        return {
          '--button-primary-text': 'var(--button-primary-foreground)',
        };
      case 'secondary':
        return {
          '--button-secondary-text': 'var(--button-secondary-foreground)',
        };
      case 'tertiary':
        return {
          '--button-tertiary-text': 'var(--button-tertiary-foreground)',
        };
      case 'ghost':
        return {
          '--button-ghost-text': 'var(--button-ghost-foreground)',
        };
      default:
        return {
          '--button-tertiary-text': 'var(--button-tertiary-foreground)',
        };
    }
  };

  const gapClass = getGapClass(gap);
  const gapStyle = getGapStyle(gap);
  return (
    <div className={clsx('flex flex-wrap', gapClass, className)} style={gapStyle}>
      {/* eslint-disable-next-line @typescript-eslint/consistent-type-assertions */}
      {playlists.map((p) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const isActive = activePlaylist === p.id;
        const isGhost = variant === 'ghost';

        return (
          <Button
            key={p.id}
            onClick={() => {
              dispatchSwitch(p.id);
            }}
            variant={variant}
            size={size}
            shape={shape}
            style={getButtonStyle(variant)}
            className={clsx(
              'whitespace-nowrap',
              isGhost && !isActive && 'border-white text-white hover:text-black',
            )}
          >
            {p.label}
          </Button>
        );
      })}

      {hasLink ? (
        <a href={link4Url} target="_blank" rel="noopener noreferrer">
          <Button
            variant={variant}
            size={size}
            shape={shape}
            style={getButtonStyle(variant)}
            className={clsx(
              'whitespace-nowrap',
              variant === 'ghost' ? 'border-white text-white hover:text-black' : '',
            )}
          >
            {link4Label}
          </Button>
        </a>
      ) : null}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-unused-vars */

runtime.registerComponent(YouTubePlaylistSwitcher, {
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
});
/* eslint-enable @typescript-eslint/no-unused-vars */
