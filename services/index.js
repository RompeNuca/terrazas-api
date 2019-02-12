'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const nodemailer = require("nodemailer");
const config = require('../config');
const bcrypt = require('bcrypt-nodejs');

function createToken(user) {

    const payload = {
        usr: user.id,
        ema: user.email,
        pas: user.password,
        typ: user.type || 'guest',
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
            
            resolve(payload)

        } catch (err) {
            reject({
                status: 500,
                menssage: `Token invalido`
            })
        }
    })

    return decoded
}

function sendEmail(email) {
  // create reusable transporter object using the default SMTP transport
  const send = new Promise((resolve, reject) => {
    try {
        let transporter = nodemailer.createTransport(config.email); 
        // send mail with defined transport object
        transporter.sendMail(email)
        resolve({
            status: 200,
            menssage: `Te envamos un Email de Confirmacion`
        })
    } catch (err) {
        reject({
            status: 500,
            menssage: `Error al enviar el mail de confirmacion`
        })
    }
  })

  return send
}

function createPassword(candidate) {
    const password = new Promise((res,rej) => {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return rej(err)
            bcrypt.hash(candidate, salt, null, (err, hash) => {
                if (err) return rej(err)
                res(hash)
            })
        })
    })
    return password
} 

module.exports = {
    createToken,
    decodeToken,
    sendEmail,
    createPassword
}
