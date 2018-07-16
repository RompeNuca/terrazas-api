'use strict'

const express = require('express');
const productCtrl = require('../controllers/product');
const userCtrl = require('../controllers/user');
const auth = require('../middlewares/auth');

// const multer = require('multer');

const api = express.Router()


// Envios al servidor de Nuevo usuario
api.post('/signup', userCtrl.signUp)

// Envios al servidor de Usuario para verificar el log
api.post('/signin', userCtrl.signIn)

// Peticiones al servidor de usuarios
api.get('/users', auth.isAuth, userCtrl.getUsers)

// Peticiones al servidor de usuario
api.get('/user/:userId', auth.isAuth, userCtrl.getUser)


module.exports = api
