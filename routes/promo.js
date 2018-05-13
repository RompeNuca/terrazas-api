'use strict'


const express = require('express');
const promoCtrl = require('../controllers/promo');
const auth = require('../middlewares/auth');
const multer = require('multer');

const api = express.Router()

//Multer Setings
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './upload/promos/');
  },
  filename: function(req, file, cb) {

    cb(null, req.params.promoId + ' ' + file.originalname);
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

api.get('/promos' , promoCtrl.getValidPromos)

api.get('/promo/:promoId' , promoCtrl.getValidPromo)

api.post('/promo' , upload.single('promoImage'), promoCtrl.savePromo)

api.patch('/promo/:promoId' , upload.single('promoImage'), promoCtrl.updatePromo)

api.delete('/promo/:promoId' , promoCtrl.deletePromo)

// module.exports = api
