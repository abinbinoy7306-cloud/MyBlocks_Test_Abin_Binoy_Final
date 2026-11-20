// migrations/20261120120230-create-apikey.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('api_keys', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'audio', 'video'),
        allowNull: false,
        defaultValue: 'text',
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      tokensUsed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      tokenLimit: {
        type: Sequelize.INTEGER,
        defaultValue: 1000000,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('api_keys');
    // Drop ENUM type explicitly for MySQL/MariaDB (if needed)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_api_keys_type";');
  },
};
