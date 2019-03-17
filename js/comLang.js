if(window.setting.enableCommonLanguage){
	//检测是否开启常用语功能
	if(href.indexOf("www.wukong.com/search/?keyword=") == -1) {
		injectionComLang();//不是悟空回答搜索页面正常显示
	}
}




function injectionComLang(){
	var title = getTitle(); //获取问题标题
	var comLangList = createComLangList(title);//创建常用语列表
	var el = getInjectionElement();//获取被注入的el
	el.prepend(comLangList);//注入列表
	
	//=================执行其它操作============
	$(".show-hide-dispute").click();//显示百度知道折叠回答
	$(".wgt-ad-right-fixed").remove();//使百度知道相似问题不会对常用语进行遮挡
	$("#aside_fix").remove();//使搜狗问问相似问题不会对常用语进行遮挡
	
}
function createTree(mainDiv,iframeId){//创建悟空回答常用语
	var iframe = $("iframe[id='"+iframeId+"']");
	
	var title = iframe.parents(".question-v3").find("h2").text();//获取问题标题
	var comLangList = createComLangList(title);//创建常用语列表
	log(title,mainDiv,iframeId);
	comLangList.attr("iframeId",iframeId);//和问题iframe进行绑定
	$(mainDiv).append(comLangList);//注入列表
}

function createComLangList(title) {//创建常用语列表
	comLang = JSON.parse(window.setting.comLang);
	
	for(var i in comLang) {
		comLang[i].matching = matching(comLang[i].key, title);//计算匹配度
	}
	comLang = comLang.filter(item => item.matching > 0);//删除掉没匹配上的项目
	if(comLang.length == 0){
		messageBox("没有匹配的常用语");
		return $("");
	}
	comLang.sort(function(m,n){return n.matching - m.matching});//按匹配度从大到小排列
//	console.log(comLang);
	//创建表格
	var listHTML = "<div class='common-language-list' style='border-bottom: none;height: 100%;'>";
	for (var i = 0; i < comLang.length; i++) {//在360问答界面for in遍历会遍历多余项
		listHTML += "<div id='" + comLang[i].id + "' class='common-language-list-item'>";
		listHTML += "<div class='title'>" + (parseInt(i) + 1) + ". " + comLang[i]["key"].join(" ");
		listHTML += "</div>";
		listHTML += "<div class='content'>" + comLang[i]["value"].join("</div><div class='content'>") + "</div>";
		listHTML += "</div>";
	}
	listHTML += "</div>";
	
	var list = $(listHTML);
	list.find("div.title").on("click",noneContent);//绑定标题被单击事件,隐藏内容
	list.find("div.content").on("click",getTreeContent).on("contextmenu",getTreeContent);//绑定内容被单击事件，复制内容
	
	list.on("mousewheel",listMousewheel);
	return list;
}

function matching(keyList, title) { //对关键字列表进行正则表达式查询匹配度
	var count = 0;
	for(var i in keyList) {
		var regexp = new RegExp(keyList[i], "i"); //准备正则表达式
		if(regexp.test(title)) { //正则表达式检测
			count++;
		}
	}
	return count;
}

function getTitle() { //获取问题标题
	if(href.indexOf("zhidao.baidu.com/question/") != -1) {//百度知道
		return $(".ask-title").text().trim(); 
	}else if(href.indexOf("wukong.com") != -1 && href.indexOf("search") == -1) {//悟空问答普通页面
		return $(".question-name").text().trim();
	}else if(window.location.href.indexOf("wenda.so.com/q/") != -1){//360问答
		return $(".title.js-ask-title").text().trim();
	}else if(href.indexOf("wenwen.sogou.com/question/") != -1){//搜狗问答
		return $("#question_title_val").text().trim();
	}
}

function getInjectionElement(){//获取被注入的元素
	if(href.indexOf("zhidao.baidu.com/question/") != -1) {//百度知道
		var el = $(".grid-r.qb-side");
		el.parent().css("width","1200px");
	}else if(href.indexOf("wukong.com") != -1 && href.indexOf("search") == -1) {//悟空问答普通页面
		var el = $("#pagelet-sidebar");
		el.parent().css("width","1140px");
	}else if(window.location.href.indexOf("wenda.so.com/q/") != -1){//360问答
		var el = $("#js-aside");
		el.parent().css("width","1130px");
	}else if(href.indexOf("wenwen.sogou.com/question/") != -1){//搜狗问答
		var el = $(".aside");
		el.parent().css("width","1110px");
	}
	
	el.css("width","402px");
	el.parent().css("overflow","hidden");
	return el;
}

function getTreeContent(event) {//获得点击的内容，添加到对应的回答框中
	var content = $(window.event.srcElement).text();
	if(window.location.href.indexOf("zhidao.baidu.com") != -1) {//百度知道
		if($(".wgt-search-relate.f-yahei.f-pening").css("display") != "block") {//判断回答输入框是否处于隐藏状态
			$("#answer-bar").trigger("click");//如果处于隐藏状态，点击“我有更好的答案”按钮显示回答输入框
		}
		func(content,window.event.type);
		function func(content,type){
			if($("#ueditor_0").contents().prop("readyState") != "complete"){//如果iframe未加载完成则继续等待
				setTimeout(func,300,content,type);//等待300毫秒后执行，防止iframe未加载
				return;
			}
			var body = $("#ueditor_0").contents().find("body");//找到回答iframe的body
			body.find("#initContent").remove();//删除默认提示语句
			if(type == "contextmenu"){//右键点击
				body.html("");
			}
			body.append("<p>" + content + "</p>");//将内容添加到编辑框中
			messageBox("回答已添加");
		}
	} else if(window.location.href.indexOf("wukong.com") != -1) {//悟空问答
		var doc = $(document);
		if(window.location.href.indexOf("wukong.com/search") != -1){//悟空回答搜索界面
			var id = $(window.event.srcElement).parents(".common-language-list").attr("iframeId");
			doc = $("iframe[id='" + id + "']").contents();
		}
		//插入回答
		var wui = doc.find("#write-ueditor-inline")
		if(window.event.type == "contextmenu"){//右键点击
			wui.html("");
		}
		wui.append("<p>" + content + "</p>");
		wui.find(".placeholder").parent().remove();//删除提示语句
		doc.find(".submitbar").css("display","block");//显示回答按钮
		
	}else if(window.location.href.indexOf("wenda.so.com/q/") != -1){//360问答
		var du =$("#detailUmeditor");
		if(window.event.type == "contextmenu"){//右键点击
			du.html("");
		}
		du.append("<p>" + content + "</p>");//插入回答
		$("#initContent").remove()//删除提示语句
	}else if(href.indexOf("wenwen.sogou.com/question/") != -1){//搜狗问答
		var mac = $("#myAnswerContent");
		if(window.event.type == "contextmenu" || mac.find("p").text().trim() == "在这里输入您的答案..."){//右键点击
			mac.html("");
		}

		mac.append("<p>" + content + "</p>");//插入回答

	}
	
	if(window.event.type == "contextmenu"){//右键点击
		//阻止弹出右键菜单
		window.event.returnValue=false;  
		return false;  
	}
}

function noneContent(){//隐藏或显示提示内容
	var content = $(window.event.srcElement).parent().find(".content");
	if (content.css("display") == "none"){
		content.css("display","block");
		
	}else{
		content.css("display","none");
	}
}

function listMousewheel(){//鼠标滑轮滚动事件

	var list = $(window.event.srcElement).parents(".common-language-list")[0];
	
	var divMarginTop = parseInt(list.style.marginTop) || 0;
	if(window.event.deltaY < 0){//限制向下滚动
		if(divMarginTop >= 0){
			return;
		}
		
	}else{//限制向上滚动
		if(divMarginTop <= 0 - (list.offsetHeight - document.documentElement.clientHeight * 0.8)){
			return;
		}
	}
	
	list.style.marginTop = (divMarginTop - window.event.deltaY) + "px";
	
	window.event.returnValue=false;  //阻止整个页面滚动
}
