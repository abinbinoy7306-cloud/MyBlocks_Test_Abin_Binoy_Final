'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ai_agents', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      tenant_id: { type: Sequelize.UUID, allowNull: true },
      name: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      taskType: { type: Sequelize.ENUM('text', 'image', 'audio', 'video'), allowNull: false, defaultValue: 'text' },
      triggerEvent: { type: Sequelize.STRING, allowNull: false },
      triggerConditions: { type: Sequelize.JSON, allowNull: false },
      actions: { type: Sequelize.JSON, allowNull: false },
      capabilities: { type: Sequelize.JSON, allowNull: false },
      autonomy: { type: Sequelize.ENUM('assistive', 'controlled', 'fully_autonomous'), allowNull: false, defaultValue: 'controlled' },
      requiresApproval: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      modelKeyPool: { type: Sequelize.STRING, allowNull: false, defaultValue: 'llm1' },
      fallbackAgent: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.ENUM('active', 'paused'), allowNull: false, defaultValue: 'active' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('ai_agents'); },
};
