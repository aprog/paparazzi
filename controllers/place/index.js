var mongoose = require('mongoose');
var Place = mongoose.model('Place');
var fs = require('fs');
var format = require('util').format;
var async = require('async');

function transferFile(file, cb) {
    var d = new Date();
    var filePath = 'public/photos/';

    var fileName = format('%d-%d-%d-%s', d.getFullYear(), d.getMonth(), d.getDay(), file.name);

    var is = fs.createReadStream(file.path);
    var os = fs.createWriteStream(filePath + fileName);

    console.log('Piping file: ' + file.path);
    is.pipe(os);

    is.on('end', function(err) {
        console.log('   Finished piping file: ' + file.path);
        console.log('   Starting unlinking file: ' + file.path);
        fs.unlink(file.path, function(err) {
            if (err) {
                cb(err);
            }
            console.log('   File: ' + file.path + ' was successfully unlinked');
            cb();
        });
    });
}

exports.create = function(req, res, next) {
    async.each(req.files.photos, transferFile, function(err) {
        if (err) {
            throw err;
        }
        console.log('All files were successfully processed.');
        res.send('OK');
    });
/*
    req.files.photos.forEach(function(photo) {
        var fileName = format('%d-%d-%d-%s', d.getFullYear(), d.getMonth(), d.getDay(), photo.name);

        var is = fs.createReadStream(photo.path);
        var os = fs.createWriteStream(filePath + fileName);
        console.log('Piping file: ' + photo.path);
        is.pipe(os);

        is.on('end', function(err) {
            if (err) {
                throw err;
            }
            console.log('Finished piping file');
        });

        console.log('Unlinking file: ' + photo.path);
        fs.unlink(photo.path, function(err) {
            var p = photo.path;
            if (err) {
                throw err;
            }
            console.log('File: ' + p + ' was successfully inlinked.');
        });
        uploadedFiles.push(filePath + fileName);
        console.log(filePath + fileName);
    });
    res.send(uploadedFiles);
*/
/*
    var place = new Place({
        userId: req.body.userId,
        celebId: req.body.celebId,
        message: req.body.message,
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
*/
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
