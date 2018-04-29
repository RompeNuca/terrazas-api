'use strict'

const Product = require('../models/product');


 function getProducts (req, res) {

  Product.find({}, (err, products) => {
    if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
    if (!products) return res.status(404).send({message: `No hay productos`})

    res.status(200).send({ products })
  })

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
  product.picture = req.body.picture
  product.price = req.body.price
  product.category = req.body.category
  product.description = req.body.description

  product.save((err, productStored) =>{
    if (err) res.status(500).send({message: `Error al salvar el producto, ${err}`})
    res.status(200).send({product: productStored})
  })

}

function updateProduct (req, res) {

  let productId = req.params.productId
  let update = req.body

  Product.findByIdAndUpdate(productId, update, (err, productUpdate) => {

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
  deleteProduct,
}
