import { z } from 'astro/zod';

const localizedStringSchema = z.object({
  ko: z.string(),
  en: z.string(),
});

const blogPostSchema = z.object({
  title: localizedStringSchema,
  url: z.url(),
});

const localizedValueSchema = z.union([z.string(), localizedStringSchema]);

const metricSchema = z.object({
  label: localizedStringSchema,
  before: localizedValueSchema,
  after: localizedValueSchema,
  improvement: localizedValueSchema,
});

const localizedStringArraySchema = z.object({
  ko: z.array(z.string()),
  en: z.array(z.string()),
});

const problemSolvingEntrySchema = z.object({
  problem: localizedStringSchema,
  process: localizedStringSchema,
  result: localizedStringSchema,
});

const scenarioEvidenceSchema = z.object({
  image: localizedStringSchema,
  title: localizedStringSchema,
  caption: localizedStringSchema,
});

const publicEvidenceSchema = z.object({
  claim: localizedStringSchema,
  question: localizedStringSchema,
  label: z.string(),
  url: z.url(),
  testLabel: z.string().optional(),
  testUrl: z.url().optional(),
});

const glossaryEntrySchema = z.object({
  term: localizedStringSchema,
  definition: localizedStringSchema,
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
  role: localizedStringSchema.optional(),
  glossary: z.array(glossaryEntrySchema).optional(),
  coverImage: localizedValueSchema.optional(),
  contentImages: z.array(z.string()).optional(),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  skills: z.array(z.string()),
  github: z.url().optional(),
  links: z.record(z.string(), z.string()).optional(),
  blogPosts: z.array(blogPostSchema).optional(),
  highlights: z.object({ ko: z.array(z.string()), en: z.array(z.string()) }),
  features: z.object({ ko: z.array(z.string()), en: z.array(z.string()) }).optional(),
  problemSolving: z.array(problemSolvingEntrySchema).optional(),
  scenarioEvidence: z.array(scenarioEvidenceSchema).optional(),
  productScreens: z.array(scenarioEvidenceSchema).optional(),
  publicEvidence: z.array(publicEvidenceSchema).optional(),
  operationalLimits: localizedStringArraySchema.optional(),
  lessons: z.object({ ko: z.array(z.string()), en: z.array(z.string()) }).optional(),
  architectureDiagram: localizedValueSchema.optional(),
  printScenarioImage: localizedValueSchema.optional(),
  printArchitectureDiagram: localizedValueSchema.optional(),
  sequenceDiagram: localizedValueSchema.optional(),
  metrics: z.array(metricSchema).optional(),
  techDecisions: localizedStringArraySchema.optional(),
  scale: localizedStringSchema.optional(),
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
  techDecisions: z.string(),
  metrics: z.string(),
  scale: z.string(),
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
  problemSolving: z.string(),
  problemSolvingProblem: z.string(),
  problemSolvingProcess: z.string(),
  problemSolvingResult: z.string(),
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

export type Metric = z.infer<typeof metricSchema>;
export type ProblemSolvingEntry = z.infer<typeof problemSolvingEntrySchema>;
export type LocalizedString = z.infer<typeof localizedStringSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type PortfolioProject = z.infer<typeof portfolioProjectSchema>;
export type PortfolioLabels = z.infer<typeof portfolioLabelsSchema>;
export type PortfolioData = z.infer<typeof portfolioDataSchema>;
