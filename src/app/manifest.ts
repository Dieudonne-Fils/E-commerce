import type { MetadataRoute } from 'next'
import { brandBlue, pageBackground } from '@/lib/brand'
import { siteConfig } from '@/lib/site'

// Lets mobile browsers install the store on the home screen with its own icon
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: pageBackground,
    theme_color: brandBlue[600],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // The mark sits inside the central safe zone, so the same artwork works when Android crops it to a shape
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
