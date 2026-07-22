// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.kilpenguin.com',
  base: '/resume',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/resume-print') && !page.includes('/resume-ats') && !page.includes('/og-image'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
