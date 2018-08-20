'use strict'

const mongoose = require('mongoose')
const multer = require('multer');
const cloudinary = require('cloudinary');


  var storageRute = '';
  
  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, storageRute);
    },
    filename: function(req, file, cb) {
      cb(null, new Date().toISOString() + file.originalname);
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

  const up = (req, res) => {
    console.log(req.body);
    
    cloudinary.v2.uploader.upload(req.body.promoImage, 
    function(error, result) {console.log(result, error)});

  }


module.exports = {
  upload,
  up
}
