var mongoose = require('mongoose');
var Place = mongoose.model('Place');
var User = mongoose.model('User');
var fs = require('fs');
var format = require('util').format;
var async = require('async');
var crypto = require('crypto');
var prefix = '/place';

function transferFile(file, cb) {
    var d = new Date();
    var randomString = crypto.createHash('md5').update(Math.random() + '').digest('hex');
    var uploadTo = 'public/photos/' + format('%d-%d-%d-%s-%s', d.getFullYear(), d.getMonth(), d.getDay(), randomString, file.name);
    var is = fs.createReadStream(file.path);
    var os = fs.createWriteStream(uploadTo);
    is.pipe(os);
    is.on('end', function() {
        fs.unlink(file.path, function(err) {
            if (err) {
                return cb(uploadTo, err);
            }
            cb(uploadTo, null);
        });
    });
}

function createPlace(req, res) {
    var uploadedFiles = [];
    var photoFiles = req.files.photos || [];
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
            userId: req.body.userId,
            celebId: req.body.celebId,
            message: req.body.message,
            photos: uploadedFiles,
            loc: {
                lat: req.body.loc.lat,
                'long': req.body.loc.long
            },
            ctime: Date.now()
        });
        place.save(function(err, place) {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.send({placeId: place._id});
        });
    });
}

function updatePlace(req, res) {
    var placeToUpdate = {
        userId: req.body.userId,
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
    Place.find({}).sort({'ctime': -1}).limit(100).exec(function(err, places) {
        if (err) {
            throw err;
        }
        res.send(places);
    });
}

function showPlace(req, res) {
    Place.findOne({_id: req.params.placeId}, function(err, place) {
        res.send(place);
    });
}

module.exports = function(app) {
    app.all(prefix, User.populateSession);

    app.post(prefix, User.requireRole('admin'), createPlace);
    app.put(prefix + '/:place_id', User.requireRole('admin'), updatePlace);
    app.get(prefix + '/list', listPlaces);
    app.get(prefix + '/:place_id', showPlace);
};
