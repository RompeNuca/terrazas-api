'use strict'

const config = require('../config');
const mongoose = require('mongoose');
const moment = require('moment');

const Category = require('../models/category');
const Store = require('../models/store');

const services = require('../services');
const fs = require('fs');

function getSimpleCategorys (req, res) {
  Category.find()
        .select(`name`)
        .then(categorys => {
    res.status(200).send({ categorys })
  })
}

function getCategorys (req, res) {

 Category.find({}, (err, el) => {
   if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
   if (!el) return res.status(404).send({message: `No hay Categorias`})

   let categorysOrder = el.sort(function (a, b) {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
   })

   res.status(200).send({ categorysOrder, message: 'Categorias cargadas con exito' })
 })

}

function getCategory (req, res) {

  let categoryId = req.params.categoryId

  Category.findById(categoryId, (err, category) => {
    if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
    if (!category) return res.status(404).send({message: `La categoria no existe`})

    res.status(200).send({ category })
  })

}

function saveCategory (req, res) {

  let category = new Category()
  category._id = req.body._id
  category.name = req.body.name
  category.info = req.body.info
  category.state = req.body.state
  category.categoryImage = ''
  if (req.file) {
  category.categoryImage = req.file.path
  }

  category.stores = []
  if (req.body.stores) {
  category.stores = req.body.stores
  }


  //Guardar el category en su coleccion
  category.save((err, categoryStored) => {
    if (err) res.status(500).send({
      message: `Error al salvar el local, ${err}`
    })
    res.status(200).send({
      message: `La categoria se creo correctamente`
    })
  })

  // Guardar el id del category en los locales elegidos
  if (category.stores && category.stores !== []) {
    for (var i = 0; i < category.stores.length; i++) {
      Categoy.findByIdAndUpdate(category.stores[i], {
        $push: { categorys: mongoose.Types.ObjectId(categorys._id) }
      }, (err, item) => {
        if (err)   return res.status(500).send({ message: `Error al actualizar la category con el local, ${err}` })
        if (!item) return res.status(404).send({ message: `El evento no existe` })
      })
    }
  }

}

function updateCategory(req, res) {

  let category = req.body;
  let updateId = req.params.categoryId;

  if (!category.stores) {
    category.stores = []
  }

  if (req.file) {
    category.categoryImage = req.file.path
  }

  Category.findByIdAndUpdate(updateId, category)
      .select(`_id name stores categoryImage`)
      .exec(function(err, item) {
          if (err) res.status(500).send({ message: `Error al buscar del local, ${err}` })
          if (!category) return res.status(404).send({ message: `La categoria no existe` })

          let categoryLastStores = item.stores
          let categoryNewStores = categoryLastStores

          if (!Array.isArray(req.body.stores)) {
              categoryNewStores = [req.body.stores]
          } else {
              categoryNewStores = req.body.stores;
          }

          //Actualiza los ids de los categorys dentro de las categorys

          if (categoryLastStores !== categoryNewStores) {
              for (var i = 0; i < categoryLastStores.length; i++) {
                  Store.findByIdAndUpdate(categoryLastStores[i], { $pull: { category: mongoose.Types.ObjectId(item._id) } },
                      function(err, ok) {})
              }
              for (var f = 0; f < categoryNewStores.length; f++) {
                  Store.findByIdAndUpdate(categoryNewStores[f], { $push: { category: mongoose.Types.ObjectId(item._id) } },
                      function(err, ok) {})
              }
          }

          //Manejo de imagenes

          //Actualizar las imagenes
          if (category.categoryImage && category.categoryImage !== 'delete') {
            services.updateFile(updateId, category.categoryImage, item.categoryImage, (err) => {
                if (err) res.status(500).send({ message: `Error al actualizar la imagen del local, ${err}` })
            });
          }

          //Elimina las imagenes
          if (category.categoryImage == 'delete' && item.categoryImage !== 'delete') {
              fs.unlink(item.categoryImage, (err) => {
                  if (err) res.status(500).send({ message: `Error al borrar la imagen del local, ${err}` })
                      // console.log(`La imagen ${item.categoryImage} fue eliminada`);
              });
          }

          res.status(200).send({ category: category })
      })
  }

function deleteCategory (req, res) {

  let categoryId = req.params.categoryId

  // Busca el local
  Category.findById(categoryId, (err, category) => {

    if (err) res.status(500).send({message: `Error al borrar el local, ${err}`})
    if (!category) return res.status(404).send({message: `La categoria no existe`})

    //Borrar la imagen del local si es que existe
    if (category.categoryImage && category.categoryImage !== 'delete') {
      let file = category.categoryImage
      fs.unlink(file, (err) => {
        if (err) res.status(500).send({message: `Error al borrar el categoryImage del local, ${err}`})
        // console.log('el categoryImage del local fue eliminado');
      });
    }

    if (category.stores && category.stores !== []) {
      //Borrar el local de las categorias en los que existe
      for (var i = 0; i < category.stores.length; i++) {
        if (category.stores[i]) {
          Category.findByIdAndUpdate(category.stores[i], {
            $pull: {
              stores: mongoose.Types.ObjectId(category._id)
            }
          }, function(err, category) {
            if (err) return res.status(500).send({
              message: `Error al actualizar la categoria, ${err}`
            })
            if (!category) return res.status(404).send({
              message: `La categoria no existe`
            })
          })
        }
      }
    }

    //Borrar el local en su coleccion
    category.remove(err => {
      if (err) res.status(500).send({message: `Error al borrar el local, ${err}`})
      res.status(200).send({menssage: `La categoria a sido eliminado`})
    })

  })

}


module.exports = {
  getSimpleCategorys,
  getCategorys,
  getCategory,
  saveCategory,
  updateCategory,
  deleteCategory
}
