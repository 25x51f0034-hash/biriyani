const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// CORS: allows your Vercel site and local development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow tools like Postman and server-to-server calls (no origin)
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(express.json());

app.get('/', (_req, res) => res.send('QuizSheet API is running'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/attempts', require('./routes/attempts'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Unknown API routes return JSON instead of an HTML page
app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found' }));

// In production, serve the built React app (only if it exists)
const dist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const PORT = process.env.PORT || 5000;
connectDB().then(() =>
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
);