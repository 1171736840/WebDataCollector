createFloatMenu()//创建浮动菜单

function createFloatMenu(){//创建浮动菜单
	//创建一个浮动菜单条
	var box = $("<div class='a_box'><div id='jx' class='a_menu'>解析</div><div id='ck' class='a_menu'>查看</div></div>");
	$(document.body).append(box);
	box.find("#jx").on("click",divMenu1_onclick);//单击事件，采集数据
	box.find("#ck").on("click",function(){
		window.postMessage({"showData":"showData"}, '/');//发送消息给content.js从而查看所有已采集数据
	});//单击事件，采集数据
	
}

window.onGetSettingAndDatabase.wuKongQuestionList = function(){//当获取到设置数据时运行
	if(window.onscroll != null){
		window.onscroll();
	}
}

function divMenu1_onclick(){
	initCloudServer();//初始化云服务器相关
	
	//将页面宽度设置为合适大小
	$(".search-tab,.w-feed-container").css("width","730px");
	$(".w-search-user").remove();//删除多余元素
	
	//网页滚动事件，用于动态解析处于可视状态的问题
	window.onscroll = function(){//网页滚动事件，用于动态解析处于可视状态的问题
		//window.scrollY	滚动条Y轴位置
		//document.documentElement.clientHeight	网页可视区域高度
		//DOM.offsetTop	顶边相对于父DOM偏移位置
		
		var parentOffsetTop = document.getElementsByClassName("main-container page-search tag-0")[0].offsetTop;//获取父容器的偏移位置
		var questions = document.getElementsByClassName("w-feed-container")[0].getElementsByClassName("question-v3");//获取所有问题
		questions = addList(questions,document.getElementsByClassName("w-feed-container")[0].getElementsByClassName("question-v3 hover"));//获取鼠标下的问题并添加进去
		
		
		var visualQuestions = [];//将处于页面可视区域的问题DOM数组
		for(var i = 0;i < questions.length;i++){//这里不能使用for in循环，会导致找不到方法错误getElementsByClassName
			var offsetBottom = parentOffsetTop + questions[i].offsetTop +  questions[i].offsetHeight;//问题的底部偏移
			var offsetTop = parentOffsetTop + questions[i].offsetTop;//问题的顶部偏移
			var visualTop = window.scrollY;//页面可视区域的顶边
			var visualBottom = window.scrollY + document.documentElement.clientHeight;//页面可视区域的底边
			
			if(offsetTop >= visualTop && offsetTop <= visualBottom || offsetBottom >= visualTop && offsetBottom <= visualBottom){//判断问题DOM是否处于页面可视区域中
				visualQuestions.push(questions[i]);//将处于页面可视区域的问题DOM添加静数组中
				//console.log(questions[i].getElementsByTagName("a")[0].innerText);
			}
		}

		//console.log(window.scrollY,document.documentElement.clientHeight);
		parsingQuestions(visualQuestions);//解析处在可视区域中的问题
	}
	window.onscroll();
}


function parsingQuestions(questions){//解析网页中的问题
	//var questions = document.getElementsByClassName("w-feed-container")[0].getElementsByClassName("question-v3");//获取所有问题

	//遍历每个问题，精简掉多余内容，生成回答界面
	for(var i = 0;i < questions.length;i++){//这里不能使用for in循环，会导致找不到方法错误getElementsByClassName
		//console.log("question对象",questions[i])
		
		//检测链接是否已采集
		var questionSrc = questions[i].getElementsByTagName("a")[0].href;//获取问题链接地址
		if(testUrl(questionSrc)){//如果链接已采集则删除这个问题
			
			questions[i].id = "none" + parseInt(Math.random() * 100000000);//给这个要删除的问题添加个id
			noneAndRemoveQuestion(questions[i].id);//根据id隐藏并删除这个问题
			continue;
		}
		
		
		//删除多余内容
		$(questions[i]).find(".question-oper,.question-pic,.question-pic-big").remove();
		
		//准备回答界面
		var questionAnswers = questions[i].getElementsByClassName("question-answers")[0];
		if(questionAnswers == null){
			questionAnswers = createQuestionAnswers(questions[i]);//生成questionAnswers
		}
		questionAnswers.style.paddingTop = "0px";
		//生成问题详情网页并嵌套到问题回答界面中去
		var iframe = questionAnswers.getElementsByTagName("iframe")[0];
		if(iframe == null){
			//准备问题信息界面
			var questionInfo = questions[i].getElementsByClassName("question-info")[0];
			questionInfo.style = "font-size: 16px; margin-bottom: 4px; margin-top: 0px;";
			questionInfo.parentNode.style.padding = "0px";
			//添加问题信息消息
			questionInfo.innerHTML ="<span class='questionInfoMessage' style='line-height: 28px;'>正在加载页面，请稍等，若长时间未响应请尝试点击“刷新”</span>"
			//添加采集按钮
			questionInfo.innerHTML +="<div onclick='closePage()' class='myButton' >关闭</div>"
			//添加采集按钮
			questionInfo.innerHTML +="<div onclick='getData()' class='myButton' >采集</div>"
			//添加刷新按钮
			questionInfo.innerHTML +="<div onclick='refreshIframe()'class='myButton' >刷新</div>"
			//添加刷新按钮
			questionInfo.innerHTML +="<div onclick='iframeOnload(0)' class='myButton' >状态检测</div>"
			
			//创建问题详情界面
			questionAnswers.innerHTML = "";//清空所有内容
			createIframe(questionAnswers,questionSrc);//创建iframe问题详情页面并嵌套在网页中
		}

	}
}
function createQuestionAnswers(question){//根据question（问题）生成questionAnswers（问题答案）的DOM
	var questionAnswers = document.createElement("div");
	questionAnswers.className = "question-answers";
	question.appendChild(questionAnswers);
	return questionAnswers;
}

function createIframe(parentElement,src){//生成iframe(问题详情页面并嵌套到父DOm中)
	var iframe = document.createElement("iframe");
	iframe.width = "680px";
	iframe.height = "380px"
	iframe.height = "240px"
	iframe.src = src;
	iframe.onload = iframeOnload;
	//iframe.style.border = "1px solid #F1F1F1";
	parentElement.appendChild(iframe);
	return iframe;
}
function iframeOnload(type){
	
	if(type == 0){//如果是按钮触发的
		var iframe = window.event.srcElement.parentNode.parentNode.parentNode.getElementsByTagName("iframe")[0];
	}else{
		var iframe = window.event.srcElement
	}
	
	//https://www.wukong.com/answer/6511259570449416461/
	
	if(iframe.src == "about:blank"){//如果是空网页则返回
		return;
	}
	
	var iframeDocument = iframe.contentWindow.document;
	var iframeWindown = iframe.contentWindow.window;
	//页面过滤
	if(iframeWindown.location.href.indexOf("wukong.com/answer") == -1 && iframeWindown.location.href.indexOf("wukong.com/question") == -1){
		return;
	}
	
	var s = "#pagelet-sidebar,#paglet-index-header,.relate-feed,.copyright,.question-tags,";
	s += ".question-name,.question-bottom,.question-text,.question-img-preview,.title-fixed,.answer-tool";
	$(iframeDocument).find(s).css("display","none");//右边账号信息,顶部浮动菜单
	//把指定DOM的paddingTop设置为0px
	$(iframeDocument).find(".question.question-single").css("padding-top","0px");
	//把指定DOM的marginTop设置为0px
	$(iframeDocument).find(".answer-wrapper-inline").css("margin-top","0px");	
	iframeDocument.getElementsByClassName("submitbar")[0].style.display = "";//显示回答按钮
	iframeDocument.getElementById("write-ueditor-inline").style.minHeight = "138px"//将回答框调整到合适高度
	
	//将问题的回答的页面设置合适的样式
	var questionList = iframeDocument.getElementById("main-index-question-list").style = "width:0px; margin:0px; padding: 0px;";
	
	//获取问题信息DOM
	var questionInfoMessage = iframe.parentNode.parentNode.getElementsByClassName("questionInfoMessage")[0];
	questionInfoMessage.innerHTML = "登录账号：";
	
	//===================================================
	
	
	//获取第一个回答并判断问题是否已回答
	var answerState = false;//回答状态
	try{
		var loginName = iframeDocument.getElementsByClassName("user-name")[0].innerText.trim();//获取登录账号
		
		var answerUserNameElements = iframeDocument.getElementsByClassName("answer-user-name");//获取回答账号列表
		for(var i = 0 ; i < answerUserNameElements.length ;i++){
			//删除多余内容
			var userIntro = answerUserNameElements[i].getElementsByClassName("user-intro")[0];
			if(userIntro != null){
				answerUserNameElements[i].removeChild(userIntro);
			}
			//获取到回答账号，与登录账号进行对比，判断是否一致
			if(loginName == answerUserNameElements[i].innerText.trim()){
				answerState = true;
				
				if(iframeWindown.location.href.indexOf("wukong.com/question") != -1){
					questionInfoMessage.innerHTML += loginName + "，回答状态：已回答，正在关闭页面...";
					iframe.parentNode.parentNode.id = "none" + parseInt(Math.random() * 100000000);//给这个要删除的问题添加个id
					noneAndRemoveQuestion(iframe.parentNode.parentNode.id);//根据id隐藏并删除这个问题
				}else{
					questionInfoMessage.innerHTML += loginName + "，回答状态：已回答，可以进行采集";
					getData(iframe);//采集数据
					
					
				}
				break;//跳出循环
				
			}
			
		}
		if(! answerState){//如果检测到没有回答问题
			questionInfoMessage.innerHTML += loginName + "，回答状态：未回答";
		}
		
	}catch (e) {
		//console.log(e);
		questionInfoMessage.innerHTML += "未知，请尝试点击“刷新”或“状态检测”";
	}
	if(! answerState){//如果检测到没有回答问题
		iframe.id = new Date().getTime() + Math.random();
		showAllAnswerW(iframe.id);//显示页面上的问题和所有回答

	}
	
	
}
function refreshIframe(){//刷新iframe
	var iframe = window.event.srcElement.parentNode.parentNode.parentNode.getElementsByTagName("iframe")[0];
	iframe.contentWindow.window.location.reload();//刷新
	
	window.event.srcElement.parentNode.getElementsByClassName("questionInfoMessage")[0].innerHTML = "正在刷新，请稍等，若长时间未响应请尝试点击“刷新”或“状态检测”"
	
}

function noneAndRemoveQuestion(noneId){//慢慢调整问题高度，并在高度为0时删除问题
	
	//检测父节点是否为删除隐藏类型的div，不是则创建
	var questionDiv = document.getElementById(noneId);
	if(questionDiv == null){
		return;
	}
	
	if(questionDiv.parentNode.className != "noneDiv"){
		var iframe = questionDiv.getElementsByTagName("iframe")[0];
		if(iframe != null){
			iframe.src = "about:blank";//打开空网页
		}
		
		var noneDiv = document.createElement("div");
		noneDiv.className = "noneDiv";
		noneDiv.style.overflow = "hidden"
		noneDiv.style.height = questionDiv.offsetHeight + "px";
		
		questionDiv.parentNode.replaceChild(noneDiv,questionDiv);
		noneDiv.appendChild(questionDiv);
	}

	//获取高度
	var height = parseInt(questionDiv.parentNode.style.height);
	
	height -= 4;

	if(height > 0){
		questionDiv.parentNode.style.height = height+"px";
		window.setTimeout("noneAndRemoveQuestion(\"" + noneId + "\")",6);
	}else{
		questionDiv.parentNode.parentNode.removeChild(questionDiv.parentNode);//删除此问题
		window.onscroll();//调用页面滚动事件重新加载iframe
	}
	
}

function testUrl(url){//检测链接是否已采集
	url = shortUrl(url);//精简链接

	for(var i in window.database){
		if(window.database[i].url == url){
			return true;
		}
	}
	return false;
}
function getFristText(text,key) {//截取前段一部分文本
	if(text.indexOf(key)==-1){
		return text;
	}else {
		return text.substr(0, text.indexOf(key));
	}
}
function addList(list,list2){//两个list相加
	var newList = [];
	for(var i in list){
		newList.push(list[i]);
	}
	for(var i in list2){
		newList.push(list2[i]);
	}
	return newList;
}
function shortUrl(url){//精简链接
	if(url.indexOf("wukong.com")!=-1){//悟空问答
		return getFristText(url, "?");
	}
	return url;
	
}
function getData(iframe){//采集数据
	var iframe = iframe || window.event.srcElement.parentNode.parentNode.parentNode.getElementsByTagName("iframe")[0];
	if(iframe == null){
		return;
	}
	var iframeDocument = iframe.contentWindow.document;
	var iframeWindown = iframe.contentWindow.window;
	var question = iframe.parentNode.parentNode;
	
	var data = {};
	//获取关键字
	data.key = window.setting.wkwdKey;
	//备注标题
	data.title = question.getElementsByTagName("a")[0].innerText.trim();
	//平台
	data.type="悟空问答";
	data.url = shortUrl(question.getElementsByTagName("a")[0].href);
	//日期时间
	var date = new Date();
	data.date = date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
	//提问回答
	data.qaReply = window.setting.wkwdQa;
	//生成唯一id
	data.id = Math.random().toString() + new Date().getTime();
	
	try{//账号
		data.name = iframeDocument.getElementsByClassName("user-name")[0].innerText.trim();
	}catch (e) {
		data.name = prompt("提问账号采集失败，请输入提问账号！","");
		if(data.name == null)return false;//验证是否输入
	}
	
	if( ! confirm("请检查数据是否正确：\n时间："+data.date+"\n关键字："+data.key+"\n平台："+data.type+"\n账号："+data.name+"\n链接："+data.url+"\n提问回答(回复数)："+data.qaReply+"\n标题："+data.title)){
		return;
	}

	window.postMessage({"saveData":data}, '/');//发送消息给content.js从而保存数据
	
}

function initCloudServer(){//初始化云服务器相关
	
	document.getElementsByClassName("j-feedback")[0].style.display = "none";//隐藏反馈按钮
	//准备显示云端答案的父控件
	var mainIndexQuestionList = document.getElementById("main-index-question-list");
	mainIndexQuestionList.style.width = "1170px";
	var mainDiv = document.createElement("div");
	window.mainDiv = mainDiv;
	mainIndexQuestionList.insertBefore(mainDiv,mainIndexQuestionList.firstChild);
	mainDiv.style.width = "400px";
	mainDiv.style.float = "right"
	mainDiv.style.position = "fixed";
	mainDiv.style.zIndex = "1";
	mainDiv.style.top = "72px";
	mainDiv.style.marginLeft = "760px";
	
}

function getQuestionAndAnswerW(iframeId){//获取iframe里的问题和回答
	if(window.setting.enableCommonLanguage){
	//检测是否开启常用语功能
		var iframe = document.getElementById(iframeId);
		iframe.parentNode.parentNode.onmouseover = iframeDivMouseover;//鼠标移入事件
		createTree(window.mainDiv,iframeId);//显示常用语
		messageBox("常用语加载完成");
	}
}

function showAllAnswerW(iframeId) { //显示页面上所有回答
	try{
		document.getElementById(iframeId).contentWindow.document.getElementsByClassName("folder-answer-toggle")[0].click()//显示所有回答
	}catch(e){
	}
	setTimeout("getQuestionAndAnswerW(" + iframeId + ")",1000);
}

function iframeDivMouseover(e){//问题界面鼠标移入，显示相似问题
//	var id = $(window.event.srcElement).find("iframe").attr("id");
//	
//	$("")
	
	
	var iframe = window.event.srcElement.getElementsByTagName("iframe")[0];
	if(iframe == undefined){
		return;
	}

	var divList = window.mainDiv.getElementsByClassName("common-language-list");
	for(var i = 0; i < divList.length; i++){
		var iframeId = divList[i].getAttribute("iframeId");
		if(iframeId == iframe.id){
			//divList[i].style.display = "block";//显示
			divList[i].id = new Date().getTime();
			jQuery(divList[i]).fadeIn(300);
			
		}else{
			if(document.getElementById(iframeId) == null){//判断对应的iframe是否存在，存在隐藏相关问题和回答的div，不存在则删除
				window.mainDiv.removeChild(divList[i])
			}else{
				divList[i].style.display = "none";//隐藏
				
			}
		}
	}
}
function closePage(){//点击关闭按钮关闭问题界面

	var p = $(window.event.srcElement).parents(".question-v3");
	p.attr("id","none" + parseInt(Math.random() * 100000000));//给这个要删除的问题添加个id
	noneAndRemoveQuestion(p.attr("id"));//根据id隐藏并删除这个问题
}
