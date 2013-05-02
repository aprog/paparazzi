/* global it:false */
/* global describe:false */

var assert = require('assert');
var request = require('request');
require('should');

var privilegedUser = null;

describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1, 2, 3].indexOf(5));
            assert.equal(-1, [1, 2, 3].indexOf(0));
        });
        it('this is test stub', function() {

        });
    });
});

describe('Privileged user', function() {
    it('should retrieve user with admin privileges', function(done) {
        request('http://localhost:3000/user/00000000000000000000aaee', function(error, response, body) {
            response.statusCode.should.equal(200);
            body.should.not.be.empty;
            privilegedUser = JSON.parse(body);
            privilegedUser.roles.should.include('admin');
            done();
        });
    });
});

describe.skip('User', function() {
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

        it('should retrieve newly created user', function(done) {
            request('http://localhost:3000/user/' + newUserResponse.userId, function(e, r, body) {
                r.statusCode.should.equal(200);
                var newUser = JSON.parse(body);
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
            request('http://localhost:3000/user/' + newCelebResponse.celebId, function(e, r) {
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
            request('http://localhost:3000/user/' + newCelebResponse.celebId, function(e, r) {
                r.statusCode.should.equal(404);
                done();
            });
        });
    });

});
