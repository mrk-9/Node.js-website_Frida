$(function(){
	
	if($('#calendar').length){
		var c = $('#calendar-actual').fullCalendar({
			header: false,
			viewRender: function(view,el){
				var n = $('#calendar-actual').fullCalendar('getDate');
				var n2 = n.format('MMM YYYY');
				$('#calendar-month').html(n2);
			},
			events: '/api/calendar',
			eventBackgroundColor: 'transparent',
			eventTextColor: '#fff',
			eventBorderColor: '#fff'
		});
		
		$('#calendar-prev').click(function(e){
			c.fullCalendar('prev');
		});
		
		$('#calendar-next').click(function(e){
			c.fullCalendar('next');
		});	
	}
	
	if($('#calendar-big').length){
		var c = $('#calendar-big').fullCalendar({
			header: false,
			viewRender: function(view,el){
				var n = $('#calendar-big').fullCalendar('getDate');
				var n2 = n.format('MMM YYYY');
				$('#calendar-month').html(n2);
			},
			events: '/api/calendar',
			eventBackgroundColor: 'transparent',
			eventTextColor: '#fff',
			eventBorderColor: '#fff'
		});
		
		$('#calendar-prev').click(function(e){
			c.fullCalendar('prev');
		});
		
		$('#calendar-next').click(function(e){
			c.fullCalendar('next');
		});
	}
});