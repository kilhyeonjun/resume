import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const dateString = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Date must be YYYY-MM format');
const dateStringLoose = z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Date must be YYYY or YYYY-MM format');

const skillItemSchema = z.object({
  name: z.string(),
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
  techStack: z.array(z.string()).optional(),
});

const experienceSchema = z.object({
  slug: z.string(),
  company: z.string(),
  companyUrl: z.string().url().optional(),
  position: z.string(),
  startDate: dateString,
  endDate: dateString.optional(),
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
  startDate: dateString,
  endDate: dateString,
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
  date: dateString,
  type: z.string(),
  url: z.string().url().optional(),
});

const openSourceSchema = z.object({
  name: z.string(),
  date: dateString,
  url: z.string().url().optional(),
});

const awardSchema = z.object({
  name: z.string(),
  date: dateStringLoose,
  description: z.string().optional(),
});

const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: dateString,
  url: z.string().url().optional(),
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
  projects: z.string(),
  highlights: z.string(),
  current: z.string(),
  print: z.string(),
  pdfVersion: z.string(),
  atsOptimized: z.string(),
  backToResume: z.string(),
  previousCompany: z.string(),
  nextCompany: z.string(),
  viewDetails: z.string(),
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
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type SkillItem = z.infer<typeof skillItemSchema>;
export type CoreCompetency = z.infer<typeof coreCompetencySchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Education = z.infer<typeof educationSchema>;
export type ContinuousLearning = z.infer<typeof continuousLearningSchema>;
export type TechnicalWriting = z.infer<typeof technicalWritingSchema>;
export type OpenSource = z.infer<typeof openSourceSchema>;
export type Award = z.infer<typeof awardSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Labels = z.infer<typeof labelsSchema>;
export type Links = z.infer<typeof linksSchema>;
