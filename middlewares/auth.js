'use strict'
const User = require('../models/user');
const services = require('../services');

function isAuth (role) {
  return function( req, res, next){

    role = role || ['guest']
    if(!req.headers.authorization){
      return res.status(403).send({ message: `no tienes autorizacion` })
    }
    
    let token = req.headers.authorization.split(' ')[1]
    services.decodeToken(token)
    .then(decoToken => {
      const acces = role.find(x => x == decoToken.typ)
      if (!acces) res.status(403).send({ message: `no tienes autorizacion` })
      req.user = decoToken
      next()
    })
    .catch(response => {
      console.log(response);
      res.status = (response.status)
    })
  }
}


module.exports = {
  isAuth
}
