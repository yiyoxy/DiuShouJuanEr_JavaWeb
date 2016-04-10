package com.bili.diushoujuaner.mgt;

import com.bili.diushoujuaner.database.model.User;

public interface UserMgt {

	User getUserByUserNo(long userNo);
	
	User getUserByMobile(String mobile);
	
	User registerUserByMobile(String mobile, String password);
	
	User resetUserPsdByMobile(String mobile, String password);
	
	boolean modifyAutographByUserNo(String autograph, long userNo);
	
	boolean updateUserOnlineStatus(long userNo, boolean isOnline);
	
	User updateUserInfo(User user, long userNo);
	
	boolean updateHead(String path, long userNo);
	
}
