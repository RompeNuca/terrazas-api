'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const services = require('../services');
const config = require('../config');

function signUp (req, res) {
  const user = new User({
    email: req.body.email,
    userName: req.body.displayName,
    password: req.body.password
  })
  
  user.avatar = user.gravatar();

  user.save(err => {
    if (err) return res.status(500).send({ msg: `Error al crear usuario: ${err}` })
    return res.status(200).send({ token: services.createToken(user) })
  })
}

function confirmed (req, res) {
  const token = req.params.token

  services.decodeToken(token)
  .then(decode => {
    
  User.findOneAndUpdate({ email: decode.ema }, {type: decode.typ},  { new: true })
    .exec(function (err, user) {
      if (err) return res.status(500).send({ msg: `Error al intentar confirmar al usuario: ${err}` })
      if (!user) return res.status(404).send({ msg: `no existe el usuario: ${user.email}` })
      return res.status(200).send({ user, token: services.createToken(user) })
    });
  })
 }

function requestRecoverPassword (req, res) {
  User.findOne({ email: req.body.email })
  .select('_id email +password')
  .exec(function (err, user) {
    if (err) return res.status(500).send({ msg: `Error al intentar confirmar al usuario: ${err}` })
    if (!user) return res.status(404).send({ msg: `no existe el usuario: ${user.email}` })
    const payload = {
      user: user.id,
      email: req.body.email,
      type: 'recover',
      password: user.password
    }
    let token = services.createToken(payload)
      let recoverEmail = {
        from: '"Recuperar la contraseña" <noreplay@comerdespierto.com>', // sender address
        to: req.body.email, // list of receivers
        subject: 'Reset Password', // Subject line
        text: '', // plain text body
        html:`${config.domain}${config.port}/recover/${token}` // html body
      }
      services.sendEmail(recoverEmail)      
      .then( res.status(200).send({ message: 'Se envio un email para el cambio de contraseña' }))
      .catch(err => {return res.status(500).send({ msg: `Error al intentar confirmar al usuario: ${err}` })})
  });
}

function recover (req, res) {
  const token = req.body.token;
  const candidate = req.body.password;
  const candidatePassword = req.body.confirmPassword;
  if (candidate !== candidatePassword) return res.status(500).send({ msg: `La contraseña no coincide` })
  services.createPassword(candidate)
  .then( password => {
    services.decodeToken(token)
    .then(decode => {
      User.findOne({ email: decode.ema })
      .select('+password')
      .exec(function (err, user) {
        if (decode.pas !== user.password) return res.status(404).send({ msg: `Este link ya fue utilizado` })
        if (err) return res.status(500).send({ msg: `Error al buscar el usuario: ${err}` })
        if (!user) return res.status(404).send({ msg: `no existe el usuario: ${user.email}` })
        user.update({password: password})
        .then( res.status(200).send({ msg: `la contraseña fue cambiada con exito!` }) )
      });
    })
    .catch(err => res.status(500).send({ msg: `El token no es valido: ${err}` }))
  })
}

function signIn (req, res) {

  var mailIncoming = req.body.email
  var passIncoming = req.body.password

    User.findOne({ email: mailIncoming }).select('_id email displayName +password type')
    .exec(function (err, user) {
    
      if (err) return res.status(500).send({ msg: `Error al ingresar: ${err}` })
      if (!user) return res.status(404).send({ msg: `no existe el usuario: ${mailIncoming}` })

      return user.comparePassword(passIncoming, (err, isMatch) => {
        if (err) return res.status(500).send({ msg: `Error al ingresar: ${err}` })
        if (!isMatch) return res.status(404).send({ msg: `Error de contraseña: ${req.body.email}` })

        return res.status(200).send({ token: services.createToken(user) })
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
  User.findOne({_id: userId}, (err, user) => {
    if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
    if (!user) return res.status(404).send({message: `El user no existe`})
    res.status(200).send(user)
  })
}

function getUserByToken (req, res) {
  let token = req.params.token
  services.decodeToken(token)
  .then(decode => {
    User.findOne({email: decode.ema }, (err, user) => {
      if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
      if (!user) return res.status(404).send({message: `El user no existe`})
      res.status(200).send(user)
    })
  })
  .catch(err => res.status(500).send({ msg: `El token no es valido: ${err}` }))
}

function editUser (req, res) {
  let userId = req.params.userId;
  let user = req.body;

  User.findOneAndUpdate({ _id: userId }, user, { new: true })
  .then(user => {
    if (!user) return res.status(404).send({message: `El user no existe`})
    res.status(200).send(user) 
  })
  .catch(err => res.status(500).send({message: `Error al relaizar la peticion, ${err}`}))
}
// Testing area

// let dataToken = services.decodeToken(
//   'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWEiOiJtYXVyby50YWxpZW50ZTNAZ21haWwuY29tIiwidHlwIjoicmVjb3ZlciIsImlhdCI6MTU0OTQ4OTY1MywiZXhwIjoxNTUyMDgxNjUzfQ.id6hkyhcVhM3p0OMf14hGh8kKmbFSvWZJYlyE9DGYeg'
// )
//   .then(tk => {
//     console.log(tk);
//   })

module.exports = {
  signUp,
  signIn,
  getUsers,
  getUser,
  getUserByToken,
  editUser,
  confirmed,
  recover,
  requestRecoverPassword
}
