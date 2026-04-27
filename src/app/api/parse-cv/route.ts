import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server'; // Secure access to settings
import { parseCV } from '@/lib/parsing';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        // 1. Get File & Job ID
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const jobId = formData.get('jobId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF files are supported for parsing' }, { status: 400 });
        }

        // 2. Get Company Settings (for Parsing Config)
        // Since Applicants are anonymous, we determine config via Job -> Company connection
        let parsingConfig: any = { engine: 'library' };

        if (jobId) {
            try {
                const serviceClient = await createServiceClient();

                // Get Company ID from Job
                const { data: job } = await serviceClient
                    .from('jobs')
                    .select('company_id')
                    .eq('id', jobId)
                    .single();

                if (job?.company_id) {
                    const { data: company } = await serviceClient
                        .from('companies')
                        .select('parsing_config')
                        .eq('id', job.company_id)
                        .single();

                    if (company?.parsing_config) {
                        parsingConfig = company.parsing_config;
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch parsing config, falling back to library default', err);
            }
        }

        // 3. Parse CV
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const parsedData = await parseCV(buffer, parsingConfig);

        return NextResponse.json({
            success: true,
            data: parsedData,
            engine_used: parsingConfig.engine
        });

    } catch (error) {
        console.error('Parse API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
