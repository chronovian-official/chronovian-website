import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // format: "2026-06"

  if (!month) {
    return NextResponse.json({ error: 'Month required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('date, time')
    .eq('status', 'confirmed');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { name, phone, email, date, time, interest, notes } = await req.json();

    if (!name || !phone || !email || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slot is already booked
    const { data: existing } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .eq('status', 'confirmed')
      .single();

    if (existing) {
      return NextResponse.json({ error: 'This slot is already booked. Please choose another time.' }, { status: 409 });
    }

    // Save booking to database
    const { error: insertError } = await supabaseAdmin
      .from('bookings')
      .insert({
        name,
        phone,
        email,
        date,
        time,
        interest,
        notes,
        status: 'confirmed',
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Send notification to enquiries@chronovian.com
    await resend.emails.send({
      from: 'Chronovian <info@chronovian.com>',
      to: 'enquiries@chronovian.com',
      subject: `New Appointment — ${date} at ${time}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #0A0A0A;">
          <div style="border-bottom: 2px solid #B8935A; padding-bottom: 24px; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 4px;">Chronovian</h1>
            <p style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #B8935A; margin: 0;">New Appointment Request</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #ADADAD; width: 140px;">Date</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 15px;">${date}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #ADADAD;">Time</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 15px;">${time}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #ADADAD;">Name</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 15px;">${name}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #ADADAD;">Phone</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 15px;">${phone}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #ADADAD;">Email</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 15px;">${email}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #ADADAD;">Interest</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 15px;">${interest}</td></tr>
            ${notes ? `<tr><td style="padding: 12px 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #ADADAD; vertical-align: top;">Notes</td>
            <td style="padding: 12px 0; font-size: 15px; line-height: 1.7;">${notes}</td></tr>` : ''}
          </table>
          <div style="margin-top: 40px; padding: 20px; background: #F5F3F0; border-left: 3px solid #B8935A;">
            <p style="margin: 0; font-size: 13px; color: #6B6B6B; line-height: 1.7;">
              Reply directly to this email to respond to ${name} at <a href="mailto:${email}" style="color: #B8935A;">${email}</a>.
            </p>
          </div>
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #F0EDE9;">
            <p style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #ADADAD; margin: 0;">© 2026 Chronovian · Hyderabad, Telangana, India</p>
          </div>
        </div>
      `,
      replyTo: email,
    });

    // Send confirmation to customer
    await resend.emails.send({
      from: 'Chronovian <info@chronovian.com>',
      to: email,
      subject: `Appointment Confirmed — ${date} at ${time}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #0A0A0A;">
          <div style="border-bottom: 2px solid #B8935A; padding-bottom: 24px; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 4px;">Chronovian</h1>
            <p style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #B8935A; margin: 0;">Appointment Confirmed</p>
          </div>
          <p style="font-size: 16px; font-weight: 400; margin: 0 0 8px;">Dear ${name},</p>
          <p style="font-size: 14px; line-height: 1.9; color: #6B6B6B; margin: 0 0 32px;">
            Your appointment has been confirmed. We look forward to welcoming you to Chronovian.
          </p>
          <div style="background: #F5F3F0; padding: 28px; margin-bottom: 32px;">
            <p style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #B8935A; margin: 0 0 20px;">Your Appointment</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E5E1; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #ADADAD; width: 120px;">Date</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E5E1; font-size: 14px; font-weight: 500;">${date}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E5E1; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #ADADAD;">Time</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E8E5E1; font-size: 14px; font-weight: 500;">${time}</td></tr>
              <tr><td style="padding: 10px 0; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #ADADAD;">Interest</td>
              <td style="padding: 10px 0; font-size: 14px;">${interest}</td></tr>
            </table>
          </div>
          <p style="font-size: 13px; color: #6B6B6B; margin: 0 0 4px;">✉️ <a href="mailto:enquiries@chronovian.com" style="color: #B8935A; text-decoration: none;">enquiries@chronovian.com</a></p>
          <p style="font-size: 13px; color: #6B6B6B; margin: 0 0 40px;">💬 <a href="https://wa.me/910000000000" style="color: #B8935A; text-decoration: none;">WhatsApp Us</a></p>
          <p style="font-size: 14px; color: #6B6B6B; margin: 0 0 4px;">Warm regards,</p>
          <p style="font-size: 14px; font-weight: 500; margin: 0 0 40px;">The Chronovian Team</p>
          <div style="padding-top: 24px; border-top: 1px solid #F0EDE9;">
            <p style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #ADADAD; margin: 0;">© 2026 Chronovian · Hyderabad, Telangana, India</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 });
  }
}
