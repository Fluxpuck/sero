'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('command_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      command_name: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'commands',
          key: 'name'
        }
      },
      guildId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isNumeric: true
        }
      },
      executorId: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isNumeric: true
        }
      },
      commandOptions: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('command_logs', ['command_name']);
    await queryInterface.addIndex('command_logs', ['command_name', 'guildId']);
    await queryInterface.addIndex('command_logs', ['command_name', 'executorId']);
    await queryInterface.addIndex('command_logs', ['guildId', 'executorId']);
    await queryInterface.addIndex('command_logs', ['guildId', 'executorId', 'command_name']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('command_logs');
  }
};
