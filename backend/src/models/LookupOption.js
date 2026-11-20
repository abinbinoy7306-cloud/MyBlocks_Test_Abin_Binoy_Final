const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LookupOption = sequelize.define('LookupOption', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  category: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.STRING, allowNull: false },
  label: { type: DataTypes.STRING, allowNull: false },
  sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: 'lookup_options', timestamps: true, indexes: [{ unique: true, fields: ['category', 'value'] }] });

module.exports = LookupOption;
