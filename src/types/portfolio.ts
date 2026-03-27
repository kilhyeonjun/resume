import { z } from 'astro:content';

const localizedStringSchema = z.object({
  ko: z.string(),
  en: z.string(),
});

const blogPostSchema = z.object({
  title: localizedStringSchema,
  url: z.string().url(),
});

const portfolioProjectSchema = z.object({
  slug: z.string(),
  name: localizedStringSchema,
  type: z.enum(['team', 'personal']),
  featured: z.boolean().optional(),
  listed: z.boolean().optional(),
  hidden: z.boolean().optional(),
  printOrder: z.number().optional(),
  summary: localizedStringSchema,
  description: localizedStringSchema.optional(),
  coverImage: z.string().optional(),
  contentImages: z.array(z.string()).optional(),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  skills: z.array(z.string()),
  github: z.string().url().optional(),
  links: z.record(z.string(), z.string()).optional(),
  blogPosts: z.array(blogPostSchema).optional(),
  highlights: z.object({ ko: z.array(z.string()), en: z.array(z.string()) }),
  features: z.object({ ko: z.array(z.string()), en: z.array(z.string()) }).optional(),
  lessons: z.object({ ko: z.array(z.string()), en: z.array(z.string()) }).optional(),
  teamComposition: localizedStringSchema.optional(),
  collaborationTools: z.array(z.string()).optional(),
});

const portfolioLabelsSchema = z.object({
  portfolio: z.string(),
  projects: z.string(),
  highlights: z.string(),
  skills: z.string(),
  period: z.string(),
  github: z.string(),
  relatedPosts: z.string(),
  relatedLinks: z.string(),
  teamComposition: z.string(),
  collaborationTools: z.string(),
  backToPortfolio: z.string(),
  previousProject: z.string(),
  nextProject: z.string(),
  viewDetails: z.string(),
  personal: z.string(),
  team: z.string(),
  description: z.string(),
  features: z.string(),
  lessons: z.string(),
  projectImages: z.string(),
});

export const portfolioDataSchema = z.object({
  projects: z.array(portfolioProjectSchema),
  labels: z.object({
    ko: portfolioLabelsSchema,
    en: portfolioLabelsSchema,
  }),
});

export type LocalizedString = z.infer<typeof localizedStringSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type PortfolioProject = z.infer<typeof portfolioProjectSchema>;
export type PortfolioLabels = z.infer<typeof portfolioLabelsSchema>;
export type PortfolioData = z.infer<typeof portfolioDataSchema>;
