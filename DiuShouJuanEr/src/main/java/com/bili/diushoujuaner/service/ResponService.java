package com.bili.diushoujuaner.service;

import com.bili.diushoujuaner.common.dto.ResponseDto;

public interface ResponService {

	ResponseDto removeResponByResponNo(long responNo, String accessToken);
	
	ResponseDto addResponByRecord(long commentNo, long toNo, String content, String accessToken);
	
}
