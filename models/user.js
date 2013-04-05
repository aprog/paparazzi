var mongoose = require('mongoose');
var crypto = require('crypto');

var userSchema = mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    authToken: {type: String, 'default': ''}
});

userSchema.statics.encryptPassword = function(rawPassword) {
    return crypto.createHash('sha256').update(rawPassword).digest('hex');
};

mongoose.model('User', userSchema);
