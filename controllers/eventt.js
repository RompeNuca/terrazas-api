'use strict'

const config = require('../config');
const mongoose = require('mongoose');
const moment = require('moment');
const Promo = require('../models/promo');
const Eventt = require('../models/eventt');

const services = require('../services');

const fs = require('fs');

const eventtPath = 'api-demo/eventts/'

function getSimpleEventts(req, res) {
    Eventt.find()
        .select(`title`)
        .then(eventts => {
            res.status(200).send({
                eventts
            })
        })
}

function getValidEventts(req, res) {

    Eventt.find({}, (err, el) => {
        if (err) return res.status(500).send({
            message: `Error al relaizar la peticion, ${err}`
        })
        if (!el) return res.status(404).send({
            message: `No hay Promos`
        })

        let eventtsValid = services.checkValidity(el)
        let eventtsOrder = eventtsValid.sort(function (a, b) {
            if (a.lastEdit < b.lastEdit) {
                return 1;
            }
            if (a.lastEdit > b.lastEdit) {
                return -1;
            }
            return 0;
        })

        res.status(200).send({
            eventtsOrder,
            message: 'promos cargadas con exito'
        })
    })

}

function getValidEventtsWithPromos(req, res) {

    Eventt.find()
        .populate('promos')
        .exec()
        .then(full => {

            let eventtsSelect = services.filterValidity(full)

            let eventtsFullValid = []
            for (var i = 0; i < eventtsSelect.length; i++) {
                let eventt = eventtsSelect[i]
                let promosValid = services.checkValidity(eventt.promos)
                eventtsFullValid.push(eventt)
            }

            res.status(200).send({
                eventtsFullValid
            })
        })

}

function saveEventt(req, res) {

    let eventt = new Eventt()
    eventt._id = req.body._id
    eventt.title = req.body.title
    eventt.type = req.body.type
    eventt.shortInfo = req.body.shortInfo
    eventt.info = req.body.info
    eventt.date = req.body.date
    eventt.day = req.body.day
    eventt.hour = req.body.hour
    eventt.lastEdit = moment().unix()
    eventt.promos = []

    if (req.files.eventtImage) {
        eventt.eventtImage = config.domain + config.port + '/' + req.files.eventtImage[0].path
    }
    if (req.files.eventtCover) {
        eventt.eventtCover = config.domain + config.port + '/' + req.files.eventtCover[0].path
    }

    eventt.promos = []
    if (req.body.promos) {
        eventt.promos = req.body.promos
    }

    if (req.body.time) {
        eventt.validity.since = moment().format('YYYY-MM-DD HH:mm')
        eventt.validity.until = moment().add(req.body.time, 'hours').format('YYYY-MM-DD HH:mm')
    } else {
        eventt.validity.since = req.body.since
        eventt.validity.until = req.body.until
    }


    //Sube la imagen a el cloud
    services.uploadFileCloud(eventt.eventtImage, eventtPath, wow => {
        //Espera que la imagen suba y despues...
        if (wow == 'err') res.status(500).send({message: `Error al guardar la imagen en la nube`})

        //guarda el path de la imagen ya cargada en la nube
        if (wow) {
            eventt.eventtImage = wow
            
            //Borra el archivo de la carpeta temporal
            let fileRute = req.files.eventtImage[0].path;
            fs.unlink(fileRute, (err) => {
                if (err) res.status(500).send({essage: `Error al borrar la imagen temporal de la promo, ${err}`})
            });
        }

        //Sube la imagen a el cloud
        services.uploadFileCloud(eventt.eventtCover, eventtPath, wow => {
            //Espera que la imagen suba y despues...
            if (wow == 'err') res.status(500).send({message: `Error al guardar la imagen en la nube`})

            //guarda el path de la imagen ya cargada en la nube
            if (wow) {
                eventt.eventtCover = wow

                //Borra el archivo de la carpeta temporal
                let fileRute = req.files.eventtCover[0].path;
                fs.unlink(fileRute, (err) => {
                    if (err) res.status(500).send({essage: `Error al borrar la imagen temporal de la promo, ${err}`})
                });
            }

            //Guardar el evento en su coleccion
            eventt.save((err, eventtStored) => {
                if (err) res.status(500).send({message: `Error al salvar el evento, ${err}`})
                res.status(200).send({message: `El evento se creo correctamente`})
            })
        })
    })

 
    //Guardar el id del evento en las proms elegidas
    if (eventt.promos && eventt.promos !== []) {
        for (var i = 0; i < eventt.promos.length; i++) {
            Promo.findByIdAndUpdate(eventt.promos[i], {
                $push: {
                    eventts: mongoose.Types.ObjectId(eventt._id)
                }
            }, (err, item) => {
                if (err) return res.status(500).send({
                    message: `Error al actualizar el evento con la promo, ${err}`
                })
                if (!item) return res.status(404).send({
                    message: `El evento no existe`
                })
            })
        }
    }

}

function updateEventt(req, res) {

    const updateId = req.params.eventtId;
    const eventt = req.body;
    eventt.lastEdit = moment().unix()
    if (!eventt.validity) {
        eventt.validity = {}
    }


    if (req.files.eventtImage) {
        eventt.eventtImage = config.domain + config.port + '/' + req.files.eventtImage[0].path
    } else if (req.body.eventtImage) {
        eventt.eventtImage = req.body.eventtImage
    }
    if (req.files.eventtCover) {
        eventt.eventtCover = config.domain + config.port + '/' + req.files.eventtCover[0].path
    } else if (req.body.eventtCover) {
        eventt.eventtCover = req.body.eventtCover
    }

    if (req.body.time) {
        eventt.validity.since = moment().format('YYYY-MM-DD HH:mm')
        eventt.validity.until = moment().add(req.body.time, 'hours').format('YYYY-MM-DD HH:mm')
    } else {
        eventt.validity.since = req.body.since
        eventt.validity.until = req.body.until
    }

    services.uploadFileCloud(eventt.eventtImage, eventtPath, (wow)=>{
        if (wow) {
            eventt.eventtImage = wow
        }
        services.uploadFileCloud(eventt.eventtCover, eventtPath, (wow)=>{
            if (wow) {
                eventt.eventtCover = wow
            }

            Eventt.findByIdAndUpdate(updateId, eventt)
                .select(`_Id name promos eventtImage eventtCover`)
                .exec(function (err, item) {
                    if (err) res.status(500).send({
                        message: `Error al buscar la eventt, ${err}`
                    })
                    if (!eventt) return res.status(404).send({
                        message: `El eventt no existe`
                    })

                    let eventtLastPromos = item.promos
                    let eventtNewPromos = eventtLastPromos /* Esta igualacion es provisoria hace que al no mandadar nada, nada cambie */

                    if (!Array.isArray(req.body.promos)) {
                        eventtNewPromos = [req.body.promos]
                    } else {
                        eventtNewPromos = req.body.promos;
                    }

                    //Actualiza los ids de los eventts dentro de ls Promos

                    if (eventtLastPromos !== eventtNewPromos) {

                        for (var i = 0; i < eventtLastPromos.length; i++) {
                            Promo.findByIdAndUpdate(eventtLastPromos[i], {$pull: {eventts: mongoose.Types.ObjectId(item._id)}},
                                (err, ok) => {})
                        }

                        for (var f = 0; f < eventtNewPromos.length; f++) {
                            Promo.findByIdAndUpdate(eventtNewPromos[f], {$push: {eventts: mongoose.Types.ObjectId(item._id)}
                                },
                                (err, ok) => {})
                        }
                    }

                    //Actualizar las imagenes
                    if (eventt.eventtImage && eventt.eventtImage !== 'delete') {
                        services.deleteFileCloud(item.eventtImage, eventtPath, () => {})
                    }
                    if (eventt.eventtCover && eventt.eventtCover !== 'delete') {
                        services.deleteFileCloud(item.eventtCover, eventtPath, () => {})
                    }

                    res.status(200).send({
                        eventt: eventt
                    })
                })
        })
    })
}

function deleteEventt(req, res) {

    let eventtId = req.params.eventtId

    // Busca el evento
    Eventt.findById(eventtId, (err, eventt) => {
        if (err) res.status(500).send({message: `Error al borrar el evento, ${err}`})
        if (!eventt) return res.status(404).send({message: `El evento no existe`})


        //Borrar el evento de las promos en los que existe
        for (var i = 0; i < eventt.promos.length; i++) {

            if (eventt.promos[i]) {
                Promo.findByIdAndUpdate(eventt.promos[i], {
                    $pull: {
                        eventts: mongoose.Types.ObjectId(eventt._id)
                    }
                }, function (err, promo) {
                    if (err) return res.status(500).send({
                        message: `Error al actualizar la promo, ${err}`
                    })
                    if (!promo) return res.status(404).send({
                        message: `la promo no existe`
                    })
                })
            }
        }

        //Borrar las imagenes del eevento si es que existen 
        if (eventt.eventtImage && eventt.eventtImage !== 'delete') {
            let matchCloud = eventt.eventtImage.substr(0,config.cloudDomain.length) 

            if (matchCloud == config.cloudDomain) {
                services.deleteFileCloud(eventt.eventtImage, eventtPath,  (err) => {
                if (err) res.status(500).send({message: `Error al borrar la imagen de la promo en la nube, ${err}`})
                });
            }else{
                fs.unlink(eventt.eventtImage, (err) => {
                if (err) res.status(500).send({message: `Error al borrar la imagen de la promo, ${err}`})
                });
            }
        }

        if (eventt.eventtCover && eventt.eventtCover !== 'delete') {
            let matchCloud = eventt.eventtCover.substr(0,config.cloudDomain.length) 

            if (matchCloud == config.cloudDomain) {
                services.deleteFileCloud(eventt.eventtCover, eventtPath,  (err) => {
                if (err) res.status(500).send({message: `Error al borrar la imagen de la promo en la nube, ${err}`})
                });
            }else{
                fs.unlink(eventt.eventtCover, (err) => {
                if (err) res.status(500).send({message: `Error al borrar la imagen de la promo, ${err}`})
                });
            }
        }

        //Borrar el evento en su coleccion
        eventt.remove(err => {
            if (err) res.status(500).send({message: `Error al borrar el evento, ${err}`})
            res.status(200).send({menssage: `El evento a sido eliminado`})
        })

    })

}

module.exports = {
    getValidEventts,
    getValidEventtsWithPromos,
    saveEventt,
    updateEventt,
    deleteEventt,
    getSimpleEventts
}