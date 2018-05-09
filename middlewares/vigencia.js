'use strict'
const Evento = require('../models/evento');
const services = require('../services');

function vigente (req, res, next) {

  Evento.find({}, function(err, evento) {
    let eventosVigentes = []
    for (var i = 0; i < evento.length; i++) {

      let ver = services.verificarVigencia(evento[i])
        if (ver) {
          eventosVigentes.push(evento[i])
        }

      console.log(eventosVigentes);
    }



  });
}

module.exports = {
 vigente
}
