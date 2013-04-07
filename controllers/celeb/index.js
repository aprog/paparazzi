var mongoose = require('mongoose');
var Celeb = mongoose.model('Celeb');
var prefix = '/celeb';

module.exports = function(app, options) {
    app.post(prefix, createCeleb);
    app.put(prefix + '/update/:place_id', updateCeleb);
    app.get(prefix + '/list', listCelebs);
    app.get(prefix + '/show/:place_id', showCeleb);
};

function createCeleb(req, res) {
    var celeb = new Celeb({
        name: req.body.name,
        about: req.body.about
    });

    celeb.save(function(err, celeb) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.send('Celebrity: ' + celeb.name + ' was successfully created.');
    });
}

function updateCeleb(req, res) {
    Celeb.update({
        _id: req.params.celeb_id
    },
    {
        name: req.body.name,
        about: req.body.about
    }, function(err, numAffected) {
        if (err) {
            return res.status(500).send('Can not update celebrity: ' + req.params.celeb_id + ': ' + err.message);
        }
        res.send('Celebrity: ' + req.params.celeb_id + ' was successfully updated. Affected: ' + numAffected);
    });
}

function listCelebs(req, res, next) {
    Celeb.find({}, function(err, celebs) {
        if (err) {
            throw err;
        }
        res.send(celebs);
    });
}

function showCeleb(req, res, next) {
    Celeb.findOne({_id: req.params.celeb_id}, function(err, celeb) {
        if (err) {
            throw err;
        }
        res. send(celeb);
    });
}
