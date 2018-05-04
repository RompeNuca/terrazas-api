'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');

const UserSchema = Schema({
  _id: {type: mongoose.Schema.ObjectId, select: false},
  _publicId: String,
  type: {type: String, enum: ['admin', 'pro', 'basic']},
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  displayName: String,
  avatar: String,
  signUpDate: { type: Date, default: Date.now() },
  lastLogin: Date,
  __v: {type: Number, select: false},
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

UserSchema.methods.gravatar = function (size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) return `https:/gravatar.com/avatar/?s${size}&d=retro`
  const md5 = crypto.createHash('md5').update(this.email).digest('hex')
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`
}

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch)
  });
}


module.exports = mongoose.model('User', UserSchema)
