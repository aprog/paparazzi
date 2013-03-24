var mongoose = require('mongoose');
var Place = mongoose.model('Place');
var fs = require('fs');
var format = require('util').format;
var async = require('async');

function transferFile(from, to, cb) {
    var is = fs.createReadStream(from);
    var os = fs.createWriteStream(to);
    is.pipe(os);
    is.on('end', function(err) {
        fs.unlink(from, function(err) {
            if (err) {
                cb(err);
            }
            cb();
        });
    });
}

exports.create = function(req, res, next) {
    var uploadedFiles = [];
    var d = new Date();
    var photoFiles = req.files.photos || [];
    async.each(photoFiles,
        /* upload each file asynchronously and remember which of them were processed */
        function(file, cb) {
            var from = file.path;
            var filePath = 'public/photos/';
            var to = filePath + format('%d-%d-%d-%s', d.getFullYear(), d.getMonth(), d.getDay(), file.name);
            uploadedFiles.push(to);
            transferFile(from, to, cb);
        },
        /* finally create Place object and save it to database */
        function(err) {
            if (err) {
                throw err;
            }
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
                res.send('Place was successfully created.');
            });
        }
    );
}

exports.update = function(req, res, next) {
    var placeToUpdate = {
        userId: req.body.userId,
        celebId: req.body.celebId
    }
    if (req.body.message) {
        placeToUpdate.message = req.body.message;
    }
    Place.update({_id: req.params.place_id}, placeToUpdate, {upsert: false, multi: false}, function(err, numAffected) {
        if (err) {
            return res.status(500).send('Can not update place: ' + req.params.place_id + ': ' + err.message);
        }
        res.send('Place: ' + req.params.place_id + ' was successfully updated. Affected: ' + numAffected);
    });
}

exports.list = function(req, res, next) {
    Place.find({}).sort({'ctime': -1}).exec(function(err, places) {
        if (err) {
            throw err;
        }
        res.send(places);
    });
}

exports.show = function(req, res, next) {
    Place.findOne({_id: req.params.place_id}, function(err, place) {
        res.send(place);
    });
}
