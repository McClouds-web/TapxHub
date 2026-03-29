import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialization relies on env vars mapping to standard node patterns or Vite
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = import.meta.env.VITE_RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'noreply@tapxmedia.com';

const gmailUser = import.meta.env.VITE_GMAIL_USER || process.env.GMAIL_USER;
const gmailAppPassword = import.meta.env.VITE_GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

// Nodemailer SMTP requires Node execution space (Serverless/API routes)
// Note: Running this straight from a React browser component will fail. 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
});

export const sendEmail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
  try {
    // Stage 1: Attempt Resend delivery (Zero Cost Tier - 3000/mo)
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      if (error) throw error;
      console.log('Resend delivery success:', data);
      return { success: true, provider: 'resend', data };
    } else {
        throw new Error("Resend API key missing");
    }
  } catch (error) {
    console.warn("Resend delivery failed or unconfigured, dynamically routing to Gmail SMTP fallback...", error);
    
    // Stage 2: Fallback to Gmail SMTP (Unlimited free using App Passwords)
    if(!gmailUser || !gmailAppPassword) {
        throw new Error("SMTP Fallback Failed: Gmail credentials missing.");
    }
    
    const info = await transporter.sendMail({
      from: `"TapxHub Sys" <${gmailUser}>`,
      to,
      subject,
      html,
    });
    
    console.log('Gmail SMTP delivery success:', info.messageId);
    return { success: true, provider: 'gmail', data: info };
  }
};
