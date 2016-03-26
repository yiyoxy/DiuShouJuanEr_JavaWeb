package com.bili.diushoujuaner.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bili.diushoujuaner.common.CommonUtils;
import com.bili.diushoujuaner.common.ConstantUtils;
import com.bili.diushoujuaner.common.dto.ResponseDto;
import com.bili.diushoujuaner.common.session.CustomSessionManager;
import com.bili.diushoujuaner.database.model.Comment;
import com.bili.diushoujuaner.mgt.CommentMgt;
import com.bili.diushoujuaner.service.CommentService;

@Service
public class CommentServiceImpl implements CommentService {

	@Autowired
	CommentMgt commentMgt;

	@Override
	public ResponseDto removeCommentByCommentNo(long commentNo, String accessToken) {
		if(!commentMgt.getPermitionForRemove(commentNo, CustomSessionManager.getCustomSession(accessToken).getUserNo())){
			return CommonUtils.getResponse(ConstantUtils.FAIL, "非法操作", null);
		}
		
		int effectLines = commentMgt.removeCommentByCommentNo(commentNo);
		if(effectLines > 0){
			return CommonUtils.getResponse(ConstantUtils.SUCCESS, "删除Comment成功", commentNo);
		}else{
			return CommonUtils.getResponse(ConstantUtils.FAIL, "删除Comment失败", null);
		}
	}

	@Override
	public ResponseDto addCommentByRecord(long recallNo, String content,
			String accessToken) {
		Comment comment = commentMgt.addCommentByRecord(recallNo, content, CommonUtils.getUserNoFromAccessToken(accessToken));
		if(comment != null){
			return CommonUtils.getResponse(ConstantUtils.SUCCESS, "添加Comment成功", comment);
		}else{
			return CommonUtils.getResponse(ConstantUtils.FAIL, "添加Comment失败", null);
		}
	}

}
