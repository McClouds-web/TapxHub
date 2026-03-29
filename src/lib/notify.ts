const telegramBotToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const telegramChatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
const ntfyTopic = import.meta.env.VITE_NTFY_TOPIC || 'tapxmedia-alerts';

export const sendNotification = async ({ title, message }: { title: string, message: string }) => {
  const promises = [];

  // Zero-Cost Telegram Engine
  if (telegramBotToken && telegramChatId) {
    const text = `*${title}*\n${message}`;
    promises.push(
      fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId, text, parse_mode: 'Markdown' })
      }).then(res => res.json())
        .then(data => console.log('Telegram Push Dispatched:', data.ok ? 'Success' : 'Failed'))
        .catch(err => console.error('Telegram Push Pipeline Error:', err))
    );
  }

  // Zero-Cost Ntfy.sh Engine
  if (ntfyTopic) {
    promises.push(
      fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: 'POST',
        body: message,
        headers: { Title: title }
      }).then(res => res.text())
        .then(() => console.log('Ntfy Free Push Dispatched: Success'))
        .catch(err => console.error('Ntfy Push Pipeline Error:', err))
    );
  }

  await Promise.allSettled(promises);
};
