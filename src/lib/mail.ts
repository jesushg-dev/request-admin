import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const emailDomain = process.env.RESEND_EMAIL_DOMAIN || 'resend.dev';

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: `support@${emailDomain}`,
    to: email,
    subject: '2FA Code',
    html: `<p>Your 2FA code: ${token}</p>`,
  });
};

export const sendResetPassword = async ({ user, url, token }: { user: { email: string }; url: string; token: string }) => {
  await resend.emails.send({
    from: `support@${emailDomain}`,
    to: user.email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${url}">here</a> to reset password. ${token}</p>`,
  });
};

export const sendVerificationEmail = async ({ user, url, token }: { user: { email: string }; url: string; token: string }) => {
  await resend.emails.send({
    from: `support@${emailDomain}`,
    to: user.email,
    subject: 'Confirm your email',
    html: `<p>Click <a href="${url}">here</a> to confirm email. ${token}</p>`,
  });
};

export const sendChangeEmailVerification = async ({ user, newEmail, url, token }: { user: { email: string }; newEmail: string; url: string; token: string }) => {
  await resend.emails.send({
    from: `support@${emailDomain}`,
    to: user.email,
    subject: 'Approve email change',
    html: `<p>Click <a href="${url}">here</a> to approve email change ${newEmail}. ${token}</p>`,
  });
};

export const sendInvitationEmail = async (data: { id: string; role: string; email: string }) => {
  const url = `${domain}/auth/accept-invitation?id=${data.id}`;
  await resend.emails.send({
    from: `support@${emailDomain}`,
    to: data.email,
    subject: 'Invitation to join organization',
    html: `<p>Click <a href="${url}">here</a> to join organization.</p>`,
  });
};

export const sendVerificationOTP = async (email: string, otp: string, type: 'sign-in' | 'email-verification' | 'forget-password' | 'two-factor') => {
  await resend.emails.send({
    from: `support@${emailDomain}`,
    to: email,
    subject: 'OTP Code',
    html: `<p>Your OTP code: ${otp} for ${type}</p>`,
  });
};

export const sendMagicLink = async (email: string, token: string, url: string) => {
  await resend.emails.send({
    from: `support@${emailDomain}`,
    to: email,
    subject: 'Magic Link',
    html: `<p>Click <a href="${url}?token=${token}">here</a> to sign in.</p>`,
  });
};

export const sendNotificationEmail = async (email: string[], subject: string, message: string) => {
  await resend.emails.send({
    from: `support@${emailDomain}`,
    to: email,
    subject,
    html: `<p>${message}</p>`,
  });
};
