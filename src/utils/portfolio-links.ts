import type { PortfolioProject } from '../types/portfolio';

export function getPortfolioDemoLink(project: PortfolioProject, lang: 'ko' | 'en') {
  const url = project.links?.Demo;
  if (!url || url === project.github) return null;

  const isRepository = /^https?:\/\/github\.com(?:\/|$)/i.test(url);
  const label = isRepository
    ? (lang === 'ko' ? '예제 저장소' : 'Example repository')
    : project.slug === 'family-budget-demo'
      ? (lang === 'ko' ? '합성 데이터 데모 실행 · 운영 미연결' : 'Run synthetic-data demo · not connected to operations')
      : (lang === 'ko' ? '데모 열기' : 'Open demo');

  return { url, label };
}
