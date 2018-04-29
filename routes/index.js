'use strict'

const express = require('express');
const productCtrl = require('../controllers/product');
const userCtrl = require('../controllers/user');
const auth = require('../middlewares/auth');


const api = express.Router()


// Peticiones al servidor de productos
api.get('/product', productCtrl.getProducts)

// Peticione al servidor de un producto en concreto
api.get('/product/:productId', productCtrl.getProduct)

// Envios al servidor de productos probado con Postman
api.post('/product', productCtrl.saveProduct)

// Edicion de productos en el servidor
api.put('/product/:productId', productCtrl.updateProduct)

// Eliminacion de productos en el servidor
api.delete('/product/:productId', productCtrl.deleteProduct)

api.post('/signup', userCtrl.signUp)

api.post('/signin', userCtrl.signIn)

// Ruta privada para probar permisos de usuarios
api.get('/private', auth , userCtrl.privado)

// Peticiones al servidor de usuarios
api.get('/users', userCtrl.getUsers)


module.exports = api
