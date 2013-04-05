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
        if (verbose) console.log('\n%s:', name);
        var obj = require('./../controllers/' + name);
        name = obj.name || name;
        var prefix = obj.prefix || '';
        var app = express();
        var path = null;
        var method = null;

        app.set('views', __dirname + './../controllers/' + name + '/views');

        if (obj.before) {
            path = '/' + name + '/:' + name + '_id';
            app.all(path, obj.before);
            if (verbose) console.log('     ALL %s -> before', path);
            path = '/' + name + '/:' + name + '_id/*';
            app.all(path, obj.before);
            if (verbose) console.log('     ALL %s -> before', path);
        }

        for (var key in obj) {
            if (~['name', 'prefix', 'engine', 'before'].indexOf(key)) {
                continue;
            }

            switch (key) {
                case 'show':
                    method = 'get';
                    path = '/' + name + '/:' + name + '_id';
                    break;
                case 'list':
                    method = 'get';
                    path = '/' + name + 's';
                    break;
                case 'update':
                    method = 'put',
                    path = '/' + name + '/:' + name + '_id';
                    break;
                case 'create':
                    method = 'post';
                    path = '/' + name;
                    break;
                case 'index':
                    method = 'get';
                    path = '/';
                    break;
                default:
                    throw new Error('unrecognized route: ' + name + '.' + key);
            }

            path = prefix + path;
            app[method](path, obj[key]);
            if (verbose) console.log('     %s %s -> %s', method.toUpperCase(), path, key);
        }

        parent.use(app);
    });
};
