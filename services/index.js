'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const config = require('../config');

function createToken(user) {
  const payload = {
     sub: user.public_Id,
    iat: moment().unix(),
    exp: moment().add(30, 'days').unix()
  }

  return jwt.encode(payload, config.SECRET_TOKEN)
}

function decodeToken(token) {
  const decoded = new Promise((resolve, reject) => {
    try {

      const payload = jwt.decode(token, config.SECRET_TOKEN)

      if (payload.exp <= payload.iat) {
        reject({
          status: 401,
          menssage: `Token expirado`
        })
      }

      resolve(payload.sub)

    } catch (err) {
      reject({
        status: 500,
        menssage: `Token invalido`
      })
    }
  })

  return decoded
}

function verificarVigencia(array) {

  function revisar(el) {

    let payload = {
      iat: moment().unix(),
      exp: moment().add(el.vigencia.tiempo, 'YYYY-MM-DD HH:mm').unix()
    }

    if (el.vigencia.desde) {
      payload.iat = moment(el.vigencia.desde, 'YYYY-MM-DD HH:mm').unix()
      payload.exp = moment(el.vigencia.hasta, 'YYYY-MM-DD HH:mm').unix()
    }

    return (moment().unix() >= payload.iat && moment().unix() <= payload.exp);
  }

  let elVigentes = []

  for (var i = 0; i < array.length; i++) {
    if (revisar(array[i])) {
      elVigentes.push(array[i])
    }
  }
  return elVigentes;
}



module.exports = {
  createToken,
  decodeToken,
  verificarVigencia
}
