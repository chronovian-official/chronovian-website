import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, type, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Notify enquiries@chronovian.com
    await resend.emails.send({
      from: 'Chronovian <info@chronovian.com>',
      to: 'enquiries@chronovian.com',
      subject: `New Enquiry — ${type || 'General'} from ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #0A0A0A;">
          <div style="border-bottom: 2px solid #B8935A; padding-bottom: 24px; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 4px;">Chronovian</h1>
            <p style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #B8935A; margin: 0;">New Website Enquiry</p>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #ADADAD; width: 140px;">Name</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 15px;">${name}</td></tr>

            <tr><td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #ADADAD;">Email</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 15px;"><a href="mailto:${email}" style="color: #B8935A; text-decoration: none;">${email}</a></td></tr>

            <tr><td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #ADADAD;">Type</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #F0EDE9; font-size: 15px;">${type || 'General Enquiry'}</td></tr>

            <tr><td style="padding: 12px 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #ADADAD; vertical-align: top; padding-top: 16px;">Message</td>
            <td style="padding: 12px 0; font-size: 15px; line-height: 1.8; padding-top: 16px;">${message}</td></tr>
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

    // Auto-reply to customer
    await resend.emails.send({
      from: 'Chronovian <info@chronovian.com>',
      to: email,
      subject: `Thank you for your enquiry — Chronovian`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #0A0A0A;">
          <div style="border-bottom: 2px solid #B8935A; padding-bottom: 24px; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 4px;">Chronovian</h1>
            <p style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #B8935A; margin: 0;">We've received your enquiry</p>
          </div>

          <p style="font-size: 16px; font-weight: 400; margin: 0 0 8px;">Dear ${name},</p>
          <p style="font-size: 14px; line-height: 1.9; color: #6B6B6B; margin: 0 0 32px;">
            Thank you for getting in touch with Chronovian. We have received your ${type ? type.toLowerCase() : 'enquiry'} and will respond within 24 hours.
          </p>

          <div style="background: #F5F3F0; padding: 24px; margin-bottom: 32px; border-left: 3px solid #B8935A;">
            <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #B8935A; margin: 0 0 12px;">Your message</p>
            <p style="font-size: 14px; line-height: 1.8; color: #6B6B6B; margin: 0;">${message}</p>
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
    console.error('Contact email error:', error);
    return NextResponse.json({ error: 'Failed to send enquiry' }, { status: 500 });
  }
}
