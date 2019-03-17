$(function(){
	$('#setting').on('click',SettingShow);
	$('#settingSave').on('click',settingSave);
	$('#settingDefault').on('click',settingDefault);
	$('#settingImport').on('click',settingImport);
	$('#settingExport').on('click',settingExport);
	$('#collectionSetting').on('click',switchSubMenu);//采集设置
	$('#generalSetting').on('click',switchSubMenu);//通用设置
	$('#tails').on('click',switchSubMenu);//小尾巴
	$('#commonLanguage').on('click',switchSubMenu);//常用语标题
	$('#remoteStorageSetting').on('click',switchSubMenu);//远程存储
	
	$('#cjKeyCode').on('keydown',getKeyCode);
	$('#ckKeyCode').on('keydown',getKeyCode);
	$("#settingMask").on("click",settingClose);//隐藏设置界面
	$("#settingPage").on("click",stopPropagation);//阻止事件冒泡
	$("#showCommonLanguagePageButton").on("click",showAddComLangPage);//显示添加常用语界面
	$("#addComLangPage").on("click",stopPropagation);//阻止事件冒泡
	$("#addComLangMask").on("click",closeAddComLangPage).on("click",stopPropagation);//隐藏添加常用语界面
	$("#addTabByComLangValue").on("click",addTabByComLangValue);//添加常用语添加分隔符
	$("#ComLangButtom").on("click",saveComLang);//保存常用语
	
	window.id = ["bdzdKey","bdzdQa","wd360Key","wd360Qa","sgwwKey","sgwwQa","wkwdKey",
		"wkwdQa","bdtbKey","bdtbDate","bdtbPlatformName","bdtbName","enableCommonLanguage",
		"comLang","bdtbTails","xqblKey","xqblDate","xqblPlatformName","xqblName","autoClear",
		"autoClearAfterSize","closePage","outInfo","cjKeyCode","ckKeyCode","bdzdBusiness",
		"remoteStorage","remoteStorageAddress"];
	
	//监听background.js的消息
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	    //request	消息内容
	    //sender	消息来源
	    //sendResponse(回复内容)	消息回复
//	    console.log(request)
	    if(request.message == "refreshSetting"){//重新显示所有已采集的数据
	    	setTimeout(function(){
	    		settingRead(function(){
		    		RefreshTable();//重新加载表格
		    	});//重新读取设置
	    	},300);
	    }
	});
	
	settingRead();//读取设置
})

function getKeyCode(event){//判断用户按下的按键并生成快捷键
	
	if(event.key == "Control" || event.key == "Alt" || event.key == "Shift"){
		return;
	}
	
	var keyCode = "";
	if(event.ctrlKey == true){
		keyCode += "Ctrl + "
	}
	if(event.altKey == true){
		keyCode += "Alt + "
	}
	if(event.shiftKey == true){
		keyCode += "Shift + "
	}
	
	keyCode += event.key.toUpperCase();
	window.event.srcElement.value = keyCode;
}

function SettingShow() {//显示设置界面
	var mask = $("#settingMask");
	var page = $("#settingPage");
	mask.css("display", "block");
	page.css("margin-top", (0 - page[0].offsetHeight) + "px");
	mask.css("opacity", 0);
	mask.animate({"opacity": 1}, 300);
	page.animate({"margin-top": (0 - page[0].offsetHeight / 2) + "px"}, 300);
	$(document.body).children("*[id!=settingMask]").css("filter","blur(2px)");
}
function settingClose(){//隐藏设置界面
	var mask = $("#settingMask");
	var page = $("#settingPage");
	mask.animate({"opacity": 0}, 300, function() {mask.css("display", "none");});
	page.animate({"margin-top": (0 - page[0].offsetHeight) + "px"}, 300);
	$(document.body).children("*[id!=settingMask]").css("filter","none");
}

function stopPropagation(event) { //阻止事件向上冒泡
	event.stopPropagation();
}

function settingRead(func){//读取设置
	chrome.storage.local.get({"setting": false},function(items){
		if(items.setting){//如果设置存在
			//读取所有设置
			window.setting = items.setting;
			for(var i in id){
				var dom = document.getElementById(id[i]);//获取指定对象
				switch(dom.type){//判断input的类型
					case "checkbox"://选择框
						document.getElementById(id[i]).checked = items.setting[id[i]];
						break;
					default:
						document.getElementById(id[i]).value = items.setting[id[i]];
						break;
				}
			}
			createCommonLanguageList();
			if(typeof func == "function"){
				func();//调用回调函数
			}
		}else{//如果设置不存在
			settingDefault()//恢复成默认设置
		}
	});
}


function settingSave(){//保存设置
	//保存设置
	var setting = getSettingMap();
	chrome.storage.local.set({"setting": setting},function(){
		chrome.runtime.sendMessage({message:"refreshSetting"},function(){
			alert("设置已保存！");
		});//向所有页面发送消息重新读取设置
		
	});
	
}
function settingDefault(){//恢复默认设置
	if ( ! confirm("确定要恢复默认设置吗？")) return;
	//向background.js发送消息显示还原默认设置
	chrome.runtime.sendMessage({message:"settingDefault"});
	
}
function settingImport(){//导入设置
	try {
		var length = 0;//初始化map成员总数
		var success = 0;//初始化成功数
		
		var jsonStr = prompt("请下面的文本框中粘贴设置数据转换的json文本，以导入设置！");
		if(jsonStr){
			setting = JSON.parse(jsonStr);//按照预期，这里应该解析为一个map
			for(var key in setting){//遍历map，对符合规则的进行导入  
				length++;//map成员总数+1
				if($.inArray(key,id) != -1){//判断输入的设置项是否符合规则
					var dom = document.getElementById(key)//获取DOM
					switch(dom.tagName){//判断DOM类型
						case "INPUT"://input输入类型的dom
							switch(dom.type){//判断input的类型
								case "text"://文本框
									dom.value = setting[key];
									success++;
									break;
								case "password"://文本框
									dom.value = setting[key];
									success++;
									break;
								case "checkbox"://复选框
									dom.checked = setting[key];
									success++;
									break;
							}
							break;
						case "SELECT"://下拉列表框
							var options = dom.getElementsByTagName("option");//获取此列表框所有列表项
							for(i in options){//遍历下拉列表项，判断导入的设置是否存在列表项中
								if(options[i].value == setting[key]){//存在列表项中则选中列表项
									dom.value = setting[key];
									success++;
									break;
								}
							}
							break;
						
					}
	
				}
				
			}

			chrome.storage.local.set({"setting": getSettingMap()},function(){
				alert("共计 " + length + " 项设置，导入成功 " + success + " 项，失败 " + (length - success) +" 项！");
				chrome.runtime.sendMessage({message:"refreshSetting"});//向所有页面发送消息重新读取设置
				
			});
		}
	}catch (e) {
		console.log(e);
		alert("导入设置失败！输入的json文本存在错误！");
	}
	
	
}
function settingExport(){//导出设置
	var jsonStr = JSON.stringify(getSettingMap());//将设置map转换成json文本
	copyToShearPlate(jsonStr);//把json保存在剪切板中，函数位于options.js
	alert("已将所有设置数据转换成json文本并保存到剪切板，请粘贴到合适地方进行保存！");
}


function getSettingMap(){//获取所有设置的map
	setting = {};//创建一个map
	//获取用户的设置
	
	for(var i in id){//遍历所有设置项
		var dom = document.getElementById(id[i]);//获取dom
		
		switch(dom.type){//判断input的类型
			case "checkbox"://选择框
				setting[id[i]] = dom.checked;
				break;
			default:
				setting[id[i]] = dom.value;
				break;
		}
		
		
		
	}
	return setting;
}


function switchSubMenu(){//把当前点击子菜单设置为当前菜单
	var thisSettingSubTitle = document.getElementsByClassName("thisSettingSubTitle")[0];
	thisSettingSubTitle.className = "settingSubTitle";
	window.event.srcElement.className = "thisSettingSubTitle";//把当前点击子菜单设置为当前菜单
	
	if(window.event.srcElement == thisSettingSubTitle){//如果当前菜单已是点击菜单，则不修改
		return;
	}
	document.getElementById(window.event.srcElement.id + "Table").style.display = "block";
	
	document.getElementById(thisSettingSubTitle.id + "Table").style.display = "none";

	
}

function createCommonLanguageList(){//创建常用语列表
//	console.log($("#comLang").val());
	var comLangList = JSON.parse($("#comLang").val());
	var listHTML = "";
	for (var i in comLangList) {
		listHTML += "<div id='" + comLangList[i].id + "' class='common-language-list-item'>";
		listHTML += "<div class='title'>" + (parseInt(i) + 1) + ". " + comLangList[i]["key"].join(" ");
		listHTML += "<a remove='remove'>删除</a><a edit='edit'>修改</a></div>";
		listHTML += "<div class='content'>" + comLangList[i]["value"].join("</div><div class='content'>") + "</div>";
		listHTML += "</div>";
	}
	$("div.common-language-list").html(listHTML);
	$("div.common-language-list a[remove='remove']").on("click",removeComLang);
	$("div.common-language-list a[edit='edit']").on("click",editComLang);
}

function showAddComLangPage(){//显示编辑常用语界面
	var mask = $("#addComLangMask");
	var page = $("#addComLangPage");
	mask.css("display", "block");
	page.css("margin-top", (0 - page[0].offsetHeight) + "px");
	mask.css("opacity", 0);
	mask.animate({"opacity": 1}, 200);
	page.animate({"margin-top": (0 - page[0].offsetHeight / 2) + "px"}, 200);
	$("#settingPage").css("filter","blur(2px)");
	$("#AddComLangKey").val("");
	$("#AddComLangValue").val("");
	$("#addComLangPage").attr("data-id","");
	$("#addComLangPage div.addComLangPageTitle").html("添加常用语");
}

function closeAddComLangPage(){//隐藏编辑常用语界面
	var mask = $("#addComLangMask");
	var page = $("#addComLangPage");
	mask.animate({"opacity": 0}, 200, function() {mask.css("display", "none");});
	page.animate({"margin-top": (0 - page[0].offsetHeight) + "px"}, 200);
	$("#settingPage").css("filter","none");
}
function editComLang(event){
	var id = $(event.originalEvent.path[0].parentElement.parentElement).attr("id");
//	console.log(id);
	var key = "";
	var value = "";
	var comLangList = JSON.parse($("#comLang").val());
	for (var i in comLangList) {
		if(comLangList[i].id == id){
			key = comLangList[i].key.join(" ");
			value = comLangList[i].value.join("\n------------------------------\n");
		}
	}
//	console.log(key,value);
	showAddComLangPage();
	$("#AddComLangKey").val(key);
	$("#AddComLangValue").val(value);
	$("#addComLangPage").attr("data-id",id);
	$("#addComLangPage div.addComLangPageTitle").html("修改常用语");
	
}

function removeComLang(event){//删除常用语
	if ( ! confirm("确定要删除吗？")) return;
	var id = $(event.originalEvent.path[0].parentElement.parentElement).attr("id");
//	console.log(id);
	var nList = [];
	var comLangList = JSON.parse($("#comLang").val());
	for (var i in comLangList) {
		if(comLangList[i].id != id){
			nList.push(comLangList[i]);
		}
	}
	$("#comLang").val(JSON.stringify(nList));
	createCommonLanguageList();//重新创建常用语列表
}

function addTabByComLangValue(){//添加常用语添加分隔符
	$("#AddComLangValue").insertContent("\n------------------------------\n");
}

function saveComLang(){//保存常用语
	var id = $("#addComLangPage").attr("data-id");
	var key = $("#AddComLangKey").val().split(" ");
	var value = $("#AddComLangValue").val().split("------------------------------");
	
	if(key.join("") == "" || value.join("") == ""){
		closeAddComLangPage();//隐藏编辑常用语界面
		return;
	}
	
	for (var i in key) {
		key[i] = key[i].trim();
	}
	for (var i in value) {
		value[i] = value[i].trim();
	}
	key = key.filter(s => s != "");
	value = value.filter(s => s != "");
	
//	console.log(id,key,value);
	
	var comLangList = JSON.parse($("#comLang").val());
	var f = false;
	for (var i in comLangList) {
		if(comLangList[i].id == id){
			comLangList[i].key = key;
			comLangList[i].value = value;
			f = true;
		}
	}
	if(!f){
		id = Math.random().toString() + new Date().getTime();
		comLangList.unshift({"id":id,"key":key,"value":value});
	}
	
	$("#comLang").val(JSON.stringify(comLangList));
	createCommonLanguageList();//重新创建常用语列表
	closeAddComLangPage();//隐藏编辑常用语界面
}
