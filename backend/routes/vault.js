import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');
const VAULT_FILE = path.join(DATA_DIR, 'vault.json');

// Ensure data directory and vault file exist with initial seed data
function getVaultData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(VAULT_FILE)) {
      const initialData = [
        {
          id: 'v-initial-1',
          query: 'Private Search Architecture',
          mode: 'web',
          pinned: true,
          saved: true,
          timestamp: new Date().toISOString(),
          takeaway: 'Zero-knowledge private synthesis prevents metadata leakage.',
          tags: ['privacy', 'searxng', 'architecture'],
          key_points: [
            'Zero-knowledge synthesis preserves privacy.',
            'Decoupled aggregation layer eliminates tracking.',
            'Local SearXNG instance ensures sub-millisecond retrieval.',
          ],
          sources: [
            {
              id: 1,
              title: 'SearXNG Privacy Architecture',
              domain: 'searx.space',
              url: 'https://searx.space',
            },
          ],
        },
        {
          id: 'v-initial-2',
          query: 'Multi-Agent Research Protocols',
          mode: 'academic',
          pinned: false,
          saved: true,
          timestamp: new Date().toISOString(),
          takeaway: 'Cross-model verification enhances citation fidelity.',
          tags: ['agents', 'synthesis', 'research'],
          key_points: [
            'Agent pipeline decomposes multi-step queries.',
            'Cross-domain validation reduces error margins.',
            'Deterministic outputs ensure repeatability.',
          ],
          sources: [
            {
              id: 1,
              title: 'Multi-Agent Verification Benchmarks',
              domain: 'arxiv.org',
              url: 'https://arxiv.org',
            },
          ],
        },
      ];
      fs.writeFileSync(VAULT_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(VAULT_FILE, 'utf-8');
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('[Vault] Error reading vault storage:', err);
    return [];
  }
}

function saveVaultData(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Vault] Error saving vault storage:', err);
    return false;
  }
}

// GET /api/vault - Retrieve all saved sessions, pinned queries, and history items
router.get('/', (req, res) => {
  const items = getVaultData();
  const pinned = items.filter((item) => item.pinned);
  const saved = items.filter((item) => item.saved);

  return res.json({
    status: 'ok',
    count: items.length,
    items,
    sessions: items,
    pinned,
    saved,
  });
});

// POST /api/vault/save - Save or pin a search session
router.post('/save', (req, res) => {
  const {
    id,
    query,
    mode = 'web',
    answer = '',
    sources = [],
    pinned = false,
    saved = true,
    tags = [],
    key_points = [],
    takeaway = '',
    incognito = false,
  } = req.body || {};

  // Bypass saving to vault when incognito is active
  if (Boolean(incognito)) {
    return res.json({
      status: 'ok',
      bypassed: true,
      message: 'Incognito session active: persistence bypassed',
    });
  }

  if (!query) {
    return res.status(400).json({ error: 'Query is required to save to vault' });
  }

  const items = getVaultData();
  const itemId = id || `vault-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const existingIndex = items.findIndex(
    (item) => item.id === itemId || (item.query === query && item.mode === mode)
  );

  const newItem = {
    id: itemId,
    query: String(query).trim(),
    mode,
    answer,
    sources,
    pinned: Boolean(pinned),
    saved: Boolean(saved),
    tags: Array.isArray(tags) ? tags : [],
    key_points: Array.isArray(key_points) ? key_points : [],
    takeaway: takeaway || (answer ? answer.slice(0, 100) : ''),
    timestamp: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      ...newItem,
      id: items[existingIndex].id,
    };
  } else {
    items.unshift(newItem);
  }

  saveVaultData(items);

  return res.json({
    status: 'ok',
    message: 'Saved to vault successfully',
    item: newItem,
  });
});

// DELETE /api/vault/:id - Remove an item from the vault
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const items = getVaultData();
  const filtered = items.filter((item) => item.id !== id);

  if (filtered.length === items.length) {
    return res.status(404).json({ error: `Item ${id} not found in vault` });
  }

  saveVaultData(filtered);

  return res.json({
    status: 'ok',
    message: `Item ${id} removed from vault`,
    remainingCount: filtered.length,
  });
});

export default router;
