import { ensureCsrfToken, addCsrfHeader } from '../../services/csrf';

const CHATBOT_ENDPOINT = import.meta.env.VITE_CHATBOT_API_URL || '/api/chatbot/message';

export async function sendChatbotMessage({ message, history }) {
  await ensureCsrfToken();
  const headers = new Headers({ 'Content-Type': 'application/json' });
  addCsrfHeader(headers);

  const response = await fetch(CHATBOT_ENDPOINT, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ message, history }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Travel assistant is unavailable.');
  }

  return data;
}
