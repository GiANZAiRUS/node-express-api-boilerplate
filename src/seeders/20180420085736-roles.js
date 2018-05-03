'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', [{
        roleId: 1,
        role: 'Super Admin',
        parentId: 0,
        createdAt: mockDateTime(20),
        updatedAt: mockDateTime(20)
      }, {
        roleId: 2,
        role: 'Admin',
        parentId: 0,
        createdAt: mockDateTime(18),
        updatedAt: mockDateTime(20)
      }, {
        roleId: 3,
        role: 'User',
        parentId: 0,
        createdAt: mockDateTime(10),
        updatedAt: mockDateTime(20)
      }, {
        roleId: 4,
        role: 'Learner',
        parentId: 3,
        createdAt: mockDateTime(20),
        updatedAt: mockDateTime(20)
      }, {
        roleId: 5,
        role: 'Instructor',
        parentId: 3,
        createdAt: mockDateTime(20),
        updatedAt: mockDateTime(20)
      }
    ])
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Roles', null, {})
  }
};

const Moment = require('moment')

function mockDateTime(days) {
  return Moment().subtract(rand(days, days + 3), 'days')
                 .subtract(rand(), 'hours')
                 .subtract(rand(), 'minutes')
                 .subtract(rand(), 'seconds')
                 .format('YYYY-MM-DD HH:mm:ss')
}

function rand(min=0, max=60) {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min)) + min
}