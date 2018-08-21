'use strict'

const config = require('../config');
const mongoose = require('mongoose');
const moment = require('moment');

const Section = require('../models/section');
const Category = require('../models/category');

const services = require('../services');
const fs = require('fs');
const cloudPath = 'api-demo/sections/'

function getSimpleSections (req, res) {
  Section.find()
        .select(`name`)
        .then(sections => {
    res.status(200).send({ sections })
  })
}

function getSections (req, res) {

 Section.find({}, (err, el) => {
   if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
   if (!el) return res.status(404).send({message: `No hay Secciones`})

   let sectionsOrder = el.sort(function (a, b) {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
   })
   res.status(200).send({ sectionsOrder, message: 'Secciones cargadas con exito' })
 })

}

function getSection (req, res) {

  let sectionId = req.params.sectionId

  Section.findById(sectionId, (err, section) => {
    if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
    if (!section) return res.status(404).send({message: `El seccion no existe`})

    res.status(200).send({ section })
  })

}

function saveSection (req, res) {

  let section = new Section()
  section._id = req.body._id,
  section.name = req.body.name
  section.info = req.body.info
  section.extra = req.body.extra
  if (req.file) {
  section.sectionImage = req.file.path
  }

  //Guardar el section en su coleccion
  section.save((err, sectionSectiond) => {
    if (err) res.status(500).send({
      message: `Error al salvar el seccion, ${err}`
    })
    res.status(200).send({
      message: `El seccion se creo correctamente`
    })
  })

}

function updateSection(req, res) {

  let section = req.body;
  let updateId = req.params.sectionId;

  if (req.file) {
    section.sectionImage = req.file.path
  }

  Section.findByIdAndUpdate(updateId, section)
      .select(`_id name sectionImage`)
      .exec(function(err, item) {
          if (err) res.status(500).send({ message: `Error al buscar del seccion, ${err}` })
          if (!section) return res.status(404).send({ message: `El seccion no existe` })
          console.log(item);
          //Manejo de imagenes

          //Actualizar las imagenes
          if (section.sectionImage && section.sectionImage !== 'delete') {
            services.updateFile(updateId, section.sectionImage, item.sectionImage, (err) => {
                if (err) res.status(500).send({ message: `Error al actualizar la imagen del seccion, ${err}` })
            });
          }

          //Elimina las imagenes
          if (section.sectionImage == 'delete' && item.sectionImage !== 'delete') {
              fs.unlink(item.sectionImage, (err) => {
                  if (err) res.status(500).send({ message: `Error al borrar la imagen del seccion, ${err}` })
                      // console.log(`La imagen ${item.sectionImage} fue eliminada`);
              });
          }

          res.status(200).send({ section: section })
      })
  }

function deleteSection (req, res) {

  let sectionId = req.params.sectionId

  Section.findById(sectionId, (err, section) => {

    if (err) res.status(500).send({message: `Error al borrar el seccion, ${err}`})
    if (!section) return res.status(404).send({message: `El seccion no existe`})

    //Borrar la imagen del seccion si es que existe
    if (section.sectionImage && section.sectionImage !== 'delete') {
      let file = section.sectionImage
      fs.unlink(file, (err) => {
        if (err) res.status(500).send({message: `Error al borrar el sectionImage del seccion, ${err}`})
        // console.log('el sectionImage del seccion fue eliminado');
      });
    }

    //Borrar el seccion en su coleccion
    section.remove(err => {
      if (err) res.status(500).send({message: `Error al borrar el seccion, ${err}`})
      res.status(200).send({menssage: `El seccion a sido eliminado`})
    })

  })

}


module.exports = {
  getSimpleSections,
  getSections,
  getSection,
  saveSection,
  updateSection,
  deleteSection
}
