var mongoose = require('mongoose');
var crypto = require('crypto');

var userSchema = mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    authToken: {type: String, 'default': generateToken},
    roles: {type: Array, 'default': []}
});

userSchema.statics.encryptPassword = function(rawPassword) {
    return crypto.createHash('sha256').update(rawPassword).digest('hex');
};

userSchema.statics.generateToken = generateToken;

userSchema.statics.logout = function(authToken, cb) {
	if (!authToken) {
		return cb(new Error('Empty auth token'));
	}
	var newToken = this.generateToken();
	this.update({authToken: authToken}, {$set: {authToken: newToken}}, {multi: false}, cb);
};

userSchema.statics.populateSession = function(req, res, next) {
	if (!req.body.authToken) {
		return next('Auth token is empty');
	}
	mongoose.model('User').findOne({authToken: req.body.authToken}, function(err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return next('User with specified auth token was not found');
		}
		req.session.user = user;
		next();
	});
};

userSchema.statics.requireRole = function(role) {
	return function(req, res, next) {
		var userRoles = req.session.user.roles || [];
		for (var i = 0; i < userRoles.length; i++) {
			if (userRoles[i] === role) {
				return next();
			}
		}
		next('User do not have permission to do required operation');
	};
};

mongoose.model('User', userSchema);

function generateToken() {
	return crypto.createHash('sha256').update(Math.random() + '').digest('hex');
}
