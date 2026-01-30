import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const skillItemSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const skillCategorySchema = z.object({
  category: z.string(),
  items: z.array(skillItemSchema),
});

const coreCompetencySchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

const projectSchema = z.object({
  name: z.string(),
  period: z.string(),
  description: z.string(),
  details: z.array(z.string()),
});

const experienceSchema = z.object({
  company: z.string(),
  companyUrl: z.string().url().optional(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  projects: z.array(projectSchema).optional(),
  techStack: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  gpa: z.string().optional(),
});

const continuousLearningSchema = z.object({
  name: z.string(),
  period: z.string(),
  description: z.string(),
  url: z.string().url().optional(),
});

const technicalWritingSchema = z.object({
  title: z.string(),
  date: z.string(),
  type: z.string(),
  url: z.string().url().optional(),
});

const openSourceSchema = z.object({
  name: z.string(),
  date: z.string(),
  url: z.string().url().optional(),
});

const awardSchema = z.object({
  name: z.string(),
  date: z.string(),
  description: z.string().optional(),
});

const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  url: z.string().url().optional(),
});

const languageSchema = z.object({
  language: z.string(),
  proficiency: z.string(),
});

const personalInfoSchema = z.object({
  name: z.string(),
  title: z.string(),
  email: z.string().email(),
  location: z.string().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  blog: z.string().url().optional(),
});

const linksSchema = z.object({
  portfolio: z.string().url().optional(),
  careerDetails: z.string().url().optional(),
});

const labelsSchema = z.object({
  summary: z.string(),
  coreCompetencies: z.string(),
  experience: z.string(),
  skills: z.string(),
  education: z.string(),
  continuousLearning: z.string(),
  technicalWriting: z.string(),
  openSource: z.string(),
  awards: z.string(),
  certifications: z.string(),
  languages: z.string(),
  projects: z.string(),
  current: z.string(),
  print: z.string(),
  pdfVersion: z.string(),
  atsOptimized: z.string(),
  backToResume: z.string(),
});

const resumeSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: z.string(),
  coreCompetencies: z.array(coreCompetencySchema),
  skills: z.array(skillCategorySchema),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  continuousLearning: z.array(continuousLearningSchema).optional(),
  technicalWriting: z.array(technicalWritingSchema).optional(),
  openSource: z.array(openSourceSchema).optional(),
  awards: z.array(awardSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  languages: z.array(languageSchema).optional(),
  links: linksSchema.optional(),
  labels: labelsSchema,
});

const resumeKo = defineCollection({
  loader: file('src/content/resume/ko.json'),
  schema: resumeSchema,
});

const resumeEn = defineCollection({
  loader: file('src/content/resume/en.json'),
  schema: resumeSchema,
});

export const collections = {
  'resume-ko': resumeKo,
  'resume-en': resumeEn,
};

export type ResumeData = z.infer<typeof resumeSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
