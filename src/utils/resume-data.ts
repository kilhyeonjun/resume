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

function dateKey(value?: string) {
  const matches = [...(value ?? '').matchAll(/(20\d{2})[.-](\d{2})/g)];
  if (matches.length === 0) return 0;
  const last = matches[matches.length - 1];
  return Number(`${last[1]}${last[2]}`);
}

function sortByDateDesc<T>(items: T[], getDate: (item: T) => string | undefined) {
  return [...items].sort((a, b) => dateKey(getDate(b)) - dateKey(getDate(a)));
}

function filterExperienceForSurface(experience: ResumeData['experience'], surface: ResumeSurface) {
  return experience.map((item) => ({
    ...item,
    projects: filterProjectsForSurface(item.projects, surface),
    activities: filterActivitiesForSurface(item.activities, surface),
  }));
}

function filterCoreCompetenciesForSurface(coreCompetencies: ResumeData['coreCompetencies']) {
  return coreCompetencies;
}

function filterOpenSourceForSurface(openSource: ResumeData['openSource'], surface: ResumeSurface) {
  if (surface === 'web' || surface === 'experience') return openSource;
  // print + ats: Merged first, then Open — Merged is a stronger hiring signal
  const sorted = [...openSource].sort((a, b) => {
    const order = { Merged: 0, Open: 1, Closed: 2 };
    const statusOrder = (order[a.status ?? 'Closed'] ?? 2) - (order[b.status ?? 'Closed'] ?? 2);
    return statusOrder || dateKey(b.date) - dateKey(a.date);
  });
  return sorted.slice(0, 3);
}

function filterTechnicalWritingForSurface(technicalWriting: ResumeData['technicalWriting']) {
  return sortByDateDesc(technicalWriting, (item) => item.date);
}

function filterContinuousLearningForSurface(continuousLearning: ResumeData['continuousLearning'], surface: ResumeSurface) {
  const sorted = sortByDateDesc(continuousLearning, (item) => item.period);
  if (surface === 'web' || surface === 'experience') return sorted;
  if (surface === 'print') return sorted.slice(0, 1);
  return sorted.slice(0, 3);
}

function filterTrainingProgramsForSurface(trainingPrograms: ResumeData['trainingPrograms'], surface: ResumeSurface) {
  const sorted = sortByDateDesc(trainingPrograms, (item) => item.period);
  return surface === 'print' ? [] : sorted;
}

export function prepareResumeData(
  resumeData: ResumeData,
  lang: 'ko' | 'en',
  surface: ResumeSurface = 'web',
): { data: PreparedResumeData; labels: Labels } {
  const data: PreparedResumeData = {
    ...resumeData.personalInfo,
    summary: replaceDurationPlaceholder(resumeData.summary, resumeData.experience, lang),
    coreCompetencies: filterCoreCompetenciesForSurface(resumeData.coreCompetencies),
    skills: resumeData.skills,
    experience: filterExperienceForSurface(resumeData.experience, surface),
    education: sortByDateDesc(resumeData.education, (item) => item.endDate),
    certifications: sortByDateDesc(resumeData.certifications, (item) => item.date),
    continuousLearning: filterContinuousLearningForSurface(resumeData.continuousLearning, surface),
    trainingPrograms: filterTrainingProgramsForSurface(resumeData.trainingPrograms, surface),
    technicalWriting: filterTechnicalWritingForSurface(resumeData.technicalWriting),
    openSource: filterOpenSourceForSurface(resumeData.openSource, surface),
    awards: resumeData.awards,
  };
  const labels = resumeData.labels;

  return { data, labels };
}
