const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/posts', async (req, res) => {
  const id = randomBytes(5).toString('hex');
  const post = {
    id,
    title: req.body.title,
  };
  posts[id] = post;

  const event = {
    type: 'PostCreated',
    data: post,
  };

  await axios.post('http://localhost:4005/events', event);
  return res.status(201).json(posts);
});

app.post('/events', (req, res) => {
  console.log('Received Events', req.body.type);

  return res.send({ status: 'OK' });
});

app.listen(4000, () => {
  console.log('Posts service listening on port 4000');
});
