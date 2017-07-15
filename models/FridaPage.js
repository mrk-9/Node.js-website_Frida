var keystone = require('keystone');
var Types = keystone.Field.Types;

var approach = new keystone.List('Approach',{
	map: { name: 'title' },
	nodelete: true,
	track: true,
	nocreate: true,
	label: 'Approach Page',
    plural: 'Approach Page'
});

approach.add({
	title: {type: String,label:'Page Title',noedit: true},
	image: { type: Types.CloudinaryImage, label:'Featured Image' },
	section1: {
		title: { type: String},
		description: { type: Types.Html, wysiwyg: true, height: 400 },
		stat: {type: Types.Textarea,label:'Statistics Quote'}
	},
	section2: {
		title: { type: String},
		description: { type: Types.Html, wysiwyg: true, height: 400 }
	},
	video: {type: String},
	section3: {
		title: { type: String},
		description: { type: Types.Html, wysiwyg: true, height: 400 }
	},
	stats: {
		block1: {
			title: {type: String},
			value: {type: String}
		},
		block2: {
			title: {type: String},
			value: {type: String}
		},
		block3: {
			title: {type: String},
			value: {type: String}
		},
		block4: {
			title: {type: String},
			value: {type: String}
		}
	},
	section4: {
		title: { type: String},
		description: { type: Types.Html, wysiwyg: true, height: 400 }
	},
	button: {
		text: {type: String, label:'Button Text' },
		url: {type: String, label: 'Button URL' }
	}
});

approach.register();

var team = new keystone.List('Team',{
	map: { name: 'title' },
	nodelete: true,
	track: true,
	nocreate: true,
	label: 'Team Page',
    plural: 'Team Page'
});

team.add({
	title: {type: String,label:'Page Title',noedit: true},
	button: {
		text: {type: String, label:'Button Text'},
		url: {type: String, label: 'Button URL' }
	},
	section1: {
		title: { type: String},
		description: { type: Types.Html, wysiwyg: true, height: 400 },
		qoute: {type: Types.Textarea}
	},
	image: { type: Types.CloudinaryImage, label:'Featured Image' },
	users: {type: Types.Relationship, ref: 'User', label: 'Team Members', many: true},
	section2: {
		title: { type: String},
		description: { type: Types.Html, wysiwyg: true, height: 400 },
		button: {
			text: {type: String, label:'Button Text' },
			url: {type: String, label: 'Button URL' }
		}
	},
});

team.register();

var immigration = new keystone.List(
  'Immigration',
  { map: { name: 'title' }
  , nocreate: true
  , nodelete: true
  , track: true
  , label: 'Immigration Page'
  , plural: 'Immigration Page' }
).add(
  { title: { type: String,label:'Page Title',noedit: true }
  , image: { type: Types.CloudinaryImage, label:'Featured Image' }
  , section1:
    { title: { type: String}
    , description: { type: Types.Html, wysiwyg: true, height: 400 }
    , stat: {type: Types.Textarea,label:'Statistics Quote'} }
  , section2:
    { title: { type: String}
    , description: { type: Types.Html, wysiwyg: true, height: 400 } }
  , video: {type: String}
  , section3:
    { title: { type: String}
    , description: { type: Types.Html, wysiwyg: true, height: 400 } }
  , stats:
    { block1:
      { title: {type: String}
      , value: {type: String} }
    , block2:
      { title: {type: String}
      , value: {type: String} }
		, block3:
      { title: {type: String}
      , value: {type: String} }
    , block4:
      { title: {type: String}
      , value: {type: String} } },
	section4:
    { title: { type: String}
    , description: { type: Types.Html, wysiwyg: true, height: 400 } },
	button:
    { text: {type: String, label:'Button Text' }
    , url: {type: String, label: 'Button URL' } } }
).register();
