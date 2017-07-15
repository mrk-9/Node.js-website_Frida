var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	image: { type: Types.CloudinaryImage,label:'Profile Picture' },
	bio: {type: Types.Textarea,height: 150},
	title: { type: String,Label: 'Official Title'},
	contact:{
		email: { type: Types.Email, displayGravatar: false },
		phone: { type: String}
	},
	password: { type: Types.Password, initial: true, required: true },
	role: {
		type: Types.Select,
		options: 'Admin, User', //put whatever roles you want 
		default: 'User'
	}
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Keystone Access', index: true, },
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});


/**
 * Relationships
 */

User.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });


/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin, role';
User.register();
