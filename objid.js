var mongoose = require('mongoose');
exports = module.exports = function(c){
	
	return mongoose.mongo.BSONPure.ObjectID.fromHexString(c);
	
};