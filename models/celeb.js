var mongoose = require('mongoose');

var celebSchema = mongoose.Schema({
    name: {type: String, require: true},
    about: {type: String, default: ''}
});

mongoose.model('Celeb', celebSchema);
