var keystone = require('keystone');
var async = require('async');

exports = module.exports = {
	
	ourMission: function(req,res){
		
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		locals.active = 'about';
		
		view.on('init',function(next){
			
			keystone.list('Approach').model.findOne({'_id':'572cc65e0840870552c8ce88'}).populate('users').exec(function(err,result){
				locals.approach = result;
				next(err);
			});
			
		});
		
		view.render('our-mission');
		
	},
	
	ourTeam: function(req,res){
		
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		locals.active = 'about';
		
		view.on('init', function(next) {
			
			keystone.list('Team').model.findOne({'_id':'572cc66e0840870552c8ce89'}).populate('users').exec(function(err,results){
				locals.team = results;
				next(err);
			});
			
		});
		
		view.render('our-team');
		
	},
	
	faq: function(req,res){
		
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		locals.active = 'about';
		view.on('init', function(next) {
			
			keystone.list('FAQ').model.find({'category':'572ba265d3e227aa41103086'}).exec(function(err,results){
				locals.faqs = results;
				next(err);
			});
			
		});
		
		view.render('faq');
		
	}
};