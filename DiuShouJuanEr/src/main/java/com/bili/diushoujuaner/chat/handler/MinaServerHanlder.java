package com.bili.diushoujuaner.chat.handler;

import java.util.ArrayList;
import java.util.List;

import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IdleStatus;
import org.apache.mina.core.session.IoSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bili.diushoujuaner.chat.iosession.IOSessionManager;
import com.bili.diushoujuaner.chat.message.Message;
import com.bili.diushoujuaner.common.CommonUtils;
import com.bili.diushoujuaner.common.ConstantUtils;
import com.bili.diushoujuaner.common.springcontext.SpringContextUtil;
import com.bili.diushoujuaner.database.model.OffMsg;
import com.bili.diushoujuaner.database.model.CommonInfo;
import com.bili.diushoujuaner.mgt.OffMsgMgt;
import com.bili.diushoujuaner.mgt.CommonInfoMgt;

public class MinaServerHanlder extends IoHandlerAdapter {
	
	public static final Logger logger = LoggerFactory.getLogger(MinaServerHanlder.class);
	
	@Override
	public void sessionCreated(IoSession session) throws Exception {
		System.out.println("创建连接");
	}

	@Override
	public void sessionOpened(IoSession session) throws Exception {
		System.out.println("打开连接");
	}

	@Override
	public void sessionClosed(IoSession session) throws Exception {
		System.out.println("关闭连接");
		IOSessionManager.removeSession(session);
	}

	@Override
	public void sessionIdle(IoSession session, IdleStatus status)throws Exception {
		System.out.println("连接空闲");
	}

	@Override
	public void exceptionCaught(IoSession session, Throwable cause)throws Exception {
		System.out.println(cause.getMessage());
	}

	@Override
	public void messageReceived(IoSession session, Object message)throws Exception {
	    Message msg = CommonUtils.getObjectFromJSONString(message.toString());
	    System.out.println(msg);
	    switch(msg.getMsgType()){
	    case ConstantUtils.CHAT_INIT:
	    	processMessageInit(session, msg);
	    	break;
	    case ConstantUtils.CHAT_FRI:
	    	processMessageFriend(session, msg);
	    	break;
	    case ConstantUtils.CHAT_PAR:
	    	processMessageParty(session,msg);
	    	break;
	    }
	}
	
	private Message changeSenderAndReceiver(IoSession session, Message msg){
		List<String> tmpReceiverList = new ArrayList<>();
		tmpReceiverList.add(msg.getSenderAcc());
		msg.setReceiverAcc(tmpReceiverList);
		msg.setSenderAcc(IOSessionManager.getUserNoFromIoSessionToString(session));
		return msg;
	}
	
	private void processMessageParty(IoSession session, Message msg){
		IoSession sessionTmp = null;
		List<String> offLineAccList = new ArrayList<>();
		List<String> receiverAccList = new ArrayList<>();
		receiverAccList.addAll(msg.getReceiverAcc());
		boolean isMobileAccept = false;
		boolean isBrowserAccept = false;
		
		msg = changeSenderAndReceiver(session, msg);
		
		// 转发群消息给群组员
		for(String receiverAcc : receiverAccList){
    		sessionTmp = IOSessionManager.getSessionBrowser(receiverAcc);
	    	if(sessionTmp != null){
	    		isBrowserAccept = true;
	    		sessionTmp.write(CommonUtils.getJSONStringFromObject(msg));
	    	}
	    	
	    	sessionTmp = IOSessionManager.getSessionMobile(receiverAcc);
	    	if(sessionTmp != null){
	    		isMobileAccept = true;
	    		sessionTmp.write(CommonUtils.getJSONStringFromObject(msg));
	    	}
	    	
	    	if(!isMobileAccept && !isBrowserAccept){
	    		offLineAccList.add(receiverAcc);
	    	}
    	}
		
		// 存储群消息，确保非在线用户下次上线可以看到离线信息
		if(offLineAccList.size() > 0){
			//processMessageStore(session, msg, offLineAccList);
		}
	}
	
	/**
	 * 处理离线消息存储
	 * @param session
	 * @param msg
	 */
	private void processMessageStore(IoSession session, Message msg, List<String> offLineAccList){
		
		OffMsg offMsg = new OffMsg();
		
		offMsg.setToNo(msg.getMsgType() == ConstantUtils.CHAT_PAR ? Long.valueOf(msg.getReceiverAcc().get(0)) : Long.valueOf(msg.getSenderAcc()));
		offMsg.setFromNo(IOSessionManager.getUserNoFromIoSessionToLong(session));
		offMsg.setContent(msg.getMsgContent());
		offMsg.setConType(msg.getConType());
		offMsg.setMsgType(msg.getMsgType());
		offMsg.setIsRead(false);
		offMsg.setTime(msg.getMsgTime());
		
		OffMsgMgt offMsgMgt = (OffMsgMgt)SpringContextUtil.getBean("offMsgMgtImpl");
		
		offMsg = offMsgMgt.putOffMsgByRecord(offMsg);
		
		if(offLineAccList != null && offMsg != null){
			CommonInfoMgt commonInfoMgt = (CommonInfoMgt)SpringContextUtil.getBean("commonInfoMgtImpl");
			for(String offAcc : offLineAccList){
				CommonInfo commonInfo = new CommonInfo();
				commonInfo.setIsRead(false);
				commonInfo.setOffMsgNo(offMsg.getOffMsgNo());
				commonInfo.setToNo(Long.valueOf(offAcc));
				
				commonInfoMgt.addCommonInfoByRecord(commonInfo);
			}
		}
	}
	
	/**
	 * 处理好友初始化逻辑
	 * @param session
	 * @param msg
	 * @throws Exception
	 */
	private void processMessageInit(IoSession session, Message msg) throws Exception{
		session.setAttribute(ConstantUtils.ATTR_USERNO, msg.getSenderAcc());
    	IOSessionManager.addSession(session);
	}
	
	/**
	 * 处理好友消息逻辑
	 * @param message 消息实体
	 */
	private void processMessageFriend(IoSession session, Message msg){
		IoSession sessionTmp = IOSessionManager.getSessionMobile(msg.getReceiverAcc().get(0));
		boolean isSend = false;
    	if(sessionTmp != null){
    		sessionTmp.write(CommonUtils.getJSONStringFromObject(msg));
    		isSend = true;
    	}
    	sessionTmp = IOSessionManager.getSessionBrowser(msg.getReceiverAcc().get(0));
    	if(sessionTmp != null){
    		sessionTmp.write(CommonUtils.getJSONStringFromObject(msg));
    		isSend = true;
    	}
    	
    	if(!isSend){
    		processMessageStore(session, msg, null);
    	}
	}
	
	@Override
	public void messageSent(IoSession session, Object message) throws Exception {
		System.out.println("发送消息");
	}
	
}