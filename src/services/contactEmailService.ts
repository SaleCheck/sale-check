interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

const FUNCTION_URL =
  'https://us-central1-salecheck-867e3.cloudfunctions.net/sendContactMessage';

export async function sendContactMessage(data: ContactMessage): Promise<void> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });

  const body = await res.json();
  if (!res.ok || body.status !== 'Success') {
    throw new Error(body.error || 'Failed to send message');
  }
}
