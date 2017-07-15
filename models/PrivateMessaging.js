var keystone = require('keystone');
var Types = keystone.Field.Types;
var utils = keystone.utils;
var update =  require('../update')();
var moment = require('moment');


var Convo = new keystone.List('Conversation',{
	hidden: true
});

Convo.add({
	users: { type: Types.Relationship, ref: 'User', index: true, many: true},
	unseen: { type: Types.Relationship, ref: 'User', index: true, many: true},
	deleted: { type: Types.Relationship, ref: 'User', index: true, many: true},
	last: { type: Types.Relationship, ref: 'Message' },
	lastTimestamp:{ type: Types.Date, default: Date.now},
	isSchedulingThread: { type: Types.Boolean, default: false}
});

Convo.register();

var Msg = new keystone.List('Message',{
	hidden: true
});

Msg.add({
	conversation: { type: Types.Relationship, ref: 'Conversation'},
	user: { type: Types.Relationship, ref: 'User', index: true},
	content: {
		brief: { type: String, hidden: true },
		extended: { type: Types.Html, wysiwyg: true, height: 400 }
	},
	timestamp:{ type: Types.Date, default: Date.now}
});

Msg.schema.pre('save',function(next){
	var txt = keystone.utils.htmlToText(this.content.extended);
	txt = keystone.utils.cropString(txt,34,'...');
	this.content.brief = txt;
	next();
});

Msg.schema.post('save',function(){
	var _t = this;
	
	keystone.list('Message').model.findById(_t._id).populate('user').exec(function(err,results){
		update.dispatch('message',{messages: [results]},function(html){
			var io = keystone.get('io');
			console.log('emitting thread update');
			io.sockets.in('thread_'+_t.conversation).emit('thread_update',{
				thread_id: _t.conversation,
				html: html
			});
		});	
	});
	
	
	keystone.list('Conversation').model.findOne({_id: _t.conversation }).populate('users').lean().exec(function(err,results){
		
		var d = new Date();
		results.lastTimestamp = moment.utc(d).fromNow();
		results.last = _t; //because we haven't updated this yet
		
		update.dispatch('conversation',{conversation: results},function(html){
			var io = keystone.get('io');
			console.log('emitting inbox update');
			io.sockets.in('inbox_'+_t.conversation).emit('inbox_update',{
				thread_id: _t.conversation,
				html: html
			});
		});	

		
		var users = results.users;
		var unseen = [];
		for(var i=0;i<users.length;i++){
			if(users[i] !== _t.user){
				unseen.push(users[i]);
			}
		}
		
		console.log(users);
		console.log(unseen);
		keystone.list('Conversation').model.update({ _id: _t.conversation },{ unseen: unseen, last: _t._id,deleted: [], lastTimestamp: d },{},function(err2,numAffected){
			console.log(err2);
			console.log(numAffected);
		});	
		
	});
	
});

Msg.register();