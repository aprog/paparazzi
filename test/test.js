/* global it:false */
/* global describe:false */

var assert = require('assert');
var request = require('request');
require('should');

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

    var privilegedUser = null;
    var newUserResponse = null;
    describe('#create()', function() {
        it('should retrieve user with admin privileges', function(done) {
            request('http://localhost:3000/user/00000000000000000000aaee', function(error, response, body) {
                response.statusCode.should.equal(200);
                privilegedUser = JSON.parse(body);
                privilegedUser.roles.should.include('admin');
                done();
            });
        });

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
