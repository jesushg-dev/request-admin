import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID) {
  throw new Error('TWILIO_ACCOUNT_SID is required');
}

if (!process.env.TWILIO_AUTH_TOKEN) {
  throw new Error('TWILIO_AUTH_TOKEN is required');
}

if (!process.env.TWILIO_PHONE_NUMBER) {
  throw new Error('TWILIO_PHONE_NUMBER is required');
}

if (!process.env.TWILIO_WHATSAPP_NUMBER) {
  throw new Error('TWILIO_WHATSAPP_NUMBER is required');
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendSMS(to: string, message: string) {
  try {
    const result = await client.messages.create({
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
    const result = await client.messages.create({
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
