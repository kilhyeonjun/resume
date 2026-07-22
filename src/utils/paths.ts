export function getLocalePrefix(lang: 'ko' | 'en'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return lang === 'en' ? `${base}/en` : base;
}

export function getHomePath(lang: 'ko' | 'en'): string {
  return withBasePath(lang === 'en' ? 'en/' : '');
}

export function withBasePath(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\/+/, '')}`;
}
