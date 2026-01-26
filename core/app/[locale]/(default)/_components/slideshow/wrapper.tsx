import { getAllProductsCategoryPath } from '~/lib/get-all-products-category-path';

import { Slideshow } from './index';

export async function SlideshowWrapper() {
  const allProductsPath = await getAllProductsCategoryPath();

  return <Slideshow allProductsPath={allProductsPath} />;
}
