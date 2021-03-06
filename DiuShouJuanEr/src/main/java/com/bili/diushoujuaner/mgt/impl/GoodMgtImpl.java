package com.bili.diushoujuaner.mgt.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;

import com.bili.diushoujuaner.common.CommonUtils;
import com.bili.diushoujuaner.database.mapper.GoodMapper;
import com.bili.diushoujuaner.database.model.Good;
import com.bili.diushoujuaner.database.model.GoodExample;
import com.bili.diushoujuaner.mgt.GoodMgt;

@Repository
public class GoodMgtImpl implements GoodMgt {
	
	@Autowired
	GoodMapper goodMapper;

	@Override
	public List<Good> getGoodListByRecallNo(long recallNo) {
		return goodMapper.getGoodListByRecallNo(recallNo);
	}

	@Override
	public int addGoodByRecallNoAndUserNo(long recallNo, long userNo) {
		GoodExample goodExample = new GoodExample();
		goodExample.createCriteria().andRecallNoEqualTo(recallNo).andUserNoEqualTo(userNo);
		if(goodMapper.selectByExample(goodExample).size() > 0){
			//避免多次点赞，当然这种情况正常情况不会出现，避免被刷
			return 1;
		}
		Good good = new Good();
		good.setRecallNo(recallNo);
		good.setUserNo(userNo);
		good.setGoodTime(CommonUtils.getCurrentTime_YYYYMMDD_HHMMSS());
		try{
			return goodMapper.insertSelective(good);
		}catch(DataIntegrityViolationException e){
			return -1;
		}
	}

	@Override
	public int removeGoodByRecallNoAndUserNo(long recallNo, long userNo) {
		GoodExample goodExample = new GoodExample();
		goodExample.createCriteria().andRecallNoEqualTo(recallNo).andUserNoEqualTo(userNo);
		return goodMapper.deleteByExample(goodExample);
	}

}
