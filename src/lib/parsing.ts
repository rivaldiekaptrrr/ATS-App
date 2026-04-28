// ==========================================

// ==========================================
// TYPES
// ==========================================
export interface ParsingConfig {
    engine: 'library' | 'ai';
    openai_api_key?: string; // Optional, encrypted or stored securely in real app
    auto_reject_score?: number; // Future feature
}

export type ParsedCV = {
    full_name: string;
    email: string;
    phone: string;
    skills: string[];
    summary: string;
    raw_text?: string;
};

// ==========================================
// LIBRARY PARSER (Regex & Logic)
// ==========================================
// A comprehensive list of tech skills to match against
const SKILL_KEYWORDS = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'express', 'nestjs', 'django', 'flask', 'laravel', 'spring',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'supabase', 'aws', 'gcp', 'azure', 'docker', 'kubernetes',
    'git', 'ci/cd', 'html', 'css', 'tailwind', 'sass', 'redux', 'graphql', 'rest api', 'agile', 'scrum', 'jira'
];

async function parseWithLibrary(text: string): Promise<ParsedCV> {
    // 1. Extract Email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = text.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : '';

    // 2. Extract Phone (Indonesian & International formats)
    // Matches: +62 812..., 0812..., (021) ...
    const phoneRegex = /(?:\+62|62|0)(?:\d[- ]?){8,15}/;
    const phoneMatch = text.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0].replace(/[^0-9+]/g, '') : '';

    // 3. Extract Skills (Keyword Matching)
    const lowerText = text.toLowerCase();
    const skills = SKILL_KEYWORDS.filter(skill => lowerText.includes(skill));

    // 4. Extract Name (Heuristic)
    // Strategy: Look for the first line that looks like a name (2-4 words, no numbers/symbols)
    // Exclude common header words like "Curriculum Vitae", "Resume", "Profile"
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const ignoreWords = ['curriculum', 'vitae', 'resume', 'profile', 'contact', 'summary', 'experience', 'education', 'email', 'phone', 'address'];

    let fullName = 'Unknown';
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        // Skip if contains ignore words
        if (ignoreWords.some(w => lowerLine.includes(w))) continue;

        // Skip if is email or phone
        if (emailRegex.test(line) || phoneRegex.test(line)) continue;

        // Skip if too long or too short
        if (line.length < 3 || line.length > 50) continue;

        // Valid name pattern: Letters and spaces only, 2-5 words
        if (/^[a-zA-Z\s.,'-]+$/.test(line) && line.split(' ').length >= 2) {
            fullName = line;
            break;
        }
    }

    // 5. Generate Summary
    // Grab the first paragraph that isn't the header
    const summary = lines.find(l => l.length > 50 && !l.toLowerCase().includes('experience')) || `${skills.length} detected skills. auto-parsed.`;

    return {
        full_name: fullName,
        email,
        phone,
        skills,
        summary: summary.substring(0, 500) // Limit length
    };
}

// ==========================================
// AI PARSER (OpenAI)
// ==========================================
import OpenAI from 'openai';

async function parseWithAI(text: string, apiKey: string): Promise<ParsedCV> {
    const openai = new OpenAI({ apiKey });

    const prompt = `
    You are an expert Resume Parser. Your job is to extract structured data from the following Resume Text.
    
    Return ONLY a JSON object with this structure:
    {
        "full_name": "string",
        "email": "string",
        "phone": "string",
        "skills": ["string", "string"],
        "summary": "string (a professional 2-sentence summary of the candidate)"
    }

    Resume Text:
    ${text.substring(0, 4000)} // Limit context window
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON only." }, { role: "user", content: prompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error('No content from AI');

        return JSON.parse(content) as ParsedCV;
    } catch (error) {
        console.error('AI Parse Error:', error);
        throw new Error('AI Parsing failed. Check API Key or Quota.');
    }
}

// ==========================================
// MAIN EXPORT
// ==========================================
// @ts-expect-error - pdf-parse is a CommonJS module
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');

export async function parseCV(fileBuffer: Buffer, config: ParsingConfig): Promise<ParsedCV> {
    // 1. Extract Text from PDF
    let rawText = '';
    try {
        console.log('[DEBUG] Parsing PDF Buffer of size:', fileBuffer.length);
        const data = await pdf(fileBuffer);
        console.log('[DEBUG] PDF Extract Success. Text Length:', data.text?.length);
        rawText = data.text;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('[DEBUG] PDF Parse Error:', error);
        // Check if error is related to missing canvas (in case old lib is still cached)
        if (error.message?.includes('Canvas') || error.message?.includes('DOMMatrix')) {
            throw new Error('Server library conflict. Please restart server completely.');
        }
        throw new Error(`Failed to read PDF file: ${error.message}`);
    }

    // 2. Select Engine
    if (config.engine === 'ai' && config.openai_api_key) {
        try {
            return await parseWithAI(rawText, config.openai_api_key);
        } catch (error) {
            console.warn('AI Parsing failed, falling back to Library:', error);
            // Fallback to library if AI fails
            return parseWithLibrary(rawText);
        }
    } else {
        // Library Mode (Default)
        return parseWithLibrary(rawText);
    }
}
