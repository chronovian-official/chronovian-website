import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !service) {
    return NextResponse.json({ error: 'Missing env vars', url: !!url, anon: !!anon, service: !!service });
  }

  const sb = createClient(url, service);
  const { data, error } = await sb.from('bookings').select('count');

  return NextResponse.json({
    url: url.slice(0, 30) + '...',
    anon: !!anon,
    service: !!service,
    data,
    error: error?.message
  });
}
