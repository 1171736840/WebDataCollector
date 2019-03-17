//监听注入的js的消息
window.addEventListener("message", function(messag){
    //console.log(messag.data)
    if(messag.data.injectionScript != null){
    	injectionScript(messag.data.injectionScript);
    }
    if(messag.data.injectionCss != null){
    	injectionCss(messag.data.injectionCss);
    }
    if(messag.data.log != null){
    	console.log(messag.data.log);//百度贴吧某些页面会屏蔽console
    }
    
    if(messag.data.showData == "showData"){
    	showData();
    }
    if(messag.data.getDatabaseAndSetting == "getDatabaseAndSetting"){//获取已采集的数据和设置
    	setDatabaseAndSetting();
    }
    
    if(messag.data.saveDataList != null){//保存数据列表
    	saveDataList(messag.data.saveDataList);
    }
    
    if(messag.data.saveData != null){//保存数据
    	saveData(messag.data.saveData);
    }
    

}, false);

$(window).on("focus",function(){//监听页面获得焦点
	setDatabaseAndSetting();	//刷新所有数据
});

injectionScript("pageCenter.js");

function injectionScript(scriptSrc){//向当前页面注入js脚本
	var Script = document.createElement("script");//创建注入脚本DOM
	Script.setAttribute("type", "text/javascript");
	Script.setAttribute("charset", "UTF-8");//指定js编码方式，否则gbk编码的网页会乱码
	Script.src = chrome.extension.getURL("js/" + scriptSrc);//使用本地代码
//	Script.src = "//" + window.setting.serverAddress + "/ChromeExtension/js/" + scriptSrc;//使用云端代码
	document.head.appendChild(Script);
	return Script;
	
}

function injectionCss(cssHref) { //向当前页面注入CSS
	var css = document.createElement("link");
	css.setAttribute("rel", "stylesheet");
	css.setAttribute("type", "text/css");
	css.setAttribute("charset", "UTF-8");
	css.href = chrome.extension.getURL("css/" + cssHref);//使用本地代码
	document.head.appendChild(css);
	return css;
}

function setDatabaseAndSetting(){//把已采集的数据和设置数据发送到cloudMain.js
	chrome.storage.local.get({"database": [],"setting":{}},function(items){
		window.postMessage({"setDatabaseAndSetting":items}, "/");//读取并发送过去
	});
}


function showData(){
	chrome.runtime.sendMessage({message:"showData"},null);//向background.js发送消息显示已采集的所有数据
}

function saveData(data){
	chrome.storage.local.get({"database": [],"setting":{}},function(items){
		for(var i in items.database){//判断页面是否已采集
			if(items.database[i].url == data.url){
				alert("页面已采集！\n" + data.url + "\n" + data.title);
				return;
			}
		}
		
		items.database.push(data);//把新数据添加到尾部
		chrome.storage.local.set({database:items.database},function(){
			//向background.js发送消息让全部页面检测链接是否存在,存在则修改悬浮菜单为已采集
			chrome.runtime.sendMessage({"message":"testAllUrl","showAllDatePage":"showAllDatePage"},function(){

				if(items.setting.closePage){//如果开启采集后自动关闭页面
					if(window.location.href.indexOf("www.wukong.com/search/?keyword=") == -1) {//悟空问答搜索界面
						if(window.location.href.indexOf("tieba.baidu.com/i/i/my_reply") == -1){//百度贴吧一键采集回帖界面
							window.close();
							open(location, '_self').close();//如果第一种关闭方式没有起效则使用第二种关闭方式
						}
					}
					
					
				}
				setDatabaseAndSetting();	//刷新所有数据
			});
			
			
		});//保存
		
		
	});
}
function saveDataList(dataList){
	
	chrome.storage.local.get({"database": [],"setting":{}},function(items){
		for (var j in dataList) {
			data = dataList[j];
			for(var i in items.database){//判断页面是否已采集
				if(items.database[i].url == data.url){
					alert("页面已采集！\n" + data.url + "\n" + data.title);
					continue;
				}
			}
			
			items.database.push(data);//把新数据添加到尾部
		}
		chrome.storage.local.set({database:items.database},function(){
			setDatabaseAndSetting();	//刷新所有数据
		});//保存

	});
}
