var mongoose = require('mongoose');
var Celeb = mongoose.model('Celeb');
var User = mongoose.model('User');
var prefix = '/celeb';
var MAX_CELEBS_PER_QUERY = 100;
var DEFAULT_CELEBS_PER_QUERY = 10;

function createCeleb(req, res) {
    var celeb = new Celeb({
        name: req.body.name,
        about: req.body.about
    });

    celeb.save(function(err, celeb) {
        if (err) {
            if (err.name === 'ValidationError') {
                return res.status(422).send(err.message);
            }
            return res.status(500).send(err.message);
        }
        res.send({celebId: celeb._id});
    });
}

function updateCeleb(req, res) {
    var celebFields = {};

    for (var field in req.body) {
        celebFields[field] = req.body[field];
    }

    Celeb.update({_id: req.params.celebId}, celebFields, {upsert: false, multi: false}, function(err, numAffected) {
        if (err) {
            return res.status(500).send('Can not update celebrity: ' + req.params.celebId + ': ' + err.message);
        }
        res.send('Celebrity: ' + req.params.celebId + ' was successfully updated. Affected: ' + numAffected);
    });
}

function listCelebs(req, res) {
    var skip = req.query.skip ? req.query.skip : 0;
    var limit = req.query.limit ? Math.min(MAX_CELEBS_PER_QUERY, req.query.limit) : DEFAULT_CELEBS_PER_QUERY;
    Celeb.find({}).sort({name: 1}).skip(skip).limit(limit).exec(function(err, celebs) {
        if (err) {
            throw err;
        }
        res.send(celebs);
    });
}

function showCeleb(req, res) {
    Celeb.findOne({_id: req.params.celebId}, function(err, celeb) {
        if (err) {
            throw err;
        }
        if (!celeb) {
            return res.status(404).send('Celebrity with id: ' + req.params.celebId + ' was not found');
        }
        res.send(celeb);
    });
}

function deleteCeleb(req, res) {
    Celeb.remove({_id: req.params.celebId}, function(err) {
        if (err) {
            return req.status(500).send('Can not delete celebrity with id: ' + req.params.celebId);
        }
        res.send('Celebrity with id: ' + req.params.celebId + ' was successfully removed');
    });
}

module.exports = function(app) {
    app.post(prefix, User.populateSession, User.requireRole('admin'), createCeleb);
    app.get(prefix + '/list', listCelebs);
    app.put(prefix + '/:celebId', User.populateSession, User.requireRole('admin'), updateCeleb);
    app.get(prefix + '/:celebId', showCeleb);
    app.del(prefix + '/:celebId', User.populateSession, User.requireRole('admin'), deleteCeleb);
};
