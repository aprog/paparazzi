/* global it:false */
/* global describe:false */

var request = require('request');
var fs = require('fs');
var path = require('path');
var async = require('async');
var commonUtils = require('./common.js');
require('should');

var privilegedUser = null;

describe('Wait for privileged user load', function() {
    it('wait until user with admin privileges load', function(done) {
        while(!commonUtils.privilegedUser) {}
        privilegedUser = commonUtils.privilegedUser;
        done();
    });
});

describe('Place', function() {
    var newPlaceResponse = null;
    var randomUser = null;
    describe('#create()', function() {
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
                form.append('location[latitude]', '50.450809');
                form.append('location[longtitude]', '30.522871');

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

        it('should not created place without privileged permissions', function(done) {
            request.post('http://localhost:3000/place', {
                form: {
                    authToken: 'nonexistent-token'
                }
            }, function(e, r) {
                r.statusCode.should.equal(401);
                done();
            });
        });

        it('should not created place without user', function(done) {
            request.post('http://localhost:3000/place', {
                form: {
                    authToken: privilegedUser.token,
                    celebId: randomCelebrity._id,
                    message: 'test-2 message',
                    location: {
                        latitude: '50.450809',
                        longtitude: '30.522871'
                    }
                }
            }, function(e, r) {
                r.statusCode.should.equal(422);
                done();
            });
        });
    });

    describe('#get()', function() {
        it('should retrieve newly created place', function(done) {
            request('http://localhost:3000/place/' + newPlaceResponse.placeId, function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                var newPlace = JSON.parse(body);
                newPlace.should.have.property('user');
                newPlace.user.should.be.an.instanceOf(Object);
                newPlace.user.should.have.property('email');
                newPlace.user.email.should.not.be.empty;
                newPlace.user.should.have.property('_id');
                newPlace.user._id.should.not.be.empty;

                newPlace.should.have.property('celebId');
                newPlace.celebId.should.not.be.empty;

                newPlace.should.have.property('message');
                newPlace.message.should.equal('test message');

                newPlace.should.have.property('location');
                newPlace.location.should.have.property('latitude');
                newPlace.location.latitude.should.equal(50.450809);
                newPlace.location.should.have.property('longtitude');
                newPlace.location.longtitude.should.equal(30.522871);
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

        it('should not retrieve nonexistent place', function(done) {
            request('http://localhost:3000/place/000000000000000000000000', function(e, r) {
                r.statusCode.should.equal(404);
                done();
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

        it('should not update place without privileged permissions', function(done) {
            request.put('http://localhost:3000/place/' + newPlaceResponse.placeId, {
                form: {
                    authToken: 'nonexistent-token',
                    message: 'updated message',
                    celebId: randomCelebrity._id
                }
            }, function(e, r) {
                r.statusCode.should.equal(401);
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

                randomPlace.should.have.property('user');
                randomPlace.user.should.be.an.instanceOf(Object);
                randomPlace.user.should.have.property('email');
                randomPlace.user.email.should.not.be.empty;
                randomPlace.user.should.have.property('_id');
                randomPlace.user._id.should.not.be.empty;

                randomPlace.should.have.property('ctime');
                randomPlace.ctime.should.not.be.empty;

                randomPlace.should.have.property('location');
                randomPlace.location.should.have.property('latitude');
                randomPlace.location.latitude.should.be.a('number');

                randomPlace.location.should.have.property('longtitude');
                randomPlace.location.longtitude.should.be.a('number');

                randomPlace.should.have.property('message');
                randomPlace.message.should.not.be.empty;

                randomPlace.should.have.property('photos');
                randomPlace.photos.should.be.an.instanceOf(Array);

                done();
            });
        });

        it('should retrieve user places', function(done) {
            request('http://localhost:3000/place/list/' + randomUser._id, function(e, r, body) {
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

                randomPlace.should.have.property('user');
                randomPlace.user.should.be.an.instanceOf(Object);
                randomPlace.user.should.have.property('email');
                randomPlace.user.email.should.not.be.empty;
                randomPlace.user.should.have.property('_id');
                randomPlace.user._id.should.not.be.empty;

                randomPlace.should.have.property('ctime');
                randomPlace.ctime.should.not.be.empty;

                randomPlace.should.have.property('location');
                randomPlace.location.should.have.property('latitude');
                randomPlace.location.latitude.should.be.a('number');

                randomPlace.location.should.have.property('longtitude');
                randomPlace.location.longtitude.should.be.a('number');

                randomPlace.should.have.property('message');
                randomPlace.message.should.not.be.empty;

                randomPlace.should.have.property('photos');
                randomPlace.photos.should.be.an.instanceOf(Array);

                done();
            });
        });

        it('should retrieve empty places list for nonexistent user', function(done) {
            request('http://localhost:3000/place/list/000000000000000000000000', function(e, r, body) {
                r.statusCode.should.equal(200);
                var placeList = JSON.parse(body);
                placeList.should.be.an.instanceOf(Array);
                placeList.should.be.empty;
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
            }, function(e, r) {
                r.statusCode.should.equal(200);
                done();
            });
        });

        it('should not remove place without privileged permissions', function(done) {
            request.del('http://localhost:3000/place/' + newPlaceResponse.placeId, {
                form: {
                    authToken: 'nonexistent-token'
                }
            }, function(e, r) {
                r.statusCode.should.equal(401);
                done();
            });
        });

        it('should not retrieve removed place', function(done) {
            request('http://localhost:3000/place/' + newPlaceResponse.placeId, function(e, r) {
                r.statusCode.should.equal(404);
                done();
            });
        });
    });

});
