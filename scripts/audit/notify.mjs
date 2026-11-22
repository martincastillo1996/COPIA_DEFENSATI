// Alertas salientes: Telegram, webhook y correo (Resend). Solo los canales configurados.
export async function notify(text) {
  console.log(`[alerta] ${text.replace(/\n/g, ' | ')}`);
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, LEAD_WEBHOOK_URL, RESEND_API_KEY, ADMIN_NOTIFICATION_EMAIL, ALERT_FROM_EMAIL } = process.env;
  const post = (url, body, headers = {}) => fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
  });
  const jobs = [];
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    jobs.push(post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { chat_id: TELEGRAM_CHAT_ID, text }));
  }
  if (LEAD_WEBHOOK_URL) jobs.push(post(LEAD_WEBHOOK_URL, { text, content: text }));
  if (RESEND_API_KEY && ADMIN_NOTIFICATION_EMAIL) {
    jobs.push(post('https://api.resend.com/emails', {
      from: ALERT_FROM_EMAIL || 'alertas@neuronalgravity.com', to: ADMIN_NOTIFICATION_EMAIL,
      subject: text.split('\n')[0].slice(0, 120), text,
    }, { Authorization: `Bearer ${RESEND_API_KEY}` }));
  }
  if (!jobs.length) {
    console.warn('[alerta] Sin canal configurado (TELEGRAM_*, LEAD_WEBHOOK_URL o RESEND_API_KEY).');
    return;
  }
  for (const r of await Promise.allSettled(jobs)) {
    if (r.status === 'rejected' || !r.value.ok) console.warn('[alerta] Un canal no entregó la alerta.');
  }
}
