import type { PortfolioProject } from '../types/portfolio';

function sortProjects(projects: PortfolioProject[]): PortfolioProject[] {
  return [...projects].sort((a, b) =>
    (a.printOrder ?? Number.MAX_SAFE_INTEGER) - (b.printOrder ?? Number.MAX_SAFE_INTEGER)
    || new Date(b.period.start).getTime() - new Date(a.period.start).getTime()
  );
}

export type PortfolioFocus = 'backend-platform' | 'product-algorithm' | null;

const focusedOrders: Record<Exclude<PortfolioFocus, null>, string[]> = {
  'backend-platform': ['ai-coding-harness', 'concert-reservation', 'flex-work-schedule'],
  'product-algorithm': ['flex-work-schedule', 'concert-reservation', 'ai-coding-harness'],
};

export function selectFeaturedPortfolioProjects(projects: PortfolioProject[], focus: PortfolioFocus = null): PortfolioProject[] {
  const featured = sortProjects(projects.filter((project) => project.featured && !project.hidden));
  if (!focus) return featured;
  const order = focusedOrders[focus];
  return [...featured].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
}

export function selectListedPortfolioProjects(projects: PortfolioProject[]): PortfolioProject[] {
  return sortProjects(projects.filter((project) => project.listed && !project.hidden));
}

export function selectPublicPortfolioProjects(projects: PortfolioProject[]): PortfolioProject[] {
  return [
    ...selectFeaturedPortfolioProjects(projects),
    ...selectListedPortfolioProjects(projects),
  ];
}
