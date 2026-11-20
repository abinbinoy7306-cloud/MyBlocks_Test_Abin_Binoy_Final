const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApiKey = sequelize.define('ApiKey', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenant_id: { type: DataTypes.UUID, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false },
  key: { type: DataTypes.TEXT, allowNull: false },
  type: {
    type: DataTypes.ENUM('text', 'image', 'audio', 'video'),
    allowNull: false,
    defaultValue: 'text',
  },
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  tokensUsed: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  tokenLimit: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 1000000 },
}, { tableName: 'api_keys', timestamps: true });

module.exports = ApiKey;
