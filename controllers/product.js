'use strict'

const config = require('../config');
const mongoose = require('mongoose');
const Product = require('../models/product');
const fs = require('fs');

 function getProducts (req, res) {

  Product.find({}, (err, products) => {
    if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
    if (!products) return res.status(404).send({message: `No hay productos`})

  }).select("name price _id productImage")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: "GET",
              url: `${config.domain}${config.port}${doc._id}`
            }
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });

}

function getProduct (req, res) {

  let productId = req.params.productId

  Product.findById(productId, (err, product) => {
    if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
    if (!product) return res.status(404).send({message: `El producto no existe`})

    res.status(200).send({ product })
  })

}

function saveProduct (req, res) {

  console.log('POST /api/product');
  console.log(req.body);

  let product = new Product()
  product.name = req.body.name
  product.productImage = req.file.path
  product.price = req.body.price
  product.category = req.body.category
  product.description = req.body.description

  product.save((err, productStored) =>{
    if (err) res.status(500).send({message: `Error al salvar el producto, ${err}`})
    res.status(200).send({product: productStored})
  })

}


function updateProduct (req, res) {

  let product = req.body;
  let updateId = req.params.productId;
  let imageNew
  var imageLast


  if (req.file) {

      imageNew = req.file.path;
      product.productImage = imageNew;

    Product.findOne({ _id: updateId }).select('_Id name productImage').exec(function (err, item) {

      imageLast = item.productImage

      if (imageLast !== imageNew) {
        fs.unlink(imageLast, (err) => {
          if (err) throw err;
          console.log('la imagen fue modificada');
        });
      }else {
        console.log('la imagen es la misma');
      }
    });

  }

  Product.findByIdAndUpdate( updateId, product, (err, productUpdate) => {

    if (err) return res.status(500).send({message: `Error al actualizar el producto, ${err}`})
    if (!productUpdate) return res.status(404).send({message: `El producto no existe`})

    res.status(200).send({ product: productUpdate })
  })
}


function deleteProduct (req, res) {

  let productId = req.params.productId


  Product.findById(productId, (err, product) => {
    if (err) res.status(500).send({message: `Error al rborrar el producto, ${err}`})
    if (!product) return res.status(404).send({message: `El producto no existe`})

    fs.unlink(product.productImage, (err) => {
      if (err) throw err;
      console.log('la imagen fue eliminada');
    });

    product.remove(err => {
      if (err) res.status(500).send({message: `Error al rborrar el producto, ${err}`})
      res.status(200).send({menssage: `El producto a sido eliminado`})
    })
  })

}

module.exports = {
  getProducts,
  getProduct,
  saveProduct,
  updateProduct,
  deleteProduct
}
