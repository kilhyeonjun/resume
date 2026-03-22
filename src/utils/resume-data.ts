import { replaceDurationPlaceholder } from './career-duration';
import type { ResumeData, Labels } from '../content.config';

export type ResumeSurface = 'web' | 'print' | 'ats' | 'experience';

interface PreparedResumeData {
  name: string;
  title: string;
  email: string;
  location?: string;
  linkedin?: string;
  github?: string;
  blog?: string;
  summary: string;
  coreCompetencies: ResumeData['coreCompetencies'];
  skills: ResumeData['skills'];
  experience: ResumeData['experience'];
  education: ResumeData['education'];
  certifications: ResumeData['certifications'];
  continuousLearning: ResumeData['continuousLearning'];
  trainingPrograms: ResumeData['trainingPrograms'];
  technicalWriting: ResumeData['technicalWriting'];
  openSource: ResumeData['openSource'];
  awards: ResumeData['awards'];
}

function filterProjectsForSurface(projects: ResumeData['experience'][number]['projects'], surface: ResumeSurface) {
  if (surface === 'experience') {
    return projects;
  }

  return projects.filter((project) => project.featured !== false);
}

function filterActivitiesForSurface(activities: ResumeData['experience'][number]['activities'], surface: ResumeSurface) {
  return surface === 'experience' ? activities : [];
}

function filterExperienceForSurface(experience: ResumeData['experience'], surface: ResumeSurface) {
  return experience.map((item) => ({
    ...item,
    projects: filterProjectsForSurface(item.projects, surface),
    activities: filterActivitiesForSurface(item.activities, surface),
  }));
}

function filterCoreCompetenciesForSurface(coreCompetencies: ResumeData['coreCompetencies'], surface: ResumeSurface) {
  if (surface !== 'print') return coreCompetencies;
  return coreCompetencies.map((group) => ({
    ...group,
    items: group.items.slice(0, 2),
  }));
}

function filterOpenSourceForSurface(openSource: ResumeData['openSource'], surface: ResumeSurface) {
  return surface === 'print' ? openSource.slice(0, 3) : openSource;
}

function filterTechnicalWritingForSurface(technicalWriting: ResumeData['technicalWriting'], _surface: ResumeSurface) {
  return technicalWriting;
}

function filterContinuousLearningForSurface(continuousLearning: ResumeData['continuousLearning'], surface: ResumeSurface) {
  return surface === 'print' ? continuousLearning.slice(0, 2) : continuousLearning;
}

export function prepareResumeData(
  resumeData: ResumeData,
  lang: 'ko' | 'en',
  surface: ResumeSurface = 'web',
): { data: PreparedResumeData; labels: Labels } {
  const data: PreparedResumeData = {
    ...resumeData.personalInfo,
    summary: replaceDurationPlaceholder(resumeData.summary, resumeData.experience, lang),
    coreCompetencies: filterCoreCompetenciesForSurface(resumeData.coreCompetencies, surface),
    skills: resumeData.skills,
    experience: filterExperienceForSurface(resumeData.experience, surface),
    education: resumeData.education,
    certifications: resumeData.certifications,
    continuousLearning: filterContinuousLearningForSurface(resumeData.continuousLearning, surface),
    trainingPrograms: resumeData.trainingPrograms,
    technicalWriting: filterTechnicalWritingForSurface(resumeData.technicalWriting, surface),
    openSource: filterOpenSourceForSurface(resumeData.openSource, surface),
    awards: resumeData.awards,
  };
  const labels = resumeData.labels;

  return { data, labels };
}
