const express = require('express');
const router = express.Router();
const controller = require('../controllers/lookup.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticate);
router.get('/:category', controller.getOptions);
router.use(requireRole(['super_admin', 'firm_admin']));
router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.put('/:id/toggle', controller.toggle);

module.exports = router;
