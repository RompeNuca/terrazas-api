'use strict'

const express = require('express');
const config = require('../config');
const storeCtrl = require('../controllers/store');
const auth = require('../middlewares/auth');
const multer = require('multer');

const api = express.Router()

//Multer Setings //Quiza es necesario recibir el id desde el front para guardar
//el nombre de las imagenes junto a este.

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './upload/stores/');
  },
  filename: function(req, file, cb) {
    if (req.params.storeId) {
      console.log(req.params.storeId);
      cb(null, `${req.params.storeId}-${file.originalname.replace(/ /g, '-')}`);
    } else {
      cb(null, `${req.body._id}-${file.originalname.replace(/ /g, '-')}`);
    }
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'
      || file.mimetype === 'image/gif' || file.mimetype === 'application/octet-stream') {
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

api.get('/' , storeCtrl.getStores)

api.get('/simple' , storeCtrl.getSimpleStores)

api.get('/:storeId' , storeCtrl.getStore)

api.post('/', upload.single('logo'), storeCtrl.saveStore)

api.patch('/:storeId' ,  upload.single('logo'), storeCtrl.updateStore)

api.delete('/:storeId' , storeCtrl.deleteStore)

module.exports = api
