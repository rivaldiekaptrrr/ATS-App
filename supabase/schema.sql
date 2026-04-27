-- SmartRecruit ATS Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- COMPANIES (Single-tenant for MVP)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  domain VARCHAR(255),
  parsing_config JSONB DEFAULT '{"engine": "library"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HR USERS
CREATE TABLE IF NOT EXISTS hr_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'hr', -- 'admin', 'hr', 'viewer'
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOBS
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  location VARCHAR(255),
  type VARCHAR(50), -- 'full-time', 'part-time', 'contract', 'internship'
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT,
  requirements TEXT,
  benefits TEXT,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'closed'
  created_by UUID REFERENCES hr_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- APPLICANTS
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  bio TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  cv_url TEXT,
  cv_filename VARCHAR(255),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPLICATIONS (Junction table)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id VARCHAR(20) UNIQUE NOT NULL, -- Format: APP-XXXXXX
  applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'applied', 
  -- Stages: 'applied', 'screening', 'interview_1', 'interview_2', 'interview_3', 'test', 'offering', 'hired', 'rejected'
  stage_order INTEGER DEFAULT 0,
  hr_notes TEXT,
  score INTEGER, -- 0-100
  interview_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(applicant_id, job_id)
);

-- WORK EXPERIENCE
CREATE TABLE IF NOT EXISTS work_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EDUCATION
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(100),
  field_of_study VARCHAR(255),
  start_year INTEGER,
  end_year INTEGER,
  gpa DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKILLS
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'expert'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMAIL TEMPLATES
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  trigger_status VARCHAR(50) NOT NULL, -- 'applied', 'screening_pass', 'screening_reject', etc.
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  hr_user_id UUID REFERENCES hr_users(id),
  action VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMAIL LOGS
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_tracking ON applications(tracking_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_application ON activity_logs(application_id);

-- FUNCTION: Generate tracking ID
CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'APP-';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: Auto-generate tracking ID on insert
CREATE OR REPLACE FUNCTION set_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_tracking_id ON applications;
CREATE TRIGGER trigger_set_tracking_id
  BEFORE INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION set_tracking_id();

-- TRIGGER: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_applications_updated_at ON applications;
CREATE TRIGGER trigger_update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_jobs_updated_at ON jobs;
CREATE TRIGGER trigger_update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- Jobs: Public can read active jobs
CREATE POLICY "Public can view active jobs" ON jobs
  FOR SELECT USING (status = 'active');

-- HR can manage their company's jobs
CREATE POLICY "HR can manage company jobs" ON jobs
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM hr_users WHERE id = auth.uid()
    )
  );

-- Applications: Allow public insert
CREATE POLICY "Anyone can apply" ON applications
  FOR INSERT WITH CHECK (true);

-- HR can view their company's applications
CREATE POLICY "HR can view company applications" ON applications
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM hr_users WHERE id = auth.uid()
    )
  );

-- HR can update their company's applications
CREATE POLICY "HR can update company applications" ON applications
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM hr_users WHERE id = auth.uid()
    )
  );

-- Applicants: Allow public insert
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create applicant" ON applicants
  FOR INSERT WITH CHECK (true);

-- HR can view applicants
CREATE POLICY "HR can view applicants" ON applicants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM hr_users WHERE id = auth.uid())
  );

-- Insert default company for MVP
INSERT INTO companies (name, slug, primary_color) 
VALUES ('SmartRecruit Demo', 'smartrecruit', '#3B82F6')
ON CONFLICT (slug) DO NOTHING;
