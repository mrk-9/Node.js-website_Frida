var keystone = require('keystone');
var async = require('async');

exports = module.exports = {
	
	categoryView: function(req,res){
		
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		locals.active = 'programs';
		
		var cat = req.params.category;
		
		var id = false;
		switch(cat){
			case 'rise':
				id = '5735eeccba9990eb0d1790cb';
			break;
			case 'health':
				id = '5735eed7ba9990eb0d1790cc';
			break;
		}
		
		view.on('init', function(next) {
			
			keystone.list('Program').model.find().where('categories').in([id]).exec(function(err,results){
				locals.programs = results;
				next(err);
			});
			
		});
		
		view.render('programs-list');
		
	},
	
	singleView: function(req,res){
		
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		locals.active = 'programs';
		
		var program = req.params.program;
		
		view.on('init', function(next) {
			keystone.list('Program').model
				.findOne({slug: program}).populate('categories gallery location')
				.exec(function(err,results){
						if (results) {
							locals.program = results;
							next(err);
						} else {
							res.status(404).render('errors/404');
						}
					});
		});
		
		view.render('program-details');
		
	},
	
	calendarView: function(req,res){
		
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		locals.active = 'programs';
		
		view.on('init', function(next) {
			next();
		});
		
		view.render('calendar');
		
	}
};
