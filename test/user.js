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
        it('should not retrieve nonexistent user', function(done) {
            request('http://localhost:3000/user/000000000000000000000000', function(e, r) {
                r.statusCode.should.equal(404);
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

        it('should not update user without privileged permissions', function(done) {
            request.put('http://localhost:3000/user/' + newUserResponse.userId, {
                form: {
                    authToken: newUser.token,
                    roles: ['admin']
                }
            }, function(e, r) {
                r.statusCode.should.equal(401);
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
                }
            }, function(e, r, body) {
                r.statusCode.should.equal(200);
                body.should.not.be.empty;
                body.should.equal(newUser.token);
                done();
            });
        });
        it('should not retrieve token for nonexistent user', function(done) {
            request('http://localhost:3000/user/getToken', {
                form: {
                    email: 'nonexistent@mail.com',
                    password: 'nonexistent',
                }
            }, function(e, r, body) {
                r.statusCode.should.equal(404);
                done();
            });
        });
        it('should not retrieve token with unspecified email', function(done) {
            request('http://localhost:3000/user/getToken', {
                form: {
                    password: 'test',
                }
            }, function(e, r, body) {
                r.statusCode.should.equal(404);
                done();
            });
        });
        it('should not retrieve token with unspecified password', function(done) {
            request('http://localhost:3000/user/getToken', {
                form: {
                    email: newUser.email,
                }
            }, function(e, r, body) {
                r.statusCode.should.equal(404);
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
        it('should retrieve logged out user (with changed authentication token)', function(done) {
            request('http://localhost:3000/user/' + newUser._id, function(e, r, body) {
                r.statusCode.should.equal(200);
                var logoutedUser = JSON.parse(body);
                logoutedUser.should.have.property('token');
                logoutedUser.token.should.not.be.equal(newUser.token);
                done();
            });
        });
        it('should not log out user with nonexistent token', function(done) {
            request.post('http://localhost:3000/user/logout', {
                form: {
                    authToken: 'nonexistent-token'
                }
            }, function(e, r) {
                r.statusCode.should.equal(404);
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
        it('should not remove user with nonexistent id', function(done) {
            request.del('http://localhost:3000/user/000000000000000000000000', {
                form: {
                    authToken: privilegedUser.token
                }
            }, function(e, r, body) {
                r.statusCode.should.equal(404);
                done();
            });
        });
    });
});
