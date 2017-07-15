var Twig = require('twig');
var _ = require('underscore');

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

	init: function(options){
		this.twig    = Twig.twig;
	},
	
	dispatch: function(template,data,callback){
		
		var _self = this;
		
		_self.twig({
			path: './templates/partials/'+ template + '.twig',
			method: 'fs',
			load: function(t){
				var html = ''+t.render(data);
				callback(html);
			}
		});
	}
	
});