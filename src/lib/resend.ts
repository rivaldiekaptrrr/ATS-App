import { Resend } from 'resend';

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender - will need to be verified in Resend dashboard
export const DEFAULT_FROM_EMAIL = 'SmartRecruit <noreply@resend.dev>';

interface SendEmailParams {
    to: string;
    subject: string;
    body: string;
    replyTo?: string;
}

export async function sendEmail({ to, subject, body, replyTo }: SendEmailParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            subject: subject,
            html: formatEmailHtml(subject, body),
            replyTo: replyTo,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, id: data?.id };
    } catch (error) {
        console.error('Send email error:', error);
        return { success: false, error: 'Failed to send email' };
    }
}

function formatEmailHtml(subject: string, body: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #334155;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }
        .logo {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .logo-text {
          font-size: 20px;
          font-weight: bold;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .content {
          white-space: pre-line;
        }
        .footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 16px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">SmartRecruit</div>
        </div>
        <div class="content">
          ${body.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
          <p>Email ini dikirim secara otomatis oleh SmartRecruit ATS.</p>
          <p>© 2026 SmartRecruit. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
