module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Rules', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      domain: { type: Sequelize.STRING, allowNull: false },
      action: { type: Sequelize.ENUM('allow', 'block'), allowNull: false },
      start_time: { type: Sequelize.TIME, allowNull: true },
      end_time: { type: Sequelize.TIME, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Rules');
  }
};