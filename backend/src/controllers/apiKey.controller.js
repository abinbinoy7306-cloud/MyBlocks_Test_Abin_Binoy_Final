// backend/src/controllers/apiKey.controller.js
// Simple CRUD controller for the `api_keys` table.
// The migration creates fields: id, name, key, type, active, tokensUsed, tokenLimit, createdAt, updatedAt.

const { ApiKey } = require('../models');

const tenantWhere = (req) => req.user?.role === 'super_admin' && req.query.tenant_id
  ? { tenant_id: req.query.tenant_id } : { tenant_id: req.user?.tenant_id || null };
const publicKey = (key) => ({ ...key.toJSON(), key: `••••••••${String(key.key).slice(-4)}` });

// GET /api/apikeys – return an array (empty [] if none)
exports.getAll = async (req, res) => {
  try {
    const keys = await ApiKey.findAll({ where: tenantWhere(req), order: [['type', 'ASC'], ['createdAt', 'ASC']] });
    res.json(keys.map(publicKey));
  } catch (err) {
    console.error('apiKey getAll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/apikeys – create a new key
exports.create = async (req, res) => {
  const { name, key, type = 'text', tokenLimit = 1000000 } = req.body;
  if (!name || !key) {
    return res.status(400).json({ message: 'name and key are required' });
  }
  if (!['text', 'image', 'audio', 'video'].includes(type) || !Number.isInteger(Number(tokenLimit)) || Number(tokenLimit) < 1) {
    return res.status(400).json({ message: 'type or tokenLimit is invalid' });
  }
  try {
    const newKey = await ApiKey.create({ name, key, type, tokenLimit, ...tenantWhere(req) });
    res.status(201).json(publicKey(newKey));
  } catch (err) {
    console.error('apiKey create error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/apikeys/:id – update fields (name, key, type, tokenLimit, etc.)
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const apiKey = await ApiKey.findOne({ where: { id, ...tenantWhere(req) } });
    if (!apiKey) return res.status(404).json({ message: 'Not found' });
    const allowed = ['name', 'type', 'tokenLimit'];
    const safeUpdates = Object.fromEntries(Object.entries(updates).filter(([field]) => allowed.includes(field) || (field === 'key' && updates[field])));
    if (safeUpdates.tokenLimit !== undefined && (!Number.isInteger(Number(safeUpdates.tokenLimit)) || Number(safeUpdates.tokenLimit) < 1)) {
      return res.status(400).json({ message: 'tokenLimit must be a positive integer' });
    }
    if (safeUpdates.type && !['text', 'image', 'audio', 'video'].includes(safeUpdates.type)) {
      return res.status(400).json({ message: 'type is invalid' });
    }
    if (safeUpdates.type && safeUpdates.type !== apiKey.type && apiKey.active) {
      await ApiKey.update({ active: false }, { where: { id: apiKey.id } });
    }
    await apiKey.update(safeUpdates);
    res.json(publicKey(apiKey));
  } catch (err) {
    console.error('apiKey update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/apikeys/:id – remove a key
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const apiKey = await ApiKey.findOne({ where: { id, ...tenantWhere(req) } });
    if (!apiKey) return res.status(404).json({ message: 'Not found' });
    await apiKey.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('apiKey delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/apikeys/:id/activate – mark this key active and deactivate others
exports.activate = async (req, res) => {
  const { id } = req.params;
  try {
    // Deactivate all keys first
    const apiKey = await ApiKey.findOne({ where: { id, ...tenantWhere(req) } });
    if (!apiKey) return res.status(404).json({ message: 'Not found' });
    await ApiKey.update({ active: false }, { where: { ...tenantWhere(req), type: apiKey.type } });
    await apiKey.update({ active: true });
    res.json(publicKey(apiKey));
  } catch (err) {
    console.error('apiKey activate error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
