import express from 'express';
import cors from 'cors';
import searchRouter from './routes/search.js';
import suggestionsRouter from './routes/suggestions.js';
import researchRouter from './routes/research.js';
import vaultRouter from './routes/vault.js';
import graphRouter from './routes/graph.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api') || req.path.startsWith('/apps')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Base44 public-settings wildcard catch routes (prevents 404s)
const publicSettingsHandler = (req, res) => {
  res.status(200).json({
    id: 'dewangan-web-app',
    settings: { theme: 'cyan', privateMode: true },
    public_settings: {
      app_name: 'DewanganWeb',
      theme: 'cyan',
      privateMode: true,
      search_enabled: true,
    },
  });
};

app.get('/api/apps/public/prod/public-settings/by-id/*', publicSettingsHandler);
app.get('/api/apps/public/prod/public-settings/*', publicSettingsHandler);
app.get('/apps/public/prod/public-settings/by-id/*', publicSettingsHandler);
app.get('/apps/public/prod/public-settings/*', publicSettingsHandler);
app.get('/api/apps/*/public_settings', publicSettingsHandler);
app.get('/apps/*/public_settings', publicSettingsHandler);
app.all([
  '/api/apps/public/prod/public-settings/by-id/*',
  '/api/apps/public/prod/public-settings/*',
  '/apps/public/prod/public-settings/by-id/*',
  '/apps/public/prod/public-settings/*',
  '/api/apps/*/public_settings',
  '/apps/*/public_settings',
  '/api/public-settings',
  '/api/public-settings/*',
], publicSettingsHandler);
app.all(/^\/(api\/)?apps\/public\/prod\/public-settings(\/.*)?$/, publicSettingsHandler);
app.all(/^\/(api\/)?apps\/.*\/public_settings$/, publicSettingsHandler);

// Analytics stub to silence telemetry 404s
app.all([
  '/api/apps/*/analytics/track/batch',
  '/api/apps/*/analytics/*',
  '/apps/*/analytics/*',
  '/api/analytics/*',
], (req, res) => {
  res.json({ status: 'ok' });
});

// Primary API routes
app.use('/api/search', searchRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/research', researchRouter);
app.use('/api/vault', vaultRouter);
app.use('/api/graph', graphRouter);

// Function route aliases for compatibility
app.use('/api/functions/aiSearch', searchRouter);
app.use('/api/functions/querySuggestions', suggestionsRouter);
app.use('/api/functions/deepResearch', researchRouter);

// 404 handler for unmatched API routes
app.use(['/api/*', '/apps/*'], (req, res) => {
  res.status(404).json({ error: `Endpoint ${req.originalUrl} not found` });
});

app.listen(PORT, () => {
  console.log(`[DewanganWeb Backend] Production API Server listening on http://localhost:${PORT}`);
  console.log(`[DewanganWeb Backend] Health check: http://localhost:${PORT}/api/health`);
});
