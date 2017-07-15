var keystone = require('keystone');
var Types = keystone.Field.Types;
var mailer = require('../email')();
/**
 * Enquiry Model
 * =============
 */
 
/*

ContactName
Email
Zipcode
How did you hear from us?
Conference, Schools, Workshops, Teachers, Word of Mouth, Google, Social Media, Other...Who Are You?
Parent, Teacher, Community Member, Administrator, Principal, Donor, Press, Other..MessageThese will be saved in DB and sent to:
maria@fridakahlocommunity.org

*/

var Enquiry = new keystone.List('Enquiry', {
	nocreate: true,
	noedit: true
});

Enquiry.add({
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true },
	referralSource: { type: Types.Select, options: 'Conference, Schools, Workshops, Teachers, Word of Mouth, Google, Social Media, Other'},
	personType: { type: Types.Select, options: 'Parent, Teacher, Community Member, Administrator, Principal, Donor, Press, Other'},
	message: { type: Types.Markdown, required: true },
	createdAt: { type: Date, default: Date.now },
	sendFailure: { type: Types.Boolean, default: false, label: 'Email Failure'}
});

Enquiry.schema.pre('save', function(next) {
	var _t = this;
	this.sendNotificationEmail(function(err,res){
		if(err !== null){
			_t.sendFailure = true;
		}
		next();
	});
});

Enquiry.schema.methods.sendNotificationEmail = function(callback) {
	
	console.log('sending email');
	
	if(typeof callback !== 'function'){
		callback = function(){ next(); };
	}
	
	var enquiry = this;
		
	mailer.send('enquiry-notification',{
		to: 'stuckinabox@live.com',
		from: {
			name: 'FridaMailer',
			email: 'no-reply@frida.hogs.xyz'
		},
		subject: '[Contact Request] Frida Kahlo',
		enquiry: enquiry
	},callback);
		
};

Enquiry.defaultSort = '-createdAt';
Enquiry.defaultColumns = 'name, email, referralSource, createdAt, sendFailure';
Enquiry.register();
