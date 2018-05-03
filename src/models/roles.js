'use strict';
export default (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
    roleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role: DataTypes.STRING
  })
  Roles.associate = function(models) {
    // associations can be defined here
    Roles.hasOne(models.User, {
      as: 'Role',
      foreignKey: 'roleId'
    })
  }
  return Roles
}
