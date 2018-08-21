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


cloudinary.config(config.cloudConfig);

function deleteFileCloud( file, path, error ){
    
  if (!file || file == 'delete') { return }
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

  if (!file || file == 'delete') { cb() }
  else{

    let up =  file.slice(config['path'].length) 
    cloudinary.v2.uploader.upload(
        up,
        {use_filename: true,
        folder: path},
        (error, result) => {
        
        cb(result.secure_url)
        if (error) {
            cb('err')
            console.log(error);
        }
    });
  }
}

function updateFile(fileLast, fileNew, path, cb ) {
    if (fileLast !== 'delete' && fileNew == 'delete') {
        deleteFileCloud(fileLast, path)
        cb('delete')
        return
    }
    if (fileLast !== 'delete' && fileNew !== 'delete') {
        uploadFileCloud( fileNew, path, (newPath) => {
          cb(newPath)
          deleteFileCloud(fileLast, path)
          return
        })
    }
    if (fileLast == 'delete' && fileNew !== 'delete') {
        uploadFileCloud( fileNew, path, (newPath) => {
          cb(newPath)
          return
          })       
    }
    cb('delete')
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
