import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Number,
  Select,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSSlideshow } from './client';

runtime.registerComponent(MSSlideshow, {
  type: 'section-slideshow',
  label: 'Sections / Slideshow',
  icon: 'carousel',
  props: {
    className: Style(),
    slides: List({
      label: 'Slides',
      type: Group({
        props: {
          title: TextInput({ label: 'Title', defaultValue: 'Slide title' }),
          secondTitle: TextInput({ label: 'Second title', defaultValue: '' }),
          showDescription: Checkbox({ label: 'Show description', defaultValue: true }),
          description: TextArea({ label: 'Description', defaultValue: 'Slide description' }),
          imageSrc: Image(),
          imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Slide image' }),
          imageHoldSeconds: Number({
            label: 'Image duration (seconds, 0 = use slideshow default)',
            defaultValue: 0,
            suffix: 's',
          }),
          hideAccentLine: Checkbox({
            label: 'Hide accent line above buttons',
            defaultValue: false,
          }),
          showButton: Checkbox({ label: 'Show primary button', defaultValue: true }),
          buttonText: TextInput({ label: 'Button text', defaultValue: 'Shop all' }),
          buttonLink: Link({ label: 'Button link' }),
          buttonColor: Select({
            label: 'Button color',
            options: [
              { value: 'primary', label: 'Primary' },
              { value: 'secondary', label: 'Secondary' },
              { value: 'tertiary', label: 'Tertiary' },
              { value: 'ghost', label: 'Ghost' },
            ],
            defaultValue: 'primary',
          }),
          showSecondButton: Checkbox({ label: 'Show second button', defaultValue: false }),
          secondButtonText: TextInput({ label: 'Second button text', defaultValue: 'Learn more' }),
          secondButtonLink: Link({ label: 'Second button link' }),
          secondButtonColor: Select({
            label: 'Second button color',
            options: [
              { value: 'primary', label: 'Primary' },
              { value: 'secondary', label: 'Secondary' },
              { value: 'tertiary', label: 'Tertiary' },
              { value: 'ghost', label: 'Ghost' },
            ],
            defaultValue: 'secondary',
          }),
          contentAlignment: Select({
            label: 'Content alignment',
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ],
            defaultValue: 'left',
          }),
          verticalAlignment: Select({
            label: 'Vertical alignment',
            options: [
              { value: 'top', label: 'Top' },
              { value: 'center', label: 'Center' },
              { value: 'bottom', label: 'Bottom' },
            ],
            defaultValue: 'center',
          }),
        },
      }),
      getItemLabel(slide) {
        return slide?.title || 'Slide title';
      },
    }),
    autoplay: Checkbox({ label: 'Autoplay', defaultValue: true }),
    interval: Number({ label: 'Duration', defaultValue: 5, suffix: 's' }),
    mobileAspectRatio: Select({
      label: 'Mobile aspect ratio (below large screens)',
      options: [
        { value: '16:9', label: '16:9 (wide)' },
        { value: '2:1', label: '2:1 (extra wide)' },
        { value: '3:2', label: '3:2' },
        { value: '5:4', label: '5:4' },
        { value: '1:1', label: '1:1 (square)' },
        { value: '4:5', label: '4:5 (portrait)' },
        { value: '9:16', label: '9:16 (very tall portrait)' },
      ],
      defaultValue: '16:9',
    }),
  },
});
