import './components/accordions/accordions.makeswift';
import './components/blog-post-card/blog-post-card.makeswift';
import './components/blog-post-carousel/blog-post-carousel.makeswift';
import './components/brand-carousel/brand-carousel.makeswift';
import './components/button-link/button-link.makeswift';
import './components/card-carousel/card-carousel.makeswift';
import './components/card/card.makeswift';
import './components/carousel/carousel.makeswift';
import './components/constant-contact-subscribe/constant-contact-subscribe.makeswift';
import './components/customer-group-slot/customer-group-slot.makeswift';
import './components/product-card/product-card.makeswift';
import './components/products-carousel/products-carousel.makeswift';
import './components/products-list/products-list.makeswift';
import './components/section/section.makeswift';
import './components/site-footer/site-footer.makeswift';
import './components/site-header/site-header.makeswift';
import './components/slideshow/slideshow.makeswift';
import './components/sticky-sidebar/sticky-sidebar.makeswift';
import './components/youtube-video-carousel/youtube-video-carousel.makeswift';
import './components/youtube-video-carousel-row/youtube-video-carousel-row.makeswift';
import './components/youtube-video-card/youtube-video-card.makeswift';
import './components/youtube-video-modal/youtube-video-modal.makeswift';
import './components/product-detail/register';

import './components/site-theme/register';

import { MakeswiftComponentType } from '@makeswift/runtime';

import { runtime } from './runtime';

// Hide some builtin Makeswift components

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Carousel,
  label: 'Carousel (hidden)',
  hidden: true,
  props: {},
});

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Countdown,
  label: 'Countdown (hidden)',
  hidden: true,
  props: {},
});

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Form,
  label: 'Form (hidden)',
  hidden: true,
  props: {},
});

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Navigation,
  label: 'Navigation (hidden)',
  hidden: true,
  props: {},
});
