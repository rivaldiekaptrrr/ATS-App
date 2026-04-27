import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/jobs - Get all active jobs (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status') || 'active';
        const search = searchParams.get('search') || '';
        const department = searchParams.get('department');
        const type = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase
            .from('jobs')
            .select('*', { count: 'exact' })
            .eq('status', status)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        if (department) {
            query = query.eq('department', department);
        }

        if (type) {
            query = query.eq('type', type);
        }

        const { data, count, error } = await query;

        if (error) {
            console.error('Error fetching jobs:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            jobs: data,
            total: count,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Jobs API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/jobs - Create new job (HR only)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Get HR user's company
        const { data: hrUser } = await supabase
            .from('hr_users')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (!hrUser) {
            return NextResponse.json({ error: 'HR user not found' }, { status: 404 });
        }

        const jobData = {
            ...body,
            company_id: hrUser.company_id,
            created_by: user.id,
        };

        const { data, error } = await supabase
            .from('jobs')
            .insert(jobData)
            .select()
            .single();

        if (error) {
            console.error('Error creating job:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Create job error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
