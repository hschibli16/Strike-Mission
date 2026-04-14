import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: 'Strike Mission <henry@strikemission.co>',
      to: email,
      subject: '⚡ Welcome to Strike Mission',
      html: `
        <div style="font-family: sans-serif; background: #0a0808; color: #f0ebe0; padding: 40px; max-width: 600px;">
          <h1 style="color: #e8823a; letter-spacing: 3px;">⚡ STRIKE MISSION</h1>
          <p style="font-size: 18px;">You're in.</p>
          <p style="color: #b0a898;">We'll alert you when conditions are firing and a strike mission is available to book. Check <a href="https://strikemission.co" style="color: #e8823a;">strikemission.co</a> for live conditions anytime.</p>
          <p style="color: #6b6560; font-size: 13px;">Go score. 🤙</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
