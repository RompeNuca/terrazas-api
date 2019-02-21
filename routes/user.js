'use strict'

const express = require('express');
const userCtrl = require('../controllers/user');
const auth = require('../middlewares/auth');

// const multer = require('multer');

const api = express.Router()

const allUsers = ['admin', 'confirmed', 'confirmedPlus', 'guest', 'pro']

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
api.patch('/user/edit/:userId', auth.isAuth(['admin', 'guest']), userCtrl.editUser)
api.post('/user/finished/:userId', auth.isAuth(allUsers), userCtrl.finishedModule)
api.post('/user/payMessage/:userId', auth.isAuth(allUsers), userCtrl.payMessage)

// Delete User
api.delete('/user/delete/:userId', userCtrl.deleteUser)

// Peticiones al servidor de usuarios
api.get('/users', auth.isAuth(['admin']), userCtrl.getUsers)

// Peticiones al servidor de usuario
api.get('/user/:userId', auth.isAuth(allUsers), userCtrl.getUser)

// Peticiones al servidor de usuario
api.get('/token/:token', auth.isAuth(allUsers), userCtrl.getUserByToken)


module.exports = api
