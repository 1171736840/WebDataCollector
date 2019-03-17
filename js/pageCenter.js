initPageCenter();
function initPageCenter(){
	window.href = window.location.href;
	recoveryConsole();  //恢复被百度贴吧屏蔽的console
	window.onGetSettingAndDatabase = {}; //创建获得设置和已采集数据函数集

	//监听context.js的消息
	window.addEventListener("message", function(messag) {
		if(messag.data.setDatabaseAndSetting != null) { //获取已采集的数据和设置
			window.setting = messag.data.setDatabaseAndSetting.setting;
			window.database = messag.data.setDatabaseAndSetting.database;
			log(window.setting);
			log(window.database);
			//当获取到数据时调用对应的事件
			for(var i in window.onGetSettingAndDatabase) {
				window.onGetSettingAndDatabase[i](window.setting);
			}
		}
	
	}, false);
	
	window.postMessage({
		"getDatabaseAndSetting": "getDatabaseAndSetting"
	}, '/'); //发送消息给content.js从而获取所有已采集数据
	
	
	injectionCss("page.css");//注入css样式文件
		
	if(href.indexOf("wukong.com") == -1 && href.indexOf("tieba.baidu.com") == -1 && href.indexOf("wenda.so.com") == -1) {
		injectionScript("jquery.js");//悟空回答和百度贴吧页面已有jQuery，无需注入
	}
	
	onJQuery(function(){
		injectionScript("tools.js");

		if(href.indexOf("tieba.baidu.com/i/i/my_reply") != -1) {
			injectionScript("bdtbReplies.js");//百度贴吧回帖页面
			injectionCss("table.css");//注入css样式文件
		}
		if(href.indexOf("www.wukong.com/search/?keyword=") != -1) {
			injectionScript("wuKongQuestionList.js");//悟空回答搜索问题页面
			injectionScript("comLang.js");//常用语
			injectionCss("conLangList.css");//注入常用语css样式文件
		}
		if(href.indexOf("tieba.baidu.com/p/") != -1 ){
			injectionScript("collection.js");//百度贴吧
		}
		if(href.indexOf("tieba.baidu.com/f?") != -1 && href.indexOf("kw") != -1){
			injectionScript("bdtbTails.js");//创建百度贴吧小尾巴按钮
		}
		if(href.indexOf("zhidao.baidu.com/question/") != -1 ){
			injectionScript("collection.js");//百度知道
			injectionScript("comLang.js");//常用语
			injectionCss("conLangList.css");//注入常用语css样式文件
		}
		if(href.indexOf("wenda.so.com/q/") != -1){
			injectionScript("collection.js");//360问答
			injectionScript("comLang.js");//常用语
			injectionCss("conLangList.css");//注入常用语css样式文件
		}
		if(href.indexOf("wenwen.sogou.com/question/") != -1){
			injectionScript("collection.js");//搜狗问问
			injectionScript("comLang.js");//常用语
			injectionCss("conLangList.css");//注入常用语css样式文件
		}
		if(href.indexOf("buluo.qq.com/p/detail.html") != -1){
			injectionScript("collection.js");//兴趣部落
		}
		if(href.indexOf("www.wukong.com/question/") != -1){
			injectionScript("collection.js");//悟空问答
			injectionScript("comLang.js");//常用语
			injectionCss("conLangList.css");//注入常用语css样式文件
		}
		if(href.indexOf("www.wukong.com/answer/") != -1){
			injectionScript("collection.js");//悟空问答
			injectionScript("comLang.js");//常用语
			injectionCss("conLangList.css");//注入常用语css样式文件
		}
		if(href.indexOf(".baixing.com") != -1){
			injectionScript("collection.js");//百姓网
		}
		if(href.indexOf(".ganji.com") != -1){
			injectionScript("collection.js");//赶集网
		}
	});
}


function log(object) {
	if(window.setting.outInfo) {
		console.log(object);
	}
}
function injectionScript(src){
	window.postMessage({
		"injectionScript": src
	}, '/');
}
function injectionCss(src){
	window.postMessage({
		"injectionCss": src
	}, '/');
}

function recoveryConsole() { //恢复被百度贴吧屏蔽的console
	if(href.indexOf("tieba.baidu.com") != -1) {
		var iframe = document.createElement("iframe")
		document.body.appendChild(iframe);
		window.console = iframe.contentWindow.console;
		iframe.style.display = "none";
	}
}

function onJQuery(func){//检测jQuery是否已加载，已加载则调用回调函数，未加载则等待加载
	if(window.jQuery){
		func();
	}else{
		setTimeout(onJQuery,100,func);//等待100毫秒后再次检测
	}
}
