var fs = require('fs');
var gm = require('gm');
var path = require('path');
var mkdirp = require('mkdirp');
var PUBLIC_DIR = __dirname + '/../public'
var PUBLIC_PHOTO_DIR = PUBLIC_DIR + '/photos';

function isOriginalPhotoExists(req, res, next) {
    var fileName = req.params[0];
    fs.exists(path.join(PUBLIC_DIR, fileName), function(exist) {
        if (exist) {
            next();
        } else {
            next('Original photo does not exists');
        }
    });
}

function isResizedPhotoExists(req, res, next) {
    var fileName = req.params[0];
    fs.exists(path.join(PUBLIC_PHOTO_DIR, req.params.size, fileName), function(exist) {
        if (exist) {
            console.log('Phoso exists, returning it ...');
            res.sendfile(path.join(req.params.size, fileName), {root: PUBLIC_PHOTO_DIR});
        } else {
            console.log('Photo does not exists, resizing one ...');
            next();
        }
    });
}

function checkDestinationDirectory(dirName, cb) {
    fs.exists(dirName, function(exists) {
        if (!exists) {
            return fs.mkdir(dirName, cb);
        }
        cb();
    });
}

function resizePhoto(req, res) {
    var width = null;
    var height = null;
    var fileName = req.params[0];
    switch(req.params.size) {
    case 'small':
        width = 100;
        height = 100;
        break;
    case 'middle':
        width = 500;
        height = 500;
        break;
    case 'large':
        width = 1500;
        height = 1500;
        break;
    default:
        console.log('Requested photo size was not found, returning original ...');
        res.sendfile(fileName, {root: PUBLIC_DIR});
        return;
    }

    var originalPhotoPath = path.join(PUBLIC_DIR, fileName);
    var originalPhotoDir = path.dirname(fileName);
    var resizedPhotoPath = path.join(PUBLIC_PHOTO_DIR, req.params.size, fileName);

    mkdirp(path.join(PUBLIC_PHOTO_DIR, req.params.size, originalPhotoDir), function(err) {
        if (err) {
            throw err;
        }

        var readStream = fs.createReadStream(originalPhotoPath);
        var writeStream = fs.createWriteStream(resizedPhotoPath);
        console.log(originalPhotoPath);

        gm(readStream)
            .resize(width, height)
            .stream(function(err, stdout) {
                stdout.pipe(writeStream);
                stdout.on('end', function() {
                    res.sendfile(path.join(req.params.size, fileName), {root: PUBLIC_PHOTO_DIR});
                });
            });
    });
}
module.exports = function(app) {
    /*
        Resize photo based on path to original photo.
        URL is /resize/[size]/[path-to-original-photo]/[photo-file-name]
        for example:
        /resize/small/photos/nature.jpg OR
        /resize/small/photos/travel/summer/nature.jpg
    */
    app.get('/resize/:size/*', isOriginalPhotoExists, isResizedPhotoExists, resizePhoto);
};
