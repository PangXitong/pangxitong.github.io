// 开服时间
        (function(){
	        function timeDuration(time1, time2) {
	        	var duration = ( time2.getTime() - time1.getTime() ) /1000; // its unit is second
        		var second = Math.floor(duration) % 60;  // 60 seconds become 1 minute
		        duration /= 60;
        		var minute = Math.floor(duration) % 60; // 60 minutes become 1 hour
		        duration /= 60;
        		var hour = Math.floor(duration) % 24; // 24 hour become 1 day
		        duration /= 24;
	        	var day = Math.floor(duration);
		        return {day:day, hour:hour, minute:minute, second:second}
	        }
	        setInterval(function(){
	        	// timestamp is seconds in php but milliseconds in js, difference of 1000 times.
	        	var start_timestamp = 1670551810*1000; 
	        	var duration = timeDuration(new Date(start_timestamp),new Date());
	        	var text = "本站已上线运行" + duration.day + "天" + duration.hour + "小时" + duration.minute + "分" + duration.second + "秒";
	        	document.querySelector(".uptime").innerText = text;
        	});
        })();

// 倒计时
        (function(){
	        function timeDuration(time1, time2) {
	        	var duration = ( time2.getTime() - time1.getTime() ) /1000; // its unit is second
        		var second = Math.floor(duration) % 60;  // 60 seconds become 1 minute
		        duration /= 60;
        		var minute = Math.floor(duration) % 60; // 60 minutes become 1 hour
		        duration /= 60;
        		var hour = Math.floor(duration) % 24; // 24 hour become 1 day
		        duration /= 24;
	        	var day = Math.floor(duration);
		        return {day:day, hour:hour, minute:minute, second:second}
	        }
	        setInterval(function(){
	        	// timestamp is seconds in php but milliseconds in js, difference of 1000 times.
	        	var start_timestamp = 1674316799*1000; 
	        	var duration = timeDuration(new Date(start_timestamp),new Date());
	        	var text = "春节倒计时" + duration.day + "天" + duration.hour + "小时" + duration.minute + "分" + duration.second + "秒";
	        	document.querySelector(".downtime").innerText = text;
        	});
        })();

