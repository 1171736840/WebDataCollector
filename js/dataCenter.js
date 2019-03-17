/*
 * 接管系统存储函数，当远程存储运行时根据设置选择从本地还是远程存储获得数据
 */

//监听background.js的消息

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.message == "refreshSetting"){//重新显示所有已采集的数据
    	readSetting();
    }
});



chrome.storage.local.oldSet = chrome.storage.local.set;
chrome.storage.local.oldGet = chrome.storage.local.get;

chrome.storage.local.get = function(parameter,func){	//监听获取
	if(window.remoteStorage){//远程
		remoteGet(parameter,func);
	}else{//本地
		chrome.storage.local.oldGet(parameter,func);
	}
	
}

chrome.storage.local.set = function(parameter,func){	//监听写入
	if(window.remoteStorage){//远程
		remoteSet(parameter,func);
	}else{//本地
		chrome.storage.local.oldSet(parameter,func);
	}
}

function remoteSet(parameter,func){
	
	//把除setting以外的数据从保存到远程
	if("setting" in parameter){
		//参数中带setting，setting从本地获取，其它从服务器获取
		var newSetting = parameter["setting"]
		delete parameter["setting"]	//删除参数中的设置项

		chrome.storage.local.oldSet({"setting": newSetting},function(){
			if(getMapLength(parameter) == 0 && typeof func == "function"){
				func();
			}else{
				$.post(window.remoteStorageAddress + "/save",formatP(parameter),func,"json");
			}
			
		});	
	}else{
		//直接从服务器获取
		$.post(window.remoteStorageAddress + "/save",formatP(parameter),func,"json")
	}
}

function remoteGet(parameter,func){
	
	//把除setting以外的数据从远程获取
	if("setting" in parameter){
		//参数中带setting，setting从本地获取，其它从服务器获取
		delete parameter["setting"]	//删除参数中的设置项
		if(getMapLength(parameter) == 0 && typeof func == "function"){
			func({"setting":window._setting});
			
		}else{
			$.post(window.remoteStorageAddress + "/read",formatP(parameter),function(res){
				res.setting = window._setting;
				func(res);
			},"json");
		}
		
	}else{
		//直接从服务器获取
		$.post(window.remoteStorageAddress + "/read",formatP(parameter),func,"json");
	}
}
function formatP(parameter){
	for (var key in parameter) {
		parameter[key] = JSON.stringify(parameter[key])
	}
	return parameter;
}

function getMapLength(map){
	var count = 0;
	for (var key in map) {
		count++;
	}
	return count;
}

function readSetting(){
	chrome.storage.local.oldGet({"setting":{}},function(items){
		window._setting = items.setting;
		window.remoteStorage = items.setting.remoteStorage;
		window.remoteStorageAddress = items.setting.remoteStorageAddress;
	});
}
readSetting();