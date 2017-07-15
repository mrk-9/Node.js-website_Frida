var keystone = require('keystone');
var async = require('async');

exports = module.exports = {
	
	list: function(req,res){
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		// Init locals
		locals.active = 'blog';
		locals.filters = {
			category: req.params.category
		};
		locals.data = {
			posts: [],
			categories: [],
			recentPosts: []
		};
		
		// Load all categories
		view.on('init', function(next) {
			
			keystone.list('PostCategory').model.find().sort('name').exec(function(err, results) {
				
				if (err || !results.length) {
					return next(err);
				}
				
				locals.data.categories = results;
				
				// Load the counts for each category
				async.each(locals.data.categories, function(category, next) {
					
					keystone.list('Post').model.count().where('categories').in([category.id]).exec(function(err, count) {
						category.postCount = count;
						next(err);
					});
					
				}, function(err) {
					next(err);
				});
				
			});
			
		});
		
		view.on('init',function(next) {
			keystone.list('Aggregate List').model.findOne({slug:'tag-aggregator'}).exec(function(err,res){
				locals.data.tags = res.items;
				next(err);
			});
		});
		
		// Load the current category filter
		view.on('init', function(next) {
			
			if (req.params.category) {
				keystone.list('PostCategory').model.findOne({ key: locals.filters.category }).exec(function(err, result) {
					locals.data.category = result;
					next(err);
				});
			} else {
				next();
			}
			
		});
		
		view.on('init',function(next){
			
			var now = new Date();
			
			var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			
			var current_year  = now.getFullYear();
			var current_month = now.getMonth() + 1;
			
			var archives = [];
			
			
			
			for(var i=0;i<6;i++){
				current_month--;
				if(current_month < 0){
					current_month = 11;
					current_year--;
				}
				archives.push({
					url:'?archive='+(current_month+1 )+'-'+current_year,
					title: months[current_month] + ' ' + current_year
				});
			}
			
			locals.data.archives = archives;
			next();
		});
		
		// load six most recent posts
		view.on('init', function(next) {
			keystone.list('Post').paginate({
				page: 1,
				perPage: 6,
				maxPages: 1,
				filters: {
					'state': 'published'
				}
			})
			.sort('-publishedDate')
			.exec(function(err, results) {
				console.log(results);
				locals.data.recentPosts = results;
				next(err);
			});
		});
		
		// Load the posts
		view.on('init', function(next) {
			
			var query = req.query.search || false;
			var tag = req.query.tag || false;
			var archive = req.query.archive || false;
			
			var q = keystone.list('Post').paginate({
					page: req.query.page || 1,
					perPage: 10,
					maxPages: 10,
					filters: {
						'state': 'published'
					}
				})
				
			q.sort('-publishedDate').populate('author categories');
			
			if(query){
				locals.data.searchTerm = query;
				var exp = RegExp(query,'i');
				q.and([
					{ $or : [
						{'title': { $regex: exp } },
						{'content.extended': { $regex: exp } }
					] },
				]);
			}
			else if(archive){
				var t = archive.split('-');
				if(t.length == 2){
					var d = new Date();
					var year = parseInt(t[1]),
					  month  = parseInt(t[0])-1,
					  day   = 1;
					console.log(year);
					console.log(month);
					console.log(day);
					d.setFullYear(year,month,day);
					var start = new Date(d.toISOString());//1st day of month
					d.setMonth( d.getMonth() + 1);
					var end  = new Date(d.toISOString());

					console.log(start);
					console.log(end);
					q.where({
						publishedDate:  { $gte: start, $lte: end }
					});
					var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
					locals.data.archiveSelected = months[month] +' '+ year;
				}
				
			}
			else if(tag){
				locals.data.selectedTag = tag;
				q.where({tags: tag});
			}
			else if (locals.data.category) {
				q.where('categories').in([locals.data.category]);
			}
			
			
			q.exec(function(err, results) {
				locals.data.posts = results;
				next(err);
			});
			
		});
		
		// Render the view
		view.render('blog-list');
	},
	single: function(req,res){
		
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		// Set locals
		locals.active = 'blog';
		
		locals.filters = {
			post: req.params.post
		};
		locals.data = {
			posts: [],
			categories: []
		};
		
		view.on('init', function(next) {
			
			keystone.list('PostCategory').model.find().sort('name').exec(function(err, results) {
				
				if (err || !results.length) {
					return next(err);
				}
				
				locals.data.categories = results;
				
				// Load the counts for each category
				async.each(locals.data.categories, function(category, next) {
					
					keystone.list('Post').model.count().where('categories').in([category.id]).exec(function(err, count) {
						category.postCount = count;
						next(err);
					});
					
				}, function(err) {
					next(err);
				});
				
			});
		
		});
		
		view.on('init',function(next){
			
			var now = new Date();
			
			var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			
			var current_year  = now.getFullYear();
			var current_month = now.getMonth() + 1;
			
			var archives = [];
			
			
			
			for(var i=0;i<6;i++){
				current_month--;
				if(current_month < 0){
					current_month = 11;
					current_year--;
				}
				archives.push({
					url:'?archive='+(current_month+1 )+'-'+current_year,
					title: months[current_month] + ' ' + current_year
				});
			}
			
			locals.data.archives = archives;
			next();
		});
		
		view.on('init',function(next) {
			keystone.list('Aggregate List').model.findOne({slug:'tag-aggregator'}).exec(function(err,res){
				locals.data.tags = res.items;
				next(err);
			});
		});
			
		
		// Load the current post
		view.on('init', function(next) {
			
			var q = keystone.list('Post').model.findOne({
				state: 'published',
				slug: locals.filters.post
			}).populate('author categories');
			
			q.exec(function(err, result) {
				locals.data.post = result;
				next(err);
			});
			
		});
		
		// Load other posts
		view.on('init', function(next) {
			
			var q = keystone.list('Post').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');
			
			q.exec(function(err, results) {
				locals.data.posts = results;
				next(err);
			});
			
		});
		
		// Render the view
		view.render('blog-single');

	}
};
