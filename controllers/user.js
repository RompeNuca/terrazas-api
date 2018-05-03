'use strict'

const User = require('../models/user');
const services = require('../services');

function signUp (req, res) {
  const user = new User({
    email: req.body.email,
    displayName: req.body.displayName,
    password: req.body.password,
    type:req.body.type
  })

  user.avatar = user.gravatar();

  user.save(err => {
    if (err) return res.status(500).send({ msg: `Error al crear usuario: ${err}` })
    return res.status(200).send({ token: services.createToken(user) })
  })
}


function signIn (req, res) {

  var mailIncoming = req.body.email
  var passIncoming = req.body.password

    User.findOne({ email: mailIncoming }).select('_id email +password').exec(function (err, user) {

      if (err) return res.status(500).send({ msg: `Error al ingresar: ${err}` })
      if (!user) return res.status(404).send({ msg: `no existe el usuario: ${mailIncoming}` })

      return user.comparePassword(req.body.password, (err, isMatch) => {
        if (err) return res.status(500).send({ msg: `Error al ingresar: ${err}` })
        if (!isMatch) return res.status(404).send({ msg: `Error de contraseña: ${req.body.email}` })

        req.user = user
        return res.status(200).send({ msg: 'Te has logueado correctamente', token: services.createToken(user) })
      });

    });
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
