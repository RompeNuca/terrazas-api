'use strict'


const express = require('express');
const productCtrl = require('../controllers/product');
const userCtrl = require('../controllers/user');
const eventosCtrl = require('../controllers/eventos');
const auth = require('../middlewares/auth');
const vigencia = require('../middlewares/vigencia');
const multer = require('multer');

const api = express.Router()

//Multer Setings
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './upload/');
  },
  filename: function(req, file, cb) {
    cb(null, /* new Date().toISOString() + */file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1600 * 1600 * 5
  },
  fileFilter: fileFilter
});

const imageKey = 'productImage'



// Peticiones al servidor de productos
api.get('/product', productCtrl.getProducts)

// Peticione al servidor de un producto en concreto
api.get('/product/:productId', productCtrl.getProduct)

// Envios al servidor de productos probado con Postman
api.post('/product', upload.single(imageKey) ,productCtrl.saveProduct)

// Edicion de productos en el servidor
api.patch('/product/:productId', upload.single(imageKey) , productCtrl.updateProduct)

// Eliminacion de productos en el servidor
api.delete('/product/:productId', productCtrl.deleteProduct)

api.post('/signup', userCtrl.signUp)

api.post('/signin', userCtrl.signIn)

// Ruta privada para probar permisos de usuarios
api.get('/private', auth.isAuth , auth.isPro , userCtrl.privado)

// Peticiones al servidor de usuarios
api.get('/users', auth.isAuth, userCtrl.getUsers)

api.get('/eventos' , eventosCtrl.getEventos)

module.exports = api
