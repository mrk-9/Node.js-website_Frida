var keystone = require('keystone');
var User = keystone.list('User');


exports = module.exports = function(req,res){
	
	var view = new keystone.View(req,res);
	
	var locals = res.locals;
	
	view.on('post', { action: 'update' }, function(next) {
		
		var editUser = req.user,
			updater = editUser.getUpdateHandler(req);
			
		var fields = 'name,email,image,bio,title,contact.email,contact.phone';
		
		var opt = ['password'];
		
		for(var i=0;i<opt.length;i++){
			if(req.body.hasOwnProperty(opt[i])){
				if( req.body[opt[i]].length == 0){
					continue;
				}
				fields +=','+opt[i];
			}
		}
		
		updater.process( req.body, {
			flashErrors: true,
			fields: fields,
			errorMessage: 'There was a problem saving your profile: '
		}, function(err) {
			console.log(err);
			if (err) {
				locals.validationErrors = err.errors;
				locals.profileSaved = false;
			}else{
				locals.profileSaved = true;
			}
			next();
		});
		
	});
	
	view.render('profile');
	
};