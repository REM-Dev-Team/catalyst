#!/bin/bash
# Script to copy custom files from origin/main to the clean v1.4 branch
# Run this from the catalyst-v1.4-clean branch

SOURCE_BRANCH="origin/main"
BASE_DIR="/Users/andy/Documents/GitHub/Kitchen/catalyst"

echo "=== Copying Custom Files from $SOURCE_BRANCH ==="
echo ""

# Custom category pages
echo "📁 Custom Category Pages..."
git checkout $SOURCE_BRANCH -- \
  core/app/[locale]/\(default\)/\(faceted\)/category/[slug]/custom/ \
  core/app/[locale]/\(default\)/\(faceted\)/category/[slug]/_lib/get-custom-category-page.ts \
  core/app/[locale]/\(default\)/\(faceted\)/category/[slug]/_lib/get-category-id-by-path.ts 2>/dev/null

# YouTube components
echo "📁 YouTube Components..."
git checkout $SOURCE_BRANCH -- \
  core/lib/makeswift/components/youtube-video-carousel/ \
  core/lib/makeswift/components/youtube-video-carousel-row/ \
  core/lib/makeswift/components/youtube-video-card/ \
  core/lib/makeswift/components/youtube-video-modal/ \
  core/lib/makeswift/components/youtube-playlist-switcher/ \
  core/lib/youtube/ \
  core/app/api/youtube/ 2>/dev/null

# Blog post components
echo "📁 Blog Post Components..."
git checkout $SOURCE_BRANCH -- \
  core/lib/makeswift/components/blog-post-card/ \
  core/lib/makeswift/components/blog-post-carousel/ \
  core/app/api/blog-posts/ 2>/dev/null

# Other custom Makeswift components
echo "📁 Other Custom Makeswift Components..."
git checkout $SOURCE_BRANCH -- \
  core/lib/makeswift/components/video/video.makeswift.tsx \
  core/lib/makeswift/components/image-hotspot/ \
  core/lib/makeswift/components/brand-carousel/ \
  core/lib/makeswift/components/constant-contact-subscribe/ \
  core/lib/makeswift/components/customer-group-slot/ 2>/dev/null

# Blog post content section
echo "📁 Blog Post Content Section..."
git checkout $SOURCE_BRANCH -- \
  core/vibes/soul/sections/blog-post-content/ \
  core/vibes/soul/primitives/blog-post-card/ \
  core/vibes/soul/primitives/youtube-video-card/ 2>/dev/null

# Utils
echo "📁 Utils..."
git checkout $SOURCE_BRANCH -- \
  core/lib/makeswift/utils/search-blog-posts.ts \
  core/lib/makeswift/utils/use-blog-posts.ts \
  core/lib/makeswift/utils/use-youtube-videos.ts 2>/dev/null

# Age verification
echo "📁 Age Verification..."
git checkout $SOURCE_BRANCH -- \
  core/vibes/soul/primitives/age-verification/ 2>/dev/null

# Shop-all page (if custom)
echo "📁 Shop-All Page..."
git checkout $SOURCE_BRANCH -- \
  core/app/[locale]/\(default\)/\(faceted\)/shop-all/ 2>/dev/null

echo ""
echo "✅ Custom files copied!"
echo ""
echo "⚠️  Next steps:"
echo "1. Review the copied files"
echo "2. Merge customizations in layout.tsx and globals.css carefully"
echo "3. Update core/lib/makeswift/components.ts to register new components"
echo "4. Test the build"

