var mongoose = require('mongoose');
var Place = mongoose.model('Place');
var User = mongoose.model('User');
var fs = require('fs');
var format = require('util').format;
var async = require('async');
var crypto = require('crypto');
var path = require('path');
var prefix = '/place';
var MAX_PLACES_PER_QUERY = 100;
var DEFAULT_PLACES_PER_QUERY = 10;

function transferFile(file, cb) {
    var d = new Date();
    var randomString = crypto.createHash('md5').update(Math.random() + '').digest('hex');
    var publicPath = 'public';
    var imagePath = 'photos/' + format('%d-%d-%d-%s-%s', d.getFullYear(), d.getMonth(), d.getDay(), randomString, file.name);
    var is = fs.createReadStream(file.path);
    var os = fs.createWriteStream(path.join(publicPath, imagePath));
    is.pipe(os);
    is.on('end', function() {
        fs.unlink(file.path, function(err) {
            if (err) {
                return cb(imagePath, err);
            }
            cb(imagePath, null);
        });
    });
}

function createPlace(req, res) {
    var uploadedFiles = [];
    var photoFiles = (req.files && req.files.photos) || [];
    if (!(photoFiles instanceof Array)) {
        photoFiles = [ photoFiles ];
    }
    async.each(photoFiles, function(file, cb) {
        // upload each file asynchronously and remember which of them were processed
        transferFile(file, function(result, err) {
            if (err) {
                return cb(err);
            }
            uploadedFiles.push(result);
            cb();
        });
    }, function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        // finally create Place object and save it to the database
        var place = new Place({
            user: req.body.userId,
            celebId: req.body.celebId,
            message: req.body.message,
            photos: uploadedFiles,
            location: {
                latitude: req.body.location.latitude,
                longtitude: req.body.location.longtitude
            },
            ctime: Date.now()
        });
        place.save(function(err, place) {
            if (err) {
                if (err.name === 'ValidationError') {
                    return res.status(422).send(err.message);
                }
                return res.status(500).send(err.message);
            }
            res.send({placeId: place._id});
        });
    });
}

function updatePlace(req, res) {
    var placeToUpdate = {
        celebId: req.body.celebId
    };
    if (req.body.message) {
        placeToUpdate.message = req.body.message;
    }
    Place.update({_id: req.params.placeId}, placeToUpdate, {upsert: false, multi: false}, function(err, numAffected) {
        if (err) {
            return res.status(500).send('Can not update place: ' + req.params.placeId + ': ' + err.message);
        }
        res.send('Place: ' + req.params.placeId + ' was successfully updated. Affected: ' + numAffected);
    });
}

function listPlaces(req, res) {
    var skip = req.query.skip ? req.query.skip : 0;
    var limit = req.query.limit ? Math.min(MAX_PLACES_PER_QUERY, req.query.limit) : DEFAULT_PLACES_PER_QUERY;
    Place.find({}).sort({'ctime': -1}).skip(skip).limit(limit).populate('user', 'email _id').exec(function(err, places) {
        if (err) {
            throw err;
        }
        res.send(places);
    });
}

function listUserPlaces(req, res) {
    var skip = req.query.skip ? req.query.skip : 0;
    var limit = req.query.limit ? Math.min(MAX_PLACES_PER_QUERY, req.query.limit) : DEFAULT_PLACES_PER_QUERY;
    Place.find({user: req.params.userId}).sort({ctime: -1}).skip(skip).limit(limit).populate('user', 'email _id').exec(function(err, places) {
        if (err) {
            throw err;
        }
        res.send(places);
    });
}

function showPlace(req, res) {
    Place.findOne({_id: req.params.placeId}).populate('user', 'email _id').exec(function(err, place) {
        if (err) {
            throw err;
        }
        if (!place) {
            return res.status(404).send('Place with id: ' + req.params.placeId + ' was not found');
        }
        res.send(place);
    });
}

function deletePlace(req, res) {
    Place.remove({_id: req.params.placeId}, function(err) {
        if (err) {
            return res.status(500).send('Can not remove place with id: ' + req.params.placeId);
        }
        res.send('Place with id: ' + req.params.placeId + ' was successfully removed');
    });
}

module.exports = function(app) {
    app.get(prefix, listPlaces);
    app.get(prefix + '/list/:userId', listUserPlaces);
    app.post(prefix, User.populateSession, User.requireRole('admin'), createPlace);
    app.put(prefix + '/:placeId', User.populateSession, User.requireRole('admin'), updatePlace);
    app.get(prefix + '/:placeId', showPlace);
    app.del(prefix + '/:placeId', User.populateSession, User.requireRole('admin'), deletePlace);
};
