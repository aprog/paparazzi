var mongoose = require('mongoose');
var User = mongoose.model('User');
var prefix = '/user';

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
        res.send({userId: user._id});
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

    User.update({_id: req.params.userId}, userFields, {upsert: false, multi: false}, function(err, numAffected) {
        if (err) {
            return res.status(500).send('Can not update user: ' + req.params.userId + ': ' + err.message);
        }
        res.send('User: ' + req.params.userId + ' was successfully updated. Affected: ' + numAffected);
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
    User.findOne({_id: req.params.userId}, function(err, user) {
        if (err) {
            return res.status(404).send(err);
        }
        if (!user) {
            return res.status(404).send('User with id: ' + req.params.userId + ' was not found');
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
        res.send(user.token);
    });
}

function logoutUser(req, res) {
    User.logout(req.body.authToken, function(err, isLogouted) {
        if (err) {
            throw err;
        }
        req.session.destroy();
        res.send('Logout status: ' + isLogouted);
    });
}

function deleteUser(req, res) {
    User.remove({_id: req.params.userId}, function(err) {
        if (err) {
            return res.status(500).send('Can not remove user with id: ' + req.params.userId);
        }
        res.send('User with id: ' + req.params.userId + ' successfully removed');
    });
}

module.exports = function(app) {
    app.post(prefix, User.populateSession, User.requireRole('admin'), createUser);
    app.get(prefix + '/list', listUsers);
    app.get(prefix + '/getToken', getToken);
    app.post(prefix + '/logout', logoutUser);
    app.get(prefix + '/:userId', showUser);
    app.put(prefix + '/:userId', User.populateSession, User.requireRole('admin'), updateUser);
    app.del(prefix + '/:userId', User.populateSession, User.requireRole('admin'), deleteUser);
};
