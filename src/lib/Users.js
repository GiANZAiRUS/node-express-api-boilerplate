import _ from 'lodash'
import BCrypt from 'bcrypt'
import DB from '../models'
import JWT from 'jsonwebtoken'

import * as Paths from '../lib/Paths'
import { filters, pageCount, orderBy } from '../helpers/ActiveRecord'
import { rand } from '../helpers/Math'

const FILTER_OPTIONS = {
  userId:   { type: 'integer' },
  dateFrom: { col: 'createdAt', type: 'minDate' },
  dateTo:   { col: 'createdAt', type: 'maxDate' },
  regexp:   ['firstName', 'lastName']
}
const INCLUDE_PATHS = {
  model: DB.Path,
  as: 'Paths'
}

const INCLUDE_ROLES = {
  model: DB.Roles,
  as: 'Role',
  required: true
}
export function list(options) {
  const { res, query, returnData, jsonData } = options
  const { filtered, sorted, limit, page } = query

  return DB.User
    .findAll({
      where: filters(filtered, FILTER_OPTIONS),
      exclude: ['password'],
      include: [INCLUDE_PATHS, INCLUDE_ROLES],
      offset: (page - 1) * limit,
      limit,
      order: orderBy(sorted, ['userId', 'asc'])
    })
    .then(Users => {
      const data = jsonData ? jsonUsers(Users) : Users

      if (returnData) return data

      return res.status(data ? 200 : 404).send(data)
    })
    .catch(error => {
      console.log(error)

      return returnData ? error : res.status(400).send(error)
    })
}

export function pages({ query }) {
  return DB.User
    .count({
      col: 'userId',
      where: filters(query.filtered, FILTER_OPTIONS),
      include: [INCLUDE_PATHS, INCLUDE_ROLES]
    })
    .then(count => {
      return pageCount(query, count)
    })
}

export function find(options) {
  const { res, where, returnData } = options

  return DB.User
    .findOne({ where,
      include: [INCLUDE_PATHS, INCLUDE_ROLES]
    })
    .then(User => {
      const json = User ? jsonUser(User) : null

      if (returnData) return { object: User, json }

      return res.status(User ? 200 : 404).send(json)
    })
    .catch(error => {
      console.log(error)

      return returnData ? error : res.status(400).send(error)
    })
}

export function create(options) {
  const { res, body } = options
  const { firstName, lastName, email, role, redirect, status, allowedPaths, excludedPaths } = body

  find({
      res,
      where: { email },
      returnData: true
    })
    .then(User => {
      if (User.object)
        return res.status(401).send({ message: 'Email already exists.'})

      const randomPwd = rand(111111, 999999)
      const salt = BCrypt.genSaltSync(10)
      const password = BCrypt.hashSync(randomPwd.toString(), salt)
      
      DB.User
        .create({
          firstName,
          lastName,
          email,
          roleId: role,
          password,
          status,
          redirect,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .then(User => {

          return Paths.create({
            res,
            body,
            userId: User.userId
          })
        })
        .catch(error => {
          console.log(error)

          return res.status(400).send(error)
        })
    })
}

export function signUp(req, res) {
  // const { res, body } = options
  let status = 200, data = {}

  const { firstName, lastName, role, email, password } = verifyToken(res, { token: req.body.token, returnData: true })
      const salt = BCrypt.genSaltSync(10)
      const pwd = BCrypt.hashSync(password.toString(), salt)


  find({
      res,
      where: { email },
      returnData: true
    })
    .then(User => {
      if(User.object)

        return (
          res.status(400).send({message: 'Email already exists.'})
          )

      DB.User
        .create({
          firstName,
          lastName,
          email,
          roleId: role,
          password: pwd,
          status:'active',
          redirect: '',
          createdAt: new Date(),
          updatedAt: new Date()

        })
        .then(User =>{

            const userId = User.userId
            const value = {"allowedPaths": ["/my-profile", "/admin", "/admin/dashboard", "/admin/users", "/admin/users/:userId", "/admin/settings"], "exludedPaths": []}

            DB.Path
              .create({ userId, value })
              .then(Path => {
                const data = Path ? { userId } : null

                return res.status(Path ? 201 : 400).send(data)
              })
              .catch(error => {
                console.log(error)

                res.status(400).send(error)
              })

        })
        .catch(error =>{
          console.log(error)

          return(
            res.status(400).send(error)
            )
        })




    })
}

export function update(options) {
  const { res, userId, body } = options
  const { firstName, lastName, email, role, status, redirect, allowedPaths, excludedPaths } = body
  find({
      res,
      where: { email },
      returnData: true
    })
    .then(User => {
      if (User.object !== null && User.object.userId !== parseInt(userId))
        return res.status(401).send({ message: 'Email already exists.'})

      DB.User
        .update({
          firstName,
          lastName,
          email,
          roleId: role,
          status,
          redirect,
          updatedAt: new Date()
        }, {
          where: { userId }
        })
        .then(User => {
          return Paths.update({
            res,
            body,
            userId
          })
        })
        .catch(error => {
          console.log(error)

          return res.status(400).send(error)
        })
    })
    .catch(error => {
      console.log(error)

      return res.status(400).send(error)
    })
}

export function destroy(options) {
  const { res, userId } = options

  find({
      res,
      where: { userId },
      returnData: true
    })
    .then(User => {
      DB.User
        .destroy({ where: { userId } })
        .then(() => {
          return res.status(200).send()
        })
        .catch(error => {
          console.log(error)

          return res.status(400).send(error)
        })
    })
    .catch(error => {
      console.log(error)

      return res.status(400).send(error)
    })
}

function jsonUsers(Users) {
  return _.map(Users, User => {
      return jsonUser(User)
    })
}

function verifyToken(res, { token, returnData }) {
  return JWT.verify(
    token,
    process.env.JWT_SECRET,
    function(errors, decoded) {
      if (errors) return returnData ? {} : res.status(401).end()

      return decoded
    }
  )
}

function jsonUser(User) {
  const { allowedPaths, excludedPaths } = User.Paths.value

  return {
    userId: User.userId,
    firstName: User.firstName,
    lastName: User.lastName,
    email: User.email,
    role: User.Role.roleId,
    roleName: User.Role.role,
    status: User.status,
    redirect: User.redirect,
    createdAt: User.createdAt,
    allowedPaths,
    excludedPaths
  }
}
