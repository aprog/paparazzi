var mongoose = require('mongoose');
var User = mongoose.model('User');
var prefix = '/user';

module.exports = function(app, options) {
    app.post(prefix, createUser);
    app.put(prefix + '/update/:user_id', updateUser);
    app.get(prefix + '/list', listUsers);
    app.get(prefix + '/show/:user_id', showUser);
    app.post(prefix + '/authenticate', authenticateUser);
    app.get(prefix + '/logout', logoutUser);
};

function createUser(req, res) {
    var user = new User({
        email: req.body.email,
        password: User.encryptPassword(req.body.password)
    });
    user.save(function(err, user) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.send('User ' + user.email + ' was successfully created');
    });
}

function updateUser(req, res) {
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
}

function listUsers(req, res) {
    User.find({}, function(err, users) {
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

function authenticateUser(req, res) {
    User.authenticate(req.body.email, req.body.password, function(err, user) {
        if (err) {
            return res.status(404).send(err.message);
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
