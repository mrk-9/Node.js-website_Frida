var keystone = require('keystone');
var obj = require('../objid'),
	update = require('../update')();

exports = module.exports = function(socket,data){
	
	
	socket.client.u_id = data.u_id || false;
	
	if(socket.client.u_id){
		
		console.log('user '+socket.client.u_id +' authenticated');
		
		socket.on('join',function(data){
			if(!Array.isArray(data)){
				data = [data];
			}
			for(var i=0;i<data.length;i++){
				console.log('joining '+data[i]);
				socket.join(data[i]);	
			}
			
		});
		
		socket.on('thread_seen',function(data){
			console.log('client %s saw thread %s',socket.client.u_id,data);
			
			var user = socket.client.u_id;
			var thread = data;
			
			keystone.list('Conversation').model.update({_id:thread},{ $pull: { unseen: user } },{},function(err,numAffected){
				
			});
		});
		
		socket.on('inbox_action',function(data){
			
			var user = socket.client.u_id,
				items = data.items,
				action = data.action;
				
			console.log('user %s requests inbox action: %s on items %s',user,action,items.join(',') );
			
			var update2 = false;
			
			switch(action){
				case 'delete':
					update2 = { $push: { deleted: user } };
				break;
				case 'read':
					update2 = { $pull: { unseen: user } };
				break;
			}
			
			if(update2){
				keystone.list('Conversation').model.update({_id:{$in: items}},update2,{multi: true},function(err,numAffected){
					console.log(err);
					console.log(numAffected);
				});
			}
			
		});
		
		socket.on('thread_paginate',function(data){
			var thread = data.thread,
				page = data.page || 1,
				offset = ~~page * 20;
				
			keystone.list('Message').model.find({conversation: thread}).sort('-timestamp').populate('user').skip(offset).limit(20).lean().exec(function(err,results){
				if(results !== null && results.length > 0 ){
					results = results.reverse();
					update.dispatch('message',{messages: results},function(html){
						socket.emit('thread_paginate_response',{results: true, html: html});
					});
				}else{
					socket.emit('thread_paginate_response',{results:false,html:false});
				}
			});
		});
		
		socket.on('thread_reply',function(data){
			var Msg = keystone.list('Message');
			
			var m = new Msg.model({
				conversation: data.id,
				content: {
					extended: data.message
				},
				user: socket.client.u_id
			});
			m.save(function(err,insert){
				socket.emit('thread_reply_success',{inserted_id: insert._id});
			});
		});

	}
	
	
};