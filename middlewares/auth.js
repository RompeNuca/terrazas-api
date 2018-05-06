'use strict'
const User = require('../models/user');
const services = require('../services');

function isAuth (req, res, next) {

   if(!req.headers.authorization){
     return res.status(403).send({ message: `no tienes autorizacion` })
   }

   let token = req.headers.authorization.split(' ')[1]
   services.decodeToken(token)
   .then(response => {
     req.user = response
     next()
   })
   .catch(response => {
     res.status = (response.status)
   })

}

function isPro (req, res, next) {

  let token = req.headers.authorization.split(' ')[1]
  services.decodeToken(token)
    .then(response => {

      User.findOne({ public_id: response }, function(err, user) {
        let typeAc = user.type

        if (typeAc == 'pro') { return next() }
        if (err) return res.status(500).send({ msg: `No se ecuentra la cuenta: ${err}` })
        else { return res.status(500).send({ msg: `Tener que ser mas pro: ${err}` }) }
      });
    })
  .catch(response => {
    res.status = (response.status)
  })
}

module.exports = {
  isAuth
  , isPro
}
