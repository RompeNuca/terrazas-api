'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

mongoose.connect(config.db, (err, res) => {
    if (err) console.log(`Error al conectar a la base de datos ${err}`);
    console.log('conexion a la base de datos establecida...');
    app.listen(config.port, () => {
        console.log((`el servidor esta andando en ${config.domain}${config.port}`));
    })
})
