/* global it:false */
/* global describe:false */

var request = require('request');
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

describe('Celebrity', function() {
    describe('#list()', function() {
        it('should retrieve list of celebrities', function(done) {
            request('http://localhost:3000/celeb', function(e, r, body) {
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
    var newCelebWithoutAboutResponse = null;
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

        it('should create celebrity with empty about field', function(done) {
            request.post('http://localhost:3000/celeb', {
                form: {
                    name: 'testCelebrityName',
                    authToken: privilegedUser.token
                }
            }, function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                newCelebWithoutAboutResponse = JSON.parse(body);
                newCelebWithoutAboutResponse.should.have.property('celebId');
                done();
            });
        });

        it('should retrieve newly created celebrity with empty about field', function(done) {
            request('http://localhost:3000/celeb/' + newCelebWithoutAboutResponse.celebId, function(e, r, body) {
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

        it('should not create celebrity without name', function(done) {
            request.post('http://localhost:3000/celeb', {
                form: {
                    about: 'Some about test',
                    authToken: privilegedUser.token
                }
            }, function(e, r) {
                r.statusCode.should.equal(422);
                done();
            });
        });
        it('shout not create celebrity without privileged permissions', function(done) {
            request.post('http://localhost:3000/celeb', {
                form: {
                    name: 'testCelebrityName',
                    about: 'Some text',
                    authToken: 'nonexistent-token'
                }
            }, function(e, r) {
                r.statusCode.should.equal(401);
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
        it('should not retrieve nonexistent celebrity', function(done) {
            request('http://localhost:3000/celeb/000000000000000000000000', function(e, r) {
                r.statusCode.should.equal(404);
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
        it('should not update celebrity without privileged permissions', function(done) {
            request.put('http://localhost:3000/celeb/' + newCelebResponse.celebId, {
                form: {
                    about: 'updated about text'
                }
            }, function(e, r) {
                r.statusCode.should.equal(401);
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

        it('should not remove celebrity without privileged permissions', function(done) {
            request.del('http://localhost:3000/celeb/' + newCelebResponse.celebId, {
                form: {
                    authToken: 'nonexistent-token'
                }
            }, function(e, r) {
                r.statusCode.should.equal(401);
                done();
            });
        });

        it('should remove celebrity with empty about field with specified id', function(done) {
            request.del('http://localhost:3000/celeb/' + newCelebWithoutAboutResponse.celebId, {
                form: {
                    authToken: privilegedUser.token
                }
            }, function(e, r) {
                r.statusCode.should.equal(200);
                done();
            });
        });

        it('should not retrieve deleted celebrity with empty about field', function(done) {
            request('http://localhost:3000/celeb/' + newCelebWithoutAboutResponse.celebId, function(e, r) {
                r.statusCode.should.equal(404);
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
