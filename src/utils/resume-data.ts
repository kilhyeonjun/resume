import { replaceDurationPlaceholder } from './career-duration';

export function prepareResumeData(resumeData: any, lang: string) {
  const data = {
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
