var mongoose = require('mongoose');
var Place = mongoose.model('Place');

exports.create = function(req, res, next) {
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
