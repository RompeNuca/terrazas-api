'use strict'
//ok
const mongoose = require('mongoose');
const Module = require('../models/module');
const User = require('../models/user');
const services = require('../services');
const config = require('../config');

function getModulesSimple (req, res) {

  Module.find({})
  .select('info name')
  .then(modules => {
    return res.status(200).send( {modules} )
  })
  .catch(err => {
    console.log(err);
    return res.status(404).send( err )
  })
}

function getModules (req, res) {
  let userId = req.params.userId

  User.findOne({ _id: userId })
  .select('progress wait type')
  .then(user =>{
    return Module.find({})
    .select('_id time type state name title')
    .then(modules => {
      return [ modules , user.progress, user.wait, user.type ]
    })
  })
  .then(data =>{
    let [modules, progress, wait, userType] = data

    let next = false;
    let time = new Date()
    wait = wait || time
    let calc = wait.getTime() - time.getTime()
    modules = modules.map(module => {

      let search = progress.filter( x => x.toString() === module._id.toString() )[0]

      if (search) {
        module.state = true
      }
      if (!next
        && !module.state
        && (userType == 'admin' || userType == 'pro' || userType == 'confirmed' ||  userType == 'confirmedPlus')
        && calc <= 0 )
      {
        module.state = true;
        next = true;
      }
      if (!next
        && !module.state
        && (userType == 'admin' || userType == 'pro'))
      {
        module.time = (calc > 0) ? calc : 0;
        next = true;
      }
      if (module.type !== 'free' 
        && ( userType == 'confirmed' ||  userType == 'confirmedPlus'))
      {
        module.state = false;   
      }
      if (userType == 'guest')
      {
        module.state = false;
      }
      if (!module.state) {
        module._id = null
      }

      return module
    })
    let progressBar = parseInt((progress.length / modules.length)*100)
    return res.status(200).send( { modules, progressBar } )
  })
  .catch(err => {
    console.log(err);
    return res.status(404).send( err )
  })
}

function getModule (req, res) {
  let moduleId = req.params.moduleId
  let token = req.headers.authorization.split(' ')[1]
  if (!token) {
    return res.status(403).send( { message: 'no tenes permisos para ver este contenido' } )
  }
  services.decodeToken(token)
  .then(decoToken => {
    return Module.findOne({ _id: moduleId })
    .then(module =>{
      return [module, decoToken.typ]
    })
  })  
  .then(data =>{
    let [module, userType] = data
    
    let permission = false
    if (module.type !== 'free' && (userType == 'admin' || userType == 'pro')) permission = true //pro
    if (module.type == 'free')  permission = true

    if (permission) {  
      Module.findOne({_id: {$gt: moduleId}})
      .sort({_id: 1})
      .select('_id name info state type title')
      .then(next => {
        return res.status(200).send( { module, next } )
      })
    }
    else {
      return res.status(403).send( { message: 'no tenes permisos para ver este contenido' } )
    }
  })
  .catch(err => {
    console.log(err);
    return res.status(404).send( err )
  })
}


module.exports = {
  getModules,
  getModule,
  getModulesSimple
}
