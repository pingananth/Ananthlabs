import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

// Escape user input before putting it into the email HTML
const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, email } = body;
    const f = Object.fromEntries(Object.entries(body).map(([k, v]) => [k, esc(v)]));

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let subject = '';
    let htmlContent = '';

    if (type === 'newsletter_subscribe') {
      subject = 'New Newsletter Subscriber!';
      htmlContent = `
        <h2>New Subscriber</h2>
        <p><strong>Email:</strong> ${f.email}</p>
        <p>Source: Blog Post Form</p>
      `;
    } else if (type === 'contact_inquiry') {
      subject = `New Partnership Inquiry from ${body.name || email}`;
      htmlContent = `
        <h2>New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${f.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${f.email}</p>
        <p><strong>Organization:</strong> ${f.organization || 'N/A'}</p>
        <p><strong>Intent:</strong> ${f.intent || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${f.message || 'N/A'}</p>
      `;
    } else if (type === 'training_inquiry') {
      subject = `Training Enquiry: ${body.program || 'General'} | ${body.organization || email}`;
      htmlContent = `
        <h2>New Training Enquiry</h2>
        <p><strong>Name:</strong> ${f.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${f.email}</p>
        <p><strong>Company:</strong> ${f.organization || 'N/A'}</p>
        <p><strong>Program:</strong> ${f.program || 'N/A'}</p>
        <p><strong>Team size:</strong> ${f.teamSize || 'N/A'}</p>
        <p><strong>Format:</strong> ${f.format || 'N/A'}</p>
        <p><strong>Timeline:</strong> ${f.timeline || 'N/A'}</p>
        <p><strong>Desired outcome:</strong></p>
        <p>${f.message || 'N/A'}</p>
        <p>Source: /training</p>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
    }

    // Default to onboarding@resend.dev for testing if a verified domain is not setup yet
    // The recipient should be your actual email
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.CONTACT_EMAIL || 'pingananth@gmail.com',
      replyTo: email,
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
