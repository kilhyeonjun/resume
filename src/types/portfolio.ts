export interface LocalizedString {
  ko: string;
  en: string;
}

export interface BlogPost {
  title: LocalizedString;
  url: string;
}

export interface PortfolioProject {
  slug: string;
  name: LocalizedString;
  type: string;
  summary: LocalizedString;
  description?: LocalizedString;
  coverImage?: string;
  contentImages?: string[];
  period: {
    start: string;
    end: string;
  };
  skills: string[];
  github?: string;
  links?: Record<string, string>;
  blogPosts?: BlogPost[];
  highlights: { ko: string[]; en: string[] };
  features?: { ko: string[]; en: string[] };
  lessons?: { ko: string[]; en: string[] };
  teamComposition?: LocalizedString;
  collaborationTools?: string[];

}

export interface PortfolioLabels {
  portfolio: string;
  projects: string;
  highlights: string;
  skills: string;
  period: string;
  github: string;
  relatedPosts: string;
  relatedLinks: string;
  teamComposition: string;
  collaborationTools: string;
  backToPortfolio: string;
  previousProject: string;
  nextProject: string;
  viewDetails: string;
  personal: string;
  team: string;
  description: string;
  features: string;
  lessons: string;
  projectImages: string;
}

export interface PortfolioData {
  projects: PortfolioProject[];
  labels: {
    ko: PortfolioLabels;
    en: PortfolioLabels;
  };
}
