const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Use middleware to parse JSON
app.use(bodyParser.json());

// Sample in-memory database
let users = [
    { id: 1, username: 'user1', password: 'pass1', posts: [] },
    { id: 2, username: 'user2', password: 'pass2', posts: [] },
];

// Middleware for authentication
const authenticateUser = (req, res, next) => {
    // Check if user is authenticated (you may use JWT or sessions for a real app)
    const userId = req.headers.userid;
    if (!userId || !users.some(user => user.id == userId)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Get user's profile
app.get('/profile/:userId', authenticateUser, (req, res) => {
    const userId = req.params.userId;
    const user = users.find(user => user.id == userId);
    if (user) {
        return res.json({ username: user.username, posts: user.posts });
    } else {
        return res.status(404).json({ error: 'User not found' });
    }
});

// Create a new post
app.post('/post', authenticateUser, (req, res) => {
    const userId = req.headers.userid;
    const user = users.find(user => user.id == userId);
    const { content } = req.body;

    if (content) {
        const newPost = { id: user.posts.length + 1, content, timestamp: new Date() };
        user.posts.push(newPost);
        return res.json(newPost);
    } else {
        return res.status(400).json({ error: 'Invalid request' });
    }
});

// Delete a post
app.delete('/post/:postId', authenticateUser, (req, res) => {
    const userId = req.headers.userid;
    const postId = parseInt(req.params.postId);
    const user = users.find(user => user.id == userId);

    const postIndex = user.posts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
        user.posts.splice(postIndex, 1);
        return res.json({ message: 'Post deleted successfully' });
    } else {
        return res.status(404).json({ error: 'Post not found' });
    }
});

// Update a post
app.put('/post/:postId', authenticateUser, (req, res) => {
    const userId = req.headers.userid;
    const postId = parseInt(req.params.postId);
    const user = users.find(user => user.id == userId);
    const { content } = req.body;

    const post = user.posts.find(post => post.id === postId);
    if (post) {
        post.content = content;
        return res.json(post);
    } else {
        return res.status(404).json({ error: 'Post not found' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
