var mongoose = require('mongoose');
var Celeb = mongoose.model('Celeb');

exports.create = function(req, res, next) {
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

exports.update = function(req, res, next) {
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

exports.list = function(req, res, next) {
    Celeb.find({}, function(err, celebs) {
        if (err) {
            throw err;
        }
        res.send(celebs);
    });
}

exports.show = function(req, res, next) {
    Celeb.findOne({_id: req.params.celeb_id}, function(err, celeb) {
        if (err) {
            throw err;
        }
        res. send(celeb);
    });
}
