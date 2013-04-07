var mongoose = require('mongoose');
var crypto = require('crypto');

var userSchema = mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    authToken: {type: String, 'default': generateToken}
});

userSchema.statics.encryptPassword = function(rawPassword) {
    return crypto.createHash('sha256').update(rawPassword).digest('hex');
};

userSchema.statics.generateToken = generateToken;

userSchema.statics.authenticate = function(email, rawPassword, cb) {
	var password = this.encryptPassword(rawPassword);
	var self = this;
	this.findOne({email: email, password: password}, function(err, user) {
		if (err) {
			return cb(err);
		}
		if (!user) {
			return cb(new Error('User with email: ' + email + ' and specified password was not found'));
		}
		cb(null, user);
	});
};

userSchema.statics.ensureAuthenticated = function(req, res, next) {
	if (!req.body.authToken) {
		return next(new Error('User is not authenticated'));
	}
	mongoose.model('User').findOne({authToken: req.body.authToken}, function(err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return next(new Error('User is not authenticated'));
		}
		next();
	});
};

userSchema.statics.logout = function(authToken, cb) {
	if (!authToken) {
		return cb(new Error('Empty auth token'));
	}
	var newToken = this.generateToken();
	this.update({authToken: authToken}, {$set: {authToken: newToken}}, {multi: false}, cb);
};

mongoose.model('User', userSchema);

function generateToken() {
	return crypto.createHash('sha256').update(Math.random() + '').digest('hex');
}
