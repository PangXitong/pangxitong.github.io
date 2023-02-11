
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
	        	var start_timestamp = 1657900800*1000; 
	        	var duration = timeDuration(new Date(start_timestamp),new Date());
	        	var text = "服务器已经运行" + duration.day + "天" + duration.hour + "小时" + duration.minute + "分" + duration.second + "秒";
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

//嵌入html
       (function(window, document, undefined) {
var Include39485748323 = function() {}
Include39485748323.prototype = {
//倒序循环
forEach: function(array, callback) {
var size = array.length;
for(var i = size - 1; i >= 0; i--){
callback.apply(array[i], [i]);
}
},
getFilePath: function() {
var curWwwPath=window.document.location.href;
var pathName=window.document.location.pathname;
var localhostPaht=curWwwPath.substring(0,curWwwPath.indexOf(pathName));
var projectName=pathName.substring(0,pathName.substr(1).lastIndexOf('/')+1);
return localhostPaht+projectName;
},
//获取文件内容
getFileContent: function(url) {
var ie = navigator.userAgent.indexOf('MSIE') > 0;
var o = ie ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();
o.open('get', url, false);
o.send(null);
return o.responseText;
},
parseNode: function(content) {
var objE = document.createElement("div");
objE.innerHTML = content;
return objE.childNodes;
},
executeScript: function(content) {
var mac = /<script>([\s\S]*?)<\/script>/g;
var r = "";
while(r = mac.exec(content)) {
    eval(r[1]);
}
},
getHtml: function(content) {
    var mac = /<script>([\s\S]*?)<\/script>/g;
    content.replace(mac, "");
    return content;
},
getPrevCount: function(src) {
    var mac = /\.\.\//g;
    var count = 0;
    while(mac.exec(src)) {
        count++;
    }
    return count;
},
getRequestUrl: function(filePath, src) {
    if(/http:\/\//g.test(src)){ return src; }
    var prevCount = this.getPrevCount(src);
    while(prevCount--) {
        filePath = filePath.substring(0,filePath.substr(1).lastIndexOf('/')+1);
    }
    return filePath + "/"+src.replace(/\.\.\//g, "");
},
replaceIncludeElements: function() {
    var $this = this;
    var filePath = $this.getFilePath();
    var includeTals = document.getElementsByTagName("include");
    this.forEach(includeTals, function() {
        //拿到路径  
        var src = this.getAttribute("src");
        //拿到文件内容  
        var content = $this.getFileContent($this.getRequestUrl(filePath, src));
        //将文本转换成节点  
        var parent = this.parentNode;
        var includeNodes = $this.parseNode($this.getHtml(content));
        var size = includeNodes.length;
        for(var i = 0; i < size; i++) {
            parent.insertBefore(includeNodes[0], this);
        }
        //执行文本中的额javascript  
        $this.executeScript(content);
        parent.removeChild(this);
        //替换元素 this.parentNode.replaceChild(includeNodes[1], this);  
    })
}
}
window.onload = function() {
    new Include39485748323().replaceIncludeElements();
}
})(window, document)
