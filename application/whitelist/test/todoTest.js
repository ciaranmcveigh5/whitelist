var expect = require('chai').expect;

var User = require('../models/user.js');
var routes = require('../routes/')

describe('user', function() {
    it('should be invalid if name is empty', function(done) {
        var user = new User();

        user.validate(function(err) {
            expect(err.errors.username).to.exist;
            expect(err.errors.password).to.exist;
            done();
        });
    });
});