/* global it:false */
/* global describe:false */

var request = require('request');
var fs = require('fs');
var path = require('path');
var async = require('async');
require('should');

var privilegedUser = null;

function getPrivilegedUser(cb) {
    request('http://localhost:3000/user/00000000000000000000aaee', function(error, response, body) {
        cb(JSON.parse(body));
    });
}

describe('Privileged user', function() {
    it('should retrieve user with admin privileges', function(done) {
        getPrivilegedUser(function(user) {
            user.should.have.property('_id');
            user._id.should.not.be.empty;
            user.should.have.property('roles');
            user.roles.should.be.an.instanceOf(Array);
            user.roles.should.include('admin');
            privilegedUser = user;
            done();
        });
    });
});

describe('User', function() {
    describe('#list()', function() {
        it('should retrieve list of users without error', function(done) {
            request('http://localhost:3000/user/list', function(error, response, body) {
                response.statusCode.should.equal(200);
                var parsedResponse = JSON.parse(body);
                parsedResponse.should.be.an.instanceOf(Array);

                var randomPosition = Math.floor(Math.random() * parsedResponse.length);
                var randomUser = parsedResponse[randomPosition];
                randomUser.should.have.property('_id');
                randomUser._id.should.not.be.empty;

                randomUser.should.have.property('email');
                randomUser.email.should.match(/.+@.+/);

                randomUser.should.have.property('password');
                randomUser.password.should.not.be.empty;

                randomUser.should.have.property('roles');
                randomUser.roles.should.be.an.instanceOf(Array);
                randomUser.should.have.property('token');
                done();
            });
        });
    });

    var newUserResponse = null;
    var newUser = null;
    describe('#create()', function() {
        it('should create a user without error', function(done) {
            request.post('http://localhost:3000/user', {
                form: {
                    authToken: privilegedUser.token,
                    email: 'test@mail.com',
                    password: 'test',
                    roles: ['user']
                }
            }, function(error, response, body) {
                response.statusCode.should.equal(200);
                body.should.not.be.empty;
                newUserResponse = JSON.parse(body);
                newUserResponse.should.have.property('userId');
                done();
            });
        });
    });

    describe('#get()', function() {
        it('should retrieve newly created user', function(done) {
            request('http://localhost:3000/user/' + newUserResponse.userId, function(e, r, body) {
                r.statusCode.should.equal(200);
                newUser = JSON.parse(body);
                newUser.should.have.property('email');
                newUser.email.should.equal('test@mail.com');
                newUser.should.have.property('roles');
                newUser.roles.should.include('user');
                newUser.should.have.property('token');
                newUser.token.should.not.be.empty;
                done();
            });
        });
    });

    describe('#update()', function() {
        it('should update newly created user', function(done) {
            request.put('http://localhost:3000/user/' + newUserResponse.userId, {
                form: {
                    authToken: privilegedUser.token,
                    roles: ['']
                }
            }, function(e, r) {
                r.statusCode.should.equal(200);
                done();
            });
        });

        it('should retrieve updated user', function(done) {
            request('http://localhost:3000/user/' + newUserResponse.userId, function(e, r, body) {
                r.statusCode.should.equal(200);
                var updatedUser = JSON.parse(body);
                updatedUser.should.have.property('roles');
                updatedUser.roles.should.not.include('user');
                done();
            });
        });
    });

    describe('#getToken()', function() {
        it('should retrieve user authentication token', function(done) {
            request('http://localhost:3000/user/getToken', {
                form: {
                    email: newUser.email,
                    password: 'test',
                    authToken: privilegedUser.token
                }
            }, function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                body.should.equal(newUser.token);
                done();
            });
        });

    });

    describe('#logout()', function() {
        it('should logout user (change authentication token)', function(done) {
            request.post('http://localhost:3000/user/logout', {
                form: {
                    authToken: newUser.token
                }
            }, function(e, r) {
                r.statusCode.should.equal(200);
                done();
            });
        });
        it('should retrieve user with changed authentication token', function(done) {
            request('http://localhost:3000/user/' + newUser._id, function(e, r, body) {
                r.statusCode.should.equal(200);
                var logoutedUser = JSON.parse(body);
                logoutedUser.should.have.property('token');
                logoutedUser.token.should.not.be.equal(newUser.token);
                done();
            });
        });
    });

    describe('#remove()', function() {
        it('should remove user with specified id', function(done) {
            request.del('http://localhost:3000/user/' + newUserResponse.userId, {
                form: {
                    authToken: privilegedUser.token
                }
            }, function(e, r) {
                r.statusCode.should.equal(200);
                done();
            });
        });
        it('should not retrieve deleted user', function(done) {
            request('http://localhost:3000/user/' + newUserResponse.userId, function(e, r) {
                r.statusCode.should.equal(404);
                done();
            });
        });
    });
});


describe('Celebrity', function() {
    describe('#list()', function() {
        it('should retrieve list of celebrities', function(done) {
            request('http://localhost:3000/celeb/list', function(e, r, body) {
                r.statusCode.should.equal(200);
                var parsedResponse = JSON.parse(body);
                parsedResponse.should.be.an.instanceOf(Array);

                var randomPosition = Math.floor(Math.random() * parsedResponse.length);
                var randomCelebrity = parsedResponse[randomPosition];
                randomCelebrity.should.have.property('name');
                randomCelebrity.name.should.not.be.empty;

                randomCelebrity.should.have.property('about');
                done();
            });
        });
    });

    var newCelebResponse = null;
    describe('#create()', function() {
        it('should create celebrity', function(done) {
            request.post('http://localhost:3000/celeb', {
                form: {
                    name: 'testCelebrityName',
                    about: 'Some text, that usually places in about field',
                    authToken: privilegedUser.token
                }
            }, function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                newCelebResponse = JSON.parse(body);
                newCelebResponse.should.have.property('celebId');
                done();
            });
        });
    });

    describe('#get()', function() {
        it('should retrieve newly created celebrity', function(done) {
            request('http://localhost:3000/celeb/' + newCelebResponse.celebId, function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                var newCeleb = JSON.parse(body);
                newCeleb.should.have.property('name');
                newCeleb.name.should.equal('testCelebrityName');
                newCeleb.should.have.property('about');
                newCeleb.about.should.equal('Some text, that usually places in about field');
                done();
            });
        });
    });

    describe('#update()', function() {
        it('should update celebrity with specified id', function(done) {
            request.put('http://localhost:3000/celeb/' + newCelebResponse.celebId, {
                form: {
                    authToken: privilegedUser.token,
                    name: 'newNameOfCelebrity',
                    about: 'new about text'
                }
            }, function(e, r) {
                r.statusCode.should.equal(200);
                done();
            });
        });
        it('should retrieve updated celebrity', function(done) {
            request('http://localhost:3000/celeb/' + newCelebResponse.celebId, function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                var updatedCelebrity = JSON.parse(body);
                updatedCelebrity.should.have.property('name');
                updatedCelebrity.name.should.equal('newNameOfCelebrity');
                updatedCelebrity.should.have.property('about');
                updatedCelebrity.about.should.equal('new about text');
                done();
            });
        });
    });

    describe('#remove()', function() {
        it('should remove celebrity with specified id', function(done) {
            request.del('http://localhost:3000/celeb/' + newCelebResponse.celebId, {
                form: {
                    authToken: privilegedUser.token
                }
            }, function(e, r) {
                r.statusCode.should.equal(200);
                done();
            });
        });
        it('should not retrieve deleted celebrity', function(done) {
            request('http://localhost:3000/celeb/' + newCelebResponse.celebId, function(e, r) {
                r.statusCode.should.equal(404);
                done();
            });
        });
    });

    describe('#create() with empty about field', function() {
        it('should create celebrity with empty about field', function(done) {
            request.post('http://localhost:3000/celeb', {
                form: {
                    name: 'testCelebrityName',
                    authToken: privilegedUser.token
                }
            }, function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                newCelebResponse = JSON.parse(body);
                newCelebResponse.should.have.property('celebId');
                done();
            });
        });
        it('should retrieve newly created celebrity with empty about field', function(done) {
            request('http://localhost:3000/celeb/' + newCelebResponse.celebId, function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                var newCeleb = JSON.parse(body);
                newCeleb.should.have.property('name');
                newCeleb.name.should.equal('testCelebrityName');
                newCeleb.should.have.property('about');
                newCeleb.about.should.be.empty;
                done();
            });
        });
    });

    describe('#remove() celebrity with empty about field', function() {
        it('should remove celebrity with specified id', function(done) {
            request.del('http://localhost:3000/celeb/' + newCelebResponse.celebId, {
                form: {
                    authToken: privilegedUser.token
                }
            }, function(e, r) {
                r.statusCode.should.equal(200);
                done();
            });
        });
        it('should not retrieve deleted celebrity', function(done) {
            request('http://localhost:3000/celeb/' + newCelebResponse.celebId, function(e, r) {
                r.statusCode.should.equal(404);
                done();
            });
        });
    });
});

describe('Place', function() {
    var newPlaceResponse = null;
    describe('#create()', function() {
        var randomUser = null;
        var randomCelebrity = null;
        it('should retrieve random user', function(done) {
            request('http://localhost:3000/user/list', function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                var userList = JSON.parse(body);
                userList.should.be.an.instanceOf(Array);
                var randomPosition = Math.floor(Math.random() * userList.length);
                randomUser = userList[randomPosition];
                randomUser.should.have.property('_id');
                randomUser._id.should.not.be.empty;
                done();
            });
        });

        it('should retrieve random celebrity', function(done) {
            request('http://localhost:3000/celeb/list', function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                var celebList = JSON.parse(body);
                var randomPosition = Math.floor(Math.random() * celebList.length);
                randomCelebrity = celebList[randomPosition];
                randomCelebrity.should.have.property('_id');
                randomCelebrity._id.should.not.be.empty;
                done();
            });
        });

        it('should create place', function(done) {
            fs.readdir(path.join(__dirname, 'media'), function(err, files) {
                var r = request.post('http://localhost:3000/place', function(e, r, body) {
                    body.should.not.be.empty;
                    newPlaceResponse = JSON.parse(body);
                    done();
                });

                var form = r.form();
                form.append('authToken', privilegedUser.token);
                form.append('userId', randomUser._id);
                form.append('celebId', randomCelebrity._id);
                form.append('message', 'test message');
                form.append('loc[lat]', '50.450809');
                form.append('loc[long]', '30.522871');

                var randomCount = Math.floor(Math.random() * 10); // ten - maximum photos per Place record
                var randomFileNum = null;
                var randomFile = null;
                for (var i = 0; i < randomCount; i++) {
                    randomFileNum = Math.floor(Math.random() * files.length);
                    randomFile = files[randomFileNum];
                    form.append('photos', fs.createReadStream(path.join(__dirname, 'media', randomFile)));
                }
            });
        });
    });

    describe('#get()', function() {
        it('should retrieve newly created place', function(done) {
            request('http://localhost:3000/place/' + newPlaceResponse.placeId, function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                var newPlace = JSON.parse(body);
                newPlace.should.have.property('userId');
                newPlace.userId.should.not.be.empty;

                newPlace.should.have.property('celebId');
                newPlace.celebId.should.not.be.empty;

                newPlace.should.have.property('message');
                newPlace.message.should.equal('test message');

                newPlace.should.have.property('loc');
                newPlace.loc.should.have.property('lat');
                newPlace.loc.lat.should.equal(50.450809);
                newPlace.loc.should.have.property('long');
                newPlace.loc.long.should.equal(30.522871);
                newPlace.should.have.property('photos');
                newPlace.photos.should.be.an.instanceOf(Array);

                async.each(newPlace.photos, function(photo, cb) {
                    request('http://localhost:3000/' + photo, function(e, r) {
                        r.statusCode.should.equal(200);
                        cb();
                    });
                }, function(err) {
                    if (err) {
                        done(err);
                    }
                    done();
                });
            });
        });
    });

    describe('#update()', function() {
        var randomCelebrity = null;
        it('should retrieve random celebrity', function(done) {
            request('http://localhost:3000/celeb/list', function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                var celebList = JSON.parse(body);
                var randomPosition = Math.floor(Math.random() * celebList.length);
                randomCelebrity = celebList[randomPosition];
                randomCelebrity.should.have.property('_id');
                randomCelebrity._id.should.not.be.empty;
                done();
            });
        });

        it('should update newly created place', function(done) {
            request.put('http://localhost:3000/place/' + newPlaceResponse.placeId, {
                form: {
                    authToken: privilegedUser.token,
                    message: 'updated message',
                    celebId: randomCelebrity._id
                }
            }, function(e, r) {
                r.statusCode.should.equal(200);
                done();
            });
        });

        it('should retrieve udpated place', function(done) {
            request('http://localhost:3000/place/' + newPlaceResponse.placeId, function(e, r, body) {
                r.statusCode.should.equal(200);
                var updatedPlace = JSON.parse(body);
                updatedPlace.should.have.property('celebId');
                updatedPlace.celebId.should.equal(randomCelebrity._id);
                updatedPlace.should.have.property('message');
                updatedPlace.message.should.equal('updated message');
                done();
            });
        });
    });

    describe('#list()', function() {
        it('should retrieve list of places', function(done) {
            request('http://localhost:3000/place/list', function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                var placeList = JSON.parse(body);
                placeList.should.be.an.instanceOf(Array);
                var randomPosition = Math.floor(Math.random() * placeList.length);
                var randomPlace = placeList[randomPosition];
                randomPlace.should.have.property('_id');
                randomPlace._id.should.not.be.empty;

                randomPlace.should.have.property('celebId');
                randomPlace.celebId.should.not.be.empty;

                randomPlace.should.have.property('userId');
                randomPlace.userId.should.not.be.empty;

                randomPlace.should.have.property('ctime');
                randomPlace.ctime.should.not.be.empty;

                randomPlace.should.have.property('loc');
                randomPlace.loc.should.have.property('lat');
                randomPlace.loc.lat.should.be.a('number');


                randomPlace.loc.should.have.property('long');
                randomPlace.loc.long.should.be.a('number');

                randomPlace.should.have.property('message');
                randomPlace.message.should.not.be.empty;

                randomPlace.should.have.property('photos');
                randomPlace.photos.should.be.an.instanceOf(Array);

                done();
            });
        });
    });

    describe('#remove', function() {
        it('should remove newly created place', function(done) {
            request.del('http://localhost:3000/place/' + newPlaceResponse.placeId, {
                form: {
                    authToken: privilegedUser.token,
                }
            }, function(e, r, body) {
                r.statusCode.should.equal(200);
                done();
            });
        });

        it('should not retrieve removed place', function(done) {
            request('http://localhost:3000/place/' + newPlaceResponse.placeId, function(e, r, body) {
                r.statusCode.should.equal(404);
                done();
            });
        });
    });

});
