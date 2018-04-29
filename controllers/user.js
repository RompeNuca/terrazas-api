'use strict'

const User = require('../models/user');
const services = require('../services');

function signUp (req, res) {
  const user = new User({
    email: req.body.email ,
    displayName: req.body.displayName ,
    password: req.body.password
  })

  user.save((err) =>{
    if(err) res.status(500).send({ menssage: `Error al crar el usuario: ${err}`})

    return res.status(201).send({ token: services.createToken(user) })
  } )
}

function signIn (req, res) {
  User.find({ email: req.body.email }, (err, user) =>{
    if(err) res.status(500).send({ menssage: `${err}`})
    if(!user) res.status(404).send({ menssage: `No existe el usuario ${err}`})

    req.user = user
    res.status(200).send({
      menssage: `Te has logueado correctamente`,
      token: services.createToken(user)
    })
  })
}

//probando una zona privada
function privado (req, res) {
   return res.status(200).send({ menssage: `tienes permisos` })
}

//mio para ver los usuarios
function getUsers (req, res) {

 User.find({}, (err, users) => {
   if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
   if (!users) return res.status(404).send({message: `No hay Usuarios`})

   res.status(200).send({ users })
 })

}

module.exports = {
  signUp,
  signIn,
  privado,
  getUsers
}
