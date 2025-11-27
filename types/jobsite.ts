
export interface JobSite {
  id: string;
  jobName: string;
  jobType: string;
  location: string;
  coordinator: string;
  contractor: string;
  dueDate: string;
  notes: string;
  stages: {
    stage1: boolean;
    stage2: boolean;
    stage3: boolean;
    stage4: boolean;
    stage5: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const STAGE_NAMES = [
  'Planning',
  'Foundation',
  'Construction',
  'Finishing',
  'Inspection'
];

export const JOB_TYPES = [
  'Residential',
  'Commercial',
  'Industrial',
  'Infrastructure',
  'Renovation'
];
