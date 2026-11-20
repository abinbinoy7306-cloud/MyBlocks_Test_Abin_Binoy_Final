// backend/src/middleware/apiKeyMiddleware.js
// Middleware that selects an API key based on the requested task type and
// automatically rolls over when the current key runs out of tokens.

const { getKeyForTask } = require('../helpers/apiKeyPool');

/**
 * Attach a suitable API key to the request.
 * Expected `req.body.taskType` to be one of: 'text', 'image', 'audio', 'video'.
 * If omitted, defaults to 'text'.
 */
async function attachApiKey(req, res, next) {
  try {
    const taskType = req.body.taskType || 'text';
    const apiKey = await getKeyForTask(taskType, req.user?.tenant_id || null);
    // expose both the raw key string and the DB id for later token accounting
    req.apiKey = apiKey.key;
    req.apiKeyId = apiKey.id;
    next();
  } catch (err) {
    console.error('attachApiKey middleware error:', err);
    res.status(503).json({ message: err.message });
  }
}

/**
 * After a successful external request, call this to increment token usage.
 * Pass the number of tokens consumed (default 1).
 */
async function recordTokenUsage(req, tokens = 1) {
  if (!req.apiKeyId) return;
  const { addTokens } = require('../helpers/apiKeyPool');
  await addTokens(req.apiKeyId, tokens);
}

module.exports = { attachApiKey, recordTokenUsage };
