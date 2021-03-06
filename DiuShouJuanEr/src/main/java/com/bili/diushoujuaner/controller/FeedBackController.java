package com.bili.diushoujuaner.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bili.diushoujuaner.service.FeedBackService;

@Controller
public class FeedBackController {
	
	@Autowired
	FeedBackService feedBackService;

	@RequestMapping(value = "/1.0/feedback/add", method = RequestMethod.POST)
	@ResponseBody
	public Object addFeedBack(
			@RequestParam(value = "content", required = true, defaultValue = "") String content,
			@RequestHeader(value="AccessToken", required = true, defaultValue = "") String accessToken){
		return feedBackService.addFeedBack(content, accessToken);
	}	
	
}
