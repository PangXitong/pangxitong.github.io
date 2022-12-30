    function a(e) {
		var f = document.createElement('iframe');
		f.style.display = 'none';
		document.body.appendChild(f).src = 'javascript:"<script>top.location.replace(\'' + e + '\')<\/script>"';
	}
	function jump1() {
		if (!localStorage.is_fx) {
			localStorage.is_fx = Date.now()
			//a('http://baidu.com')
			//window.location.replace();
			// location.href="http://baidu.com";
		} else {
			// localStorage.is_fx = Date.now()
		}
	}
