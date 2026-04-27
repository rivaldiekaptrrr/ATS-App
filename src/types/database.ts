// Database types for SmartRecruit ATS

export type ApplicationStatus = 
  | 'applied'
  | 'screening'
  | 'interview_1'
  | 'interview_2'
  | 'interview_3'
  | 'test'
  | 'offering'
  | 'hired'
  | 'rejected';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobStatus = 'draft' | 'active' | 'closed';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  domain: string | null;
  created_at: string;
  updated_at: string;
}

export interface HRUser {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'hr' | 'viewer';
  avatar_url: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  department: string | null;
  location: string | null;
  type: JobType | null;
  salary_min: number | null;
  salary_max: number | null;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  status: JobStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface Applicant {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  bio: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  cv_url: string | null;
  cv_filename: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Application {
  id: string;
  tracking_id: string;
  applicant_id: string;
  job_id: string;
  company_id: string;
  status: ApplicationStatus;
  stage_order: number;
  hr_notes: string | null;
  score: number | null;
  interview_date: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  applicant?: Applicant;
  job?: Job;
}

export interface WorkExperience {
  id: string;
  applicant_id: string;
  company_name: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  created_at: string;
}

export interface Education {
  id: string;
  applicant_id: string;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
  gpa: number | null;
  created_at: string;
}

export interface Skill {
  id: string;
  applicant_id: string;
  name: string;
  level: SkillLevel | null;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  company_id: string;
  trigger_status: string;
  subject: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  company_id: string;
  application_id: string;
  hr_user_id: string | null;
  action: string;
  old_value: string | null;
  new_value: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  // Relations
  hr_user?: HRUser;
}

export interface EmailLog {
  id: string;
  application_id: string;
  template_id: string | null;
  recipient_email: string;
  subject: string | null;
  body: string | null;
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

// Extended types with relations
export interface ApplicationWithDetails extends Application {
  applicant: Applicant;
  job: Job;
}

export interface ApplicantWithDetails extends Applicant {
  work_experiences?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
}
