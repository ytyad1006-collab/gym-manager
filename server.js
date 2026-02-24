// Express backend for WhatsApp reminders via Twilio
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN';
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
const client = twilio(accountSid, authToken);

app.post('/send-whatsapp', async (req, res) => {
  const { phone, name, expiry_date } = req.body;
  if (!phone || !name || !expiry_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${phone}`,
      body: `Hi ${name}, your gym membership expires on ${expiry_date}.`
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
