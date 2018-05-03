'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Users', 'roleId', {type: 'INTEGER USING CAST("roleId" as INTEGER)'})
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Users', 'roleId')
    ])
  }
};
