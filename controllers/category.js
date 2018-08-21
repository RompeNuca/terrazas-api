'use strict'

const config = require('../config');
const mongoose = require('mongoose');
const moment = require('moment');

const Category = require('../models/category');
const Store = require('../models/store');

const services = require('../services');
const fs = require('fs');
const categoryPath = 'api-demo/categorys/'

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
  category.categoryImage = config.domain + config.port + '/' + req.file.path
  }

  category.stores = []
  if (req.body.stores) {
  category.stores = req.body.stores
  }

  //Sube la imagen a el cloud
  services.uploadFileCloud ( category.categoryImage, categoryPath, wow => {
    //Espera que la imagen suba y despues...
    if (wow == 'err') res.status(500).send({message: `Error al guardar la imagen en la nube`})

    //guarda el path de la imagen ya cargada en la nube
    if (wow) {
      category.categoryImage = wow

      //Borra el archivo de la carpeta temporal
      let fileRute = req.file.path;
      fs.unlink(fileRute, (err) => {
        if (err) res.status(500).send({message: `Error al borrar la imagen temporal de la category, ${err}`})
      });
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
  })



  // Guardar el id del category en los locales elegidos
  if (category.stores && category.stores !== []) {
    for (var i = 0; i < category.stores.length; i++) {
      Store.findByIdAndUpdate(category.stores[i], {
        $push: { category: mongoose.Types.ObjectId(category._id) }
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
    category.categoryImage = config.domain + config.port + '/' + req.file.path
  }

  services.uploadFileCloud(category.categoryImage, categoryPath, (wow)=>{
    if (wow) {
      category.categoryImage = wow
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


          //Actualizar las imagenes
          if (category.categoryImage && category.categoryImage !== 'delete') {
            services.deleteFileCloud(item.categoryImage, categoryPath, () => {})
          }

          res.status(200).send({ category: category })
      })
    })
  }

function deleteCategory (req, res) {

  let categoryId = req.params.categoryId

  // Busca el local
  Category.findById(categoryId, (err, category) => {

    if (err) res.status(500).send({message: `Error al borrar el local, ${err}`})
    if (!category) return res.status(404).send({message: `La categoria no existe`})

    //Borrar la imagen de la category si es que existe
    if (category.categoryImage && category.categoryImage !== 'delete') {

      let fileRute = category.categoryImage
      let matchCloud = category.categoryImage.substr(0,config.cloudDomain.length) 

      if (matchCloud == config.cloudDomain) {
        services.deleteFileCloud(fileRute, categoryPath,  (err) => {
          if (err) res.status(500).send({message: `Error al borrar la imagen de la category en la nube, ${err}`})
          // console.log('la imagen de la category fue eliminada');
        });
      }else{
        fs.unlink(fileRute, (err) => {
          if (err) res.status(500).send({message: `Error al borrar la imagen de la category, ${err}`})
          // console.log('la imagen de la category fue eliminada');
        });
      }
    }

    if (category.stores && category.stores !== []) {
      //Borrar el local de las categorias en los que existe
      for (var i = 0; i < category.stores.length; i++) {
        if (category.stores[i]) {
          Store.findByIdAndUpdate(category.stores[i], {
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
