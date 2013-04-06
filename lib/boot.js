var express = require('express');
var fs = require('fs');

module.exports = function(parent, options) {
    var verbose = options.verbose;

    var models_path = __dirname + '/../models';
    console.log('\nModels:');
    fs.readdirSync(models_path).forEach(function(model) {
        if (verbose) console.log('     %s', model);
        require(models_path + '/' + model);
    });

    fs.readdirSync(__dirname + '/../controllers').forEach(function(name) {
        var app = express();
        var obj = require('./../controllers/' + name)(parent, {});
        app.set('views', __dirname + './../controllers/' + name + '/views');
        parent.use(app);
    });
};
