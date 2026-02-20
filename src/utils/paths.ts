export function getBasePath(lang: 'ko' | 'en'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return lang === 'en' ? `${base}/en` : base;
}
