'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const services = require('../services');

function signUp (req, res) {
  const user = new User({
    public_Id: new mongoose.Types.ObjectId(),
    email: req.body.email,
    displayName: req.body.displayName,
    password: req.body.password,
    type:req.body.type
  })
  console.log(user);
  
  user.avatar = user.gravatar();

  user.save(err => {
      console.log(err);
    if (err) return res.status(500).send({ msg: `Error al crear usuario: ${err}` })
    return res.status(200).send({ token: services.createToken(user) })
  })
}


function signIn (req, res) {

  var mailIncoming = req.body.email
  var passIncoming = req.body.password

    User.findOne({ email: mailIncoming }).select('public_Id email displayName +password').exec(function (err, user) {

      if (err) return res.status(500).send({ msg: `Error al ingresar: ${err}` })
      if (!user) return res.status(404).send({ msg: `no existe el usuario: ${mailIncoming}` })

      return user.comparePassword(req.body.password, (err, isMatch) => {
        if (err) return res.status(500).send({ msg: `Error al ingresar: ${err}` })
        if (!isMatch) return res.status(404).send({ msg: `Error de contraseña: ${req.body.email}` })

        req.user = user
        return res.status(200).send({ user, token: services.createToken(user) })
      });

    });
 }


function getUsers (req, res) {

 User.find({}, (err, users) => {
   if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
   if (!users) return res.status(404).send({message: `No hay Usuarios`})

   res.status(200).send({ users })
 })

}

function getUser (req, res) {

  let userId = req.params.userId

  User.findOne({public_Id: userId}, (err, user) => {
    if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
    if (!user) return res.status(404).send({message: `El user no existe`})
    res.status(200).send({ user })
  })

}

module.exports = {
  signUp,
  signIn,
  getUsers,
  getUser
}
