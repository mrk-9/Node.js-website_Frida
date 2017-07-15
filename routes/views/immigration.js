var keystone = require('keystone');
var async = require('async');

exports = module.exports = {
	
	faq: function(req,res){
		
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		locals.active = 'immigration';
		
		console.log(view.on('init', function(next) {
			
			keystone.list('FAQ').model.find({'category':'572ba257d3e227aa41103085'}).exec(function(err,results){
				locals.faqs = results;
				next(err);
			});
			
		}));
		
		view.render('faq');
		
	},

  page: function (req, res) {

    var view = new keystone.View(req, res);
    res.locals.active = 'immigration-page2';
    view.on('init', function (next) {
      keystone.list('Immigration').model.findOne().exec(
        function (err, results) {
          res.locals.immigration = results;
          next(err);
        }) } ).render('immigration');

  }
	
};
