var mongoose = require('mongoose');
var Celeb = mongoose.model('Celeb');
var User = mongoose.model('User');
var prefix = '/celeb';

module.exports = function(app, options) {
    app.post(prefix, User.populateSession, User.requireRole('admin'), createCeleb);
    app.put(prefix + '/:celeb_id', User.populateSession, User.requireRole('admin'), updateCeleb);
    app.get(prefix + '/list', listCelebs);
    app.get(prefix + '/:celeb_id', showCeleb);
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
    var celebFields = {};

    for (var field in req.body) {
        celebFields[field] = req.body[field];
    }

    Celeb.update({_id: req.params.celeb_id}, celebFields, function(err, numAffected) {
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
