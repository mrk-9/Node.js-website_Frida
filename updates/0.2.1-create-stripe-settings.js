var stripeSettings = require('keystone').list('StripeSettings');
exports = module.exports = function (done) {
  new stripeSettings.model().save(done);
}
