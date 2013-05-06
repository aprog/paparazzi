/* global it:false */
/* global describe:false */

var request = require('request');
require('should');

var privilegedUser = null;

describe('Privileged user', function() {
    it('should retrieve user with admin privileges', function(done) {
        request('http://localhost:3000/user/00000000000000000000aaee', function(error, response, body) {
            privilegedUser = JSON.parse(body);
            privilegedUser.should.have.property('_id');
            privilegedUser._id.should.not.be.empty;
            privilegedUser.should.have.property('roles');
            privilegedUser.roles.should.be.an.instanceOf(Array);
            privilegedUser.roles.should.include('admin');
            privilegedUser = privilegedUser;

            module.exports.privilegedUser = privilegedUser;
            done();
        });
    });
});

module.exports = {};
