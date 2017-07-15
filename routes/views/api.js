var keystone = require('keystone');
var asyncEach = require('async-each');
var util = require('util');
var email = require('../../email')();
var rand = require('randomstring');

function finish(res,obj)
{
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(obj));
}

function dayOfWeek(dateObject)
{
	var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	return days[ dateObject.getDay() ];
}

function flattenArray(a, r)
{
    if(!r){ r = []}
    for(var i=0; i<a.length; i++){
        if(a[i] instanceof Array){
            r = flattenArray(a[i], r);
        }else{
            r.push(a[i]);
        }
    }
    return r;
}

function hourParse(str)
{
	var t = 0;
	if(/am/.test(str)){
		var n = ~~str.replace(/am/,'');
    var x = 'am';
	}
	else if(/pm/.test(str)){
		var n = ~~str.replace(/pm/,'');
    var x = 'pm';
	}
  
	switch(true){
		case(x=='am' && n < 12):
			t+= n;
		break;
		case(x=='pm' && n == 12):
			t+= 12;
		break;
		case(x=='pm' && n < 12):
			t+= 12 + n;
		break;
	}
	return t;
}

function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}


exports = module.exports = {
	
	calendar: function(req,res){
		
		var start = new Date(req.query.start);
		var end   = new Date(req.query.end);

		keystone.list('Program').model.find({
			$or : [
				{'date.start': { $gte: start } },
				{'date.start': { $lte: end } },
				{'date.end': { $gte: start } },
				{'date.end': { $lte: end } }
			]
		})
		.populate('categories days')
		.exec(function(err,results){
			
			var events = [];
			
			var dates = {};
			
			var start2 = start;

			while(start2 < end){
			   var newDate = start2.setDate(start2.getDate() + 1);
			   start2 = new Date(newDate);
			   dates[start2.toISOString()] = {};  
			}
			
			for(var date in dates){
				if(dates.hasOwnProperty(date)){
					
					for(var i=0;i<results.length;i++){
						
						var item = results[i];
						
						var cDate = new Date(date);
						var sDate = new Date(item.date.start);
						var eDate = new Date(item.date.end);
						
						if(cDate >= sDate && cDate <= eDate){
							
							var days = [];
							//convert days to an array.
							for(var k=0;k<item.days.length;k++){
								days.push(item.days[k].name);
							}
							
							if(days.indexOf(dayOfWeek(cDate)) !== -1){
								for(var j=0;j<item.categories.length;j++){
									
									var cat = item.categories[j].name;
									if(!dates[date].hasOwnProperty(cat)){
										dates[date][cat] = 1;
									}else{
										dates[date][cat] = dates[date][cat] + 1;
									}
									
								}	
							}

						}
						
					}
				}
			}
			
			for(var date in dates){
				if(dates.hasOwnProperty(date)){
					for(var cat in dates[date]){
						if(dates[date].hasOwnProperty(cat)){
							events.push({
								url: '/programs/'+cat.replace(' ','').toLowerCase(),
								start: date,
								title: cat + ' ('+dates[date][cat]+' Programs)',
								allDay: true
							});
						}
					}
				}
			}
			
			finish(res,events);
		});
		
	},
	
	adminSchedule: function(req,res){
		
		
		var start = new Date(req.query.start);
		var end   = new Date(req.query.end);

		
		
		
		keystone.list('Program').model.find({
			$or : [
				{'date.start': { $gte: start } },
				{'date.start': { $lte: end } },
				{'date.end': { $gte: start } },
				{'date.end': { $lte: end } }
			]
		})
		.populate('categories days location')
		.lean()
		.exec(function(err,results){
			
			var events = [];
			
			var dates = {};
			
			var start2 = start;

			while(start2 < end){
			   var newDate = start2.setDate(start2.getDate() + 1);
			   start2 = new Date(newDate);
			   dates[start2.toISOString()] = [];  
			}
			
			var series = [];
			
			for(var date in dates){
				if(dates.hasOwnProperty(date)){
					
					for(var i=0;i<results.length;i++){

						var item = results[i];
						series.push({
							date: date,
							item: results[i],
							fn: function(item,date,next){

								var cDate = new Date(date);
								var sDate = new Date(item.date.start);
								var eDate = new Date(item.date.end);

								
								if(cDate >= sDate && cDate <= eDate){
									var days = [];
									var daysRef = [];
									//convert days to an array.
									for(var k=0;k<item.days.length;k++){
										days.push(item.days[k].name);
										daysRef.push(item.days[k]._id);
									}
									var dayIndex = days.indexOf(dayOfWeek(cDate));
									if(dayIndex !== -1){
										var cDateStartHour = hourParse(item.time.start);
										var cDateEndHour = hourParse(item.time.end);
										
										var newDate1 = cDate.setHours(cDateStartHour,0,0,0);
										var newDate2 = cDate.setHours(cDateEndHour,0,0,0);
										
										var assigned = false;
										var subRequests = 'none';
										var schedule = false;
										
										//now check for assigned users on this date.
										keystone.list('Schedule').model.find({
											program: item._id,
											active: true,
											$or : [
												{date : cDate},
												{day: daysRef[dayIndex]}
											]
										})
										.deepPopulate('user subRequests subRequests.user')
										.lean()
										.exec(function(err2,resultsMany){
											
											var events = [];
											if(resultsMany.length > 0){

												for(var j=0;j<resultsMany.length;j++){
													
													var results2 = resultsMany[j];
													var subRequests = 'none';
													
													if(!results2.recurring){
														cDate.setHours(0, 0, 0, 0);
														var tDate = new Date(results2.date);
														tDate.setHours(0, 0, 0, 0);
														var testRes = cDate.toString() === tDate.toString() ? 'true' : 'false';
													
														console.log('date compare: %s | %s, result: %s',cDate.toString(),tDate.toString(),testRes);
														if(cDate.toString() !== tDate.toString()){
															console.log('non recurring,date miss match');
															continue; //not exact match so continue
														}
													}
													
													assigned = results2.user;
													schedule = results2._id;
													var record = results2;
													
													if(results2.subRequests.length > 0){
														
														for(var k=0;k<results2.subRequests.length;k++){
															
															
															
															var p = results2.subRequests[k];
															
															
															
															cDate.setHours(0, 0, 0, 0);
															var tDate = new Date(p.date);
															tDate.setHours(0, 0, 0, 0);
															
															if( (daysRef[dayIndex] == p.day && p.type =='permanent') || 
																(p.type == 'one-time' && cDate.toString() === tDate.toString()) ){
																
																subRequests = p;//we've a match. this subrequest belongs to this date/day
																
																if(p.status == 'accepted'){
																	var flag = 1;//set flag
																	break; //break out of inner loop
																}
															}
															
															
														}
														
														if(flag){
															continue; //break to next result loop
														}
														
														
													}
													
													events.push({
														program_id: item._id,
														title: item.title,
														location: item.location.name,
														assigned: assigned,
														schedule: schedule,
														pendingReassign: subRequests,
														start: newDate1,
														record: results2,
														end: newDate2,
														dayName: dayOfWeek(cDate),
														dayRef: daysRef[dayIndex],
														startTime: item.time.start,
														endTime: item.time.end
													});
												
												}	
												
											}else{
												events.push({
													program_id: item._id,
													title: item.title,
													location: item.location.name,
													assigned: assigned,
													schedule: schedule,
													pendingReassign: subRequests,
													start: newDate1,
													end: newDate2,
													dayName: dayOfWeek(cDate),
													dayRef: daysRef[dayIndex],
													startTime: item.time.start,
													endTime: item.time.end
												});
											}
											

											next(null,events);
											
										});	
										
									}else{
										next(null,null);
									}
								}else{
									next(null,null);
								}
							
							}
						});
					}
				}
			}
			
			asyncEach(series,function(it,next){
				it.fn(it.item,it.date,next);
			},function(error,events){
				events = flattenArray(events);
				events = cleanArray(events);
				finish(res,events);
			});
			
		});
		
		
		
	},
	
	scheduleHandler: function(req,res){
		
		var action = req.body.action || false;
		
		switch(action){
			
			default:
			case false:
				finish(res,{error: true});
			break;
			
			case 'assign':
				var s = keystone.list('Schedule');
				
				var recurring = req.body.recurring || false;
				if(recurring){
					recurring = true;
				}
				
				var ss = new s.model({
					user: req.body.assignee,
					program: req.body.program,
					day: req.body.day,
					date: req.body.date,
					recurring: recurring,
				});
				
				ss.save(function(err,insert){
					if(!err){
						keystone.list('Schedule').model.findById(insert._id).populate('user program day').exec(function(err,results){
							
							
							keystone.list('Program Location').model.findById(results.program.location).exec(function(err2,results2){
								
								console.log(results.user.email);
								//send user an email
								email.send('schedule-notification',{
									to: results.user.email,
									from: {
										name: 'FridaMailer',
										email: 'no-reply@frida.hogs.xyz'
									},
									subject: '[Scheduled Assignment] Frida Kahlo',
									programName: results.program.title,
									programLocation: results2.name,
									type: results.recurring,
									date: results.date,
									day: results.day.name,
									time: 'from '+ results.program.time.start +' to '+ results.program.time.end,
									name: results.user.name.first + ' ' + results.user.name.last
								},function(){
									
									keystone.get('io').in('user_calendar').emit('user_calendar',{});
									finish(res,{
										success: true,
										assigned: results.user
									});
									
								});	
							})
							
							
						});
					}else{
						
						finish(res,{ success: false });
						
					}
				});
			break;
			
			case 'request-reassign':
			
				//first create a support thread with the admin
				
				var s = keystone.list('Substitution');
				
				var ss = new s.model({
					user: req.user._id,
					schedule: req.body.schedule,
					type: req.body.type,
					date: req.body.date,
					day: req.body.day,
					status: 'open',
					token: rand.generate()
				});
				ss.save(function(err,insert){
					if(!err){
						keystone.list('Schedule').model.update({_id: req.body.schedule},{ $push: { subRequests: insert._id } },{},function(err2,numAff){
							
								keystone.list('User').model.find({role:'Admin'}).exec(function(err2,results2){
									var recipients = [req.user._id];
									for(var i=0;i<results2.length;i++){
										recipients.push(results2[i]._id);
									}
									var convo = keystone.list('Conversation');
									var c = new convo.model({
										users: recipients,
										isSchedulingThread: true
									});
									c.save(function(err3,insert2){
										
										var type = req.body.type == 'one-time' ? 'One Time' : 'Permanent';
										
										var msg = 'Hi admin,<br/> I request a change to my volunteer schedule. The details are below<br/><br/>';
										msg +='<strong>Type:</strong> '+type+'<br/>';
										msg +='<strong>Program:</strong> '+req.body.programName+'<br/>';
										msg +='<strong>Location:</strong> '+req.body.programLocation+'<br/>';
										if(req.body.type == 'one-time'){
											var d = req.body.date.split('T')[0].split('-');
											var a = d.shift();
											d.push(a);
											d.join('/');
											
											msg += '<strong>Date:</strong> '+ req.body.dayName +' '+ d.join('/') +' '+ req.body.time+'<br/><br/>';
										}else{
											msg +='<strong>Day:</strong> Every '+ req.body.dayName +'<br/><br/>';
										}
										
										msg +='Regards,<br/>';
										msg +='&nbsp;&nbsp;&nbsp;&nbsp;'+req.user.name.first;
										
										var m = keystone.list('Message');
										
										var newMsg = new m.model({
											user : req.user._id,
											content: {
												extended: msg
											},
											conversation: insert2._id
										});
										newMsg.save(function(){});
										keystone.list('Substitution').model.update({_id:insert._id},{thread: insert2._id},{},function(err3,numAff2){
											keystone.get('io').in('admin_calendar').emit('admin_calendar',{});
											finish(res,{ success: true, thread: insert2._id });
										});
									});
								});
							
								
						});
					}else{
						
						finish(res,{ success: false });
						
					}
				});
			break;
			
			case 'reassign':
			
				keystone.list('Substitution').model.update({_id : req.body.substitution},{
						user: req.body.assignee,
						status: 'pending',
						token: rand.generate()
					},
					{ multi: false},
					function(err,numAff){
						if(!err && numAff == 1){
							//load the new user being assigned
							keystone.list('Substitution').model.findById(req.body.substitution).exec(function(err3,results2){
								
								keystone.list('User').model.findById(req.body.assignee).exec(function(err2,results){
									
									//send user an email
									email.send('substitution-notification',{
										to: results.email,
										from: {
											name: 'FridaMailer',
											email: 'no-reply@frida.hogs.xyz'
										},
										subject: '[Pending Assignment] Frida Kahlo',
										programName: req.body.programName,
										programLocation: req.body.programLocation,
										substitution: req.body.substitution,
										type: req.body.type,
										date: req.body.date,
										name: results.name.first + ' ' + results.name.last,
										token: results2.token
									},function(){
										
										keystone.get('io').in('user_calendar').emit('user_calendar',{});
										finish(res,{success: true});
										
									});
										
									
								});	
								
							});
							
							
							
							
						}else{
							
							finish(res,{error: true});
						}
					}
				);
			break;
			
			case 'edit-schedule':
				keystone.list('Schedule').model.update({_id: req.body.schedule},{ user: req.body.assignee },{multi: false},function(err,numAff){
					if(numAff > 0){
						keystone.list('Schedule').model.findById(req.body.schedule).populate('user program day').exec(function(err,results){
							
							
							keystone.list('Program Location').model.findById(results.program.location).exec(function(err2,results2){
								
								console.log(results.user.email);
								//send user an email
								email.send('schedule-notification',{
									to: results.user.email,
									from: {
										name: 'FridaMailer',
										email: 'no-reply@frida.hogs.xyz'
									},
									subject: '[Scheduled Assignment] Frida Kahlo',
									programName: results.program.title,
									programLocation: results2.name,
									type: results.recurring,
									date: results.date,
									day: results.day.name,
									time: 'from '+ results.program.time.start +' to '+ results.program.time.end,
									name: results.user.name.first + ' ' + results.user.name.last
								},function(){
									
									keystone.get('io').in('user_calendar').emit('user_calendar',{});
									finish(res,{
										success: true,
										assigned: results.user
									});
									
								});	
							})
							
							
						});
					}
				});
			break;
		}
			
	},
	
	mySchedule: function(req,res){
		var start = new Date(req.query.start);
		var end   = new Date(req.query.end);

		keystone.list('Program').model.find({
			$or : [
				{'date.start': { $gte: start } },
				{'date.start': { $lte: end } },
				{'date.end': { $gte: start } },
				{'date.end': { $lte: end } }
			]
		})
		.populate('categories days location')
		.lean()
		.exec(function(err,results){
			
			var events = [];
			
			var dates = {};
			
			var start2 = start;

			while(start2 < end){
			   var newDate = start2.setDate(start2.getDate() + 1);
			   start2 = new Date(newDate);
			   dates[start2.toISOString()] = [];  
			}
			
			var series = [];
			
			for(var date in dates){
				if(dates.hasOwnProperty(date)){
					
					for(var i=0;i<results.length;i++){

						var item = results[i];
						series.push({
							date: date,
							item: results[i],
							fn: function(item,date,next){
								//console.log('series function exec')
								var cDate = new Date(date);
								var sDate = new Date(item.date.start);
								var eDate = new Date(item.date.end);
								// console.log(cDate);
								// console.log(sDate);
								// console.log(eDate);
								
								if(cDate >= sDate && cDate <= eDate){

									var days = [];
									var daysRef = [];
									//convert days to an array.
									for(var k=0;k<item.days.length;k++){
										days.push(item.days[k].name);
										daysRef.push(item.days[k]._id);
									}
									var dayIndex = days.indexOf(dayOfWeek(cDate));
									if(dayIndex !== -1){

										var cDateStartHour = hourParse(item.time.start);
										var cDateEndHour = hourParse(item.time.end);
										
										var newDate1 = cDate.setHours(cDateStartHour,0,0,0);
										var newDate2 = cDate.setHours(cDateEndHour,0,0,0);
										
										var assigned = false;
										var subRequests = false;
										var schedule = false;
										
										//now check for assigned users on this date.
										keystone.list('Schedule').model.find({
											program: item._id,
											active: true,
											user: req.user._id,
											$or : [
												{date : cDate},
												{day: daysRef[dayIndex]}
											]
										})
										.populate('user subRequests','-password -bio -contact')
										.lean()
										.exec(function(err2,resultsMany){
											var events = [];
											
											for(var j=0;j<resultsMany.length;j++){
												var results2 = resultsMany[j];
												
												if(!results2.recurring){
																								
													cDate.setHours(0, 0, 0, 0);
													var tDate = new Date(results2.date);
													tDate.setHours(0 ,0 ,0, 0);
													
													var cts = cDate.toString();
													var tts = tDate.toString();
													
													if(cts !== tts){
														console.log('non recurring, dates mismatch');
														continue;
													}

												}
												assigned = results2.user;
												schedule = results2._id;
												if(results2.subRequests.length > 0){
													
													var p = results2.subRequests.pop();
													cDate.setHours(0, 0, 0, 0);
													var tDate = new Date(p.date);
													tDate.setHours(0, 0, 0, 0);
													
													var testRes = cDate === tDate ? 'true' : 'false';
													
													console.log('date compare: %s | %s, result: %s',cDate,tDate,testRes);
													
													if( (p.type == 'one-time' && cDate.toString() === tDate.toString()) || p.type == 'permanent'){
														subRequests = p;
														
														if(p.status == 'accepted'){
															console.log('substitution request accepted, skipping');
															continue;
														}	
													}
												}
												
												events.push({
													program_id: item._id,
													title: item.title,
													location: item.location.name,
													assigned: assigned,
													schedule: schedule,
													pendingReassign: subRequests,
													start: newDate1,
													end: newDate2,
													dayName: dayOfWeek(cDate),
													dayRef: daysRef[dayIndex],
													startTime: item.time.start,
													endTime: item.time.end
												});
													
												
											}
											
											next(null,events);
											
										});
										
									}else{
										next(null,null);
									}
								}else{
									next(null,null);
								}
							
							}
						});
					}
				}
			}
			
			asyncEach(series,function(it,next){
				it.fn(it.item,it.date,next);
			},function(error,events){
				events = flattenArray(events);
				events = cleanArray(events);
				var events2 = [];
				for(var i=0;i<events.length;i++){
					if(events[i].assigned !== false){
						events2.push(events[i]);
					}
				}
				finish(res,events2);
			});
			
		});
	},
	
	assignmentAction: function(req,res){
		
		var view = new keystone.View(req, res);
		var locals = res.locals;
	
		var id = req.query.id || false;
		
		var action = req.query.action || false;
		
		var token = req.query.token;
		
		if(!id || !action || !token){
			locals.invalidRequest = true;
		}
		
		view.on('init',function(next){
			
			if(locals.invalidRequest){
				return next();
			}
			
			switch(action){
				case 'accept':
					keystone.list('Substitution').model.findOne({_id:id,token:token}).exec(function(err,results){
						
						if(results == null){
							locals.invalidRequest = true;
							return next();
						}
						console.log(results);
						//fetch the program from the schedule.
						keystone.list('Schedule').model.findOne({_id: results.schedule}).exec(function(err2,results2){
							console.log(results2);
							//create new scheduling record.
							var s = keystone.list('Schedule');
							var ss = new s.model({
								user : results.user,
								day: results.day ,
								date: results.date || null,
								recurring: results.type == 'permanent',
								program: results2.program,
								active: true
							});	
							
							ss.save(function(err3,inserted){
								locals.accepted = true;
								if(results.type == 'permanent'){
									//if a permanent replacement, delete the old schedule and substitution records.
									keystone.list('Substitution').model.findById(id).remove().exec(function(){
										keystone.list('Schedule').model.findById(results.schedule).remove().exec(function(){
											next();
											keystone.get('io').in('admin_calendar').emit('admin_calendar',{});
											keystone.get('io').in('user_calendar').emit('user_calendar',{});
										});
									});
									
								}else{
									//else update substitution to accepted
									keystone.list('Substitution').model.update({_id: id},{status:'accepted'},{multi:false},function(err4,numAffected){
										next();
										keystone.get('io').in('admin_calendar').emit('admin_calendar',{});
										keystone.get('io').in('user_calendar').emit('user_calendar',{});
									});
								}
								
							});
						});
						
					});	
				break;
				case 'decline':
					keystone.list('Substitution').model.update({_id: id},{user: null,status:'rejected'},{multi:false},function(err,numAffected){
						if(numAffected == 0){
							locals.invalidRequest = true;
						}
						locals.declined = true;
						keystone.get('io').in('admin_calendar').emit('admin_calendar',{});
						keystone.get('io').in('user_calendar').emit('user_calendar',{});
						next();
					});
				break;
				default:
					locals.invalidRequest = true;
					next();
				break;
			}
			
		});
		
		
		view.render('assignment-action');
		
	},
	
	delSchedule: function(req,res){
		
		var id = req.query.id || false;
		var type = req.query.type || false;
		
		if(!id || !type){
			return finish(res,{success: false});
		}
		
		switch(type){
			
			case 'schedule':
			
				scheduleRemoveData(id,function(){
					finish(res,{success: true});
				});
			
			break;
			
			case 'substitution':
				
				substitutionRemoveData(id,function(success){
					finish(res,{success: success});
				});
				
			break;
			default:
				finish(res,{success: false});
			break;
				
		}
		
	}
	
};

var substitutionRemoveData = function(id,callback){
	
	
	var ids = id.split(',');
	if(ids.length != 2){
		callback(false);
	}
	var id1 = ids[0],
		id2 = ids[1];
	
	console.log(id);
	
	keystone.list('Schedule').model.findById(id1).populate('subRequests').lean().exec(function(err,result){
		console.log(err);
		console.log(result);
		//remove any substitution requests
		
		if(result.subRequests.length > 0){
			for(var i=0;i<result.subRequests.length;i++){
				var sub = result.subRequests[i];
				var len = result.subRequests.length - 1;
				var n = i;
				keystone.list('Message').model.find({conversation: sub.thread}).remove(function(err2,removed){
					console.log(err2);
					console.log(removed);
					console.log(sub.thread);
					keystone.list('Conversation').model.findById(sub.thread).remove(function(err3,removed2){
						console.log(err3);
						console.log(removed2);

						//finally remove this.
						if(n == len){
							console.log(typeof id2);
							keystone.list('Schedule').model.update({_id: id1},{ $pull: { subRequests : id2 } },{},function(err5,aff){
								console.log(err5);
								console.log(aff);
								keystone.list('Substitution').model.findById(id2).remove(function(err4,removed3){
									console.log(err4);
									console.log(removed3);
									keystone.get('io').in('user_calendar').emit('user_calendar',{});
									callback(true);
								});	
							});
						}	
						
					});
				});	
				
			}		
		}else{
			keystone.list('Schedule').model.update({_id: id1},{ $pull: { subRequests: id2 } },{},function(err5,aff){
				keystone.list('Substitution').model.findById(id2).remove(function(err4,removed3){
					keystone.get('io').in('user_calendar').emit('user_calendar',{});
					callback(true);
					
				});	
			});
		}
		
		
	});
	
};

var scheduleRemoveData = function(id,callback){
	
	
	console.log(id);
	
	keystone.list('Schedule').model.findById(id).populate('subRequests').exec(function(err,result){
		console.log(err);
		console.log(result);
		//remove any substitution requests
		
		if(result.subRequests.length > 0){
			for(var i=0;i<result.subRequests.length;i++){
				
				keystone.list('Message').model.find({conversation: result.subRequests[i].thread}).remove(function(err2,removed){
					console.log(err2);
					console.log(removed);
					keystone.list('Conversation').model.findById(result.subRequests[i].thread).remove(function(err3,removed2){
						console.log(err3);
						console.log(removed2);
						keystone.list('Substitution').model.find({schedule: id}).remove(function(err4,removed3){
							console.log(err4);
							console.log(removed3);
							//finally remove this.
							if(i==results.subRequests.length - 1){
								keystone.list('Schedule').model.findById(id).remove(function(err5,removed4){
									console.log(err5);
									console.log(removed4);
									keystone.get('io').in('user_calendar').emit('user_calendar',{});
									callback();
								});	
							}	
						});
					});
				});	
				
			}		
		}else{
			keystone.list('Schedule').model.findById(id).remove(function(err5,removed4){
				console.log(err5);
				console.log(removed4);
				keystone.get('io').in('user_calendar').emit('user_calendar',{});
				callback();
			});	
		}
		
		
	});
	
};