'use strict'

const express = require('express');
const eventtCtrl = require('../controllers/eventt');
const auth = require('../middlewares/auth');
const multer = require('multer');

const api = express.Router()

//Multer Setings //Quiza es necesario recibir el id desde el front para guardar
//el nombre de las imagenes junto a este.

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './upload/eventt/');
  },
  filename: function(req, file, cb) {

    cb(null, `${req.body.name.replace(/ /g, '-')}-${file.originalname}`);
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

var cpUpload = upload.fields([{ name: 'eventtImage', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])

api.get('/' , eventtCtrl.getValidEventts)

api.post('/' , eventtCtrl.saveEventt)

api.patch('/:eventtId' , upload.single('eventtImage') , eventtCtrl.updateEventt)

module.exports = api
