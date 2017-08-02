const assert = require('chai').assert;
const register = require('../public/scripts/testing.js');

describe('App', function() {
    it('app should return hello', function() {
        let result = register.hello();
        assert.equal(result, 'hello');
    });

    it('return type of string', function() {
        let result = register.hello();
        assert.typeOf(result, 'string');
    });
});