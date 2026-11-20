const { Agent } = require('../models');

const tenantWhere = (req) => ({ tenant_id: req.user?.tenant_id || null });
const TASK_TYPES = ['text', 'image', 'audio', 'video'];
const AUTONOMY = ['assistive', 'controlled', 'fully_autonomous'];

const templates = [
  ['Recruiter Agent', 'recruiter', 'Creates job descriptions, searches candidate records, and prepares hiring shortlists.', 'text', 'job.requisition.created', ['approved_requisition'], ['draft_job_description', 'search_candidates', 'create_shortlist'], ['job_description_generation', 'candidate_search', 'communication_drafting'], 'controlled', 'llm1', true],
  ['Candidate Screener', 'screener', 'Extracts candidate details, compares skills with requirements, and scores applicants.', 'text', 'candidate.application.received', ['resume_uploaded'], ['extract_candidate_data', 'score_candidate', 'flag_missing_information'], ['resume_parsing', 'skill_matching', 'ranking'], 'controlled', 'llm1', true],
  ['Data Verifier', 'data_verifier', 'Validates business records, detects duplicates, and flags incomplete data.', 'text', 'record.created_or_updated', ['customer', 'vendor', 'employee', 'candidate'], ['validate_fields', 'detect_duplicates', 'create_correction_task'], ['data_validation', 'duplicate_detection', 'record_enrichment'], 'fully_autonomous', 'llm1', false],
  ['Invoice Processing Agent', 'invoice_processor', 'Reads invoices and receipts, extracts tax data, detects duplicates, and submits approvals.', 'image', 'document.uploaded', ['invoice', 'receipt'], ['extract_invoice_fields', 'validate_tax_values', 'detect_duplicate', 'create_approval_task'], ['ocr', 'tax_extraction', 'duplicate_detection'], 'controlled', 'llm2', true],
  ['Customer Support Agent', 'customer_support', 'Answers routine customer questions and escalates complex or sensitive cases.', 'text', 'support.ticket.created', ['new_ticket'], ['classify_ticket', 'search_knowledge_base', 'draft_response', 'escalate_exception'], ['question_answering', 'ticket_creation', 'escalation'], 'controlled', 'llm1', true],
  ['Follow-up Agent', 'follow_up', 'Finds overdue work and creates reminders or escalations based on SLA rules.', 'text', 'scheduled.daily', ['overdue_task', 'inactive_lead', 'pending_approval'], ['create_reminder', 'draft_notification', 'escalate_overdue_item'], ['reminders', 'sla_tracking', 'escalation'], 'fully_autonomous', 'llm1', false],
  ['Business Analyst Agent', 'analyst', 'Generates KPI summaries, trend analysis, and management reports from approved data.', 'text', 'scheduled.reporting_period', ['daily', 'weekly', 'monthly'], ['query_approved_data', 'calculate_kpis', 'generate_report'], ['analytics', 'kpi_calculation', 'narrative_reporting'], 'assistive', 'llm1', true],
  ['Compliance Monitor', 'compliance', 'Checks records against policies and creates risk alerts and remediation tasks.', 'text', 'scheduled.compliance_scan', ['policy_update', 'scheduled_scan'], ['check_policy_rules', 'score_risk', 'create_remediation_task'], ['policy_checks', 'risk_scoring', 'audit_preparation'], 'controlled', 'llm1', true],
];

async function ensureDefaults(req) {
  const where = tenantWhere(req);
  if (await Agent.count({ where })) return;
  await Agent.bulkCreate(templates.map(([name, role, description, taskType, triggerEvent, triggerConditions, actions, capabilities, autonomy, modelKeyPool, requiresApproval]) => ({
    ...where, name, role, description, taskType, triggerEvent, triggerConditions, actions, capabilities, autonomy, modelKeyPool, requiresApproval,
  })));
}

exports.getAll = async (req, res) => {
  try { await ensureDefaults(req); const agents = await Agent.findAll({ where: tenantWhere(req), order: [['name', 'ASC']] }); res.json(agents); }
  catch (err) { console.error('agent getAll error:', err); res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req, res) => {
  const { name, role, description, taskType = 'text', triggerEvent, triggerConditions = [], actions = [], capabilities = [], autonomy = 'controlled', requiresApproval = true, modelKeyPool = 'llm1', fallbackAgent = null } = req.body;
  if (!name || !role || !description || !triggerEvent) return res.status(400).json({ message: 'name, role, description, and triggerEvent are required' });
  if (!TASK_TYPES.includes(taskType) || !AUTONOMY.includes(autonomy)) return res.status(400).json({ message: 'Invalid task type or autonomy level' });
  try { const agent = await Agent.create({ ...tenantWhere(req), name, role, description, taskType, triggerEvent, triggerConditions, actions, capabilities, autonomy, requiresApproval: Boolean(requiresApproval), modelKeyPool, fallbackAgent }); res.status(201).json(agent); }
  catch (err) { console.error('agent create error:', err); res.status(500).json({ message: 'Server error' }); }
};

exports.update = async (req, res) => {
  try { const agent = await Agent.findOne({ where: { id: req.params.id, ...tenantWhere(req) } }); if (!agent) return res.status(404).json({ message: 'Not found' }); const allowed = ['name', 'role', 'description', 'taskType', 'triggerEvent', 'triggerConditions', 'actions', 'capabilities', 'autonomy', 'requiresApproval', 'modelKeyPool', 'fallbackAgent', 'status']; const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))); await agent.update(updates); res.json(agent); }
  catch (err) { console.error('agent update error:', err); res.status(500).json({ message: 'Server error' }); }
};

exports.toggle = async (req, res) => {
  try { const agent = await Agent.findOne({ where: { id: req.params.id, ...tenantWhere(req) } }); if (!agent) return res.status(404).json({ message: 'Not found' }); await agent.update({ status: agent.status === 'active' ? 'paused' : 'active' }); res.json(agent); }
  catch (err) { console.error('agent toggle error:', err); res.status(500).json({ message: 'Server error' }); }
};
