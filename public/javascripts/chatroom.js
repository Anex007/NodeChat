var allUsers = {};

function getUserInfo(userID, proSel, nameSel) {
	if(allUsers[userID]){
		var data = allUser[userID];
		proSel.attr('src', data.avatar);
		nameSel.append(data.username);
	}else{
		$.get('/users/'+userID, function(data, status){
			if(status==400){
				return;
			}
			var avatar = (data.avatar || '/images/default-user.png');
			if(proSel) proSel.attr('src', avatar);
			nameSel.append(data.username);
			allUsers[userID] = {avatar: avatar, username: data.username};
		}, 'json');
	}
}


function toTime(sTime) {
	var time = new Date(sTime);
	return time.getUTCMonth()+'/'+time.getUTCDate()+'/'+time.getUTCFullYear();
}
var Interval;
var s = 0;

function getUserName(id){

	if(allUsers[id]){
		return allUsers[id]['username'];
	}

	var username;
	$.get('/users/'+id, function(data, status){
		if(status==400){
			console.log(data);
			username = 'Invalid';
			return;
		}
		username = data;

	}, 'json');

	while(!username){}
	return username;
}

function saveMsgs(data, should_rev) {
	data.forEach(function(msg){
		var elm = '<div class="message" data-id="'+msg['_id']+'" >';
		elm += '<div class="author" data-user="'+msg['from']+'">'+getUserName(msg['from'])+' </div>';
		elm += '<span class="msg-time">'+toTime(msg['time'])+'</span>';
		elm += '<div class="msg-content" >'+msg['content']+'</div>';
		elm += '</div>';
		if (!should_rev)
			$('.message:last').after(elm);
		else
			$('.message:first').before(elm);
	});
	if (!should_rev)
		$('.messages').scrollTop($('.messages').get(0).scrollHeight);

}

function oldMsgGetter(){
	var last_id = $('.message:first').attr('data-id');
	$.ajax({
		type: 'get',
		url: '/chatroom',
		data: {ajax_2: 'true', l_id: last_id},
		dataType: 'JSON',
		statusCode: {
			400: function(){
				console.log('Something wrong with the chat server :(');
			}
		},
		success: function(data){
			if(data == 'Nomsg')  return;
			console.log(data);
			saveMsgs(data, true);
		}
	});
}

function newMsgGetter() {
	var last_id = $('.message:last').attr('data-id');	
	$.ajax({
		type: 'get',
		url: '/chatroom',
		data: {ajax_1: 'true', l_id: last_id},
		dataType: 'JSON',
		statusCode: {
			400: function(){
				console.log('Something wrong with the chat server :(');
			}

		},
		success: function(data){
			if(data=='Nomsg') return;
			saveMsgs(data, false);
		}		
	});
	// DEBUGGING
	//clearInterval(Interval);

}

function sendMsg(data) {
	if(!data) return;

	$.ajax({
		type: 'POST',
		url: '/chatroom',
		data: {content: data},
		success: function(){
			$('#message-input').val('');
		}
	});

}

$(document).ready(function(){
	$('.msg-time').each(function(){
		var time = toTime(this.getAttribute('data-time'));
		this.innerHTML = time;
	})

	$('.user').each(function(){	
		getUserInfo($(this).attr('data-user'), $(this).find('.userPic'), $(this));
	});

	$('.messages').scrollTop($('.messages').get(0).scrollHeight);
//this.scrollHeight - this.scrollTop === this.clientHeight;
	Interval = setInterval(newMsgGetter, 800);

	$('#message-input').keydown(function(e){
		if(e.which == 13 && e.shiftKey == false){
			sendMsg(this.value);
			e.preventDefault();
		}
	});

	$('.messages').scroll(function(){
		if(this.scrollTop == 0)
			oldMsgGetter();

	});

	$('#ChangePic').click(function(){
		$('#Submitter').removeAttr('hidden');
		$('#Uploader').click();
	});

	$('#Submitter').click(function(){
		$(this).attr('hidden', 'true');
	});

	getUserInfo($('#MenuIcon').attr('data-id'), $('#ProfilePic'), $('#UserMenu'));

	$('.message').each(function(message){
		getUserInfo($(this).find('.author').attr('data-user'), undefined, $(this).find('.author'));
	});	

	
});
