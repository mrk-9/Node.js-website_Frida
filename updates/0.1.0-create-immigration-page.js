var immigration = require('keystone').list('Immigration');
exports = module.exports = function (done) {
  new immigration.model(
    { title: 'Immigration' }).save(done);
}
