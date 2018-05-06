'use strict'

const mongoose = require('mongoose')
const multer = require('multer');


function uploadFile ( req, res, next) {
  var imgKey = 'productImage'

  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/');
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


  upload.single(imgKey)

  next()


};

module.exports = {
  uploadFile
}
