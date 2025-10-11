module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Rules', [
      {
        domain: 'youtube.com',
        action: 'block',
        start_time: '22:00:00',
        end_time: '06:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Rules', null, {});
  }
};