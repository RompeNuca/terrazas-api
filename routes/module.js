'use strict'

const express = require('express');
const moduleCtrl = require('../controllers/module');
const auth = require('../middlewares/auth');

// const multer = require('multer');

const api = express.Router()
const allUsers = ['confirmed', 'guest', 'pro']

// Peticiones al servidor de modulos
api.get('https://comer-despierto.herokuapp.com/api/modules/:userId', auth.isAuth(allUsers), moduleCtrl.getModules)

// // Peticiones al servidor de modulo 
api.get('https://comer-despierto.herokuapp.com/api/module/:moduleId', moduleCtrl.getModule) // Auth compleja armada directamente en el controlador

// // Peticiones al servidor de usuario
// api.get('https://comer-despierto.herokuapp.com/api/token/:token', auth.isAuth(['confirmed', 'guest']), moduleCtrl.getUserByToken)


module.exports = api
