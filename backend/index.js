const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

// Routes
app.get('/api/posts', async (req, res) => {
  try {
    const { city } = req.query;
    let query = 'SELECT * FROM posts';
    let params = [];

    if (city) {
      query += ' WHERE city = $1';
      params = [city];
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { authorId, authorName, authorAvatarColor, content, city, organizationId, organizationName, isOrgPost } = req.body;

    const query = `
      INSERT INTO posts (author_id, author_name, author_avatar_color, content, city, organization_id, organization_name, is_org_post, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;

    const values = [authorId, authorName, authorAvatarColor, content, city, organizationId, organizationName, isOrgPost];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Check if user already liked
    const likeCheck = await pool.query('SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, userId]);

    if (likeCheck.rows.length > 0) {
      // Unlike
      await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, userId]);
      await pool.query('UPDATE posts SET likes = likes - 1 WHERE id = $1', [id]);
    } else {
      // Like
      await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [id, userId]);
      await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = $1', [id]);
    }

    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC', [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { authorId, authorName, authorAvatarColor, content, parentId } = req.body;

    const query = `
      INSERT INTO comments (post_id, author_id, author_name, author_avatar_color, content, parent_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [id, authorId, authorName, authorAvatarColor, content, parentId];
    const result = await pool.query(query, values);

    // Update comment count
    await pool.query('UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1', [id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});