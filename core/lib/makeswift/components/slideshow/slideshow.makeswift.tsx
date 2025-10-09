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

import { Slideshow } from '@/vibes/soul/sections/slideshow';
import { runtime } from '~/lib/makeswift/runtime';

interface Slide {
  title: string;
  secondTitle: string;
  description: string;
  showDescription: boolean;
  imageSrc?: string;
  imageAlt: string;
  showButton: boolean;
  buttonLink?: { href?: string; target?: string };
  buttonText: string;
  buttonColor: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  showSecondButton: boolean;
  secondButtonLink?: { href?: string; target?: string };
  secondButtonText: string;
  secondButtonColor: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  contentAlignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'center' | 'bottom';
}

interface MSAccordionsProps {
  className: string;
  slides: Slide[];
  autoplay: boolean;
  interval: number;
}

runtime.registerComponent(
  function MSSlideshow({ 
    className, 
    slides, 
    autoplay, 
    interval
  }: MSAccordionsProps) {
    return (
      <Slideshow
        className={className}
        interval={interval * 1000}
        playOnInit={autoplay}
        slides={slides.map(
          ({
            title,
            secondTitle,
            description,
            showDescription,
            imageSrc,
            imageAlt,
            showButton,
            buttonLink,
            buttonText,
            buttonColor,
            showSecondButton,
            secondButtonLink,
            secondButtonText,
            secondButtonColor,
            contentAlignment,
            verticalAlignment,
          }) => {
            return {
              title,
              secondTitle,
              description,
              showDescription,
              image: imageSrc ? { alt: imageAlt, src: imageSrc } : undefined,
              showCta: showButton,
              cta: {
                label: buttonText,
                href: buttonLink?.href ?? '#',
                variant: buttonColor,
                shape: 'rounded',
                size: 'x-small',
              },
              showSecondCta: showSecondButton,
              secondCta: {
                label: secondButtonText,
                href: secondButtonLink?.href ?? '#',
                variant: secondButtonColor,
                shape: 'rounded',
                size: 'x-small',
              },
              contentAlignment,
              verticalAlignment,
            };
          },
        )}
      />
    );
  },
  {
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
            secondTitle: TextInput({ label: 'Second Title', defaultValue: 'Second slide title' }),
            showDescription: Checkbox({ label: 'Show description', defaultValue: true }),
            description: TextArea({ label: 'Description', defaultValue: 'Slide description' }),
            imageSrc: Image({ label: 'Image or Video' }),
            imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Slide image' }),
            showButton: Checkbox({ label: 'Show button', defaultValue: true }),
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
            secondButtonText: TextInput({
              label: 'Second button text',
              defaultValue: 'Learn more',
            }),
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
    },
  },
);
