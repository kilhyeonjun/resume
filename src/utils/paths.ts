export function getBasePath(lang: 'ko' | 'en'): string {
  return lang === 'en' ? `${import.meta.env.BASE_URL}/en` : import.meta.env.BASE_URL;
}
