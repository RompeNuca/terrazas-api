'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema,

// const bcrypt = require('bcrypt-nodejs');
// const crypto = require('crypto');
// const services = require('../services')

const ModuleSchema = Schema({
    name: String,
    info: String,
    videos: Array,
    materias: Array 
})

module.exports = mongoose.model('Module', ModuleSchema)
