'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const config = require('../config');
const fs = require('fs');


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

function checkValidity(array) {

  function check(el) {

    let payload = {
      iat: moment().unix(),
      exp: moment().add(el.validity.time, 'YYYY-MM-DD HH:mm').unix()
    }

    if (el.validity.since) {
      payload.iat = moment(el.validity.since, 'YYYY-MM-DD HH:mm').unix()
      payload.exp = moment(el.validity.until, 'YYYY-MM-DD HH:mm').unix()
    }

    return (moment().unix() >= payload.iat && moment().unix() <= payload.exp);
  }

  let elValid = []

  for (var i = 0; i < array.length; i++) {
    if (check(array[i])) {
      elValid.push(array[i])
    }
  }
  return elValid;
}

function updateFile(updateId, fileNew, fileLast){
    if (fileLast) {
      if (fileNew !== fileLast) {
        fs.unlink(fileLast, (err) => {
          if (err) throw err;
          console.log('el archivo fue modificada');
        });
      }else {
        console.log('el archivo es el mismo');
      }
    }
}


module.exports = {
  createToken,
  decodeToken,
  checkValidity,
  updateFile
}
