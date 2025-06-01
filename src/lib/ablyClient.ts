import * as Ably from 'ably';

let client: Ably.Realtime | null = null;

export function getAblyClient(clientId: string = ''): Ably.Realtime {
  if (!client) {
    client = new Ably.Realtime({
      authUrl: '/api/ably',
      authMethod: 'POST',
      clientId,
      autoConnect: typeof window !== 'undefined',
    });
  }
  //todo: review if we need to handle clientId changes or we should always send the same clientId to keep integrity
  /* else if (client.auth.clientId !== clientId) {
    // Optionally, handle clientId changes (re-create client if needed)
    client = new Ably.Realtime({
      authUrl: '/api/ably',
      authMethod: 'POST',
      clientId,
      autoConnect: typeof window !== 'undefined',
    });
  }*/
  return client;
}
