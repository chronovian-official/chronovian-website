import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    env: !!process.env.RESEND_API_KEY,
    env2: !!process.env.NEXT_PUBLIC_RESEND_API_KEY
  });
}