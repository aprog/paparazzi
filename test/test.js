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
    describe('#save()', function() {
        it('should retrieve list of users without error', function(done) {
            request('http://localhost:3000/user/list', function(error, response, body) {
                response.statusCode.should.equal(200);
                var parsedResponse = JSON.parse(body);
                parsedResponse.should.be.an.instanceOf(Array);

                var randomPosition = Math.floor(Math.random() * parsedResponse.length);
                var randomUser = parsedResponse[randomPosition];
                randomUser.should.have.property('_id');
                randomUser['_id'].should.not.be.empty;

                randomUser.should.have.property('email');
                randomUser['email'].should.match(/.+@.+/);

                randomUser.should.have.property('password');
                randomUser['password'].should.not.be.empty;

                randomUser.should.have.property('roles');
                randomUser.roles.should.be.an.instanceOf(Array);
                randomUser.should.have.property('authToken');
                done();
            });
        });
    });
});
