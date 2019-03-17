$(function() {
	$("#showAllData").attr("none-href","chrome-extension://" + chrome.runtime.id + "/options.html");
	
	$("a").on("click",function(){
		var href = $(window.event.srcElement).attr("none-href");
		chrome.tabs.create({"url":href});
	});
//	return;
	chrome.storage.local.get({"database": false},function(items){
		var num = {"count":0,"zdtw":0,"zdhd":0,"360tw":0,"360hd":0,"sgtw":0,"sghd":0,"wk":0,"tb":0,"bl":0,"gjw":0,"bxw":0};
		for (var i in items.database) {
			data = items.database[i];
			num["count"]++;
			if(data.url.indexOf("tieba.baidu.com")!=-1){//百度贴吧
				num["tb"]++;
			}
			else if(data.url.indexOf("buluo.qq.com")!=-1){//兴趣部落
				num["bl"]++;
			}
			else if(data.url.indexOf("zhidao.baidu.com")!=-1){//百度知道
				if(data.qaReply == "回答"){
					num["zdhd"]++;
				}else if(data.qaReply == "提问"){
					num["zdtw"]++;
				}
			}
			else if(data.url.indexOf("wenwen.sogou.com")!=-1){//搜狗问问
				if(data.qaReply == "回答"){
					num["sghd"]++;
				}else if(data.qaReply == "提问"){
					num["sgtw"]++;
				}
			}
			else if(data.url.indexOf("wenda.so.com")!=-1){//360问答
				if(data.qaReply == "回答"){
					num["360hd"]++;
				}else if(data.qaReply == "提问"){
					num["360tw"]++;
				}
			}
			else if(data.url.indexOf("wukong.com")!=-1){//悟空问答
				num["wk"]++;
				
			}
			else if(data.url.indexOf("baixing.com")!=-1){//百姓网
				num["bxw"]++;
			}
			else if(data.url.indexOf("ganji.com")!=-1){//赶集网
				num["gjw"]++;
			}
			
		}
		
		console.log(num);
		for (var key in num) {
			$("#" + key).html(num[key]);
		}
		
	});
});
