import { EmailMessage } from "cloudflare:email";
const PostalMime = require("postal-mime");

async function streamToArrayBuffer(stream, streamSize) {
  let result = new Uint8Array(streamSize);
  let bytesRead = 0;
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result.set(value, bytesRead);
    bytesRead += value.length;
  }
  return result;
}

export default {
  async email(event, env, ctx) {
    const rawEmail = await streamToArrayBuffer(event.raw, event.rawSize);
    const parser = new PostalMime.default();
    const parsedEmail = await parser.parse(rawEmail);

    const emailSubject = parsedEmail.subject;
    const emailFrom = event.from;
    const emailTo = event.to;
    const emailBody = parsedEmail.text || parsedEmail.html;

    const webhookUrl = 'YOU-DISCORD-WEHOOK'; // replace with your Discord webhook URL

    const payload = {
      content: `**New Email Received**\n**From:** ${emailFrom}\n**To:** ${emailTo}\n**Subject:** ${emailSubject}\n**Body:**\n${emailBody}`
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // You can forward the email to another address if needed
    // const forwardPayload = {
    //   personalizations: [{ to: [{ email: 'inbox@yourdomain.com' }] }],
    //   from: { email: emailTo },
    //   subject: `Fwd: ${emailSubject}`,
    //   content: [{ type: 'text/plain', value: emailBody }]
    // };

    // await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer YOUR_SENDGRID_API_KEY`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(forwardPayload)
    // });
  }
};
