'use strict'

const express = require('express');
const config = require('../config');
const sectionCtrl = require('../controllers/section');
const auth = require('../middlewares/auth');
const multer = require('multer');

const api = express.Router()

//Multer Setings //Quiza es necesario recibir el id desde el front para guardar
//el nombre de las imagenes junto a este.

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './upload/sections/');
  },
  filename: function(req, file, cb) {
    if (req.params.sectionId) {
      console.log('cae');
      cb(null, `${req.params.sectionId}-${file.originalname.replace(/ /g, '-')}`);
    } else {
      cb(null, `${req.body._id}-${file.originalname.replace(/ /g, '-')}`);
    }
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
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

api.get('/' , auth.isAuth, sectionCtrl.getSections)

api.get('/simple' , sectionCtrl.getSimpleSections)

api.get('/:sectionId' , auth.isAuth, sectionCtrl.getSection)

api.post('/', upload.single('sectionImage'), sectionCtrl.saveSection)

api.patch('/:sectionId' ,  upload.single('sectionImage'), sectionCtrl.updateSection)

api.delete('/:sectionId' , auth.isAuth, sectionCtrl.deleteSection)

module.exports = api
