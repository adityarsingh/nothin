import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/pricing'],
      disallow: ['/api/*', '/app/*', '/settings/*', '/today', '/timeline', '/calendar', '/search', '/reflections', '/entry/*'],
    },
    sitemap: 'https://nothin.vercel.app/sitemap.xml',
  };
}
