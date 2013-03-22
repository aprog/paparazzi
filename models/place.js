var mongoose = require('mongoose');

var placeSchema = mongoose.Schema({
    userId: {type: String, required: true},
    celebId: {type: String, required: true},
    ctime: {type: Date, default: Date.now},
    message: {type: String, default: ''}
});

mongoose.model('Place', placeSchema);
