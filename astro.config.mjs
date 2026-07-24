// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://career.kilpenguin.com',
  base: '/',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/resume-print') && !page.includes('/resume-ats')
        && !page.includes('/portfolio-print') && !page.includes('/experience-print')
        && !page.includes('/og-image'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
