import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { type, email, name, organization, intent, message } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let subject = '';
    let htmlContent = '';

    if (type === 'newsletter_subscribe') {
      subject = 'New Newsletter Subscriber!';
      htmlContent = `
        <h2>New Subscriber</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p>Source: Blog Post Form</p>
      `;
    } else if (type === 'contact_inquiry') {
      subject = `New Partnership Inquiry from ${name || email}`;
      htmlContent = `
        <h2>New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${name || 'N/A'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Organization:</strong> ${organization || 'N/A'}</p>
        <p><strong>Intent:</strong> ${intent || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message || 'N/A'}</p>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
    }

    // Default to onboarding@resend.dev for testing if a verified domain is not setup yet
    // The recipient should be your actual email
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.CONTACT_EMAIL || 'pingananth@gmail.com',
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
