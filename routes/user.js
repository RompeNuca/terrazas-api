'use strict'

const express = require('express');
const userCtrl = require('../controllers/user');
const auth = require('../middlewares/auth');

// const multer = require('multer');

const api = express.Router()

// Envios al servidor de Nuevo usuario
api.post('/signup', userCtrl.signUp)

// Verifica la cuenta
api.get('/confirmedpassword/:token', userCtrl.confirmed)

// Recuperar contrasena
api.post('/reqrecover', userCtrl.requestRecoverPassword) // solicita
api.post('/recover', userCtrl.recover) // autoriza

// Log In
api.post('/signin', userCtrl.signIn)

// Edit
api.post('/user/edit/:userId', auth.isAuth(['confirmed', 'guest', 'pro']), userCtrl.editUser)
api.post('/user/finished/:userId', auth.isAuth(['confirmed', 'guest', 'pro']), userCtrl.finishedModule)

// Peticiones al servidor de usuarios
api.get('/users', auth.isAuth(['admin']), userCtrl.getUsers)

// Peticiones al servidor de usuario
api.get('/user/:userId', auth.isAuth(['confirmed', 'guest', 'pro']), userCtrl.getUser)

// Peticiones al servidor de usuario
api.get('/token/:token', auth.isAuth(['confirmed', 'guest', 'pro']), userCtrl.getUserByToken)


module.exports = api
