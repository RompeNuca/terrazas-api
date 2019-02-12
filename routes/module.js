'use strict'

const express = require('express');
const moduleCtrl = require('../controllers/module');
const auth = require('../middlewares/auth');

// const multer = require('multer');

const api = express.Router()


// Peticiones al servidor de modulos
api.get('/modules', auth.isAuth(['confirmed', 'guest', 'pro']), moduleCtrl.getModules)

// // Peticiones al servidor de usuario
// api.get('/user/:userId', auth.isAuth(['confirmed', 'guest']), moduleCtrl.getUser)

// // Peticiones al servidor de usuario
// api.get('/token/:token', auth.isAuth(['confirmed', 'guest']), moduleCtrl.getUserByToken)


module.exports = api
