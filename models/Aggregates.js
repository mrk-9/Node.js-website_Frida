var keystone = require('keystone');
var Types = keystone.Field.Types;

var Ag = new keystone.List('Aggregate List', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true, index: true},
	hidden: true
});

Ag.add({
	title: { type: String, required: true },
	items: { type: Types.TextArray }
});

Ag.register();