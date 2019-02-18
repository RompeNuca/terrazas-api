'use strict'

const express = require('express');
const userCtrl = require('../controllers/user');
const auth = require('../middlewares/auth');

// const multer = require('multer');

const api = express.Router()

// Envios al servidor de Nuevo usuario
api.post('https://comer-despierto.herokuapp.com/api/signup', userCtrl.signUp)

// Verifica la cuenta
api.get('https://comer-despierto.herokuapp.com/api/confirmedpassword/:token', userCtrl.confirmed)

// Recuperar contrasena
api.post('https://comer-despierto.herokuapp.com/api/reqrecover', userCtrl.requestRecoverPassword) // solicita
api.post('https://comer-despierto.herokuapp.com/api/recover', userCtrl.recover) // autoriza

// Log In
api.post('https://comer-despierto.herokuapp.com/api/signin', userCtrl.signIn)

// Edit
api.post('https://comer-despierto.herokuapp.com/api/user/edit/:userId', auth.isAuth(['confirmed', 'guest', 'pro']), userCtrl.editUser)
api.post('https://comer-despierto.herokuapp.com/api/user/finished/:userId', auth.isAuth(['confirmed', 'guest', 'pro']), userCtrl.finishedModule)

// Peticiones al servidor de usuarios
api.get('https://comer-despierto.herokuapp.com/api/users', auth.isAuth(['admin']), userCtrl.getUsers)

// Peticiones al servidor de usuario
api.get('https://comer-despierto.herokuapp.com/api/user/:userId', auth.isAuth(['confirmed', 'guest', 'pro']), userCtrl.getUser)

// Peticiones al servidor de usuario
api.get('https://comer-despierto.herokuapp.com/api/token/:token', auth.isAuth(['confirmed', 'guest', 'pro']), userCtrl.getUserByToken)


module.exports = api
