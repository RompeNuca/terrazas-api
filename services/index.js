'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const config = require('../config');
const fs = require('fs');
const cloudinary = require('cloudinary');


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

//VALIDACIONES DE TIEMPO
function check(el) {

    let payload = {
        iat: moment(el.validity.since, 'YYYY-MM-DD HH:mm').unix(),
        exp: moment(el.validity.until, 'YYYY-MM-DD HH:mm').unix()
    }

    return (moment().unix() >= payload.iat && moment().unix() <= payload.exp);
}

function filterValidity(array) {

    let elValid = []

    for (var i = 0; i < array.length; i++) {
        if (check(array[i])) {
            array[i].validity.state = true
            elValid.push(array[i])
        }
    }
    return elValid;

}

function checkValidity(array) {

    for (var i = 0; i < array.length; i++) {
        if (check(array[i])) {
            array[i].validity.state = true
        }
    }
    return array;
}


function updateFile(updateId, fileNew, fileLast) {
    if (fileLast && fileLast !== 'delete') {
        if (fileNew !== fileLast) {
            fs.unlink(fileLast, (err) => {
                if (err) throw err;
                console.log('el archivo fue modificada');
            });
        } else {
            console.log('el archivo es el mismo');
        }
    }
}

cloudinary.config(config.cloudConfig);

function deleteFileCloud( file, path, error ){

  let filePublicId = path + file.split('/').pop().slice(0,-4)

  cloudinary.v2.uploader.destroy(
    filePublicId,
    (error, result) => {
      if (error) {
        error(error)
      }
    });
}

function uploadFileCloud( file, path, cb ){

  let up =  file.slice(config['path'].length) 

  cloudinary.v2.uploader.upload(
    up,
    {use_filename: true,
    folder: path},
    (error, result) => {
      cb(result)
      if (error) {
        cb('err')
        console.log(error);
      }
    });
}


module.exports = {
    createToken,
    decodeToken,
    checkValidity,
    filterValidity,
    updateFile,
    uploadFileCloud,
    deleteFileCloud
}
