var mailgunapi = require('mailgun-js');
var Twig = require('twig');
var _ = require('underscore');
var util = require('util');
var mailcomposer = require('mailcomposer');
var keystone = require('keystone');

var createProto = function(o){
	function F(){}
	F.prototype = o;
	return new F();
}

var plugin = function(o){
	return function(options){
		var instance = createProto(o);
		instance.init(options);
		return instance;
	};
};

exports = module.exports = plugin({
	
	options: {},
	
	init: function(options){
		if(typeof options === 'undefined' || options === false){
			options = keystone.get('custom email');
		}
		this.options = _.extend(this.options,options);
		this.twig    = Twig.twig;
		this.mailgun = mailgunapi(this.options.mailgun);
		this.mailcomposer = mailcomposer;
	},
	
	send: function(template,data,callback){
		
		var _self = this;
		
		data = _.extend(data,{base_url:this.options.base_url});
		
		_self.twig({
			path: _self.options.twig.path+ template + '.twig',
			method: 'fs',
			load: function(t){
				var html = ''+t.render(data);
				
				var mail = _self.mailcomposer({
				  from: _self.options.sendFrom,
				  to: data.to,
				  subject: data.subject,
				  html: html
				});

				mail.build(function(mailBuildError, message) {

					var m = message.toString('ascii');
					
					var dataToSend = {
						to: data.to,
						message: m
					};

					_self.mailgun.messages().sendMime(dataToSend, callback);
				});
			}
		})
	}
	
});