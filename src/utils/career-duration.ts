import type { Experience } from '../content.config';

interface YearMonth {
  year: number;
  month: number;
}

function parseYearMonth(dateStr: string): YearMonth {
  const [year, month] = dateStr.split('-').map(Number);
  return { year, month };
}

function yearMonthToMonths(ym: YearMonth): number {
  return ym.year * 12 + ym.month;
}

/**
 * Calculate total career duration from experience entries.
 * Handles overlapping periods by merging date ranges.
 * For current positions (current: true, no endDate), uses the current date.
 */
export function calculateTotalCareerMonths(experiences: Experience[]): number {
  if (experiences.length === 0) return 0;

  const now = new Date();
  const currentYm: YearMonth = { year: now.getFullYear(), month: now.getMonth() + 1 };

  // Convert each experience to [startMonths, endMonths] intervals
  const intervals: [number, number][] = experiences.map((exp) => {
    const start = yearMonthToMonths(parseYearMonth(exp.startDate));
    const end = exp.current || !exp.endDate
      ? yearMonthToMonths(currentYm)
      : yearMonthToMonths(parseYearMonth(exp.endDate));
    return [start, end];
  });

  // Sort by start, then by end descending
  intervals.sort((a, b) => a[0] - b[0] || b[1] - a[1]);

  // Merge overlapping intervals
  const merged: [number, number][] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const curr = intervals[i];
    if (curr[0] <= last[1]) {
      // Overlapping — extend if needed
      last[1] = Math.max(last[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }

  // Sum total months
  return merged.reduce((sum, [start, end]) => sum + (end - start), 0);
}

/**
 * Format career duration as a localized string.
 * ko: "X년 Y개월" or "X년" (if months is 0)
 * en: "X years and Y months" or "X years" (if months is 0)
 */
export function formatCareerDuration(totalMonths: number, lang: 'ko' | 'en'): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (lang === 'ko') {
    if (months === 0) return `${years}년`;
    return `${years}년 ${months}개월`;
  }

  // English
  const yearStr = years === 1 ? '1 year' : `${years} years`;
  if (months === 0) return yearStr;
  const monthStr = months === 1 ? '1 month' : `${months} months`;
  return `${yearStr} and ${monthStr}`;
}

/**
 * Calculate career duration and return formatted string.
 * Convenience function combining calculation and formatting.
 */
export function getCareerDuration(experiences: Experience[], lang: 'ko' | 'en'): string {
  const totalMonths = calculateTotalCareerMonths(experiences);
  return formatCareerDuration(totalMonths, lang);
}

/**
 * Replace {{CAREER_DURATION}} placeholder in summary text with actual duration.
 */
export function replaceDurationPlaceholder(
  summary: string,
  experiences: Experience[],
  lang: 'ko' | 'en',
): string {
  const duration = getCareerDuration(experiences, lang);
  return summary.replace('{{CAREER_DURATION}}', duration);
}
