var keystone = require('keystone');
var Types = keystone.Field.Types;

//faq categories
var FAQcat = new keystone.List('FAQ Category',{
	map: { name: 'name' },
	nodelete: true
});

FAQcat.add({
	name: {type: String, label: 'Category Name'},
	/*items: {type: Types.Relationship,ref: 'FAQ', index: true, many: true}*/
});


FAQcat.register();

var FAQ = new keystone.List('FAQ',{
	track: true,
	map: { name: 'question' },
	defaultColumns: 'question,category,createdAt,createdBy,updatedAt,updatedBy'
});

FAQ.add({
	question: { type: String, initial: true},
	category: { type: Types.Relationship, ref: 'FAQ Category', index: true, initial: true, createInline: true },
	answer: { type: Types.Html, wysiwyg: true, height: 400, initial: true }
});

FAQ.register();