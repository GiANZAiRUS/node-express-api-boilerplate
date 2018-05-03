'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      user('Super Admin', 'User', 'superadmin@email.com', 1, mockDateTime(20)),
      user('Admin', 'User', 'admin@email.com', 2, mockDateTime(16)),
      user('Default', 'User', 'user@email.com', 3, mockDateTime(12)),
      user('Referrer', 'User', 'referrer@email.com', 4, mockDateTime(8)),
      user('Redirect', 'User', 'redirect@email.com', 4, mockDateTime(4)),
      user('Blocked', 'User', 'blocked@email.com', 5, mockDateTime(0), 'blocked'),
    ], {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}

const BCrypt = require('bcrypt')
const Moment = require('moment')

function user(firstName, lastName, email, roleId, date, status='active') {
  const salt = BCrypt.genSaltSync(10)
  const password = BCrypt.hashSync('password', salt)
  const newDate = new Date(date)
  const data = {
    firstName,
    lastName,
    email,
    roleId,
    password,
    status,
    createdAt: newDate,
    updatedAt: newDate
  }

  console.log('[User] ', data)

  return data
}

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
