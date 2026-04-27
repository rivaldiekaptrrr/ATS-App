-- ============================================
-- DEVELOPMENT RLS POLICIES
-- ============================================
-- Run this AFTER the main schema.sql
-- This adds permissive policies for development/testing
-- ⚠️ REMOVE THESE IN PRODUCTION!
-- ============================================
-- Allow public to read all companies (for getting company_id)
DROP POLICY IF EXISTS "Public can view companies" ON companies;
CREATE POLICY "Public can view companies" ON companies FOR
SELECT USING (true);
-- Allow anyone to insert jobs (for development)
DROP POLICY IF EXISTS "Anyone can insert jobs" ON jobs;
CREATE POLICY "Anyone can insert jobs" ON jobs FOR
INSERT WITH CHECK (true);
-- Allow anyone to update jobs (for development)
DROP POLICY IF EXISTS "Anyone can update jobs" ON jobs;
CREATE POLICY "Anyone can update jobs" ON jobs FOR
UPDATE USING (true);
-- Allow anyone to read all jobs (for HR dashboard)
DROP POLICY IF EXISTS "Anyone can view all jobs" ON jobs;
CREATE POLICY "Anyone can view all jobs" ON jobs FOR
SELECT USING (true);
-- Allow anyone to delete jobs (for development)
DROP POLICY IF EXISTS "Anyone can delete jobs" ON jobs;
CREATE POLICY "Anyone can delete jobs" ON jobs FOR DELETE USING (true);
-- ============================================
-- VERIFY: Check if company exists
-- ============================================
-- Run this query to check if default company was created:
-- SELECT * FROM companies;
-- If no company exists, run:
-- INSERT INTO companies (name, slug, primary_color) 
-- VALUES ('SmartRecruit Demo', 'smartrecruit', '#3B82F6');
-- ============================================
-- APPLICANTS & APPLICATIONS POLICIES
-- ============================================
-- Allow anyone to insert applicants (for job applications)
DROP POLICY IF EXISTS "Anyone can insert applicants" ON applicants;
CREATE POLICY "Anyone can insert applicants" ON applicants FOR
INSERT WITH CHECK (true);
-- Allow anyone to view applicants (for development)
DROP POLICY IF EXISTS "Anyone can view applicants dev" ON applicants;
CREATE POLICY "Anyone can view applicants dev" ON applicants FOR
SELECT USING (true);
-- Allow anyone to insert applications
DROP POLICY IF EXISTS "Anyone can insert applications" ON applications;
CREATE POLICY "Anyone can insert applications" ON applications FOR
INSERT WITH CHECK (true);
-- Allow anyone to view applications (for development)  
DROP POLICY IF EXISTS "Anyone can view applications dev" ON applications;
CREATE POLICY "Anyone can view applications dev" ON applications FOR
SELECT USING (true);
-- Allow anyone to update applications (for development)
DROP POLICY IF EXISTS "Anyone can update applications dev" ON applications;
CREATE POLICY "Anyone can update applications dev" ON applications FOR
UPDATE USING (true);