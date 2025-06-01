import { NextResponse } from 'next/server';
import * as Ably from 'ably';

import type { NewNotificationType, NotificationBody } from '@/types/notification';

// Helper to extract all string values from a nested object
function extractStrings(obj: unknown): string[] {
  if (typeof obj === 'string') return [obj];
  if (typeof obj !== 'object' || obj === null) return [];
  return Object.values(obj as Record<string, unknown>).flatMap(extractStrings);
}

export async function POST(req: Request) {
  try {
    if (!process.env.ABLY_API_KEY) {
      console.error('ABLY_API_KEY is missing');
      return NextResponse.json(
        {
          errorMessage: `Missing ABLY_API_KEY environment variable.
          If you're running locally, please ensure you have a ./.env file with a value for ABLY_API_KEY=your-key.
          If you're running in Netlify, make sure you've configured env variable ABLY_API_KEY. 
          Please see README.md for more details on configuring your Ably API Key.`,
        },
        {
          status: 500,
          headers: new Headers({
            'content-type': 'application/json',
          }),
        }
      );
    }

    const client = new Ably.Rest(process.env.ABLY_API_KEY);

    // Parse the request body for channel and data
    let json;
    try {
      json = await req.json();
    } catch (err) {
      console.error('Failed to parse JSON body:', err);
      return NextResponse.json({ errorMessage: 'Invalid JSON body.' }, { status: 400 });
    }

    const { channel, data }: { channel: string; data: NewNotificationType } = json;

    if (!channel || !data) {
      console.error('Missing channel or data in request body.', { channel, data });
      return NextResponse.json({ errorMessage: 'Missing channel or data in request body.' }, { status: 400 });
    }

    // Disallowed words check (checks all string values in data.body)
    let bodyObj: NotificationBody;
    if (typeof data.body === 'string') {
      try {
        bodyObj = JSON.parse(data.body) as NotificationBody;
      } catch (err) {
        console.error('Invalid body format:', err, data.body);
        return NextResponse.json({ errorMessage: 'Invalid body format.' }, { status: 400 });
      }
    } else if (typeof data.body === 'object' && data.body !== null) {
      bodyObj = data.body as NotificationBody;
    } else {
      console.error('Body is neither string nor object:', data.body);
      return NextResponse.json({ errorMessage: 'Invalid body format.' }, { status: 400 });
    }

    const disallowedWords = ['foo', 'bar', 'fizz', 'buzz'];
    const textToCheck = extractStrings(bodyObj).join(' ');
    const containsDisallowedWord = disallowedWords.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(textToCheck));

    if (containsDisallowedWord) {
      console.warn('Disallowed word found in notification body:', textToCheck);
      return new Response('', { status: 403 });
    }

    // Publish the message to the specified channel
    try {
      await client.channels.get(channel).publish('update-from-server', data);
    } catch (err) {
      console.error('Failed to publish to Ably:', err);
      return NextResponse.json({ errorMessage: 'Failed to publish notification.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error in notification publish endpoint:', err);
    return NextResponse.json({ errorMessage: 'Internal server error.' }, { status: 500 });
  }
}
