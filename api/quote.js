const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_BODY_SIZE = 16000;

const fieldLabels = {
  name: "Name",
  company: "Company",
  email: "Email",
  phone: "Phone",
  facility: "Facility Type",
  service: "Interested In",
  message: "Message",
};

const sendJson = (response, statusCode, payload) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
};

const readRequestBody = (request) => {
  if (request.body && typeof request.body === "object") return Promise.resolve(request.body);
  if (typeof request.body === "string") return Promise.resolve(JSON.parse(request.body || "{}"));

  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > MAX_BODY_SIZE) {
        const error = new Error("Request is too large.");
        error.statusCode = 413;
        reject(error);
        if (typeof request.destroy === "function") request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        const error = new Error("Invalid request body.");
        error.statusCode = 400;
        reject(error);
      }
    });

    request.on("error", reject);
  });
};

const cleanLine = (value, maxLength = 160) =>
  String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const cleanMessage = (value) =>
  String(value || "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, 2000);

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const formatTextEmail = (quote) =>
  Object.entries(fieldLabels)
    .map(([key, label]) => `${label}: ${quote[key] || "Not provided"}`)
    .join("\n");

const formatHtmlEmail = (quote) => {
  const rows = Object.entries(fieldLabels)
    .map(([key, label]) => {
      const value = key === "message" ? escapeHtml(quote[key] || "Not provided").replace(/\n/g, "<br />") : escapeHtml(quote[key] || "Not provided");
      return `<tr><th align="left" style="padding:10px 14px;border-bottom:1px solid #d7e7df;color:#102119;">${label}</th><td style="padding:10px 14px;border-bottom:1px solid #d7e7df;color:#24362d;">${value}</td></tr>`;
    })
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f4faf7;font-family:Arial,sans-serif;color:#24362d;">
    <div style="max-width:640px;margin:0 auto;padding:28px;">
      <h1 style="margin:0 0 8px;color:#102119;">New Kingdom Cleaners quote request</h1>
      <p style="margin:0 0 22px;color:#607267;">A visitor submitted the website quote form.</p>
      <table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #d7e7df;">
        ${rows}
      </table>
    </div>
  </body>
</html>`;
};

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { message: "Method not allowed." });
    return;
  }

  const { RESEND_API_KEY, QUOTE_TO_EMAIL } = process.env;
  const from = process.env.QUOTE_FROM_EMAIL || "Kingdom Cleaners <onboarding@resend.dev>";

  if (!RESEND_API_KEY || !QUOTE_TO_EMAIL) {
    sendJson(response, 500, { message: "Email service is not configured yet." });
    return;
  }

  try {
    const body = await readRequestBody(request);
    const quote = {
      name: cleanLine(body.name),
      company: cleanLine(body.company),
      email: cleanLine(body.email, 240),
      phone: cleanLine(body.phone, 80),
      facility: cleanLine(body.facility),
      service: cleanLine(body.service),
      message: cleanMessage(body.message),
    };

    if (!quote.name || !quote.email || !quote.phone) {
      sendJson(response, 400, { message: "Please include your name, email, and phone number." });
      return;
    }

    if (!isEmail(quote.email)) {
      sendJson(response, 400, { message: "Please enter a valid email address." });
      return;
    }

    const resendResponse = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: QUOTE_TO_EMAIL,
        reply_to: quote.email,
        subject: `New quote request from ${quote.name}`,
        html: formatHtmlEmail(quote),
        text: formatTextEmail(quote),
      }),
    });

    if (!resendResponse.ok) {
      const details = await resendResponse.text();
      console.error("Resend send failed:", details);
      sendJson(response, 502, { message: "Unable to send right now. Please try again." });
      return;
    }

    sendJson(response, 200, { message: "Quote request sent." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error(error);
    sendJson(response, statusCode, { message: error.message || "Unable to send right now. Please try again." });
  }
};
