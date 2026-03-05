import type { OpenSource } from '../content.config';

export interface OpenSourceGroup {
  repoUrl?: string;
  items: OpenSource[];
}

export function groupOpenSourceByRepo(
  items: OpenSource[],
): Record<string, OpenSourceGroup> {
  const grouped: Record<string, OpenSourceGroup> = {};
  items.forEach((item) => {
    const colonIdx = item.name.indexOf(':');
    const repo = colonIdx > -1 ? item.name.substring(0, colonIdx).trim() : item.name;
    if (!grouped[repo]) {
      const repoUrl = item.url?.replace(/\/(pull|issues)\/.*$/, '') || undefined;
      grouped[repo] = { repoUrl, items: [] };
    }
    grouped[repo].items.push(item);
  });
  return grouped;
}

export function parseOpenSourceName(name: string): { repo: string; description: string } {
  const colonIdx = name.indexOf(':');
  return {
    repo: colonIdx > -1 ? name.substring(0, colonIdx).trim() : name,
    description: colonIdx > -1 ? name.substring(colonIdx + 1).trim() : name,
  };
}
