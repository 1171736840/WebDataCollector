function messageBox(message) { //创建一个提示框，并在1.3秒钟后自动关闭
	var backgroundColor = "#4DC86F";//百度知道颜色
	if(window.location.href.indexOf("wukong.com") != -1){
		backgroundColor = "#FF6434"//悟空问答颜色
	}
	
	var span = document.createElement("span");
	document.body.appendChild(span);
	span.innerHTML = message;
	span.className = "messageBox";
	span.style.backgroundColor = backgroundColor;
	span.style.padding = "20px";
	span.style.position = "fixed";
	span.style.zIndex = "999";
	span.style.font = "微软雅黑";
	span.style.fontSize = "16px"
	span.style.color = "#FFFFFF"
	span.style.top = document.documentElement.clientHeight - 60 + "px"
	span.style.left = document.documentElement.clientWidth / 2 - span.offsetWidth / 2 + "px";
	span.style.borderRadius = "56px";
	span.style.boxShadow = "0px 0px 10px " + backgroundColor;
	span.id = new Date().getTime();
	
	setTimeout("jQuery('#" + span.id + "').fadeOut(1000)",2000);
	setTimeout("jQuery('#" + span.id + "').remove()",3000);
	
	//把所有的messageBox位置向上移动，防止被新消息遮挡
	var messageBoxList =  jQuery(".messageBox");
	messageBoxList.each(function(i){
		jQuery(this).animate({top: (document.documentElement.clientHeight - 30 - 70 * (messageBoxList.length - i)) + "px"},500);
	})
}
function copyToShearPlate(text){//复制到剪切板
	var textarea = document.createElement("textarea");
	document.body.appendChild(textarea);
	textarea.innerHTML=text;//把text保存在文本域中
	textarea.style.display="inline";//显示控件
	textarea.select(); //全选文本域中所有内容
	document.execCommand("Copy"); //执行浏览器复制命令
	textarea.style.display="none";//隐藏控件
	textarea.innerHTML="";//清空控件内容
	document.body.removeChild(textarea);
}

(function($) {  
	$.fn.extend({
		insertContent: function(myValue, t) {  
			var $t = $(this)[0];  
			if(document.selection) { // ie  
				 
				this.focus();   
				var sel = document.selection.createRange();   
				sel.text = myValue;   
				this.focus();   
				sel.moveStart('character', -l);   
				var wee = sel.text.length;   
				if(arguments.length == 2) {   
					var l = $t.value.length;   
					sel.moveEnd("character", wee + t);   
					t <= 0 ? sel.moveStart("character", wee - 2 * t    - myValue.length) : sel.moveStart(   "character", wee - t - myValue.length);   
					sel.select();   
				}   
			} else if($t.selectionStart    || $t.selectionStart == '0') {   
				var startPos = $t.selectionStart;   
				var endPos = $t.selectionEnd;   
				var scrollTop = $t.scrollTop;   
				$t.value = $t.value.substring(0, startPos)    + myValue    + $t.value.substring(endPos, $t.value.length);   
				this.focus();   
				$t.selectionStart = startPos + myValue.length;   
				$t.selectionEnd = startPos + myValue.length;   
				$t.scrollTop = scrollTop;   
				if(arguments.length == 2) {   
					$t.setSelectionRange(startPos - t, $t.selectionEnd + t);   
					this.focus();   
				}   
			} else {   
				this.value += myValue;   
				this.focus();   
			}   
		}   
	})  
})(jQuery);
