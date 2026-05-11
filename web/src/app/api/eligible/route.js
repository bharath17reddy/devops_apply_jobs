import { getEligibleJobs } from '@/lib/data-fetcher';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const jobs = await getEligibleJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
