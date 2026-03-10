import { env } from '@/env';
import { Resend } from 'resend';

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';
const emailDomain = process.env.RESEND_EMAIL_DOMAIN || 'resend.dev';

const resend = env.ENABLE_EXTERNAL_EMAIL && env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

async function safeSendEmail(args: Parameters<Resend['emails']['send']>[0]) {
  if (!env.ENABLE_EXTERNAL_EMAIL || !resend) {
    console.warn('Email sending is disabled (ENABLE_EXTERNAL_EMAIL=false); skipping send.', { to: args.to, subject: args.subject });
    return;
  }

  await resend.emails.send(args);
}

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await safeSendEmail({
    from: `support@${emailDomain}`,
    to: email,
    subject: '2FA Code',
    html: `<p>Your 2FA code: ${token}</p>`,
  });
};

export const sendResetPassword = async ({ user, url, token }: { user: { email: string }; url: string; token: string }) => {
  await safeSendEmail({
    from: `support@${emailDomain}`,
    to: user.email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${url}">here</a> to reset password. ${token}</p>`,
  });
};

export const sendVerificationEmail = async ({ user, url, token }: { user: { email: string }; url: string; token: string }) => {
  await safeSendEmail({
    from: `support@${emailDomain}`,
    to: user.email,
    subject: 'Confirm your email',
    html: `<p>Click <a href="${url}">here</a> to confirm email. ${token}</p>`,
  });
};

export const sendChangeEmailVerification = async ({ user, newEmail, url, token }: { user: { email: string }; newEmail: string; url: string; token: string }) => {
  await safeSendEmail({
    from: `support@${emailDomain}`,
    to: user.email,
    subject: 'Approve email change',
    html: `<p>Click <a href="${url}">here</a> to approve email change ${newEmail}. ${token}</p>`,
  });
};

export const sendInvitationEmail = async (data: { id: string; role: string; email: string; organizationName: string; invitedByName: string; invitedByEmail: string }) => {
  const acceptUrl = `${domain}/admin/global/tenants/accept-invitation?id=${data.id}`;
  await safeSendEmail({
    from: `Team ${data.organizationName} <invitations@${emailDomain}>`,
    to: data.email,
    subject: `${data.invitedByName} te invita a unirte a ${data.organizationName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background-color: #f3f4f6; padding: 24px; text-align: center; }
    .content { padding: 32px; line-height: 1.6; color: #374151; }
    .button { 
      display: inline-block; 
      background-color: #2563eb; 
      color: white !important; 
      padding: 12px 24px; 
      border-radius: 6px; 
      text-decoration: none; 
      font-weight: bold; 
      margin: 20px 0; 
    }
    .footer { 
      padding: 24px; 
      text-align: center; 
      color: #6b7280; 
      font-size: 0.9rem; 
      border-top: 1px solid #e5e7eb;
    }
    .steps { 
      background-color: #f9fafb; 
      padding: 16px; 
      border-radius: 8px; 
      margin: 24px 0; 
    }
    .step { margin-bottom: 12px; display: flex; }
    .step-number { 
      background-color: #2563eb; 
      color: white; 
      width: 24px; 
      height: 24px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      margin-right: 12px; 
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #111827;">¡Te damos la bienvenida a ${data.organizationName}!</h1>
    </div>
    
    <div class="content">
      <p>Hola,</p>
      
      <p><strong>${data.invitedByName}</strong> (${data.invitedByEmail}) te ha invitado a unirte a <strong>${data.organizationName}</strong> como <strong>${data.role}</strong>.</p>
      
      <div class="steps">
        <h3 style="margin-top: 0;">Para unirte sigue estos pasos:</h3>
        
        <div class="step">
          <div class="step-number">1</div>
          <div>Haz clic en el botón para aceptar la invitación:</div>
        </div>
        
        <a href="${acceptUrl}" class="button">Aceptar invitación</a>
        
        <div class="step">
          <div class="step-number">2</div>
          <div>Inicia sesión con tu cuenta existente o crea una nueva</div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div>¡Listo! Accederás a ${data.organizationName}</div>
        </div>
      </div>
      
      <p><strong>¿Problemas con el botón?</strong><br>
      Copia y pega esta URL en tu navegador:<br>
      <a href="${acceptUrl}">${acceptUrl}</a></p>
      
      <p><strong>¿No solicitaste esta invitación?</strong><br>
      Ignora este correo o <a href="mailto:support@${emailDomain}">notifícanos</a> si crees que fue un error.</p>
    </div>
    
    <div class="footer">
      <p>Este es un correo automático - Por favor no respondas directamente</p>
      <p>© ${new Date().getFullYear()} ${data.organizationName}. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `,
  });
};

export const sendVerificationOTP = async (email: string, otp: string, type: 'sign-in' | 'email-verification' | 'forget-password' | 'two-factor') => {
  await safeSendEmail({
    from: `support@${emailDomain}`,
    to: email,
    subject: 'OTP Code',
    html: `<p>Your OTP code: ${otp} for ${type}</p>`,
  });
};

export const sendMagicLink = async (email: string, token: string, url: string) => {
  await safeSendEmail({
    from: `support@${emailDomain}`,
    to: email,
    subject: 'Magic Link',
    html: `<p>Click <a href="${url}?token=${token}">here</a> to sign in.</p>`,
  });
};

export const sendNotificationEmail = async (email: string[] | string, subject: string, message: string) => {
  await safeSendEmail({
    from: `support@${emailDomain}`,
    to: email,
    subject,
    html: message,
  });
};
