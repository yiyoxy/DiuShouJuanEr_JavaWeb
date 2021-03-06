package com.bili.diushoujuaner.common;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.bili.diushoujuaner.database.model.Picture;

public class RecallPicUtil {

	private static Map<String,Map<String,Picture>> pictureMap = new HashMap<>();
	
	public static Picture storePictureToLocal(long userNo, MultipartFile file,String serial, String deviceType){
		
		CommonUtils.createAlbumDirectoryByTime();
		
		String fileName = file.getOriginalFilename();
		String filePath = CommonUtils.getAlbumDirectory() + "/" + System.currentTimeMillis() + CommonUtils.getSuffixFromFileName(fileName);
		
		Picture picture = new Picture();
		picture.setPicPath(filePath);
		picture.setRealPath(CommonUtils.getRootDirectory() + filePath);
		
		picture = CommonUtils.processRecallImage(picture, file);
		picture.setSerial(serial);
		addPicture(userNo + deviceType, picture);
		
		return picture;
		
	}
	
	public static Map<String,Picture> getPictureMap(String userKey){
		return pictureMap.get(userKey);
	}
	
	public static void clearUserPicture(String userKey, boolean deleteFromLocal){
		if(pictureMap.get(userKey) == null){
			return;
		}
		
		if(deleteFromLocal){
			File localFile = null;
			for(Picture picture : pictureMap.get(userKey).values()){
				localFile = new File(picture.getRealPath());
				if(localFile.exists()){
					localFile.delete();
				}
			}	
		}
		
		pictureMap.remove(userKey);
		System.out.println(pictureMap.toString());
	}
	
	public static boolean removePicture(String userKey, long picId){
		if(pictureMap.get(userKey) != null){
			Picture picture = pictureMap.get(userKey).remove(picId + "");
			File file = new File(picture.getRealPath());
			if(file.exists()){
				file.delete();
				return true;
			}
		}
		return false;
	}
	
	private static void addPicture(String userKey, Picture picture){
		if(pictureMap.get(userKey) != null){
			
			picture.setPicId(pictureMap.get(userKey).size());
			pictureMap.get(userKey).put(picture.getPicId() + "", picture);
			
		}else{
			Map<String,Picture> tmpMap = new HashMap<>();
			picture.setPicId(0);
			tmpMap.put(picture.getPicId() + "", picture);
			
			pictureMap.put(userKey, tmpMap);
		}
		System.out.println(pictureMap.toString());
	}

}
