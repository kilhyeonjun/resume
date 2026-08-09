import type { PortfolioProject } from '../types/portfolio';

function sortProjects(projects: PortfolioProject[]): PortfolioProject[] {
  return [...projects].sort((a, b) =>
    (a.printOrder ?? Number.MAX_SAFE_INTEGER) - (b.printOrder ?? Number.MAX_SAFE_INTEGER)
    || new Date(b.period.start).getTime() - new Date(a.period.start).getTime()
  );
}

export function selectFeaturedPortfolioProjects(projects: PortfolioProject[]): PortfolioProject[] {
  return sortProjects(projects.filter((project) => project.featured && !project.hidden));
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
