const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(express.json());
app.use(cors());

const posts = {};

const handleEvent = (data, type) => {
  if (type === 'PostCreated') {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    const editedComment = post.comments.find((comment) => comment.id === id);

    editedComment.status = status;
    editedComment.content = content;
  }
};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/events', (req, res) => {
  const { data, type } = req.body;

  handleEvent(data, type);

  return res.status(200).json({
    status: 'success',
  });
});

app.listen(4002, async () => {
  console.log('Query service listening on port 4002');

  const res = await axios.get('http://event-bus-srv:4005/events');
  const events = res.data;

  for (const event of events) {
    console.log('Processing event: ', event.type);
    handleEvent(event.data, event.type);
  }
});
