import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

function baseTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; color: #333; line-height: 1.6; }
    .app-number { display: inline-block; background: #eef4ff; border: 1px solid #c3d9ff; border-radius: 6px; padding: 10px 20px; font-size: 20px; font-weight: bold; color: #1e3a5f; letter-spacing: 2px; margin: 16px 0; }
    .btn { display: inline-block; background: #2d6a9f; color: #fff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px; }
    .status-approved { color: #16a34a; font-weight: bold; }
    .status-rejected { color: #dc2626; font-weight: bold; }
    .footer { background: #f9f9f9; padding: 16px 32px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ Birth Certificate Portal</h1>
      <p>Government of India — Civil Registration System</p>
    </div>
    <div class="body">
      <h2>${title}</h2>
      ${body}
    </div>
    <div class="footer">
      This is an automated email. Please do not reply. | Birth Certificate Registration System
    </div>
  </div>
</body>
</html>`;
}

export async function sendSubmissionEmail(to: string, appNumber: string, childName?: string): Promise<void> {
  const name = childName ? `for <strong>${childName}</strong>` : '';
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Application Submitted — ${appNumber}`,
    html: baseTemplate(
      'Application Submitted Successfully',
      `<p>Dear Parent,</p>
       <p>Your birth certificate application ${name} has been submitted successfully.</p>
       <p>Your Application Number is:</p>
       <div><span class="app-number">${appNumber}</span></div>
       <p>Please save this number to track your application status.</p>
       <a href="${BASE_URL}/track?app=${appNumber}" class="btn">Track Your Application</a>
       <p style="margin-top:24px;font-size:13px;color:#666;">Your application is currently under review by our team. You will receive email updates as it progresses.</p>`
    ),
  });
}

export async function sendVerifierApprovedEmail(to: string, appNumber: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Application Verified — ${appNumber}`,
    html: baseTemplate(
      'Application Verified ✓',
      `<p>Dear Parent,</p>
       <p>Your birth certificate application <strong>${appNumber}</strong> has been <span class="status-approved">verified</span> by our verification team.</p>
       <p>It has now been forwarded to the Registration Operator for final approval.</p>
       <a href="${BASE_URL}/track?app=${appNumber}" class="btn">Track Your Application</a>
       <p style="margin-top:24px;font-size:13px;color:#666;">You will receive another notification once the final approval is processed.</p>`
    ),
  });
}

export async function sendApprovedEmail(to: string, appNumber: string, childName?: string): Promise<void> {
  const name = childName ? `for <strong>${childName}</strong>` : '';
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `🎉 Birth Certificate Approved — ${appNumber}`,
    html: baseTemplate(
      '🎉 Application Approved!',
      `<p>Dear Parent,</p>
       <p>Congratulations! Your birth certificate application ${name} with number <strong>${appNumber}</strong> has been <span class="status-approved">approved</span> by the Registration Operator.</p>
       <p>Your birth certificate will be processed and issued shortly. Please visit your local registration office to collect the physical certificate with this application number.</p>
       <a href="${BASE_URL}/track?app=${appNumber}" class="btn">View Application</a>`
    ),
  });
}

export async function sendRejectedEmail(to: string, appNumber: string, reason: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Application Rejected — ${appNumber}`,
    html: baseTemplate(
      'Application Rejected',
      `<p>Dear Parent,</p>
       <p>We regret to inform you that your birth certificate application <strong>${appNumber}</strong> has been <span class="status-rejected">rejected</span>.</p>
       <p><strong>Reason:</strong></p>
       <blockquote style="border-left:4px solid #dc2626;margin:12px 0;padding:12px 16px;background:#fff5f5;color:#333;">${reason}</blockquote>
       <p>You may submit a new application with the required corrections.</p>
       <a href="${BASE_URL}/apply" class="btn">Submit New Application</a>`
    ),
  });
}
