import express from 'express';
import authRoutes from './routes/auth.js';
import cors from './middleware/cors.js';

const app = express();

app.use(cors);
app.use(express.json());

// Health check endpoint, used by the scheduled workflow.
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({ message: 'GitHub Actions basics API' });
});

app.use('/api/auth', authRoutes);

// 404 for anything that did not match a route.
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Central error handler: malformed JSON becomes a 400 instead of an HTML stack page.
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

export default app;
