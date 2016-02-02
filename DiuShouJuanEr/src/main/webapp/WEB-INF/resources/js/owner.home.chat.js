/* HomeChatTypeUtil,包含该js页面的所有类型 */
var HomeChatTypeUtil = {
	// tab按钮
	TAB_INDEX_CHAT : 0,
	TAB_INDEX_CONT : 1,
	// 显示panel
	IS_FIRST_Contact : true,
	IS_FIRST_CHATTING : true,
	// 聊天title显示箭头
	SHOW_UP_ICON : 1,
	SHOW_DOWN_ICON : 2,
	// 通讯录身份类型
	TYPE_PARTY : 1,
	TYPE_FRIEND : 2,
	// 聊天消息类型
	CHAT_INIT : -1,
	CHAT_PING : 0,
	CHAT_PONG : 1,
	CHAT_FRI : 2,
	CHAT_TIME : 3,
	CHAT_CLOSE : 4,
	CHAT_PAR : 5,
	CHAT_GOOD : 6,
	// 聊天消息中content的类型
	CONTENT_EMPTY : 0,
	CONTENT_TEXT : 1,
	CONTENT_IMG : 2,
	CONTENT_VOICE : 3,
	// 消息是否是自己的
	MESSAGE_YOU : 1,
	MESSAGE_ME : 2,
	//显示消息时间的时间间隔
	SHOW_TIME_LIMIT : 5
}
/* WebSocketUtil */
var WebSocketUtil = {
	webSocket : null,
	timeOuter : null,
	connect : function() {
		WebSocketUtil.webSocket = new WebSocket("ws://localhost:1314");
		WebSocketUtil.webSocket.onopen = WebSocketUtil.onOpen;
		WebSocketUtil.webSocket.onmessage = WebSocketUtil.onMessage;
		WebSocketUtil.webSocket.onclose = WebSocketUtil.onClose;
		WebSocketUtil.webSocket.onerror = WebSocketUtil.onError;
		WebSocketUtil.initTimeOuter();
	},
	initTimeOuter : function() {
		/*WebSocketUtil.timeOuter = setTimeout(function() {
			WebSocketUtil.connect();
		}, 20000);*/
	},
	onOpen : function(event) {
		WebSocketUtil.sendMessage(UserInfoUtil.getUserUserNo(), "",
				HomeChatTypeUtil.CHAT_INIT, HomeChatTypeUtil.CONTENT_EMPTY,"", "");
	},
	onMessage : function(event) {
		clearTimeout(WebSocketUtil.timeOuter);
		var message = JSON.parse(event.data);
		switch (message.msgType) {
		case HomeChatTypeUtil.CHAT_PING:
			WebSocketUtil.sendMessage("",[],HomeChatTypeUtil.CHAT_PONG,HomeChatTypeUtil.CONTENT_EMPTY,"","");
			break;
		case HomeChatTypeUtil.CHAT_FRI:
			HomeChatOperateUtil.playMusicNotice();
			var messageItem = {
				chatId : "chat_fri_" + message.senderAcc,
				fromNo : message.senderAcc,
				time : message.msgTime,
				content : message.msgContent,
				conType : message.conType,
				owner : HomeChatTypeUtil.MESSAGE_YOU,
				msgType : HomeChatTypeUtil.CHAT_FRI,
				count : 1
			};
			MessageUtil.addMessageItem(messageItem);
			break;
		case HomeChatTypeUtil.CHAT_PAR:
			HomeChatOperateUtil.playMusicNotice();
			var messageItem = {
				chatId : "chat_par_" + message.receiverAcc[0],
				fromNo : message.senderAcc,
				time : message.msgTime,
				content : message.msgContent,
				conType : message.conType,
				owner : HomeChatTypeUtil.MESSAGE_YOU,
				msgType : HomeChatTypeUtil.CHAT_PAR,
				partyNo : message.receiverAcc[0],
				count : 1
			};
			MessageUtil.addMessageItem(messageItem);
			break;
		case HomeChatTypeUtil.CHAT_TIME:
			//TODO 统一服务端和客户端之间的时间
			break;
		case HomeChatTypeUtil.CHAT_GOOD:
			HomeOperateUtil.showNoticeTip({type:message.msgType,picPath:message.msgTime,title:'系统通知',content:message.msgContent});
			break;
		}
		WebSocketUtil.initTimeOuter();
	},
	onClose : function(event) {
		// 执行关闭之后的一些操作，比如丢手绢是否显示用户在线状态
	},
	onError : function(event) {
		alert("退出了");
	},
	sendMessage : function(senderAcc, receiverAcc, msgType, conType, msgContent, msgTime) {
		clearTimeout(WebSocketUtil.timeOuter);
		var message = {
			senderAcc : senderAcc,
			receiverAcc : receiverAcc,
			msgType : msgType,
			conType : conType,
			msgContent : msgContent,
			msgTime : msgTime,
		};
		WebSocketUtil.webSocket.send(JSON.stringify(message));
		WebSocketUtil.initTimeOuter();
	},
	disConnection : function() {
		WebSocketUtil.sendMessage("", "", HomeChatTypeUtil.CHAT_CLOSE, HomeChatTypeUtil.CONTENT_EMPTY,
				"", "");
	}
}
/* 通讯录Util */
var ContactUtil = {
	contactMap : {},
	refresh : function() {
		AjaxUtil.request({
			method : "get",
			url : "1.0/contacts",
			params : {},
			type : 'json',
			callback : ContactUtil.refreshCallBack
		});
	},
	refreshCallBack : function(result) {
		if (result.retCode == "success") {
			var groupLetter = "";
			var contactList = result.data.contactList;
			$("#userNavCont .mCSB_container .userNavList").empty();
			$("#userNavCont .mCSB_container .userNavList").append('<li class="userNavContItem">'
					+ '<div class="navItemContHead" style="background-image:url(images/system/icon_friend_add.png);"></div>'
					+ '<div class="navItemContInfo">新的朋友</div>'
					+ '</li>');
			for (var i = 0; i < contactList.length; i++) {
				if (groupLetter != contactList[i].sortLetter) {
					groupLetter = contactList[i].sortLetter;
					$("#userNavCont .mCSB_container .userNavList").append(
							"<li class='userNavContItemSpe'><span>"
							+ groupLetter + "</span></li>");
				}

				ContactUtil.contactMap[(contactList[i].type == 1 ? "par_"+ contactList[i].contNo : "fri_" + contactList[i].contNo)] = contactList[i];
				$("#userNavCont .mCSB_container .userNavList").append("<li id='"
						+ (contactList[i].type == 1 ? "par_" + contactList[i].contNo : "fri_" + contactList[i].contNo)
						+ "' class='userNavContItem' onClick='HomeChatOperateUtil.homeChatShowContact(&#39;"
						+ (contactList[i].type == 1 ? "par_" + contactList[i].contNo : "fri_" + contactList[i].contNo)
						+ "&#39;)'><div class='navItemContHead' style='background-image:url("
						+ contactList[i].picPath
						+ ");'></div>"
						+ "<div class='navItemContInfo'>"
						+ contactList[i].displayName
						+ "</div></li>");
			}
			OffMsgUtil.refresh();
			HomeMainRecallUtil.refresh();
		} else if (result.retCode == "fail" || result.retCode == "error") {
			HomeOperateUtil.showNoticeTip(result.message);
		}
	},
	getConatctContNo : function(contId){
		var Contact = ContactUtil.contactMap[contId];
		if (Contact){
			return Contact.contNo;
		}
		else{
			alert("home.chat.js中，获取联系人contNo出错");
		}
	},
	getContactType : function(contId) {
		var Contact = ContactUtil.contactMap[contId];
		if (Contact){
			return Contact.type;
		}
		else{
			alert("home.chat.js中，获取联系人类型出错");
		}
	},
	getContactDisplayName : function(contId) {
		if(contId.indexOf('fri_') >= 0){
			var userNo = contId.substring(contId.indexOf('_')+1,contId.length);
			if(userNo == UserInfoUtil.getUserUserNo()){
				return UserInfoUtil.getUserNickName();
			}
		}
		var Contact = ContactUtil.contactMap[contId];
		if (Contact){
			return Contact.displayName;
		}
		else{
			return null;
		}
	},
	getPartyInformation : function(contId) {
		var party = ContactUtil.contactMap[contId];
		if (party){
			return party.information;
		}
		else{
			alert("home.chat.js中，获取群信息出错");
		}
	},
	getFriendNickName : function(contId) {
		var friend = ContactUtil.contactMap[contId];
		if (friend){
			return friend.nickName;
		}
		else{
			alert("home.chat.js中，获取好友昵称出错");
		}
	},
	getFriendAutograph : function(contId) {
		var friend = ContactUtil.contactMap[contId];
		if (friend){
			return friend.autograph;
		}
		else{
			alert("home.chat.js中，获取好友签名出错");
		}
	},
	getContactPicPath : function(itemId) {
		if(itemId.substring(itemId.indexOf('_')+1,itemId.length) == UserInfoUtil.getUserUserNo()){
			return UserInfoUtil.getPicPath();
		}else{
			var Contact = ContactUtil.contactMap[itemId];
			if (Contact){
				return Contact.picPath;
			}
			else{
				alert("home.chat.js中，获取好友头像路径出错");
			}
		}
	},
	getMemberPicPath : function(partyNo,userNo) {
		var Contact = ContactUtil.contactMap["par_" + partyNo];
		if (Contact){
			if(!Contact.memberMap){
				ContactUtil.contactMap["par_" + partyNo].memberMap = {};
				for(var i = 0; i < ContactUtil.contactMap["par_" + partyNo].memberList.length; i++){
					var member = ContactUtil.contactMap["par_" + partyNo].memberList[i];
					ContactUtil.contactMap["par_" + partyNo].memberMap[member.userNo] = member;
				}
			}
			return ContactUtil.contactMap["par_" + partyNo].memberMap[userNo].picPath;
		}
		else{
			alert("home.chat.js中，获取群成员头像路径出错");
		}
	},
	getFriendGender : function(contId) {
		var friend = ContactUtil.contactMap[contId];
		if (friend){
			return friend.gender;
		}
		else{
			alert("home.chat.js中，获取好友性别出错");
		}
	},
	initAcceptIdList : function(contId) {
		var Contact = ContactUtil.contactMap[contId];
		if(Contact){
			ChatUtil.currentReceiverIdList = [];
			if (Contact.type == HomeChatTypeUtil.TYPE_PARTY) {
				for(i = 0; i < Contact.memberList.length; i++){
					if(Contact.memberList[i].userNo != UserInfoUtil.getUserUserNo()){
						ChatUtil.currentReceiverIdList[ChatUtil.currentReceiverIdList.length] = Contact.memberList[i].userNo + "";
					}
				}
			} else if (Contact.type == HomeChatTypeUtil.TYPE_FRIEND) {
				ChatUtil.currentReceiverIdList[ChatUtil.currentReceiverIdList.length] = Contact.contNo + "";
			}
		}else{
			alert("无法得到对应的接收Id组");
		}
	}
}
/* 聊天列表Util */
var ChatUtil = {
	chatMap : {},
	currentChat : null,
	currentReceiverIdList : [],
	getCurrentChatType : function(){
		if(ChatUtil.currentChat.indexOf("par_") > -1){
			return HomeChatTypeUtil.TYPE_PARTY;
		}
		else{
			return HomeChatTypeUtil.TYPE_FRIEND;
		}
	},
	setCurrentChat : function(currentChat) {
		ChatUtil.currentChat = currentChat;
		ContactUtil.initAcceptIdList(ChatUtil.getCurrentChatContNo());
	},
	getCurrentChat : function() {
		return ChatUtil.currentChat;
	},
	getCurrentChatContNo : function(){
		return ChatUtil.currentChat.substring(ChatUtil.currentChat.indexOf('_')+1,ChatUtil.currentChat.length);
	},
	hideRedDot : function(chatId) {
		if(ChatUtil.chatMap[chatId]){
			ChatUtil.chatMap[chatId].count = 0;
			$("#" + chatId + " .redDot").addClass("vanish");
			$("#" + chatId + " .redDot").html("");
		}
	},
	removeChatItem : function(chatId) {
		$("#" + chatId).remove();
		$("#homeCustomMenu").remove();
	},
	reLocateTop : function(chatId) {
		var chatItem = $("#" + chatId);
		ChatUtil.removeChatItem(chatId);
		$("#userNavChat .userNavList").prepend(chatItem);
		$("#homeCustomMenu").remove();
	},
	addChatItem : function(chatItem) {
		if (ChatUtil.chatMap[chatItem.chatId] != null) {
			ChatUtil.chatMap[chatItem.chatId].time = chatItem.time;
			ChatUtil.chatMap[chatItem.chatId].content = chatItem.content;
			//大于0 避免新开启的聊天没有content也执行+1
			if (chatItem.content.length > 0 && (ChatUtil.currentChat == null
					|| ChatUtil.currentChat != chatItem.chatId)) {
				ChatUtil.chatMap[chatItem.chatId].count = ChatUtil.chatMap[chatItem.chatId].count + 1;
			}
		} else {
			var newChatItem = {
				fromNo : chatItem.msgType == HomeChatTypeUtil.CHAT_FRI ? chatItem.fromNo : chatItem.partyNo,
				time : chatItem.time,
				content : chatItem.content,
				count : chatItem.count
			};
			ChatUtil.chatMap[chatItem.chatId] = newChatItem;
		}
		ChatUtil.removeChatItem(chatItem.chatId);
		var tmpHtmlCount;
		if (ChatUtil.chatMap[chatItem.chatId].count == 0) {
			tmpHtmlCount = "<span class='redDot vanish'></span>";
		} else {
			tmpHtmlCount = "<span class='redDot'>"
					+ ChatUtil.chatMap[chatItem.chatId].count + "</span>";
		}
		$("#userNavChat .userNavList").prepend(
				"<li class='userNavChatItem' id='"
				+ chatItem.chatId
				+ "' onClick='MessageUtil.showMessageByChatId(&#39;"
				+ chatItem.chatId
				+ "&#39;)' onMouseDown='HomeOperateUtil.homeOnContextMenu(event," + HomeTypeUtil.HOME_MENU_CHAT + ",&#39;" + chatItem.chatId + "&#39;)'>"
				+ tmpHtmlCount
				+ "<div class='navItemChatHead' style='background-image:url("
				+ ContactUtil.getContactPicPath(chatItem.msgType == HomeChatTypeUtil.CHAT_FRI ? 
						chatItem.chatId.substring(chatItem.chatId.indexOf('_')+1,chatItem.chatId.length)
						: "par_" + chatItem.partyNo)
			    + ")'></div><div class='navItemChatInfo'><div class='navItemNickName'>"
			    + ContactUtil.getContactDisplayName(chatItem.msgType == HomeChatTypeUtil.CHAT_FRI ?
			    		chatItem.chatId.substring(chatItem.chatId.indexOf('_')+1,chatItem.chatId.length)
			    		: "par_" + chatItem.partyNo)
			    + "</div><div class='navItemTime'>"
			    + TimeFormatUtil.getFormatTime(ChatUtil.chatMap[chatItem.chatId].time)
			    + "</div><div class='navItemRecent'>"
			    + ChatUtil.chatMap[chatItem.chatId].content
			    + "</div></div></li>");
	}
}
/* 消息仓库Util */
var MessageUtil = {
	messageMap : {},
	lastMsgTimeMap : {},
	addMessageItem : function(msg) {
		var addMsgItem;
		var isShowTime;
		if(MessageUtil.lastMsgTimeMap[msg.chatId] == null || TimeFormatUtil.getTimeBetweenPreciseMinute(MessageUtil.lastMsgTimeMap[msg.chatId],msg.time)>=HomeChatTypeUtil.SHOW_TIME_LIMIT){
			MessageUtil.lastMsgTimeMap[msg.chatId] = msg.time;
			isShowTime = true;
		}else{
			isShowTime = false;
		}
		if (MessageUtil.messageMap[msg.chatId]) {
			var length = MessageUtil.messageMap[msg.chatId].length;
			addMsgItem = {
					msgId : length,
					fromNo : msg.fromNo,
					time : msg.time,
					content : msg.content,
					conType : msg.conType,
					msgType : msg.msgType,
					owner : msg.owner,
					partyNo : msg.partyNo,
					isShowTime : isShowTime
				};
			MessageUtil.messageMap[msg.chatId][length] = addMsgItem;
		} else {
			var messageItem = [];
			var length = messageItem.length;
			addMsgItem = {
				msgId : length,
				fromNo : msg.fromNo,
				time : msg.time,
				content : msg.content,
				conType : msg.conType,
				msgType : msg.msgType,
				owner : msg.owner,
				partyNo : msg.partyNo,
				isShowTime : isShowTime
			};
			messageItem[length] = addMsgItem;
			MessageUtil.messageMap[msg.chatId] = messageItem;
		}
		ChatUtil.addChatItem(msg);
		if(msg.chatId == ChatUtil.getCurrentChat()){
			if(msg.owner == HomeChatTypeUtil.MESSAGE_YOU){
				MessageUtil.appendMessageItemLeft(addMsgItem);
			}else{
				MessageUtil.appendMessageItemRight(addMsgItem);
			}
			HomeChatOperateUtil.chatRoomUpdateToEnd();
		}
	},
	appendMessageItemLeft : function(msgItem){
		$("#chatRoom .mCSB_container").append(
				"<div class='chatItem'><div class='itemTimeOuter'><span class='itemTime"
				+ (msgItem.isShowTime ? "'>":" vanish'>")
				+ msgItem.time
				+ "</span></div><div class='itemContentOuter'><img class='itemHead' src='"
				+ (msgItem.msgType == HomeChatTypeUtil.CHAT_PAR?ContactUtil.getMemberPicPath(msgItem.partyNo,msgItem.fromNo):ContactUtil.getContactPicPath("fri_"+ msgItem.fromNo))
				+ "'><div class='itemContentBox itemContentBoxLeft'><div class='itemContent contentLeft'><p>"
				+ msgItem.content + "</p></div></div></div></div>");
		},
	appendMessageItemRight : function(msgItem){
		$("#chatRoom .mCSB_container").append(
				"<div class='chatItem'><div class='itemTimeOuter'><span class='itemTime"
				+ (msgItem.isShowTime ? "'>":" vanish'>")
				+ msgItem.time
				+ "</span></div><div class='itemContentOuter'><div class='itemContentBox itemContentBoxRight'><div class='itemContent contentRight'><p>"
				+ msgItem.content + "</p></div></div><img class='itemHead' src='"
				+ (msgItem.msgType == HomeChatTypeUtil.CHAT_PAR?ContactUtil.getMemberPicPath(msgItem.partyNo,msgItem.fromNo):ContactUtil.getContactPicPath("fri_"+ msgItem.fromNo))
				+ "'></div></div>");
	},
	showMessageByChatId : function(chatId) {
		ChatUtil.hideRedDot(chatId);//清除点选的红点
		ChatUtil.setCurrentChat(chatId);//重新设置当前聊天的对象
		HomeChatOperateUtil.hideContactInfo();//隐藏联系人panel
		HomeChatOperateUtil.hideChattingInfo();//隐藏无选择聊天panel
		HomeChatOperateUtil.clearMessageSendBox();//清除消息输入框
		HomeChatOperateUtil.clearchatRoom();//清除消息显示框
		HomeChatOperateUtil.setMessagePanelHead(ContactUtil.getContactDisplayName(ChatUtil.getCurrentChatContNo()));
		if(ChatUtil.getCurrentChatType() == HomeChatTypeUtil.TYPE_PARTY){
			HomeChatOperateUtil.showMessagePanelHeadIcon(HomeChatTypeUtil.SHOW_DOWN_ICON);
		}else{
			HomeChatOperateUtil.hideMessagePanelHeadIcon();
		}
		HomeChatTypeUtil.IS_FIRST_CHATTING = false;
		if(MessageUtil.messageMap[chatId]){
			var msgItem;
			for (var i = 0; i < MessageUtil.messageMap[chatId].length; i++) {
				msgItem = MessageUtil.messageMap[chatId][i];
				if (msgItem.owner == HomeChatTypeUtil.MESSAGE_YOU) {
					MessageUtil.appendMessageItemLeft(msgItem);
				} else {
					MessageUtil.appendMessageItemRight(msgItem);
				}
			}
			HomeChatOperateUtil.chatRoomUpdateToEnd();
		}
	},
	clearMessageByChatId : function(chatId) {
         
	}
// TODO 窗口侧边滚动条的滑动回调
}
/* 聊天板块用户操作Util */
var HomeChatOperateUtil = {
	ready : function(){
		HomeOperateUtil.initCustomScrollbar("#senderBox");
		HomeOperateUtil.initCustomScrollbar("#chatRoom");
		HomeOperateUtil.initCustomScrollbar("#userNavChat");
		HomeOperateUtil.initCustomScrollbar("#userNavCont");
		HomeOperateUtil.initCustomEditor("#senderBox","HomeChatOperateUtil.senderBoxKeyUp(event)");
		
		HomeChatOperateUtil.showChattingInfo();
		HomeOperateUtil.homeCloseContextMenu("#userNavChat");
	},
	mouseDown : function(e){
		if (!$("#dropMenu").hasClass("vanish") && HomeOperateUtil.isMouseOutRange(e,"#dropMenu")) {
			HomeChatOperateUtil.homeChatHideMenu();
		}
	},
	homeSenderBoxOnClick : function(){
		$("#senderBox .mCSB_container").focus();
	},
	senderBoxKeyDown : function(e){
		if (e.which == 13) {
			e.preventDefault();
		}
	},
	senderBoxKeyUp : function(e){
		if (e.which == 13) {
			HomeChatOperateUtil.sendMessage();
		}
	    $("#senderBox").mCustomScrollbar("update");
	},
	playMusicNotice : function(){
		$("#chatAudio")[0].play();
	},
	chatRoomUpdateToEnd : function() {
		if(HomeOperateUtil.currentMenuItem == "#frame_chat"){
			$("#chatRoom").mCustomScrollbar("update");
			$("#chatRoom").mCustomScrollbar("scrollTo","last");
		}
	},
	sendMessage : function(){
		if(!$("#senderBox .mCSB_container").html() || $("#senderBox .mCSB_container").html().length <= 0)
			return;
		var messageItem;
		if(ChatUtil.getCurrentChatType() == HomeChatTypeUtil.TYPE_PARTY){
			messageItem = {
					chatId : ChatUtil.getCurrentChat(),
					fromNo : UserInfoUtil.getUserUserNo(),
					time : TimeFormatUtil.getCurrentTime(),
					content : $("#senderBox .mCSB_container").html(),
					conType : HomeChatTypeUtil.CONTENT_TEXT,
					owner : HomeChatTypeUtil.MESSAGE_ME,
					msgType : HomeChatTypeUtil.CHAT_PAR,
					partyNo : ContactUtil.getConatctContNo(ChatUtil.getCurrentChatContNo())
				};
		}else{
			messageItem = {
					chatId : ChatUtil.getCurrentChat(),
					fromNo : UserInfoUtil.getUserUserNo(),
					time : TimeFormatUtil.getCurrentTime(),
					content : $("#senderBox .mCSB_container").html(),
					conType : HomeChatTypeUtil.CONTENT_TEXT,
					owner : HomeChatTypeUtil.MESSAGE_ME,
					msgType : HomeChatTypeUtil.CHAT_FRI,
					partyNo : -1
				};
		}
		MessageUtil.addMessageItem(messageItem);
		HomeChatOperateUtil.clearMessageSendBox();
		if(ChatUtil.getCurrentChatType() == HomeChatTypeUtil.TYPE_PARTY){
			WebSocketUtil.sendMessage(ContactUtil.getConatctContNo(ChatUtil.getCurrentChatContNo()),ChatUtil.currentReceiverIdList,HomeChatTypeUtil.CHAT_PAR,HomeChatTypeUtil.CONTENT_TEXT,messageItem.content,TimeFormatUtil.getCurrentTime());
		} else {
			WebSocketUtil.sendMessage(UserInfoUtil.getUserUserNo(),ChatUtil.currentReceiverIdList,HomeChatTypeUtil.CHAT_FRI,HomeChatTypeUtil.CONTENT_TEXT,messageItem.content,TimeFormatUtil.getCurrentTime());
		}
	},
	clearchatRoom : function() {
		$("#chatRoom .mCSB_container").empty();
	},
	clearMessageSendBox : function() {
		$("#senderBox .mCSB_container").empty();
		$("#senderBox .mCSB_container").css("height","100%");
	},
	setMessagePanelHead : function(title) {
		$("#chatObjectName").html(title);
	},
	hideMessagePanelHeadIcon : function() {
		$("#chatObjectName").removeClass("chatHeadIconUp");
		$("#chatObjectName").removeClass("chatHeadIconDown");
	},
	showMessagePanelHeadIcon : function(showType) {
		if (showType == HomeChatTypeUtil.SHOW_UP_ICON) {
			$("#chatObjectName").removeClass("chatHeadIconDown");
			$("#chatObjectName").addClass("chatHeadIconUp");
		} else if (showType == HomeChatTypeUtil.SHOW_DOWN_ICON) {
			$("#chatObjectName").removeClass("chatHeadIconUp");
			$("#chatObjectName").addClass("chatHeadIconDown");
		}
	},
	setChattingInfoTxt : function(txt) {
		$("#chattingInfo .chatNoInfoTxt").html(txt);
	},
	homeChatShowMenu : function() {
		$("#dropMenu").removeClass("vanish");
	},
	homeChatHideMenu : function() {
		$("#dropMenu").addClass("vanish");
	},
	homeChatChangeTab : function(tabIndex) {
		if (tabIndex == HomeChatTypeUtil.TAB_INDEX_CHAT) {
			
			if (HomeChatTypeUtil.IS_FIRST_CHATTING) {
				HomeChatOperateUtil.showChattingInfo();
				HomeChatOperateUtil.setChattingInfoTxt("未选择聊天");
				HomeChatOperateUtil.setMessagePanelHead("");
			} else {
				HomeChatOperateUtil.hideChattingInfo();
			}
			HomeChatOperateUtil.hideContactInfo();
			
			if (ChatUtil.currentChat != null) {
				var contactId = ChatUtil.currentChat.substring(ChatUtil.currentChat.indexOf('_') + 1,ChatUtil.currentChat.length);
				HomeChatOperateUtil.setMessagePanelHead(ContactUtil.getContactDisplayName(contactId));
			}

			$("#userNavChat").removeClass("vanish");
			$("#userNavCont").addClass("vanish");
			$("#chatTab").css("background-image","url(images/system/tab_chat_press.png)");
			$("#contTab").css("background-image","url(images/system/tab_cont_normal.png)");
			$("#userNavChat").mCustomScrollbar("update");
		} else if (tabIndex == HomeChatTypeUtil.TAB_INDEX_CONT) {
			
			if (HomeChatTypeUtil.IS_FIRST_Contact) {
				HomeChatOperateUtil.showChattingInfo();
				HomeChatOperateUtil.setChattingInfoTxt("未选择联系人");
				HomeChatOperateUtil.setMessagePanelHead("");
			} else {
				HomeChatOperateUtil.hideChattingInfo();
				HomeChatOperateUtil.showContactInfo();
				HomeChatOperateUtil.setMessagePanelHead("详细信息");
			}

			HomeChatOperateUtil.hideMessagePanelHeadIcon();
			$("#userNavChat").addClass("vanish");
			$("#userNavCont").removeClass("vanish");
			$("#chatTab").css("background-image","url(images/system/tab_chat_normal.png)");
			$("#contTab").css("background-image","url(images/system/tab_cont_press.png)");
			$("#userNavCont").mCustomScrollbar("update");
		}
	},
	homeChatShowContact : function(contId) {
		HomeChatOperateUtil.setMessagePanelHead("详细信息");
		HomeChatOperateUtil.showContactInfo();
		HomeChatOperateUtil.hideChattingInfo();
		HomeChatTypeUtil.IS_FIRST_Contact = false;
		$("#contactInfoHead").attr("src",ContactUtil.getContactPicPath(contId));
		
		if (ContactUtil.getContactType(contId) == HomeChatTypeUtil.TYPE_PARTY) {
			$("#chatInfoNickname").html("");
			$("#chatInfoNickname").removeClass("chatInfoGenderFemale");
			$("#chatInfoNickname").removeClass("chatInfoGenderMale");
			$("#signature").text(ContactUtil.getPartyInformation(contId));
			$("#metaRemarkTip").text("群名称：");
			$("#metaRemarkCon").text(ContactUtil.getContactDisplayName(contId));
			$("#chatInfoSendBtn").attr("onClick","HomeChatOperateUtil.homeChatStartChat('" + contId + "')");
		} else if (ContactUtil.getContactType(contId) == HomeChatTypeUtil.TYPE_FRIEND) {
			$("#chatInfoNickname").html(ContactUtil.getFriendNickName(contId));
			$("#signature").text(ContactUtil.getFriendAutograph(contId));
			$("#metaRemarkTip").text("备注名：");
			$("#metaRemarkCon").text(ContactUtil.getContactDisplayName(contId));
			if (ContactUtil.getFriendGender(contId) == 1) {
				$("#chatInfoNickname").removeClass("chatInfoGenderFemale");
				$("#chatInfoNickname").addClass("chatInfoGenderMale");
			} else {
				$("#chatInfoNickname").removeClass("chatInfoGenderMale");
				$("#chatInfoNickname").addClass("chatInfoGenderFemale");
			}
			$("#chatInfoSendBtn").attr("onClick","HomeChatOperateUtil.homeChatStartChat('" + contId + "')");
		}
	},
	showContactInfo : function() {
		$("#contactsInfo").removeClass("vanish");
	},
	hideContactInfo : function() {
		$("#contactsInfo").addClass("vanish");
	},
	showChattingInfo : function() {
		$("#chattingInfo").removeClass("vanish");
	},
	hideChattingInfo : function() {
		$("#chattingInfo").addClass("vanish");
	},
	homeChatStartChat : function(contId) {
		HomeChatOperateUtil.homeChatChangeTab(HomeChatTypeUtil.TAB_INDEX_CHAT);
		ContactUtil.initAcceptIdList(contId);
		ChatUtil.setCurrentChat("chat_" + contId);
		var chatItem;
		if(ChatUtil.getCurrentChatType() == HomeChatTypeUtil.TYPE_PARTY){
			chatItem = {
					chatId : "chat_" + contId,
					fromNo : UserInfoUtil.getUserUserNo(),
					time : "",
					content : "",
					conType : HomeChatTypeUtil.CONTENT_EMPTY,
					msgType : HomeChatTypeUtil.CHAT_PAR,
					partyNo : ContactUtil.getConatctContNo(contId),
					count : 0
				};
		}else{
			chatItem = {
					chatId : "chat_" + contId,
					fromNo : ContactUtil.getConatctContNo(contId),
					time : "",
					content : "",
					conType : HomeChatTypeUtil.CONTENT_EMPTY,
					msgType : HomeChatTypeUtil.CHAT_FRI,
					count : 0
				};
		}
		ChatUtil.addChatItem(chatItem);
		MessageUtil.showMessageByChatId(ChatUtil.getCurrentChat());
	}
}
