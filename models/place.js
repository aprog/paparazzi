var mongoose = require('mongoose');

var placeSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, required: true},
    celebId: {type: mongoose.Schema.Types.ObjectId, required: true},
    message: {type: String, 'default': ''},
    loc: {
        lat: Number,
        'long': Number
    },
    ctime: {type: Date, 'default': Date.now},
    photos: {type: Array, 'default': []}
});

mongoose.model('Place', placeSchema);
