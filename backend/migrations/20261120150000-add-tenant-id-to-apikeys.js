'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('api_keys');
    if (!table.tenant_id) {
      await queryInterface.addColumn('api_keys', 'tenant_id', {
        type: Sequelize.UUID,
        allowNull: true,
        after: 'id',
      });
    }
    await queryInterface.addConstraint('api_keys', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_api_keys_tenant',
      references: { table: 'tenants', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    }).catch((error) => {
      if (!/Duplicate key|already exists/i.test(error.message)) throw error;
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('api_keys');
    if (table.tenant_id) await queryInterface.removeColumn('api_keys', 'tenant_id');
  },
};
