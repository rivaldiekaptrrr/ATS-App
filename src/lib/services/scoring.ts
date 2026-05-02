// ============================================
// AI RESUME SCORING SERVICE
// ============================================
// Scores a candidate's resume against job requirements
// Works in both Mock mode and Real mode

import { appConfig } from '@/lib/config';

// Common tech skills keyword list for matching
const SKILL_KEYWORDS = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'express', 'nestjs', 'django', 'flask', 'laravel', 'spring',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'supabase', 'aws', 'gcp', 'azure', 'docker', 'kubernetes',
    'git', 'ci/cd', 'html', 'css', 'tailwind', 'sass', 'redux', 'graphql', 'rest api', 'agile', 'scrum', 'jira',
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    'node.js', 'linux', 'bash', 'terraform', 'ansible', 'nginx',
];

// Soft skills for bonus scoring
const SOFT_SKILL_KEYWORDS = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
    'project management', 'time management', 'adaptability', 'creativity', 'collaboration',
];

export interface ScoreResult {
    score: number;                // 0–100
    matched_skills: string[];     // Skills in CV that match job requirements
    missing_skills: string[];     // Required skills not found in CV
    summary: string;              // Human-readable explanation
    recommendation: 'strong' | 'moderate' | 'weak'; // Overall recommendation
}

// ============================================
// CORE SCORING ALGORITHM (Keyword Matching)
// ============================================
export function scoreResumeByKeywords(
    candidateSkills: string[],
    jobRequirements: string
): ScoreResult {
    const lowerRequirements = jobRequirements.toLowerCase();
    const lowerCandidateSkills = candidateSkills.map(s => s.toLowerCase());

    // Extract skills mentioned in the job requirements
    const requiredSkills = SKILL_KEYWORDS.filter(skill =>
        lowerRequirements.includes(skill)
    );

    // Also extract soft skills from requirements
    const requiredSoftSkills = SOFT_SKILL_KEYWORDS.filter(skill =>
        lowerRequirements.includes(skill)
    );

    const allRequired = [...requiredSkills, ...requiredSoftSkills];

    if (allRequired.length === 0) {
        // No specific skills found in JD — give a base score
        return {
            score: 65,
            matched_skills: lowerCandidateSkills,
            missing_skills: [],
            summary: 'Tidak ada skill spesifik yang terdeteksi dari deskripsi pekerjaan.',
            recommendation: 'moderate',
        };
    }

    // Match candidate skills against required skills
    const matched_skills = allRequired.filter(skill =>
        lowerCandidateSkills.some(cs => cs.includes(skill) || skill.includes(cs))
    );

    const missing_skills = allRequired.filter(skill =>
        !lowerCandidateSkills.some(cs => cs.includes(skill) || skill.includes(cs))
    );

    // Calculate base score from match percentage
    const matchPercentage = (matched_skills.length / allRequired.length) * 100;

    // Bonus points for extra skills (not in JD but still valuable)
    const extraSkills = lowerCandidateSkills.filter(cs =>
        SKILL_KEYWORDS.includes(cs) && !allRequired.includes(cs)
    );
    const bonusPoints = Math.min(extraSkills.length * 2, 10); // Max 10 bonus points

    const rawScore = Math.round(matchPercentage + bonusPoints);
    const score = Math.min(100, Math.max(0, rawScore));

    // Determine recommendation
    let recommendation: 'strong' | 'moderate' | 'weak';
    if (score >= 75) recommendation = 'strong';
    else if (score >= 50) recommendation = 'moderate';
    else recommendation = 'weak';

    // Generate human-readable summary
    const summary = `Kandidat memiliki ${matched_skills.length} dari ${allRequired.length} skill yang dibutuhkan (${Math.round(matchPercentage)}% match). ${
        missing_skills.length > 0
            ? `Skill yang belum dimiliki: ${missing_skills.slice(0, 3).join(', ')}${missing_skills.length > 3 ? `, +${missing_skills.length - 3} lainnya` : ''}.`
            : 'Semua skill utama terpenuhi!'
    }`;

    return {
        score,
        matched_skills,
        missing_skills,
        summary,
        recommendation,
    };
}

// ============================================
// SCORE CANDIDATE (with mock support)
// ============================================
export async function scoreCandidate(
    candidateId: string,
    candidateSkills: string[],
    jobRequirements: string
): Promise<ScoreResult> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Scoring candidate:', candidateId);
        // Simulate a small delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return scoreResumeByKeywords(candidateSkills, jobRequirements);
    }

    // Real mode: same algorithm (OpenAI scoring would be here as enhancement)
    return scoreResumeByKeywords(candidateSkills, jobRequirements);
}

// ============================================
// BATCH SCORE MULTIPLE CANDIDATES
// ============================================
export async function batchScoreCandidates(
    candidates: Array<{ id: string; skills: string[] }>,
    jobRequirements: string
): Promise<Record<string, ScoreResult>> {
    const results: Record<string, ScoreResult> = {};

    for (const candidate of candidates) {
        results[candidate.id] = await scoreCandidate(
            candidate.id,
            candidate.skills,
            jobRequirements
        );
    }

    return results;
}

// ============================================
// QUICK SCORE (without async, for display)
// ============================================
export function quickScore(skills: string[], jobRequirements: string): number {
    return scoreResumeByKeywords(skills, jobRequirements).score;
}

export const SCORE_CONFIG = {
    strong: { min: 75, label: 'Strong Match', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    moderate: { min: 50, label: 'Moderate Match', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    weak: { min: 0, label: 'Weak Match', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

export function getScoreConfig(score: number) {
    if (score >= 75) return SCORE_CONFIG.strong;
    if (score >= 50) return SCORE_CONFIG.moderate;
    return SCORE_CONFIG.weak;
}
