const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const comments = {};

app.post('/posts/:id/comments', async (req, res) => {
  const { content } = req.body;
  const comment = {
    id: randomBytes(4).toString('hex'),
    content,
    status: 'pending',
  };

  const postComments = comments[req.params.id] || [];

  postComments.push(comment);
  comments[req.params.id] = postComments;

  const event = {
    type: 'CommentCreated',
    data: {
      ...comment,
      postId: req.params.id,
    },
  };

  await axios.post('http://event-bus-srv:4005/events', event);
  return res.status(201).json({
    comments: postComments,
  });
});

app.get('/posts/:id/comments', (req, res) => {
  return res.status(200).json({
    comments: comments[req.params.id] || [],
  });
});

app.post('/events', async (req, res) => {
  console.log('Received Events', req.body.type);
  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { postId, id, status } = data;
    const postComments = comments[postId];

    const editedComment = postComments.find((comment) => comment.id === id);

    editedComment.status = status;

    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: {
        ...editedComment,
        postId,
      },
    });
  }

  return res.send({ status: 'OK' });
});

app.listen(4001, () => {
  console.log('Comments service listening on port 4001');
});
