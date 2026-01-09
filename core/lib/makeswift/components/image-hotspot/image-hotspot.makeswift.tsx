import {
  Checkbox,
  Group,
  Image,
  List,
  Number,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { HotspotData, ImageHotspot } from './index';
import { runtime } from '~/lib/makeswift/runtime';

interface MSImageHotspotProps {
  className?: string;
  image: string | undefined; // Image control returns a string URL or undefined
  imageAlt: string;
  showHotspots: boolean;
  hotspots: Array<{
    id: string;
    x: number;
    y: number;
    title: string;
    content: string;
    image?: string; // Image control returns a string URL
    imageAlt?: string;
  }>;
}

runtime.registerComponent(
  function MSImageHotspot({
    image,
    imageAlt,
    showHotspots,
    hotspots,
    className,
  }: MSImageHotspotProps) {
    // Transform the data to match our component interface
    const transformedHotspots: HotspotData[] = hotspots.map((hotspot) => ({
      id: hotspot.id || `hotspot-${Math.random()}`,
      x: hotspot.x || 50,
      y: hotspot.y || 50,
      title: hotspot.title || 'Hotspot',
      content: hotspot.content || '',
      image: hotspot.image?.trim()
        ? {
            src: hotspot.image,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            alt: hotspot.imageAlt ?? '',
          }
        : undefined,
    }));

    return (
      <ImageHotspot
        image={{
          src: image || '',
          alt: imageAlt || '',
          width: 800,
          height: 600,
        }}
        hotspots={transformedHotspots}
        showHotspots={showHotspots}
        className={className}
      />
    );
  },
  {
    type: 'ImageHotspot',
    label: 'Image Hotspot',
    icon: 'image',
    props: {
      className: Style({ properties: [Style.Margin] }),
      image: Image({
        label: 'Background Image',
      }),
      imageAlt: TextInput({
        label: 'Image Alt Text',
        defaultValue: 'Background image',
      }),
      showHotspots: Checkbox({
        label: 'Show Hotspots',
        defaultValue: true,
      }),
      hotspots: List({
        label: 'Hotspots',
        type: Group({
          label: 'Hotspot',
          props: {
            id: TextInput({
              label: 'Hotspot ID',
              defaultValue: '',
            }),
            x: Number({
              label: 'X Position (%)',
              defaultValue: 50,
              min: 0,
              max: 100,
            }),
            y: Number({
              label: 'Y Position (%)',
              defaultValue: 50,
              min: 0,
              max: 100,
            }),
            title: TextInput({
              label: 'Title',
              defaultValue: 'Hotspot Title',
            }),
            content: TextInput({
              label: 'Content',
              defaultValue: 'Hotspot content goes here...',
            }),
            image: Image({
              label: 'Hotspot Image (Optional)',
            }),
            imageAlt: TextInput({
              label: 'Hotspot Image Alt Text',
              defaultValue: 'Hotspot image',
            }),
          },
        }),
        getItemLabel: (item) => item?.title || 'Hotspot',
      }),
    },
  },
);
