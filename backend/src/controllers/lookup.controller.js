const { Op } = require('sequelize');
const { LookupOption } = require('../models');

const CATEGORIES = {
  plans: 'Subscription plans',
  roles: 'User roles',
  task_types: 'AI task types',
  timezones: 'Timezones',
  date_formats: 'Date formats',
  fiscal_year_starts: 'Fiscal year starts',
};

const defaults = {
  plans: [['free', 'Free'], ['starter', 'Starter'], ['pro', 'Pro'], ['enterprise', 'Enterprise']],
  roles: [['super_admin', 'Super Admin'], ['firm_admin', 'Firm Admin'], ['manager', 'Manager'], ['team_user', 'Team User']],
  task_types: [['text', 'Text (LLM-1)'], ['image', 'Image (LLM-2)'], ['audio', 'Audio (LLM-3)'], ['video', 'Video (LLM-4)']],
  timezones: [['UTC', 'UTC (Coordinated Universal Time)'], ['Asia/Kolkata', 'Asia/Kolkata (IST +5:30)'], ['America/New_York', 'America/New_York (EST/EDT)'], ['Europe/London', 'Europe/London (GMT/BST)'], ['Asia/Dubai', 'Asia/Dubai (GST +4:00)'], ['Asia/Singapore', 'Asia/Singapore (SGT +8:00)']],
  date_formats: [['DD/MM/YYYY', 'DD/MM/YYYY (e.g. 31/12/2026)'], ['MM/DD/YYYY', 'MM/DD/YYYY (e.g. 12/31/2026)'], ['YYYY-MM-DD', 'YYYY-MM-DD (ISO 8601)']],
  fiscal_year_starts: [['01-01', 'January 1'], ['04-01', 'April 1'], ['07-01', 'July 1'], ['10-01', 'October 1']],
};

async function ensureDefaults(category) {
  if (!defaults[category]) return;
  for (const [value, label] of defaults[category]) {
    await LookupOption.findOrCreate({ where: { category, value }, defaults: { category, value, label, sort_order: defaults[category].findIndex((x) => x[0] === value) } });
  }
}

exports.getOptions = async (req, res) => {
  const category = req.params.category;
  if (!CATEGORIES[category]) return res.status(404).json({ message: 'Unknown lookup category' });
  try { await ensureDefaults(category); const options = await LookupOption.findAll({ where: { category, is_active: true }, order: [['sort_order', 'ASC'], ['label', 'ASC']] }); res.json({ success: true, data: options }); }
  catch (err) { console.error('lookup getOptions error:', err); res.status(500).json({ message: 'Server error' }); }
};

exports.getAll = async (req, res) => {
  try { await Promise.all(Object.keys(CATEGORIES).map(ensureDefaults)); const options = await LookupOption.findAll({ order: [['category', 'ASC'], ['sort_order', 'ASC'], ['label', 'ASC']] }); res.json({ success: true, categories: CATEGORIES, data: options }); }
  catch (err) { console.error('lookup getAll error:', err); res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req, res) => {
  const { category, value, label, sort_order = 0 } = req.body;
  if (!CATEGORIES[category] || !value?.trim() || !label?.trim()) return res.status(400).json({ message: 'category, value, and label are required' });
  try { const option = await LookupOption.create({ category, value: value.trim(), label: label.trim(), sort_order: Number(sort_order) || 0 }); res.status(201).json(option); }
  catch (err) { if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'This value already exists in the category' }); console.error('lookup create error:', err); res.status(500).json({ message: 'Server error' }); }
};

exports.update = async (req, res) => {
  try { const option = await LookupOption.findByPk(req.params.id); if (!option) return res.status(404).json({ message: 'Not found' }); const updates = {}; for (const key of ['value', 'label', 'sort_order', 'is_active']) if (req.body[key] !== undefined) updates[key] = req.body[key]; await option.update(updates); res.json(option); }
  catch (err) { if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'This value already exists in the category' }); console.error('lookup update error:', err); res.status(500).json({ message: 'Server error' }); }
};

exports.toggle = async (req, res) => {
  try { const option = await LookupOption.findByPk(req.params.id); if (!option) return res.status(404).json({ message: 'Not found' }); await option.update({ is_active: !option.is_active }); res.json(option); }
  catch (err) { console.error('lookup toggle error:', err); res.status(500).json({ message: 'Server error' }); }
};
