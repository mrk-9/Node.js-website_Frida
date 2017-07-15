var keystone = require('keystone');

exports = module.exports = {
	
	list: function(req, res) {
	
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		// Set locals
		locals.active = 'gallery';
		
		// Load the galleries by sortOrder
		view.query('galleries', keystone.list('Gallery').model.find().sort('sortOrder'));
		
		// Render the view
		view.render('gallery-list');
	
	},
	
	single: function(req, res){
		
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		locals.active = 'gallery';
		
		locals.gallery = {};
		
		var galleryId = req.params.gallery;
		
		
		view.on('init',function(next){
			keystone.list('Gallery').model.findOne({slug:galleryId}).exec(function(err, results) {
				locals.gallery = results;
				next(err);
			});
		});
		
		view.render('gallery-single');
	}
	
};
