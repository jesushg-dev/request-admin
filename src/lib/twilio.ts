import twilio from 'twilio';

import { env } from '@/env';

let client: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!env.ENABLE_EXTERNAL_SMS) {
    return null;
  }

  if (!client) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn('Twilio environment variables are missing; SMS/WhatsApp sending is disabled.');
      return null;
    }

    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  return client;
}

export async function sendSMS(to: string, message: string) {
  const smsClient = getTwilioClient();
  if (!smsClient) {
    console.warn('sendSMS called but SMS sending is disabled by configuration.', { to });
    return;
  }

  try {
    const result = await smsClient.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
}

export async function sendWhatsApp(to: string, message: string) {
  const smsClient = getTwilioClient();
  if (!smsClient) {
    console.warn('sendWhatsApp called but WhatsApp sending is disabled by configuration.', { to });
    return;
  }

  try {
    const result = await smsClient.messages.create({
      body: message,
      to: `whatsapp:${to}`,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
    });
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw new Error('Failed to send WhatsApp message');
  }
}

