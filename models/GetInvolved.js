var keystone = require('keystone');
var Types = keystone.Field.Types;

var involved= new keystone.List('GetInvolved',{
	map: { name: 'title' },
	nodelete: true,
	track: true,
	nocreate: true,
	label: 'Get Involved Page',
    plural: 'Get Involved Page'
});

involved.add({
	title: {type: String,label:'Page Title',noedit: true},
	button: {
		text: {type: String, label:'Page Button Text' },
		url: {type: String, label: 'Page Button URL' }
	},
	section1: {
		image: {type: Types.CloudinaryImage },
		title: { type: String},
		description: { type: Types.Html, wysiwyg: true, height: 400 },
		button: {
			text: {type: String, label:'Section 1 Button Text' },
			url: {type: String, label: 'Section 1 Button URL' }
		}
	},
	section2: {
		image: {type: Types.CloudinaryImage },
		title: { type: String},
		description: { type: Types.Html, wysiwyg: true, height: 400 },
		button: {
			text: { type: String, label:'Section 2 Button Text' },
			url: { type: String, label: 'Section 2 Button URL' }
		}
	},
});

involved.register();