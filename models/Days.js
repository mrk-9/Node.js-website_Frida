var keystone = require('keystone');
var Types = keystone.Field.Types;

var Day = new keystone.List('Day',{
	map: { name: 'name' },
	hidden: true,
	nocreate: true,
	nodelete: true,
	noedit: true
});

Day.add({
	name: {type: String, label:'Day Name'},
});

Day.register();