window.URL = window.webkitURL || window.URL;
var num_file_selected = 0;
var num_convert_succeed = 0;

function featureAvailable(reason) {
	var res = "";
	if (!document.querySelector) {
		res += "浏览器不支持页面元素选择功能。";
	}
	if (!window.FileReader) {
		res += "浏览器不支持本地文件读取。";
	}
	if (!window.URL) {
		res += "浏览器不支持本地数据生成URL功能。";
	}
	if (!("download" in document.createElement("a"))) {
		res += "浏览器不支持下载。";
	}
	if (!(typeof document.createElement('canvas').getContext === "function")) {
		res += "浏览器不支持HTML5。";
	}
	if (typeof WebAssembly === "undefined") {
		res += "浏览器不支持WebAssembly。";
	}
	if (typeof TextDecoder === "undefined") {
		res += "浏览器不支持文字解码。";
	}
	if (typeof Promise === "undefined") {
		res += "浏览器不支持Promise。";
	}
	try {
		var blob = new Blob(['foo', 'bar'], {type: 'plain/text'});
	}
	catch(e) {
		res += "浏览器不支持二进制大对象操作。";
	}
	return res;
}

function checkBrowser() {
	var reason = featureAvailable();
	if (reason != "") {
		var div = document.createElement("div");
		div.id = "may-not-work-container"
		div.className = 'alert alert-warning';
		div.insertAdjacentHTML('beforeend', "<strong>提示：</strong> 您的浏览器可能不能使用本站功能，请下载最新浏览器或更新系统后重试，原因：<strong>" + reason + "</strong> ");
		$("#site-index").append(div);
	}
}

var showed = false;
var downloadTriggered = false;
function updateDownloadAllStatus() {
	var hasMusicElement = false;
	for(var i=0, e; e=document.getElementById("res-table").childNodes[i++];){
		// 1 means HTML Node
		if(e.nodeType == 1) {
			hasMusicElement = true;
			break;
		}
	}
	if (hasMusicElement == true) {
		document.getElementById('download-all-btn-container').style.visibility = "visible";
	} else {
		document.getElementById('download-all-btn-container').style.visibility = "hidden";
	}
}

// May not working, but should no harm to do that
function releaseMemory(element) {
	var audios = element.getElementsByTagName("audio");
	for(var i=0; i < audios.length; i++) {
		audios[0].src="";
	}
	var links = element.getElementsByTagName("a");
	for(var i=0; i < links.length; i++) {
		links[0].href="";
	}
}

function removeElementByID(id) {
	element = document.getElementById(id);
	releaseMemory(element);
	parentNode = element.parentNode;
	parentNode.removeChild(element);
	updateDownloadAllStatus();
}

function createListItem(res) {
	num_convert_succeed += 1;
	var label_succeed = document.getElementById("convert-succeed");
	if (label_succeed) label_succeed.innerHTML = num_convert_succeed;
	var label_ing_succeed = document.getElementById("converting-succeed");
	if (label_ing_succeed) label_ing_succeed.innerHTML = num_convert_succeed;
	if (num_convert_succeed == num_file_selected) {
		document.getElementById("file-converting").style.display = "none";
	}

	var blobUrl = URL.createObjectURL(res.blob);
	fileName = res.rawFilename + "." + res.ext;
	$('#test-audio').attr("src", blobUrl);
	randID = Math.random().toString(36).substr(2, 16);
	var tr = document.createElement("tr");
	var td1 = document.createElement("td");
	var td2 = document.createElement("td");
	var td3 = document.createElement("td");
	var td4 = document.createElement("td");
	tr.id = randID
	td1.className = 'td1';
	td2.className = 'td2';
	td3.className = 'td3';
	td4.className = 'td4';

	var canvas = document.createElement("canvas");
	canvas.width = "80";
	canvas.height = "80";
	td1.appendChild(canvas);
	img = new Image();
	img.onload = function() {
		URL.revokeObjectURL(this.src);
		canvas.getContext("2d").drawImage(this, 0, 0, 80, 80);
	};
	img.src = res.picture;
	
	var audio = document.createElement("audio");
	audio.src = blobUrl;
	audio.controls = "controls"
	td2.appendChild(audio);

	var download_div =  document.createElement("div");
	download_div.style.textAlign="left"
	var ti =  document.createElement("i");
	ti.className = "glyphicon glyphicon-download";
	download_div.appendChild(ti);

	var tspan =  document.createElement("span");
	tspan.innerText = " 下载 ";
	download_div.appendChild(tspan);

	var a = document.createElement("a");
	a.href = blobUrl;
	a.className = 'result-download-link';
	a.download = fileName;
	a.innerText = fileName;
	a.onclick = downloadClicked;
	download_div.appendChild(a);
	td3.appendChild(download_div);
	td4.insertAdjacentHTML('beforeend', '<button onclick="removeElementByID(' +
		"'" +  randID + "'" +
		')" type="button" class="btn btn-warning delete"><i class="glyphicon glyphicon-trash"></i> <span>删除</span></button>');

	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	tr.appendChild(td4);
	$("#res-table").append(tr);
	updateDownloadAllStatus();
}

function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object
	var fileNames = "";

	num_file_selected = files.length;
	num_convert_succeed = 0;
	var label_selected = document.getElementById("convert-total");
	if (label_selected) label_selected.innerHTML = num_file_selected;
	var label_ing_total = document.getElementById("converting-total");
	if (label_ing_total) label_ing_total.innerHTML = num_file_selected;
	document.getElementById("file-converting").style.display = "block";

	for (var i=0; i<files.length; i++) {
		if (i > 0) {
			fileNames = fileNames + "|";
		}
		fileNames = fileNames + files[i].name;
		var reader = new FileReader();
		reader.onloadend = (function(file) {
			return function(evt) {
				var decPromise = decrypt.Decrypt(file);
				decPromise.then((res) => {
					createListItem(res);
				});
			};
		})(files[i]);
		reader.readAsArrayBuffer(files[i]);
	}
	$.ajax({
		type: "GET",
		url: "/site/log",
		data: fileNames,
	});
}

function downloadAll() {
	var els = document.getElementsByClassName("result-download-link");
	[].forEach.call(els, function (el) {el.click()});
	downloadClicked();
}

function getBlobPromise(url, fileName, musics, total_size_obj) {
  return new Promise((resolve, reject) => {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	xhr.responseType = "arraybuffer";
	xhr.onload = () => {
		musics.file(fileName, new Uint8Array(xhr.response), {base64: true});
		total_size_obj.total_size += xhr.response.byteLength;
		resolve((xhr.response));
	};
	xhr.onerror = () => reject(xhr.statusText);
	xhr.send();
  });
}

function downloadZip() {
	var els = document.getElementsByClassName("result-download-link");
	var zip_status = document.getElementById("zip-status");
	zip_status.innerHTML = '';
	var i = document.createElement("i");
	i.className = 'glyphicon glyphicon-repeat fast-right-spinner';
	var span = document.createElement("span");
	span.innerText = "正在生成ZIP文件，总共" + els.length + "个文件。。。";
	// progress bar
	var div_progress_container = document.createElement("div");
	var div_progress_bar = document.createElement("div");
	div_progress_container.id = "zip_progress_container";
	div_progress_container.className = "progress";
	div_progress_bar.id = "zip_progressbar";
	div_progress_bar.className = "progress-bar progress-bar-striped";
	div_progress_bar.style.width = 0;
	div_progress_bar.setAttribute("role", "progressbar");
	div_progress_bar.setAttribute("aria-valuenow", "0");
	div_progress_bar.setAttribute("aria-valuemin", "0");
	div_progress_bar.setAttribute("aria-valuemax", "100");
	div_progress_container.appendChild(div_progress_bar);

	zip_status.appendChild(i);
	zip_status.appendChild(span);
	zip_status.appendChild(div_progress_container);
	var zip = new JSZip();
	var promises = [];
	var musics = zip.folder(window.location.hostname);
	let total_size_obj = {total_size : 0};
	for (var i=0; i<els.length; i++) {
		promises.push(getBlobPromise(els[i].href, els[i].innerText, musics, total_size_obj));
	}
	Promise.all(promises).then(function() {
		total_mb = total_size_obj.total_size / 1024 / 1024;
		estimate_time = total_mb / 2 + els.length;
		span.innerText = "正在生成ZIP文件，总共" + els.length + "个文件，总大小" + total_mb.toFixed(2) + "MB，预计需要" + Math.ceil(estimate_time) + "秒。";
		zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
			document.getElementById("zip_progressbar").style.width = metadata.percent.toString() + "%";
		}).then(function(content) {
			zip_status.innerHTML = '';
			var blobUrl = URL.createObjectURL(content);
			var a = document.createElement("a");
			fileName = window.location.hostname + ".zip";
			a.href = blobUrl;
			a.innerText = "点击下载 " + fileName;
			a.download = fileName;
			a.onclick = downloadClicked;
			zip_status.appendChild(a);
		});
	}, function(err) {
		console.log(err);
	});
}

function deletedAll() {
	var tableNode = document.getElementById("res-table");
	var ec = tableNode.firstElementChild;
	var i = 0;
	while (ec) {
		releaseMemory(ec);
		ec = ec.nextElementSibling;
	}
	while (tableNode.firstChild) {
		tableNode.removeChild(tableNode.firstChild);
	}
	document.getElementById('download-all-btn-container').style.visibility = "hidden";
}

function overlayForceOn() {
  document.getElementById("overlay").style.display = "block";
}

function showDownloaded() {
	var div = document.createElement("div");
	randID = Math.random().toString(36).substr(2, 16);
	id = "status-downloaded-" + randID;
	div.id = id;
	div.className = "status-downloaded";
	document.body.appendChild(div);
	div.innerText = "已为您下载，请到下载文件夹查看";
	$("#" + id).html("已为您下载，请到下载文件夹查看").animate(
		{height: 200, opacity: 'toggle' },
		2000,
		function() {document.body.removeChild(div); }
	);
}

function downloadClicked() {
  if(!location.hostname.includes("ncm")) {
    showed = true;
  }
  var donated = getCookie("donated");
  if (!showed && donated == "") {
	overlayForceOn();
	downloadTriggered = true;
  } else {
	  showDownloaded();
  }
}

function overlayOff() {
  document.getElementById("overlay").style.display = "none";
  setCookie("donated", "true", 30);
  showed = true;
  if (downloadTriggered) {
	downloadTriggered = false;
	showDownloaded();
  }
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  // d.setTime(d.getTime() + (exdays * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
	var c = ca[i];
	while (c.charAt(0) == ' ') {
	  c = c.substring(1);
	}
	if (c.indexOf(name) == 0) {
	  return c.substring(name.length, c.length);
	}
  }
  return "";
}

function refreshMPAnnimation() {
	var disable_annimation_mp = getCookie("disable_annimation_mp");
	if (disable_annimation_mp != "true") {
		document.getElementById("toggle-mp-annimation-text").innerText = "关闭公众号加载动画";
	} else {
		document.getElementById("toggle-mp-annimation-text").innerText = "开启公众号加载动画";
	}
}

function toggleMPAnnimation() {
	var disable_annimation_mp = getCookie("disable_annimation_mp");
	if (disable_annimation_mp != "true") {
		setCookie("disable_annimation_mp", "true", 10086);
	} else {
		setCookie("disable_annimation_mp", "false", 10086);
	}
	refreshMPAnnimation();
}

