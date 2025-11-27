
import { JobSite } from '@/types/jobsite';

export function calculateProgress(stages: JobSite['stages']): number {
  const completed = Object.values(stages).filter(Boolean).length;
  return (completed / 5) * 100;
}

export function getProgressColor(progress: number): string {
  if (progress === 100) return '#34C759'; // Green
  if (progress >= 60) return '#FF9500'; // Orange
  if (progress >= 20) return '#007AFF'; // Blue
  return '#8E8E93'; // Gray
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

export function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getDueDateStatus(dueDate: string): 'overdue' | 'urgent' | 'upcoming' | 'future' {
  const days = getDaysUntilDue(dueDate);
  if (days < 0) return 'overdue';
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'upcoming';
  return 'future';
}

export function searchJobSites(jobSites: JobSite[], query: string): JobSite[] {
  if (!query.trim()) return jobSites;
  
  const lowerQuery = query.toLowerCase();
  return jobSites.filter(job => 
    job.jobName.toLowerCase().includes(lowerQuery) ||
    job.jobType.toLowerCase().includes(lowerQuery) ||
    job.location.toLowerCase().includes(lowerQuery) ||
    job.coordinator.toLowerCase().includes(lowerQuery) ||
    job.contractor.toLowerCase().includes(lowerQuery)
  );
}

export function sortJobSitesByDueDate(jobSites: JobSite[]): JobSite[] {
  return [...jobSites].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export function sortJobSitesByProgress(jobSites: JobSite[]): JobSite[] {
  return [...jobSites].sort((a, b) => {
    return calculateProgress(b.stages) - calculateProgress(a.stages);
  });
}
