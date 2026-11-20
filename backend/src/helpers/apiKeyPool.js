// backend/src/helpers/apiKeyPool.js
// Helper utilities for API‑key pooling, automated rollover and token bookkeeping.

const { Op } = require('sequelize');
const { ApiKey } = require('../models');

/**
 * Get an active API key for a given task type (e.g. 'text', 'image').
 * If the currently active key for that type has exhausted its token limit,
 * the function deactivates it and activates the next available key.
 *
 * @param {string} taskType - One of 'text', 'image', 'audio', 'video'.
 * @returns {Promise<ApiKey>} - The selected key instance.
 */
async function getKeyForTask(taskType, tenantId = null) {
  const where = { type: taskType, ...(tenantId ? { tenant_id: tenantId } : {}) };
  // Find the currently active key for this type
  let key = await ApiKey.findOne({ where: { ...where, active: true }, order: [['updatedAt', 'ASC']] });

  // If no active key or token quota exceeded, pick the next viable key
  if (!key || key.tokensUsed >= key.tokenLimit) {
    // Deactivate any exhausted key
    if (key) await key.update({ active: false });

    // Find the earliest created key of this type that still has quota
    key = await ApiKey.findOne({
      where: {
        ...where,
        tokensUsed: { [Op.lt]: Op.col('tokenLimit') },
      },
      order: [['createdAt', 'ASC']],
    });

    if (key) {
      await key.update({ active: true });
    }
  }

  if (!key) {
    throw new Error(`No API key available for task type "${taskType}"`);
  }

  return key;
}

/**
 * Increment the token usage count for a given key.
 * Call after a successful request to the external service.
 *
 * @param {string} keyId - UUID of the ApiKey record.
 * @param {number} count - Number of tokens to add (default 1).
 */
async function addTokens(keyId, count = 1) {
  await ApiKey.increment({ tokensUsed: count }, { where: { id: keyId } });
  const key = await ApiKey.findByPk(keyId);
  if (key && Number(key.tokensUsed) >= Number(key.tokenLimit)) {
    await key.update({ active: false });
  }
}

async function markExhausted(keyId) {
  await ApiKey.update({ active: false }, { where: { id: keyId } });
}

const isQuotaError = (error) => {
  const status = error?.status || error?.statusCode || error?.response?.status;
  const code = error?.code || error?.response?.data?.error?.code;
  return [402, 429].includes(Number(status)) || ['insufficient_quota', 'quota_exceeded', 'rate_limit_exceeded'].includes(code);
};

/** Execute a provider request and transparently retry once per remaining key. */
async function withApiKey(taskType, tenantId, request) {
  const tried = new Set();
  while (true) {
    const key = await getKeyForTask(taskType, tenantId);
    if (tried.has(key.id)) throw new Error(`No API key available for task type "${taskType}"`);
    tried.add(key.id);
    try {
      const result = await request(key.key, key);
      return { result, key };
    } catch (error) {
      if (!isQuotaError(error)) throw error;
      await markExhausted(key.id);
    }
  }
}

module.exports = { getKeyForTask, addTokens, markExhausted, withApiKey, isQuotaError };
