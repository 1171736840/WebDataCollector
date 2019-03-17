$(function(){
	window.Pattern = "sort";//网页打开时设置为排序模式
	showMenu(["navigation","edit","setting","recyclebin"]);//显示默认菜单
	RefreshTable();//加载表格

	$('#navigation').on('click',navigation);
	$('#edit').on('click',edit);
	$('#copy').on('click',copy);
	$('#select').on('click',select);
	$('#reverseSelection').on('click',reverseSelection);
	$('#toDay').on('click',toDay);
	$('#past').on('click',past);
	$('#remove').on('click',remove);
	$('#empty').on('click',empty);
	$('#past').on('click',past);
	$('#recyclebin,#recyclebinClose').on("click",recyclebin);//回收站
	$("#reduction").on("click",reduction);//还原
	$("#emptyRecyclebin").on("click",emptyRecyclebin);//清空回收站
	$("#removeRecyclebin").on("click",removeRecyclebin);//删除回收站
	
	$(window).on("resize",reSizeTableHead);//窗口大小被改变时调整表格表头宽度
});

function reSizeTableHead(){//窗口大小被改变时调整表格表头宽度
	var databaseHeadThList = $("#databaseHead th");
	var databaseThList = $("#div table th");
	
	for (var i = 0;i < databaseHeadThList.length; i++) {
		$(databaseHeadThList[i]).css("width",$(databaseThList[i]).css("width"));
	}
	$("#databaseHead > tbody > tr > th:nth-child(1)").html($("#div > table > tbody > tr:nth-child(1) > th:nth-child(1)").html()) 
	//回收站表格
	databaseHeadThList = $("#recyclebinHead th");
	databaseThList = $("#recyclebinTable th");
	
	for (var i = 0;i < databaseHeadThList.length; i++) {
		$(databaseHeadThList[i]).css("width",$(databaseThList[i]).css("width"));
	}
	
}

function removeRecyclebin(){//删除回收站
	removeIdList = [];//选的的数据id
	$("#recyclebinTable table.dataintable input[type=checkbox]").each(function(i,el){
		if(el.checked){
			removeIdList.push($(el).parents("tr").attr("data-id"));
		}
	});
	
	if(removeIdList.length == 0){
		alert("未选中任何记录！");
		return;
	}else if ( ! confirm("确定要删除这" + removeIdList.length + "条记录吗？\n")) return;
	
	chrome.storage.local.get({"recyclebin": []},function(items){
		var recyclebin = items.recyclebin.filter(item => jQuery.inArray(item.id, removeIdList) == -1);
		chrome.storage.local.set({"recyclebin":recyclebin},function(){
			createRecyclebinTable();//刷新
		});//保存数据
    	
	});
}
function emptyRecyclebin(){//清空回收站
	if ( ! confirm("确定要清空回收站吗？")) return;
	chrome.storage.local.set({"recyclebin":[]},function(){
		createRecyclebinTable();//重新创建回收站表格
	});//保存数据
}

function reduction(){//还原
	reductionIdList = [];//选的的数据id
	$("#recyclebinTable table.dataintable input[type=checkbox]").each(function(i,el){
		if(el.checked){
			reductionIdList.push($(el).parents("tr").attr("data-id"));
		}
	});
	
	if(reductionIdList.length == 0){
		alert("未选中任何记录！");
		return;
	}else if ( ! confirm("确定要还原这" + reductionIdList.length + "条记录吗？\n")) return;
	
	chrome.storage.local.get({"database": [],"recyclebin": []},function(items){
		var recyclebin =[];
		for (var i in items.recyclebin) {
			if(jQuery.inArray(items.recyclebin[i].id, reductionIdList) == -1){//检测id是否在还原列表中
				recyclebin.push(items.recyclebin[i]);//添加到新回收站数据
			}else{
				items.database.push(items.recyclebin[i]);//添加到原数据中
			}
		}
		
		chrome.storage.local.set({"database":items.database,"recyclebin":recyclebin},function(){
			createRecyclebinTable();//重新创建回收站表格
			RefreshTable();//加载表格
		});//保存数据
	});
}

function recyclebin(){//回收站
	var recyclebinPage = $("#recyclebinPage");
	if(recyclebinPage.css("display") == "none"){
		recyclebinPage.css("display","block");
		createRecyclebinTable();//创建回收站表格
		$('body').css("overflow", "hidden");//body隐藏滚动条
	}else{
		recyclebinPage.css("display","none");
		$("#recyclebinTable").html("")//清空表格内容，防止冲突
		$('body').css("overflow", "auto");//body显示滚动条
		
	}
	
	
}
function createRecyclebinTable(){//创建回收站表格
	chrome.storage.local.get({"recyclebin": [],"setting":{}},function(items){
		var recyclebin = items.recyclebin;
		var tableHtml = "";
		tableHtml += "<table class='dataintable'>";
//		var color=["#FF0000","#00FF00","#0000FF","#00FFFF","#FF00FF","#FF8C00","#E22754","#39bc30"]//排序计数变色
		var color=["#cd5c5c","#ba55d3","#ff69b4","#6495ed","#32cd32","#da70d6","#87cefa","#ff7f50"]//排序计数变色
		
		tableHtml += "<tr><th>选择</th><th>序号</th><th>日期</th><th>关键字</th><th>平台（吧名）</th><th>账号</th><th>链接</th><th>提问/回答(回复数)</th><th>备注（提问内容）</th></tr>"

		for (var i in recyclebin) {//通过链接判断平台	
			i = recyclebin.length - i - 1;
			if(recyclebin[i].url.indexOf("tieba.baidu.com")!=-1)var n=0;
			else if(recyclebin[i].url.indexOf("buluo.qq.com")!=-1)var n=1;
			else if(recyclebin[i].url.indexOf("zhidao.baidu.com")!=-1)var n=2;
			else if(recyclebin[i].url.indexOf("wenwen.sogou.com")!=-1)var n=3;
			else if(recyclebin[i].url.indexOf("wenda.so.com")!=-1)var n=4;
			else if(recyclebin[i].url.indexOf("wukong.com")!=-1)var n=5;
			else if(recyclebin[i].url.indexOf("baixing.com")!=-1)var n=6;
			else if(recyclebin[i].url.indexOf("ganji.com")!=-1)var n=7;
			
			tableHtml += "<tr data-id='" + recyclebin[i].id + "'><td><input class='checkbox' type='checkbox'/></td>";//选择框
			tableHtml += "<td>" + (recyclebin.length - i) + "</td>";//序号
			tableHtml += "<td>" + recyclebin[i].date + "</td>";//日期
			tableHtml += "<td>"+recyclebin[i].key+"</td>";//关键字
			tableHtml += "<td><font color='"+color[n]+"'>"+recyclebin[i].type+"</font></td>";//平台
			tableHtml += "<td>"+recyclebin[i].name+"</td>";//账号
			tableHtml += "<td><a target='_blank' title='点击访问链接' href='"+recyclebin[i].url+"'>"+recyclebin[i].url+"</a></td>";//链接
			tableHtml += "<td>"+recyclebin[i].qaReply+"</td>";//提问/回答（回复数）
			tableHtml += "<td class='enter'>"+recyclebin[i].title+"</td></tr>";//备注（提问内容）
		}
		
		var selection = recordSelection($("#recyclebinTable"));//记录用户已选中的项目
		
		document.getElementById("recyclebinTable").innerHTML= tableHtml;
		
		reductionSelection(selection);//还原用户已选中的项目
		
		$('#recyclebinPage').find("tr").on('click',trOnclick);//单击事件
		showStorageUsageInfo();//显示存储使用情况
		
	});
}

function select() {//全选表格
	$("#div table.dataintable input[type=checkbox]").prop("checked",true);
}
function reverseSelection() {//反选表格
	$("#div table.dataintable input[type=checkbox]").each(function(i,el){
		el.checked = ! el.checked;
	});
}
function toDay() {//今日
	past();//选中往日
	reverseSelection()//反选
}
function past() {//往日,除今日之外
	var toDay = new Date;
	toDay = toDay.getFullYear() + "." + (toDay.getMonth() + 1) + "." + toDay.getDate();
	$("#div table.dataintable tr td:nth-child(2)").each(function(i,el){
		el = $(el);
		el.prev().find("input[type=checkbox]").prop("checked",el.text() != toDay);		
	});

}
function copy() {//复制
	var text="";
	var tab="\t";//这里为tab键不是空格
	var enter="\n";
	var sum = 0;//计次使用
	var checkbox =document.getElementsByClassName("checkbox");//获取所有复选框
	for ( var i in checkbox) {//遍历复选框
		if (checkbox[i].checked) {
			var tr=checkbox[i].parentNode.parentNode;//获取行
			var td=tr.getElementsByTagName("td");//获取所有列
			//得到所有数据
			text+=td[1].innerText.trim()+tab;
			text+=td[2].innerText.trim()+tab;
			text+=td[3].innerText.trim()+tab;
			text+=td[4].innerText.trim()+tab;
			text+=td[5].innerText.trim()+tab;
			text+=td[6].innerText.trim()+tab;
			text+=td[7].innerText.trim()+enter;
			sum++;
			//alert(text);
		}
	}
	if(text==""){
		alert("未选中任何数据！");
		return;
	}
	copyToShearPlate(text);//保存到剪切板中
	alert("已复制 " + sum + " 条数据到剪切板");
}


function remove() {//删除
	var removeIdList = [];
	$("#div table.dataintable input[type=checkbox]").each(function(i,el){
		if(el.checked){
			removeIdList.push($(el.parentElement.parentElement).attr("data-id"));
		}
	});
	if(removeIdList.length == 0){
		alert("未选中任何记录！");
		return;
	}else if ( ! confirm("确定要删除这" + removeIdList.length + "条记录吗？\n")) return;
	
	chrome.storage.local.get({"database": [],"recyclebin": [],"setting":{}},function(items){
		var newDatabase = [];//创建一个新的数组来保存数据
		for(var i in items.database){
			if(jQuery.inArray(items.database[i].id, removeIdList) == -1){//检测id是否在删除列表中
				//不在删除列表则添加到新数组中
				newDatabase.push(items.database[i]);
			}else{
				items.recyclebin.push(items.database[i]);//将删除的项目添加到回收站中
			}
		}
		
		if(setting.autoClear){//自动清理多余数据
			items.recyclebin = items.recyclebin.slice(items.recyclebin.length - setting.autoClearAfterSize);
		}
		chrome.storage.local.set({"database":newDatabase,"recyclebin":items.recyclebin},function(){
			RefreshTable();//刷新
		});//保存数据
		
    	
	});
}

function empty() {//清空
	if(confirm("警告：确定要清空所有记录吗？（此操作不可恢复！）")){
		chrome.storage.local.get({"database": [],"recyclebin": [],"setting":{}},function(items){
			items.recyclebin = items.recyclebin.concat(items.database);//将所有数据添加到回收站中
			
			if(setting.autoClear){//自动清理多余数据
				items.recyclebin = items.recyclebin.slice(items.recyclebin.length - setting.autoClearAfterSize);
			}
			chrome.storage.local.set({"database":[],"recyclebin":items.recyclebin},function(){
				RefreshTable();//刷新
			});//保存数据
			
		});
	}
}


function RefreshTable() {//刷新表格
	chrome.storage.local.get({database: ""},read);
}
function sort() {//排序
	window.Pattern = "sort";
	RefreshTable();
	styleMenu([]);
	showMenu(["navigation","edit","setting","recyclebin"]);
}
function edit() {//选择
	if(document.getElementById("edit").style.color.toString()==""){//判断是否为编辑模式
		window.Pattern = "edit";
		RefreshTable();
		styleMenu(["edit","reverseSelection","select","remove","empty","past","copy","toDay"]);
		showMenu(["navigation","edit","copy","setting","recyclebin","select","reverseSelection","remove","empty","past","toDay"]);
	}else {
		sort()//排序模式
	}
		
		
}

function navigation(){//导航
	if(document.getElementById("navigation").style.color == ""){//判断是否为导航模式
		styleMenu(["navigation","zdtw","zdhd","360tw","360hd","sgtw","sghd","wksy","tbsy","blsy","gjw","bxw"]);
		showMenu(["navigation","edit","setting","recyclebin","zdtw","zdhd","360tw","360hd","sgtw","sghd","wksy","tbsy","blsy","gjw","bxw"]);
	}else{
		styleMenu([]);
		showMenu(["navigation","edit","setting","recyclebin"]);
	}
	if(window.Pattern == "edit"){
		sort();//排序模式
	}
}



function showMenu(show) {//按给定的数组显示菜单
	var menu=document.getElementById("databasePage").getElementsByClassName("nav_menu");
	for (var i = 0; i < menu.length; i++) {
		if(jQuery.inArray(menu[i].id, show)==-1){
//			menu[i].style.display="none";//隐藏标签
			menu[i].style.width = "0px";
		}else {
//			menu[i].style.display="inline";//显示标签
			menu[i].style.width = "";
		}
	}
}
function styleMenu(menu) {//按给定的数组修改菜单样式
	var menus=document.getElementsByClassName("nav_menu");
//	for (var i = 0; i < menus.length; i++) {//还原全部样式
//		menus[i].style="";
//	}
	for (var i = 0; i < menus.length; i++) {
		if(jQuery.inArray(menus[i].id, menu)!=-1){//判断当前菜单是否符合要求
			menus[i].style.color="#FFFFFF";
			menus[i].style.backgroundColor="#AAAAAA";
		}else{
			menus[i].style="";
		}
	}
}

function read(items) {
	var database=items.database;
//	console.log(database);
	var body="<table class='dataintable'>";
	var num=[0,0,0,0,0,0,0,0];//排序计数使用
//	var color=["#FF0000","#00FF00","#0000FF","#00FFFF","#FF00FF","#FF8C00","#E22754","#39bc30"]//排序计数变色
	var color=["#6495ed","#ba55d3","#32cd32","#ff69b4","#87cefa","#ff7f50","#da70d6","#cd5c5c"]//排序计数变色
	switch (window.Pattern) {//判断当前模式并生成表头
		case "sort": var tempHead="<th>排序</th>";break;
		case "edit": var tempHead="<th>选择</th>";break;
		case "copy": var tempHead="";break;
		default:var tempHead="";
	}
	var head = "<tr>" + tempHead + "<th>日期</th><th>关键字</th><th>平台（吧名）</th><th>账号</th><th>链接</th><th>提问/回答(回复数)</th><th>备注（提问内容）</th></tr>"
	var tempBody = ["","","","","","","",""];
	for (var i in database) {//通过链接判断平台
		if(database[i].url.indexOf("tieba.baidu.com")!=-1)var n=0;
		else if(database[i].url.indexOf("buluo.qq.com")!=-1)var n=1;
		else if(database[i].url.indexOf("zhidao.baidu.com")!=-1)var n=2;
		else if(database[i].url.indexOf("wenwen.sogou.com")!=-1)var n=3;
		else if(database[i].url.indexOf("wenda.so.com")!=-1)var n=4;
		else if(database[i].url.indexOf("wukong.com")!=-1)var n=5;
		else if(database[i].url.indexOf("baixing.com")!=-1)var n=6;
		else if(database[i].url.indexOf("ganji.com")!=-1)var n=7;
		
		tempBody[n]+= "<tr data-id='" +database[i].id+"'>";
		switch (window.Pattern) {//判断当前模式
		case "sort":
			tempBody[n]+="<td><font color='"+color[n]+"'>"+(++num[n])+"</font></td>";
			break;
		case "edit":tempBody[n]+="<td><input class='checkbox' type='checkbox'/></td>";break;
		}
		tempBody[n]+="<td col-name='date'>"+database[i].date+"</td>";//日期
		tempBody[n]+="<td col-name='key' edit='true' title='双击修改内容'>"+database[i].key+"</td>";//关键字
		tempBody[n]+="<td col-name='type'><font color='"+color[n]+"'>"+database[i].type+"</font></td>";//平台
		tempBody[n]+="<td col-name='name' edit='true' title='双击修改内容'>"+database[i].name+"</td>";//账号
		tempBody[n]+="<td col-name='url'><a target='_blank' title='点击访问链接' href='"+database[i].url+"'>"+database[i].url+"</a></td>";//链接
		tempBody[n]+="<td col-name='qaReply' edit='true' title='双击修改内容'>"+database[i].qaReply+"</td>";//提问/回答（回复数）
		tempBody[n]+="<td col-name='title' edit='true' break='true'>"+database[i].title+"</td>";//备注（提问内容）
		tempBody[n]+= "</tr>" ;
	}
	body+=head+tempBody.join("")+"</table>"//将各个平台的数据连接起来
	
	
	var selection = recordSelection($("#div"));//记录用户已选中的项目
	
	$("#div").html(body);
	
	reductionSelection(selection);//还原用户已选中的项目
	
	$("#div tr").on('click',trOnclick).on('dblclick',ondblclick);//单击事件
	
	showStorageUsageInfo();//显示存储使用情况
	setTimeout(reSizeTableHead,100);//窗口大小被改变时调整表格表头宽度
	setTimeout(reSizeTableHead,1000);//窗口大小被改变时调整表格表头宽度，再次执行一下,防止未生效

}

function recordSelection(el){//记录用户已选中的项目
	var checkboxList = el.find("tr input[type=checkbox]");
		
	var selection = [];
	for (var i = 0; i<checkboxList.length; i++) {
		var checkbox = $(checkboxList[i]);
		if(checkbox.prop("checked")){
			
			selection.push(checkbox.parents("tr").attr("data-id"))
		}
	}
	
	return selection;
}
function reductionSelection(selection){//还原用户已选中的项目
	for (var i in selection) {
		$("tr[data-id='" + selection[i] + "'] input[type=checkbox]").prop("checked",true);
	}
}

function trOnclick() {//行单击事件，反选复选框
	var el = window.event.srcElement;
	if(el.tagName == "INPUT" || el.tagName == "A" || el.tagName == "BUTTON"){//被点击的就是checkbox则跳过
		return;
	}
	var checkbox = $(el).parents("tr").find("input[type=checkbox]");
	checkbox.prop("checked",!checkbox.prop("checked"));
}

function ondblclick() {//行双击事件，修改数据
	var dom=$(window.event.srcElement);//获取鼠标点击的元素
	if(dom.attr("edit") != "true")return;//判断控件是否为可修改控件
	var dataId = dom.parent("tr").attr("data-id");
	var colName = dom.attr("col-name");
	var newData=prompt("请修改：",dom.html());
	if(newData==null)return;//用户单击取消
	
	chrome.storage.local.get({"database": []},function(items){
		for(var i in items.database){
			if(items.database[i].id == dataId){//检测id是否匹配
				try{
					items.database[i][colName] = newData;
				}catch(e){
					alert("修改失败！");
					return;
				}
				break;
			}
		}
		chrome.storage.local.set({database:items.database},function(){
			RefreshTable();//刷新
		});//保存数据
    	
	});
}

function getComLang(){
	$.get("json/comLang.json",{},function(json){
		console.log(json);
	},"json");
}

function showStorageUsageInfo(){
	chrome.storage.local.getBytesInUse(function(value){
//		value*=500
		var max = chrome.storage.local.QUOTA_BYTES;
		$("#storage-usage").attr("value",value).attr("max",max);
		$("#storage-usage-info-percentage").html((value / max * 100).toFixed(2) + "%");
		$("div.storage-usage-info").html("本地存储使用情况：" + value + "/" + max + "字节");
		
	});
	
	if(window.setting.remoteStorage){
		$("title").html("所有数据(远程)-数据采集器");
		$("div.storage-address").html("远程存储：已启用<br>存储地址：" + window.setting.remoteStorageAddress);
		
	}else{
		$("title").html("所有数据(本地)-数据采集器");
		$("div.storage-address").html("远程存储：未启用<br>存储地址：本地");
	}
}

$(window).on("focus",function(){//监听页面获得焦点
	RefreshTable();//刷新
});
