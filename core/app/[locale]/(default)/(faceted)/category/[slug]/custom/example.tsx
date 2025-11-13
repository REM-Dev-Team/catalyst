/**
 * Example custom category page.
 *
 * To use this as a template:
 * 1. Copy this file and rename it to match your category ID (e.g., `123.tsx`)
 * 2. Customize the component to your needs
 * 3. Register it in `_lib/get-custom-category-page.ts`:
 *
 *    import CustomCategory123 from '../custom/123';
 *    export const customCategoryPages: Record<number, ComponentType<Props>> = {
 *      123: CustomCategory123,
 *    };
 *
 * This example shows how to create a custom category page while still
 * using some of the default functionality.
 */

import { setRequestLocale } from 'next-intl/server';

import { PriceLabel } from '@/vibes/soul/primitives/price-label';

import type { Props } from '../page';
import { getCategory, getListProducts, getBreadcrumbs } from '../page';

export default async function ExampleCustomCategoryPage(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  // You can use the same helper functions from the default page
  const category = await getCategory(props);
  const products = await getListProducts(props);
  const breadcrumbs = await getBreadcrumbs(props);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Example: Custom breadcrumbs */}
      <nav className="mb-4">
        <ol className="flex space-x-2">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              <a href={crumb.href} className="text-blue-600 hover:underline">
                {crumb.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
      <p className="text-lg mb-8">
        This is a custom category page for category ID: {category.entityId}
      </p>

      {/* Example: Custom product listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            {product.image && (
              <img
                src={product.image.src}
                alt={product.image.alt}
                className="w-full h-48 object-cover mb-2"
              />
            )}
            <h3 className="font-semibold">{product.title}</h3>
            {product.subtitle && <p className="text-sm text-gray-600">{product.subtitle}</p>}
            {product.price && (
              <div className="mt-2">
                <PriceLabel price={product.price} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add your custom content here */}
    </div>
  );
}

