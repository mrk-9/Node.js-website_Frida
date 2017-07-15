/**
 * This file is where you define your application routes and controllers.
 * 
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 * 
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 * 
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 * 
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 * 
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

var mongo_express = require('mongo-express/lib/middleware');
var mongo_express_config = require('../mongo_express_config');

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = importRoutes('./views');

// Setup Route Bindings
exports = module.exports = function(app) {

//
// USER-FACING SITE
//
	
	//Homepage
	app.get('/',
    routes.index);
	
	//Blog
	app.get('/blog/:category?',
    routes.blog.list);

	app.get('/blog/post/:post',
    routes.blog.single);
	
	//Gallery
	app.get('/moments',
    routes.gallery.list);

	app.get('/moments/view-gallery/:gallery',
    routes.gallery.single);
	
	//Contact
	app.all('/contact',
    routes.contact);
	
	//Frida
	app.get('/about/our-mission',
    routes.about.ourMission);

	app.get('/about/our-team',
    routes.about.ourTeam);

	app.get('/about/faq',
    routes.about.faq);
	
	//Programs/Events
	app.get('/programs/:category',
    routes.programs.categoryView);

	app.get('/programs/view/:program',
    routes.programs.singleView);

	app.get('/events-calendar',
    routes.programs.calendarView);
	
	//Immigration
	app.get('/immigration/faq',
    routes.immigration.faq);
	
	app.get('/immigration',
    routes.immigration.page);
	
  //volunteer
	app.get('/volunteer/get-involved',
    routes.volunteer.index);

	app.get('/volunteer/register',
    routes.volunteer.register);

	app.all('/volunteer/donate',
    routes.volunteer.donate);

//
// USER-FACING API
//
	
	//front end calendar api endpoint
	app.get('/api/calendar',
    routes.api.calendar);

//
// ADMIN SITE
//
//
// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
// app.get('/protected', middleware.requireUser, routes.protected);
//

	app.use('/mongo_express',
    middleware.requireUser,
    mongo_express(mongo_express_config));
	
	//profile
	app.all('/profile',
    middleware.requireUser,
    middleware.adminLocals,
    routes.profile);
	
	//messaging
	app.get('/messaging/inbox',
    middleware.requireUser,
    middleware.adminLocals,
    routes.messaging.inbox);

	app.all('/messaging/compose',
    middleware.requireUser,
    middleware.adminLocals,
    routes.messaging.compose);
	
	app.all('/messaging/threads/:thread',
    middleware.requireUser,
    middleware.adminLocals,
    routes.messaging.thread);
	
	//scheduling
	app.get('/schedule',
    middleware.requireUser,
    middleware.adminLocals,
    routes.scheduling);
	
	app.get('/schedule/assignment',
    routes.api.assignmentAction);

//
// ADMIN API
//

	//admin schedule calendar endpoint
	app.get('/api/adminSchedule',
    middleware.requireUser,
    routes.api.adminSchedule);

	app.post('/api/scheduleHandler',
    middleware.requireUser,
    routes.api.scheduleHandler);

	app.get('/api/delSchedule',
    middleware.requireUser,
    routes.api.delSchedule);

	//non admin schedule
	app.get('/api/mySchedule',
    middleware.requireUser,
    routes.api.mySchedule);

};
