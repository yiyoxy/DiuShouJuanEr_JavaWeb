package com.bili.diushoujuaner.service;

import com.bili.diushoujuaner.common.dto.ResponseDto;

public interface FeedBackService {
	
	ResponseDto addFeedBack(String content, String accessToken);

}