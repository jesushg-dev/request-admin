import { env } from '@/env';
import twilio from 'twilio';

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
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient) {
      console.warn('SMS sending is disabled (ENABLE_EXTERNAL_SMS=false or missing Twilio credentials).');
      return null;
    }

    const result = await twilioClient.messages.create({
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
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient) {
      console.warn('WhatsApp sending is disabled (ENABLE_EXTERNAL_SMS=false or missing Twilio credentials).');
      return null;
    }

    const result = await twilioClient.messages.create({
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
