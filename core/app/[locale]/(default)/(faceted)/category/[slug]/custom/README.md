# Custom Category Pages

This directory contains custom page components for specific product categories.

## How to Create a Custom Category Page

1. Create a new file in this directory named after the category ID (e.g., `123.tsx` for category ID 123)
2. Export a default component that accepts the same `Props` as the default category page
3. Register your custom page in `_lib/get-custom-category-page.ts`

## Example

```tsx
// custom/123.tsx
import type { Props } from '../page';

export default async function CustomCategory123(props: Props) {
  // Your custom page implementation here
  return (
    <div>
      <h1>Custom Category Page</h1>
      {/* Your custom content */}
    </div>
  );
}
```

Then register it in `_lib/get-custom-category-page.ts`:

```tsx
import CustomCategory123 from '../custom/123';

export const customCategoryPages: Record<number, ComponentType<Props>> = {
  123: CustomCategory123,
};
```

## Available Props

The `Props` interface includes:
- `params`: Promise containing `slug` (category ID) and `locale`
- `searchParams`: Promise containing URL search parameters

You can use the same helper functions from the default page (e.g., `getCategory`, `getProducts`, etc.) or implement your own logic.

