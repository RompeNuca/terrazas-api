'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const services = require('../services')
const config = require('../config');

const UserSchema = Schema({
    type: { type: String, enum: ['admin', 'confirmed','confirmedPlus', 'guest'] },
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false },
    userName: String,
    userLastName: String,
    avatar: String,
    signUpDate: { type: Date, default: Date.now() },
    lastLogIn: Date,
    progress: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module'}],
    wait: Date,
    progressUnity: Number,
    available: Array
})


// En mongoose no usar Arrow Function.
// Antes de guardar al usuario se hacen 3 cosas,
// 1) se crea el token(invitado) que se le devuelve inmediatamente.
// 2) se encripta la password.
// 4) se envia el email de confirmacion con el token(confirmado).
UserSchema.pre('save', function(done) {
    let user = this;
    if (!user.isModified('password')) return done()
    user.type = 'confirmed'
    let tokken = services.createToken(user)
    let welcomeEmail = {
        from: '"Bienvenido a Comer Despierto" <noreplay@comerdespierto.com>', // sender address
        to: user.email, // list of receivers
        subject: 'Bienvenido a Comer Despierto', // Subject line
        text: '', // plain text body
        html: `${config.url}/api/confirmed/${tokken}` // html body
    }
    console.log(welcomeEmail.html);
    
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return done(err)
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) return done(err)
            services.sendEmail(welcomeEmail)
            user.password = hash
            user.type = 'guest'
            done()
        })
    })
})

UserSchema.methods.gravatar = function(size) {
    if (!size) {
        size = 200;
    }
    if (!this.email) return `https:/gravatar.com/avatar/?s${size}&d=retro`
    const md5 = crypto.createHash('md5').update(this.email).digest('hex')
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`
}

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch)
    });
}


module.exports = mongoose.model('User', UserSchema)
