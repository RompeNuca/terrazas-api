'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');

const UserSchema = Schema({
  //Intento de guardar un segundo id con la intencion de tener un id publico y uno privado
  //_publicId: Schema.Types.ObjectId,
  email: { type: String, unique: true, lowercase: true },
  displayName: String,
  avatar: String,
  password: { type: String, select: false },
  signUpDate: { type: Date, default: Date.now() },
  lastLogin: Date
})

// El porque no se usa una arrow function aca: https://github.com/Automattic/mongoose/issues/4537
UserSchema.pre('save',  function(next) {
  let user = this
  if (!user.isModified('password')) return next()

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err)

      user.password = hash
      next()
    })
  })
})

UserSchema.methods.gravatar = function (){
  if(!this.email) return `https//gravatar.com/avatar/?s=200&d=retro`

  const md5 = crypto.crateHash('md5').update(this.email).digest('hex')
  return `https//gravatar.com/avatar/${md5}?s=200&d=retro`
}

module.exports = mongoose.model('User', UserSchema)
