var keystone = require('keystone');

exports = module.exports = function(req,res){
		
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	var cview = req.query.view || false;
	
	locals.adminView = false;
	if(req.user.role == 'Admin' && cview != 'personal'){
		locals.adminView = true;
	}
	
	view.render('scheduling-calendar');
	
};