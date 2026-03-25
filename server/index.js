const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const PIXEL_ID = process.env.META_PIXEL_ID;

app.post('/api/meta-events', async (req, res) => {
  const { eventName, eventData, eventId, fbc, fbp, user } = req.body;

  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: req.headers.referer,
      user_data: {
        client_ip_address: req.ip,
        client_user_agent: req.headers['user-agent'],
        fbc: fbc,
        fbp: fbp,
        em: user.email ? crypto.createHash('sha256').update(user.email).digest('hex') : undefined,
        ph: user.phone ? crypto.createHash('sha256').update(user.phone).digest('hex') : undefined,
        fn: user.firstName ? crypto.createHash('sha256').update(user.firstName).digest('hex') : undefined,
        ln: user.lastName ? crypto.createHash('sha256').update(user.lastName).digest('hex') : undefined,
      },
      custom_data: eventData,
    }],
    access_token: ACCESS_TOKEN,
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send CAPI event' });
  }
});

app.listen(3001, () => console.log('Server listening on port 3001'));
