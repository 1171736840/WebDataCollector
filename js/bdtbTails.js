createTiebaTailsButton();//创建百度贴吧小尾巴按钮

function createTiebaTailsButton(){//创建百度贴吧小尾巴按钮
	var button = $("<button class='btn_default btn_middle j_submit poster_submit'>添加小尾巴</button>");
	button.on("click",function(){//百度贴吧添加小尾巴
		if(window.setting.bdtbTails){
			$("#ueditor_replace").append($("<p>" + window.setting.bdtbTails + "</p>"));
		}else{
			alert("你还未添加小尾巴，可以在采集器设置中添加");
		}
	});
	$("button.btn_default.btn_middle.j_submit.poster_submit").parent().append(button);
	
}