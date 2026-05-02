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
const SKILL_KEYWORDS = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'express', 'nestjs', 'django', 'flask', 'laravel', 'spring',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'supabase', 'aws', 'gcp', 'azure', 'docker', 'kubernetes',
    'git', 'ci/cd', 'html', 'css', 'tailwind', 'sass', 'redux', 'graphql', 'rest api', 'agile', 'scrum', 'jira'
];

// Words to ignore when looking for a name
const NAME_IGNORE_WORDS = [
    'curriculum', 'vitae', 'resume', 'profile', 'contact', 'summary', 'experience', 'education', 
    'email', 'phone', 'address', 'git', 'version', 'control', 'page', 'skills', 'technical',
    'personal', 'work', 'projects', 'professional'
];

async function parseWithLibrary(text: string): Promise<ParsedCV> {
    // Clean up the text first
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // 1. Extract Email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = text.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : '';

    // 2. Extract Phone
    const phoneRegex = /(?:\+62|62|0)(?:\d[- ]?){8,15}/;
    const phoneMatch = text.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0].replace(/[^0-9+]/g, '') : '';

    // 3. Extract Skills
    const lowerText = text.toLowerCase();
    const skills = SKILL_KEYWORDS.filter(skill => lowerText.includes(skill));

    // 4. Extract Name (Enhanced Heuristic)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    let fullName = 'Unknown';
    
    for (const line of lines.slice(0, 15)) {
        const lowerLine = line.toLowerCase();
        
        // Skip common headers and technical words
        if (NAME_IGNORE_WORDS.some(w => lowerLine.includes(w))) continue;
        
        // Skip if too long, too short, or has numbers/special chars
        if (line.length < 3 || line.length > 40) continue;
        if (/[0-9!@#$%^&*()_+={}\[\]|\\:;"'<>,.?\/]/.test(line)) continue;
        
        // If it's 2-4 words and passes checks, it's likely the name
        const wordCount = line.split(/\s+/).length;
        if (wordCount >= 2 && wordCount <= 4) {
            fullName = line;
            break;
        }
    }

    // 5. Extract Summary/Profile
    // Look for a long block of text that isn't just a list of skills
    let summary = '';
    const longLines = lines.filter(l => l.length > 60);
    
    if (longLines.length > 0) {
        // Find the first long line that doesn't look like a technical header
        const bestLine = longLines.find(l => 
            !l.toLowerCase().includes('experience') && 
            !l.toLowerCase().includes('education') &&
            !l.includes('!!!') // Skip weird noise lines
        );
        summary = bestLine || longLines[0];
    } else {
        summary = `Professional with experience in ${skills.slice(0, 5).join(', ')}.`;
    }

    return {
        full_name: fullName,
        email,
        phone,
        skills,
        summary: summary.substring(0, 500)
    };
}

// ==========================================
// AI PARSER (OpenAI)
// ==========================================
import OpenAI from 'openai';

async function parseWithAI(text: string, apiKey: string): Promise<ParsedCV> {
    const openai = new OpenAI({ apiKey });

    const prompt = `
    Extract structured data from the following Resume Text.
    Return ONLY a JSON object:
    {
        "full_name": "string",
        "email": "string",
        "phone": "string",
        "skills": ["string"],
        "summary": "2-sentence summary"
    }

    Resume Text:
    ${text.substring(0, 5000)}
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON only." }, { role: "user", content: prompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        return JSON.parse(content || '{}') as ParsedCV;
    } catch (error) {
        console.error('AI Parse Error:', error);
        throw error;
    }
}

// ==========================================
// MAIN EXPORT
// ==========================================
// WORKAROUND for pdf-parse bug in Next.js:
// Use a more robust require or direct access if possible
// @ts-expect-error - pdf-parse types
const pdfParser = require('pdf-parse/lib/pdf-parse.js');

export async function parseCV(fileBuffer: Buffer, config: ParsingConfig): Promise<ParsedCV> {
    let rawText = '';
    try {
        // Passing an empty object as the second argument helps bypass some internal file loading
        const data = await pdfParser(fileBuffer);
        rawText = data.text || '';
    } catch (error: any) {
        console.error('[PARSER ERROR]', error);
        throw new Error(`Gagal membaca file PDF: ${error.message}`);
    }

    if (config.engine === 'ai' && config.openai_api_key) {
        try {
            return await parseWithAI(rawText, config.openai_api_key);
        } catch {
            return parseWithLibrary(rawText);
        }
    }
    
    return parseWithLibrary(rawText);
}

