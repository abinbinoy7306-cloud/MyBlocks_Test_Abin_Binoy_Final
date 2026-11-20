// backend/src/routes/apiKey.routes.js
// Routes for API key management
const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKey.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticate, requireRole(['super_admin', 'firm_admin']));

router.get('/', apiKeyController.getAll);
router.post('/', apiKeyController.create);
router.put('/:id', apiKeyController.update);
router.delete('/:id', apiKeyController.delete);
router.put('/:id/activate', apiKeyController.activate);

module.exports = router;
