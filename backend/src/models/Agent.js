const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agent = sequelize.define('Agent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenant_id: { type: DataTypes.UUID, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  taskType: { type: DataTypes.ENUM('text', 'image', 'audio', 'video'), allowNull: false, defaultValue: 'text' },
  triggerEvent: { type: DataTypes.STRING, allowNull: false },
  triggerConditions: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  actions: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  capabilities: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  autonomy: { type: DataTypes.ENUM('assistive', 'controlled', 'fully_autonomous'), allowNull: false, defaultValue: 'controlled' },
  requiresApproval: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  modelKeyPool: { type: DataTypes.STRING, allowNull: false, defaultValue: 'llm1' },
  fallbackAgent: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('active', 'paused'), allowNull: false, defaultValue: 'active' },
}, { tableName: 'ai_agents', timestamps: true });

module.exports = Agent;
