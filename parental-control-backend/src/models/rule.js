module.exports = (sequelize, DataTypes) => {
  const Rule = sequelize.define('Rule', {
    domain: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.ENUM('allow', 'block'), allowNull: false },
    start_time: { type: DataTypes.TIME, allowNull: true },
    end_time: { type: DataTypes.TIME, allowNull: true }
  });
  return Rule;
};