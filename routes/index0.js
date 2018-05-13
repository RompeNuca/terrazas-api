'use strict'

const express = require('express');
const productCtrl = require('../controllers/product');
const userCtrl = require('../controllers/user');
const eventCtrl = require('../controllers/event');
const promoCtrl = require('../controllers/promo');
const auth = require('../middlewares/auth');

const multer = require('multer');

const api = express.Router()


//Multer Setings
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './upload/');
  },
  filename: function(req, file, cb) {


    cb(null,file.originalname);
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



// Peticiones al servidor de productos
api.get('/product', productCtrl.getProducts)

// Peticione al servidor de un producto en concreto
api.get('/product/:productId', productCtrl.getProduct)

// Envios al servidor de productos
api.post('/product', upload.single('productImage') ,productCtrl.saveProduct)

// Edicion de productos en el servidor
api.patch('/product/:productId', upload.single('productImage') , productCtrl.updateProduct)

// Eliminacion de productos en el servidor
api.delete('/product/:productId', productCtrl.deleteProduct)

// Envios al servidor de Nuevo usuario
api.post('/signup', userCtrl.signUp)

// Envios al servidor de Usuario para verificar el log
api.post('/signin', userCtrl.signIn)

// Ruta privada para probar permisos de usuarios
api.get('/private', auth.isAuth , auth.isPro , userCtrl.privado)

// Peticiones al servidor de usuarios
api.get('/users', auth.isAuth, userCtrl.getUsers)

// Peticiones al servidor de eventos
api.get('/events' , eventCtrl.getValidEvents)
api.post('/event' , eventCtrl.saveEvent)


module.exports = api
