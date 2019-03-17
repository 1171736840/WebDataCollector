
createFloatMenu();//创建浮动菜单

function createFloatMenuBox(){//创建浮动菜单盒子
	var box = document.createElement("div");
	box.className = "a_box";
	document.body.appendChild(box);
	return box;
}

function createFloatMenuDiv(box,innerHTML,id,title,onclick){//创建浮动菜单盒子
	var div = document.createElement("div");
	div.innerHTML = innerHTML;
	div.id = id;
	div.title = title;
	div.className = "a_menu";
	div.onclick = onclick;
	box.appendChild(div);
	return div;
}

function createFloatMenu() {//创建浮动菜单

	//创建一个浮动菜单条
	var box = createFloatMenuBox();
	
	//添加“采集”菜单
	window.floatMenuCj = createFloatMenuDiv(box,"采集","cj","采集当前页面",function(){
		if(document.getElementById("cj").innerHTML == "采集") {
    		//采集页面数据
			getData();
    	}
	});
	
	//添加“查看”菜单
	window.floatMenuCk = createFloatMenuDiv(box,"查看","ck","查看所有已采集数据",function(){
		window.postMessage({"showData": "showData"}, '/'); //发送消息给content.js从而查看所有已采集数据
	});

	//监视按键
	document.onkeydown = function(event) {
		if(event.key == "Control" || event.key == "Alt" || event.key == "Shift") {
			return;
		}

		var keyCode = "";
		if(event.ctrlKey == true) {
			keyCode += "Ctrl + "
		}
		if(event.altKey == true) {
			keyCode += "Alt + "
		}
		if(event.shiftKey == true) {
			keyCode += "Shift + "
		}

		keyCode += event.key.toUpperCase();

		if(keyCode == window.setting.cjKeyCode){
			window.floatMenuCj.onclick();//相当于点击采集按钮
		}
		if(keyCode == window.setting.ckKeyCode){
			window.floatMenuCk.onclick();//相当于点击查看按钮
		}

	};

	testThisPageUrl();//检测链接是否已采集
	
	window.onGetSettingAndDatabase.collection = testThisPageUrl;//当获取到已采集数据时检测本页面是否已采集
	
}


function testThisPageUrl(){//检测当前页面是否已采集
	if(window.location.href.indexOf("wukong.com") != -1){//如果是悟空回答则获取页面真实链接
		testUrl("https://www.wukong.com/question/" + document.getElementsByClassName("question-item")[0].getAttribute("data-qid") + "/");
	}else{
		testUrl(shortUrl(window.location.href));
	}
}

function testUrl(url){//检测网页是否已经被采集，并读取最新的设置数据

	var text = "采集";
	for(var i in window.database){//判断链接是否存在
		if(window.database[i].url == url){
			text = "已采集";
			break;
		}
	}			
	window.floatMenuCj.innerHTML = text;
	
}

function getBdtb(){//采集百度贴吧
	//获取日期
	switch(setting.bdtbDate){
		case "帖子时间":
			var pageDate = $(".d_post_content_main.d_post_content_firstfloor .tail-info:last-child").text();
			pageDate = pageDate || $(".d_post_content_main.d_post_content_firstfloor .p_tail li:last-child").text();
			var TempDate = new Date();
			pageDate = pageDate || prompt("帖子时间采集失败，请输入帖子时间！\n可能是帖子内容太多，未全部加载，请尝试向下浏览把剩余内容加载完成。或者当前页不是帖子首页，尝试到帖子首页重新采集！",TempDate.getFullYear()+"."+(TempDate.getMonth()+1)+"."+TempDate.getDate());
			if(pageDate == null)return false;
			var date = new Date(pageDate);
			data.date=date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
			break;
		case "系统时间":
			var date = new Date;
			data.date = date.getFullYear() + "." + (date.getMonth()+1) + "." + date.getDate();
			break;
	}
	
	
	//获取关键字
	data.key = setting.bdtbKey;
	
	//获取备注标题
	data.title=$("#j_core_title_wrap h3").text();
	data.title = data.title || $(".core_title_txt").text();
	
	//获取平台名称
	switch(setting.bdtbPlatformName){//读取设置中要显示的选项
		case "贴吧名":
			data.type = $("a.card_title_fname").text().trim();
			break;
		case "平台名":
			data.type = "百度贴吧"
			break;
	}
	
	//获取账号
	switch(setting.bdtbName){
		case "楼主账号":
			data.name=$(".louzhubiaoshi.j_louzhubiaoshi:first-child").attr("author");
			if(data.name == undefined){
				data.name = prompt("楼主账号采集失败，可能当前页不是帖子首页，请输入楼主账号或到帖子首页重新采集！","");
				if(data.name == null)return false;//验证是否输入
			}
			break;
		case "登录账号":
			data.name=$(".u_username_title").text();
			if(data.name == ""){
				data.name = prompt("登录账号采集失败，请输入登录账号或登录后刷新本页面重新采集！","");
				if(data.name == null)return false;//验证是否输入
			}		
			break;
	}
	

	//获取链接
	data.url = shortUrl(data.url);
	
	//获取回复数
	try{
		data.qaReply = document.getElementsByClassName("red")[0].innerHTML;
	} catch (e) {
		data.qaReply = prompt("回复数采集失败，请输入回复数或尝试刷新本页面重新采集！","0");
		if(data.qaReply == null)return false;//验证是否输入
	}
	
	return true;
}

function getXqbl(){//采集兴趣部落
	//获取日期
	switch(setting.xqblDate){
		case "话题时间":
			try{
				var span = document.getElementsByClassName("head-bottom")[0].getElementsByTagName("span");
				var pageDate = span[span.length - 7].innerHTML;
				if(pageDate.indexOf("秒") != -1 || pageDate.indexOf("分钟") != -1 || pageDate.indexOf("小时") != -1){
					var date = new Date();
				}else if(pageDate.indexOf("昨天") != -1){
					var date = new Date();
					date.setDate(date.getDate() - 1);
				}else if(pageDate.indexOf(":") != -1){//月					
					var date = new Date();
					date = new Date(date.getFullYear() + "-" + pageDate);
				}else if(pageDate.indexOf("-") != -1){//年
					var date = new Date(pageDate);
					data.date=date.getFullYear()+"."+(date.getMonth()+1);
					break;
				}
				data.date=date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
			} catch (e) {
				var TempDate = new Date();
				data.date = prompt("话题时间采集失败，请输入话题时间或尝试刷新后重新采集！",TempDate.getFullYear()+"."+(TempDate.getMonth()+1)+"."+TempDate.getDate());
				if(data.date == null)return false;//验证是否输入
			}
			break;
		case "系统时间":
			var date=new Date();
			data.date=date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
			break;
	}	
	
	//采集账号
	switch(setting.xqblName){
		case "楼主账号":
			try{
				data.name = document.getElementsByClassName("userinfo")[0].getElementsByTagName("span")[0].innerHTML;
			} catch (e) {
				data.name = prompt("楼主账号采集失败，请输入楼主账号或尝试刷新后重新采集！","");
				if(data.name == null)return false;//验证是否输入
			}
			break;
		case "登录账号":
			try{
				data.name = document.getElementsByClassName("user-wrapper")[0].getElementsByClassName("title-span")[0].innerHTML;
			} catch (e) {
				data.name = prompt("登录账号采集失败，请输入登录账号或登录后刷新本页面重新采集！","");
				if(data.name == null)return false;//验证是否输入
			}		
			break;
	}
	
	//采集备注标题
	data.title=data.title.substr(0, data.title.lastIndexOf("-兴趣部落"));
	
	switch(setting.xqblPlatformName){
		case "部落名":
			try{
				data.type = document.getElementsByClassName("tribe-title ellipsis")[0].innerHTML;
			} catch (e) {
				data.type = prompt("部落名采集失败，请输入部落名或尝试刷新后重新采集！","兴趣部落");
				if(data.type == null)return false;//验证是否输入
			}
			break;
		case "平台名":
			data.type = "兴趣部落";		
			break;
	}
	
	//获取关键字
	data.key = setting.xqblKey;
	
	//获取回复数
	try{
		var span = document.getElementsByClassName("head-bottom")[0].getElementsByTagName("span");
		data.qaReply = span[span.length - 1].innerHTML;
	} catch (e) {
		data.qaReply = prompt("回复数采集失败，请输入回复数或尝试刷新本页面重新采集！","0");
		if(data.qaReply == null)return false;//验证是否输入
	}
	
	return true;
}

function getBdzd(){//采集百度知道
	//采集链接
	data.url = shortUrl(data.url);
	//采集标题
	data.title=data.title.substr(0, data.title.lastIndexOf("_百度知道"));
	
	//获取关键字
	data.key = setting.bdzdKey;
	//采集时间和账号
	switch(setting.bdzdQa){//判断是提问还是回答
		case "提问":
			//提问
			data.qaReply = "提问";
			//采集用户名
			if($(".mr-5.asker-op-buttons").length > 0){//当前问题是自己提问的，获取登录用户名
				data.name = document.getElementById("user-name").innerText;
			}else{//不是自己提问的，按提供的位置获取提问用户名
				data.name = $("#ask-info a[alog-action='qb-ask-uname']").text();
				if(data.name == ""){
					data.name = $("#ask-info > span:nth-child(2)").text()
				}
				if(data.name == ""){
					data.name = prompt("提问账号采集失败，请输入提问账号！","");
			if(data.name == null)return false;//验证是否输入
				}
			}
			
			//采集提问时间
			var pageDate = $("#ask-info > span:nth-child(4)").text();//采集页面时间
			if( pageDate = ""){
				 pageDate = $("#ask-info > span:nth-child(2)").text();
			}
			pageDate = pageDate.replace("发布于：","");
			if(pageDate.indexOf("今天") != -1 || pageDate.indexOf("小时") != -1  || pageDate.indexOf("分钟") != -1){
				var date = new Date();
			}else{
				var date = new Date(pageDate);
			}
			if(date=="Invalid Date"){
				//如果采集回答时间出错则让用户输入时间
				var TempDate = new Date();
				date = prompt("提问日期采集失败，请输入提问日期",TempDate.getFullYear()+"."+(TempDate.getMonth()+1)+"."+TempDate.getDate());
				if( data.date == null)return false;//验证是否输入
				date = new Date(date);
			}
			data.date = date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
			
			
			break;
		case "回答":
			//回答
			data.qaReply = "回答"
			//采集用户名
			try{
				data.name = document.getElementById("user-name").innerText;//获取用户名
			} catch (e) {//账号采集失败则让用户输入账号
				data.name = prompt("因账号未登录或登录账号未回答或其它原因导致回答账号采集失败，请输入回答账号或登录后刷新重新采集！","");
				if(data.name == null)return false;//验证是否输入
			}
			//采集回答时间
			try{
				//采集页面时间
				var pageDate = (document.getElementsByClassName("answer-title h2 grid")[0].innerText.indexOf("我的回答") != -1) ? document.getElementsByClassName("grid-r f-aid pos-time answer-time f-pening")[0].innerHTML : null;
					
				pageDate = pageDate.replace("发布于：","");
				pageDate = pageDate.replace("推荐于：","");
				if(pageDate.indexOf("今天") != -1 || pageDate.indexOf("小时") != -1  || pageDate.indexOf("分钟") != -1){
					var date = new Date();
				}else{
					var date = new Date(pageDate);
				}
				data.date = date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
			} catch (e) {//如果采集回答时间出错则让用户输入时间
				var TempDate = new Date();
				data.date = prompt("因账号未登录或登录账号未回答或其它原因导致回答日期采集失败，请输入回答日期",TempDate.getFullYear()+"."+(TempDate.getMonth()+1)+"."+TempDate.getDate());
				if( data.date == null)return false;//验证是否输入
				
			}
			break;
	}
	
	//采集平台
	data.type = "百度知道";
	
	return true;
}

function getSgww(){//采集搜狗问问
	//获取关键字
	data.key = setting.sgwwKey;
	//备注标题
	data.title = data.title.substr(0, data.title.lastIndexOf("_搜狗问问"));
	//平台
	data.type="搜狗问问";
	
	
	//登录账号
	
	switch(setting.sgwwQa){//判断是提问还是回答
		case "提问":
			//提问
			data.qaReply = "提问";
			//获取提问账号
			try{
				data.name = document.getElementById("question_author").innerText;
			}catch (e) {
				data.name = prompt("提问账号采集失败，请输入提问账号！","");
				if(data.name == null)return false;//验证是否输入
			}
			//获取提问时间
			try{//获取提问时间，时，分，秒，几天前
				var pageDate = document.getElementsByClassName("user-txt")[0].getElementsByTagName("span")[1].innerHTML;//采集页面时间	
				if(pageDate.indexOf("小时之前 提问") != -1){
					pageDate = parseInt(pageDate.replace("小时之前 提问",""));//获取多少个小时之前，转为int
					var date = new Date();
					date.setHours(date.getHours() - pageDate);
				}else if(pageDate.indexOf("分钟之前 提问") != -1){
					pageDate = parseInt(pageDate.replace("分钟之前 提问",""));//获取多少分钟之前，转为int
					var date = new Date();
					date.setMinutes(date.getMinutes() - pageDate);
				}else if(pageDate.indexOf("秒之前 提问") != -1){
					pageDate = parseInt(pageDate.replace("秒之前 提问",""));//获取多少秒之前，转为int
					var date = new Date();
					date.setSeconds(date.getSeconds() - pageDate);
				}else{
					pageDate = pageDate.replace(" 提问","");//获取页面时间
					var date = new Date(pageDate);
				}
				data.date = date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
			} catch (e) {//如果采集回答时间出错则让用户输入时间
				var TempDate = new Date();
				data.date = prompt("提问日期采集失败，请输入提问日期",TempDate.getFullYear()+"."+(TempDate.getMonth()+1)+"."+TempDate.getDate());
				if( data.date == null)return false;//验证是否输入
				
			}
			break;
		case "回答":
			data.qaReply = "回答";
			//获取登录账号，未登录不会报错，显示为 匿名用户
			data.name = document.getElementsByClassName("user-name-box")[0].getElementsByClassName("user-name")[0].innerText;
			if(data.name == "匿名用户"){
				data.name = prompt("因账号未登录或登录账号未回答或其它原因导致回答账号采集失败，请输入回答账号或登录后刷新重试！","");
				if(data.name == null)return false;//验证是否输入
			}
			//获取登录回答时间，需要进行时间判断过滤处理
			try{
				var pageDate = document.getElementsByClassName("btn-up like_btn   dim ")[0].parentNode.parentNode.parentNode.getElementsByClassName("user-txt")[0].innerText;//采集页面时间	
				if(pageDate.indexOf("小时之前 回答") != -1){
					pageDate = parseInt(pageDate.replace("小时之前 回答",""));//获取多少个小时之前，转为int
					var date = new Date();
					date.setHours(date.getHours() - pageDate);
				}else if(pageDate.indexOf("分钟之前 回答") != -1){
					pageDate = parseInt(pageDate.replace("分钟之前 回答",""));//获取多少分钟之前，转为int
					var date = new Date();
					date.setMinutes(date.getMinutes() - pageDate);
				}else if(pageDate.indexOf("秒之前 回答") != -1){
					pageDate = parseInt(pageDate.replace("秒之前 回答",""));//获取多少秒之前，转为int
					var date = new Date();
					date.setSeconds(date.getSeconds() - pageDate);
				}else{
					pageDate = pageDate.replace(" 回答","");//获取页面时间
					var date = new Date(pageDate);
				}
				data.date = date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
			} catch (e) {//如果采集回答时间出错则让用户输入时间
				var TempDate = new Date();
				data.date = prompt("因账号未登录或登录账号未回答导致回答日期采集失败，请输入回答日期",TempDate.getFullYear()+"."+(TempDate.getMonth()+1)+"."+TempDate.getDate());
				if( data.date == null)return false;//验证是否输入
				
			}
		
		break;
		
	}
	return true;
}

function getWd360(){//采集360问答
	
	data.title=data.title.substr(0, data.title.lastIndexOf("_360问答"));
	data.url = shortUrl(data.url);
	data.type="360问答";
	data.key = setting.wd360Key;
	//获取登录用户名，为空表示没有登录
	data.name = document.getElementById("topbar_username").innerHTML;
	if(data.name == ""){
		data.name = prompt("回答账号采集失败，请输入回答账号或登录后刷新重试！","");
		if(data.name == null)return false;//验证是否输入
	}
	
	switch(setting.wd360Qa){//判断是提问还是回答
		case "提问":
			data.qaReply = "提问";
			try{//提问账号
				data.name = document.getElementsByClassName("ask-author  ")[0].innerText;
			}catch (e) {
				data.name = prompt("提问账号采集失败，请输入提问账号！","");
				if(data.name == null)return false;//验证是否输入
			}
			try{//提问时间
				var pageDate = document.getElementsByClassName("text")[0].getElementsByTagName("span");
				pageDate = pageDate[pageDate.length - 1].innerText;
				if(pageDate.indexOf("小时前") != -1){
					pageDate = parseInt(pageDate.replace("小时前",""));//获取多少个小时之前，转为int
					var date = new Date();
					date.setHours(date.getHours() - pageDate);
				}else if(pageDate.indexOf("分钟前") != -1){
					pageDate = parseInt(pageDate.replace("分钟前",""));//获取多少分钟之前，转为int
					var date = new Date();
					date.setMinutes(date.getMinutes() - pageDate);
				}else if(pageDate.indexOf("今天") != -1){
					var date = new Date();
				}else if(pageDate.indexOf("昨天") != -1){
					var date = new Date();
					date.setDate(date.getDate() - 1);
				}else{
					var date = new Date(pageDate);
				}
				data.date = date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
				
			} catch (e) {//如果采集回答时间出错则让用户输入时间
				var TempDate = new Date();
				data.date = prompt("提问日期采集失败，请输入提问日期",TempDate.getFullYear()+"."+(TempDate.getMonth()+1)+"."+TempDate.getDate());
				if( data.date == null)return false;//验证是否输入
			}

			break;
		case "回答":
			data.qaReply = "回答";

			try{
				data.name = document.getElementsByClassName("entrance")[0].parentNode.parentNode.parentNode.getElementsByClassName("ask-author  ")[0].innerText;//获取用户名
			} catch (e) {//账号采集失败则让用户输入账号
				data.name = prompt("因账号未登录或登录账号未回答或其它原因导致回答账号采集失败，请输入回答账号或登录后刷新重新采集！","");
				if(data.name == null)return false;//验证是否输入
			}
			
			try{//提问时间
				var pageDate = document.getElementsByClassName("entrance")[0].parentNode.parentNode.parentNode.getElementsByClassName("time")[0].innerText;
				if(pageDate.indexOf("小时前") != -1){
					pageDate = parseInt(pageDate.replace("小时前",""));//获取多少个小时之前，转为int
					var date = new Date();
					date.setHours(date.getHours() - pageDate);
				}else if(pageDate.indexOf("分钟前") != -1){
					pageDate = parseInt(pageDate.replace("分钟前",""));//获取多少分钟之前，转为int
					var date = new Date();
					date.setMinutes(date.getMinutes() - pageDate);
				}else if(pageDate.indexOf("今天") != -1){
					var date = new Date();
				}else if(pageDate.indexOf("昨天") != -1){
					var date = new Date();
					date.setDate(date.getDate() - 1);
				}else{
					var date = new Date(pageDate);
				}
				data.date = date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
				
			} catch (e) {//如果采集回答时间出错则让用户输入时间
				var TempDate = new Date();
				data.date = prompt("因账号未登录或登录账号未回答或其它原因导致回答日期采集失败，请输入回答日期",TempDate.getFullYear()+"."+(TempDate.getMonth()+1)+"."+TempDate.getDate());
				if( data.date == null)return false;//验证是否输入
			}
			break;
	}

	return true;
}

function getWkwd(){//采集悟空问答
	//获取关键字
	data.key = setting.wkwdKey;
	//备注标题
	try{
		data.title = document.getElementsByClassName("question-name")[0].innerText;
	}catch(e){
		data.title = data.title.substr(0, data.title.lastIndexOf("-悟空问答"));
	}	
	
	//平台
	data.type="悟空问答";
	data.url = "https://www.wukong.com/question/" + document.getElementsByClassName("question-item")[0].getAttribute("data-qid") + "/";
	
	
	//日期时间
	var date = new Date();
	data.date = date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
	//提问回答
	data.qaReply = setting.wkwdQa;
	
	try{//账号
		data.name = document.getElementsByClassName("user-name")[0].innerText
	}catch (e) {
		data.name = prompt("提问账号采集失败，请输入提问账号！","");
		if(data.name == null)return false;//验证是否输入
	}
	
	
	return true;
}

function getBaixing(){//采集百姓网
	//获取关键字
	data.key = setting.wkwdKey;
	//备注标题
	data.title = $(".viewad-title").text()
	//平台
	data.type="百姓网";
	//链接
	data.url = window.location.href;
	//日期时间
	var t = $(".viewad-actions span[data-toggle='tooltip']").text()
	data.date = new Date().getFullYear() + "." + t.substring(0,t.indexOf("日")).replace("月",".");
	
	//提问回答
	data.qaReply = "发布";
	//账号
	data.name = $("a.poster-name").text()
	if(data.name == ""){
		data.name = prompt("提问账号采集失败，请输入提问账号！","");
		if(data.name == null)return false;//验证是否输入
	}
	return true;
}

function getGanji(){//采集赶集网
	//获取关键字
	data.key = setting.wkwdKey;
	//备注标题
	data.title = $(".title h1").text()
	//平台
	data.type="赶集网";
	//链接
	data.url = shortUrl(window.location.href);
	//日期时间
	var t = $(".title p span.mr35").text();//采集第一种时间格式
	t = t || $(".f10.pr-5").text();
	data.date = t.substring(5,t.indexOf(" ")).replace("-",".");
	data.date = data.date || $(".f10.pr-5").text();//采集第二种时间格式
	var date = new Date(new Date().getFullYear() + "." +  data.date);
	data.date = date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
	//提问回答
	data.qaReply = "发布";
	//账号
	data.name = $("a.logined-a.js-username").text().trim()
	if(data.name == ""){
		data.name = prompt("账号采集失败，请输入账号！","");
		if(data.name == null)return false;//验证是否输入
	}
	return true;
}

function getData() {//获取页面数据
	//初始化单条数据map，（时间，关键字，平台，账号，链接，提问回答回复数，备注标题）
	window.data = {date:"",key:"",type:"",name:"",url:"",qaReply:"",title:""};
	try {
		
		data.title=document.title;//获取页面标题
		data.url=window.location.href;//获取页面地址
		
		if(data.url.indexOf("tieba.baidu.com")!=-1){//百度贴吧	
			if(! getBdtb())return;//检测是否采集完成
		}
		if(data.url.indexOf("buluo.qq.com")!=-1){//兴趣部落
			if(! getXqbl())return;//检测是否采集完成
		}
		if(data.url.indexOf("zhidao.baidu.com")!=-1){//百度知道
			if(! getBdzd())return;//检测是否采集完成
		}
		if(data.url.indexOf("wenwen.sogou.com")!=-1){//搜搜问问
			if(! getSgww())return;//检测是否采集完成
		}
		if(data.url.indexOf("wenda.so.com")!=-1){//360问答
			if(! getWd360())return;//检测是否采集完成
		}
		if(data.url.indexOf("wukong.com")!=-1){//360问答
			if(! getWkwd())return;//检测是否采集完成
		}
		if(data.url.indexOf("baixing.com")!=-1){//百姓网
			if(! getBaixing())return;//检测是否采集完成
		}
		if(data.url.indexOf("ganji.com")!=-1){//赶集网
			if(! getGanji())return;//检测是否采集完成
		}
		//生成唯一id
		data.id = Math.random().toString() + new Date().getTime();
		
		log(data);
		log(setting);
		
//{date:"",key:"",type:"",name:"",url:"",qaReply:"",title:""};
//（时间，关键字，平台，账号，链接，提问回答回复数，备注标题）
		
		if( ! confirm("请检查数据是否正确：\n时间："+data.date+"\n关键字："+data.key+"\n平台："+data.type+"\n账号："+data.name+"\n链接："+data.url+"\n提问回答(回复数)："+data.qaReply+"\n标题："+data.title)){
			return;
		}
		window.postMessage({"saveData":window.data}, '/');//发送消息给content.js从而保存数据

	} catch (e) {
		console.log(e);
		alert("数据采集失败！\n可能网页正确加载或其它原因导致，请刷新重试或手动采集！。");
	}
	
}

function shortUrl(url){//精简链接
	if(url.indexOf("tieba.baidu.com") != -1){//百度贴吧
		return getFristText(url, "?pid");
	}
	if(url.indexOf("zhidao.baidu.com") != -1){//百度知道
		url = getFristText(url, "?");
		if(url.lastIndexOf(".html") == -1){//补齐链接尾部
			url += ".html";
		}
		return url;
	}
	if(url.indexOf("wenda.so.com")!=-1){//360问答
		return getFristText(url, "?");
	}
	if(url.indexOf("wukong.com")!=-1){//悟空问答
		return getFristText(url, "?");
	}
	if(url.indexOf("ganji.com")!=-1){//赶集网
		return getFristText(url, "?");
	}

	return url;
	
}

function getFristText(text,key) {//截取前段一部分文本
	if(text.indexOf(key)==-1)
		return text;
	else 
		return text.substr(0, text.indexOf(key));
	
}
function getTextCenter(text,from,to) {//取出文本中间
	f=text.indexOf(from)+from.length;
	if(f==from.length-1)return "";
	t=text.indexOf(to,f);
	if(t==-1)return "";
	return text.substring(f, t);
}