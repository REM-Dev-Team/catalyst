import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Number,
  Select,
  Slot,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftHeader } from './site-header.client';

export const COMPONENT_TYPE = 'catalyst-makeswift-header';

const banner = Group({
  label: 'Banner',
  preferredLayout: Group.Layout.Popover,
  props: {
    show: Checkbox({ label: 'Show banner', defaultValue: false }),
    allowClose: Checkbox({ label: 'Allow banner to close', defaultValue: true }),
    id: TextInput({ label: 'Banner ID', defaultValue: 'black_friday_2025' }),
    children: Slot(),
  },
});

const logoGroup = (
  label: string,
  defaults: {
    width: number;
    height: number;
  },
) =>
  Group({
    label,
    props: {
      src: Image({ label: 'Logo' }),
      alt: TextInput({ label: 'Alt text', defaultValue: 'Logo alt' }),
      width: Number({ label: 'Max width', suffix: 'px', defaultValue: defaults.width }),
      height: Number({ label: 'Max height', suffix: 'px', defaultValue: defaults.height }),
    },
  });

const logo = Group({
  label: 'Logo',
  preferredLayout: Group.Layout.Popover,
  props: {
    desktop: logoGroup('Desktop', { width: 200, height: 40 }),
    mobile: logoGroup('Mobile', { width: 100, height: 40 }),
    link: Link({ label: 'Logo link' }),
  },
});

const links = List({
  label: 'Links',
  type: Group({
    label: 'Link',
    props: {
      label: TextInput({ label: 'Text', defaultValue: 'Text' }),
      link: Link({ label: 'URL' }),
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Text',
});

const groups = List({
  label: 'Groups',
  type: Group({
    label: 'Link group',
    props: {
      label: TextInput({ label: 'Text', defaultValue: 'Text' }),
      link: Link({ label: 'URL' }),
      links,
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Text',
});

const imageColumns = List({
  label: 'Image columns',
  type: Group({
    label: 'Image column',
    props: {
      imageSrc: Image({ label: 'Image' }),
      imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Image alt text' }),
      title: TextInput({ label: 'Title', defaultValue: 'Image title' }),
      link: Link({ label: 'Image link' }),
    },
  }),
  getItemLabel: (item) => item?.title ?? 'Image column',
});

runtime.registerComponent(MakeswiftHeader, {
  type: COMPONENT_TYPE,
  label: 'Site Header',
  hidden: true,
  props: {
    banner,
    logo,
    links: List({
      label: 'Additional links',
      type: Group({
        label: 'Link',
        props: {
          label: TextInput({ label: 'Text', defaultValue: 'Text' }),
          link: Link({ label: 'URL' }),
          groups,
          imageColumns,
        },
      }),
      getItemLabel: (item) => item?.label ?? 'Text',
    }),
    linksPosition: Select({
      label: 'Links position',
      options: [
        { value: 'center', label: 'Center' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    }),
  },
});
