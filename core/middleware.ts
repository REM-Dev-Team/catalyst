import { composeMiddlewares } from './middlewares/compose-middlewares';
import { withAuth } from './middlewares/with-auth';
import { withChannelId } from './middlewares/with-channel-id';
import { withIntl } from './middlewares/with-intl';
import { withMakeswift } from './middlewares/with-makeswift';
import { withRoutes } from './middlewares/with-routes';

export const middleware = composeMiddlewares(
  withAuth,
  withMakeswift,
  withIntl,
  withChannelId,
  withRoutes,
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (vercel internals, eg: web vitals)
     * - favicon.ico (favicon file)
     * - admin (admin panel)
     * - sitemap.xml (sitemap route)
     * - xmlsitemap.php (legacy sitemap route)
     * - robots.txt (robots route)
     * - api/makeswift (makeswift API routes)
     * - api/auth (auth API routes)
     */
    '/((?!_next/static|_next/image|_vercel|favicon.ico|admin|xmlsitemap.php|sitemap.xml|robots.txt|api/makeswift|api/auth).*)',
  ],
};
