const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'CommentCreated') {
    const status = data.content.toLowerCase().includes('damn')
      ? 'rejected'
      : 'approved';

    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentModerated',
      data: { ...data, status },
    });
  }

  return res.send({ status: 'success' });
});

app.listen(4003, () => {
  console.log('Moderation service listening on port 4003');
});
