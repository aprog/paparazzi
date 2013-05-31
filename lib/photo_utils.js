var fs = require('fs');
var gm = require('gm');
var path = require('path');
var PUBLIC_PHOTO = __dirname + '/../public/photos';

function isPhotoExists(req, res, next) {
    fs.exists(PUBLIC_PHOTO + '/' + req.params.size + '/' + req.params.fileName, function(exist) {
        if (exist) {
            console.log('Phoso exists, returning it ...');
            res.sendfile(req.params.size + '/' + req.params.fileName, {root: PUBLIC_PHOTO});
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
        res.sendfile(req.params.fileName, {root: PUBLIC_PHOTO});
        return;
    }

    var originalPhotoPath = path.join(PUBLIC_PHOTO, req.params.fileName);
    var resizedPhotoPath = path.join(PUBLIC_PHOTO, req.params.size, req.params.fileName);

    checkDestinationDirectory(path.join(PUBLIC_PHOTO, req.params.size), function(err) {
        if (err) {
            throw err;
        }

        var readStream = fs.createReadStream(originalPhotoPath);
        var writeStream = fs.createWriteStream(resizedPhotoPath);

        gm(readStream)
            .resize(width, height)
            .stream(function(err, stdout) {
                stdout.pipe(writeStream);
                stdout.on('end', function() {
                    res.sendfile(req.params.size + '/' + req.params.fileName, {root: PUBLIC_PHOTO});
                });
            });
    });
}

module.exports = function(app) {
    app.get('/image/:size/:fileName', isPhotoExists, resizePhoto);
};
