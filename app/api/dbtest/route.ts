import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing env vars', url: !!url, key: !!key });
  }

  const sb = createClient(url, key);
  const { data, error } = await sb.from('products').select('count');

  return NextResponse.json({
    url: url.slice(0, 30) + '...',
    key: key.slice(0, 20) + '...',
    data,
    error: error?.message
  });
}
