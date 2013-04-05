var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.create = function(req, res, next) {
    var user = new User({
        email: req.body.email,
        password: User.encryptPassword(req.body.password)
    });
    user.save(function(err, user) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.send('User ' + user.email + ' was successfully created.');
    });
};

exports.update = function(req, res, next) {
    var userToUpdate = {
        email: req.body.email
    };
    if (req.body.password) {
        userToUpdate.password = User.encryptPassword(req.body.password);
    }

    User.update({_id: req.params.user_id}, userToUpdate, {upsert: false, multi: false}, function(err, numAffected) {
        if (err) {
            return res.status(500).send('Can not update user: ' + req.params.user_id + ': ' + err.message);
        }
        res.send('User: ' + req.params.user_id + ' was successfully updated. Affected: ' + numAffected);
    });
};

exports.list = function(req, res, next) {
    User.find({}, function(err, users) {
        if (err) {
            throw err;
        }
        res.send(users);
    });
};

exports.show = function(req, res, next) {
    User.findOne({_id: req.params.user_id}, function(err, user) {
        if (err) {
            throw err;
        }
        res.send(user);
    });
};
