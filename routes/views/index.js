var keystone = require('keystone');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';
	
	view.on('init',function(next){
		keystone.list('Slider').model.find().sort('+sortOrder').exec(function(err,result){
			locals.slides = result;
			console.log(result[0]);
			next(err);
		});
	});
	
	view.on('init',function(next){
		keystone.list('Program').model.find({featured: true}).exec(function(err,result){
			locals.featuredPrograms = result;
			next(err);
		});
	});
	
	view.on('init',function(next){
		keystone.list('Post').model.find()
		.sort('-publishedDate')
		.limit(1)
		.populate('author categories')
		.exec(function(err,result){
			if(result.length > 0){
				locals.post = result[0];
			}
			next(err);
		});
	});
	
	// Render the view
	view.render('index-new');
	
};
