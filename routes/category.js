'use strict'

const express = require('express');
const config = require('../config');
const categoryCtrl = require('../controllers/category');
const auth = require('../middlewares/auth');
const multer = require('multer');

const api = express.Router()

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './upload/category/');
  },
  filename: function(req, file, cb) {
    if (req.params.categoryId) {
      cb(null, `${req.params.categoryId}-${file.originalname.replace(/ /g, '-')}`);
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

api.get('/' , categoryCtrl.getCategorys)

api.get('/simple' , categoryCtrl.getSimpleCategorys)

api.get('/:categoryId' , categoryCtrl.getCategory)

api.post('/', upload.single('categoryImage'), categoryCtrl.saveCategory)

api.patch('/:categoryId' ,  upload.single('categoryImage'), categoryCtrl.updateCategory)

api.delete('/:categoryId' , categoryCtrl.deleteCategory)

module.exports = api
