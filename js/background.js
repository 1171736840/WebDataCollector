chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){//对其它js进行消息监听
    //request	消息内容
    //sender	消息来源
    //sendResponse(回复内容)	消息回复
//  console.log(request,sender)
	switch(request.message){
		case "showData":	//显示已采集数据
			window.open(chrome.extension.getURL("options.html"));//查看所有已采集数据
			break;
		case "settingDefault":	//还原默认设置
			settingDefault();
			break;
		case "refreshSetting"://向所有页面发送消息更新设置
			getSetting();
			allPageMessage({"message":"refreshSetting"});//setting.js页面
			break;
	}
});

function allPageMessage(message){//向所有页面发送消息
	chrome.tabs.query({}, function(tabs){//获取所有tab页面
    	for(i in tabs){
			chrome.tabs.sendMessage(tabs[i].id, message,null);
    	}
    });
}


//检测设置数据存不存在，不存在则创建默认设置
chrome.storage.local.get({"setting": false},function(items){
	if( ! items.setting){//还原默认设置
		settingDefault();	
	}
	
});

function settingDefault(){//还原默认设置
	//保存默认设置
	getComLang(function(comLang){
		setting = {"bdtbDate":"帖子时间",
				"bdtbKey":"安徽新华",
				"bdtbName":"楼主账号",
				"bdtbPlatformName":"贴吧名",
				"bdtbTails":"一分钟测试你适合学的互联网专业：http://m.ahxh.cn/zt/mini/",
				"bdzdKey":"安徽新华",
				"bdzdQa":"提问",
				"sgwwKey":"安徽新华",
				"sgwwQa":"提问",
				"wd360Key":"安徽新华",
				"wd360Qa":"提问",
				"wkwdKey":"安徽新华",
				"wkwdQa":"提问",
				"xqblDate":"话题时间",
				"xqblKey":"安徽新华",
				"xqblName":"楼主账号",
				"xqblPlatformName":"部落名",
				"autoClear":true,
				"autoClearAfterSize":"1000",
				"closePage":false,
				"outInfo":false,
				"cjKeyCode":"在此按下快捷键",
				"ckKeyCode":"在此按下快捷键",
				"bdzdBusiness":false,
				"enableCommonLanguage":true,
				"comLang":'',
				"remoteStorage":false,
				"remoteStorageAddress":"http://127.0.0.1:5050"
				};//创建一个map
		setting.comLang = comLang;
		chrome.storage.local.set({"setting": setting});
		window.setting = setting;
		allPageMessage({"message":"refreshSetting"});//向所有页面发送消息更新设置
	});
	
	
}
function getSetting(){
	chrome.storage.local.get({"setting": {}},function(items){
		window.setting = items.setting;
	});
}
getSetting();

//监听百度知道的webRequest请求并修将请求转发到行家号界面
chrome.webRequest.onBeforeRequest.addListener(details => {
	if(window.setting.bdzdBusiness == true){//检测是否开始行家号功能
		var regexp = new RegExp(".*\/\/zhidao\.baidu\.com\/question\/.*\.html.*","i");//准备正则表达式
		if(regexp.test(details.url)){//检测链接是否符合标准
			if (details.url.indexOf("entry=business_qb") == -1) {//不是行家号页面
				var redirectUrl = details.url;
				if (details.url.indexOf("entry=") != -1) {//参数已存在则替换
					var parameterList = details.url.split("?")[1].split("&");//获取所有参数
					for(var i in parameterList){//遍历所有参数
						if(parameterList[i].indexOf("entry=") != -1){//找到指定参数并替换
							parameterList[i] = "entry=business_qb";
						}
					}
					redirectUrl = details.url.split("?")[0] + "?" + parameterList.join("&");
					
				}else{//参数不存在则添加
					if (details.url.indexOf("?") == -1) {//添加行家号访问参数
						redirectUrl += "?entry=business_qb";
					}else{
						redirectUrl += "&entry=business_qb";
					}
				}
				return {"redirectUrl":redirectUrl};//将页面重定向到指定页面
			}
		}
	}
}, {urls: ["<all_urls>"]}, ["blocking"]);

function getComLang(func) {//获取comLang.json的常用语内容
	var xmlHttpReg = new XMLHttpRequest(); //先声明一个异步请求对象
	xmlHttpReg.open("get", "json/comLang.json", true);
	xmlHttpReg.send(null);
	xmlHttpReg.onreadystatechange = function(){
		if(xmlHttpReg.readyState == 4) { //4代表执行完成
			if(xmlHttpReg.status == 200) { //200代表执行成功
				func(xmlHttpReg.responseText)
			}
		}
	}
}
