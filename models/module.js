'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const bcrypt = require('bcrypt-nodejs');
// const crypto = require('crypto');
// const services = require('../services')

const ModuleSchema = Schema({
    name: String,
    info: String,
    title: String,
    videos: Array,
    materials: Array,
    state: Boolean,
    time: Number,
    type: String
})

module.exports = mongoose.model('Module', ModuleSchema)
