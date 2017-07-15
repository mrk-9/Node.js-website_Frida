var keystone = require('keystone');
var Types = keystone.Field.Types;
var deepPopulate = keystone.get('deepPopulate');


//faq categories
var Program = new keystone.List('Program',{
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true }
});

var ProgramCategory = new keystone.List('Program Category',{
	map: { name: 'name' },
	nodelete: true,
	noedit: true,
	nocreate: true
});

ProgramCategory.add({
	name: {type: String, label:'Category Name'},
});

ProgramCategory.register();
/*

Program {

	Title
	Content Brief
	Content Extended
	Image Gallery
	Featured Image
	Date (Start Date, End Date)
	Day Of The Week
	Time
	Location : Program Location
	featuredOnHomepage (add to list sort)
	
}

Programs Location {

	Name
	Address
	Phone
	
}
*/

var ProgramLocation = new keystone.List('Program Location',{
	map: { name: 'name' }
});

ProgramLocation.add({
	name: {type: String, label:'Location Name'},
	address: {type: String, label:'Location Address'},
	phone: {type: String, label:'Location Phone Number'}
});

ProgramLocation.register();

Program.add({
	title: {type: String, label: 'Program Name'},
	categories: {type: Types.Relationship, ref: 'Program Category', index: true, many: true, label:'Program Categories'},
	content:{
		brief: { type: Types.Html, wysiwyg: true, height: 400 },
		section1: {
			title: { type: String},
			description: { type: Types.Html, wysiwyg: true, height: 400 },
		},
		section2: {
			title: { type: String},
			description: { type: Types.Html, wysiwyg: true, height: 400 }
		},
	},
	gallery: {type: Types.Relationship, ref: 'Gallery', index: true, label:'Image Gallery' },
	featuredImage: { label: "Featured Image" ,type: Types.CloudinaryImage },
	date: {
		start:{ type: Types.Date, default: Date.now, format: 'ddd MMM Do YYYY'},
		end: { type: Types.Date, default: Date.now, format: 'ddd MMM Do YYYY'}
	},
	days:{ type: Types.Relationship, ref: 'Day', label: 'Days Of The Week', many: true },
	time: {
		start: {type: String},
		end: {type: String}
	},
	location: {type: Types.Relationship,ref:'Program Location', index: true,label:'Program Location'},
	featured: {type: Types.Boolean, index: true},
});

Program.register();


var Schedule = new keystone.List('Schedule',{
	hidden: true
});

Schedule.add({
	user: {type: Types.Relationship, ref: 'User', index: true},
	program: {type: Types.Relationship, ref: 'Program', index: true},
	day: {type: Types.Relationship, ref: 'Day', index: true},
	recurring: { type: Types.Boolean},
	date: { type: Types.Date, dependsOn: { recurring: false} },
	subRequests: { type: Types.Relationship, ref: 'Substitution', index: true, many: true},
	active: { type: Types.Boolean, default: true}
});

Schedule.schema.plugin(deepPopulate);


var Substitution = new keystone.List('Substitution',{
	hidden: true
});

Substitution.add({
	schedule: {type: Types.Relationship, ref: 'Schedule', index: true},
	date: { type: Types.Date},
	day: {type: Types.Relationship, ref: 'Day', index: true},
	status: { type: String},
	user: { type: Types.Relationship, ref: 'User', index: true},
	thread: { type: Types.Relationship, ref: 'Conversation', index: true},
	type: { type : Types.Select, options: 'permanent, one-time'},
	token: { type: String}
});

Substitution.schema.plugin(deepPopulate);


Substitution.register();



Schedule.register();