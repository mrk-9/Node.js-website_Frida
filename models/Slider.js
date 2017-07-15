var keystone = require('keystone');
var Types = keystone.Field.Types;

//faq categories
var Slider = new keystone.List('Slider',{
	map: { name: 'header' },
	sortable: true
});

Slider.add({
	header: {type: String, label: 'Header Text'},
	subheader: {type: Types.Html, wysiwyg: true, height: 150, label: 'Subheader Text'},
	image: { type: Types.CloudinaryImage, label: 'Background Image' },
	alignment: { type: Types.Select, label:'Content Alignment', options: [
		{ value: 'center', label: 'Align Center' },
		{ value: 'left', label: 'Align Left' },
		{ value: 'right', label: 'Align Right' }
	] },
	/* 
	  button visibility
	  keystone doesnt support nested dependsOn yet, so it gets its own top level field for now.
	  see issue for more details: https://github.com/keystonejs/keystone/issues/2778
	*/
	bvisible:{type: Types.Boolean, label:'Show Button'},
	button: {
		text: {type: String, label:'Button Text',dependsOn: { bvisible : true } },
		url: {type: String, label: 'Button URL',dependsOn: { bvisible: true } }
	}
});

Slider.register();