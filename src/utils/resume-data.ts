import { replaceDurationPlaceholder } from './career-duration';
import type { ResumeData, Labels } from '../content.config';

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
  technicalWriting: ResumeData['technicalWriting'];
  openSource: ResumeData['openSource'];
  awards: ResumeData['awards'];
}

export function prepareResumeData(resumeData: ResumeData, lang: 'ko' | 'en'): { data: PreparedResumeData; labels: Labels } {
  const data: PreparedResumeData = {
    ...resumeData.personalInfo,
    summary: replaceDurationPlaceholder(resumeData.summary, resumeData.experience, lang),
    coreCompetencies: resumeData.coreCompetencies,
    skills: resumeData.skills,
    experience: resumeData.experience,
    education: resumeData.education,
    certifications: resumeData.certifications,
    continuousLearning: resumeData.continuousLearning,
    technicalWriting: resumeData.technicalWriting,
    openSource: resumeData.openSource,
    awards: resumeData.awards,
  };
  const labels = resumeData.labels;

  return { data, labels };
}
