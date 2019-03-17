window.onGetSettingAndDatabase.bdtbReplies = function(){//注册获得设置和数据事件
	verificationButto();//验证是否采集
}

createButton();

function createButton() {//创建采集按钮
	var collectionButton = $("<button class='bdtb-eplies-collection'>采集</button>");
	collectionButton.on("click", collectionButtonClick); //绑定采集事件
	$("div.block.t_forward.clearfix div.b_right_up h4").append(collectionButton);
	verificationButto();//验证是否采集
	//一键采集今日
	var collectionByTodayButton = $("<button class='bdtb-eplies-collection'>一键采集今日</button>");
	collectionByTodayButton.on("click", collectionByToday); //绑定采集事件
	$("#tiezi_sub_tab ul").append(collectionByTodayButton);
	
}

function collectionButtonClick(event,flag) { //采集按钮采集事件函数
	if(event.srcElement.innerText != "采集"){
		return;//已采集则不执行
	}
	var el = $(event.srcElement.parentElement.parentElement);//获取当前div
	var data = collectionData(el);
	
	if(flag){
		return data;//在一键采集调用时返回数据一并提交
	}
	
	if(! confirm("请检查数据是否正确：\n时间："+data.date+"\n关键字："+data.key+"\n平台："+data.type+"\n账号："+data.name+"\n链接："+data.url+"\n提问回答(回复数)："+data.qaReply+"\n标题："+data.title)){
		return;
	}

	window.postMessage({"saveData":data}, '/');//发送消息给content.js从而保存数据
}

function collectionByToday() { //一键采集今日函数
	var dataList = [];
	var buttonList = $("div.simple_block_container button.bdtb-eplies-collection");
	for (var i = 0; i < buttonList.length; i++) {
		el = buttonList.get(i);
		if($(el.parentElement).find("cite").text().indexOf(":") != -1){
//			$(el).trigger("click",null,{"srcElement":el});//如果是今日则触发点击事件进行采集数据
			var data = collectionButtonClick({"srcElement":el}, true);
			log(data)
			if(data){
				dataList.push(data);
			}
		}
	}
	
	log("dataList",dataList);
	createTable(dataList);
	window.collectionDataList = dataList;

}

function collectionData(el){//采集指定div条目中的数据
//	console.log(el);
	var data = {};//创建数据载体
	//日期
	var pageDate = el.find("cite").text()
	if(pageDate.indexOf(":") != -1){
		var date = new Date();
		data.date = date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
	}else if(pageDate.indexOf("-") != -1){
		data.date = new Date().getFullYear()+"." + pageDate.replace("-",".");
	}
	
	//账号
	data.name = el.find("h4 a").text().trim();
	//平台
	data.type = el.find("div.common_source_main a:nth-child(3)").text();
	//标题
	data.title = "回帖";
//	data.title = el.find("div.common_source_main a.thread_title").text();
	//链接
	data.url = window.location.origin + el.find("div.common_source_main a.thread_title").attr("href");
	data.url = data.url.substring(0, data.url.indexOf("?fid"));//去除多余内容
	//关键字
	data.key = window.setting.bdtbKey;
	//回复数
	data.qaReply = "1";
	//生成唯一id
	data.id = Math.random().toString() + new Date().getTime();
	
	return data;
}

function verificationButto(){//验证是否采集
	$("div.simple_block_container button.bdtb-eplies-collection").each(function(i,el){
		url = window.location.origin + $(el.parentElement.parentElement).find("a.thread_title").attr("href");
		url = url.substring(0, url.indexOf("?fid"));//去除多余内容
		for (var i in window.database) {			
			if(window.database[i].url.indexOf(url) != -1){
				el.innerHTML = "已采集";
				return;
			}
		}
		el.innerHTML = "采集";
	});
}

function createTable(dataList){//创建数据表格	
	var tableHtml = "<div id='bdtbReplies' class='mask' onclick='closeTable()'><div class='page' onclick='stopPropagation(event)'><div class='title'>今日数据</div>";
	tableHtml += "<table class='dataintable'><tr><th>选择</th><th>序号</th><th>日期</th><th>关键字</th><th>吧名</th><th>账号</th><th>链接</th><th>回复数</th><th>备注</th></tr>"
	for(var i in dataList){
		tableHtml += "<tr dataID='" + dataList[i].id + "' onclick='selectTr(event)'>";
		tableHtml += "<td><input type='checkbox' checked='checked'/></td>";//选择框
		tableHtml += "<td>" + (parseInt(i) + 1) + "</td>";//序号
		tableHtml += "<td>" + dataList[i].date + "</td>";//日期
		tableHtml += "<td>"+dataList[i].key+"</td>";//关键字
		tableHtml += "<td>"+dataList[i].type+"</td>";//平台
		tableHtml += "<td>"+dataList[i].name+"</td>";//账号
		tableHtml += "<td><a target='_blank' title='点击访问链接' href='"+dataList[i].url+"'>"+dataList[i].url+"</a></td>";//链接
		tableHtml += "<td>"+dataList[i].qaReply+"</td>";//提问/回答（回复数）
		tableHtml += "<td>"+dataList[i].title+"</td></tr>";//备注（提问内容）
	}
	tableHtml += "</table>"
	if(dataList.length == 0){
		tableHtml +="<center><font size='6'><br>没有未采集的数据！<br><br></font></center>"
	}
	tableHtml += "<div class='bar'>"
	tableHtml += "<button class='bdtb-eplies-collection' onclick='selectAllTr(event)' style='float: none;'>全选</button>"
	tableHtml += "<button class='bdtb-eplies-collection' onclick='rSelectTr(event)' style='float: none;'>反选</button>"
	//tableHtml += "<button class='bdtb-eplies-collection' onclick='closeTable(event)'>取消</button>"
	tableHtml += "<button class='bdtb-eplies-collection' onclick='saveTable(event)'>保存</button>"
	tableHtml += "</div></div></div>"
	$(document.body).append($(tableHtml));
	
	
	//使用特效显示界面
	var mask = $("#bdtbReplies");
	var page = $("#bdtbReplies div.page");
	mask.css("display", "block");
	page.css("margin-top", (0 - page[0].offsetHeight) + "px");
	mask.css("opacity", 0);
	mask.animate({"opacity": 1}, 300);
	page.animate({"margin-top": (0 - page[0].offsetHeight / 2) + "px"}, 300);
	$(document.body).children("*[id!=bdtbReplies]").css("filter","blur(2px)");//模糊背景
	
}
function selectTr(event){//选择表格行元素
	var checkbox = $(event.srcElement.parentElement).find("input[type='checkbox']");
	checkbox[0].checked = ! checkbox[0].checked;
}

function closeTable(){//关闭表格
	var mask = $("#bdtbReplies");
	var page = $("#bdtbReplies div.page");
	mask.animate({"opacity": 0}, 300, function() {mask.css("display", "none");});
	page.animate({"margin-top": (0 - page[0].offsetHeight) + "px"}, 300);	
	$(document.body).children().css("filter","none");//取消模糊背景
	setTimeout(function(){$("table.dataintable").parent().parent().remove();},300);
}

function saveTable(){//保存表格
	var dataList = []; 
	var trList = $("table.dataintable tr:nth-child(n+2)");
	for (var i=0; i < trList.length; i++) {
		var tr = $(trList[i]);
		console.log(tr.attr("dataID"));
		if(tr.find("input[type='checkbox']").prop("checked")){
			for (var j in window.collectionDataList ) {
				if(window.collectionDataList[j].id == tr.attr("dataID")){
					dataList.push(window.collectionDataList[j]);
					break;
				}
			}
		}
	}
//	console.log(dataList);
	if(dataList.length == 0){
		alert("没有选中任何数据！");
		return;
	}
	window.postMessage({"saveDataList":dataList}, '/');//发送消息给content.js从而保存数据
	alert("采集完成！");
	closeTable();
	
}

function selectAllTr(event){//选择表格行元素
	var checkbox = $("table.dataintable input[type='checkbox']").prop("checked",true);
}
function rSelectTr(event){//反选表格行元素
	var checkbox = $("table.dataintable input[type='checkbox']").each(function(i,el){
		el.checked = ! el.checked;
	});
}
function stopPropagation(event) { //阻止事件向上冒泡
	event.stopPropagation();
}