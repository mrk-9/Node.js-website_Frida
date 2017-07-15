// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

// Require keystone
var keystone = require('keystone');
var Twig = require('twig');
var mongo_express = require('mongo-express/lib/middleware');
var mongo_express_config = require('./mongo_express_config');
var sock = require('socket.io');

// monkey patch Jade to look for admin templates in custom locations
require('./patch_jade.js')

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

//set custom email classes arguments
keystone.set('custom email',{
  twig: {
    path: './templates/emails/'
  },
  mailgun: {
    apiKey: 'key-2b1d1709d3206060e9465097f142c2aa',
    domain: 'frida.hogs.xyz'
  },
  base_url: (keystone.get('env') == 'production') ? 'http://fridacommunity.org' : 'http://frida.hogs.xyz'
});

keystone.init({

  'name': 'Frida Kahlo',
  'brand': 'Frida Kahlo',
  
  'sass': 'public',
  'static': 'public',
  'favicon': 'public/favicon.ico',
  'views': 'templates/views',
  
  'view engine': 'twig',
  'twig options':{ method: 'fs' },
  'custom engine': Twig.render,
  
  'emails': 'templates/emails',
  
  'auto update': true,
  'session': true,
  // 'session store': 'connect-redis',
  // 'session store options':{
  //   'host': process.env.REDIS_HOST || '127.0.0.1',
  //   'port': '6379',
  // },
  'auth': true,
  'user model': 'User',

});

keystone.set('signin redirect', function(user, req, res){
  var url = (user.isAdmin) ? '/keystone' : '/schedule';
  res.redirect(url);
});

keystone.set('deepPopulate',require('mongoose-deep-populate')(keystone.mongoose));

// Load your project's Models

keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js

keystone.set('locals', {
  _: require('underscore'),
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable
});

// Load your project's Routes

keystone.set('routes', require('./routes'));

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.
keystone.set('email locals', {
  logo_src: '/images/logo-email.gif',
  logo_width: 194,
  logo_height: 76,
  theme: {
    email_bg: '#f9f9f9',
    link_color: '#2697de',
    buttons: {
      color: '#fff',
      background_color: '#2697de',
      border_color: '#1a7cb7'
    }
  }
});

// Configure the navigation bar in Keystone's Admin UI

keystone.set('nav', {
  'Homepage': 'Slider',
  'Frida':['Approach','Team'],
  'Immigration': 'Immigration',
  'Get Involved':'GetInvolved',
  'posts': ['posts', 'post-categories'],
  'FAQs':['FAQ Category','FAQ'],
  'Programs':['Program','Program Category','Program Location'],
  'Donations':['StripeSettings', 'DonationType'],
  'galleries': 'galleries',
  'enquiries': 'enquiries',
  'users': 'users',
});

// Start Keystone to connect to your database and initialise the web server

keystone.start({
  onStart: function(){
    var hserver =  keystone.httpServer;                       
    var io = keystone.set('io', sock.listen(hserver)).get('io');
    require('socketio-auth')(io, {
      authenticate: function (socket, data, callback) {
        return callback(null,true);
      },
      postAuthenticate: require('./routes/socket')
    });
  }
});
