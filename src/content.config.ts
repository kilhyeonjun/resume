import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const resumeCollection = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/resume' }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    summary: z.string().optional(),
    experience: z.array(z.object({
      company: z.string(),
      position: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
      highlights: z.array(z.string()).optional(),
    })).optional(),
    education: z.array(z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      gpa: z.string().optional(),
    })).optional(),
    skills: z.array(z.object({
      category: z.string(),
      items: z.array(z.string()),
    })).optional(),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string(),
      url: z.string().url().optional(),
      technologies: z.array(z.string()).optional(),
    })).optional(),
    certifications: z.array(z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string(),
      url: z.string().url().optional(),
    })).optional(),
    languages: z.array(z.object({
      language: z.string(),
      proficiency: z.string(),
    })).optional(),
  }),
});

export const collections = {
  resume: resumeCollection,
};
