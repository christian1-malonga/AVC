const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

export async function sendWhatsApp(to: string, message: string): Promise<void> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log(`[WhatsApp] Would send to ${to}: ${message}`);
    return;
  }

  const accountSid = TWILIO_ACCOUNT_SID;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  try {
    const body = new URLSearchParams({
      To: formattedTo,
      From: TWILIO_WHATSAPP_FROM,
      Body: message,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn(`[WhatsApp] Failed to send to ${to}: ${text}`);
    }
  } catch (err) {
    console.warn(`[WhatsApp] Error sending to ${to}:`, err);
  }
}
