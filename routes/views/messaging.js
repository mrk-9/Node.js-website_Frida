var keystone = require('keystone');
var _ = require('underscore');
var moment = require('moment');
var numeral = require('numeral');
var utils = require('keystone-utils');

exports = module.exports = {
	
	inbox: function(req,res){
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		view.on('init',function(next){
			
			console.log(req.user._id);
			keystone.list('Conversation').model.find({users : req.user._id }).sort('-lastTimestamp').populate('users last').lean().exec(function(err,results){
				for(var i=0;i<results.length;i++){
					results[i].lastTimestamp = moment.utc(results[i].lastTimestamp).fromNow();
					var unseen = results[i].unseen.map(function(v){ return v.toString(); }).indexOf(req.user._id.toString()) >= 0;
					results[i].unseen = unseen;
					console.log(results[i].unseen);
				}
				locals.conversations = results;
				next(err);
			});
			
		});
		
		view.render('inbox');
		

	},
	
	compose: function(req,res){
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		view.on('post', { action: 'compose' }, function(next) {
			
			
			//first create a new conversation between the two users.
			var Msg = keystone.list('Message');
			var Convo = keystone.list('Conversation');
			
			var recipients = req.body.recipients.split(',');
			recipients.push(req.user._id);
			var c = new Convo.model({
				users: recipients,
			});
			c.save(function(err,inserted){
				if(err){
					res.locals.error = err;
					next();
				}else{
					
					var newMsg = new Msg.model({
						user : req.user._id,
						content: {
							extended: req.body.message
						},
						conversation: inserted.id
					});

					
					newMsg.save(function(err2,inserted2) {
						// post has been saved
						if(err2){
							res.locals.error = err;
							next();
						}else{
							recipients.pop(); //remove current user from recipients, add other recipients to unseen list.
							Convo.model.update({_id:inserted.id},{last:inserted2.id,unseen: recipients},{},function(err3,nAffected){
								if(err3){
									res.locals.error = err3;
								}else{
									res.locals.success = true;
									res.redirect('/messaging/threads/'+inserted.id);
								}
							});
						}
						
					});
					
				}

			});
			
		});

		view.render('compose');
	},
	
	thread: function(req,res){
		
		var view = new keystone.View(req, res);
		var locals = res.locals;
		
		view.on('init',function(next){
			
			var id = req.params.thread;
			
			keystone.list('Conversation').model.update({_id:id},{ $pull: { unseen: req.user._id } },{},function(err,numAffected){
				next(err);
			});
			
		});
		
		
		view.on('init',function(next){
			keystone.list('Conversation').model.findById(req.params.thread).populate('users').exec(function(err,results){
				locals.conversation = results == null ? false : results;
				next(err);
			});
		});
		
		view.on('init',function(next){
			
			var id = req.params.thread;
			
			keystone.list('Message').model.find({conversation: id}).sort('-timestamp').populate('user').limit(20).lean().exec(function(err,results){
				results = results.reverse();
				locals.messagethread = results;
				next(err);
			});
			
		});
		
		view.on('post', { action: 'reply' }, function(next) {
			
			var id = req.params.thread;
			
			//first create a new conversation between the two users.
			var Msg = keystone.list('Message');
			
			var m = new Msg.model({
				conversation: id,
				content: {
					extended: req.body.message
				},
				user: req.user._id
			});
			m.save(function(err,insert){
				res.redirect('/messaging/threads/'+id);
			});
			
		});
		
		view.render('thread');
	}
	
};