// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://kilhyeonjun.github.io',
  base: '/resume',
  vite: {
    plugins: [tailwindcss()],
  },
});
