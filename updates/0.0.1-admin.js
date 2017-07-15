var keystone = require('keystone'),
    User = keystone.list('User');
 
exports = module.exports = function(done) {
    
    new User.model({
        name: { first: 'Admin', last: 'User' },
        email: 'admin@fridakahlo.test',
        password: 'changeme',
        canAccessKeystone: true
    }).save(done);
    
};
