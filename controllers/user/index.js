var mongoose = require('mongoose');
var User = mongoose.model('User');
var prefix = '/user';

module.exports = function(app, options) {
    app.post(prefix, User.populateSession, User.requireRole('admin'), createUser);
    app.put(prefix + '/:user_id', User.populateSession, User.requireRole('admin'), updateUser);
    app.get(prefix + '/list', listUsers);
    app.get(prefix + '/:user_id', showUser);
    app.get(prefix + '/getToken', getToken);
    app.post(prefix + '/logout', logoutUser);
};

function createUser(req, res) {
    var userFields = {};

    // Loop through all fields that came in body.
    // If there will be unspecified fields - they will
    // not be added to the database, because they
    // are not described in mongoose scheme.
    for (var field in req.body) {
        userFields[field] = req.body[field];
    }

    if (userFields.password) {
        userFields.password = User.encryptPassword(userFields.password);
    }

    var user = new User(userFields);

    user.save(function(err, user) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.send('User ' + user.email + ' was successfully created');
    });
}

function updateUser(req, res) {
    var userFields = {};

    for (var field in req.body) {
        userFields[field] = req.body[field];
    }

    if (userFields.password) {
        userFields.password = User.encryptPassword(userFields.password);
    }

    // be aware, that Object.update does not run Scheme validators
    if (userFields.roles && !(userFields.roles instanceof Array)) {
        userFields.roles = [ userFields.roles ];
    }

    User.update({_id: req.params.user_id}, userFields, {upsert: false, multi: false}, function(err, numAffected) {
        if (err) {
            return res.status(500).send('Can not update user: ' + req.params.user_id + ': ' + err.message);
        }
        res.send('User: ' + req.params.user_id + ' was successfully updated. Affected: ' + numAffected);
    });
}

function listUsers(req, res) {
    User.find({}).limit(100).exec(function(err, users) {
        if (err) {
            throw err;
        }
        res.send(users);
    });
}

function showUser(req, res) {
    User.findOne({_id: req.params.user_id}, function(err, user) {
        if (err) {
            throw err;
        }
        res.send(user);
    });
}

function getToken(req, res) {
    if (!req.body.email || !req.body.password) {
        return res.status(404).send('Email and password are required');
    }
    var hashedPassword = User.encryptPassword(req.body.password);
    User.findOne({email: req.body.email, password: hashedPassword}, function(err, user) {
        if (err) {
            throw err;
        }
        if (!user) {
            return res.status(404).send('User with email: ' + req.body.email + ' and specified password was not found');
        }
        res.send(user.authToken);
    });
}

function logoutUser(req, res) {
    User.logout(req.body.authToken, function(err, isLogouted) {
        if (err) {
            throw err;
        }
        res.send('Logout status: ' + isLogouted);
    });
}
