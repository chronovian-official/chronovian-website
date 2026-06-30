import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// List of currencies we support in the dropdown
const SUPPORTED = ['USD','EUR','GBP','AED','SGD','AUD','CAD','CHF','JPY','HKD','CNY','SAR','QAR','KWD','MYR','THB','ZAR','NZD','OMR'];

export async function GET(req: Request) {
  // Simple protection: only allow with correct secret (for cron trigger)
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Frankfurter — base INR, no API key required
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=INR&symbols=${SUPPORTED.join(',')}`);
    const data = await res.json();

    if (!data.rates) {
      return NextResponse.json({ error: 'No rates returned from provider' }, { status: 502 });
    }

    const rates = { INR: 1, ...data.rates };

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from('exchange_rates')
      .upsert({ id: 1, base_currency: 'INR', rates, updated_at: new Date().toISOString() });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rates, updated_at: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch rates' }, { status: 500 });
  }
}
